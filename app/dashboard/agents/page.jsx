"use client";
import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTimes,
  FaEdit,
  FaEye,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";

const MySwal = withReactContent(Swal);

// Utility function to mask phone numbers
const maskPhoneNumber = (phone) => {
  if (!phone || phone.length < 7) return phone;
  const phoneStr = String(phone);
  const firstPart = phoneStr.slice(0, 5);
  const lastPart = phoneStr.slice(-2);
  const maskedMiddle = '*'.repeat(Math.max(0, phoneStr.length - 7));
  return `${firstPart}${maskedMiddle}${lastPart}`;
};

const ManageAgentsPage = () => {
  const { userData, states, lgas, fetchLgas } = useAppContext();
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    maritalStatus: "",
    dateOfBirth: "",
    address: "",
    state: "",
    localGovt: "",
    nin: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
  });
  const [passportPhotoBase64, setPassportPhotoBase64] = useState("");

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      gender: "",
      maritalStatus: "",
      dateOfBirth: "",
      address: "",
      state: "",
      localGovt: "",
      nin: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
    });
    setPassportPhotoBase64("");
  };

  const fetchAgents = async () => {
    if (!userData?._id) return;
    setListLoading(true);
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.USER_SIDE.GET_DOWNLINES + userData._id)
      );
      const agentsList = response.data?.results?.entities?.agents?.list || [];
      setAgents(agentsList);
      setFilteredAgents(agentsList);
    } catch (error) {
      console.error("Error fetching Agents:", error);
      toast.error(error.response?.data?.message || "Failed to fetch Agents.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (!userData) return; // Prevent running if userData is not yet available
    fetchAgents();
  }, [userData]);

  useEffect(() => {
    if (formData.state) {
      fetchLgas(formData.state);
    }
  }, [formData.state, fetchLgas]);

  // Filter Agents based on search and status
  useEffect(() => {
    let results = agents;

    // Search filter
    if (searchTerm) {
      results = results.filter(
        (agent) =>
          `${agent.firstName} ${agent.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      results = results.filter((agent) =>
        statusFilter === "active" ? !agent.suspended : agent.suspended
      );
    }

    setFilteredAgents(results);
  }, [searchTerm, statusFilter, agents]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024) {
      toast.error("Image size should not exceed 50KB.");
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPassportPhotoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!passportPhotoBase64) {
      toast.error("Please upload a passport photograph.");
      return;
    }

    setLoading(true);

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      maritalStatus: formData.maritalStatus,
      dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
      address: formData.address,
      state: formData.state,
      localGovt: formData.localGovt,
      nin: formData.nin,
      validId: formData.nin,
      bankName: formData.bankName,
      accountName: formData.accountName,
      accountNumber: formData.accountNumber,
      passportPhoto: passportPhotoBase64,
      phone: formData.phoneNumber,
      email: formData.email,
      type: "agent",
      role: "bdm",
      managerId: userData._id,
    };

    try {
      await axios.post(apiUrl(API_CONFIG.ENDPOINTS.USER_SIDE.CREATE), payload);
      toast.success("Agent added successfully!");
      closeModal();
      fetchAgents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add Agent.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendToggle = async (agent) => {
    const action = agent.suspended ? "unsuspend" : "suspend";
    const actionText = agent.suspended ? "Unsuspend" : "Suspend";

    const result = await MySwal.fire({
      title: `Are you sure?`,
      html: `You are about to <strong>${action}</strong> <br/><strong>${agent.firstName} ${agent.lastName}</strong>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: agent.suspended ? "#10B981" : "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, ${actionText}!`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
      },
    });

    if (!result.isConfirmed) return;

    const payload = { agentId: agent._id };

    try {
      await axios.put(
        apiUrl(API_CONFIG.ENDPOINTS.USER_SIDE.SUSPEND_AGENT + userData._id),
        payload
      );

      fetchAgents();

      // Success alert
      MySwal.fire({
        title: `${actionText}ed!`,
        html: `<strong>${agent.firstName} ${agent.lastName}</strong> has been ${action}ed.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} user.`);
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const getStatusBadge = (agent) => {
    if (agent.suspended) {
      return {
        text: "Suspended",
        class: "bg-red-100 text-red-800 border-red-200",
      };
    }
    return {
      text: "Active",
      class: "bg-green-100 text-green-800 border-green-200",
    };
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Agents List
              </h1>
              <p className="text-gray-500">View list of agents </p>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-3 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Agents
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {agents.length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FaEye className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-3 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Agents
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {agents.filter((agent) => !agent.suspended).length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-3 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Suspended Agents
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {agents.filter((agent) => agent.suspended).length}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent List Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {listLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-gray-500 mt-2">Loading agents...</p>
                    </td>
                  </tr>
                ) : filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="text-gray-400 mb-2">
                        <FaSearch className="text-4xl mx-auto" />
                      </div>
                      <p className="text-gray-500 text-lg font-medium">
                        No Agents found
                      </p>
                      <p className="text-gray-400 mt-1">
                        {searchTerm || statusFilter !== "all"
                          ? "Try adjusting your search or filter criteria"
                          : "Get started by adding your first Agent"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => {
                    const status = getStatusBadge(agent);
                    return (
                      <tr
                        key={agent._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4">
                              {agent.firstName?.[0]}
                              {agent.lastName?.[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {agent.firstName} {agent.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {agent.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {maskPhoneNumber(agent.phone) || "No phone"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${status.class}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${
                                agent.suspended ? "bg-red-500" : "bg-green-500"
                              }`}
                            ></span>
                            {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .swal-confirm-btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
        }
        .swal-cancel-btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

// Reusable Input & Select Components
const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
    />
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  disabled,
  required,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 transition-colors"
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </option>
      ))}
    </select>
  </div>
);

export default ManageAgentsPage;

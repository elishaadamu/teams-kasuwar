"use client";
import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTimes,
  FaEdit,
  FaEye,
  FaSearch,
  FaFilter,
  FaEllipsisV,
  FaChartLine,
  FaBan,
  FaUserCheck,
} from "react-icons/fa";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportLoading, setReportLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

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
        apiUrl(API_CONFIG.ENDPOINTS.USER_SIDE.GET_BD_DOWNLINES + userData._id)
      );

      const fetchedAgents =
        response.data?.results?.entities?.agents?.list || [];
      setAgents(fetchedAgents);
      setFilteredAgents(fetchedAgents);
    } catch (error) {
      console.error("Error fetching Agents:", error);
      toast.error(error.response?.data?.message || "Failed to fetch Agents.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [userData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest(".actions-dropdown-btn") && !event.target.closest(".actions-dropdown-menu")) {
        setActiveDropdown(null);
      }
    };
    const handleScroll = () => setActiveDropdown(null);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [activeDropdown]);

  const toggleDropdown = (e, id) => {
    e.stopPropagation();
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 5,
        left: rect.left - 150,
      });
      setActiveDropdown(id);
    }
  };

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
      role: "bd",
      managerId: userData._id,
    };

    try {
      await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.USER_SIDE.CREATE_AGENT),
        payload
      );
      toast.success("Agent added successfully!");
      closeModal();
      fetchAgents();
    } catch (error) {
      console.error("Error adding Agent:", error);
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
      html: `You are about to <strong>${action}</strong> <br/>
             <strong>${agent.firstName} ${agent.lastName}</strong>`,
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
        apiUrl(API_CONFIG.ENDPOINTS.USER_SIDE.SUSPEND_AGENT + agent._id),
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

  const downloadAgentPerformance = async (agent) => {
    setReportLoading(true);
    const toastId = toast.loading(`Generating report for ${agent.firstName}...`);
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.REPORTS.PERFORMANCE_REPORT_AGENT),
        {
          params: {
            agentId: agent._id,
            month: selectedMonth,
            year: selectedYear,
          },
          withCredentials: true,
        }
      );

      const performanceData = response.data?.report;
      if (!performanceData) throw new Error("No performance data found for this period.");

      const doc = new jsPDF();
      const { agentName = `${agent.firstName} ${agent.lastName}`, period = "", summary, vendors = {}, users = {} } = performanceData;

      doc.setFontSize(18);
      doc.text(`Performance Report for ${agentName}`, 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Period: ${period}`, 14, 29);

      // Summary Section
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Summary", 14, 40);

      const summaryData = [
        ["Total Vendors", summary?.totalVendors || 0],
        ["Total Customers", summary?.totalUsers || 0],
      ];

      autoTable(doc, {
        startY: 45,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Active Vendors List
      const activeVendors = vendors.fullyActive || [];
      if (activeVendors.length > 0) {
        doc.setFontSize(14);
        doc.text("Active Vendors", 14, doc.lastAutoTable.finalY + 15);
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 20,
          head: [["S/N", "Vendor Name", "Business Name", "Phone", "Date"]],
          body: activeVendors.map((v, i) => [
            i + 1, v.name, v.businessName || "N/A", maskPhoneNumber(v.phone), new Date(v.registrationDate).toLocaleDateString()
          ]),
          theme: "grid",
          headStyles: { fillColor: [46, 204, 113], fontSize: 8 },
          styles: { fontSize: 8 },
        });
      }

      // Active Customers List
      const activeCustomers = users.fullyActive || [];
      if (activeCustomers.length > 0) {
        let finalY = doc.lastAutoTable.finalY + 15;
        if (finalY + 30 > doc.internal.pageSize.height) { doc.addPage(); finalY = 20; }
        doc.setFontSize(14);
        doc.text("Active Customers", 14, finalY);
        autoTable(doc, {
          startY: finalY + 5,
          head: [["S/N", "Customer Name", "Phone", "Date"]],
          body: activeCustomers.map((c, i) => [
            i + 1, c.name, maskPhoneNumber(c.phone), new Date(c.registrationDate).toLocaleDateString()
          ]),
          theme: "grid",
          headStyles: { fillColor: [52, 152, 219], fontSize: 8 },
          styles: { fontSize: 8 },
        });
      }

      doc.save(`performance-${agentName.replace(/\s+/g, "_")}-${period.replace(/\//g, "-")}.pdf`);
      toast.success("Report generated successfully!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to generate report.", { id: toastId });
    } finally {
      setReportLoading(false);
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
                Manage Agents
              </h1>
              <p className="text-gray-600">
                Manage and monitor your agent team
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <FaPlus className="text-sm" />
              <span className="font-semibold">Add New Agent</span>
            </button>
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

                <div className="flex gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {format(new Date(0, i), "MMMM")}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <option key={new Date().getFullYear() - i} value={new Date().getFullYear() - i}>
                        {new Date().getFullYear() - i}
                      </option>
                    ))}
                  </select>
                </div>
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

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Add New Agent
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Fill in the details to add a new team member
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500 hover:text-gray-800 text-xl" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    placeholder="Enter first name"
                    onChange={handleInputChange}
                    required
                  />
                  <InputField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    placeholder="Enter last name"
                    onChange={handleInputChange}
                    required
                  />
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    placeholder="e.g. agent@example.com"
                    onChange={handleInputChange}
                    required
                  />
                  <InputField
                    label="Phone Number"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    placeholder="e.g. 08012345678"
                    onChange={handleInputChange}
                    required
                  />
                  <SelectField
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                    ]}
                    required
                  />
                  <SelectField
                    label="Marital Status"
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    options={[
                      { value: "single", label: "Single" },
                      { value: "married", label: "Married" },
                      { value: "divorced", label: "Divorced" },
                      { value: "widowed", label: "Widowed" },
                    ]}
                    required
                  />
                  <InputField
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    placeholder="Select date of birth"
                    onChange={handleInputChange}
                    required
                  />
                  <InputField
                    label="NIN"
                    name="nin"
                    placeholder="Enter National Identification Number"
                    value={formData.nin}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full street address"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    options={states.map((s) => ({ value: s, label: s }))}
                    required
                  />
                  <SelectField
                    label="Local Government"
                    name="localGovt"
                    value={formData.localGovt}
                    onChange={handleInputChange}
                    options={lgas.map((l) => ({ value: l, label: l }))}
                    disabled={!formData.state}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField
                    label="Bank Name"
                    name="bankName"
                    value={formData.bankName}
                    placeholder="Enter bank name"
                    onChange={handleInputChange}
                    required
                  />
                  <InputField
                    label="Account Name"
                    name="accountName"
                    value={formData.accountName}
                    placeholder="Enter account name"
                    onChange={handleInputChange}
                    required
                  />
                  <InputField
                    label="Account Number"
                    name="accountNumber"
                    placeholder="Enter account number"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passport Photo (Max 50KB)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="passport-upload"
                      required
                    />
                    <label
                      htmlFor="passport-upload"
                      className="cursor-pointer block"
                    >
                      {passportPhotoBase64 ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={passportPhotoBase64}
                            alt="Preview"
                            className="h-32 w-32 object-cover rounded-xl shadow-md mb-4"
                          />
                          <span className="text-blue-600 font-medium">
                            Change Photo
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FaPlus className="text-gray-400 text-2xl" />
                          </div>
                          <span className="text-gray-600 font-medium">
                            Click to upload passport photo
                          </span>
                          <span className="text-sm text-gray-500 mt-1">
                            Maximum 50KB
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 font-medium"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save Agent"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {listLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-gray-500 mt-2">Loading agents...</p>
                    </td>
                  </tr>
                ) : filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
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
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200`}
                          >
                            {agent.type?.charAt(0).toUpperCase() +
                              agent.type?.slice(1) || "N/A"}
                          </span>
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
                        <td className="px-6 py-4 text-right">
                          <div className="relative">
                            <button
                              onClick={(e) => toggleDropdown(e, agent._id)}
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors actions-dropdown-btn"
                            >
                              <FaEllipsisV />
                            </button>

                            {activeDropdown === agent._id && (
                              <div
                                className="fixed bg-white rounded-xl shadow-lg border border-gray-100 z-[9999] overflow-hidden actions-dropdown-menu w-48"
                                style={{
                                  top: dropdownPos.top,
                                  left: dropdownPos.left,
                                }}
                              >
                                <button
                                  onClick={() => {
                                    handleSuspendToggle(agent);
                                    setActiveDropdown(null);
                                  }}
                                  className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition-colors ${
                                    agent.suspended
                                      ? "text-green-600 hover:bg-green-50"
                                      : "text-red-600 hover:bg-red-50"
                                  }`}
                                >
                                  {agent.suspended ? (
                                    <>
                                      <FaUserCheck className="text-green-500" /> Unsuspend Agent
                                    </>
                                  ) : (
                                    <>
                                      <FaBan className="text-red-500" /> Suspend Agent
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    downloadAgentPerformance(agent);
                                    setActiveDropdown(null);
                                  }}
                                  disabled={reportLoading}
                                  className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors disabled:opacity-50 font-medium"
                                >
                                  <FaChartLine className="text-blue-500" />
                                  Performance Report
                                </button>
                              </div>
                            )}
                          </div>
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
  placeholder,
  required,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
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
      {label} {required && <span className="text-red-500">*</span>}
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
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default ManageAgentsPage;

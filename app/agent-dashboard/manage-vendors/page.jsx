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

const ManageVendorsPage = () => {
  const { userData, states, lgas, fetchLgas } = useAppContext();
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    address: "",
    state: "",
    localGovt: "",
    businessName: "",
    businessDesc: "",
    businessAddress: "",
    businessType: "",
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      middleName: "",
      phoneNumber: "",
      gender: "",
      address: "",
      state: "",
      localGovt: "",
      businessName: "",
      businessDesc: "",
      businessAddress: "",
      businessType: "",
    });
  };

  const fetchVendors = async () => {
    if (!userData?._id) return;
    setListLoading(true);
    try {
      const response = await axios.get(
        apiUrl(
          API_CONFIG.ENDPOINTS.USER_SIDE.GET_AGENTS_DOWNLINES + userData._id
        )
      );
      console.log(response.data);
      // Assuming vendors are returned in a 'vendors' property
      const referredVendors = response.data?.referredUsers || [];
      setVendors(referredVendors.filter((user) => user.role === "vendor"));
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error(error.response?.data?.message || "Failed to fetch vendors.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [userData]);

  useEffect(() => {
    if (formData.state) {
      fetchLgas(formData.state);
    }
  }, [formData.state, fetchLgas]);

  // Filter vendors based on search and status
  useEffect(() => {
    let results = vendors;

    // Search filter
    if (searchTerm) {
      results = results.filter(
        (bd) =>
          `${bd.firstName} ${bd.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          bd.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bd.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      results = results.filter((vendor) =>
        statusFilter === "active" ? vendor.fullyActive : !vendor.fullyActive
      );
    }

    setFilteredVendors(results);
  }, [searchTerm, statusFilter, vendors]);

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
    setLoading(true);

    const payload = {
      agentId: userData._id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      middleName: formData.middleName,
      gender: formData.gender,
      email: formData.email,
      state: formData.state,
      localGovt: formData.localGovt,
      address: formData.address,
      businessName: formData.businessName,
      businessDesc: formData.businessDesc,
      businessAddress: formData.businessAddress,
      businessType: formData.businessType.toLowerCase(),
      phone: formData.phoneNumber,
    };
    console.log(payload);
    try {
      await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.USER_SIDE.CREATE_VENDOR),
        payload
      );
      toast.success("Vendor added successfully!");
      closeModal();
      fetchVendors();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
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

  const getStatusBadge = (vendor) => {
    if (!vendor.fullyActive) {
      return {
        text: "Inactive",
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
                Manage Vendors
              </h1>
              <p className="text-gray-600">Manage and monitor your vendors</p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <FaPlus className="text-sm" />
              <span className="font-semibold">Add New Vendor</span>
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
                  <option value="inactive">Inactive</option>
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
                  Total Vendors
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {vendors.length}
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
                  Active Vendors
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {vendors.filter((v) => v.fullyActive).length}
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
                  Inactive Vendors
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {vendors.filter((v) => !v.fullyActive).length}
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
                    Add New Vendor
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Fill in the details to add a new vendor
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                  />
                  <InputField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                  />
                  <InputField
                    label="Middle Name"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    placeholder="Enter middle name"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. vendor@example.com"
                    required
                  />
                  <InputField
                    label="Phone Number"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. 08012345678"
                    required
                  />
                  <SelectField
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    options={["male", "female"]}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    options={states}
                    required
                  />
                  <SelectField
                    label="Local Government"
                    name="localGovt"
                    value={formData.localGovt}
                    onChange={handleInputChange}
                    options={lgas}
                    disabled={!formData.state}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Enter personal address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="border-t pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Business Name"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="Enter business name"
                      required
                    />
                    <SelectField
                      label="Business Type"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      required
                      options={["Registered", "Starter"]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Description
                    </label>
                    <textarea
                      name="businessDesc"
                      value={formData.businessDesc}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Provide a brief description of the business"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Address
                    </label>
                    <textarea
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Enter the full business address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
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
                      "Save Vendor"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Vendor List Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact Info
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
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
                      <p className="text-gray-500 mt-2">Loading vendors...</p>
                    </td>
                  </tr>
                ) : filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="text-gray-400 mb-2">
                        <FaSearch className="text-4xl mx-auto" />
                      </div>
                      <p className="text-gray-500 text-lg font-medium">
                        No Vendors found
                      </p>
                      <p className="text-gray-400 mt-1">
                        {searchTerm
                          ? "Try adjusting your search or filter criteria."
                          : "Get started by adding your first Vendor"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => {
                    const status = getStatusBadge(vendor);
                    return (
                      <tr
                        key={vendor._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4">
                              {vendor.firstName?.[0]}
                              {vendor.lastName?.[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {vendor.firstName} {vendor.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {vendor.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vendor.phone || "No phone"}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${status.class}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${
                                !vendor.fullyActive
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              }`}
                            ></span>

                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200`}
                          >
                            {vendor.role.charAt(0).toUpperCase() +
                              vendor.role.slice(1)}
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
  ...props
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
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      {...props}
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
  ...props
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
      {...props}
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

export default ManageVendorsPage;

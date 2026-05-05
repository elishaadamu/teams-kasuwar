"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import {
  FaHome,
  FaTruck,
  FaBoxOpen,
  FaUser,
  FaPlus,
  FaWallet,
  FaCreditCard,
  FaShoppingCart,
  FaUniversity as FaBank,
  FaChartLine,
  FaUserCircle,
  FaArrowRight,
  FaRegUser,
  FaUsers,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Loading from "@/components/Loading";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const DashboardHome = () => {
  const { userData, authLoading } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    userName: "",
    totalOrders: 0,
    orders: [],
    recentOrders: [],
    totalProducts: 0,
  });
  const [walletBalance, setWalletBalance] = useState({ balance: 0 });

  const [recentVendors, setRecentVendors] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportLoading, setReportLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeVendors: 0,
    inactiveVendors: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userData?.id) return;

      setLoading(true);
      try {
        setDashboardData((prev) => ({
          ...prev,
          userName: userData.firstName,
        }));

        const userId = userData.id;

        const [walletResponse, downlinesResponse, withdrawalsResponse] =
          await Promise.all([
            axios.get(
              apiUrl(
                API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance +
                userId +
                "/balance",
              ),
              { withCredentials: true },
            ),
            axios.get(
              apiUrl(
                API_CONFIG.ENDPOINTS.USER_SIDE.GET_AGENTS_DOWNLINES + userId,
              ),
              { withCredentials: true },
            ),
            axios.get(
              apiUrl(
                API_CONFIG.ENDPOINTS.DELIVERY_WITHDRAWAL.GET_BY_USER + userId,
              ),
              { withCredentials: true },
            ),
          ]);
        console.log(walletResponse.data);
        setWalletBalance(walletResponse.data.data);
        const referredUsers = downlinesResponse.data?.referredUsers || [];

        const vendors = referredUsers.filter((u) => u.role === "vendor");
        const customers = referredUsers.filter((u) => u.role === "user");

        setUserStats({
          totalUsers: referredUsers.length,
          activeVendors: vendors.filter((v) => v.fullyActive).length,
          inactiveVendors: vendors.filter((v) => !v.fullyActive).length,
          activeCustomers: customers.filter((c) => c.fullyActive).length,
          inactiveCustomers: customers.filter((c) => !c.fullyActive).length,
        });

        // Assuming the API returns the most recent first, we take the top 5
        setRecentVendors(vendors.slice(0, 5));
        setRecentCustomers(customers.slice(0, 5));

        const withdrawalsData = withdrawalsResponse.data || [];
        const withdrawalsList = Array.isArray(withdrawalsData)
          ? withdrawalsData
          : withdrawalsData.withdrawals || [];
        // Assuming the API returns the most recent first, we take the top 5
        setRecentWithdrawals(withdrawalsList.slice(0, 5));
      } catch (error) {
        toast.error("Failed to fetch dashboard data. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userData]);

  const handlePayment = async () => {
    if (!amount || amount < 100) {
      toast.error("Please enter an amount of at least ₦100");
      return;
    }

    const PaystackPop = (await import("@paystack/inline-js")).default;
    const paystack = new PaystackPop();
    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: userData?.email,
      amount: amount * 100,
      ref: new Date().getTime().toString(),
      metadata: {
        userId: userData?.id,
      },
      onSuccess: (transaction) => {
        onSuccess(transaction);
      },
      onCancel: () => {
        onClose();
      },
    });
  };

  const onSuccess = async (transaction) => {
    setLoading(true);
    try {
      const walletBalanceResponse = await axios.get(
        apiUrl(
          API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + userData.id + "/balance",
        ),
        { withCredentials: true },
      );

      setWalletBalance(walletBalanceResponse.data.data);
    } catch (error) {
      toast.error("Failed to process payment. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    toast.info("Payment cancelled");
    setShowFundModal(false);
  };

  const fetchPerformanceReport = async () => {
    if (!userData?.id) return;
    setReportLoading(true);
    setPerformanceData(null); // Clear previous data
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.REPORTS.PERFORMANCE_REPORT_AGENT),
        {
          params: {
            agentId: userData.id,
            month: selectedMonth,
            year: selectedYear,
          },
          withCredentials: true,
        }
      );

      setPerformanceData(response.data?.report || null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch performance report."
      );
    } finally {
      setReportLoading(false);
    }
  };

  const downloadPerformanceReport = () => {
    if (!performanceData) {
      toast.info("Please generate a report first.");
      return;
    }

    const doc = new jsPDF();
    const {
      agentName = userData?.firstName + " " + userData?.lastName,
      period = "",
      summary,
      vendors = {},
      users = {}
    } = performanceData;

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
        head: [["S/N", "Vendor Name", "Business Name", "Date"]],
        body: activeVendors.map((v, i) => [
          i + 1, v.name, v.businessName || "N/A", new Date(v.registrationDate).toLocaleDateString()
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
        head: [["S/N", "Customer Name", "Date"]],
        body: activeCustomers.map((c, i) => [
          i + 1, c.name, new Date(c.registrationDate).toLocaleDateString()
        ]),
        theme: "grid",
        headStyles: { fillColor: [52, 152, 219], fontSize: 8 },
        styles: { fontSize: 8 },
      });
    }

    doc.save(`performance-${agentName.replace(/\s+/g, "_")}-${period.replace(/\//g, "-")}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-0 px-4">
      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Welcome Section - Compact */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {dashboardData.userName}!
            </h1>
            <p className="mt-1 text-gray-600 text-sm">
              Here's what's happening with your account today.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/agent-dashboard/manage-vendors"
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
              >
                <FaShoppingCart className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Manage Vendors
                </span>
              </Link>
              <Link
                href="/agent-dashboard/manage-customers"
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
              >
                <FaUsers className="w-6 h-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Manage Customers
                </span>
              </Link>
              <Link
                href="/agent-dashboard/agent-commission"
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
              >
                <FaChartLine className="w-6 h-6 text-yellow-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Commission
                </span>
              </Link>
              <Link
                href="/agent-dashboard/withdrawal-request"
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
              >
                <FaWallet className="w-6 h-6 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Withdrawal Requests
                </span>
              </Link>
            </div>
          </div>

          {/* User Stats Section */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              User Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <FaUsers className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.totalUsers}
                </p>
                <p className="text-xs text-gray-500">Total Registered</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <FaRegUser className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.activeVendors}
                </p>
                <p className="text-xs text-gray-500">Active Vendors</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <FaRegUser className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.inactiveVendors}
                </p>
                <p className="text-xs text-gray-500">Inactive Vendors</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <FaRegUser className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.activeCustomers}
                </p>
                <p className="text-xs text-gray-500">Active Customers</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <FaRegUser className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.inactiveCustomers}
                </p>
                <p className="text-xs text-gray-500">Inactive Customers</p>
              </div>
            </div>
          </div>

          {/* Wallet & Account Section - Compact */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full opacity-20 -mr-20 -mt-20"></div>

              <div className="relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                  <div className="mb-3 sm:mb-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <FaWallet className="w-5 h-5" />
                      Your Wallet
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      Manage your funds and account details
                    </p>
                  </div>
                </div>

                {/* Balance Section */}
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs">Current Balance</p>
                      <h1 className="text-2xl font-bold mt-1">
                        ₦{walletBalance?.balance?.toFixed(2) || "Loading..."}
                      </h1>
                    </div>
                    <div className="flex gap-2 mt-3 sm:mt-0">
                      <button className="bg-white/20 text-white px-3 py-1.5 rounded text-xs hover:bg-white/30 transition">
                        <Link href="/agent-dashboard/withdrawal-request">
                          <span>Withdrawal Requests</span>
                        </Link>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Details Section */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                    <FaCreditCard className="w-4 h-4" />
                    Account Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 p-2 rounded">
                        <FaUserCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-blue-100 text-xs">Account Name</p>
                        <p className="text-white font-medium text-sm">
                          {userData?.accountName || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 p-2 rounded">
                        <FaCreditCard className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-blue-100 text-xs">Account Number</p>
                        <p className="text-white font-medium text-sm">
                          {userData?.accountNumber || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 p-2 rounded">
                        <FaBank className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-blue-100 text-xs">Bank Name</p>
                        <p className="text-white font-medium text-sm">
                          {userData?.bankName || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Report Section */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              Performance Report
            </h2>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="block w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                  className="block w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <option
                      key={new Date().getFullYear() - i}
                      value={new Date().getFullYear() - i}
                    >
                      {new Date().getFullYear() - i}
                    </option>
                  ))}
                </select>
                <button
                  onClick={fetchPerformanceReport}
                  disabled={reportLoading}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition disabled:bg-blue-300"
                >
                  {reportLoading ? "Loading..." : "Get Performance Report"}
                </button>
                <button
                  onClick={downloadPerformanceReport}
                  disabled={!performanceData || reportLoading}
                  className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-green-700 transition disabled:bg-green-300"
                >
                  Download PDF
                </button>
              </div>

              {reportLoading ? (
                <div className="text-center py-4">
                  <Loading fullPage={false} />
                  <p className="mt-2 text-sm text-gray-600">
                    Fetching report...
                  </p>
                </div>
              ) : performanceData ? (
                performanceData.summary && (
                  <div className="space-y-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 font-medium text-gray-500 uppercase tracking-wider">
                              Summary
                            </th>
                            <th className="px-3 py-2 font-medium text-gray-500 uppercase tracking-wider">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="px-3 py-2">Total Vendors</td>
                            <td className="px-3 py-2">
                              {performanceData.summary?.totalVendors || 0}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2">Total Customers</td>
                            <td className="px-3 py-2">
                              {performanceData.summary?.totalUsers || 0}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-green-600">Active Vendors</td>
                            <td className="px-3 py-2 text-green-600">
                              {performanceData.vendors?.fullyActive?.length || 0}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-red-600">Inactive Vendors</td>
                            <td className="px-3 py-2 text-red-600">
                              {performanceData.vendors?.inactive?.length || 0}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-green-600">Active Customers</td>
                            <td className="px-3 py-2 text-green-600">
                              {performanceData.users?.fullyActive?.length || 0}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-red-600">Inactive Customers</td>
                            <td className="px-3 py-2 text-red-600">
                              {performanceData.users?.inactive?.length || 0}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-gray-500 text-center py-3 text-sm">
                  Select a month and year, then click "Get Performance Report"
                  to see data.
                </p>
              )}
            </div>
          </div>

          {/* Recent Customers Section */}
          {recentCustomers.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold text-gray-800">
                  Recently Added Customers
                </h2>
                <Link
                  href="/agent-dashboard/manage-customers"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View All <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentCustomers.map((customer) => (
                        <tr key={customer._id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
                                {customer.firstName?.[0]}
                                {customer.lastName?.[0]}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.firstName} {customer.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {customer.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                              {customer.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${!customer.fullyActive
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                                }`}
                            >
                              <span
                                className={`w-2 h-2 mr-1.5 rounded-full ${!customer.fullyActive
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                  }`}
                              ></span>
                              {!customer.fullyActive ? "Inactive" : "Active"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Recent Vendors Section */}
          {recentVendors.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold text-gray-800">
                  Recently Added Vendors
                </h2>
                <Link
                  href="/agent-dashboard/manage-vendors"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View All <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentVendors.map((vendor) => (
                        <tr key={vendor._id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                                {vendor.firstName?.[0]}
                                {vendor.lastName?.[0]}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {vendor.firstName} {vendor.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {vendor.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                              {vendor.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${!vendor.fullyActive
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                                }`}
                            >
                              <span
                                className={`w-2 h-2 mr-1.5 rounded-full ${!vendor.fullyActive
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                  }`}
                              ></span>
                              {!vendor.fullyActive ? "Inactive" : "Active"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Recent Withdrawals Section */}
          {recentWithdrawals.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold text-gray-800">
                  Recent Withdrawal Requests
                </h2>
                <Link
                  href="/agent-dashboard/withdrawal-request"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View All <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentWithdrawals.map((w) => (
                        <tr key={w._id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-sm font-bold">
                                <FaWallet />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  ₦
                                  {w.amount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(w.createdAt).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${w.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : w.status === "pending"
                                    ? "bg-blue-100 text-blue-800"
                                    : w.status === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                            >
                              <span
                                className={`w-2 h-2 mr-1.5 rounded-full ${w.status === "approved"
                                    ? "bg-green-500"
                                    : w.status === "pending"
                                      ? "bg-blue-500"
                                      : w.status === "rejected"
                                        ? "bg-red-500"
                                        : "bg-yellow-500"
                                  }`}
                              ></span>
                              {w.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardHome;

"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import { decryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import {
  FaHome,
  FaCommentDots,
  FaTruck,
  FaBoxOpen,
  FaUser,
  FaPlus,
  FaWallet,
  FaCreditCard,
  FaShoppingCart,
  FaUniversity as FaBank,
  FaChartLine,
  FaUsers,
  FaUserCircle,
  FaArrowRight,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  TimeScale,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { startOfWeek, startOfMonth, format, subMonths } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  TimeScale
);

const DashboardHome = () => {
  const { userData: contextUserData, authLoading } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    userName: "",
    totalOrders: 0,
    orders: [],
    recentOrders: [],
    totalProducts: 0,
  });
  const [walletBalance, setWalletBalance] = useState({ balance: 0 });
  const [userData, setUserData] = useState(null);
  const [accountDetails, setAccountDetails] = useState("");
  const [timePeriod, setTimePeriod] = useState("monthly");
  const [reportLoading, setReportLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [recentBds, setRecentBds] = useState([]);
  const [recentAgents, setRecentAgents] = useState([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const encryptedUser = localStorage.getItem("user");
        if (encryptedUser) {
          const decryptedUserData = decryptData(encryptedUser);
          setUserData(decryptedUserData);
          setAccountDetails(decryptedUserData); // Set state for other parts of the component
          setDashboardData((prev) => ({
            ...prev,
            userName: decryptedUserData.firstName,
          }));

          // Use decryptedUserData._id directly instead of relying on state
          const userId = decryptedUserData._id;
          if (!userId) {
            toast.error("User ID not found. Please log in again.");
            setLoading(false);
            return;
          }

          const [walletResponse, downlinesResponse, withdrawalsResponse] =
            await Promise.all([
              axios.get(
                apiUrl(
                  API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance +
                    userId +
                    "/balance"
                )
              ),
              axios.get(
                apiUrl(API_CONFIG.ENDPOINTS.USER_SIDE.GET_DOWNLINES + userId)
              ),
              axios.get(
                apiUrl(
                  API_CONFIG.ENDPOINTS.DELIVERY_WITHDRAWAL.GET_BY_USER + userId
                )
              ),
            ]);

          setWalletBalance(walletResponse.data.data);
          const downlines = downlinesResponse.data?.results?.entities;
          const businessDevelopers = downlines?.bds?.list || [];
          const agents = downlines?.agents?.list || [];

          // Assuming the API returns the most recent first, we take the top 5
          setRecentBds(businessDevelopers.slice(0, 5));
          setRecentAgents(agents.slice(0, 5));

          const withdrawalsData = withdrawalsResponse.data || [];
          const withdrawalsList = Array.isArray(withdrawalsData)
            ? withdrawalsData
            : withdrawalsData.withdrawals || [];
          // Assuming the API returns the most recent first, we take the top 5
          setRecentWithdrawals(withdrawalsList.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const fetchPerformanceReport = async () => {
    if (!userData?._id) return;
    setReportLoading(true);
    setPerformanceData(null); // Clear previous data
    try {
      const payload = {
        bdmId: userData._id,
        month: selectedMonth,
        year: selectedYear,
      };
      console.log(payload);
      const response = await axios.post(
        apiUrl(API_CONFIG.REPORTS.PERFORMANCE_REPORT),
        payload
      );
      console.log(response);
      setPerformanceData(response.data?.report || null);
    } catch (error) {
      console.error("Error fetching performance report:", error);
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
      bdmName,
      period,
      summary,
      agents,
      fullyActiveUsers,
      inactiveUsers,
      fullyActiveVendors,
      inactiveVendors,
      bdsUnderBDM,
    } = performanceData;

    doc.setFontSize(18);
    doc.text(`Performance Report for ${bdmName}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Period: ${period}`, 14, 29);

    const tableData = [
      ["Total New Registrations", summary.totalNewRegistrations],
      ["Total Active Entities", summary.activeEntities],
      ["Total Inactive Entities", summary.inactiveEntities],
      ["Agents Count", agents.count],
      ["Fully Active Users", fullyActiveUsers.count],
      ["Inactive Users", inactiveUsers.count],
      ["Fully Active Vendors", fullyActiveVendors.count],
      ["Inactive Vendors", inactiveVendors.count],
      ["Number of BDs", bdsUnderBDM.length],
    ];

    autoTable(doc, {
      startY: 35,
      head: [["Metric", "Value"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(
      `performance-report-${bdmName.replace(/\s+/g, "_")}-${period.replace(
        "/",
        "-"
      )}.pdf`
    );
  };

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
          API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + userData._id + "/balance"
        )
      );

      setWalletBalance(walletBalanceResponse.data.data);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    toast.info("Payment cancelled");
    setShowFundModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-0 px-4">
      {loading ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
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
            {userData?.role === "bdm" ? (
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <Link
                  href="/dashboard/manage-bds"
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
                >
                  <FaUsers className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Manage BDs
                  </span>
                </Link>
                <Link
                  href="/dashboard/agents"
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
                >
                  <FaUsers className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Agents List
                  </span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Link
                  href="/"
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
                >
                  <FaShoppingCart className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Shop Now
                  </span>
                </Link>
                <Link
                  href="/dashboard/request-delivery"
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
                >
                  <FaBoxOpen className="w-6 h-6 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Delivery
                  </span>
                </Link>
              </div>
            )}
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
                        <Link href="/dashboard/withdrawal-request">
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
                          {accountDetails.accountName || "N/A"}
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
                          {accountDetails.accountNumber || "N/A"}
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
                          {accountDetails.bankName || "N/A"}
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
                  onChange={(e) => setSelectedMonth(e.target.value)}
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
                  onChange={(e) => setSelectedYear(e.target.value)}
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">
                    Fetching report...
                  </p>
                </div>
              ) : performanceData ? (
                performanceData.summary && (
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
                          <td className="px-3 py-2">Total New Registrations</td>
                          <td className="px-3 py-2">
                            {performanceData.summary.totalNewRegistrations}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">Active Entities</td>
                          <td className="px-3 py-2">
                            {performanceData.summary.activeEntities}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">Inactive Entities</td>
                          <td className="px-3 py-2">
                            {performanceData.summary.inactiveEntities}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">Number of BDs</td>
                          <td className="px-3 py-2">
                            {performanceData.numberOfBDs}
                          </td>
                        </tr>
                      </tbody>
                    </table>
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

          {/* Recent BDs Section */}
          {userData?.role === "bdm" && recentBds.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold text-gray-800">
                  Recently Added BDs
                </h2>
                <Link
                  href="/dashboard/manage-bds"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View All <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentBds.map((bd) => (
                        <tr key={bd._id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                                {bd.firstName?.[0]}
                                {bd.lastName?.[0]}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {bd.firstName} {bd.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {bd.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                bd.suspended
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 mr-1.5 rounded-full ${
                                  bd.suspended ? "bg-red-500" : "bg-green-500"
                                }`}
                              ></span>
                              {bd.suspended ? "Suspended" : "Active"}
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

          {/* Recent Agents Section */}
          {userData?.role === "bdm" && recentAgents.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold text-gray-800">
                  Recently Added Agents
                </h2>
                <Link
                  href="/dashboard/agents"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View All <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentAgents.map((agent) => (
                        <tr key={agent._id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
                                {agent.firstName?.[0]}
                                {agent.lastName?.[0]}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {agent.firstName} {agent.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {agent.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                agent.suspended
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 mr-1.5 rounded-full ${
                                  agent.suspended
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                }`}
                              ></span>
                              {agent.suspended ? "Suspended" : "Active"}
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
          {userData?.role === "bdm" && recentWithdrawals.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold text-gray-800">
                  Recent Withdrawal Requests
                </h2>
                <Link
                  href="/dashboard/withdrawal-request"
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
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                w.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : w.status === "approved"
                                  ? "bg-blue-100 text-blue-800"
                                  : w.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 mr-1.5 rounded-full ${
                                  w.status === "completed"
                                    ? "bg-green-500"
                                    : w.status === "approved"
                                    ? "bg-blue-500"
                                    : w.status === "failed"
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

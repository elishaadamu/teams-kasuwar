"use client";
import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaArrowUp,
  FaArrowDown,
  FaWallet,
  FaExchangeAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";

const TransactionsPage = () => {
  const { userData } = useAppContext();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchTransactions = async () => {
    if (!userData?.id) return;
    try {
      setLoading(true);
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + userData.id + "/balance"),
        { withCredentials: true }
      );

      if (response.data.success) {
        const { balance, wallet } = response.data.data;
        setBalance(balance);
        setTransactions(wallet.transactions || []);
        setFilteredTransactions(wallet.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch transaction data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.id) {
      fetchTransactions();
    }
  }, [userData]);

  useEffect(() => {
    let results = transactions;

    if (searchTerm) {
      results = results.filter((t) =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.amount.toString().includes(searchTerm)
      );
    }

    if (typeFilter !== "all") {
      results = results.filter((t) => t.type === typeFilter);
    }

    if (statusFilter !== "all") {
      results = results.filter((t) => t.status === statusFilter);
    }

    setFilteredTransactions(results);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, typeFilter, statusFilter, transactions]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <ToastContainer position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Transaction History
            </h1>
            <p className="text-gray-600">Monitor all your wallet activities</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-blue-600 flex items-center gap-4 min-w-[250px]">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FaWallet className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Current Balance
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by description or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <div className="relative">
                <FaExchangeAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                >
                  <option value="all">All Types</option>
                  <option value="credit">Credit (+)</option>
                  <option value="debit">Debit (-)</option>
                </select>
              </div>
            </div>
            <div>
              <div className="relative">
                <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Fetching transactions...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-gray-50 rounded-full mb-4">
                          <FaExchangeAlt className="text-4xl text-gray-300" />
                        </div>
                        <p className="text-gray-500 text-lg font-medium">No transactions found</p>
                        <p className="text-gray-400 mt-1">Try adjusting your filters or search terms</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="hover:bg-blue-50/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <FaCalendarAlt className="text-gray-400 text-sm" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatDate(transaction.createdAt).split(",")[0]}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(transaction.createdAt).split(",")[1]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 font-medium max-w-xs truncate" title={transaction.description}>
                          {transaction.description}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className={`text-sm font-bold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                          {transaction.type === "credit" ? "+" : "-"} {formatCurrency(transaction.amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          transaction.type === "credit" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {transaction.type === "credit" ? (
                            <FaArrowDown className="mr-1 text-[10px]" />
                          ) : (
                            <FaArrowUp className="mr-1 text-[10px]" />
                          )}
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          transaction.status === "completed"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : transaction.status === "pending"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                            : "bg-gray-50 text-gray-700 border-gray-100"
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredTransactions.length > itemsPerPage && (
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-semibold">
                  {Math.min(indexOfLastItem, filteredTransactions.length)}
                </span>{" "}
                of <span className="font-semibold">{filteredTransactions.length}</span> transactions
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "text-gray-600 hover:bg-white border border-transparent hover:border-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;

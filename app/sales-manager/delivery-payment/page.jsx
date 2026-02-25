"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { decryptData } from "@/lib/encryption";
import { toast } from "react-toastify";
import { apiUrl, API_CONFIG } from "@/configs/api";
import PinInput from "@/components/PinInput";
import { useAppContext } from "@/context/AppContext";

const DeliveryPaymentPage = () => {
  const { userData, authLoading, router } = useAppContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewRequest, setViewRequest] = useState(null); // For viewing details
  const [paying, setPaying] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  // Dropdown component for actions
  const DropdownMenu = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          type="button"
          className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        {isOpen && (
          <div
            className="origin-top-right absolute right-0 mt-2 w-48 rounded-2xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 overflow-hidden border border-gray-100"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <div className="py-1" role="none">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  };

  const fetchRequests = async () => {
    if (authLoading) return;
    
    const userId = userData?._id || userData?.id;
    if (!userId) {
      setFetchError("User not authenticated");
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    try {
      const res = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.DELIVERY.GET_USER_REQUESTS + userId),
        { withCredentials: true }
      );
      console.log("Fetched requests:", res.data);
      setRequests(res.data.requests || []);
    } catch (error) {
      console.error("Failed to fetch delivery requests", error);
      setFetchError(
        error?.response?.data?.message || error.message || "Failed to fetch"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchRequests();
    }
  }, [authLoading, userData]);

  const openPayModal = (request) => {
    setSelectedRequest(request);
  };

  const openViewModal = (request) => {
    setViewRequest(request);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setPin("");
    setPinError("");
  };
  const closeViewModal = () => setViewRequest(null);

  const handlePay = async () => {
    if (!selectedRequest) return;
    const userId = userData?._id || userData?.id;
    if (!userId) {
      toast.error("You must be signed in to pay.");
      return;
    }

    if (!selectedRequest.approvedPrice) {
      toast.error("This request has no price set yet.");
      return;
    }

    if (!pin || pin.length !== 4) {
      setPinError("Please enter your 4-digit PIN");
      return;
    }

    setPaying(true);
    try {
      const payload = {
        price: selectedRequest.approvedPrice,
        userId,
        pin: pin,
      };
      console.log("Payload:", { ...payload, pin: pin }); // Log payload without showing the actual PIN
      await axios.put(
        apiUrl(
          API_CONFIG.ENDPOINTS.DELIVERY.PAY_DELIVERY + selectedRequest._id
        ),
        payload,
        { withCredentials: true }
      );
      toast.success(
        `Payment of \u20A6${selectedRequest.approvedPrice.toLocaleString()} successful`
      );
      closeModal();
      fetchRequests();
    } catch (error) {
      console.error("Payment failed", error);
      toast.error(error?.response?.data?.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => !r.isPaid).length,
    paid: requests.filter((r) => r.isPaid).length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Delivery Requests & Payments</h1>
          <p className="text-gray-500 text-sm">Track and manage your delivery service payments</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchRequests}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            title="Refresh"
          >
            <svg className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button 
             onClick={() => router.push("/sales-manager/delivery-request")}
             className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Request
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: stats.total, color: "blue", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
          { label: "Pending Payment", value: stats.pending, color: "orange", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Paid Requests", value: stats.paid, color: "green", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Completed", value: stats.completed, color: "purple", icon: "M5 13l4 4L19 7" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              stat.color === 'orange' ? 'bg-orange-50 text-orange-600' :
              stat.color === 'green' ? 'bg-green-50 text-green-600' :
              stat.color === 'purple' ? 'bg-purple-50 text-purple-600' : ''
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {loading && requests.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 font-medium">Loading your requests...</p>
          </div>
        ) : fetchError ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-semibold">{fetchError}</p>
            <button onClick={fetchRequests} className="text-blue-600 font-medium hover:underline">Try again</button>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">You haven't made any delivery requests yet.</p>
            <button onClick={() => router.push("/sales-manager/delivery-request")} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold">Get Started</button>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Route</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Progress</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Payment Status</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">#{r._id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-800 font-medium truncate max-w-[180px]">{r.senderAddress}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          {r.receipientAddress}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {r.approvedPrice ? (
                        <span className="text-sm font-bold text-gray-900 tabular-nums">\u20A6{r.approvedPrice.toLocaleString()}</span>
                      ) : (
                        <span className="text-xs text-orange-500 font-medium italic">Quotation Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${
                            r.status === "completed" ? "bg-green-500" : 
                            r.status === "assigned" ? "bg-blue-500" : 
                            "bg-orange-500"
                         } animate-pulse`}></div>
                         <span className={`text-[11px] font-bold uppercase tracking-wider ${
                            r.status === "completed" ? "text-green-600" : 
                            r.status === "assigned" ? "text-blue-600" : 
                            "text-orange-600"
                         }`}>
                           {r.status || "Pending"}
                         </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        r.isPaid 
                          ? "bg-green-50 text-green-600 border border-green-100" 
                          : "bg-red-50 text-red-600 border border-red-100"
                      }`}>
                        {r.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <DropdownMenu>
                        <button
                          onClick={() => openViewModal(r)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all border-b border-gray-50"
                        >
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>
                        <button
                          onClick={() => openPayModal(r)}
                          disabled={!r.approvedPrice || r.isPaid}
                          className={`flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold transition-all ${
                            r.isPaid
                              ? "text-green-600 cursor-not-allowed opacity-70"
                              : r.approvedPrice
                              ? "text-blue-600 hover:bg-blue-50"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                        >
                          <svg className={`w-3.5 h-3.5 ${r.isPaid ? "text-green-600" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          {r.isPaid ? "Already Paid" : "Make Payment"}
                        </button>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 relative transform transition-all overflow-hidden border border-white/20">
            <div className="absolute top-0 right-0 p-4">
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="text-center mb-8 pt-2">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Authorize Payment</h2>
              <p className="text-gray-500 text-sm mt-1">Request ID: <span className="font-bold">#{selectedRequest._id.slice(-6).toUpperCase()}</span></p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount to Pay</span>
                  <span className="text-xl font-black text-gray-900 tracking-tighter">\u20A6{selectedRequest.approvedPrice.toLocaleString()}</span>
               </div>
               
               <div className="space-y-4 pt-4 border-t border-gray-200/60">
                  <label className="block text-sm font-semibold text-gray-700 text-center">Enter Transaction PIN</label>
                  <PinInput
                    length={4}
                    onChange={(value) => {
                      setPin(value);
                      setPinError("");
                    }}
                  />
                  {pinError && <p className="text-red-500 text-[10px] font-bold text-center animate-bounce">{pinError}</p>}
               </div>
            </div>

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-xl shadow-slate-900/20 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {paying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authorizing...
                </>
              ) : (
                "Confirm & Pay Now"
              )}
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-4">By confirming, the amount will be deducted from your wallet balance.</p>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeViewModal}></div>
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-3xl w-full relative transform transition-all overflow-hidden border border-white/20">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Request Information</h2>
                <p className="text-xs text-gray-500 font-medium tracking-tight mt-0.5">Reference: #{viewRequest._id.toUpperCase()}</p>
              </div>
              <button
                onClick={closeViewModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white transition-all shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-gray-200">
              {/* Delivery Person Card */}
              {viewRequest.deliveryMan ? (
                <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-600/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                      <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Assigned Dispatcher</p>
                      <h3 className="text-lg font-bold">{viewRequest.deliveryMan.firstName} {viewRequest.deliveryMan.lastName}</h3>
                      <p className="text-blue-50 text-xs mt-0.5">{viewRequest.deliveryMan.companyName}</p>
                    </div>
                  </div>
                  <div className="relative z-10 w-full sm:w-auto">
                    <a href={`tel:${viewRequest.deliveryMan.phone}`} className="flex items-center justify-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {viewRequest.deliveryMan.phone}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-orange-900 font-bold text-sm">Waiting for Dispatcher</h3>
                    <p className="text-orange-700 text-xs">A delivery person will be assigned once your payment is confirmed.</p>
                  </div>
                </div>
              )}

              {/* Journey Details */}
              <div className="grid md:grid-cols-2 gap-8 relative">
                <div className="absolute hidden md:block left-1/2 top-10 transform -translate-x-1/2 w-8 h-8 bg-gray-50 border border-gray-100 rounded-full text-gray-300 flex items-center justify-center z-10">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 shadow-lg shadow-orange-500/20"></div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Pickup From</h4>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-gray-100 space-y-3">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Sender</span>
                      <p className="text-sm font-bold text-gray-900">{viewRequest.senderName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{viewRequest.senderPhone}</p>
                    </div>
                    <div className="pt-2 border-t border-gray-50">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Location</span>
                      <p className="text-xs text-gray-800 font-medium leading-relaxed">{viewRequest.senderAddress}</p>
                      <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase">{viewRequest.senderLGA}, {viewRequest.senderState}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/20"></div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Delivery To</h4>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-gray-100 space-y-3">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Recipient</span>
                      <p className="text-sm font-bold text-gray-900">{viewRequest.receipientName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{viewRequest.receipientPhone} {viewRequest.receipientAltPhone && `/ ${viewRequest.receipientAltPhone}`}</p>
                    </div>
                    <div className="pt-2 border-t border-gray-50">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Location</span>
                      <p className="text-xs text-gray-800 font-medium leading-relaxed">{viewRequest.receipientAddress}</p>
                      <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase">{viewRequest.receipientLGA}, {viewRequest.receipientState}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Summary */}
              <div className="bg-gray-50 rounded-[1.5rem] p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border border-gray-100/50">
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Item Description</span>
                  <p className="text-sm text-gray-800 font-medium bg-white p-3 rounded-xl border border-gray-100">{viewRequest.goodsDescription || viewRequest.description}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Service Type</span>
                  <div className="flex items-center gap-2">
                    <div className="p-1 px-2.5 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-bold uppercase">{viewRequest.deliveryType || viewRequest.requestType}</div>
                    <div className="p-1 px-2.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase">{viewRequest.deliveryDuration}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Total Fare</span>
                  <div className="text-xl font-black text-gray-900 italic">
                    {viewRequest.approvedPrice ? `\u20A6${viewRequest.approvedPrice.toLocaleString()}` : "Calculating..."}
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${viewRequest.isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {viewRequest.isPaid ? "Payment Confirmed" : "Balance Due"}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
              <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600">SM</div>
                 <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-orange-600">KZ</div>
              </div>
              <button
                onClick={closeViewModal}
                className="px-8 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPaymentPage;

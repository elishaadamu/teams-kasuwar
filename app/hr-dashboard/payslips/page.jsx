"use client";
import React, { useState, useEffect } from "react";
import { 
  FaFileInvoiceDollar, 
  FaMoneyBillWave, 
  FaMinusCircle, 
  FaCommentDots, 
  FaPaperPlane,
  FaFilePdf,
  FaHistory,
  FaUserCircle,
  FaCalendarAlt,
  FaChevronDown,
  FaArrowLeft
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";

const ROLE_LABELS = {
  sm: "Sales Manager",
  bdm: "Business Dev. Manager",
  bd: "Business Developer",
  tl: "Team Leader",
};

export default function ManagePayslips() {
  const [selectedMember, setSelectedMember] = useState(null);
  const [amountEarned, setAmountEarned] = useState("");
  const [otherAmount, setOtherAmount] = useState("");
  const [deductions, setDeductions] = useState("");
  const [comments, setComments] = useState("");
  const [month, setMonth] = useState(new Date().toLocaleString('en-US', { month: 'long' }));
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [allPayslips, setAllPayslips] = useState([]);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("generate"); // "generate" or "history"
  const [historyFilter, setHistoryFilter] = useState("all");

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.HR.GET_STAFF), { withCredentials: true });
        setMembers(response.data.data || []);
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };
    fetchStaff();
  }, []);

  const fetchFilteredPayslips = async (staffId) => {
    setIsLoading(true);
    setHistoryFilter(staffId);
    setAllPayslips([]); // Clear previous results to prevent showing stale data
    
    // Sync with generator selection if a specific staff is picked
    if (staffId !== "all") {
        const member = members.find(m => m._id === staffId);
        if (member) setSelectedMember(member);
    }

    try {
        const endpoint = staffId === "all" 
            ? API_CONFIG.ENDPOINTS.HR.ALL_PAYSLIPS 
            : API_CONFIG.ENDPOINTS.HR.GET_PAYSLIPS(staffId);
            
        const response = await axios.get(apiUrl(endpoint), { withCredentials: true });
        console.log("Payslips Response:", response.data);
        
        // Handle both structured { success, data } responses and direct arrays
        if (Array.isArray(response.data)) {
            setAllPayslips(response.data);
            setView("history");
        } else if (response.data.success) {
            setAllPayslips(response.data.data || []);
            setView("history");
        }
    } catch (error) {
        console.error("Error fetching payslips:", error);
        toast.error("Failed to load payment logs");
    } finally {
        setIsLoading(false);
    }
  };

  // Sync history filter when selectedMember changes in generator
  useEffect(() => {
    if (selectedMember && view === "history" && historyFilter !== selectedMember._id) {
        fetchFilteredPayslips(selectedMember._id);
    }
  }, [selectedMember]);

  const handleSendPayslip = async () => {
    if (!selectedMember || !amountEarned) return toast.error("Please fill required fields");
    setIsLoading(true);
    
    try {
        const payload = {
            staffId: selectedMember._id,
            month,
            year: parseInt(year),
            amountEarned: parseFloat(amountEarned),
            otherAmount: parseFloat(otherAmount) || 0,
            deductions: parseFloat(deductions) || 0,
            comment: comments
        };

        const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.HR.PAYSLIP), payload, { withCredentials: true });
        
        if (response.data.success) {
            toast.success(`Payslip sent via email to ${selectedMember.firstName}!`);
            setAmountEarned("");
            setOtherAmount("");
            setDeductions("");
            setComments("");
        } else {
            toast.error(response.data.message || "Failed to send payslip");
        }
    } catch (error) {
        console.error("Error sending payslip:", error);
        toast.error("An error occurred while sending the payslip");
    } finally {
        setIsLoading(false);
    }
  };

  const calculateNet = () => {
    const earned = parseFloat(amountEarned) || 0;
    const extra = parseFloat(otherAmount) || 0;
    const deduct = parseFloat(deductions) || 0;
    return earned + extra - deduct;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-4 md:p-0">
      <ToastContainer theme="dark" />
      
      {/* Header Area */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black leading-tight">
            <span className="dark:text-white text-gray-950">Payroll </span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent  tracking-tight">Generator</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs md:text-sm mt-1">
            Dispatch secure remuneration records.
          </p>
        </div>
        <button 
            onClick={() => {
                if (view === "generate") {
                    fetchFilteredPayslips(selectedMember?._id || "all");
                } else {
                    setView("generate");
                }
            }}
            className="h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-gray-200 dark:text-slate-400 text-gray-600 font-black text-[10px] md:text-xs uppercase tracking-widest hover:dark:text-white hover:text-gray-950 transition-all flex items-center gap-2 shadow-sm"
        >
            {view === "history" ? <FaArrowLeft size={10} /> : <FaHistory size={12} />}
            {view === "history" ? "Back" : "History"}
        </button>
      </div>

      {view === "history" ? (
        /* History Table View - Adaptive Themes */
        <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-gray-200 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-xl overflow-hidden transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h2 className="text-lg md:text-xl font-black dark:text-white text-gray-900">Payment Logs</h2>
                
                <div className="relative group min-w-[250px]">
                    <select 
                        className="w-full h-11 dark:bg-slate-950 bg-gray-50 border dark:border-slate-800 border-gray-200 rounded-xl px-4 text-xs font-bold dark:text-white text-gray-900 appearance-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none"
                        value={historyFilter}
                        onChange={(e) => fetchFilteredPayslips(e.target.value)}
                    >
                        <option value="all">All Staff Records</option>
                        {members.map(m => (
                            <option key={m._id} value={m._id}>
                                {m.firstName} {m.lastName}
                            </option>
                        ))}
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 dark:text-slate-600 text-gray-400 pointer-events-none group-hover:text-emerald-500 transition-colors" size={10} />
                </div>
            </div>
            {allPayslips.length > 0 ? (
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-[9px] md:text-[10px] font-black uppercase tracking-widest dark:text-slate-600 text-gray-400">
                                <th className="px-4 pb-2">Staff</th>
                                <th className="px-4 pb-2">Period</th>
                                <th className="px-4 pb-2">Breakdown</th>
                                <th className="px-4 pb-2 text-right">Net Amount</th>
                                <th className="px-4 pb-2 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allPayslips.map((p, idx) => {
                                // Resolve staff details whether nested or string
                                const staffObj = typeof p.staffId === 'object' ? p.staffId : members.find(m => m._id === p.staffId);
                                
                                return (
                                <tr key={idx} className="dark:bg-slate-950/50 bg-gray-50/50 hover:dark:bg-slate-950 hover:bg-gray-100 transition-colors group">
                                    <td className="px-4 py-4 rounded-l-xl md:rounded-l-2xl border-y border-l dark:border-slate-800/50 border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg dark:bg-slate-900 bg-white border dark:border-slate-800 border-gray-200 flex items-center justify-center text-[10px] font-black text-emerald-500 shadow-sm">
                                                {staffObj?._id?.slice(-2).toUpperCase() || "ID"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs md:text-sm dark:text-slate-300 text-gray-700">
                                                    {staffObj?.firstName || "Unknown"} {staffObj?.lastName || "Staff"}
                                                </p>
                                                <p className="text-[9px] md:text-[10px] font-bold dark:text-slate-600 text-gray-400">
                                                    ID: {staffObj?.idCardId || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 border-y dark:border-slate-800/50 border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className="dark:text-slate-700 text-gray-300" size={10} />
                                            <span className="text-[11px] md:text-xs font-bold dark:text-slate-400 text-gray-500">{p.month} {p.year}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 border-y dark:border-slate-800/50 border-gray-200">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] md:text-[10px] font-bold dark:text-slate-600 text-gray-400">Base: ₦{p.amountEarned?.toLocaleString()}</span>
                                            <span className="text-[9px] md:text-[10px] font-bold text-emerald-600">Other: +₦{p.otherAmount?.toLocaleString()}</span>
                                            <span className="text-[9px] md:text-[10px] font-bold text-rose-500">Deduct: -₦{p.deductions?.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 border-y dark:border-slate-800/50 border-gray-200 text-right">
                                        <div className="flex flex-col items-end">
                                            <p className="font-black text-emerald-500 text-xs md:text-sm">
                                                ₦{p.netPay?.toLocaleString() || (parseFloat(p.amountEarned || 0) + parseFloat(p.otherAmount || 0) - parseFloat(p.deductions || 0)).toLocaleString()}
                                            </p>
                                            <span className="text-[7px] md:text-[8px] font-black uppercase dark:text-slate-700 text-gray-300">Ref: {p._id?.slice(-8)}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 rounded-r-xl md:rounded-r-2xl border-y border-r dark:border-slate-800/50 border-gray-200 text-right">
                                        <span className="text-[9px] md:text-[10px] font-black dark:text-slate-600 text-gray-400 whitespace-nowrap">
                                            {new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="py-20 text-center dark:opacity-30 opacity-20">
                    <FaHistory size={40} className="mx-auto mb-4 dark:text-white text-gray-950" />
                    <p className="font-bold dark:text-white text-gray-950 text-sm">No records found</p>
                </div>
            )}
        </div>
      ) : (
        /* Generator Form - Responsive Theme Support */
        <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-gray-200 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl transition-all">
          {/* Card Header with Adaptive Gradient */}
          <div className="p-6 md:p-8 dark:from-slate-950/50 dark:to-transparent  border-b dark:border-white/5 border-gray-100 relative">
            <div className="absolute top-0 right-0 w-32 h-32 dark:bg-emerald-500/5 bg-emerald-500/10 blur-3xl rounded-full" />
            
            <div className="relative z-10 space-y-6">
              {/* Staff Selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-slate-500 text-gray-400 flex items-center gap-2">
                  <FaUserCircle className="text-emerald-500" /> Choose Employee
                </label>
                <div className="relative group">
                  <select 
                    className="w-full h-12 md:h-14 dark:bg-slate-950 bg-white border dark:border-slate-800 border-gray-200 rounded-xl md:rounded-2xl px-5 md:px-6 text-xs md:text-sm font-bold dark:text-white text-gray-900 appearance-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none shadow-sm"
                    onChange={(e) => {
                      const member = members.find(m => m._id === e.target.value);
                      setSelectedMember(member);
                    }}
                    value={selectedMember?._id || ""}
                  >
                    <option value="" className="dark:bg-slate-900 bg-white">Select staff member...</option>
                    {members.map(m => (
                      <option key={m._id} value={m._id} className="dark:bg-slate-900 bg-white">
                        {m.firstName} {m.lastName} — {ROLE_LABELS[m.role] || m.role}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 dark:text-slate-600 text-gray-400 pointer-events-none group-hover:text-emerald-500 transition-colors" size={12} />
                </div>
              </div>

              {/* Mini Profile Summary */}
              {selectedMember && (
                <div className="p-4 rounded-xl md:rounded-2xl dark:bg-emerald-500/5 bg-emerald-50 border dark:border-emerald-500/10 border-emerald-100 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl border dark:border-emerald-500/20 border-emerald-200 overflow-hidden dark:bg-slate-950 bg-white shadow-sm">
                    {selectedMember.passportPhoto ? (
                      <img src={selectedMember.passportPhoto} alt="" className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center dark:text-slate-700 text-gray-300 italic text-[9px]">Photo</div>}
                  </div>
                  <div className="flex-1">
                    <h3 className="dark:text-white text-gray-900 font-black text-xs md:text-sm tracking-tight">{selectedMember.firstName} {selectedMember.lastName}</h3>
                    <p className="text-[9px] md:text-[10px] dark:text-slate-500 text-gray-400 font-bold uppercase tracking-wider truncate max-w-[150px] md:max-w-none">{selectedMember.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] md:text-[10px] dark:text-slate-600 text-gray-400 font-black uppercase tracking-tighter">Staff ID</p>
                    <p className="text-xs font-black text-emerald-500">{selectedMember.idCardId || "N/A"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Grid Layout for Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {/* Period Row */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest dark:text-slate-500 text-gray-400 px-1">Month</label>
                <div className="relative">
                  <select 
                    className="w-full h-11 md:h-12 dark:bg-slate-950 bg-white border dark:border-slate-800 border-gray-200 rounded-xl px-4 text-xs font-bold dark:text-white text-gray-900 appearance-none focus:border-emerald-500 focus:outline-none transition-all shadow-sm"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                      <option key={m} value={m} className="dark:bg-slate-900 bg-white">{m}</option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 dark:text-slate-600 text-gray-400 pointer-events-none" size={10} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest dark:text-slate-500 text-gray-400 px-1">Year</label>
                <div className="relative">
                  <select 
                    className="w-full h-11 md:h-12 dark:bg-slate-950 bg-white border dark:border-slate-800 border-gray-200 rounded-xl px-4 text-xs font-bold dark:text-white text-gray-900 appearance-none focus:border-emerald-500 focus:outline-none transition-all shadow-sm"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    {[2024, 2025, 2026, 2027].map(y => (
                      <option key={y} value={y} className="dark:bg-slate-900 bg-white">{y}</option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 dark:text-slate-600 text-gray-400 pointer-events-none" size={10} />
                </div>
              </div>

              {/* Finacial Row */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-1">Base Earnings</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-sm">₦</span>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={amountEarned}
                    onChange={(e) => setAmountEarned(e.target.value)}
                    className="w-full h-11 md:h-12 dark:bg-slate-950 bg-white border dark:border-slate-800 border-gray-200 rounded-xl pl-10 pr-4 text-sm font-black dark:text-white text-gray-900 focus:border-emerald-500 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-teal-500 px-1">Bonus/Extras</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500 font-black text-sm">₦</span>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={otherAmount}
                    onChange={(e) => setOtherAmount(e.target.value)}
                    className="w-full h-11 md:h-12 dark:bg-slate-950 bg-white border dark:border-slate-800 border-gray-200 rounded-xl pl-10 pr-4 text-sm font-black dark:text-white text-gray-900 focus:border-teal-500 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-rose-500 px-1">Total Deductions</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 font-black text-sm">₦</span>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                    className="w-full h-11 md:h-12 dark:bg-slate-950 bg-white border dark:border-slate-800 border-gray-200 rounded-xl pl-10 pr-4 text-sm font-black dark:text-rose-500 text-rose-600 focus:border-rose-500 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest dark:text-slate-600 text-gray-400 px-1">Remarks</label>
                <textarea 
                  placeholder="Notes for the payslip..." 
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full h-24 dark:bg-slate-950 bg-white border dark:border-slate-800 border-gray-200 rounded-xl p-4 text-xs font-medium dark:text-white text-gray-800 placeholder:dark:text-slate-700 placeholder:text-gray-300 outline-none focus:border-emerald-500 transition-all resize-none shadow-sm"
                />
              </div>
            </div>

            {/* Adaptive Footer */}
            <div className="pt-8 border-t dark:border-slate-800 border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] dark:text-slate-600 text-gray-400 mb-1">Net Payable Amount</p>
                <h3 className="text-3xl md:text-4xl font-black dark:text-white text-gray-900 tracking-tight transition-colors">
                  <span className="text-emerald-500 mr-2">₦</span>
                  {calculateNet().toLocaleString()}
                </h3>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none h-12 md:h-14 px-6 rounded-xl md:rounded-2xl dark:bg-slate-950 bg-white border dark:border-slate-800 border-gray-200 dark:text-slate-500 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:dark:text-white hover:text-gray-950 transition-all shadow-sm">
                  Preview
                </button>
                <button 
                  onClick={handleSendPayslip}
                  disabled={isLoading || !selectedMember}
                  className="flex-1 md:flex-none h-12 md:h-14 px-8 md:px-10 rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                >
                  {isLoading ? "Sending..." : "Dispatch Payslip"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { 
  FaFileInvoiceDollar, 
  FaUserFriends, 
  FaChartPie, 
  FaMoneyBillWave, 
  FaMinusCircle, 
  FaCommentDots, 
  FaPaperPlane,
  FaFilePdf,
  FaHistory
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";

export default function ManagePayslips() {
  const [selectedMember, setSelectedMember] = useState(null);
  const [amountEarned, setAmountEarned] = useState("");
  const [deductions, setDeductions] = useState("");
  const [comments, setComments] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.HR.GET_STAFF), { withCredentials: true });
        if (response.data.success) {
          setMembers(response.data.staff || []);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };
    fetchStaff();
  }, []);

  const handleSendPayslip = () => {
    if (!selectedMember || !amountEarned) return toast.error("Please fill required fields");
    setIsLoading(true);
    
    setTimeout(() => {
        toast.success(`Payslip sent via email to ${selectedMember.name}!`);
        setIsLoading(false);
        setAmountEarned("");
        setDeductions("");
        setComments("");
    }, 1500);
  };

  const calculateNet = () => {
    const earned = parseFloat(amountEarned) || 0;
    const deduct = parseFloat(deductions) || 0;
    return earned - deduct;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in">
      <ToastContainer theme="dark" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-900 pb-12">
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-white leading-none">
            Payroll <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">Operations</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg">
            Issue performance-based remuneration and manage individual staff payslips.
          </p>
        </div>
        <button className="px-8 py-4 rounded-3xl bg-slate-900 border-2 border-slate-800 text-slate-300 font-black text-sm uppercase tracking-widest hover:text-white transition-all shadow-2xl flex items-center gap-3 active:scale-95 group">
            <FaHistory className="group-hover:rotate-[-45deg] transition-transform" />
            Payment History
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Selection Column */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-6 px-2">Select Staff Member</label>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {members.map(member => (
                        <button
                            key={member.id}
                            onClick={() => setSelectedMember(member)}
                            className={`w-full text-left p-6 rounded-3xl border-2 transition-all flex items-center gap-6 group relative overflow-hidden ${
                                selectedMember?.id === member.id 
                                ? "bg-emerald-600 border-emerald-400 text-white shadow-emerald-900/40" 
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-500"
                            }`}
                        >
                            <div className={`p-3 rounded-2xl ${selectedMember?.id === member.id ? 'bg-white/20' : 'bg-slate-900'} group-hover:scale-110 transition-transform`}>
                                <FaUserFriends size={20} />
                            </div>
                            <div>
                                <h3 className="font-black text-lg tracking-tight leading-none">{member.name}</h3>
                                <p className="text-xs font-bold opacity-60 mt-1 uppercase tracking-wider">{member.role}</p>
                            </div>
                            <div className="ml-auto text-right">
                                <span className="text-[10px] font-black opacity-70 uppercase block">Perf.</span>
                                <span className={`text-lg font-black ${selectedMember?.id === member.id ? 'text-white' : 'text-emerald-500'}`}>{member.performance}%</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Right: Payslip Generator */}
        <div className="lg:col-span-8">
            {selectedMember ? (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 md:p-14 relative overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.4)]">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] pointer-events-none rounded-full" />
                    
                    <div className="relative z-10 space-y-12">
                        {/* Summary Header */}
                        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
                            <div>
                                <h2 className="text-4xl font-black text-white tracking-tight">{selectedMember.name}</h2>
                                <p className="text-xl text-slate-500 font-bold mt-2">{selectedMember.role} • Employee ID #{selectedMember.id}2026</p>
                            </div>
                            <div className="p-8 rounded-[2rem] bg-slate-950 border border-slate-800 flex items-center gap-8 shadow-inner">
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">KPI Performance</p>
                                    <p className="text-3xl font-black text-emerald-400">{selectedMember.performance}%</p>
                                </div>
                                <div className="w-[2px] h-12 bg-slate-800" />
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Base Salary</p>
                                    <p className="text-3xl font-black text-white">₦{selectedMember.baseSalary.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Input Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
                                    <FaMoneyBillWave className="text-emerald-500" /> Amount Earned (Monthly Total)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-2xl">₦</span>
                                    <input 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={amountEarned}
                                        onChange={(e) => setAmountEarned(e.target.value)}
                                        className="w-full h-20 bg-slate-950 border-2 border-slate-800 rounded-3xl pl-14 pr-8 text-3xl font-black text-white focus:border-emerald-500 focus:outline-none transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-4 text-rose-500">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
                                    <FaMinusCircle className="text-rose-500" /> Total Deductions (Optional)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-500 font-black text-2xl">₦</span>
                                    <input 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={deductions}
                                        onChange={(e) => setDeductions(e.target.value)}
                                        className="w-full h-20 bg-slate-950 border-2 border-slate-800 rounded-3xl pl-14 pr-8 text-3xl font-black text-rose-500/80 focus:border-rose-500 focus:outline-none transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
                                    <FaCommentDots className="text-teal-500" /> Payroll Comments / Breakdown
                                </label>
                                <textarea 
                                    placeholder="Add notes about bonuses, overtime, or specific deduction reasons..." 
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    className="w-full h-40 bg-slate-950 border-2 border-slate-800 rounded-3xl p-8 text-white text-lg font-medium placeholder:text-slate-700 focus:border-emerald-500 focus:outline-none transition-all shadow-inner resize-none"
                                />
                            </div>
                        </div>

                        {/* Final Calculation & Action */}
                        <div className="pt-10 border-t-2 border-slate-950 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="text-center md:text-left">
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Net Payable Amount</p>
                                <h3 className="text-6xl font-black text-white tracking-tighter">₦{calculateNet().toLocaleString()}</h3>
                            </div>
                            
                            <div className="flex gap-4 w-full md:w-auto">
                                <button className="flex-1 md:flex-none h-20 px-10 rounded-3xl bg-slate-950 text-slate-400 font-black border-2 border-slate-800 hover:border-slate-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-4">
                                    <FaFilePdf size={24} />
                                    Preview
                                </button>
                                <button 
                                    onClick={handleSendPayslip}
                                    disabled={isLoading}
                                    className="flex-1 md:flex-none h-20 px-14 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-lg uppercase tracking-widest shadow-2xl hover:scale-[1.02] hover:shadow-emerald-600/30 transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50"
                                >
                                    {isLoading ? "Processing..." : (
                                        <>
                                            <FaPaperPlane size={24} />
                                            Email Payslip
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full min-h-[700px] flex flex-col items-center justify-center bg-slate-900/30 border-4 border-dashed border-slate-900 rounded-[3rem] p-12 text-center">
                    <div className="w-32 h-32 rounded-full bg-slate-900 flex items-center justify-center mb-10 shadow-2xl">
                        <FaFileInvoiceDollar size={50} className="text-slate-700" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-700 tracking-tight">Remuneration Portal</h2>
                    <p className="max-w-md text-slate-500 mt-6 text-xl font-medium leading-relaxed">Select an active staff member to generate their monthly payroll breakdown, calculate net earnings, and transmit secure digital payslips.</p>
                </div>
            )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { 
  FaExclamationTriangle, 
  FaUserSlash, 
  FaBan, 
  FaFileAlt, 
  FaSearch, 
  FaTrashAlt,
  FaShieldAlt,
  FaEnvelopeOpenText,
  FaGavel
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";

export default function DisciplinaryActions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [reasonTitle, setReasonTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("low");
  const [allUsers, setAllUsers] = useState([]);
  const [warningLogs, setWarningLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.HR.GET_STAFF), { withCredentials: true });
        if (response.data.success) {
          setAllUsers(response.data.staff || []);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStaff();
    fetchWarnings();
  }, []);

  const fetchWarnings = async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.HR.GET_ALL_WARNINGS), { withCredentials: true });
      if (response.data.success) {
        setWarningLogs(response.data.warnings || []);
      }
    } catch (error) {
      console.error("Error fetching warnings:", error);
    }
  };

  const handleIssueWarning = async (actionType) => {
    if (!selectedUser) return toast.error("Please select a user first");
    if (!reasonTitle) return toast.error("Please provide a reason title");
    if (!description) return toast.error("Please provide a detailed description");

    setIsSubmitting(true);
    try {
      const payload = {
        staffId: selectedUser.id || selectedUser._id,
        reason: reasonTitle,
        description: description,
        severity: severity,
        type: actionType // e.g. "1st Warning"
      };

      const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.HR.ISSUE_WARNING), payload, { withCredentials: true });
      
      if (response.data.success) {
        toast.success(`${actionType} issued successfully to ${selectedUser.name}!`);
        setReasonTitle("");
        setDescription("");
        setSeverity("low");
        fetchWarnings(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to issue warning");
      }
    } catch (error) {
      console.error("Warning Issue Error:", error);
      toast.error(error.response?.data?.message || "An error occurred while issuing warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (actionType) => {
    if (actionType.includes("Warning")) {
      await handleIssueWarning(actionType);
    } else {
      // Handle Suspension/Termination (Mocked for now or call other endpoints if provided)
      toast.info(`${actionType} functionality coming soon`);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
      <ToastContainer theme="dark" />
      
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-5xl font-black text-white px-2 border-l-8 border-rose-600">
          Disciplinary <span className="text-rose-500">Board</span>
        </h1>
        <p className="text-slate-400 text-lg font-medium leading-relaxed">
          Manage staff conduct, issue warnings, and handle account statuses across the organization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* User Selection Panel */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-6 shadow-2xl">
                <div className="relative mb-6">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search personnel..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 h-14 bg-slate-950/50 border-2 border-slate-800 rounded-2xl w-full text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none transition-all"
                    />
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredUsers.map(user => (
                        <button
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                                selectedUser?.id === user.id 
                                ? "bg-rose-500 border-rose-400 text-white shadow-lg scale-[1.02]" 
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-500"
                            }`}
                        >
                            <div>
                                <h3 className="font-bold tracking-tight">{user.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedUser?.id === user.id ? "text-white" : "text-rose-500"}`}>{user.role}</span>
                                    <span className="text-[10px] opacity-70">• {user.email}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${user.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{user.status}</span>
                                <span className="text-[8px] font-bold opacity-60">{user.warnings} Warnings</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-2 space-y-8">
            {selectedUser ? (
                <div className="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 blur-[120px] pointer-events-none rounded-full" />
                    
                    <div className="relative z-10 space-y-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                            <div className="flex items-center gap-8">
                                <div className="w-24 h-24 rounded-3xl bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-4xl font-black text-rose-500 shadow-inner">
                                    {selectedUser.name[0]}
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-white tracking-tight">{selectedUser.name}</h2>
                                    <p className="text-slate-400 font-medium text-lg mt-1">{selectedUser.role} • {selectedUser.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Conduct History</p>
                                <p className="text-3xl font-black text-rose-500">{selectedUser.warnings} Warnings Issued</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <FaFileAlt className="text-rose-500" /> Subject / Reason
                                </label>
                                <input 
                                    type="text"
                                    placeholder="Violation of Conduct, Underperformance, etc." 
                                    value={reasonTitle}
                                    onChange={(e) => setReasonTitle(e.target.value)}
                                    className="w-full h-14 bg-slate-950/80 border-2 border-slate-800 rounded-2xl px-6 text-white placeholder:text-slate-700 focus:border-rose-500 focus:outline-none transition-all shadow-inner font-medium"
                                />
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <FaExclamationTriangle className="text-rose-500" /> Severity Level
                                </label>
                                <select 
                                    value={severity}
                                    onChange={(e) => setSeverity(e.target.value)}
                                    className="w-full h-14 bg-slate-950/80 border-2 border-slate-800 rounded-2xl px-6 text-white focus:border-rose-500 focus:outline-none transition-all shadow-inner font-bold"
                                >
                                    <option value="low">Low Severity</option>
                                    <option value="medium">Medium Severity</option>
                                    <option value="high">High Severity</option>
                                    <option value="critical">Critical Severity</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <FaEnvelopeOpenText className="text-rose-500" /> Detailed Description
                            </label>
                            <textarea 
                                placeholder="Detail the violation, incident description, or underperformance metrics..." 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full h-40 bg-slate-950/80 border-2 border-slate-800 rounded-3xl p-8 text-white placeholder:text-slate-700 focus:border-rose-500 focus:outline-none transition-all shadow-inner font-medium resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ActionButton 
                                title="Issue 1st Warning" 
                                icon={FaExclamationTriangle} 
                                color="bg-amber-600 hover:bg-amber-500 shadow-amber-900/40" 
                                disabled={selectedUser.warnings >= 1}
                                onClick={() => handleAction("1st Warning")}
                                description="Formal first-level notice"
                            />
                            <ActionButton 
                                title="Issue 2nd Warning" 
                                icon={FaGavel} 
                                color="bg-orange-600 hover:bg-orange-500 shadow-orange-900/40" 
                                disabled={selectedUser.warnings < 1 || selectedUser.warnings >= 2}
                                onClick={() => handleAction("2nd Warning")}
                                description="Critical final notice"
                            />
                            <ActionButton 
                                title="Suspend Account" 
                                icon={FaBan} 
                                color="bg-rose-600 hover:bg-rose-500 shadow-rose-900/40" 
                                disabled={isSubmitting}
                                onClick={() => handleAction("Suspension")}
                                description="Temporary operational block"
                            />
                            <ActionButton 
                                title="Terminate Access" 
                                icon={FaUserSlash} 
                                color="bg-red-700 hover:bg-red-600 shadow-red-900/40" 
                                disabled={isSubmitting}
                                onClick={() => handleAction("Termination")}
                                description="Permanent account removal"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[2.5rem] p-12 text-center opacity-50">
                    <FaShieldAlt className="text-8xl text-slate-800 mb-8" />
                    <h2 className="text-3xl font-black text-slate-600 tracking-tight">Access Control Center</h2>
                    <p className="max-w-md text-slate-500 mt-4 text-lg">Select a staff member from the left panel to manage their disciplinary records and account status.</p>
                </div>
            )}
        </div>
      </div>

      {/* Warning Logs Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Warning <span className="text-rose-500">History Logs</span>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-rose-500/30 to-transparent" />
        </h2>

        <div className="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950/50 border-b border-slate-800">
                            <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-500">Staff Member</th>
                            <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-500">Reason / Type</th>
                            <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-500">Severity</th>
                            <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-500">Date Issued</th>
                            <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {warningLogs.length > 0 ? warningLogs.map((log) => (
                            <tr key={log.id || log._id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-rose-500">
                                            {log.staffName?.[0] || "S"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{log.staffName || "Unknown Staff"}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{log.staffRole || "Member"}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <p className="font-bold text-slate-300">{log.reason}</p>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-500 font-black uppercase tracking-widest mt-1 inline-block border border-slate-700">{log.type}</span>
                                </td>
                                <td className="p-6">
                                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border shadow-sm ${
                                        log.severity === 'critical' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                        log.severity === 'high' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                        log.severity === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    }`}>
                                        {log.severity}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <p className="text-sm font-medium text-slate-400">{new Date(log.createdAt || log.date).toLocaleDateString()}</p>
                                    <p className="text-[10px] text-slate-600 font-bold">{new Date(log.createdAt || log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Delivered</span>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="p-20 text-center text-slate-600 font-bold uppercase tracking-widest opacity-50">
                                    No warning logs found in the archives.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
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
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}

const ActionButton = ({ title, icon: Icon, color, onClick, description, disabled }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`p-8 rounded-[2rem] border border-white/5 flex items-start gap-6 transition-all duration-300 group shadow-2xl relative overflow-hidden disabled:opacity-30 disabled:grayscale disabled:pointer-events-none ${color} text-white`}
    >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
            <Icon size={40} />
        </div>
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md group-hover:bg-white/20 transition-colors">
            <Icon size={24} />
        </div>
        <div className="text-left flex-1">
            <h4 className="text-xl font-black tracking-tight">{title}</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">{description}</p>
        </div>
    </button>
);

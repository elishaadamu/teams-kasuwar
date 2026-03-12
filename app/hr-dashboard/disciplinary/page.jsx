"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  FaExclamationTriangle, 
  FaUserSlash, 
  FaBan, 
  FaFileAlt, 
  FaSearch, 
  FaTrashAlt,
  FaShieldAlt,
  FaEnvelopeOpenText,
  FaGavel,
  FaChevronDown,
  FaUser,
  FaHistory
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useTheme } from "next-themes";

const SearchableSelect = ({ options, onSelect, selectedUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter(u => 
    (u.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (u.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (u.phone?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (u.role?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2 block ml-1">
        Target Personnel
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[64px] py-4 bg-white dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] px-6 flex items-center justify-between text-slate-900 dark:text-white hover:border-rose-600/30 transition-all shadow-sm group"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            selectedUser ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
          }`}>
            {selectedUser ? (
              <span className="font-black text-sm uppercase">{selectedUser.name?.[0]}</span>
            ) : (
              <FaUser size={14} />
            )}
          </div>
          <div className="text-left">
            <h4 className={`text-sm font-black transition-colors ${selectedUser ? "text-slate-950 dark:text-white" : "text-slate-400"}`}>
              {selectedUser ? selectedUser.name : "Select staff member..."}
            </h4>
            {selectedUser && (
              <div className="flex items-center gap-2 mt-0.5 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-500">{selectedUser.role}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{selectedUser.email}</span>
              </div>
            )}
          </div>
        </div>
        <FaChevronDown className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-2xl z-[100] overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs" />
              <input
                autoFocus
                type="text"
                placeholder="Search by name, email, phone or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filtered.length > 0 ? (
              filtered.map((user) => (
                <button
                  key={user.id || user._id}
                  onClick={() => {
                    onSelect(user);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left p-5 flex items-center justify-between group transition-all border-b border-slate-100 dark:border-slate-800 last:border-0 relative ${
                    selectedUser?.id === user.id || selectedUser?._id === user.id || selectedUser?._id === user._id
                    ? "bg-rose-50/50 dark:bg-rose-600/5" 
                    : "hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                  }`}
                >
                  { (selectedUser?.id === user.id || selectedUser?._id === user.id || selectedUser?._id === user._id) && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-600" />
                  )}
                  <div>
                    <h4 className={`text-base font-bold transition-colors ${
                      selectedUser?.id === user.id || selectedUser?._id === user.id || selectedUser?._id === user._id
                      ? "text-rose-600 dark:text-rose-500"
                      : "text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400"
                    }`}>{user.name}</h4>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{user.role} • {user.email}</p>
                  </div>
                  {user.phone && <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-400">{user.phone}</span>}
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest">
                No Results Found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ title, icon: Icon, color, activeColor, onClick, description, disabled, isSelected }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-300 shadow-md relative overflow-hidden disabled:opacity-30 disabled:grayscale disabled:pointer-events-none flex-1 min-w-[140px] hover:scale-[1.02] active:scale-95 ${
      isSelected 
      ? `${activeColor} border-transparent ring-2 ring-white/20 scale-[1.05] z-10 shadow-[0_0_20px_rgba(225,29,72,0.4)]` 
      : `${color} border-slate-200 dark:border-white/5`
    }`}
  >
    <div className={`p-2 rounded-lg transition-colors shrink-0 ${
      isSelected ? "bg-white/20" : "bg-black/5 dark:bg-white/10"
    }`}>
      <Icon size={14} className={isSelected ? "text-white" : ""} />
    </div>
    <div className="text-left overflow-hidden">
      <h4 className={`text-[11px] font-black tracking-tight whitespace-nowrap ${isSelected ? "text-white" : ""}`}>{title}</h4>
      <p className={`text-[8px] font-bold uppercase tracking-widest truncate ${isSelected ? "text-white/80" : "opacity-70"}`}>{description}</p>
    </div>
  </button>
);

export default function DisciplinaryActions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [reasonTitle, setReasonTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("low");
  const [allUsers, setAllUsers] = useState([]);
  const [warningLogs, setWarningLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.HR.GET_STAFF), { withCredentials: true });
        if (response.data.success) {
          setAllUsers(response.data.data || []);
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
      console.log("Full History Response:", response.data);
      if (response.data.success) {
        const logs = response.data.warnings || [];
        setWarningLogs(logs);
      }
    } catch (error) {
      console.error("Error fetching warnings:", error);
    }
  };

  const handleIssueWarning = async (actionType) => {
    if (!selectedUser) return alert("Please select a user first");
    if (!reasonTitle) return alert("Please provide a reason title");
    if (!description) return alert("Please provide a detailed description");

    setIsSubmitting(true);
    try {
      const payload = {
        staffId: selectedUser.id || selectedUser._id,
        reason: reasonTitle,
        description: description,
        severity: severity,
        type: actionType
      };

      const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.HR.ISSUE_WARNING), payload, { withCredentials: true });
      
      if (response.data.success) {
        alert(`${actionType} issued successfully to ${selectedUser.name}!`);
        // Reset all states
        setSelectedUser(null);
        setSelectedAction("");
        setReasonTitle("");
        setDescription("");
        setSeverity("low");
        fetchWarnings();
      } else {
        alert(response.data.message || "Failed to issue warning");
      }
    } catch (error) {
      console.error("Warning Issue Error:", error);
      alert(error.response?.data?.message || "An error occurred while issuing warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async () => {
    if (!selectedAction) return;
    if (selectedAction.includes("Warning")) {
      await handleIssueWarning(selectedAction);
    } else {
      alert(`${selectedAction} functionality coming soon`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 animate-fade-in text-slate-900 dark:text-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/40">
              <FaShieldAlt size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-rose-600 dark:text-rose-500">Security & Compliance</span>
          </div>
          <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            Disciplinary <span className="text-rose-600 italic">Actions</span>
          </h1>
          <p className="text-slate-700 dark:text-slate-300 text-base max-w-xl font-medium">
            Monitor personnel conduct, issue warnings and enforce organizational policies through a centralized management interface.
          </p>
        </div>
        
        <div className="flex gap-4">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">System Status</p>
                    <p className="text-slate-900 dark:text-white font-bold text-sm">Active Monitoring</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20 animate-pulse" />
            </div>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        
        {/* ACTION SECTION */}
        <div className="w-full space-y-6">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-xl dark:shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <SearchableSelect 
                options={allUsers} 
                selectedUser={selectedUser} 
                onSelect={setSelectedUser} 
              />

              {selectedUser ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/5 blur-3xl rounded-full" />
                     
                     <div className="w-16 h-16 rounded-xl bg-rose-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-2xl font-black text-white shadow-lg shrink-0 relative z-10">
                        {selectedUser.name?.[0] || "U"}
                     </div>

                     <div className="flex-1 min-w-0 text-center sm:text-left relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                          <h3 className="text-lg font-black text-slate-950 dark:text-white tracking-tight truncate">{selectedUser.name}</h3>
                          <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <p className="text-rose-600 dark:text-rose-500 font-black uppercase tracking-[0.1em] text-[10px] sm:mt-0">{selectedUser.role}</p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2">
                           <div className="flex items-center gap-2">
                              <FaEnvelopeOpenText size={10} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">{selectedUser.email}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <FaSearch size={10} className="text-slate-400 rotate-90" />
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{selectedUser.phone || "N/A"}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Subject / Reason</label>
                            <input 
                                type="text"
                                placeholder="Reason for action..." 
                                value={reasonTitle}
                                onChange={(e) => setReasonTitle(e.target.value)}
                                className="w-full h-11 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm text-slate-900 dark:text-white focus:border-rose-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Severity</label>
                            <select 
                                value={severity}
                                onChange={(e) => setSeverity(e.target.value)}
                                className="w-full h-11 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm text-slate-900 dark:text-white focus:border-rose-500 outline-none transition-all font-bold"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Details</label>
                        <textarea 
                            placeholder="Detailed description..." 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full h-28 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-900 dark:text-white focus:border-rose-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 ml-1">Issue Actions</p>
                        <div className="flex flex-wrap gap-3">
                            <ActionButton 
                                title="1st Warning" 
                                icon={FaExclamationTriangle} 
                                color="bg-amber-100 dark:bg-amber-600/10 text-amber-700 dark:text-amber-500" 
                                activeColor="bg-amber-600 text-white"
                                isSelected={selectedAction === "1st Warning"}
                                disabled={selectedUser.warnings >= 1 || isSubmitting}
                                onClick={() => setSelectedAction("1st Warning")}
                                description="Initial Notice"
                            />
                            <ActionButton 
                                title="2nd Warning" 
                                icon={FaGavel} 
                                color="bg-orange-100 dark:bg-orange-600/10 text-orange-700 dark:text-orange-500" 
                                activeColor="bg-orange-600 text-white"
                                isSelected={selectedAction === "2nd Warning"}
                                disabled={selectedUser.warnings < 1 || selectedUser.warnings >= 2 || isSubmitting}
                                onClick={() => setSelectedAction("2nd Warning")}
                                description="Critical Final"
                            />
                            <ActionButton 
                                title="Suspension" 
                                icon={FaBan} 
                                color="bg-rose-100 dark:bg-rose-600/10 text-rose-700 dark:text-rose-500" 
                                activeColor="bg-rose-600 text-white"
                                isSelected={selectedAction === "Suspension"}
                                disabled={isSubmitting}
                                onClick={() => setSelectedAction("Suspension")}
                                description="Temp Block"
                            />
                            <ActionButton 
                                title="Termination" 
                                icon={FaUserSlash} 
                                color="bg-red-100 dark:bg-red-700/10 text-red-700 dark:text-red-500" 
                                activeColor="bg-red-700 text-white"
                                isSelected={selectedAction === "Termination"}
                                disabled={isSubmitting}
                                onClick={() => setSelectedAction("Termination")}
                                description="Perm Exit"
                            />
                        </div>

                        {selectedAction && (
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-500">
                                <button
                                    onClick={handleAction}
                                    disabled={isSubmitting || !reasonTitle || !description}
                                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-rose-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale"
                                >
                                    {isSubmitting ? "Processing..." : `Confirm & Issue ${selectedAction}`}
                                </button>
                                {(!reasonTitle || !description) && (
                                    <p className="text-[10px] text-rose-500 font-bold mt-2 text-center uppercase tracking-widest">Provide reason & description to continue</p>
                                )}
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 px-6 flex flex-col items-center justify-center text-center opacity-40 grayscale">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
                        <FaUser className="text-xl text-slate-400" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Selection Required</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">Select a staff member above to start.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LOGS SECTION */}
        <div className="w-full space-y-6 pt-10 border-t-2 border-slate-100 dark:border-slate-800/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between px-2 gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-3">
                        <FaHistory className="text-rose-600" /> Disciplinary <span className="text-rose-600">Archive</span>
                    </h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Historical record of all issued actions</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{warningLogs.length} Total Records</span>
                    <div className="h-1 w-24 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-600 w-full animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800/50 rounded-[2rem] overflow-hidden shadow-xl dark:shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Personnel</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Violation Details</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Severity</th>
                                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">Date Issued</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {warningLogs.length > 0 ? warningLogs.map((log) => (
                                <tr key={log.id || log._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-600/10 flex items-center justify-center font-black text-rose-600 dark:text-rose-500 text-[10px] shadow-sm uppercase border border-rose-100 dark:border-rose-900/30">
                                                {log.staffId?.firstName?.[0] || log.staffName?.[0] || "?"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-950 dark:text-white group-hover:text-rose-600 transition-colors uppercase tracking-tight">
                                                    {log.staffId ? `${log.staffId.firstName} ${log.staffId.lastName}` : (log.staffName || "Unknown")}
                                                </p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                                                    {log.staffId?.role || log.staffRole || "Member"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{log.reason}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {log.type && (
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-600/10 text-rose-600 dark:text-rose-500 font-black uppercase tracking-widest border border-rose-100 dark:border-rose-900/30">{log.type}</span>
                                            )}
                                            {log.description && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic truncate max-w-[250px]">{log.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border ${
                                            log.severity === 'critical' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                            log.severity === 'high' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                            log.severity === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        }`}>
                                            {log.severity}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{new Date(log.createdAt || log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        <p className="text-[9px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest">{new Date(log.createdAt || log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                                        No archival records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
}

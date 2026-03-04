"use client";
import React, { useState, useEffect } from "react";
import { FaChartBar, FaSearch, FaFilter, FaArrowUp, FaArrowDown, FaUserTie, FaUserShield, FaUserEdit } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";

const PerformanceBar = ({ percentage, color }) => (
  <div className="w-full bg-slate-800 rounded-full h-4 relative overflow-hidden group">
    <div 
      className={`h-full rounded-full transition-all duration-1000 ease-out shadow-2xl ${color}`} 
      style={{ width: `${percentage}%` }}
    />
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-black text-white drop-shadow-md">{percentage}% ACHIEVEMENT</span>
    </div>
  </div>
);

export default function StaffPerformance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [staffData, setStaffData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.HR.GET_STAFF), { withCredentials: true });
        if (response.data.success) {
          // Flatten or map data if needed, assuming the API returns an array of staff
          // For now, setting directly
          setStaffData(response.data.staff || []);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
        toast.error("Failed to load staff performance data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const getRoleIcon = (role) => {
    switch(role) {
      case "SM": return <FaUserTie className="text-blue-400" />;
      case "BDM": return <FaUserShield className="text-indigo-400" />;
      case "BD": return <FaUserEdit className="text-violet-400" />;
      default: return <FaChartBar className="text-slate-400" />;
    }
  };

  const getStatusColor = (kpi) => {
    if (kpi >= 80) return "bg-emerald-500 from-emerald-400 to-emerald-600";
    if (kpi >= 60) return "bg-blue-500 from-blue-400 to-blue-600";
    if (kpi >= 40) return "bg-amber-500 from-amber-400 to-amber-600";
    return "bg-rose-500 from-rose-400 to-rose-600";
  };

  const filteredStaff = staffData.filter(s => 
    (filterRole === "all" || s.role === filterRole) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.region.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-10 animate-fade-in">
      <ToastContainer theme="dark" />
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tighter">
            Staff <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent underline decoration-emerald-500/20 underline-offset-8">Metrics</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg">
            Individual performance tracking based on real-time KPI data.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
            <div className="relative group">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search staff or region..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 h-14 bg-slate-900 border-2 border-slate-800 rounded-2xl w-full md:w-80 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all shadow-xl"
                />
            </div>
            <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-6 h-14 bg-slate-900 border-2 border-slate-800 rounded-2xl text-slate-300 font-bold focus:outline-none focus:border-blue-500 transition-all shadow-xl"
            >
                <option value="all">All Roles</option>
                <option value="SM">SM Only</option>
                <option value="BDM">BDM Only</option>
                <option value="BD">BD Only</option>
                <option value="TL">Team Leaders</option>
            </select>
        </div>
      </div>

      {/* Performance List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest">Loading Personnel Data...</p>
          </div>
        ) : filteredStaff.length > 0 ? (
          filteredStaff.map((staff) => (
          <div key={staff.id} className="p-8 rounded-[2.5rem] bg-slate-900 border-2 border-slate-800 hover:border-blue-500/30 transition-all duration-500 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {getRoleIcon(staff.role)}
            </div>
            
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-2xl font-black text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
                  {staff.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{staff.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-3 py-1 rounded-lg bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-600/20">{staff.role}</span>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{staff.region}</span>
                  </div>
                </div>
              </div>
              
              <div className={`flex flex-col items-end ${staff.trend > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                <div className="flex items-center gap-2">
                    {staff.trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
                    <span className="text-xl font-black">{Math.abs(staff.trend)}%</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">vs Last Month</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs uppercase font-black text-slate-500 tracking-[0.2em]">Current KPI Achievement</span>
                <span className={`text-3xl font-black tracking-tighter ${staff.kpi >= 80 ? "text-emerald-400" : staff.kpi >= 60 ? "text-blue-400" : "text-amber-400"}`}>{staff.kpi}%</span>
              </div>
              <PerformanceBar percentage={staff.kpi} color={`bg-gradient-to-r ${getStatusColor(staff.kpi)} shadow-[0_0_20px_rgba(59,130,246,0.3)]`} />
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center gap-4">
                <p className="text-xs text-slate-500 font-medium italic">"Consistent performance across all field metrics."</p>
                <button className="px-6 py-3 rounded-xl bg-slate-950 text-slate-300 font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                    Detailed Report
                </button>
            </div>
          </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-800 text-center">
            <p className="text-slate-500 font-bold uppercase tracking-widest">No matching staff found</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}

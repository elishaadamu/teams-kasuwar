"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaChartBar, FaSearch, FaFilter, FaArrowUp, FaArrowDown, FaUserTie, FaUserShield, FaUserEdit, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  PointElement, 
  LineElement 
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { apiUrl, API_CONFIG } from "@/configs/api";
import { FaTimes, FaDatabase } from "react-icons/fa";
import Loading from "@/components/Loading";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PerformanceBar = ({ percentage, color }) => (
  <div className="w-full bg-slate-800 rounded-full h-4 relative overflow-hidden group">
    <div 
      className={`h-full rounded-full transition-all duration-1000 ease-out shadow-2xl ${color}`} 
      style={{ width: `${percentage}%` }}
    />
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-black text-white drop-shadow-md">{Math.round(percentage)}% ACHIEVEMENT</span>
    </div>
  </div>
);

export default function StaffPerformance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [staffData, setStaffData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const years = ["2024", "2025", "2026", "2027"];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchPerformance = async () => {
      setIsLoading(true);
      try {
        const endpoints = [];
        if (filterRole === "all") {
          endpoints.push(
            { role: "sm", endpoint: API_CONFIG.ENDPOINTS.HR.PERFORMANCE.SM },
            { role: "bdm", endpoint: API_CONFIG.ENDPOINTS.HR.PERFORMANCE.BDM },
            { role: "bd", endpoint: API_CONFIG.ENDPOINTS.HR.PERFORMANCE.BD },
            { role: "tl", endpoint: API_CONFIG.ENDPOINTS.HR.PERFORMANCE.TL }
          );
        } else {
          const roleEndpoint = API_CONFIG.ENDPOINTS.HR.PERFORMANCE[filterRole.toUpperCase()];
          if (roleEndpoint) {
            endpoints.push({ role: filterRole.toLowerCase(), endpoint: roleEndpoint });
          }
        }

        const responses = await Promise.all(
          endpoints.map(ep => 
            axios.get(`${apiUrl(ep.endpoint)}?year=${selectedYear}`, { withCredentials: true })
          )
        );

        const results = responses.map(res => res.data);

        const currentMonth = new Date().toLocaleString('en-US', { month: 'long' }).toLowerCase();
        let allData = [];
        
        results.forEach((res) => {
          if (res.success) {
            const mapped = (res.data || []).map(item => {
              const staff = item.staff || {};
              const performance = item.yearlyPerformance || {};
              const monthData = performance[currentMonth] || {};
              
              return {
                id: staff._id || Math.random().toString(),
                name: `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'Unknown Staff',
                role: (staff.role || 'STAFF').toUpperCase(),
                region: staff.region || staff.state || 'Global',
                kpi: Math.round(monthData.achievement || 0),
                trend: 0, 
                metrics: monthData.metrics || {},
                yearlyPerformance: performance // Store whole performance for modal
              };
            });
            allData = [...allData, ...mapped];
          }
        });

        setStaffData(allData);
      } catch (error) {
        toast.error("Failed to load performance data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformance();
  }, [filterRole, selectedYear]);

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

  const filteredStaff = staffData.filter(s => {
    const staffName = s.name || s.fullName || "";
    const staffRegion = s.region || s.state || "";
    return (
      staffName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      staffRegion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, selectedYear]);

  if (isLoading && staffData.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <ToastContainer theme="dark" />
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tighter">
            <span className="text-gray-950 dark:text-white">Staff</span> <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent underline decoration-emerald-500/20 underline-offset-8">Metric</span>
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
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-6 h-14 bg-slate-900 border-2 border-slate-800 rounded-2xl text-slate-300 font-bold focus:outline-none focus:border-blue-500 transition-all shadow-xl"
            >
                {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
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
          <div className="col-span-full py-20 text-center bg-slate-900 border-2 border-slate-800 rounded-[2.5rem]">
            <Loading fullPage={false} />
            <p className="text-slate-400 font-bold uppercase tracking-widest mt-8">Loading Personnel Data...</p>
          </div>
        ) : currentStaff.length > 0 ? (
          currentStaff.map((staff) => (
          <div key={staff.id} className="p-8 rounded-[2.5rem] bg-slate-900 border-2 border-slate-800 hover:border-blue-500/30 transition-all duration-500 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {getRoleIcon(staff.role)}
            </div>
            
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-2xl font-black text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
                  {(staff.name || staff.fullName || "UN").split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{staff.name || staff.fullName}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-3 py-1 rounded-lg bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-600/20">{staff.role}</span>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{staff.region || staff.state}</span>
                  </div>
                </div>
              </div>
              
              <div className={`flex flex-col items-end ${(staff.trend || 0) > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                <div className="flex items-center gap-2">
                    {(staff.trend || 0) > 0 ? <FaArrowUp /> : <FaArrowDown />}
                    <span className="text-xl font-black">{Math.abs(staff.trend || 0)}%</span>
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
                <button 
                  onClick={() => setSelectedStaff(staff)}
                  className="px-6 py-3 rounded-xl bg-slate-950 text-slate-300 font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                >
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

      {/* Pagination UI */}
      {filteredStaff.length > itemsPerPage && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 py-8 mt-4 border-t border-slate-800/50">
          <p className="text-sm font-bold text-slate-500">
            Showing <span className="text-slate-300 font-black">{indexOfFirstItem + 1}</span> to{" "}
            <span className="text-slate-300 font-black">{Math.min(indexOfLastItem, filteredStaff.length)}</span> of{" "}
            <span className="text-slate-300 font-black">{filteredStaff.length}</span> staff members
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-12 h-12 rounded-2xl border-2 border-slate-800 text-slate-500 hover:border-blue-500 hover:text-blue-500 disabled:opacity-20 disabled:hover:border-slate-800 disabled:hover:text-slate-500 transition-all bg-slate-900 flex items-center justify-center shadow-xl group"
              title="Previous Page"
            >
              <FaChevronLeft className="text-sm group-active:-translate-x-1 transition-transform" />
            </button>
            
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`w-12 h-12 rounded-2xl font-black text-sm transition-all duration-300 ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] scale-110 border-2 border-blue-400"
                      : "bg-slate-900 border-2 border-slate-800 text-slate-500 hover:border-blue-500/50 hover:text-blue-400"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-12 h-12 rounded-2xl border-2 border-slate-800 text-slate-500 hover:border-blue-500 hover:text-blue-500 disabled:opacity-20 disabled:hover:border-slate-800 disabled:hover:text-slate-500 transition-all bg-slate-900 flex items-center justify-center shadow-xl group"
              title="Next Page"
            >
              <FaChevronRight className="text-sm group-active:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Detailed Modal using Portal */}
      {isMounted && selectedStaff && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="bg-slate-950 border-2 border-slate-800 rounded-[3rem] w-full max-w-6xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button 
              onClick={() => setSelectedStaff(null)}
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/50 transition-all z-10"
            >
              <FaTimes />
            </button>

            <div className="p-10 md:p-16 text-left">
              <div className="flex flex-col md:flex-row gap-12">
                {/* Left Side: Stats */}
                <div className="flex-1 space-y-8">
                  <div className="space-y-4 text-left">
                    <span className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-[0.2em]">Personnel Profile</span>
                    <h2 className="text-5xl font-black text-white tracking-tighter text-left">{selectedStaff.name}</h2>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500 font-bold uppercase tracking-widest">{selectedStaff.role}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                      <span className="text-slate-500 font-bold uppercase tracking-widest">{selectedStaff.region}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedStaff.metrics).map(([key, val]) => (
                      <div key={key} className="p-6 rounded-2xl bg-slate-900 border border-slate-800/50 text-left">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-2xl font-black text-white">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side: Chart */}
                <div className="flex-1 bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] p-8 md:p-12">
                  <div className="h-full flex flex-col items-start justify-start text-left">
                    <div className="mb-0 text-left">
                      <h3 className="text-2xl font-black text-white tracking-tight italic flex items-center gap-3">
                         <div className="w-2 h-8 bg-blue-500 rounded-full" />
                         Performance Analytics
                      </h3>
                      <p className="text-slate-500 text-sm font-medium mt-1">Monthly KPI achievement distribution for {selectedYear}</p>
                    </div>
                    
                    <div className="flex-1 min-h-[400px] w-full mt-5">
                      <Bar 
                        data={{
                          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                          datasets: [{
                            label: 'Achievement %',
                            data: [
                              Math.round(selectedStaff.yearlyPerformance?.january?.achievement || 0),
                              Math.round(selectedStaff.yearlyPerformance?.february?.achievement || 0),
                              Math.round(selectedStaff.yearlyPerformance?.march?.achievement || 0),
                              Math.round(selectedStaff.yearlyPerformance?.april?.achievement || 0),
                              Math.round(selectedStaff.yearlyPerformance?.may?.achievement || 0),
                              Math.round(selectedStaff.yearlyPerformance?.june?.achievement || 0),
                              Math.round(selectedStaff.yearlyPerformance?.july?.achievement || 0),
                              Math.round(selectedStaff.yearlyPerformance?.august?.achievement || 0),
                              Math.round(selectedStaff.yearlyPerformance?.september?.achievement || 0),
                              Math.round(selectedStaff.yearlyPerformance?.october?.achievement || 0),
                              Math.round(selectedStaff.yearlyPerformance?.november?.achievement || 0),
                              Math.round(selectedStaff.yearlyPerformance?.december?.achievement || 0),
                            ],
                            backgroundColor: 'rgba(59, 130, 246, 0.5)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 2,
                            borderRadius: 8,
                            hoverBackgroundColor: 'rgba(59, 130, 246, 0.8)',
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: '#0f172a',
                              titleFont: { size: 14, weight: 'bold' },
                              bodyFont: { size: 12 },
                              padding: 12,
                              displayColors: false,
                              callbacks: {
                                label: (ctx) => `${ctx.raw}% ACHIEVEMENT`
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100,
                              grid: { color: 'rgba(255, 255, 255, 0.05)' },
                              ticks: { color: '#64748b', font: { weight: 'bold' } }
                            },
                            x: {
                              grid: { display: false },
                              ticks: { color: '#64748b', font: { weight: 'bold' } }
                            }
                          }
                        }}
                      />
                    </div>
                    
                    <div className="mt-8 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-left">
                      <p className="text-xs text-slate-400 leading-relaxed italic">
                        Data is aggregated monthly from field operations. Achievement scores reflect performance against weighted quota targets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

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

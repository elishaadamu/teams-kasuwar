"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaChartBar, FaUserTie, FaUserShield, FaUserEdit, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { FaTimes, FaDatabase, FaChartLine, FaSpinner } from "react-icons/fa";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";


export default function StaffPerformance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [staffData, setStaffData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  const { userData } = useAppContext();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 1024 ? 5 : 10);
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Personal Performance Report State
  const [reportLoading, setReportLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [initialSummary, setInitialSummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [personalSelectedYear, setPersonalSelectedYear] = useState(new Date().getFullYear());

  const fetchPerformanceReport = async () => {
    if (!userData?.id) return;

    const endpoint = API_CONFIG.ENDPOINTS.REPORTS.TEAM_PERFORMANCE;
    setReportLoading(true);
    setPerformanceData(null);
    try {
      const response = await axios.get(apiUrl(endpoint), {
        params: {
          month: selectedMonth,
          year: personalSelectedYear
        },
        withCredentials: true
      });
      console.log("Personal Performance Report Response:", response.data);
      setPerformanceData(response.data?.report || response.data?.summary || response.data?.data || null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch performance report");
    } finally {
      setReportLoading(false);
    }
  };

  const years = ["2024", "2025", "2026", "2027"];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchPerformance = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${apiUrl(API_CONFIG.ENDPOINTS.REPORTS.TEAM_PERFORMANCE)}?year=${selectedYear}`, { withCredentials: true });
        console.log("Team Performance List Response:", response.data);
        const res = response.data;

        let allData = [];

        if (res.success) {
          setInitialSummary(res.summary);

          // Map BDMs
          const bdmMembers = (res.bdms || []).map(bdm => {
            const bds = bdm.bds || [];
            const totalAgents = bds.reduce((sum, bd) => sum + (bd.agentsCount || 0), 0);
            const totalVendors = bds.reduce((sum, bd) => sum + (bd.vendorsCount || 0), 0);
            const bdCount = bds.length;

            return {
              id: bdm.staffId || Math.random().toString(),
              name: bdm.name || 'Unknown Staff',
              email: bdm.email || '',
              role: 'BDM',
              region: '',
              bdCount,
              totalAgents,
              totalVendors,
              bds,
              kpi: 0,
              trend: 0,
              metrics: { vendorsCount: totalVendors, agentsCount: totalAgents },
              yearlyPerformance: {}
            };
          });

          // Map SMs
          const smMembers = (res.sms || []).map(sm => {
            return {
              id: sm.staffId || Math.random().toString(),
              name: sm.name || 'Unknown Staff',
              email: sm.email || '',
              role: 'SM',
              region: '',
              bdCount: 0,
              totalAgents: 0,
              totalVendors: 0,
              bds: [],
              kpi: 0,
              trend: 0,
              metrics: {},
              yearlyPerformance: {}
            };
          });

          allData = [...bdmMembers, ...smMembers];
        }

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
    switch (role) {
      case "SM": return <FaUserTie className="text-blue-400" />;
      case "BDM": return <FaUserShield className="text-indigo-400" />;
      case "BD": return <FaUserEdit className="text-violet-400" />;
      default: return <FaChartBar className="text-slate-400" />;
    }
  };

  const filteredStaff = staffData.filter(s => {
    const staffName = s.name || s.fullName || "";
    const staffRegion = s.region || s.state || "";
    const matchesSearch = staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffRegion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || s.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, selectedYear]);

  if (isLoading && staffData.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <ToastContainer theme="dark" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tighter">
            <span className="text-gray-950 dark:text-white">State Manager</span> <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent underline decoration-emerald-500/20 underline-offset-8">Metric</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg">
            Individual performance tracking based on real-time KPI data.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
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
            <option value="all">All Management</option>
            <option value="SM">SM Only</option>
            <option value="BDM">BDM Only</option>
          </select>
        </div>
      </div>

      {(userData?.role?.toLowerCase() === 'bdm' || userData?.role?.toLowerCase() === 'tl' || userData?.role?.toLowerCase() === 'sm') && (
        <section className="bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-800 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32 rounded-full" />

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-10 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <FaChartLine className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight italic">My Growth Metrics</h2>
              </div>
              <p className="text-slate-500 text-sm font-medium">Analyze your personal performance impact for the selected period.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-6 h-12 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-bold focus:outline-none focus:border-blue-500 transition-all text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>

              <select
                value={personalSelectedYear}
                onChange={(e) => setPersonalSelectedYear(Number(e.target.value))}
                className="px-6 h-12 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-bold focus:outline-none focus:border-blue-500 transition-all text-sm"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <button
                onClick={fetchPerformanceReport}
                disabled={reportLoading}
                className="px-8 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-900/20"
              >
                {reportLoading ? <FaSpinner className="animate-spin text-sm" /> : "Fetch Analysis"}
              </button>
            </div>
          </div>

          {reportLoading ? (
            <div className="py-20 text-center">
              <Loading fullPage={false} />
              <p className="mt-8 text-slate-500 font-black uppercase tracking-[0.2em] animate-pulse">Processing Analysis Data...</p>
            </div>
          ) : performanceData || initialSummary ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 animate-fade-in">
              <div className="p-8 rounded-3xl bg-slate-950/50 border border-slate-800 hover:border-blue-500/30 transition-all group">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 group-hover:text-blue-400 transition-colors">Total BDMs</p>
                <div className="flex items-end justify-between">
                  <h4 className="text-4xl font-black text-white tracking-tighter">{(performanceData || initialSummary)?.totalBDMs || 0}</h4>
                  <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <FaChartLine className="text-blue-500/20" />
                  </div>
                </div>
              </div>
              <div className="p-8 rounded-3xl bg-slate-950/50 border border-slate-800 hover:border-emerald-500/30 transition-all group">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 group-hover:text-emerald-400 transition-colors">Total SMs</p>
                <div className="flex items-end justify-between">
                  <h4 className="text-4xl font-black text-white tracking-tighter">{(performanceData || initialSummary)?.totalSMs || 0}</h4>
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <FaChartLine className="text-emerald-500/20" />
                  </div>
                </div>
              </div>
              <div className="p-8 rounded-3xl bg-slate-950/50 border border-slate-800 hover:border-purple-500/30 transition-all group">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 group-hover:text-purple-400 transition-colors">Active Vendors</p>
                <div className="flex items-end justify-between">
                  <h4 className="text-4xl font-black text-white tracking-tighter">{(performanceData || initialSummary)?.activeVendors || 0}</h4>
                  <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <FaChartLine className="text-purple-500/20" />
                  </div>
                </div>
              </div>
              <div className="p-8 rounded-3xl bg-slate-950/50 border border-slate-800 hover:border-amber-500/30 transition-all group">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 group-hover:text-amber-400 transition-colors">Total Revenue</p>
                <div className="flex items-end justify-between">
                  <h4 className="text-4xl font-black text-white tracking-tighter">₦{((performanceData || initialSummary)?.commissions || 0).toLocaleString()}</h4>
                  <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
                    <FaChartLine className="text-amber-500/20" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center border-4 border-dashed border-slate-800/30 rounded-[2rem] bg-slate-950/20">
              <div className="bg-slate-900 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-slate-800 rotate-12 group-hover:rotate-0 transition-transform">
                <FaChartLine className="text-slate-700 text-3xl" />
              </div>
              <h3 className="text-lg font-bold text-slate-400 mb-2">Ready for analysis?</h3>
              <p className="text-slate-600 text-sm font-medium">Select your timeline and click 'Fetch Analysis' to see your metrics.</p>
            </div>
          )}
        </section>
      )}

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

              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-2xl font-black text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
                    {(staff.name || "UN").split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{staff.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="px-3 py-1 rounded-lg bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-600/20">{staff.role}</span>
                    </div>
                    {staff.email && (
                      <p className="text-slate-500 text-xs mt-1.5 font-medium">{staff.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center bg-slate-950 p-4 rounded-2xl border border-slate-800/50 hover:border-indigo-500/30 transition-all">
                  <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest">BDs</p>
                  <p className="text-3xl font-black text-indigo-400 tracking-tighter">{staff.bdCount || 0}</p>
                </div>
                <div className="text-center bg-slate-950 p-4 rounded-2xl border border-slate-800/50 hover:border-emerald-500/30 transition-all">
                  <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest">Agents</p>
                  <p className="text-3xl font-black text-emerald-400 tracking-tighter">{staff.totalAgents || 0}</p>
                </div>
                <div className="text-center bg-slate-950 p-4 rounded-2xl border border-slate-800/50 hover:border-amber-500/30 transition-all">
                  <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest">Vendors</p>
                  <p className="text-3xl font-black text-amber-400 tracking-tighter">{staff.totalVendors || 0}</p>
                </div>
              </div>

              {/* BDs List */}
              {staff.bds && staff.bds.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Assigned BDs</p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                    {staff.bds.map((bd) => (
                      <div key={bd.id} className="flex items-center justify-between p-3 bg-slate-950/70 rounded-xl border border-slate-800/30 hover:border-slate-700 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xs font-black text-violet-400">
                            {(bd.name || "?").split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-300">{bd.name}</p>
                            <p className="text-[10px] text-slate-600 font-medium">{bd.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-600 uppercase">Agents</p>
                            <p className="text-sm font-black text-emerald-400">{bd.agentsCount || 0}</p>
                          </div>
                          <div className="w-px h-6 bg-slate-800" />
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-600 uppercase">Vendors</p>
                            <p className="text-sm font-black text-amber-400">{bd.vendorsCount || 0}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {staff.bds && staff.bds.length === 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <div className="text-center py-6 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800/50">
                    <p className="text-slate-600 text-sm font-medium">No BDs assigned yet</p>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedStaff(staff)}
                  className="px-6 py-3 rounded-xl bg-slate-950 text-slate-300 font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                >
                  Detailed Report
                </button>
              </div>
            </div>
          ))
        ) : null}
      </div>

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
                  className={`w-12 h-12 rounded-2xl font-black text-sm transition-all duration-300 ${currentPage === i + 1
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

      {isMounted && selectedStaff && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="bg-slate-950 border-2 border-slate-800 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setSelectedStaff(null)}
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/50 transition-all z-10"
            >
              <FaTimes />
            </button>

            <div className="p-10 md:p-16 text-left">
              {/* Profile Header */}
              <div className="space-y-4 mb-10">
                <span className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-[0.2em]">Personnel Profile</span>
                <h2 className="text-5xl font-black text-white tracking-tighter">{selectedStaff.name}</h2>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">{selectedStaff.role}</span>
                  {selectedStaff.email && (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                      <span className="text-slate-500 font-medium text-sm">{selectedStaff.email}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/50 text-center hover:border-indigo-500/30 transition-all">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Total BDs</p>
                  <p className="text-4xl font-black text-indigo-400 tracking-tighter">{selectedStaff.bdCount || 0}</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/50 text-center hover:border-emerald-500/30 transition-all">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Total Agents</p>
                  <p className="text-4xl font-black text-emerald-400 tracking-tighter">{selectedStaff.totalAgents || 0}</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/50 text-center hover:border-amber-500/30 transition-all">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Total Vendors</p>
                  <p className="text-4xl font-black text-amber-400 tracking-tighter">{selectedStaff.totalVendors || 0}</p>
                </div>
              </div>

              {/* BDs Roster */}
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-[2rem] p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-white tracking-tight italic flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-500 rounded-full" />
                    BDs Roster
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">All business developers assigned to {selectedStaff.name}</p>
                </div>

                {selectedStaff.bds && selectedStaff.bds.length > 0 ? (
                  <div className="space-y-3">
                    {selectedStaff.bds.map((bd, idx) => (
                      <div key={bd.id} className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800/30 hover:border-slate-700 transition-all group/bd">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-sm font-black text-violet-400">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-base font-bold text-slate-200 group-hover/bd:text-white transition-colors">{bd.name}</p>
                            <p className="text-xs text-slate-600 font-medium">{bd.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-wider">Agents</p>
                            <p className="text-lg font-black text-emerald-400">{bd.agentsCount || 0}</p>
                          </div>
                          <div className="w-px h-8 bg-slate-800" />
                          <div className="text-center">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-wider">Vendors</p>
                            <p className="text-lg font-black text-amber-400">{bd.vendorsCount || 0}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-800/50 rounded-2xl">
                    <FaDatabase className="text-slate-800 text-4xl mx-auto mb-4" />
                    <p className="text-slate-600 font-bold">No BDs assigned to this {selectedStaff.role}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-left">
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  Data reflects current team structure for {selectedYear}. Agent and vendor counts are based on active assignments.
                </p>
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

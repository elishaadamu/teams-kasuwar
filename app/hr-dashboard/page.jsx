"use client";
import React, { useState, useEffect } from "react";
import {
  FaGlobeAfrica,
  FaUserFriends,
  FaStore,
  FaTruckLoading,
  FaBiking,
  FaUserTie,
  FaUserEdit,
  FaUserShield,
  FaArrowRight,
  FaUsers,
  FaUserPlus,
  FaIdCard,
  FaFileInvoice,
  FaChartBar,
  FaSearch,
  FaEllipsisV,
  FaUserCircle,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import Loading from "@/components/Loading";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { apiUrl, API_CONFIG } from "@/configs/api";
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
import { Bar } from 'react-chartjs-2';

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

const StatCard = ({ title, value, icon: Icon, color, subValue, trend }) => (
  <div className={`relative overflow-hidden p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}>
    <div className={`absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full opacity-10 blur-3xl pointer-events-none transition-all duration-500 group-hover:scale-150 ${color}`} />
    <div className="flex items-center justify-between mb-4">
      <div className={`p-4 rounded-2xl ${color.replace('bg-', 'bg-')}/10 shadow-lg border border-white/5`}>
        <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${trend > 0 ? "text-emerald-500" : "text-rose-500"}`}>
          {trend > 0 ? "+" : ""}{trend}%
        </span>
      )}
    </div>
    <div className="flex flex-col space-y-1">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</h3>
      <p className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</p>
      {subValue && <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">{subValue}</span>}
    </div>
  </div>
);

const PerformanceBar = ({ percentage, color }) => (
  <div className="w-full bg-slate-100 rounded-full h-3 relative overflow-hidden group">
    <div
      className={`h-full rounded-full transition-all duration-1000 ease-out shadow-2xl ${color}`}
      style={{ width: `${percentage}%` }}
    />
    <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[9px] font-black text-slate-500">{Math.round(percentage)}%</span>
    </div>
  </div>
);

const calculateTargetKPI = (role, metrics) => {
  const r = role.toLowerCase();
  const m = metrics || {};
  const stats = m.metrics || m; // Handle both nested metrics and direct metrics
  
  const vTarget = { 'rm': 130000, 'tl': 13000, 'bdm': 2500, 'bd': 250 };
  const sTarget = { 'rm': 40000, 'tl': 4000, 'sm': 250 };
  const dTarget = { 'rm': 40000, 'tl': 4000, 'sm': 250 };

  if (r === 'rm' || r === 'regional-leader' || r === 'regional manager' || r === 'rm') {
    const v = (stats.vendorsCount || 0) / vTarget['rm'];
    const s = (stats.salesCount || 0) / sTarget['rm'];
    const d = (stats.deliveryCount || 0) / dTarget['rm'];
    return Math.min(100, ((v + s + d) / 3) * 100);
  }
  
  if (r === 'tl' || r === 'team-lead' || r === 'state-manager' || r === 'state manager') {
    const v = (stats.vendorsCount || 0) / vTarget['tl'];
    const s = (stats.salesCount || 0) / sTarget['tl'];
    const d = (stats.deliveryCount || 0) / dTarget['tl'];
    return Math.min(100, ((v + s + d) / 3) * 100);
  }
  
  if (r === 'bdm') {
    return Math.min(100, ((stats.vendorsCount || 0) / vTarget['bdm']) * 100);
  }
  
  if (r === 'bd') {
    return Math.min(100, ((stats.vendorsCount || 0) / vTarget['bd']) * 100);
  }
  
  if (r === 'sm' || r === 'sales manager') {
    const s = (stats.salesCount || 0) / sTarget['sm'];
    const d = (stats.deliveryCount || 0) / dTarget['sm'];
    return Math.min(100, ((s + d) / 2) * 100);
  }
  
  return m.achievement || 0;
};

export default function HRDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRegions: 6,
    totalTeams: 24,
    totalVendors: 142,
    totalDeliveryRequests: 1205,
    totalDeliveryMen: 45,
    totalSM: 12,
    totalBDM: 8,
    totalBD: 32,
    totalAgents: 156,
    totalStaff: 0
  });
  const [recentStaff, setRecentStaff] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const staffCategories = [
    { title: "Business Dev. Managers", role: "BDM", count: stats.totalBDM, icon: FaUserShield, link: "/hr-dashboard/staff" },
    { title: "Sales Managers", role: "SM", count: stats.totalSM, icon: FaUserTie, link: "/hr-dashboard/staff" },
    { title: "Business Developers", role: "BD", count: stats.totalBD, icon: FaUserEdit, link: "/hr-dashboard/staff" },
    { title: "Team Leaders", role: "TL", count: 4, icon: FaUserFriends, link: "/hr-dashboard/staff" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch staff list
        const staffResp = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.HR.GET_STAFF), { withCredentials: true });
        if (staffResp.data.success) {
          const staffList = staffResp.data.data || staffResp.data.staff || [];
          setStats(prev => ({ ...prev, totalStaff: staffList.length }));
          setRecentStaff(staffList.slice(0, 5));
        }

        // Fetch performance data
        const endpoints = [
          API_CONFIG.ENDPOINTS.HR.PERFORMANCE.SM,
          API_CONFIG.ENDPOINTS.HR.PERFORMANCE.BDM,
          API_CONFIG.ENDPOINTS.HR.PERFORMANCE.BD
        ];
        
        const currentMonth = new Date().toLocaleString('en-US', { month: 'long' }).toLowerCase();
        let allPerformance = [];

        const results = await Promise.all(
          endpoints.map(ep => axios.get(`${apiUrl(ep)}?year=2026`, { withCredentials: true }))
        );

        results.forEach((res) => {
          if (res.data.success) {
            const mapped = (res.data.data || []).map(item => {
              const staff = item.staff || {};
              const performance = item.yearlyPerformance || {};
              const monthData = performance[currentMonth] || {};

              return {
                id: staff._id || Math.random().toString(),
                name: `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'Unknown Staff',
                role: (staff.role || 'STAFF').toUpperCase(),
                region: staff.region || staff.state || 'Global',
                kpi: Math.round(calculateTargetKPI(staff.role || 'STAFF', monthData)),
                trend: 0,
              };
            });
            allPerformance = [...allPerformance, ...mapped];
          }
        });

        // Sort by KPI and take top 2
        allPerformance.sort((a, b) => b.kpi - a.kpi);
        setPerformanceData(allPerformance.slice(0, 2));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  const getPerformanceChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const last6Months = months.slice(Math.max(0, currentMonthIndex - 5), currentMonthIndex + 1);

    return {
      labels: last6Months,
      datasets: performanceData.map((perf, index) => ({
        label: perf.name,
        data: last6Months.map(() => perf.kpi * (0.8 + Math.random() * 0.4)),
        backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.7)' : 'rgba(16, 185, 129, 0.7)',
        borderColor: index === 0 ? 'rgb(59, 130, 246)' : 'rgb(16, 185, 129)',
        borderWidth: 2,
        borderRadius: 8,
      }))
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#64748b', font: { size: 11 } } },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 10 } }
      }
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-10 animate-fade-in transition-colors duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            HR <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl text-lg">
            Real-time personnel management and performance tracking for the entire team.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => router.push('/hr-dashboard/payslips')}
            className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold text-sm tracking-wide transition-all hover:bg-slate-100 dark:hover:bg-slate-700 shadow-md dark:shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2"
          >
            <FaFileInvoice className="w-4 h-4" />
            Payslips
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/hr-dashboard/onboarding"
          className="group p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex items-center gap-5"
        >
          <div className="p-4 rounded-2xl bg-white/20 group-hover:bg-white/30 transition-colors">
            <FaUserPlus className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider">Create Staff</h3>
            <p className="text-sm opacity-80">Onboard new personnel</p>
          </div>
        </Link>

        <Link
          href="/hr-dashboard/id-cards"
          className="group p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-600/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex items-center gap-5"
        >
          <div className="p-4 rounded-2xl bg-white/20 group-hover:bg-white/30 transition-colors">
            <FaIdCard className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider">ID Cards</h3>
            <p className="text-sm opacity-80">Generate staff IDs</p>
          </div>
        </Link>

        <Link
          href="/hr-dashboard/staff"
          className="group p-6 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-800 dark:to-slate-950 text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex items-center gap-5"
        >
          <div className="p-4 rounded-2xl bg-white/20 group-hover:bg-white/30 transition-colors">
            <FaUsers className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider">Manage Staff</h3>
            <p className="text-sm opacity-80">Update & Terminate</p>
          </div>
        </Link>

        <Link
          href="/hr-dashboard/payslips"
          className="group p-6 rounded-3xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-xl shadow-violet-600/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex items-center gap-5"
        >
          <div className="p-4 rounded-2xl bg-white/20 group-hover:bg-white/30 transition-colors">
            <FaFileInvoice className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider">Payslips</h3>
            <p className="text-sm opacity-80">Payroll and Salaries</p>
          </div>
        </Link>
      </div>

      {/* Stats Grid
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Staff" value={stats.totalStaff} icon={FaUsers} color="bg-blue-500" subValue="Active personnel" trend={12} />
        <StatCard title="Sales Managers (SM)" value={stats.totalSM} icon={FaUserTie} color="bg-indigo-600" />
        <StatCard title="BD Managers (BDM)" value={stats.totalBDM} icon={FaUserShield} color="bg-blue-700" />
        <StatCard title="Business Dev. (BD)" value={stats.totalBD} icon={FaUserEdit} color="bg-violet-600" />
      </div> */}

      {/* Performance Chart Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <FaChartBar className="text-blue-500" />
          Top <span className="text-blue-500">Performers</span>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-blue-500/30 to-transparent" />
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Cards */}
          <div className="lg:col-span-1 space-y-4">
            {performanceData.map((perf, index) => (
              <div key={perf.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-black text-blue-500">
                      {perf.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{perf.name}</h3>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">{perf.role} • {perf.region}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${(perf.trend || 0) > 0 ? "text-emerald-400" : "text-amber-400"}`}>
                    {perf.kpi >= 60 ? <FaArrowUp /> : <FaArrowDown />}
                    <span className="text-sm font-black">{perf.kpi}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">KPI Achievement</span>
                    <span className={`font-bold ${perf.kpi >= 80 ? "text-emerald-500" : perf.kpi >= 60 ? "text-blue-500" : "text-amber-500"}`}>{perf.kpi}%</span>
                  </div>
                  <PerformanceBar percentage={perf.kpi} color={`bg-gradient-to-r ${getStatusColor(perf.kpi)}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">6-Month Performance Trend</h3>
            <div className="h-64">
              {performanceData.length > 0 ? (
                <Bar data={getPerformanceChartData()} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  No performance data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Onboarding Staff Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <FaUserPlus className="text-indigo-500" />
            Recent <span className="text-indigo-500">Onboarding</span>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-indigo-500/30 to-transparent" />
          </h2>
          <Link
            href="/hr-dashboard/onboarding"
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-all"
          >
            View All
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Staff Member</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Role</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Contact</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12">
                      <Loading fullPage={false} />
                    </td>
                  </tr>
                ) : recentStaff.length > 0 ? (
                  recentStaff.map((staff) => (
                    <tr key={staff._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 group-hover:border-indigo-500/50 transition-colors shadow-sm">
                            {staff.passportPhoto ? (
                              <img src={staff.passportPhoto} alt={staff.firstName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"><FaUserCircle className="text-2xl" /></div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white capitalize">{staff.firstName} {staff.lastName}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID: {staff.idCardId || "Pending"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          {staff.role === 'sm' ? 'Sales Manager' : staff.role === 'bdm' ? 'Business Dev. Manager' : staff.role === 'bd' ? 'Business Developer' : staff.role}
                        </span>
                      </td>
                      <td className="px-6 py-5 space-y-1">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <span className="text-xs font-semibold">{staff.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <span className="text-xs font-semibold">{staff.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all">
                          <FaEllipsisV />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FaUserCircle className="text-4xl text-slate-300" />
                        <p className="text-slate-500 font-bold">No recent staff found</p>
                      </div>
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
      `}</style>
    </div>
  );
}

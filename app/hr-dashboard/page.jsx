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
  FaUsers
} from "react-icons/fa";
import Link from "next/link";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";

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

export default function HRDashboard() {
  const [stats, setStats] = useState({
    totalRegions: 6,
    totalTeams: 24,
    totalVendors: 142,
    totalDeliveryRequests: 1205,
    totalDeliveryMen: 45,
    totalSM: 12,
    totalBDM: 8,
    totalBD: 32,
    totalAgents: 156
  });

  const staffCategories = [
    { title: "Business Dev. Managers", role: "BDM", count: stats.totalBDM, icon: FaUserShield, link: "/hr-dashboard/staff?role=bdm" },
    { title: "Sales Managers", role: "SM", count: stats.totalSM, icon: FaUserTie, link: "/hr-dashboard/staff?role=sm" },
    { title: "Business Developers", role: "BD", count: stats.totalBD, icon: FaUserEdit, link: "/hr-dashboard/staff?role=bd" },
    { title: "Team Leaders", role: "TL", count: 4, icon: FaUserFriends, link: "/hr-dashboard/staff?role=tl" },
  ];

  return (
    <div className="space-y-10 animate-fade-in transition-colors duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            System <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Overview</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl text-lg">
            Real-time analytics and personnel management for the entire Kasuwar ecosystem.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-bold text-sm tracking-wide transition-all hover:bg-slate-100 dark:hover:bg-slate-700 shadow-md dark:shadow-xl border border-slate-200 dark:border-slate-700">
            Export Data
          </button>
          <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm tracking-wide transition-all hover:bg-blue-500 hover:shadow-blue-600/20 shadow-lg dark:shadow-2xl">
            Recent Logs
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard title="Total Regions" value={stats.totalRegions} icon={FaGlobeAfrica} color="bg-blue-500" subValue="Across Nigeria" />
        <StatCard title="Total Teams" value={stats.totalTeams} icon={FaUserFriends} color="bg-indigo-500" subValue="Active field units" />
        <StatCard title="Total Vendors" value={stats.totalVendors} icon={FaStore} color="bg-violet-500" subValue="Signed merchants" />
        <StatCard title="Delivery Requests" value={stats.totalDeliveryRequests} icon={FaTruckLoading} color="bg-blue-400" trend={12} />
        <StatCard title="Delivery Men" value={stats.totalDeliveryMen} icon={FaBiking} color="bg-sky-500" subValue="Fleet size" />
        <StatCard title="Sales Managers (SM)" value={stats.totalSM} icon={FaUserTie} color="bg-indigo-600" />
        <StatCard title="BD Managers (BDM)" value={stats.totalBDM} icon={FaUserShield} color="bg-blue-700" />
        <StatCard title="Business Dev. (BD)" value={stats.totalBD} icon={FaUserEdit} color="bg-violet-600" />
        <StatCard title="Total Agents" value={stats.totalAgents} icon={FaUsers} color="bg-slate-500" subValue="Excluding high-tier profiles" />
      </div>

      {/* Staff Sectors */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          Staff <span className="text-indigo-500">Taxonomy</span>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-indigo-500/30 to-transparent" />
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {staffCategories.map((staff) => {
            const Icon = staff.icon;
            return (
              <Link 
                key={staff.role}
                href={staff.link}
                className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 shadow-sm dark:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-indigo-600/10 group-hover:bg-indigo-600/20 transition-colors">
                    <Icon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <FaArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:translate-x-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-all" />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{staff.role}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{staff.title}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{staff.count}</span>
                    <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-500 tracking-wider">Members</span>
                  </div>
                </div>
              </Link>
            )
          })}
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

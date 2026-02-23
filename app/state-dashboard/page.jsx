
"use client";
import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { FaSpinner, FaPlus, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

import StateStats from "@/components/state-dashboard/StateStats";
import StateFinancials from "@/components/state-dashboard/StateFinancials";
import PerformanceLists from "@/components/state-dashboard/PerformanceLists";

const DashboardContent = () => {
  const searchParams = useSearchParams();
  const stateId = searchParams.get("id"); // This would be the zoneId or stateId
  const { userData } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  // Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignRole, setAssignRole] = useState("sm");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignForm, setAssignForm] = useState({ email: "", role: "sm", teamId: "" });

  useEffect(() => {
    const fetchData = async () => {
      if (!stateId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get(
          apiUrl(`${API_CONFIG.ENDPOINTS.REGIONAL.GET_DETAILS}${stateId}/details`),
          { withCredentials: true }
        );
        
        if (response.data) {
          setData(response.data.region || response.data.data || response.data);
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        toast.error("Failed to load state dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchData();
    }
  }, [userData, stateId]);

  const handleOpenAssign = (role) => {
    setAssignRole(role);
    setAssignForm({ ...assignForm, role: role, teamId: stateId });
    setShowAssignModal(true);
  };

  const handleAssignMember = async (e) => {
    e.preventDefault();
    setAssignLoading(true);
    try {
      await axios.post(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.ASSIGN_MEMBER), 
        {
          email: assignForm.email,
          role: assignForm.role,
          teamId: stateId
        }, { withCredentials: true });
      toast.success(`${assignForm.role.toUpperCase()} assigned successfully!`);
      setShowAssignModal(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to assign member");
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!stateId) {
     return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
            <h2 className="text-xl font-bold mb-2">No State Selected</h2>
            <p>Please select a state from the regional overview to view its dashboard.</p>
            <Link href="/regional-dashboard" className="mt-4 text-blue-600 hover:underline flex items-center gap-2">
                <FaArrowLeft /> Back to Regional Overview
            </Link>
        </div>
     );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/regional-dashboard" className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
              <FaArrowLeft />
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">{data?.name || "State Team Dashboard"}</h1>
          </div>
          <p className="text-gray-500">
            Performance overview and management for <span className="text-blue-600 font-semibold">{data?.code || "the selected region"}</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => handleOpenAssign("sm")}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <FaPlus className="text-sm" /> Add SM
          </button>
          <button 
             onClick={() => handleOpenAssign("bdm")}
             className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <FaPlus className="text-sm" /> Add BDM
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <section>
        <StateStats 
            stats={data?.metrics || data?.stats || {}} 
            roleBreakdown={data?.roleBreakdown || {}} 
        />
      </section>

      {/* Financials Section */}
      <section>
        <StateFinancials 
            wallet={data?.wallet} 
            commissions={data?.commissions || data?.metrics?.commissions} 
        />
      </section>

      {/* Performance Lists Section */}
      <section>
        <PerformanceLists 
            managers={data?.performanceData || {
                sm: data?.subregions?.filter(s => s.role === 'sm') || [],
                bdm: data?.subregions?.filter(s => s.role === 'bdm') || [],
                bd: data?.subregions?.filter(s => s.role === 'bd') || []
            }} 
        />
      </section>

      {/* Assignment Modal */}
      {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800">Assign New {assignRole.toUpperCase()}</h3>
                      <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                          <FaPlus className="rotate-45" />
                      </button>
                  </div>
                  <form onSubmit={handleAssignMember} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input
                              type="email"
                              required
                              value={assignForm.email}
                              onChange={(e) => setAssignForm({ ...assignForm, email: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="member@example.com"
                          />
                      </div>
                      <button
                          type="submit"
                          disabled={assignLoading}
                          className="w-full mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                          {assignLoading ? "Assigning..." : `Assign ${assignRole.toUpperCase()}`}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

const StateDashboardPage = () => {
  return (
    <Suspense fallback={<div className="flex justify-center p-10"><FaSpinner className="animate-spin text-2xl" /></div>}>
      <DashboardContent />
    </Suspense>
  );
};

export default StateDashboardPage;

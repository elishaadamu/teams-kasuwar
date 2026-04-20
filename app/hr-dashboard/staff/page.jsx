"use client";
import React, { useState, useEffect } from "react";
import { 
  FaUserEdit, FaTrashAlt, FaSearch, FaFilter, FaUserTie, FaUserShield, FaUserPlus, 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaIdCard, FaTimes, FaSave,
  FaArrowLeft, FaExclamationTriangle
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";

const ROLE_LABELS = {
  sm: "Sales Manager",
  bdm: "Business Dev. Manager",
  bd: "Business Developer",
  tl: "Team Leader",
  rm: "Regional Manager",
};

export default function StaffManagement() {
  const router = useRouter();
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [editingStaff, setEditingStaff] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    setIsLoading(true);
    try {
      const resp = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.HR.GET_STAFF), { withCredentials: true });
      setStaffList(resp.data.data || []);
    } catch (err) {
      console.error("Error fetching staff:", err);
      toast.error("Failed to load staff list.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await axios.put(
        apiUrl(API_CONFIG.ENDPOINTS.HR.UPDATE_STAFF),
        {
          staffId: editingStaff._id,
          ...editingStaff
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Staff details updated successfully!");
        setEditingStaff(null);
        fetchStaffList();
      } else {
        toast.error(response.data.message || "Failed to update staff");
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTerminateStaff = async (staffId) => {
    if (!window.confirm("ARE YOU ABSOLUTELY SURE? This will permanently terminate this staff member and revoke all access.")) return;
    
    setIsTerminating(true);
    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.HR.TERMINATE_STAFF),
        { staffId },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Staff terminated successfully.");
        fetchStaffList();
      } else {
        toast.error(response.data.message || "Failed to terminate staff");
      }
    } catch (error) {
      console.error("Termination Error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsTerminating(false);
    }
  };

  const filteredStaff = staffList.filter(staff => {
    const term = searchTerm.toLowerCase();
    const roleMatch = filterRole === "all" || staff.role === filterRole;
    const searchMatch = 
      (staff.firstName?.toLowerCase() || "").includes(term) ||
      (staff.lastName?.toLowerCase() || "").includes(term) ||
      (staff.email?.toLowerCase() || "").includes(term) ||
      (staff.phone || "").includes(term) ||
      (staff.idCardId?.toLowerCase() || "").includes(term);
    
    return roleMatch && searchMatch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  if (isLoading && staffList.length === 0) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in p-4 md:p-8 text-slate-900 dark:text-white transition-colors duration-300">
      <ToastContainer theme="dark" position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="space-y-2">
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors mb-4"
            >
                <FaArrowLeft /> Back to Dashboard
            </button>
          <h1 className="text-4xl font-black tracking-tight">
            Staff <span className="text-blue-600 italic">Management</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-xl">
            Update personnel information, reassing roles, and manage employment status.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search directory..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 h-14 pl-12 pr-6 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:border-blue-500 outline-none shadow-sm transition-all"
            />
          </div>
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="h-14 px-6 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none shadow-sm transition-all"
          >
            <option value="all">All Roles</option>
            {Object.entries(ROLE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500 px-8">Staff Member</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Role</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Operational Area</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500 text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {currentItems.length > 0 ? (
                currentItems.map((staff) => (
                  <tr key={staff._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-5 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center text-lg font-black text-blue-500 shadow-sm overflow-hidden">
                          {staff.passportPhoto ? (
                            <img src={staff.passportPhoto} alt="" className="w-full h-full object-cover" />
                          ) : (staff.firstName?.[0] || staff.lastName?.[0] || "?")}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white capitalize">{staff.firstName} {staff.lastName}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{staff.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {ROLE_LABELS[staff.role] || staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                        <div className="flex flex-col">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{staff.region || "Global Unit"}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-widest font-black">{staff.state || "Unassigned Zone"}</p>
                        </div>
                    </td>
                    <td className="px-6 py-5 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setEditingStaff({...staff})}
                          className="p-3 bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="Edit Personal Info"
                        >
                          <FaUserEdit size={14} />
                        </button>
                        <button 
                          onClick={() => handleTerminateStaff(staff._id)}
                          className="p-3 bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Terminate Employment"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-slate-500 font-bold">
                    No personnel found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <div className="p-8 md:p-12">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                        <FaUserEdit size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">Edit <span className="text-blue-600">Profile</span></h2>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Updating records for {editingStaff.firstName} {editingStaff.lastName}</p>
                    </div>
                </div>
                <button 
                  onClick={() => setEditingStaff(null)} 
                  className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-500 transition-all"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleUpdateStaff} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                  <input 
                    type="text" 
                    value={editingStaff.firstName || ""} 
                    onChange={(e) => setEditingStaff({...editingStaff, firstName: e.target.value})}
                    className="w-full h-14 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
                  <input 
                    type="text" 
                    value={editingStaff.lastName || ""} 
                    onChange={(e) => setEditingStaff({...editingStaff, lastName: e.target.value})}
                    className="w-full h-14 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={editingStaff.email || ""} 
                    onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})}
                    className="w-full h-14 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={editingStaff.phone || ""} 
                    onChange={(e) => setEditingStaff({...editingStaff, phone: e.target.value})}
                    className="w-full h-14 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assigned Role</label>
                  <select 
                    value={editingStaff.role} 
                    onChange={(e) => setEditingStaff({...editingStaff, role: e.target.value})}
                    className="w-full h-14 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                  >
                    {Object.entries(ROLE_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Region / Zone</label>
                  <input 
                    type="text" 
                    value={editingStaff.region || ""} 
                    onChange={(e) => setEditingStaff({...editingStaff, region: e.target.value})}
                    className="w-full h-14 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="md:col-span-2 pt-6 flex flex-col sm:flex-row gap-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <button 
                        type="button"
                        onClick={() => setEditingStaff(null)}
                        className="flex-1 h-16 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={isUpdating}
                        className="flex-[2] h-16 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        {isUpdating ? "Processing..." : <><FaSave /> Save Changes</>}
                    </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}

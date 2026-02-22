"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import { FaUserTie, FaUsers, FaSpinner, FaLayerGroup, FaUserPlus, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

const AssignMemberModal = ({ isOpen, onClose, onAssign, loading, form, setForm, teams, showTeamSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-800">Assign New Member</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={onAssign} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="member@example.com"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                           <option value="agent">Agent</option>
                            <option value="user">User</option>
                            <option value="vendor">Vendor</option>
                            <option value="bd">Business Developer (BD)</option>
                            <option value="bdm">Business Development Manager (BDM)</option>
                            <option value="sm">Sales Manager (SM)</option> 
                        </select>
                    </div>

                    {showTeamSelect && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Team</label>
                            <select
                                value={form.teamId}
                                required
                                onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="">Select Team</option>
                                {teams.map(team => (
                                    <option key={team._id || team.id} value={team._id || team.id}>
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaUserPlus />}
                        {loading ? "Assigning..." : "Assign Member"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const SetTeamLeadModal = ({ isOpen, onClose, onSetLead, loading, form, setForm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-800">Set Team Leader</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={onSetLead} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Leader Email Address</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="leader@example.com"
                        />
                         <p className="text-xs text-gray-500 mt-1">This user will be promoted to Team Leader for the selected team.</p>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaUserTie />}
                        {loading ? "Setting Leader..." : "Set Team Leader"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const MyTeamDashboardView = ({ teamId }) => {
    const { userData } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    
    // Assign Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignLoading, setAssignLoading] = useState(false);
    const [assignForm, setAssignForm] = useState({ email: "", role: "bd", teamId: "" });

    // Set Team Lead Modal State
    const [showSetLeadModal, setShowSetLeadModal] = useState(false);
    const [setLeadLoading, setSetLeadLoading] = useState(false);
    const [setLeadForm, setSetLeadForm] = useState({ email: "", teamId: "" });

    const fetchData = async () => {
        try {
            setLoading(true);
            
            if (teamId) {
                // Team selected: fetch both the teams list (for team info) and the team members
                const [teamsRes, membersRes] = await Promise.all([
                    axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_MY_REGION_TEAMS), { withCredentials: true }),
                    axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_TEAM_MEMBERS + teamId), { withCredentials: true })
                ]);

                console.log("Teams Response:", teamsRes.data);
                console.log("Members Response:", membersRes.data);

                if (teamsRes.data.success) {
                    setDashboardData(teamsRes.data);
                }
                setTeamMembers(membersRes.data?.members || []);
            } else {
                // No team selected: use default dashboard endpoint
                const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_MY_TEAM_DASHBOARD), { withCredentials: true });
                console.log("Dashboard Response:", response.data);
                if (response.data.success) {
                    setDashboardData(response.data);
                }
                setTeamMembers([]);
            }
        } catch (error) {
            console.error("Error fetching team dashboard:", error);
            toast.error(error?.response?.data?.message || "Failed to load team data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userData) {
            fetchData();
        }
    }, [userData, teamId]);

    const handleAssignMember = async (e) => {
        e.preventDefault();
        setAssignLoading(true);
        try {
            const payload = {
                email: assignForm.email,
                role: assignForm.role,
                teamId: assignForm.teamId || dashboardData.team?._id
            };
            console.log(payload);
            await axios.post(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.ASSIGN_MEMBER), payload, { withCredentials: true });
            toast.success("Member assigned successfully!");
            setShowAssignModal(false);
            setAssignForm({ email: "", role: "bd", teamId: "" });
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Assignment error:", error);
            toast.error(error?.response?.data?.message || "Failed to assign member");
        } finally {
            setAssignLoading(false);
        }
    };

    const handleSetTeamLead = async (e) => {
        e.preventDefault();
        setSetLeadLoading(true);
        try {
            const payload = {
                email: setLeadForm.email,
                teamId: setLeadForm.teamId
            };
            
            await axios.put(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.SET_TEAM_LEAD), payload, { withCredentials: true });
            toast.success("Team Leader Set successfully!");
            setShowSetLeadModal(false);
            setSetLeadForm({ email: "", teamId: "" });
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Set Team Lead error:", error);
            toast.error(error?.response?.data?.message || "Failed to set Team Leader");
        } finally {
            setSetLeadLoading(false);
        }
    };

    const openSetLeadModal = (teamId) => {
        setSetLeadForm({ email: "", teamId });
        setShowSetLeadModal(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FaSpinner className="animate-spin text-4xl text-blue-600" />
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
                <FaUsers className="text-6xl mb-4 text-gray-300" />
                <p>No team data found.</p>
            </div>
        );
    }

    // Determine view based on data structure
    // If a specific teamId is provided and the API returned a teams array (regional data),
    // find the selected team from the array
    let selectedTeam = null;
    if (teamId && dashboardData.teams && Array.isArray(dashboardData.teams)) {
        selectedTeam = dashboardData.teams.find(
            (t) => (t._id || t.id) === teamId
        );
    }

    const isRegionalView = !teamId && (
        (dashboardData.teams && Array.isArray(dashboardData.teams)) || 
        (dashboardData.zone && dashboardData.role === 'regional-leader')
    );
    // Team view if: API returned members directly, OR we found a selectedTeam from the regional teams array
    const isTeamView = !!(dashboardData.members && Array.isArray(dashboardData.members)) || !!selectedTeam;
    // If a specific team was selected from the regional data, show it as a single-team detail view
    const isSingleTeamFromRegion = !!selectedTeam;

    // Prepare teams for modal
    const availableTeams = isRegionalView 
        ? (dashboardData.teams || []) 
        : (selectedTeam ? [selectedTeam] : (dashboardData.team ? [dashboardData.team] : []));

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Team Dashboard</h1>
                    <p className="text-gray-500 text-sm">
                        {isSingleTeamFromRegion 
                            ? `Team: ${selectedTeam.name || "Selected Team"}`
                            : `Overview of your ${isRegionalView ? "Region's Teams" : "Team Members"}`
                        }
                    </p>
                </div>
                
                {/* Show assign button if we have teams (Regional) or a specific team (Team Lead) */}
                {(isRegionalView || isTeamView) && (
                    <button 
                        onClick={() => setShowAssignModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 w-fit"
                    >
                        <FaUserPlus className="text-sm" /> Assign Member
                    </button>
                )}
            </div>

            {/* Content: Regional View - Show all teams */}
            {isRegionalView && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {dashboardData.teams?.map((team, index) => (
                             <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
                                 <div className="flex items-center gap-4 mb-4">
                                     <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                                         <FaLayerGroup />
                                     </div>
                                     <div>
                                         <h3 className="font-bold text-gray-800">{team.name || "Unnamed Team"}</h3>
                                          <p className="text-xs text-gray-500 uppercase tracking-wider">{team.code || "No Code"}</p>
                                     </div>
                                 </div>
                                 
                                 <div className="space-y-3">
                                     <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl group">
                                        <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                 <FaUserTie className="text-sm" />
                                             </div>
                                             <div>
                                                 <p className="text-xs text-gray-500">Team Lead</p>
                                                 <p className="text-sm font-semibold text-gray-800">
                                                 {team.teamLeadId?.firstName ? `${team.teamLeadId.firstName} ${team.teamLeadId.lastName}` : "Not Assigned"}
                                             </p>
                                             </div>
                                        </div>
                                         <button 
                                            onClick={() => openSetLeadModal(team._id || team.id)}
                                            className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                                            title="Set Team Leader"
                                         >
                                            Change
                                         </button>
                                     </div>
                                        
                                      <div className="grid grid-cols-2 gap-2 mt-2">
                                         <div className="text-center p-2 bg-blue-50 rounded-lg">
                                             <p className="text-xs text-blue-600">Members</p>
                                             <p className="font-bold text-blue-900">{team.totalMembers || 0}</p>
                                         </div>
                                         <div className="text-center p-2 bg-green-50 rounded-lg">
                                             <p className="text-xs text-green-600">Performance</p>
                                             <p className="font-bold text-green-900">{team.performance || 0}%</p>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         ))}
                    </div>
                    {(!dashboardData.teams || dashboardData.teams.length === 0) && dashboardData.zone && (
                        <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 text-center">
                            <FaLayerGroup className="text-4xl text-blue-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800">{dashboardData.zone.name} Region Overview</h3>
                            <p className="text-gray-500 mt-2">Manage teams and members for the {dashboardData.zone.code} region.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Content: Single Team Detail View (selected from regional teams) */}
            {isSingleTeamFromRegion && (
                <div className="space-y-6">
                    {/* Team Info Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">
                                    <FaLayerGroup />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{selectedTeam.name || "Unnamed Team"}</h2>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">{selectedTeam.code || "No Code"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-center px-4 py-2 bg-blue-50 rounded-xl">
                                    <p className="text-xs text-blue-600">Total Members</p>
                                    <p className="font-bold text-blue-900">{selectedTeam.totalMembers || 0}</p>
                                </div>
                                <div className="text-center px-4 py-2 bg-green-50 rounded-xl">
                                    <p className="text-xs text-green-600">Performance</p>
                                    <p className="font-bold text-green-900">{selectedTeam.performance || 0}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Lead Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Team Leader</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <FaUserTie className="text-lg" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        {selectedTeam.teamLeadId?.firstName 
                                            ? `${selectedTeam.teamLeadId.firstName} ${selectedTeam.teamLeadId.lastName}` 
                                            : "Not Assigned"}
                                    </p>
                                    {selectedTeam.teamLeadId?.email && (
                                        <p className="text-sm text-gray-500">{selectedTeam.teamLeadId.email}</p>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => openSetLeadModal(selectedTeam._id || selectedTeam.id)}
                                className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Set Team Leader"
                            >
                                Change Lead
                            </button>
                        </div>
                    </div>

                    {/* Members Table */}
                    {teamMembers.length > 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-800">Team Members</h3>
                                <p className="text-sm text-gray-500">{teamMembers.length} members in this team</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Member Name</th>
                                            <th className="px-6 py-4 font-semibold">Email</th>
                                            <th className="px-6 py-4 font-semibold">Role</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                            <th className="px-6 py-4 font-semibold">Joined Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {teamMembers.map((member, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                            {member.firstName?.charAt(0) || "U"}
                                                        </div>
                                                        <span className="font-medium text-gray-800">
                                                            {member.firstName} {member.lastName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        (member.isTeamLead || member.role === 'team_lead' || member.email === selectedTeam?.teamLeadId?.email) 
                                                            ? 'bg-indigo-100 text-indigo-700' 
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {(member.isTeamLead || member.role === 'team_lead' || member.email === selectedTeam?.teamLeadId?.email) 
                                                            ? 'Team Lead' 
                                                            : (member.role?.toUpperCase() || 'MEMBER')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        (member.isActive !== false) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {(member.isActive !== false) ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "N/A"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 text-center">
                            <FaUsers className="text-4xl text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-700">No Members Yet</h3>
                            <p className="text-gray-500 mt-2">This team currently has no members listed. Use the "Assign Member" button to add members.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Content: Team View (API returned members directly, e.g. for team leads) */}
            {!isSingleTeamFromRegion && isTeamView && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div>
                             <h2 className="text-lg font-bold text-gray-800">{dashboardData.team?.name || dashboardData.teamName || "My Team"}</h2>
                             {(dashboardData.team?.teamLeadId || dashboardData.team?.teamLead || dashboardData.lead) && (
                                 <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                     <FaUserTie className="text-indigo-500" />
                                     Lead by: <span className="font-medium text-gray-700">
                                        {(dashboardData.team?.teamLeadId?.firstName || dashboardData.team?.teamLead?.firstName || dashboardData.lead?.firstName)} {(dashboardData.team?.teamLeadId?.lastName || dashboardData.team?.teamLead?.lastName || dashboardData.lead?.lastName)}
                                     </span>
                                 </p>
                             )}
                        </div>
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                            {dashboardData.members?.length || 0} Members
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Member Name</th>
                                    <th className="px-6 py-4 font-semibold">Email</th>
                                    <th className="px-6 py-4 font-semibold">Role</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dashboardData.members?.map((member, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                    {member.firstName?.charAt(0) || "U"}
                                                </div>
                                                <span className="font-medium text-gray-800">
                                                    {member.firstName} {member.lastName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                (member.isTeamLead || member.role === 'team_lead' || (member.email === (dashboardData.team?.teamLeadId?.email || dashboardData.team?.teamLead?.email || dashboardData.lead?.email))) ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {(member.isTeamLead || member.role === 'team_lead' || (member.email === (dashboardData.team?.teamLeadId?.email || dashboardData.team?.teamLead?.email || dashboardData.lead?.email))) ? 'Team Lead' : (member.role?.toUpperCase() || 'MEMBER')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                (member.isActive !== false) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {(member.isActive !== false) ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "N/A"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!isRegionalView && !isTeamView && (
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 text-yellow-800">
                    <h3 className="font-bold">Unrecognized Data Format</h3>
                    <p className="text-sm mt-2">The data returned from the server could not be visualized. Please contact support.</p>
                    <pre className="mt-4 p-4 bg-yellow-100/50 rounded-lg text-xs overflow-auto max-h-40">
                        {JSON.stringify(dashboardData, null, 2)}
                    </pre>
                </div>
            )}

            <AssignMemberModal 
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onAssign={handleAssignMember}
                loading={assignLoading}
                form={assignForm}
                setForm={setAssignForm}
                teams={availableTeams}
                showTeamSelect={isRegionalView}
            />

            <SetTeamLeadModal
                isOpen={showSetLeadModal}
                onClose={() => setShowSetLeadModal(false)}
                onSetLead={handleSetTeamLead}
                loading={setLeadLoading}
                form={setLeadForm}
                setForm={setSetLeadForm}
            />
        </div>
    );
};

export default MyTeamDashboardView;

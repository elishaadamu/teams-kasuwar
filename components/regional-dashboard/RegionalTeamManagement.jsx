
import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { toast } from "react-toastify";
import { FaUserPlus, FaExchangeAlt, FaUserTie } from "react-icons/fa";

const RegionalTeamManagement = () => {
  const [zones, setZones] = useState([]);
  const [activeTab, setActiveTab] = useState("assign"); // assign, reassign, teamlead
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [assignForm, setAssignForm] = useState({ email: "", role: "BD", teamId: "", zoneId: "", stateId: "" });
  const [reassignForm, setReassignForm] = useState({ email: "", teamId: "", zoneId: "", stateId: "" });
  const [teamLeadForm, setTeamLeadForm] = useState({ email: "", teamId: "", zoneId: "" });

  const [selectedZoneStates, setSelectedZoneStates] = useState([]);
  const [teamLeadZoneStates, setTeamLeadZoneStates] = useState([]);

  
  const fetchZones = async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONES),
      { withCredentials: true }
    );
  
    setZones(
      response.data.zones
    );
    } catch (error) {
      alert(error);
    }
  };  
  useEffect(() => {
    fetchZones();
  }, []);

  // Fetch states when zone changes
  const fetchStates = async (zoneId, type = "assign") => {
    if (!zoneId) return;
    try {
      const endpoint = type === "teamlead" 
        ? `${API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONE_STATES}${zoneId}/teams`
        : `${API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONE_TEAMS}${zoneId}/teams`;
        
      const response = await axios.get(apiUrl(endpoint), { withCredentials: true });
    
      if (response.data) {
        if (type === "teamlead") {
          setTeamLeadZoneStates(response.data.states || response.data.teams || response.data.data || []);
        } else {
          setSelectedZoneStates(response.data.teams || response.data.states || response.data.data || []);
        }
      }
    } catch (error) {
     
      toast.error(`Failed to fetch ${type === "teamlead" ? "states" : "teams"} for selected zone`);
    }
  };

  const handleZoneChange = (e, formSetter, currentForm, type = "assign") => {
    const zoneId = e.target.value;
    formSetter({ ...currentForm, zoneId, teamId: "", stateId: "" });
    fetchStates(zoneId, type);
  };

  const handleAssignMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      email: assignForm.email,
      role: assignForm.role,
      teamId: assignForm.teamId || assignForm.stateId
    }
    console.log(payload);
    try {
      await axios.post(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.ASSIGN_MEMBER), 
       payload
       , { withCredentials: true });
      toast.success("Member assigned successfully!");
      setAssignForm({ email: "", role: "BD", teamId: "", zoneId: "", stateId: "" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to assign member");
    } finally {
      setLoading(false);
    }
  };

  const handleReassignMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.REASSIGN_MEMBER), {
        email: reassignForm.email,
        teamId: reassignForm.teamId || reassignForm.stateId
      }, { withCredentials: true });
      toast.success("Member reassigned successfully!");
      setReassignForm({ email: "", teamId: "", zoneId: "", stateId: "" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reassign member");
    } finally {
      setLoading(false);
    }
  };

  const handleSetTeamLead = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.SET_TEAM_LEAD), {
        email: teamLeadForm.email,
        teamId: teamLeadForm.teamId
      }, { withCredentials: true });
      toast.success("Team Lead updated successfully!");
      setTeamLeadForm({ email: "", teamId: "", zoneId: "" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to set team lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Team Management</h2>
      
      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-100 mb-6">
        <button
          onClick={() => setActiveTab("assign")}
          className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "assign" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Assign Member
        </button>
        <button
          onClick={() => setActiveTab("reassign")}
          className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "reassign" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Reassign Member
        </button>
        <button
          onClick={() => setActiveTab("teamlead")}
          className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "teamlead" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Set Team Lead
        </button>
      </div>

      {/* Assign Member Form */}
      {activeTab === "assign" && (
        <form onSubmit={handleAssignMember} className="space-y-4 max-w-lg">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={assignForm.role}
              onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="agent">Agent</option>
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
              <option value="bd">Business Developer (BD)</option>
              <option value="bdm">Business Development Manager (BDM)</option>
              <option value="sm">Sales Manager (SM)</option> 
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                <select
                value={assignForm.zoneId}
                required
                onChange={(e) => handleZoneChange(e, setAssignForm, assignForm)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                <option value="">Select Zone</option>
                {zones?.map(zone => (
                    <option key={zone._id} value={zone._id}>{zone.name}</option>
                ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State / Team</label>
                <select
                value={assignForm.teamId || assignForm.stateId}
                required
                onChange={(e) => setAssignForm({ ...assignForm, teamId: e.target.value, stateId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={!assignForm.zoneId}
                >
                <option value="">Select Team</option>
                {selectedZoneStates.map(state => (
                    <option key={state._id || state.id} value={state._id || state.id}>{state.name}</option>
                ))}
                </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Processing..." : <><FaUserPlus /> Assign Member</>}
          </button>
        </form>
      )}

      {/* Reassign Member Form */}
      {activeTab === "reassign" && (
        <form onSubmit={handleReassignMember} className="space-y-4 max-w-lg">
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={reassignForm.email}
              onChange={(e) => setReassignForm({ ...reassignForm, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="member@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Zone</label>
                <select
                value={reassignForm.zoneId}
                required
                onChange={(e) => handleZoneChange(e, setReassignForm, reassignForm, "reassign")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                <option value="">Select Zone</option>
                {zones?.map(zone => (
                    <option key={zone._id} value={zone._id}>{zone.name}</option>
                ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New State / Team</label>
                <select
                value={reassignForm.teamId || reassignForm.stateId}
                required
                onChange={(e) => setReassignForm({ ...reassignForm, teamId: e.target.value, stateId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={!reassignForm.zoneId}
                >
                <option value="">Select Team</option>
                {selectedZoneStates.map(state => (
                    <option key={state._id || state.id} value={state._id || state.id}>{state.name}</option>
                ))}
                </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Processing..." : <><FaExchangeAlt /> Reassign Member</>}
          </button>
        </form>
      )}

      {/* Set Team Lead Form */}
      {activeTab === "teamlead" && (
        <form onSubmit={handleSetTeamLead} className="space-y-4 max-w-lg">
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Team Lead Email</label>
            <input
              type="email"
              required
              value={teamLeadForm.email}
              onChange={(e) => setTeamLeadForm({ ...teamLeadForm, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="lead@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                <select
                value={teamLeadForm.zoneId}
                required
                onChange={(e) => handleZoneChange(e, setTeamLeadForm, teamLeadForm, "teamlead")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                <option value="">Select Zone</option>
                {zones?.map(zone => (
                    <option key={zone._id} value={zone._id}>{zone.name}</option>
                ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team / State</label>
                <select
                value={teamLeadForm.teamId}
                required
                onChange={(e) => setTeamLeadForm({ ...teamLeadForm, teamId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={!teamLeadForm.zoneId}
                >
                <option value="">Select Team</option>
                {teamLeadZoneStates.map(state => (
                    <option key={state._id || state.id} value={state._id || state.id}>{state.name}</option>
                ))}
                </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Processing..." : <><FaUserTie /> Assign Team Lead</>}
          </button>
        </form>
      )}
    </div>
  );
};

export default RegionalTeamManagement;

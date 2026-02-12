"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { toast } from "react-toastify";
import { FaArrowLeft, FaPlusCircle, FaSpinner } from "react-icons/fa";

const CreateTeamPage = () => {
    const router = useRouter();
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingZones, setFetchingZones] = useState(true);
    const [fetchingStates, setFetchingStates] = useState(false);
    const [selectedZoneStates, setSelectedZoneStates] = useState([]);
    const [form, setForm] = useState({
        name: "",
        state: "",
        zoneId: ""
    });

    useEffect(() => {
        const fetchZones = async () => {
            try {
                const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONES), { withCredentials: true });
                if (response.data.success) {
                    setZones(response.data.zones);
                }
            } catch (error) {
              
                toast.error("Failed to load zones");
            } finally {
                setFetchingZones(false);
            }
        };
        fetchZones();
    }, []);

    const fetchStates = async (zoneId) => {
        if (!zoneId) return;
        setFetchingStates(true);
        try {
            const response = await axios.get(apiUrl(`${API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONE_TEAMS}${zoneId}/teams`), { withCredentials: true });
            if (response.data) {
                setSelectedZoneStates(response.data.teams || []);
            }
        } catch (error) {
           
            toast.error("Failed to fetch states for selected zone");
        } finally {
            setFetchingStates(false);
        }
    };

    const handleZoneChange = (e) => {
        const zoneId = e.target.value;
        setForm({ ...form, zoneId, state: "" });
        fetchStates(zoneId);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.zoneId || !form.name || !form.state) {
            toast.warning("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            const url = apiUrl(`${API_CONFIG.ENDPOINTS.REGIONAL.CREATE_TEAM}${form.zoneId}/teams`);
            const response = await axios.post(url, {
                name: form.name,
                state: form.state
            }, { withCredentials: true });

            if (response.data.success || response.status === 201 || response.status === 200) {
                toast.success("Team created successfully!");
                router.push("/regional-dashboard");
            } else {
                toast.error(response.data.message || "Failed to create team");
            }
        } catch (error) {
          
            toast.error(error.response?.data?.message || "An error occurred while creating the team");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 font-medium"
            >
                <FaArrowLeft /> Back to Dashboard
            </button>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FaPlusCircle className="text-blue-200" /> Create New Team
                    </h1>
                    <p className="text-blue-100 mt-2">Initialize a new operations team within a specific zone.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Select Zone</label>
                            <select
                                name="zoneId"
                                value={form.zoneId}
                                onChange={handleZoneChange}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                                required
                                disabled={fetchingZones}
                            >
                                <option value="">{fetchingZones ? "Loading zones..." : "Choose a zone"}</option>
                                {zones.map((zone) => (
                                    <option key={zone._id} value={zone._id}>{zone.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">State</label>
                            <select
                                name="state"
                                value={form.state}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                                required
                                disabled={!form.zoneId || fetchingStates}
                            >
                                <option value="">{fetchingStates ? "Loading states..." : "Select State"}</option>
                                {selectedZoneStates.map((team) => (
                                    <option key={team._id || team.id} value={team.state || team.name}>
                                        {team.state || team.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Team Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Kano Market Team-A"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || fetchingZones}
                            className={`flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50`}
                        >
                            {loading ? (
                                <><FaSpinner className="animate-spin" /> Creating Team...</>
                            ) : (
                                <><FaPlusCircle /> Create Team</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTeamPage;

"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import { FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import Loading from "@/components/Loading";

const VendorsTargetPage = () => {
    const { userData } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [overviewData, setOverviewData] = useState(null);
    const [selectedTeamId, setSelectedTeamId] = useState("");

    useEffect(() => {
        const fetchTargets = async () => {
            if (!userData) return;
            try {
                setLoading(true);
                const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.TARGETS.REGIONAL_OVERVIEW), { withCredentials: true });
                if (response?.data?.success) {
                    setOverviewData(response.data);
                    if (response.data.teams && response.data.teams.length > 0) {
                        setSelectedTeamId(response.data.teams[0].teamId);
                    }
                }
            } catch (error) {
                toast.error("Failed to load targets data");
            } finally {
                setLoading(false);
            }
        };

        fetchTargets();
    }, [userData]);

    if (loading) return <Loading />;

    const teams = overviewData?.teams || [];
    const selectedTeam = teams.find(t => t.teamId === selectedTeamId) || teams[0];

    const defaultVTarget = 13000;
    const defaultDTarget = 4500;
    const defaultSTarget = 4500;

    const targets = selectedTeam ? [
        {
            title: "Vendors Target",
            target: defaultVTarget,
            achieved: selectedTeam.metrics?.vendors || 0,
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-50",
            barColor: "bg-emerald-500"
        },
        {
            title: "Delivery Target",
            target: defaultDTarget,
            achieved: selectedTeam.metrics?.deliveries || 0,
            iconColor: "text-blue-500",
            bgColor: "bg-blue-50",
            barColor: "bg-blue-500"
        },
        {
            title: "Sales Target",
            target: defaultSTarget,
            achieved: selectedTeam.metrics?.sales || 0,
            iconColor: "text-purple-500",
            bgColor: "bg-purple-50",
            barColor: "bg-purple-500"
        }
    ] : [];

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Targets & <span className="text-blue-600">Achievements</span></h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Real-time tracking of team metrics</p>
                </div>

                <div className="min-w-[280px] w-full md:w-auto">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Select Team</label>
                    <select 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                    >
                        {teams.map(t => (
                            <option key={t.teamId} value={t.teamId}>{t.teamName}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedTeam && (
                <>
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-[2rem] p-8 shadow-xl text-white relative overflow-hidden mb-8">
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <h2 className="text-2xl font-black">{selectedTeam.teamName} Overall Performance</h2>
                                <p className="text-slate-400 mt-1">
                                    Month: {overviewData?.month} / Year: {overviewData?.year}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-black">{selectedTeam.percentage || 0}%</span>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                                    {(selectedTeam.totalTasksDone || 0).toLocaleString()} / {(selectedTeam.totalTasksRequired || 0).toLocaleString()} Tasks
                                </p>
                            </div>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mt-6 relative z-10">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                style={{ width: `${Math.min(100, selectedTeam.percentage || 0)}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {targets.map((item, index) => {
                            const progress = item.target > 0 ? Math.min(100, Math.round((item.achieved / item.target) * 100)) : 0;

                            return (
                                <div key={index} className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100 flex flex-col h-full relative transition-all hover:shadow-xl hover:border-blue-500/10 group">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-blue-500 transition-colors">{item.title}</span>
                                        <div className={`px-3 py-1 rounded-full ${item.bgColor} ${item.iconColor} text-xs font-black`}>
                                            {progress}%
                                        </div>
                                    </div>

                                    <div className="mb-8 flex-1">
                                        <h2 className="text-5xl font-black tracking-tighter text-gray-900 mb-1">
                                            {item.achieved.toLocaleString()}
                                        </h2>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            Goal: {item.target.toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-1000 ${item.barColor} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                {Math.max(0, item.target - item.achieved).toLocaleString()} remaining
                                            </p>
                                            {item.achieved >= item.target && (
                                                <FaCheckCircle className="text-emerald-500 text-sm" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default VendorsTargetPage;

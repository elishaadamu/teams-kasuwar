"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import RegionalTeamList from "@/components/regional-dashboard/RegionalTeamList";
import { FaTimes, FaWallet, FaArrowRight, FaChartLine } from "react-icons/fa";
import { toast } from "react-toastify";

export default function FinancialReport() {
    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState("");
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTeamWallet, setSelectedTeamWallet] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchZones = async () => {
            try {
                const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONES), { withCredentials: true });
                if (response.data.success) {
                    setZones(response.data.zones);
                }
            } catch (error) {
             
            }
        };
        fetchZones();
    }, []);

    useEffect(() => {
        if (!selectedZone) {
            setTeams([]);
            return;
        }

        const fetchTeams = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    apiUrl(`${API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONE_TEAMS}${selectedZone}/teams`),
                    { withCredentials: true }
                );
                
                if (response.data.success) {
                    setTeams(response.data.teams || []);
                }
            } catch (error) {
               
                toast.error("Failed to load teams for this zone");
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, [selectedZone]);

    const handleViewWallet = async (teamId) => {
        setModalLoading(true);
        setShowModal(true);
        try {
            const response = await axios.get(
                apiUrl(`${API_CONFIG.ENDPOINTS.ZONE_WALLET.GET_TEAM}${teamId}`),
                { withCredentials: true }
            );
          
            if (response.data) {
                setSelectedTeamWallet(response.data.wallet || response.data.data || response.data);
            }
        } catch (error) {
           
            toast.error("No wallet details found for this team");
            setShowModal(false);
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Financial Report</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage and view team financial performance by zone</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Select Zone:</span>
                    <select
                        value={selectedZone}
                        onChange={(e) => setSelectedZone(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50 font-medium min-w-[200px]"
                    >
                        <option value="">Select a zone...</option>
                        {zones.map((zone) => (
                            <option key={zone._id} value={zone._id}>{zone.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 animate-pulse">Fetching regional teams...</p>
                </div>
            ) : selectedZone ? (
                <RegionalTeamList teams={teams} onViewWallet={handleViewWallet} />
            ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-10 flex flex-col items-center text-center">
                    <div className="bg-blue-100 p-4 rounded-full mb-4">
                        <FaChartLine className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-900">Get Started</h3>
                    <p className="text-blue-700 max-w-md mt-2">
                        Select a regional zone from the dropdown above to view the financial performance and wallets of all teams in that region.
                    </p>
                </div>
            )}

            {/* Wallet Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FaWallet className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">
                                        {selectedTeamWallet?.teamName || selectedTeamWallet?.teamId?.name || "Team Wallet"}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {selectedTeamWallet?.zoneName || selectedTeamWallet?.zoneId?.name || "Detailed breakdown"}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="p-8">
                            {modalLoading ? (
                                <div className="flex flex-col items-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                                    <p className="text-sm text-gray-500">Loading wallet data...</p>
                                </div>
                            ) : selectedTeamWallet ? (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
                                        <div className="relative z-10">
                                            <p className="text-blue-100 text-sm font-medium mb-1">Total Balance</p>
                                            <h4 className="text-4xl font-bold">
                                                ₦{(selectedTeamWallet.balance || 0).toLocaleString()}
                                            </h4>
                                            <p className="text-xs text-blue-200 mt-2 font-mono uppercase">
                                                Currency: {selectedTeamWallet.currency || 'NGN'}
                                            </p>
                                        </div>
                                        <FaWallet className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <span className="text-sm font-medium">Sales Commission</span>
                                            </div>
                                            <span className="font-bold text-gray-900">
                                                ₦{(selectedTeamWallet.commissions?.sales || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <span className="text-sm font-medium">Delivery Commission</span>
                                            </div>
                                            <span className="font-bold text-gray-900">
                                                ₦{(selectedTeamWallet.commissions?.delivery || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                                <span className="text-sm font-medium">Subscription Commissions</span>
                                            </div>
                                            <span className="font-bold text-gray-900">
                                                ₦{(selectedTeamWallet.commissions?.subscriptions || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setShowModal(false)}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                                    >
                                        Close Details
                                        <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">No wallet details found for this team.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
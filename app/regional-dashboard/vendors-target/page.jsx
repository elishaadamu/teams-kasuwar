"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import { FaChartLine, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import Loading from "@/components/Loading";

const VendorsTargetPage = () => {
    const { userData } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [walletData, setWalletData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!userData) return;
            try {
                setLoading(true);
                let response;
                if (userData?.role?.toLowerCase() === 'rm' || userData?.role?.toLowerCase() === 'regional-leader') {
                    response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_MY_REGION_TEAMS), { withCredentials: true });
                } else {
                    response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_MY_TEAM_DASHBOARD), { withCredentials: true });
                }
                
                if (response?.data?.success) {
                    setDashboardData(response.data);
                }
            } catch (error) {
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userData]);

    useEffect(() => {
        const fetchWalletData = async () => {
            if (!userData) return;
            try {
                let endpoint = "";
                const currentTeamId = dashboardData?.team?._id || dashboardData?.team?.id;
                
                if (currentTeamId) {
                    endpoint = API_CONFIG.ENDPOINTS.ZONE_WALLET.GET_TEAM + currentTeamId;
                } else if (dashboardData?.zone?._id || dashboardData?.zone?.id) {
                    endpoint = API_CONFIG.ENDPOINTS.ZONE_WALLET.GET_REGIONAL + (dashboardData.zone._id || dashboardData.zone.id);
                } else if (userData?.zoneId) {
                    endpoint = API_CONFIG.ENDPOINTS.ZONE_WALLET.GET_REGIONAL + userData.zoneId;
                }

                if (endpoint) {
                    const response = await axios.get(apiUrl(endpoint), { withCredentials: true });
                    if (response.data.success) {
                        setWalletData(response.data.wallet || response.data.data || { balance: 0, currency: "NGN" });
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };

        if (dashboardData || userData?.zoneId) {
            fetchWalletData();
        }
    }, [dashboardData, userData]);

    if (loading) return <Loading />;

    const targets = [
        {
            title: "Vendors Target",
            target: 130000,
            achieved: walletData?.commissions?.subscriptions || 0,
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-50",
            barColor: "bg-emerald-500"
        },
        {
            title: "Delivery Target",
            target: 40000,
            achieved: walletData?.commissions?.delivery || 0,
            iconColor: "text-blue-500",
            bgColor: "bg-blue-50",
            barColor: "bg-blue-500"
        },
        {
            title: "Sales Target",
            target: 40000,
            achieved: walletData?.commissions?.sales || 0,
            iconColor: "text-purple-500",
            bgColor: "bg-purple-50",
            barColor: "bg-purple-500"
        }
    ];

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Targets & Achievements</h1>
                <p className="text-sm text-gray-500 mt-1">Track your progress across vendors, delivery, and sales</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {targets.map((item, index) => {
                    const progress = item.target > 0 ? Math.min(100, Math.round((item.achieved / item.target) * 100)) : 0;
                    const isTargetMet = item.achieved >= item.target;

                    return (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}>
                                    <FaChartLine className={`text-lg ${item.iconColor}`} />
                                </div>
                                <span className="text-sm font-bold uppercase tracking-widest text-gray-700">{item.title}</span>
                            </div>
                            
                            <div className="mb-6 flex-1">
                                <div className="flex items-end gap-2 mb-2">
                                    <h2 className="text-4xl font-bold tracking-tight text-gray-800">
                                        ₦{item.achieved.toLocaleString()}
                                    </h2>
                                </div>
                                <p className="text-sm font-medium text-gray-500">
                                    Target: ₦{item.target.toLocaleString()}
                                </p>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-medium">Achievement Rate</span>
                                    <span className={`text-sm font-bold ${item.iconColor}`}>{progress}%</span>
                                </div>
                                
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-1000 ${item.barColor}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                
                                {isTargetMet ? (
                                    <div className="flex items-center gap-2 text-green-600 mt-2">
                                        <FaCheckCircle className="text-xs" />
                                        <span className="text-xs font-medium">Target Reached! Excellent work.</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-500 mt-2">
                                        <FaExclamationCircle className="text-xs" />
                                        <span className="text-xs font-medium">₦{(item.target - item.achieved).toLocaleString()} more needed.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VendorsTargetPage;

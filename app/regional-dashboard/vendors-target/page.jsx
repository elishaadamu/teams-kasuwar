"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import { FaChartLine, FaCheckCircle, FaExclamationCircle, FaWallet } from "react-icons/fa";
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
                    console.log("=== DASHBOARD DATA ===", response.data);
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

    const isStateCoordinator = userData?.role?.toLowerCase() === 'tl' || userData?.role?.toLowerCase() === 'team lead' || userData?.role?.toLowerCase() === 'state coordinator';
    const vTarget = isStateCoordinator ? 13000 : 130000;
    const dTarget = isStateCoordinator ? 4500 : 40000;
    const sTarget = isStateCoordinator ? 4500 : 40000;

    const targets = [
        {
            title: "Vendors Target",
            target: vTarget,
            achieved: dashboardData?.metrics?.totalVendors || 0,
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-50",
            barColor: "bg-emerald-500"
        },
        {
            title: "Delivery Target",
            target: dTarget,
            achieved: dashboardData?.metrics?.totalDeliveryMen || 0,
            iconColor: "text-blue-500",
            bgColor: "bg-blue-50",
            barColor: "bg-blue-500"
        },
        {
            title: "Sales Target",
            target: sTarget,
            achieved: dashboardData?.stats?.totalOrders || dashboardData?.metrics?.totalOrders || 0,
            iconColor: "text-purple-500",
            bgColor: "bg-purple-50",
            barColor: "bg-purple-500"
        }
    ];

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Targets & <span className="text-blue-600">Achievements</span></h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Real-time tracking of active users and service metrics</p>
                </div>

                {/* Wallet Balance Card - More Compact */}
                <div className="bg-slate-900 rounded-2xl p-5 shadow-xl text-white min-w-[280px] w-full md:w-auto relative overflow-hidden border border-slate-800">
                    <div className="absolute -right-6 -bottom-6 opacity-10">
                        <FaWallet className="text-7xl rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 block mb-1">Current Balance</span>
                        <h2 className="text-3xl font-black tracking-tighter">₦{walletData?.balance?.toLocaleString() || "0"}</h2>
                    </div>
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
                                        {(item.target - item.achieved).toLocaleString()} remaining
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
        </div>
    );
};

export default VendorsTargetPage;

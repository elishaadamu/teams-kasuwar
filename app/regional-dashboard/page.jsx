
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import RegionalStats from "@/components/regional-dashboard/RegionalStats";
import RegionalFinancials from "@/components/regional-dashboard/RegionalFinancials";
// import RegionalTeamList from "@/components/regional-dashboard/RegionalTeamList";
import RegionalTeamManagement from "@/components/regional-dashboard/RegionalTeamManagement";
import { toast } from "react-toastify";
import { FaSpinner, FaTimes, FaPlus } from "react-icons/fa";
import Link from "next/link";
import { WalletCard, CommissionCard } from "@/components/regional-dashboard/FinancialCards";

// Shared cards imported from FinancialCards.jsx

const TeamDetailsModal = ({ team, isOpen, onClose }) => {
    if (!isOpen || !team) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{team.teamName || team.name || "Team Details"}</h3>
                        <p className="text-sm text-gray-500">{team.state || "N/A"}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <WalletCard 
                            title="Wallet Balance" 
                            amount={team.wallet?.balance || team.balance || 0} 
                            subtext="Active Balance"
                        />
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Commission Breakdown</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <CommissionCard 
                                title="Sales" 
                                amount={team.commissions?.sales || 0} 
                                type="sales"
                            />
                            <CommissionCard 
                                title="Delivery" 
                                amount={team.commissions?.delivery || 0} 
                                type="delivery"
                            />
                            <CommissionCard 
                                title="Subscriptions" 
                                amount={team.commissions?.subscriptions || 0} 
                                type="subs"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                         <h4 className="text-blue-800 font-bold mb-2">Team Info</h4>
                         <div className="grid grid-cols-2 gap-4 text-sm">
                             <div>
                                 <p className="text-blue-600/60">Currency</p>
                                 <p className="font-semibold text-blue-900">{team.currency || "NGN"}</p>
                             </div>
                             <div>
                                 <p className="text-blue-600/60">Zone</p>
                                 <p className="font-semibold text-blue-900">{team.zoneName || "N/A"}</p>
                             </div>
                             <div>
                                 <p className="text-blue-600/60">Last Updated</p>
                                 <p className="font-semibold text-blue-900">{team.updatedAt ? new Date(team.updatedAt).toLocaleDateString() : "N/A"}</p>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RegionalDashboard = () => {
  const { userData } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [financials, setFinancials] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchTeamDetails = async (teamId) => {
    setModalLoading(true);
    try {
        const response = await axios.get(apiUrl(`${API_CONFIG.ENDPOINTS.ZONE_WALLET.GET_TEAM}${teamId}`), { withCredentials: true });
        if (response.data) {
            setSelectedTeam(response.data.wallet || response.data.data || response.data);
            setShowModal(true);
        }
    } catch (error) {
        toast.error("Failed to fetch team details");
    } finally {
        setModalLoading(false);
    }
};


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Stats
        const statsRes = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_STATS), { withCredentials: true });
        if (statsRes.data?.success) {
             setStats({ totalMembers: statsRes.data.totalMembers }); // Using available data
             // setFinancials(statsRes.data.financials || null); // Not in response yet
             // setTeams(statsRes.data.regions || []); // Using regions as teams for now? Or separate endpoint?
             setTeams(statsRes.data.regions); 
        }

        // Fetch Zones for management
       
      } catch (error) {
       
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
        fetchData();
    }
  }, [userData]);




  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Regional Overview</h1>
          <p className="text-gray-500 text-sm">
            Welcome back, {userData?.firstName || "Regional Manager"}
          </p>
        </div>
        <Link 
          href="/regional-dashboard/create-team"
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <FaPlus className="text-sm" /> Create Team
        </Link>
      </div>

      {/* Stats Section */}
      <section>
        <RegionalStats stats={stats} />
      </section>

      {/* Financials & Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Financials & Team List */}
        <div className="lg:col-span-2 space-y-8">
            <RegionalFinancials onViewTeamDetails={fetchTeamDetails} modalLoading={modalLoading} />
            {/* <RegionalTeamList teams={teams} onViewWallet={fetchTeamDetails} /> */}
        </div>
      <div className="lg:col-span-1">
            <RegionalTeamManagement />
        </div>
      </div>
      <TeamDetailsModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          team={selectedTeam} 
      />
    </div>
  );
};

export default RegionalDashboard;

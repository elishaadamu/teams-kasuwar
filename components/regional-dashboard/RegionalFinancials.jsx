
import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { FaWallet, FaMoneyBillWave, FaTimes, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";
import { WalletCard, CommissionCard } from "@/components/regional-dashboard/FinancialCards";

// Local components moved to shared page.jsx or extracted

const RegionalFinancials = ({ onViewTeamDetails, modalLoading }) => {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [financials, setFinancials] = useState(null);
  const [teamWallets, setTeamWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  // Modal states moved to parent

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONES), { withCredentials: true });
        if (response.data.success) {
          setZones(response.data.zones);
        }
      } catch (error) {
        // Silently fail or use a logger in production
      }
    };
    fetchZones();
  }, []);

  useEffect(() => {
    const fetchFinancials = async () => {
      setLoading(true);
      try {
        let url = apiUrl(API_CONFIG.ENDPOINTS.ZONE_WALLET.GET_ALL_REGIONAL);
        const responseZone = await axios.get(url, { withCredentials: true });
        if (selectedZone) {
             url = apiUrl(`${API_CONFIG.ENDPOINTS.ZONE_WALLET.GET_REGIONAL}${selectedZone}/teams`);
        }
        const response = await axios.get(url, { withCredentials: true });
        if (response.data) {
            let data = response.data.wallets || response.data.wallet || response.data.data || response.data;
            
            if (Array.isArray(data)) {
                 const aggregated = data.reduce((acc, curr) => ({
                     mainWallet: (acc.mainWallet || 0) + (curr.balance || curr.mainWallet || 0),
                     commissions: {
                         sales: (acc.commissions?.sales || 0) + (curr.commissions?.sales || 0),
                         delivery: (acc.commissions?.delivery || 0) + (curr.commissions?.delivery || 0),
                         subscriptions: (acc.commissions?.subscriptions || 0) + (curr.commissions?.subscriptions || 0),
                     }
                 }), { mainWallet: 0, commissions: { sales: 0, delivery: 0, subscriptions: 0 } });
                 setFinancials(aggregated);
            } else {
                 if (data.balance !== undefined && data.mainWallet === undefined) {
                     data = { ...data, mainWallet: data.balance };
                 }
                 setFinancials(data);
            }
        }

        // Fetch Team Wallets if a zone is selected
        if (selectedZone) {
            const teamRes = await axios.get(apiUrl(`${API_CONFIG.ENDPOINTS.ZONE_WALLET.GET_REGIONAL}${selectedZone}/teams`), { withCredentials: true });
            if (teamRes.data) {
                setTeamWallets(teamRes.data.teams || teamRes.data.data || []);
            }
        } else {
            setTeamWallets([]);
        }

      } catch (error) {
        toast.error("Failed to load financial data");
      } finally {
        setLoading(false);
      }
    };

    fetchFinancials();
  }, [selectedZone]);

  // fetchTeamDetails moved to parent

  const handleZoneChange = (e) => {
    setSelectedZone(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Financial Overview</h2>
        
        <select
            value={selectedZone}
            onChange={handleZoneChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
        >
            <option value="">All Regions</option>
            {zones.map((zone) => (
                <option key={zone._id} value={zone._id}>{zone.name}</option>
            ))}
        </select>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <WalletCard 
                    title="Wallet Balance" 
                    amount={financials?.mainWallet || financials?.balance || 0} 
                    subtext="Available for withdrawal"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CommissionCard 
                    title="Sales Commission" 
                    amount={financials?.commissions?.sales || 0} 
                    type="sales"
                />
                <CommissionCard 
                    title="Delivery Commission" 
                    amount={financials?.commissions?.delivery || 0} 
                    type="delivery"
                />
                <CommissionCard 
                    title="Vendor Subscriptions" 
                    amount={financials?.commissions?.subscriptions || 0} 
                    type="subs"
                />
            </div>

            {/* Team Wallets Table */}
            {selectedZone && teamWallets.length > 0 && (
                <div className="mt-10 animate-in slide-in-from-bottom-5 duration-300">
                    <h3 className="text-md font-bold text-gray-700 mb-4">Team Wallet Breakdown</h3>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Team Name</th>
                                    <th className="px-6 py-4 font-semibold">State</th>
                                    <th className="px-6 py-4 font-semibold text-right">Wallet Balance</th>
                                    <th className="px-6 py-4 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {teamWallets.map((team, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800">{team.name || "N/A"}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{team.state || "N/A"}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-gray-900">₦{(team.walletBalance || team.balance || 0).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => onViewTeamDetails(team._id)}
                                                disabled={modalLoading}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2 mx-auto disabled:opacity-50"
                                            >
                                                <FaEye /> View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
      )}

    </div>
  );
};

export default RegionalFinancials;

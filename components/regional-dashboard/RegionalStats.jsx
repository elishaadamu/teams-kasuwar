
import React from "react";
import {
  FaBoxOpen,
  FaTruck,
  FaUserPlus,
  FaUsers,
  FaUserTie,
  FaClipboardList,
} from "react-icons/fa";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useState, useEffect } from "react";

const StatCard = ({ title, count, icon: Icon, color, subtext }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between transition-transform hover:-translate-y-1 hover:shadow-md">
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{count}</h3>
      {subtext && <p className="text-xs text-green-600 mt-2 font-medium bg-green-50 inline-block px-2 py-1 rounded-lg">{subtext}</p>}
    </div>
    <div className={`p-4 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

const RegionalStats = ({ stats }) => {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [zoneMetrics, setZoneMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONES), { withCredentials: true });
        if (response.data.success) {
          setZones(response.data.zones);
        }
      } catch (error) {
        toast.error("Failed to fetch zones");
      }
    };
    fetchZones();
  }, []);

  const handleZoneChange = async (e) => {
    const zoneId = e.target.value;
    setSelectedZone(zoneId);

    if (zoneId) {
      setLoading(true);
      try {
        const [metricsRes, detailsRes] = await Promise.all([
          axios.get(apiUrl(`${API_CONFIG.ENDPOINTS.REGIONAL.GET_METRICS}${zoneId}/metrics`), { withCredentials: true }),
          axios.get(apiUrl(`${API_CONFIG.ENDPOINTS.REGIONAL.GET_DETAILS}${zoneId}/details`), { withCredentials: true })
        ]);
        

        const newMetrics = {
          ...(metricsRes.data?.metrics || {}),
          ...(detailsRes.data?.data || {}) // Assuming detailsRes.data.data contains the stats based on typical API structure
        };

       
        setZoneMetrics(newMetrics);
      } catch (error) {
        toast.error("Failed to fetch zone data");
      } finally {
        setLoading(false);
      }
    } else {
      setZoneMetrics(null);
    }
  };

  const currentStats = zoneMetrics || stats;
  // stats object structure expected:
  // {
  //   totalProducts, totalVendors, totalCustomers, totalDeliveryMan,
  //   totalSM, totalBDM, totalBD, totalAgents,
  //   totalOrders, totalDeliveryRequests, newActiveVendors
  // }

  // }

  return (
    <div className="space-y-6">
      {/* Zone Selector */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700">Filter by Zone</h3>
        <select
          value={selectedZone}
          onChange={handleZoneChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        >
          <option value="">All Zones</option>
          {zones.map((zone) => (
            <option key={zone._id} value={zone._id}>
              {zone.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Products"
        count={currentStats?.totalProducts || 0}
        icon={FaBoxOpen}
        color="bg-purple-500"
      />
      <StatCard
        title="Total Vendors"
        count={currentStats?.totalVendors || 0}
        icon={FaUsers}
        color="bg-blue-500"
        subtext={!selectedZone && stats?.newActiveVendors ? `+${stats?.newActiveVendors} New Today` : null}
      />
      <StatCard
        title="Total Customers"
        count={currentStats?.totalCustomers || 0}
        icon={FaUserPlus}
        color="bg-indigo-500"
      />
      <StatCard
        title="Total Delivery Men"
        count={currentStats?.totalDeliveryMan || 0}
        icon={FaTruck}
        color="bg-orange-500"
      />
      
      <StatCard
        title="Total Orders"
        count={currentStats?.totalOrders || 0}
        icon={FaClipboardList}
        color="bg-teal-500"
      />
       <StatCard
        title="Delivery Requests"
        count={currentStats?.totalDeliveryRequests || 0}
        icon={FaTruck}
        color="bg-cyan-500"
      />

       <StatCard
        title="Total Managers (SM)"
        count={currentStats?.totalSM || 0}
        icon={FaUserTie}
        color="bg-pink-500"
      />
       <StatCard
        title="Total Agents"
        count={currentStats?.totalAgents || 0}
        icon={FaUsers}
        color="bg-gray-800"
      />
    </div>
    </div>
  );
};

export default RegionalStats;

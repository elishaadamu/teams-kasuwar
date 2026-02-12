
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
import { toast } from "react-toastify";

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
  const [selectedSubregion, setSelectedSubregion] = useState("");
  const [zoneMetrics, setZoneMetrics] = useState(null);
  const [subregionMetrics, setSubregionMetrics] = useState(null);
  const [selectedZoneData, setSelectedZoneData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONES), { withCredentials: true });
        if (response.data.success) {
          setZones(response.data.zones);
        }
      } catch (error) {
        // Silently fail
      }
    };
    fetchZones();
  }, []);

  const handleZoneChange = async (e) => {
    const zoneId = e.target.value;
    setSelectedZone(zoneId);
    setSelectedSubregion("");
    setSubregionMetrics(null);

    if (zoneId) {
      setLoading(true);
      try {
        const [metricsRes, detailsRes] = await Promise.all([
          axios.get(apiUrl(`${API_CONFIG.ENDPOINTS.REGIONAL.GET_METRICS}${zoneId}/metrics`), { withCredentials: true }),
          axios.get(apiUrl(`${API_CONFIG.ENDPOINTS.REGIONAL.GET_DETAILS}${zoneId}/details`), { withCredentials: true })
        ]);
        
        const metricsData = metricsRes.data;
        if (metricsData) {
          setZoneMetrics(metricsData.metrics || metricsData.data || metricsData);
        }

        const detailsData = detailsRes.data;
        if (detailsData) {
          // Check for variations in naming (property name or nested in region/data)
          const zoneData = detailsData.region || detailsData.data || detailsData.zone || 
                           (detailsData.subregions || detailsData.subRegions ? detailsData : null);
          
          if (zoneData) {
            // Ensure subregions is always normalized to 'subregions'
            const normalizedData = {
              ...zoneData,
              subregions: zoneData.subregions || zoneData.subRegions || []
            };
            setSelectedZoneData(normalizedData);
          } else if (Array.isArray(detailsData)) {
            setSelectedZoneData({ subregions: detailsData });
          }
        }
      } catch (error) {
        toast.error("Failed to fetch zone data");
      } finally {
        setLoading(false);
      }
    } else {
      setZoneMetrics(null);
      setSelectedZoneData(null);
    }
  };

  const handleSubregionChange = (e) => {
    const subregionId = e.target.value;
    setSelectedSubregion(subregionId);

    if (subregionId && selectedZoneData?.subregions) {
      const sub = selectedZoneData.subregions.find(s => s._id === subregionId);
      if (sub) {
        const rb = sub.roleBreakdown || {};
        setSubregionMetrics({
          totalMembers: sub.totalMembers || 0,
          totalSM: rb.sm || rb.SM || rb.manager || 0,
          totalAgents: rb.agent || rb.AGENT || 0,
          totalVendors: rb.vendor || rb.VENDOR || rb.seller || 0,
          totalCustomers: rb.user || rb.CUSTOMER || rb.customer || 0,
          // Delivery men might be in role breakdown too
          totalDeliveryMan: rb.deliveryMan || rb.DELIVERYMAN || rb.delivery || 0,
        });
      }
    } else {
      setSubregionMetrics(null);
    }
  };

  const currentStats = subregionMetrics || zoneMetrics || stats;

  return (
    <div className="space-y-6">
      {/* Zone Selector */}
      <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 font-medium mb-1">Filter by Zone</label>
            <select
              value={selectedZone}
              onChange={handleZoneChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-w-[200px] shadow-sm"
            >
              <option value="">All Zones</option>
              {zones.map((zone) => (
                <option key={zone._id} value={zone._id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          {selectedZone && selectedZoneData?.subregions?.length > 0 && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
              <label className="text-xs text-gray-500 font-medium mb-1">Filter by Subregion</label>
              <select
                value={selectedSubregion}
                onChange={handleSubregionChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-w-[200px]"
              >
                <option value="">All Subregions</option>
                {selectedZoneData.subregions.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {selectedSubregion && (
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider">
              Viewing: {selectedZoneData.subregions.find(s => s._id === selectedSubregion)?.name}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-50 animate-pulse">
          {[...Array(8)].map((_, i) => (
             <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-32"></div>
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default RegionalStats;

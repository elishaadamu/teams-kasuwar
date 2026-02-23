
import React from "react";
import { 
  FaBoxOpen, 
  FaTruck, 
  FaUserPlus, 
  FaUsers, 
  FaUserTie, 
  FaClipboardList, 
  FaStore 
} from "react-icons/fa";

const StatCard = ({ title, count, icon: Icon, color, subtext }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between transition-transform hover:-translate-y-1 hover:shadow-md">
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{count}</h3>
      {subtext && (
        <p className="text-xs text-green-600 mt-2 font-medium bg-green-50 inline-block px-2 py-1 rounded-lg">
          {subtext}
        </p>
      )}
    </div>
    <div className={`p-4 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

const StateStats = ({ stats, roleBreakdown }) => {
  return (
    <div className="space-y-8">
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          count={stats?.totalProducts || 0}
          icon={FaBoxOpen}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Vendors"
          count={stats?.totalVendors || 0}
          icon={FaStore}
          color="bg-blue-500"
          subtext={stats?.newActiveVendors ? `+${stats?.newActiveVendors} Today` : null}
        />
        <StatCard
          title="Total Customers"
          count={stats?.totalCustomers || 0}
          icon={FaUserPlus}
          color="bg-indigo-500"
        />
        <StatCard
          title="Total Delivery Men"
          count={stats?.totalDeliveryMan || 0}
          icon={FaTruck}
          color="bg-orange-500"
        />
        
        <StatCard
          title="Total SM"
          count={roleBreakdown?.sm || roleBreakdown?.SM || 0}
          icon={FaUserTie}
          color="bg-pink-500"
        />
        <StatCard
          title="Total BDM & BDs"
          count={(roleBreakdown?.bdm || 0) + (roleBreakdown?.bd || 0)}
          icon={FaUsers}
          color="bg-cyan-500"
        />
        <StatCard
          title="Total Agents"
          count={roleBreakdown?.agent || 0}
          icon={FaUsers}
          color="bg-gray-800"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Orders"
          count={stats?.totalOrders || 0}
          icon={FaClipboardList}
          color="bg-teal-500"
        />
        <StatCard
          title="Delivery Requests"
          count={stats?.totalDeliveryRequests || 0}
          icon={FaTruck}
          color="bg-blue-400"
        />
        <StatCard
          title="New Vendors (Active)"
          count={stats?.newActiveVendors || 0}
          icon={FaStore}
          color="bg-green-500"
        />
      </div>
    </div>
  );
};

export default StateStats;

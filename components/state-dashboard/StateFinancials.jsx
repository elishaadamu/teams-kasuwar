
import React from "react";
import { FaWallet, FaChartLine, FaTruck, FaHandshake } from "react-icons/fa";

const FinancialCard = ({ title, amount, icon: Icon, color, subtext }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</span>
    </div>
    <div>
      <h3 className="text-2xl font-bold text-gray-800">
        ₦{Number(amount).toLocaleString()}
      </h3>
      <p className="text-sm text-gray-500 mt-1">{subtext}</p>
    </div>
  </div>
);

const StateFinancials = ({ wallet, commissions }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Financial Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="md:col-span-2 lg:col-span-1">
            <FinancialCard
                title="Total Wallet"
                amount={wallet?.balance || 0}
                icon={FaWallet}
                color="bg-blue-600"
                subtext="Available Balance"
            />
        </div>
        
        <FinancialCard
          title="Sales Commission"
          amount={commissions?.sales || 0}
          icon={FaChartLine}
          color="bg-green-600"
          subtext="From Orders"
        />
        
        <FinancialCard
          title="Delivery Commission"
          amount={commissions?.delivery || 0}
          icon={FaTruck}
          color="bg-orange-600"
          subtext="From Shipments"
        />
        
        <FinancialCard
          title="Vendor Subs"
          amount={commissions?.subscriptions || 0}
          icon={FaHandshake}
          color="bg-purple-600"
          subtext="From Subscriptions"
        />
      </div>
    </div>
  );
};

export default StateFinancials;

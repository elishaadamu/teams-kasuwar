import React from "react";
import { FaWallet, FaMoneyBillWave } from "react-icons/fa";

export const WalletCard = ({ title, amount, subtext }) => (
  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-blue-100 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold">₦{amount.toLocaleString()}</h3>
        {subtext && <p className="text-xs text-blue-200 mt-2">{subtext}</p>}
      </div>
      <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
        <FaWallet className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

export const CommissionCard = ({ title, amount, type }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${
        type === 'sales' ? 'bg-green-100 text-green-600' :
        type === 'delivery' ? 'bg-orange-100 text-orange-600' :
        'bg-purple-100 text-purple-600'
      }`}>
        <FaMoneyBillWave className="w-5 h-5" />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h4 className="text-xl font-bold text-gray-800">₦{amount.toLocaleString()}</h4>
      </div>
    </div>
  </div>
);

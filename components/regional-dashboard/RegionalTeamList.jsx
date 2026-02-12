
import React from "react";
import { FaWallet } from "react-icons/fa";

const RegionalTeamList = ({ teams, onViewWallet }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Regional Performance by State</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Team</th>
              <th className="px-6 py-4 font-semibold">Active Vendors</th>
              <th className="px-6 py-4 font-semibold">Active Customers</th>
              <th className="px-6 py-4 font-semibold">Delivery Men</th>
              <th className="px-6 py-4 font-semibold">Performance Score</th>
              <th className="px-6 py-4 font-semibold text-center">Wallet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teams && teams.length > 0 ? (
              teams.map((team, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{team.name || team.teamName || 'No Team Name'}</span>
                     
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{team.activeVendors || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{team.activeCustomers || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{team.deliveryMen || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      (team.performance || 0) >= 80 ? 'bg-green-100 text-green-700' :
                      (team.performance || 0) >= 50 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {team.performance || 0}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onViewWallet(team._id || team.teamId)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Wallet Details"
                    >
                      <FaWallet className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 text-sm">
                  No team data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegionalTeamList;


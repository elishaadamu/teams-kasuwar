"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "@/context/AppContext";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { toast } from "react-toastify";

const AgentCommissionPage = () => {
  const { userData } = useAppContext();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommissions = async () => {
      if (!userData?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.USER_SIDE.AGENT_COMMISSION + userData.id),
          { withCredentials: true },
        );

        setCommissions(response.data.commissions || []);
        setError(null);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          "An error occurred while fetching commissions.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCommissions();
  }, [userData]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">My Commissions</h1>
      {commissions.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commissions.map((commission) => (
                <tr key={commission._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(commission.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ₦{commission.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {commission.from}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {commission.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">
          You have not earned any commissions yet.
        </p>
      )}
    </div>
  );
};

export default AgentCommissionPage;

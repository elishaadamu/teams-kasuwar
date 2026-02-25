"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Logo from "@/assets/logo/logo.png";
import { FaUsers, FaWallet, FaLayerGroup, FaUser, FaUserTie, FaTruck, FaMoneyBillWave, FaLock } from "react-icons/fa";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, handleLogout }) => {
  const pathname = usePathname();
  const { userData } = useAppContext();
  const userRole = userData?.role;

  // New state for dynamic team data
  const [teamData, setTeamData] = useState(null);
  const [isRegionalLeader, setIsRegionalLeader] = useState(false);
  const [isTeamLeader, setIsTeamLeader] = useState(false);

  useEffect(() => {
      const fetchTeamData = async () => {
          if (!userData) return;
          try {
              const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_MY_TEAM_DASHBOARD), { withCredentials: true });
              if (response.data.success) {
                  const data = response.data;
                  setTeamData(data);
                  
                  if (data.role === "regional-leader") {
                      setIsRegionalLeader(true);
                  } 
                  else if (data.role === "team-lead") {
                      setIsTeamLeader(true);
                  }
              }
          } catch (error) {
              console.error("Sidebar Team Fetch Error:", error);
          }
      };

      fetchTeamData();
  }, [userData]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-500">
          <Link href={"/"} className="mx-auto block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              Kasuwar Team
            </h1>
            {/* <Image className="w-32 mx-auto" src={Logo} alt="logo" /> */}
          </Link>
          <button
            className="p-2 rounded-lg text-gray-400 hover:bg-slate-800 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            <Link
              href="/bd-dashboard"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                pathname === "/bd-dashboard" ? "bg-gray-700" : ""
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Home</span>
            </Link>

            {/* BDM Sidebar */}
            {userRole === "bd" && (
              <>
                {/* Team Management */}
                <Link
                  href="/bd-dashboard/manage-agents"
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/bd-dashboard/manage-agents"
                      ? "bg-gray-700"
                      : ""
                  }`}
                >
                  <FaUsers className="w-5 h-5" />
                  <span>Manage Agents</span>
                </Link>
              
                <Link
                  href="/bd-dashboard/regional-leader"
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/bd-dashboard/regional-leader"
                      ? "bg-gray-700"
                      : ""
                  }`}
                >
                  <FaUsers className="w-5 h-5" />
                  <span>{isTeamLeader ? "Team Leader" : "Regional Leader"}</span>
                </Link>

                {/* Dynamic Team Section */}
                {(isRegionalLeader || isTeamLeader) && (
                    <div className="mt-2 mb-2 ml-4 border-l border-gray-700 pl-2">
                        <p className="px-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            {isRegionalLeader ? "Region Teams" : "Team Members"}
                        </p>
                        <div className="space-y-1">
                            {isRegionalLeader && teamData?.teams?.map((team) => (
                                <Link
                                    key={team._id || team.id}
                                    href={`/bd-dashboard/team?id=${team._id || team.id}`} 
                                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors ${
                                        pathname.includes(`/team`) && new URLSearchParams(window.location.search).get('id') === (team._id || team.id) ? "text-white bg-gray-700" : ""
                                    }`}
                                >
                                    <FaLayerGroup className="w-4 h-4" />
                                    <span>{team.name}</span>
                                </Link>
                            ))}

                            {isTeamLeader && teamData?.members?.map((member) => (
                                <div key={member.email} className="flex items-center space-x-3 px-3 py-1.5 text-gray-400 hover:text-white transition-colors">
                                    <FaUser className="w-3 h-3" />
                                    <span className="text-xs font-medium truncate">{member.firstName} {member.lastName}</span>
                                    {member.isTeamLead && <FaUserTie className="w-3 h-3 text-indigo-400 ml-auto" title="Team Lead" />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Withdraw and Settlement */}

                <Link
                  href="/bd-dashboard/withdrawal-request"
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/bd-dashboard/withdrawal-request"
                      ? "bg-gray-700"
                      : ""
                  }`}
                >
                  <FaWallet className="w-5 h-5" />
                  <span>Withdrawal Requests</span>
                </Link>

                <Link
                  href="/bd-dashboard/transactions"
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/bd-dashboard/transactions"
                      ? "bg-gray-700"
                      : ""
                  }`}
                >
                  <FaLayerGroup className="w-5 h-5" />
                  <span>Transactions</span>
                </Link>

                <Link
                  href="/bd-dashboard/delivery-request"
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/bd-dashboard/delivery-request" ? "bg-gray-700" : ""
                  }`}
                >
                  <FaTruck className="w-5 h-5" />
                  <span>Delivery Request</span>
                </Link>

                <Link
                  href="/bd-dashboard/delivery-payment"
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/bd-dashboard/delivery-payment" ? "bg-gray-700" : ""
                  }`}
                >
                  <FaMoneyBillWave className="w-5 h-5" />
                  <span>Delivery Payment</span>
                </Link>

                {/* Settings */}
                <Link
                  href="/bd-dashboard/personal-details"
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/bd-dashboard/personal-details"
                      ? "bg-gray-700"
                      : ""
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  <span>Personal Details</span>
                </Link>

                <Link
                  href="/bd-dashboard/pin-management"
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/bd-dashboard/pin-management" ? "bg-gray-700" : ""
                  }`}
                >
                  <FaLock className="w-5 h-5" />
                  <span>PIN Management</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

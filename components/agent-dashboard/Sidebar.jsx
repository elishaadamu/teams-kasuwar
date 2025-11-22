"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Logo from "@/assets/logo/logo.png";
import { FaUsers, FaWallet, FaPercentage } from "react-icons/fa";
import { decryptData } from "@/lib/encryption";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, handleLogout }) => {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const getUserRoleFromStorage = () => {
      try {
        const raw = localStorage.getItem("user");
        if (!raw) return null;
        const user = decryptData(raw) || null;
        return user?.role || null;
      } catch (err) {
        return null;
      }
    };
    setUserRole(getUserRoleFromStorage());
  }, []);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <Link href={"/"}>
            <Image className="w-[12rem] mx-auto" src={Logo} alt="logo" />
          </Link>
          <button
            className="p-2 rounded-md hover:bg-gray-700 md:hidden"
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
              href="/agent-dashboard"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                pathname === "/agent-dashboard" ? "bg-gray-700" : ""
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

            {/* agent Sidebar */}
            {userRole === "agent" && (
              <>
                {/* Team Management */}
                <Link
                  href="/agent-dashboard/manage-customers"
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/agent-dashboard/manage-customers"
                      ? "bg-gray-700"
                      : ""
                  }`}
                >
                  <FaUsers className="w-5 h-5" />
                  <span>Manage Customer</span>
                </Link>
                <Link
                  href="/agent-dashboard/manage-vendors"
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/agent-dashboard/manage-vendors"
                      ? "bg-gray-700"
                      : ""
                  }`}
                >
                  <FaUsers className="w-5 h-5" />
                  <span>Manage Vendors</span>
                </Link>

                {/* Withdraw and Settlement */}

                <Link
                  href="/agent-dashboard/withdrawal-request"
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/agent-dashboard/withdrawal-request"
                      ? "bg-gray-700"
                      : ""
                  }`}
                >
                  <FaWallet className="w-5 h-5" />
                  <span>Withdrawal Requests</span>
                </Link>
                {/* Agent Commission */}
                <Link
                  href="/agent-dashboard/agent-commission"
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/agent-dashboard/agent-commission"
                      ? "bg-gray-700"
                      : ""
                  }`}
                >
                  <FaPercentage className="w-5 h-5" />
                  <span>Agent Commission</span>
                </Link>
                {/* Settings */}
                <Link
                  href="/agent-dashboard/personal-details"
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/agent-dashboard/personal-details"
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

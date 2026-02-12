"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import axios from "axios";
import Logo from "@/assets/logo/logo.png";
import {
  FaHome,
  FaUsers,
  FaWallet,
  FaUserCog,
  FaSignOutAlt,
  FaUserTie,
  FaClipboardList,
  FaUpload,
  FaMoneyBillWave,
  FaPlus,
} from "react-icons/fa";
import { apiUrl, API_CONFIG } from "@/configs/api";
import Modal from "@/components/Modal";
import SmWalletCard from "@/components/sm-dashboard/SmWalletCard";
import { useAppContext } from "@/context/AppContext";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, handleLogout }) => {
  const pathname = usePathname();
  const { userData } = useAppContext();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const userRole = userData?.role || null;

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!userData?.id) return;

      try {
        setLoading(true);
        const userId = userData.id;

        const response = await axios.get(
          apiUrl(
            API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + userId + "/balance",
          ),
          { withCredentials: true },
        );

        setWalletBalance(response.data.data.wallet || 0);

        const profileResponse = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.PROFILE.GET + "/" + userId),
          { withCredentials: true },
        );

        if (profileResponse.data.user) {
          setAccountDetails({
            accName: profileResponse.data.user.accName,
            bankName: profileResponse.data.user.bankName,
            accNumber: profileResponse.data.user.accNumber,
          });
        }
      } catch (err) {
      
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [userData]);

  const NavItem = ({ href, icon: Icon, label, active }) => (
    <Link
      href={href}
      className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
          : "text-gray-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Icon
        className={`w-5 h-5 ${
          active ? "text-white" : "text-gray-400 group-hover:text-white"
        }`}
      />
      <span className="font-medium text-sm">{label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-lg"></div>
      )}
    </Link>
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-black/50 backdrop-blur-sm transition-opacity md:hidden ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
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

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <nav className="space-y-1">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-2">
              Dashboard
            </p>

            <NavItem
              href="/regional-dashboard"
              icon={FaHome}
              label="Regional Overview"
              active={pathname === "/regional-dashboard"}
            />

            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">
              Management
            </p>

           
             <NavItem
              href="/regional-dashboard/financial-report"
              icon={FaMoneyBillWave}
              label="Financial Reports"
              active={pathname.includes("/regional-dashboard/financial-report")}
            />
            <NavItem
              href="/regional-dashboard/create-team"
              icon={FaPlus}
              label="Create Team"
              active={pathname.includes("/regional-dashboard/create-team")}
            />

            {/* Role specific links - defaulting to show if SM or fallback */}

            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">
              Finance
            </p>

            <NavItem
              href="/regional-dashboard/personal-details"
              icon={FaUserCog}
              label="Settings"
              active={pathname.includes("/regional-dashboard/personal-details")}
            />
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-600/50 transition-all duration-200"
          >
            <div className="flex items-center space-x-2">
              <FaWallet className="w-5 h-5" />
              <span className="font-medium">Wallet</span>
            </div>
            <span className="text-sm font-bold">
              ₦{walletBalance?.balance?.toFixed(2) || "0.00"}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* Wallet Modal */}
        {isWalletModalOpen && (
          <Modal onClose={() => setIsWalletModalOpen(false)}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Wallet Details
              </h2>
              <button
                onClick={() => setIsWalletModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
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
            <SmWalletCard
              walletBalance={walletBalance}
              accountDetails={accountDetails}
              showWithdrawButton={true}
              onWithdraw={() => setIsWalletModalOpen(false)}
            />
          </Modal>
        )}
      </aside>
    </>
  );
};

export default Sidebar;

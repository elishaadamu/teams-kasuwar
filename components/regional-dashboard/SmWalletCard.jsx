"use client";
import React from "react";
import { FaCreditCard, FaUniversity as FaBank, FaWallet } from "react-icons/fa";
import { useRouter } from "next/navigation";

const SmWalletCard = ({
  walletBalance,
  accountDetails,
  showWithdrawButton = true,
  onWithdraw,
}) => {
  const router = useRouter();
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-2 md:p-6 text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-2xl"></div>

      <div className="relative z-10 flex flex-col sm:flex-row justify-between  items-start gap-6">
        <div>
          <p className="text-indigo-100 text-sm font-medium mb-1">
            Available Balance
          </p>
          <h2 className="text-4xl font-bold">
            ₦{walletBalance?.balance?.toFixed(2) || "0.00"}
          </h2>
        </div>

        {showWithdrawButton && (
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (onWithdraw) onWithdraw();
                router.push("/sales-manager/withdrawal-request");
              }}
              className="bg-white text-blue-600 px-4 md:px-6 py-2.5 rounded-lg font-semibold shadow hover:bg-blue-50 transition active:scale-95"
            >
              Withdraw Funds
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 justify-center md:grid-cols-3 gap-6 pt-6 border-t border-white/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <FaCreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-indigo-100">Account Name</p>
            <p className="font-medium text-sm">
              {accountDetails?.accName || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <FaBank className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-indigo-100">Bank Name</p>
            <p className="font-medium text-sm">
              {accountDetails?.bankName || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <FaWallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-indigo-100">Account Number</p>
            <p className="font-medium text-sm">
              {accountDetails?.accNumber || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmWalletCard;

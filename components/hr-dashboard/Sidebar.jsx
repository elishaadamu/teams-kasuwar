"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import { 
  FaUsers, 
  FaUserPlus, 
  FaChartLine, 
  FaExclamationTriangle, 
  FaFileInvoiceDollar, 
  FaIdCard, 
  FaHome,
  FaSignOutAlt
} from "react-icons/fa";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, handleLogout }) => {
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { name: "Dashboard", href: "/hr-dashboard", icon: FaHome },
    { name: "Onboarding", href: "/hr-dashboard/onboarding", icon: FaUserPlus },
    { name: "Staff Performance", href: "/hr-dashboard/performance", icon: FaChartLine },
    { name: "Disciplinary", href: "/hr-dashboard/disciplinary", icon: FaExclamationTriangle },
    { name: "Manage Payslips", href: "/hr-dashboard/payslips", icon: FaFileInvoiceDollar },
    { name: "ID Card Print", href: "/hr-dashboard/id-cards", icon: FaIdCard },
  ];

  // Determine logo based on theme
  // Use logo-white.png for dark mode, logo.png for light mode
  const currentTheme = mounted ? resolvedTheme : "dark";
  const logoSrc = currentTheme === "dark" ? "/logo-white.png" : "/logo.png";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 border-r border-slate-200 dark:border-slate-800 shadow-2xl`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <Link href="/" className="mx-auto block">
            <div className="relative w-48 h-16">
              {mounted && (
                <Image
                  src={logoSrc}
                  alt="Kasuwar Logo"
                  fill
                  className="object-contain"
                  priority
                />
              )}
            </div>
          </Link>
          <button
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? "bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : "group-hover:text-slate-900 dark:group-hover:text-white transition-colors"}`} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 font-bold text-sm shadow-sm"
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

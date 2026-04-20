"use client";
import React, { useState } from "react";
import Sidebar from "@/components/hr-dashboard/Sidebar";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HRDashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/20 dark:bg-slate-950/80 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <button
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            onClick={() => setIsSidebarOpen(true)}
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          
          <div className="flex items-center space-x-6 ml-auto">
            <ThemeToggle />
            <div className="flex items-center justify-end space-x-4">
              
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-xl group hover:scale-110 transition-transform cursor-pointer">
                <span className="text-white font-bold text-sm">HR</span>
              </div>

              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-tight">HR Administrator</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kasuwar Zamani Team</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Overflow */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 w-full max-w-7xl mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

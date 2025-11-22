"use client";
import React from "react";
import Link from "next/link";

const HomeClient = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-81px)] bg-gray-50 text-center px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
        Welcome Agents, BDMs, and BDs!
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl">
        This is the central hub for our valued partners. Please select your role
        and log in to your respective dashboard to access your tools and
        resources.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {/* Agent Login Card */}
        <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Agent Portal
          </h2>
          <p className="text-gray-500 mb-6">
            Access your dashboard to manage your activities.
          </p>
          <Link href="/signin-agent" legacyBehavior>
            <a className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
              Agent Login
            </a>
          </Link>
        </div>

        {/* BDM Login Card */}
        <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 h-16">
            Business Developer Manager Portal
          </h2>
          <p className="text-gray-500 mb-6">
            Manage your team and track performance.
          </p>
          <Link href="/signin-bdm" legacyBehavior>
            <a className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors">
              BDM Login
            </a>
          </Link>
        </div>

        {/* BD Login Card */}
        <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 h-16">
            Business Developer Portal
          </h2>
          <p className="text-gray-500 mb-6">
            Access your resources and manage your tasks.
          </p>
          <Link href="/signin-bd" legacyBehavior>
            <a className="inline-block bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 transition-colors">
              BD Login
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeClient;

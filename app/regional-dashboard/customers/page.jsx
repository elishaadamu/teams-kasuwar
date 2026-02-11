"use client";
import React from "react";
import ManageCustomers from "@/components/sm-dashboard/ManageCustomers";

const ManageCustomersPage = () => {
  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <ManageCustomers />
      </div>
    </div>
  );
};

export default ManageCustomersPage;

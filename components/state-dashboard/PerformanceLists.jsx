
import React from "react";
import { FaUserTie, FaUsers, FaChartBar, FaUserGraduate } from "react-icons/fa";

const PerformanceTable = ({ title, icon: Icon, data, columns, type }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <h3 className="font-bold text-gray-800">{title}</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4 font-semibold">Name</th>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 font-semibold">{col.label}</th>
            ))}
            <th className="px-6 py-4 font-semibold">Rank</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data && data.length > 0 ? (
            data.sort((a, b) => (b[columns[0].key] || 0) - (a[columns[0].key] || 0)).map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{item.firstName || item.name} {item.lastName || ''}</span>
                    <span className="text-xs text-gray-500">{item.email}</span>
                  </div>
                </td>
                {columns.map((col, idx) => (
                  <td key={idx} className="px-6 py-4 text-sm text-gray-600">
                    {item[col.key] || 0}
                  </td>
                ))}
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {index === 0 ? 'Top Performer' : `#${index + 1}`}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 2} className="px-6 py-8 text-center text-gray-500 text-sm">
                No performance data available for this category.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const PerformanceLists = ({ managers }) => {
  // Extracting data from managers object which should contain sm, bdm, and bd lists
  const smData = managers?.sm || [];
  const bdmData = managers?.bdm || [];
  const bdData = managers?.bd || [];

  const smColumns = [
    { label: "No of Sales", key: "sales" },
    { label: "No of Customers", key: "totalCustomers" },
    { label: "No of Agents", key: "totalAgents" },
  ];

  const bdmColumns = [
    { label: "No of Vendors", key: "totalVendors" },
    { label: "No of Customers", key: "totalCustomers" },
    { label: "No of BD", key: "totalBD" },
    { label: "No of Agents", key: "totalAgents" },
  ];

  const bdColumns = [
    { label: "No of Vendors", key: "totalVendors" },
    { label: "No of Customers", key: "totalCustomers" },
    { label: "No of Agents", key: "totalAgents" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-2">
         <FaChartBar className="text-blue-600" />
         <h2 className="text-xl font-bold text-gray-800">Performance Leaderboards</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <PerformanceTable 
          title="Sales Managers (SM) Performance" 
          icon={FaUserTie} 
          data={smData} 
          columns={smColumns}
          type="sm"
        />
        
        <PerformanceTable 
          title="BDM Managers Performance" 
          icon={FaUserGraduate} 
          data={bdmData} 
          columns={bdmColumns}
          type="bdm"
        />
        
        <PerformanceTable 
          title="Business Developers (BD) Performance" 
          icon={FaUsers} 
          data={bdData} 
          columns={bdColumns}
          type="bd"
        />
      </div>
    </div>
  );
};

export default PerformanceLists;

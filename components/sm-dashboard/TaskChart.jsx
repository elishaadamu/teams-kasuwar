import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { apiUrl, API_CONFIG } from "@/configs/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const TaskChart = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [effectiveOrders, setEffectiveOrders] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.POS.MY_ORDERS),
          { withCredentials: true },
        );

        const orderData = response.data.posOrders || response.data || [];
        setOrders(orderData);
        setTotalOrders(orderData.length);

        // Count effective orders (non-pending)
        const effective = orderData.filter(
          (order) => order.status !== "pending",
        ).length;
        setEffectiveOrders(effective);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Process orders by date for chart
  const getChartData = () => {
    const last7Days = [];
    const ordersPerDay = {};

    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        weekday: "short",
      });
      last7Days.push(dateStr);
      ordersPerDay[dateStr] = 0;
    }

    // Count orders per day
    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const dayStr = orderDate.toLocaleDateString("en-US", {
        weekday: "short",
      });
      if (ordersPerDay.hasOwnProperty(dayStr)) {
        ordersPerDay[dayStr]++;
      }
    });

    const submittedData = last7Days.map((day) => ordersPerDay[day]);
    const effectiveData = last7Days.map(
      (day) =>
        orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          const dayStr = orderDate.toLocaleDateString("en-US", {
            weekday: "short",
          });
          return dayStr === day && order.status !== "pending";
        }).length,
    );

    return {
      labels: last7Days,
      datasets: [
        {
          label: "Orders Submitted",
          data: submittedData,
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
        },
        {
          label: "Effective Orders",
          data: effectiveData,
          backgroundColor: "rgba(16, 185, 129, 0.5)",
          borderColor: "rgb(16, 185, 129)",
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const chartData = getChartData();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <FaCheckCircle className="text-green-500" />
        Task Overview
      </h3>
      <div className="h-64">
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Submitted
          </p>
          <p className="text-xl font-bold text-blue-600">{totalOrders}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Effective
          </p>
          <p className="text-xl font-bold text-green-500">{effectiveOrders}</p>
        </div>
      </div>
    </div>
  );
};

export default TaskChart;

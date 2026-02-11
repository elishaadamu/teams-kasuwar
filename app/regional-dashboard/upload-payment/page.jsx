"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { toast } from "react-toastify";
import { FaUpload, FaSearch, FaSpinner } from "react-icons/fa";
import { useAppContext } from "@/context/AppContext";

const UploadPaymentPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    state: "",
    lga: "",
    zipcode: "",
    receiptImage: null,
  });

  const { states, lgas, fetchLgas } = useAppContext();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = orders.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.products &&
            order.products.some((p) =>
              p.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )),
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.POS.MY_ORDERS),
        {
          withCredentials: true,
        },
      );

      if (response.data) {
        // Assuming response.data is the array of orders, or response.data.orders
        const ordersData = Array.isArray(response.data?.posOrders)
          ? response.data?.posOrders
          : response.data?.posOrders || [];
        // Sort by date desc (if createdAt exists)
        setOrders(
          ordersData.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          ),
        );
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    // Pre-fill form if data is available in the order, otherwise keep blank
    // The payload requirements: customerName, customerPhone, deliveryAddress, state, lga, zipcode
    setPaymentForm({
      customerName: "",
      customerPhone: order.phone || "",
      deliveryAddress: order.deliveryAddress || "",
      state: order.state || "",
      lga: order.lga || "",
      zipcode: order.zipcode || "",
      receiptImage: null,
    });
    // Trigger LGA fetch if state is present
    if (order.state) {
      fetchLgas(order.state);
    }
  };

  const handleInputChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentForm({ ...paymentForm, receiptImage: e.target.files[0] });
    }
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setPaymentForm({ ...paymentForm, state: newState, lga: "" });
    fetchLgas(newState);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!paymentForm.receiptImage) {
      return toast.error("Please upload a receipt image");
    }
    if (
      !paymentForm.customerName ||
      !paymentForm.customerPhone ||
      !paymentForm.deliveryAddress ||
      !paymentForm.state ||
      !paymentForm.lga
    ) {
      return toast.error("Please fill all required fields");
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("receiptImage", paymentForm.receiptImage);

      const payload = {
        customerName: paymentForm.customerName,
        customerPhone: paymentForm.customerPhone,
        deliveryAddress: paymentForm.deliveryAddress,
        state: paymentForm.state,
        lga: paymentForm.lga,
        zipcode: paymentForm.zipcode || "",
        receiptImage: {
          lastModified: paymentForm.receiptImage.lastModified,
          lastModifiedDate: paymentForm.receiptImage.lastModifiedDate,
          name: paymentForm.receiptImage.name,
          size: paymentForm.receiptImage.size,
          type: paymentForm.receiptImage.type,
          webkitRelativePath: paymentForm.receiptImage.webkitRelativePath,
        },
      };
      formData.append("payload", JSON.stringify(payload));

      const url =
        typeof API_CONFIG.ENDPOINTS.POS.UPLOAD_PAYMENT === "function"
          ? API_CONFIG.ENDPOINTS.POS.UPLOAD_PAYMENT(selectedOrder._id)
          : API_CONFIG.ENDPOINTS.POS.UPLOAD_PAYMENT.replace(
              ":posOrderId",
              selectedOrder._id,
            ); // Fallback

      const response = await axios.post(apiUrl(url), formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data) {
        toast.success("Payment uploaded successfully!");
        setSelectedOrder(null); // Close modal/form
        fetchOrders(); // Refresh list
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to upload payment");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Upload Payment Proof
        </h1>
        <p className="text-gray-500 text-sm">
          Select a pending order to upload payment details.
        </p>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6 relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID or Product Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <FaSpinner className="animate-spin text-blue-600 text-2xl" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center p-8 text-gray-500">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b">
                  <th className="p-3 font-medium">Order ID</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Products</th>
                  <th className="p-3 font-medium">Total</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs">
                      {order._id.substring(0, 8)}...
                    </td>
                    <td className="p-3">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      {(order.products || []).map((p) => p.name).join(", ")}
                    </td>
                    <td className="p-3 font-semibold">
                      ₦{(order.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.status === "submitted"
                            ? "bg-green-100 text-green-700"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleSelectOrder(order)}
                        className="text-blue-600 hover:underline hover:text-blue-800 font-medium"
                      >
                        Upload Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal / Form */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Upload Payment for Order #{selectedOrder._id.substring(0, 8)}
            </h2>

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Customer Name
                  </label>
                  <input
                    name="customerName"
                    value={paymentForm.customerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Customer Phone
                  </label>
                  <input
                    name="customerPhone"
                    value={paymentForm.customerPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Delivery Address
                </label>
                <textarea
                  name="deliveryAddress"
                  value={paymentForm.deliveryAddress}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="2"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    State
                  </label>
                  <select
                    name="state"
                    value={paymentForm.state}
                    onChange={handleStateChange}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    LGA
                  </label>
                  <select
                    name="lga"
                    value={paymentForm.lga}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    required
                  >
                    <option value="">Select LGA</option>
                    {lgas.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Zipcode (Optional)
                  </label>
                  <input
                    name="zipcode"
                    value={paymentForm.zipcode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="receipt-upload"
                />
                <label
                  htmlFor="receipt-upload"
                  className="cursor-pointer block"
                >
                  <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
                  <span className="text-sm text-gray-600 font-medium">
                    Click to upload Receipt Image
                  </span>
                  {paymentForm.receiptImage && (
                    <p className="text-xs text-green-600 mt-2 font-semibold">
                      Selected: {paymentForm.receiptImage.name}
                    </p>
                  )}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70 flex items-center gap-2"
                >
                  {uploading && <FaSpinner className="animate-spin" />}
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPaymentPage;

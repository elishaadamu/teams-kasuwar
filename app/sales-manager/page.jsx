"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { decryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import {
  FaBoxOpen,
  FaTruck,
  FaUserPlus,
  FaUsers,
  FaUpload,
  FaMoneyBillWave,
  FaClipboardList,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";
import SmWalletCard from "@/components/sm-dashboard/SmWalletCard";
import ManageCustomers from "@/components/sm-dashboard/ManageCustomers";
import TaskChart from "@/components/sm-dashboard/TaskChart";

const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const { states, lgas, fetchLgas } = useAppContext();

  // POS States
  const [posTab, setPosTab] = useState("product"); // 'product' | 'delivery'
  const [orderType, setOrderType] = useState("automatic"); // 'manual' | 'automatic'
  const [selectedProduct, setSelectedProduct] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);

  // Wallet State
  const [walletBalance, setWalletBalance] = useState({ balance: 0.0 });
  const [accountDetails, setAccountDetails] = useState(null);

  // Delivery Request States
  const [deliveryForm, setDeliveryForm] = useState({
    senderName: "",
    senderPhone: "",
    recipientName: "",
    recipientPhone: "",
    address: "",
  });

  const [posFormData, setPosFormData] = useState({
    deliveryAddress: "",
    state: "",
    lga: "",
    zipcode: "",
    phone: "",
    shippingFee: 0,
    tax: 0,
  });

  // Verification States
  const [verificationInput, setVerificationInput] = useState({
    email: "",
    phone: "",
  });
  const [verifiedCustomer, setVerifiedCustomer] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [products, setProducts] = useState([]); // Fetched from API

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.post(
          apiUrl(API_CONFIG.ENDPOINTS.PRODUCT.GET_PRODUCT),
          {}, // payload
          { withCredentials: true },
        );

        // Assuming response.data.products or response.data contains the array
        // Adjust based on actual API response structure.
        // If the user snippet just returns products directly:
        setProducts(response.data.products || response.data || []);
      } catch (err) {
        toast.error("Failed to load products");
      }
    };

    const init = async () => {
      try {
        const encryptedUser = localStorage.getItem("user");
        let userId = null;
        if (encryptedUser) {
          const decrypted = decryptData(encryptedUser);
          setUserData(decrypted);
          userId = decrypted.id || decrypted._id;
        }

        const promises = [fetchProducts()];

        if (userId) {
          promises.push(
            axios.get(
              apiUrl(
                API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance +
                  userId +
                  "/balance",
              ),
              { withCredentials: true },
            ),
            axios.get(apiUrl(API_CONFIG.ENDPOINTS.PROFILE.GET + "/" + userId), {
              withCredentials: true,
            }),
          );
        }

        const results = await Promise.allSettled(promises);

        // Handle Wallet Results if they exist (indices 1 and 2)
        if (userId && results[1] && results[1].status === "fulfilled") {
          setWalletBalance(results[1].value.data.data);
        }
        if (userId && results[2] && results[2].status === "fulfilled") {
          setAccountDetails(results[2].value.data.user);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleDeliveryChange = (e) => {
    setDeliveryForm({ ...deliveryForm, [e.target.name]: e.target.value });
  };

  const handlePosFormChange = (e) => {
    setPosFormData({ ...posFormData, [e.target.name]: e.target.value });
  };

  const handleVerifyCustomer = async (e) => {
    e.preventDefault();
    if (!verificationInput.email && !verificationInput.phone) {
      return toast.error("Please enter email or phone");
    }
    setVerifying(true);
    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.POS.CHECK_CUSTOMER),
        verificationInput,
        { withCredentials: true },
      );

      if (response.data) {
        setVerifiedCustomer(response.data.customer);
        toast.success("Customer verified!");
        // Auto-fill phone if available from verification or input
        setPosFormData((prev) => ({
          ...prev,
          phone: response.data.phone || verificationInput.phone || prev.phone,
        }));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Customer not found");
      setVerifiedCustomer(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleChangeCustomer = () => {
    setVerifiedCustomer(null);
    setVerificationInput({ email: "", phone: "" });
    setPosFormData((prev) => ({ ...prev, phone: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (posTab === "product") {
      if (!selectedProduct) return toast.error("Please select a product");

      setSubmitting(true);

      if (orderType === "manual") {
        try {
          const product = products.find(
            (p) => p._id === selectedProduct || p.id === selectedProduct,
          );
          const price = product?.price || 0;

          const payload = {
            vendorId: product ? product.vendor?._id : null,
            products: product
              ? [
                  {
                    productId: product._id || product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    vendorId: product.vendor?._id,
                  },
                ]
              : [],
            deliveryAddress: posFormData.deliveryAddress,
            state: posFormData.state,
            lga: posFormData.lga,
            zipcode: posFormData.zipcode,
            shippingFee: posFormData.shippingFee,
            tax: posFormData.tax,
            phone: posFormData.phone,
            totalAmount:
              price + Number(posFormData.shippingFee) + Number(posFormData.tax),
          };

          const response = await axios.post(
            apiUrl(API_CONFIG.ENDPOINTS.POS.CREATE),
            payload,
            {
              withCredentials: true,
            },
          );

          if (response.data) {
            toast.success("Order submitted for approval!");
            setSelectedProduct("");
            setReceiptFile(null);
            setPosFormData({
              deliveryAddress: "",
              state: "",
              lga: "",
              zipcode: "",
              phone: "",
              shippingFee: 0,
              tax: 0,
            });
          }
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to submit order",
          );
        } finally {
          setSubmitting(false);
        }
      } else {
        // Automatic Order - Call API
        try {
          // Find selected product details
          const product = products.find(
            (p) => p._id === selectedProduct || p.id === selectedProduct,
          );
          const price = product?.price || 0; // Adjust field name if needed

          const payload = {
            customerId: verifiedCustomer._id || verifiedCustomer.id,
            vendorId: product ? product.vendor?._id : null,
            products: product
              ? [
                  {
                    productId: product._id || product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    vendorId: product.vendor?._id,
                  },
                ]
              : [],
            deliveryAddress: posFormData.deliveryAddress,
            state: posFormData.state,
            lga: posFormData.lga,
            zipcode: posFormData.zipcode,
            shippingFee: posFormData.shippingFee,
            tax: posFormData.tax,
            phone: posFormData.phone,
            totalAmount:
              price + Number(posFormData.shippingFee) + Number(posFormData.tax),
          };

          const response = await axios.post(
            apiUrl(API_CONFIG.ENDPOINTS.POS.CREATE),
            payload,
            { withCredentials: true },
          );

          if (response.data) {
            toast.success("Order processed successfully!");
            // Reset form
            setSelectedProduct("");
            setPosFormData({
              deliveryAddress: "",
              state: "",
              lga: "",
              zipcode: "",
              phone: "",
              shippingFee: 0,
              tax: 0,
            });
          }
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to create order",
          );
        } finally {
          setSubmitting(false);
        }
      }
    } else {
      // Delivery
      if (!deliveryForm.senderName || !deliveryForm.recipientName)
        return toast.error("Please fill in details");
      toast.success("Delivery request sent!");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Welcome back, {userData?.firstName || "Manager"}
          </p>
        </div>
        <Link
          href="/sales-manager/customers"
          className="group flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
        >
          <FaUsers className="text-blue-600 group-hover:text-white transition-colors" />
          Manage Customers
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - POS & ORDERS */}
        <div className="lg:col-span-2 space-y-8">
          {/* POS Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <FaClipboardList className="text-blue-600" />
                Point of Sale
              </h2>
              <div className="flex bg-gray-200 rounded-lg p-1 text-xs font-medium">
                <button
                  onClick={() => setPosTab("product")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    posTab === "product"
                      ? "bg-white shadow text-gray-800"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Product Order
                </button>
                <button
                  onClick={() => setPosTab("delivery")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    posTab === "delivery"
                      ? "bg-white shadow text-gray-800"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Delivery Request
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {posTab === "product" && (
                  <>
                    {/* Order Type Toggle */}
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() => {
                          setOrderType("automatic");
                          // If switching to automatic, we might need to reset if not verified, or keep if verified
                        }}
                        className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center text-center transition-all ${
                          orderType === "automatic"
                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <FaMoneyBillWave
                          className={`w-6 h-6 mb-2 ${
                            orderType === "automatic"
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        />
                        <span className="font-semibold text-sm text-gray-800">
                          Automatic
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Direct wallet charge
                        </span>
                      </div>
                      <div
                        onClick={() => setOrderType("manual")}
                        className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center text-center transition-all ${
                          orderType === "manual"
                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <FaUpload
                          className={`w-6 h-6 mb-2 ${
                            orderType === "manual"
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        />
                        <span className="font-semibold text-sm text-gray-800">
                          Manual
                        </span>
                        <span className="text-xs text-gray-500 mt-1"></span>
                      </div>
                    </div>

                    {/* Verification Section for Automatic Orders */}
                    {orderType === "automatic" && !verifiedCustomer && (
                      <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl space-y-4">
                        <h3 className="font-semibold text-gray-800">
                          Verify Customer
                        </h3>
                        <p className="text-xs text-gray-500">
                          Enter either email or phone number (or both) to verify
                          customer
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            placeholder="Enter Customer Email"
                            className="px-4 py-2 border rounded-lg text-sm"
                            value={verificationInput.email}
                            onChange={(e) =>
                              setVerificationInput({
                                ...verificationInput,
                                email: e.target.value,
                              })
                            }
                          />
                          <input
                            placeholder="Enter Customer Phone"
                            className="px-4 py-2 border rounded-lg text-sm"
                            value={verificationInput.phone}
                            onChange={(e) =>
                              setVerificationInput({
                                ...verificationInput,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyCustomer}
                          disabled={verifying}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {verifying ? "Verifying..." : "Check Customer"}
                        </button>
                      </div>
                    )}

                    {/* Verified Customer Display */}
                    {orderType === "automatic" && verifiedCustomer && (
                      <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-green-800">
                            Verified Customer
                          </p>
                          <p className="text-sm text-green-700">
                            {verifiedCustomer.firstName}{" "}
                            {verifiedCustomer.lastName}
                          </p>
                          <p className="text-xs text-green-600">
                            {verifiedCustomer.email} | {verifiedCustomer.phone}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleChangeCustomer}
                          className="text-xs text-red-500 hover:text-red-700 underline"
                        >
                          Change
                        </button>
                      </div>
                    )}

                    {/* Product & Shipping Form - Show if Manual OR (Automatic AND Verified) */}
                    {(orderType === "manual" ||
                      (orderType === "automatic" && verifiedCustomer)) && (
                      <>
                        {/* Product Select */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Product
                          </label>
                          <select
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                          >
                            <option value="">-- Choose Product --</option>
                            {products.map((p) => (
                              <option key={p._id || p.id} value={p._id || p.id}>
                                {p.name} - ₦{(p.price || 0).toLocaleString()}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* POS Extra Fields (Address & Contact) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                          <div className="md:col-span-2 text-xs font-semibold text-gray-500 uppercase">
                            Shipping Details
                          </div>

                          <input
                            name="phone"
                            placeholder="Customer Phone"
                            value={posFormData.phone}
                            onChange={handlePosFormChange}
                            className="px-4 py-2 border rounded-lg text-sm"
                          />
                          <input
                            name="deliveryAddress"
                            placeholder="Delivery Address"
                            value={posFormData.deliveryAddress}
                            onChange={handlePosFormChange}
                            className="px-4 py-2 border rounded-lg text-sm"
                          />
                          <select
                            name="state"
                            value={posFormData.state}
                            onChange={(e) => {
                              handlePosFormChange(e);
                              fetchLgas(e.target.value);
                            }}
                            className="px-4 py-2 border rounded-lg text-sm bg-white"
                          >
                            <option value="">-- Select State --</option>
                            {states.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>

                          <select
                            name="lga"
                            value={posFormData.lga}
                            onChange={handlePosFormChange}
                            className="px-4 py-2 border rounded-lg text-sm bg-white"
                          >
                            <option value="">-- Select LGA --</option>
                            {lgas.map((l) => (
                              <option key={l} value={l}>
                                {l}
                              </option>
                            ))}
                          </select>
                          <input
                            name="zipcode"
                            placeholder="Zipcode"
                            value={posFormData.zipcode}
                            onChange={handlePosFormChange}
                            className="px-4 py-2 border rounded-lg text-sm"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {posTab === "delivery" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-800 border-b pb-2 mb-3">
                        Sender Details
                      </h3>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Sender Name
                      </label>
                      <input
                        name="senderName"
                        onChange={handleDeliveryChange}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Sender Phone
                      </label>
                      <input
                        name="senderPhone"
                        onChange={handleDeliveryChange}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="080..."
                      />
                    </div>

                    <div className="md:col-span-2 mt-2">
                      <h3 className="text-sm font-semibold text-gray-800 border-b pb-2 mb-3">
                        Recipient Details
                      </h3>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Recipient Name
                      </label>
                      <input
                        name="recipientName"
                        onChange={handleDeliveryChange}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Recipient Phone
                      </label>
                      <input
                        name="recipientPhone"
                        onChange={handleDeliveryChange}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="080..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Delivery Address
                      </label>
                      <textarea
                        name="address"
                        onChange={handleDeliveryChange}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        rows="2"
                        placeholder="Enter delivery location"
                      ></textarea>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 hover:bg-black transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" /> Processing...
                    </>
                  ) : posTab === "product" ? (
                    orderType === "manual" ? (
                      "Submit for Approval"
                    ) : (
                      "Process Payment"
                    )
                  ) : (
                    "Request Delivery"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - CHARTS & WALLET */}
        <div className="lg:col-span-1 space-y-8">
          <TaskChart />
        </div>
      </div>

      {/* Customers Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <ManageCustomers />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

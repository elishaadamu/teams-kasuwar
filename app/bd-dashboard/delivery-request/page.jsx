"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppContext } from "@/context/AppContext";
import statesData from "@/lib/states.json";
import lgasData from "@/lib/lgas.json";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useRouter } from "next/navigation";

const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  children,
}) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children || (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    )}
  </div>
);

const RequestDelivery = () => {
  const { userData } = useAppContext();
  const router = useRouter();
  const [deliveryType, setDeliveryType] = useState(""); // 'inter-state' or 'intra-state'
  const [states] = useState(statesData.state);
  const [pickupLgas, setPickupLgas] = useState([]);
  const [dropoffLgas, setDropoffLgas] = useState([]);
  const [lgaLoading, setLgaLoading] = useState({
    pickup: false,
    dropoff: false,
  });
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Sender Info (Pickup)
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    senderState: "",
    senderLGA: "",
    deliveryDuration: "",
    // Recipient Info (Dropoff)
    receipientName: "",
    receipientPhone: "",
    receipientAltPhone: "",
    receipientAddress: "",
    receipientState: "",
    receipientLGA: "",
    // Backward compatibility for UI logic
    pickupState: "", // will be senderState
    dropoffState: "", // will be receipientState
    // Other details
    goodsDescription: "",
  });

  // Fetch LGAs when a state changes
  const fetchLgasForState = (state, type) => {
    if (!state) return;
    setLgaLoading((prev) => ({ ...prev, [type]: true }));
    // Simulate a short delay to allow UI to update loading state
    setTimeout(() => {
      const lgas = lgasData[state] || [];
      if (type === "pickup") {
        setPickupLgas(lgas);
        setFormData((prev) => ({ ...prev, senderLGA: "" }));
      } else {
        setDropoffLgas(lgas);
        setFormData((prev) => ({ ...prev, receipientLGA: "" }));
      }
      setLgaLoading((prev) => ({ ...prev, [type]: false }));
    }, 200); // 200ms delay
  };

  useEffect(() => {
    if (formData.senderState) {
      fetchLgasForState(formData.senderState, "pickup");
    }
  }, [formData.senderState]);

  useEffect(() => {
    if (formData.receipientState) {
      fetchLgasForState(formData.receipientState, "dropoff");
    }
  }, [formData.receipientState]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Keep pickupState and dropoffState in sync for the useEffect hooks
    if (name === "senderState") {
      setFormData((prev) => ({ ...prev, pickupState: value }));
      if (deliveryType === "intra-state") {
        setFormData((prev) => ({ ...prev, receipientState: value }));
        fetchLgasForState(value, "dropoff");
      }
    }
    if (name === "receipientState") {
      setFormData((prev) => ({ ...prev, dropoffState: value }));
    }
  };

  const handleDeliveryTypeChange = (e) => {
    const newType = e.target.value;
    setDeliveryType(newType);
    // Reset states if delivery type changes
    setFormData((prev) => ({
      ...prev,
      senderState: "",
      senderLGA: "",
      receipientState: "",
      receipientLGA: "",
    }));
    setPickupLgas([]);
    setDropoffLgas([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userId = userData?._id || userData?.id;
    if (!userId) {
      toast.error("User not authenticated. Please sign in again.");
      setLoading(false);
      return;
    }

    const payload = {
      userId: userId,
      requestType: deliveryType,
      senderName: formData.senderName,
      senderPhone: formData.senderPhone,
      senderAddress: formData.senderAddress,
      senderState: formData.senderState,
      senderLGA: formData.senderLGA,
      deliveryDuration: formData.deliveryDuration,
      description: formData.goodsDescription,
      receipientName: formData.receipientName,
      receipientPhone: formData.receipientPhone,
      receipientAltPhone: formData.receipientAltPhone,
      receipientAddress: formData.receipientAddress,
      receipientState:
        deliveryType === "intra-state"
          ? formData.senderState
          : formData.receipientState,
      receipientLGA: formData.receipientLGA,
    };

    console.log("Payload:", payload);

    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.DELIVERY.REQUEST_DELIVERY),
        payload
      );
      console.log("Submitting payload:", payload);
      toast.success(
        "Delivery request created successfully! Redirecting in 5 seconds..."
      );
      setTimeout(() => {
        router.push("/bd-dashboard/delivery-payment");
      }, 5000);
    } catch (error) {
      console.error("Error creating delivery request:", error);
      toast.error(
        error.response?.data?.message || "Failed to create delivery request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ToastContainer />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Request Delivery Service
          </h1>
          <p className="text-gray-500 text-sm ml-11">Fill in the details below to initiate a new delivery request</p>
        </div>
        <button 
          onClick={() => router.push("/bd-dashboard/delivery-payment")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
        >
          View My Requests
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Delivery Type Selection */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="max-w-md">
            <FormField label="Delivery Type" name="deliveryType" required>
              <select
                value={deliveryType}
                onChange={handleDeliveryTypeChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2.5 text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-xl transition-all"
              >
                <option value="">Select Delivery Type</option>
                <option value="inter-state">Inter-state Delivery (Between States)</option>
                <option value="intra-state">Intra-state Delivery (Within same State)</option>
              </select>
            </FormField>
          </div>
        </div>

        {deliveryType && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pickup Details */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                <div className="p-1.5 bg-orange-100 rounded-md">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="font-bold text-gray-800">Sender Details (Pickup)</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="sm:col-span-2">
                  <FormField
                    label="Sender Name"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter sender's full name"
                  />
                </div>
                <FormField
                  label="Sender Phone"
                  name="senderPhone"
                  value={formData.senderPhone}
                  onChange={handleInputChange}
                  required
                  type="tel"
                  placeholder="Enter phone number"
                />
                <FormField
                  label="Delivery Duration"
                  name="deliveryDuration"
                  required
                >
                  <select
                    name="deliveryDuration"
                    value={formData.deliveryDuration}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-xl transition-all"
                  >
                    <option value="">Select Duration</option>
                    <option value="standard">Standard (3-5 days)</option>
                    <option value="express">Express (24-48 hours)</option>
                  </select>
                </FormField>
                <FormField label="State" name="senderState" required>
                  <select
                    name="senderState"
                    value={formData.senderState}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-xl transition-all"
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="LGA" name="senderLGA" required>
                  <select
                    name="senderLGA"
                    value={formData.senderLGA}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.senderState || lgaLoading.pickup}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-xl transition-all disabled:bg-gray-50"
                  >
                    <option value="">
                      {lgaLoading.pickup ? "Loading..." : "Select LGA"}
                    </option>
                    {pickupLgas.map((lga) => (
                      <option key={lga} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                </FormField>
                <div className="sm:col-span-2">
                  <FormField
                    label="Address"
                    name="senderAddress"
                    value={formData.senderAddress}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter full pickup address"
                  />
                </div>
              </div>
            </div>

            {/* Dropoff Details */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                <div className="p-1.5 bg-green-100 rounded-md">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h2 className="font-bold text-gray-800">Recipient Details (Dropoff)</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="sm:col-span-2">
                  <FormField
                    label="Recipient Name"
                    name="receipientName"
                    value={formData.receipientName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter recipient's full name"
                  />
                </div>
                <FormField
                  label="Recipient Phone"
                  name="receipientPhone"
                  value={formData.receipientPhone}
                  onChange={handleInputChange}
                  required
                  type="tel"
                  placeholder="Enter phone number"
                />
                <FormField
                  label="Recipient Alt. Phone"
                  name="receipientAltPhone"
                  value={formData.receipientAltPhone}
                  onChange={handleInputChange}
                  type="tel"
                  placeholder="Alternative phone number"
                />

                {deliveryType === "inter-state" && (
                  <FormField label="State" name="receipientState" required>
                    <select
                      name="receipientState"
                      value={formData.receipientState}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-xl transition-all"
                    >
                      <option value="">Select State</option>
                      {states.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </FormField>
                )}
                <FormField label="LGA" name="receipientLGA" required>
                  <select
                    name="receipientLGA"
                    value={formData.receipientLGA}
                    onChange={handleInputChange}
                    required
                    disabled={
                      lgaLoading.dropoff ||
                      (deliveryType === "inter-state"
                        ? !formData.receipientState
                        : !formData.senderState)
                    }
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-xl transition-all disabled:bg-gray-50"
                  >
                    <option value="">
                      {lgaLoading.dropoff ? "Loading..." : "Select LGA"}
                    </option>
                    {dropoffLgas.map((lga) => (
                      <option key={lga} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                </FormField>
                <div className="sm:col-span-2">
                  <FormField
                    label="Address"
                    name="receipientAddress"
                    value={formData.receipientAddress}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter full dropoff address"
                  />
                </div>
              </div>
            </div>

            {/* Other Details */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                <div className="p-1.5 bg-purple-100 rounded-md">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h2 className="font-bold text-gray-800">Package Details</h2>
              </div>
              
              <FormField
                label="Goods Description"
                name="goodsDescription"
                required
              >
                <textarea
                  name="goodsDescription"
                  value={formData.goodsDescription}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Describe the item(s) being delivered (e.g., Electronic gadgets, Clothing, Fragile items...)"
                  className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm transition-all"
                ></textarea>
              </FormField>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!deliveryType || loading}
            className="w-full lg:w-64 bg-slate-900 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 hover:bg-black transition-all transform active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestDelivery;

"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { FaUserEdit, FaUniversity, FaUserCheck, FaIdCard, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaGlobe, FaShieldAlt } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";

const FormField = ({
  label,
  name,
  value,
  isEditing,
  onChange,
  type = "text",
  readOnly = false,
  icon: Icon,
}) => (
  <div className="space-y-1">
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
      {Icon && <Icon className="text-gray-400 w-3.5 h-3.5" />}
      {label}
    </label>
    {isEditing && !readOnly ? (
      type === "textarea" ? (
        <textarea
          name={name}
          value={value || ""}
          onChange={onChange}
          rows="3"
          className="mt-1 p-3 block w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-slate-500 focus:ring-4 focus:ring-slate-500/10 sm:text-sm transition-all outline-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          className="mt-1 p-3 block w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-slate-500 focus:ring-4 focus:ring-slate-500/10 sm:text-sm transition-all outline-none"
        />
      )
    ) : (
      <div className="mt-1 p-3 text-gray-900 font-medium bg-gray-50/50 border border-gray-100 rounded-xl min-h-[46px] flex items-center">
        {value || <span className="text-gray-400 italic">Not provided</span>}
      </div>
    )}
  </div>
);

const PersonalDetails = () => {
  const { userData, fetchUserData, states, lgas, fetchLgas } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    localGovt: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    role: "",
  });

  const fetchProfile = async () => {
    if (!userData?.id) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl(API_CONFIG.ENDPOINTS.PROFILE.GET_BDM)}`,
        { withCredentials: true },
      );
      
      const user = response.data.user || response.data.data?.manager || response.data.data || response.data;
      if (user) {
        setProfile({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          role: user.role || "Executive Admin",
          state: user.state || "",
          localGovt: user.localGovt || "",
          bankName: user.bankName || "",
          accountName: user.accName || user.accountName || "",
          accountNumber: user.accNumber || user.accountNumber || "",
        });
        
        if (user.state) {
            fetchLgas(user.state);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch latest profile info");
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (name === "state") {
        fetchLgas(value);
        setProfile((prev) => ({ ...prev, localGovt: "" }));
    }
  };

  const handleUpdateProfile = async () => {
    if (!userData?.id) {
      toast.error("User session expired");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        address: profile.address,
        state: profile.state,
        localGovt: profile.localGovt,
        bankName: profile.bankName,
        accountName: profile.accountName,
        accountNumber: profile.accountNumber,
      };

      const response = await axios.put(
        `${apiUrl(API_CONFIG.ENDPOINTS.PROFILE.UPDATE_USER)}/${userData.id}`,
        payload,
        { withCredentials: true },
      );

      if (response.data) {
        await fetchUserData();
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save profile changes");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 animate-in fade-in duration-500">
      <ToastContainer />
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-900/5 p-8 md:p-12 border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-10 border-b border-slate-100 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-slate-500/20">
              {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Executive Profile
              </h1>
              <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span>
                System Administrator Account
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-lg ${
              isEditing 
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none" 
                : "bg-slate-900 text-white hover:bg-black hover:-translate-y-1 shadow-slate-900/20"
            }`}
          >
            {isEditing ? (
              "Cancel"
            ) : (
              <>
                <FaUserEdit className="text-lg" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        <div className="space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <FaIdCard className="text-slate-900 text-sm" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Executive Identity</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 bg-slate-50/30 p-8 rounded-3xl border border-slate-50">
              <FormField
                label="First Name"
                name="firstName"
                value={profile.firstName}
                isEditing={isEditing}
                onChange={handleInputChange}
                icon={FaUserCheck}
              />
              <FormField
                label="Last Name"
                name="lastName"
                value={profile.lastName}
                isEditing={isEditing}
                onChange={handleInputChange}
                icon={FaUserCheck}
              />
              <FormField
                label="Primary Email"
                name="email"
                value={profile.email}
                isEditing={isEditing}
                readOnly
                icon={FaEnvelope}
              />
              <FormField
                label="Direct Line"
                name="phone"
                value={profile.phone}
                isEditing={isEditing}
                onChange={handleInputChange}
                type="tel"
                icon={FaPhoneAlt}
              />
              <div className="md:col-span-2">
                <FormField
                  label="Primary Residence"
                  name="address"
                  value={profile.address}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  type="textarea"
                  icon={FaMapMarkerAlt}
                />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <FaGlobe className="text-slate-900 text-sm" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Regional Assignment</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-slate-50/20 p-8 rounded-3xl border border-slate-100/50">
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FaGlobe className="text-gray-400 w-3.5 h-3.5" />
                        Allocated State
                    </label>
                    {isEditing ? (
                        <select
                            name="state"
                            value={profile.state || ""}
                            onChange={handleInputChange}
                            className="mt-1 p-3 block w-full rounded-xl border border-slate-200 bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 sm:text-sm transition-all outline-none"
                        >
                            <option value="">Select State</option>
                            {states.map((state) => (
                                <option key={state} value={state}>
                                    {state}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="mt-1 p-3 text-slate-900 font-medium bg-white border border-slate-100 rounded-xl min-h-[46px] flex items-center">
                            {profile.state || <span className="text-slate-400 italic">Not set</span>}
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <FaGlobe className="text-gray-400 w-3.5 h-3.5" />
                        Assigned LGA
                    </label>
                    {isEditing ? (
                        <select
                            name="localGovt"
                            value={profile.localGovt || ""}
                            onChange={handleInputChange}
                            className="mt-1 p-3 block w-full rounded-xl border border-slate-200 bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 sm:text-sm transition-all outline-none"
                        >
                            <option value="">Select LGA</option>
                            {lgas.map((lga) => (
                                <option key={lga} value={lga}>
                                    {lga}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="mt-1 p-3 text-slate-900 font-medium bg-white border border-slate-100 rounded-xl min-h-[46px] flex items-center">
                            {profile.localGovt || <span className="text-slate-400 italic">Not set</span>}
                        </div>
                    )}
                </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <FaUniversity className="text-slate-900 text-sm" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Settlement Accounts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 bg-slate-50/20 p-8 rounded-3xl border border-slate-100/50">
              <FormField
                label="Bank Name"
                name="bankName"
                value={profile.bankName}
                isEditing={isEditing}
                onChange={handleInputChange}
                icon={FaUniversity}
              />
              <FormField
                label="Account Number"
                name="accountNumber"
                value={profile.accountNumber}
                isEditing={isEditing}
                onChange={handleInputChange}
                type="number"
                icon={FaUniversity}
              />
              <div className="md:col-span-2">
                <FormField
                  label="Account Holder"
                  name="accountName"
                  value={profile.accountName}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={FaUserCheck}
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-8 text-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 border-2 border-dashed border-slate-200">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                <FaShieldAlt className="text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Authority Level</p>
                <h3 className="text-xl font-black text-slate-900 capitalize">{profile.role || "Executive Admin"}</h3>
              </div>
            </div>
            <div className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-slate-900/20">
              Super Admin Access
            </div>
          </section>
        </div>

        {isEditing && (
          <div className="flex justify-end mt-12 pt-8 border-t border-slate-100">
            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="px-10 py-4 text-sm font-black text-white bg-slate-900 rounded-2xl hover:bg-black disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 shadow-xl shadow-slate-900/10 hover:-translate-y-1"
            >
              {loading ? "Saving Changes..." : "Update Authorized Profile"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalDetails;

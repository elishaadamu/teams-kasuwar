"use client";
import React, { useState, useEffect } from "react";
import { 
  FaUserShield, FaUserPlus, FaEnvelope, FaPhone, FaLock, FaUserTie, 
  FaVenusMars, FaRing, FaCalendarAlt, FaHome, FaCity, FaMapMarkerAlt, FaCreditCard, FaUniversity, 
  FaFileInvoice, FaIdCard, FaPassport, FaBriefcase, FaTimes
} from "react-icons/fa";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Onboarding() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "sm", // Default to SM
    password: "",
    gender: "",
    maritalStatus: "",
    dateOfBirth: "",
    address: "",
    localGovt: "",
    state: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
    validId: "",
    passportPhoto: null
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      if (file) {
        if (file.size > 50 * 1024) {
          alert("Image must be less than 50KB"); // Standard browser alert
          toast.error("Image must be less than 50KB");
          e.target.value = "";
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, [name]: reader.result }));
        };
        reader.readAsDataURL(file);
      } else {
        setFormData(prev => ({ ...prev, [name]: null }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const payload = {};
    Object.keys(formData).forEach(key => {
      if (key === 'password' && !formData.password) {
        payload.password = formData.phone; // Auto-fill password if empty (use phone)
      } else if (formData[key] !== null && formData[key] !== "") {
        payload[key] = formData[key];
      }
    });
    
    console.log("=== Registration Payload ===");
    console.log(payload);

    try {
      const endpoint = API_CONFIG.ENDPOINTS.HR.REGISTER_STAFF;
      
      const resp = await axios.post(apiUrl(endpoint), payload, { 
        withCredentials: true
      });
      
      if (resp.data?.success || resp?.status === 200 || resp?.status === 201) {
        toast.success(`${formData.role.toUpperCase()} Created Successfully!`);
        setFormData({
          firstName: "", lastName: "", email: "", phone: "", role: "sm", password: "",
          gender: "", maritalStatus: "", dateOfBirth: "", address: "", localGovt: "", state: "",
          accountName: "", accountNumber: "", bankName: "", validId: "", passportPhoto: null
        });
        // reset file inputs
        document.querySelectorAll('input[type="file"]').forEach(input => input.value = "");
      } else {
        toast.error(resp.data?.message || "Failed to create staff");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-10">
      <ToastContainer theme="dark" position="top-right" />
      
      {/* Page Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-black text-white px-2 border-l-8 border-blue-600">
          Staff <span className="text-blue-500">Onboarding</span>
        </h1>
        <p className="text-slate-400 text-lg font-medium leading-relaxed">
          Create new staff profiles and assign them to specific roles within the ecosystem.
        </p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none rounded-full" />
        
        <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section: Deployment Setup */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-white border-b border-slate-700 pb-2 mb-4">Deployment Setup</h3>
            <label className="text-xs uppercase font-black text-slate-500 tracking-[0.2em]">Select Deployment Tier <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-4">
              {["bd", "bdm", "sm"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, role: r }))}
                  className={`flex-1 py-4 px-6 rounded-3xl border-2 transition-all duration-300 flex items-center justify-center gap-3 font-bold text-sm tracking-wide shadow-xl ${
                    formData.role === r 
                      ? "bg-blue-600 border-blue-400 text-white scale-[1.02] ring-4 ring-blue-600/20" 
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                  }`}
                >
                  {r === "sm" ? <FaUserTie className="w-5 h-5" /> : r === "bdm" ? <FaUserShield className="w-5 h-5" /> : <FaBriefcase className="w-5 h-5" />}
                  {r === "sm" ? "Sales Manager (SM)" : r === "bdm" ? "Business Dev. Manager (BDM)" : "Business Developer (BD)"}
                </button>
              ))}
            </div>
          </div>



          {/* Section: Basic Info */}
          <div className="md:col-span-2 mt-6">
            <h3 className="text-xl font-bold text-white border-b border-slate-700 pb-2">Personal Information</h3>
          </div>
          <TextInput label="First Name *" name="firstName" required icon={FaUserPlus} value={formData.firstName} onChange={handleInputChange} placeholder="E.g. John" />
          <TextInput label="Last Name *" name="lastName" required icon={FaUserPlus} value={formData.lastName} onChange={handleInputChange} placeholder="E.g. Doe" />
          <TextInput label="Email Address *" type="email" required name="email" icon={FaEnvelope} value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
          <TextInput label="Phone Number *" name="phone" required icon={FaPhone} value={formData.phone} onChange={handleInputChange} placeholder="080 1234 5678" />
          
          <div className="space-y-4">
            <label className="text-xs uppercase font-black text-slate-500 tracking-[0.2em] flex items-center gap-2">
              <FaVenusMars className="text-blue-500" /> Gender
            </label>
            <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full h-14 bg-slate-950/80 border-2 border-slate-800 rounded-2xl px-6 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none transition-all shadow-inner font-medium">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-xs uppercase font-black text-slate-500 tracking-[0.2em] flex items-center gap-2">
              <FaRing className="text-blue-500" /> Marital Status
            </label>
            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="w-full h-14 bg-slate-950/80 border-2 border-slate-800 rounded-2xl px-6 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none transition-all shadow-inner font-medium">
              <option value="">Select Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>

          <TextInput label="Date of Birth" type="date" name="dateOfBirth" icon={FaCalendarAlt} value={formData.dateOfBirth} onChange={handleInputChange} />
          <TextInput label="Address" name="address" icon={FaHome} value={formData.address} onChange={handleInputChange} placeholder="123 Main St" />
          <TextInput label="Local Govt" name="localGovt" icon={FaCity} value={formData.localGovt} onChange={handleInputChange} placeholder="Ikeja" />
          <TextInput label="State" name="state" icon={FaMapMarkerAlt} value={formData.state} onChange={handleInputChange} placeholder="Lagos" />

          {/* Section: Bank Details */}
          <div className="md:col-span-2 mt-6">
            <h3 className="text-xl font-bold text-white border-b border-slate-700 pb-2">Financial Details</h3>
          </div>
          <TextInput label="Account Name" name="accountName" icon={FaUserTie} value={formData.accountName} onChange={handleInputChange} placeholder="John Doe" />
          <TextInput label="Account Number" name="accountNumber" icon={FaFileInvoice} value={formData.accountNumber} onChange={handleInputChange} placeholder="0123456789" />
          <TextInput label="Bank Name" name="bankName" icon={FaUniversity} value={formData.bankName} onChange={handleInputChange} placeholder="First Bank" />

          {/* Section: Documents */}
          <div className="md:col-span-2 mt-6">
            <h3 className="text-xl font-bold text-white border-b border-slate-700 pb-2">Documents</h3>
          </div>
          <TextInput label="Valid ID Number" name="validId" icon={FaIdCard} value={formData.validId} onChange={handleInputChange} placeholder="E.g. NIN, Passport No." />
          <div className="space-y-4">
            <FileInput label="Passport Photograph" name="passportPhoto" icon={FaPassport} onChange={handleInputChange} accept="image/*" />
            {formData.passportPhoto && (
              <div className="mt-2 relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950/50 group/preview">
                <img src={formData.passportPhoto} alt="Passport" className="w-full h-full object-cover" />
                <div 
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                  onClick={() => {
                    setFormData(p => ({ ...p, passportPhoto: null }));
                    const fileInput = document.querySelector('input[name="passportPhoto"]');
                    if (fileInput) fileInput.value = "";
                  }}
                >
                  <FaTimes size={20} />
                </div>
              </div>
            )}
          </div>

          {/* Account Security */}
          <div className="md:col-span-2 mt-6">
            <h3 className="text-xl font-bold text-white border-b border-slate-700 pb-2">Security Override</h3>
          </div>
          <div className="md:col-span-2 space-y-4">
             <TextInput 
              label="Temporary Password" 
              type="password" 
              name="password" 
              icon={FaLock} 
              value={formData.password} 
              onChange={handleInputChange} 
              placeholder="Leave blank to use phone number default" 
            />
          </div>

          <div className="md:col-span-2 mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg tracking-widest uppercase transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-600/30 active:scale-[0.98] disabled:opacity-70 disabled:grayscale"
            >
              {isLoading ? "Deploying User..." : "Initiate Deployment"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}

const TextInput = ({ label, name, value, onChange, placeholder, icon: Icon, type = "text", required = false }) => (
  <div className="space-y-4 group">
    <label className="text-xs uppercase font-black text-slate-500 tracking-[0.2em] group-focus-within:text-blue-500 transition-colors flex items-center gap-2">
      <Icon className="text-blue-500/50 group-focus-within:text-blue-500" /> {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full h-14 bg-slate-950/80 border-2 border-slate-800 rounded-2xl px-6 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none transition-all shadow-inner font-medium"
      />
    </div>
  </div>
);

const FileInput = ({ label, name, onChange, icon: Icon, accept }) => (
  <div className="space-y-4 group">
    <label className="text-xs uppercase font-black text-slate-500 tracking-[0.2em] group-hover:text-blue-500 transition-colors flex items-center gap-2">
      <Icon className="text-blue-500/50 group-hover:text-blue-500" /> {label}
    </label>
    <div className="relative">
      <input
        type="file"
        name={name}
        onChange={onChange}
        accept={accept}
        className="w-full text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all font-medium border-2 border-dashed border-slate-700 p-2 rounded-2xl bg-slate-950/80"
      />
    </div>
  </div>
);

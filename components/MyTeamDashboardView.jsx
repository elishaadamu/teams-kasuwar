"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import { FaUserTie, FaUsers, FaSpinner, FaLayerGroup, FaUserPlus, FaTimes, FaExchangeAlt, FaWallet, FaChartLine, FaPlusCircle, FaChevronRight, FaArrowRight, FaBox, FaStore, FaUserCheck, FaTruck, FaClipboardList, FaBriefcase, FaIdBadge, FaUser, FaEnvelope, FaPhone, FaLock, FaMapMarkerAlt, FaGlobe, FaUniversity, FaFileAlt, FaCamera, FaVenusMars, FaHeart, FaCalendarAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import statesData from "@/lib/states.json";
import lgasData from "@/lib/lgas.json";

const MetricCard = ({ icon, title, value, bg }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center text-xl`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
);

const AssignMemberModal = ({ isOpen, onClose, onAssign, loading, form, setForm, teams, showTeamSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 my-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-800">Assign New Member</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={onAssign} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="member@example.com"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                           <option value="agent">Agent</option>
                            <option value="user">User</option>
                            <option value="vendor">Vendor</option>
                            <option value="bd">Business Developer (BD)</option>
                            <option value="bdm">Business Development Manager (BDM)</option>
                            <option value="sm">Sales Manager (SM)</option> 
                        </select>
                    </div>

                    {showTeamSelect && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Team</label>
                            <select
                                value={form.teamId}
                                required
                                onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="">Select Team</option>
                                {teams.map(team => (
                                    <option key={team._id || team.id} value={team._id || team.id}>
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaUserPlus />}
                        {loading ? "Assigning..." : "Assign Member"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const RegisterMemberModal = ({ isOpen, onClose, onRegister, loading, form, setForm, teams }) => {
    const [showPassword, setShowPassword] = useState(false);
    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            const file = files[0];
            if (file) {
                // Check for 50KB limit (50 * 1024 bytes)
                if (file.size > 50 * 1024) {
                    toast.error("File size exceeds 50KB. Please choose a smaller image.");
                    e.target.value = ""; // Clear input
                    return;
                }
                setForm({ ...form, [name]: file });
            }
        } else if (name === 'state') {
            // Reset LGA when state changes
            setForm({ ...form, state: value, localGovt: "" });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const availableLgas = form.state ? (lgasData[form.state] || []) : [];

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-4xl my-8 shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">Register New {form.role === 'sm' ? 'Sales Manager' : (form.role === 'tl' ? 'Team Lead' : 'Business Development Manager')}</h3>
                        <p className="text-sm text-gray-500 mt-1">Fill in all required information to create a new {form.role === 'sm' ? 'SM' : (form.role === 'tl' ? 'TL' : 'BDM')} account.</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-all text-gray-400">
                        <FaTimes className="text-xl" />
                    </button>
                </div>
                
                <form onSubmit={onRegister} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {form.role === 'tl' && (
                            <div className="lg:col-span-3 space-y-4 bg-purple-50/50 p-6 rounded-2xl border border-purple-100 mb-2">
                                <h4 className="flex items-center gap-2 text-purple-600 font-bold uppercase tracking-wider text-xs">
                                    <FaLayerGroup className="text-sm" /> Deployment Setup
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Assign to Team <span className="text-red-500 ml-0.5">*</span></label>
                                        <div className="relative">
                                            <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <select 
                                                name="teamId" 
                                                required 
                                                value={form.teamId} 
                                                onChange={handleChange} 
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm appearance-none"
                                            >
                                                <option value="">Select Team</option>
                                                {teams?.map(team => (
                                                    <option key={team._id || team.id} value={team._id || team.id}>{team.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Personal Information Section */}
                        <div className="lg:col-span-3">
                            <h4 className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs mb-4">
                                <FaUser className="text-sm" /> Personal Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">First Name <span className="text-red-500 ml-0.5">*</span></label>
                                    <div className="relative">
                                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" />
                                        <input name="firstName" required value={form.firstName} onChange={handleChange} placeholder="John" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Last Name <span className="text-red-500 ml-0.5">*</span></label>
                                    <div className="relative">
                                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="lastName" required value={form.lastName} onChange={handleChange} placeholder="Doe" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address <span className="text-red-500 ml-0.5">*</span></label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="john@example.com" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone Number <span className="text-red-500 ml-0.5">*</span></label>
                                    <div className="relative">
                                        <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="phone" required value={form.phone} onChange={handleChange} placeholder="08012345678" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            name="password" 
                                            type={showPassword ? "text" : "password"} 
                                            value={form.password} 
                                            onChange={handleChange} 
                                            placeholder="•••••••• (Optional)" 
                                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Date of Birth <span className="text-red-500 ml-0.5">*</span></label>
                                    <div className="relative">
                                        <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="dateOfBirth" type="date" required value={form.dateOfBirth} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Gender <span className="text-red-500 ml-0.5">*</span></label>
                                    <div className="relative">
                                        <FaVenusMars className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select name="gender" required value={form.gender} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm appearance-none">
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Marital Status <span className="text-red-500 ml-0.5">*</span></label>
                                    <div className="relative">
                                        <FaHeart className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select name="maritalStatus" required value={form.maritalStatus} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm appearance-none">
                                            <option value="">Select Status</option>
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                            <option value="Divorced">Divorced</option>
                                            <option value="Widowed">Widowed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="lg:col-span-3 pt-4 border-t border-gray-100">
                            <h4 className="flex items-center gap-2 text-orange-600 font-bold uppercase tracking-wider text-xs mb-4">
                                <FaMapMarkerAlt className="text-sm" /> Location Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Address <span className="text-red-500 ml-0.5">*</span></label>
                                    <div className="relative">
                                        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="address" required value={form.address} onChange={handleChange} placeholder="123 Shopping Mall Way" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">State <span className="text-red-500 ml-0.5">*</span></label>
                                    <div className="relative">
                                        <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select 
                                            name="state" 
                                            required 
                                            value={form.state} 
                                            onChange={handleChange} 
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all text-sm appearance-none"
                                        >
                                            <option value="">Select State</option>
                                            {statesData.state.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">LGA <span className="text-red-500 ml-0.5">*</span></label>
                                    <div className="relative">
                                        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select 
                                            name="localGovt" 
                                            required 
                                            value={form.localGovt} 
                                            onChange={handleChange} 
                                            disabled={!form.state}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all text-sm appearance-none disabled:opacity-50"
                                        >
                                            <option value="">{form.state ? "Select LGA" : "Choose State first"}</option>
                                            {availableLgas.map(lga => (
                                                <option key={lga} value={lga}>{lga}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bank Details Section */}
                        <div className="lg:col-span-3 pt-4 border-t border-gray-100">
                            <h4 className="flex items-center gap-2 text-green-600 font-bold uppercase tracking-wider text-xs mb-4">
                                <FaUniversity className="text-sm" /> Banking Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Bank Name <span className="text-red-500 ml-0.5">*</span></label>
                                    <div className="relative">
                                        <FaUniversity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="bankName" required value={form.bankName} onChange={handleChange} placeholder="Access Bank" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Account Number <span className="text-red-500 ml-0.5">*</span></label>
                                    <div className="relative">
                                        <FaUniversity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="accountNumber" required value={form.accountNumber} onChange={handleChange} placeholder="0123456789" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Account Name <span className="text-red-500 ml-0.5">*</span></label>
                                    <div className="relative">
                                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="accountName" required value={form.accountName} onChange={handleChange} placeholder="John Doe" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Valid Identification ID (NIN, PVC etc) <span className="text-red-500 ml-0.5">*</span></label>
                                    <div className="relative">
                                        <FaIdBadge className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="validId" required value={form.validId} onChange={handleChange} placeholder="e.g. 1234567890" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3 pt-4 border-t border-gray-100">
                            <h4 className="flex items-center gap-2 text-purple-600 font-bold uppercase tracking-wider text-xs mb-4">
                                <FaCamera className="text-sm" /> Document Uploads
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Passport Photograph <span className="text-red-500 ml-0.5">*</span></label>
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:border-purple-400 transition-colors bg-gray-50/50 group">
                                        <input name="passportPhoto" type="file" required onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                <FaCamera />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-semibold text-gray-700 truncate">{form.passportPhoto ? form.passportPhoto.name : "Choose Passport Photo"}</p>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Max size 50KB (JPG, PNG)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : <FaUserCheck />}
                            {loading ? "Processing..." : `Register ${form.role === 'sm' ? 'Sales Manager' : (form.role === 'tl' ? 'Team Lead' : 'Business Development Manager')}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ReassignMemberModal = ({ isOpen, onClose, onReassign, loading, form, setForm, teams }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 my-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-800">Reassign Member</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={onReassign} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Member Email</label>
                        <input
                            type="email"
                            readOnly
                            value={form.email}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 outline-none"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Move to Team</label>
                        <select
                            value={form.teamId}
                            required
                            onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            <option value="">Select Target Team</option>
                            {teams.map(team => (
                                <option key={team._id || team.id} value={team._id || team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaExchangeAlt />}
                        {loading ? "Reassigning..." : "Reassign Member"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const SetTeamLeadModal = ({ isOpen, onClose, onSetLead, loading, form, setForm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 my-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-800">Set TL</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={onSetLead} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">TL Email Address</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="leader@example.com"
                        />
                         <p className="text-xs text-gray-500 mt-1">This user will be promoted to TL for the selected team.</p>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaUserTie />}
                        {loading ? "Setting TL..." : "Set TL"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const CreateTeamModal = ({ isOpen, onClose, onCreate, loading, form, setForm, fetchingStates, states }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 my-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-800">Create New Team</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={onCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <select
                            name="state"
                            value={form.state}
                            required
                            onChange={(e) => setForm({ ...form, state: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            disabled={fetchingStates}
                        >
                            <option value="">{fetchingStates ? "Loading states..." : "Select State"}</option>
                            {states.map((team) => (
                                <option key={team._id || team.id} value={team.state || team.name}>
                                    {team.state || team.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            required
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Kano Market Team-A"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaPlusCircle />}
                        {loading ? "Creating..." : "Create Team"}
                    </button>
                </form>
            </div>
        </div>
    );
};


const MyTeamDashboardView = ({ teamId }) => {
    const { userData } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [walletData, setWalletData] = useState(null);
    const [teamWallets, setTeamWallets] = useState({});
    const [walletLoading, setWalletLoading] = useState(false);
    
    // Assign Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignLoading, setAssignLoading] = useState(false);
    const [assignForm, setAssignForm] = useState({ email: "", role: "bd", teamId: "" });

    // Set Team Lead Modal State
    const [showSetLeadModal, setShowSetLeadModal] = useState(false);
    const [setLeadLoading, setSetLeadLoading] = useState(false);
    const [setLeadForm, setSetLeadForm] = useState({ email: "", teamId: "" });

    // Reassign Modal State
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [reassignLoading, setReassignLoading] = useState(false);
    const [reassignForm, setReassignForm] = useState({ email: "", teamId: "" });

    // Create Team Modal State
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
    const [createTeamLoading, setCreateTeamLoading] = useState(false);
    const [createTeamForm, setCreateTeamForm] = useState({ name: "", state: "", zoneId: "" });
    const [fetchingStates, setFetchingStates] = useState(false);
    const [selectedZoneStates, setSelectedZoneStates] = useState([]);

    // Registration Modal State
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);
    const initialRegisterForm = {
        firstName: "", lastName: "", email: "", phone: "", password: "",
        address: "", localGovt: "", state: "",
        accountName: "", accountNumber: "", bankName: "",
        validId: "", passportPhoto: null,
        gender: "", maritalStatus: "", dateOfBirth: "",
        role: "sm", // default
        isTeamLead: false,
        teamId: "",
        regionalId: ""
    };
    const [registerForm, setRegisterForm] = useState(initialRegisterForm);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            if (teamId) {
                // Team selected: fetch both the teams list (for team info) and the team members
                const [teamsRes, membersRes] = await Promise.all([
                    axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_MY_REGION_TEAMS), { withCredentials: true }),
                    axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_TEAM_MEMBERS + teamId), { withCredentials: true })
                ]);
                
                if (teamsRes.data.success) {
                    setDashboardData(teamsRes.data);
                }
                setTeamMembers(membersRes.data?.members || []);
            } else if (userData?.role === 'rm' || userData?.role === 'regional-leader') {
                // Regional Overview: fetch all teams in the region
                const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_MY_REGION_TEAMS), { withCredentials: true });
                if (response.data.success) {
                    setDashboardData(response.data);
                }
            } else {
                // No team selected: use default dashboard endpoint for non-RMs
                let response;
                try {
                    response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_MY_TEAM), { withCredentials: true });
                    console.log("dashboard",response.data);
                } catch (error) {
                    console.error("Dashboard fetch error:", error);
                    // Fallback to my-team endpoint for regular team members if dashboard is restricted
                    if (error.response?.status === 403 || error.response?.status === 401 || error.response?.status === 404 || error.response?.status === 400 || error.response?.status === 500) {
                         response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_MY_TEAM), { withCredentials: true });
                         console.log("my-team",response.data);
                    } else {
                         response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_MY_TEAM), { withCredentials: true });
                         console.log("my-team",response.data);
                    }
                }
               
                if (response?.data?.success) {
                    setDashboardData(response.data);
                    setTeamMembers(response.data.members || []);
                }
            }
        } catch (error) {
            console.error("fetchData overall error:", error);
            toast.error(error?.response?.data?.message || "Failed to load team data");
        } finally {
            setLoading(false);
        }
    };

    const fetchWalletData = async () => {
        try {
            setWalletLoading(true);
            let endpoint = "";
            const currentTeamId = teamId || dashboardData?.team?._id || dashboardData?.team?.id;
            
            if (currentTeamId) {
                endpoint = API_CONFIG.ENDPOINTS.ZONE_WALLET.GET_TEAM + currentTeamId;
            } else if (dashboardData?.zone?._id || dashboardData?.zone?.id) {
                endpoint = API_CONFIG.ENDPOINTS.ZONE_WALLET.GET_REGIONAL + (dashboardData.zone._id || dashboardData.zone.id);
            } else if (userData?.zoneId) {
                endpoint = API_CONFIG.ENDPOINTS.ZONE_WALLET.GET_REGIONAL + userData.zoneId;
            }

            if (endpoint) {
                try {
                    const response = await axios.get(apiUrl(endpoint), { withCredentials: true });

                    if (response.data.success) {
                        setWalletData(response.data.wallet || response.data.data || { balance: 0, currency: "NGN" });
                    } else {
                        setWalletData({ balance: 0, currency: "NGN" });
                    }
                } catch (err) {
                    setWalletData({ balance: 0, currency: "NGN" });
                }
            }

            // Also fetch all team wallets if in regional view
            if (!teamId && (dashboardData?.zone?._id || dashboardData?.zone?.id || userData?.zoneId)) {
                try {
                    const zoneId = dashboardData?.zone?._id || dashboardData?.zone?.id || userData.zoneId;
                    const teamsWalletRes = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.ZONE_WALLET.GET_REGIONAL_TEAMS + zoneId + "/teams"), { withCredentials: true });
                    
                    if (teamsWalletRes.data.success) {
                        const walletMap = {};
                        const wallets = teamsWalletRes.data.wallets || teamsWalletRes.data.teamWallets || teamsWalletRes.data.data || [];
                        wallets.forEach(w => {
                            const tId = w.teamId?._id || w.teamId;
                            if (tId) walletMap[tId] = w;
                        });
                        setTeamWallets(walletMap);
                    }
                } catch (err) {
                  
                }
            }
        } catch (error) {
        } finally {
            setWalletLoading(false);
        }
    };

    useEffect(() => {
        if (userData) {
            fetchData();
        }
    }, [userData, teamId]);

    useEffect(() => {
        if (dashboardData || userData?.zoneId) {
            fetchWalletData();
        }
    }, [dashboardData, userData, teamId]);

    const handleAssignMember = async (e) => {
        e.preventDefault();
        setAssignLoading(true);
        try {
            const payload = {
                email: assignForm.email,
                role: assignForm.role,
                teamId: assignForm.teamId || teamId || dashboardData.team?._id || (selectedTeam?._id || selectedTeam?.id)
            };

            if (!payload.teamId) {
                toast.error("Team ID is missing. Please select a team.");
                setAssignLoading(false);
                return;
            }
            await axios.post(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.ASSIGN_MEMBER), payload, { withCredentials: true });
            toast.success("Member assigned successfully!");
            setShowAssignModal(false);
            setAssignForm({ email: "", role: "bd", teamId: "" });
            fetchData(); // Refresh data
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to assign member");
        } finally {
            setAssignLoading(false);
        }
    };

    const handleSetTeamLead = async (e) => {
        e.preventDefault();
        setSetLeadLoading(true);
        try {
            const payload = {
                email: setLeadForm.email,
                teamId: setLeadForm.teamId
            };
            
            await axios.put(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.SET_TEAM_LEAD), payload, { withCredentials: true });
            toast.success("TL Set successfully!");
            setShowSetLeadModal(false);
            setSetLeadForm({ email: "", teamId: "" });
            fetchData(); // Refresh data
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to set Team Leader");
        } finally {
            setSetLeadLoading(false);
        }
    };

    const handleReassignMember = async (e) => {
        e.preventDefault();
        setReassignLoading(true);
        try {
            const payload = {
                email: reassignForm.email,
                teamId: reassignForm.teamId
            };
            
            await axios.put(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.REASSIGN_MEMBER), payload, { withCredentials: true });
            toast.success("Member reassigned successfully!");
            setShowReassignModal(false);
            setReassignForm({ email: "", teamId: "" });
            fetchData(); // Refresh data
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to reassign member");
        } finally {
            setReassignLoading(false);
        }
    };

    const fetchTeamStates = async (zoneId) => {
        if (!zoneId) return;
        setFetchingStates(true);
        try {
            const response = await axios.get(apiUrl(`${API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONE_TEAMS}${zoneId}/teams`), { withCredentials: true });
            if (response.data) {
                setSelectedZoneStates(response.data.teams || []);
            }
        } catch (error) {
            toast.error("Failed to fetch states for selected zone");
        } finally {
            setFetchingStates(false);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setCreateTeamLoading(true);
        try {
            const url = apiUrl(`${API_CONFIG.ENDPOINTS.REGIONAL.CREATE_TEAM}${createTeamForm.zoneId}/teams`);
            await axios.post(url, {
                name: createTeamForm.name,
                state: createTeamForm.state
            }, { withCredentials: true });

            toast.success("Team created successfully!");
            setShowCreateTeamModal(false);
            setCreateTeamForm({ name: "", state: "", zoneId: "" });
            fetchData(); // Refresh data
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create team");
        } finally {
            setCreateTeamLoading(false);
        }
    };

    const handleRegisterMember = async (e) => {
        e.preventDefault();
        setRegisterLoading(true);
        try {
            const convertToBase64 = (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                });
            };

            const payload = { ...registerForm };
            
            // Set regional ID from user data if not present
            if (!payload.regionalId) {
                payload.regionalId = dashboardData?.zone?._id || dashboardData?.zone?.id || userData?.zoneId;
            }

            if (payload.passportPhoto) {
                payload.passportPhoto = await convertToBase64(payload.passportPhoto);
            }

            let endpoint;
            if (registerForm.role === 'tl') {
                endpoint = API_CONFIG.ENDPOINTS.REGIONAL.REGISTER_TL;
                payload.isTeamLead = true;
            } else if (registerForm.role === 'sm') {
                endpoint = API_CONFIG.ENDPOINTS.REGIONAL.REGISTER_SM;
                delete payload.role; // RM specific endpoints might not want 'role' in payload
            } else {
                endpoint = API_CONFIG.ENDPOINTS.REGIONAL.REGISTER_BDM;
                delete payload.role;
            }
                
            await axios.post(apiUrl(endpoint), payload, { 
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
            });
            
            toast.success(`${registerForm.role.toUpperCase()} Registered successfully!`);
            setShowRegisterModal(false);
            setRegisterForm(initialRegisterForm);
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Registration Error:", error);
            toast.error(error?.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setRegisterLoading(false);
        }
    };

    useEffect(() => {
        if (showCreateTeamModal) {
            const zoneId = dashboardData?.zone?._id || dashboardData?.zone?.id || userData?.zoneId;
            const zoneName = dashboardData?.zone?.name || "your assigned zone";
            
            if (zoneId) {
                setCreateTeamForm(prev => ({ ...prev, zoneId }));
                fetchTeamStates(zoneId);
            } else {
                toast.warn("Could not identify your zone. Please contact support.");
            }
        }
    }, [showCreateTeamModal, dashboardData, userData]);


    const handleViewTeam = (tId) => {
        let base = "";
        if (pathname.includes("/bd-dashboard")) base = "/bd-dashboard";
        else if (pathname.includes("/agent-dashboard")) base = "/agent-dashboard";
        else if (pathname.includes("/sales-manager")) base = "/sales-manager";
        else if (pathname.includes("/dashboard")) base = "/dashboard";
        
        if (base) {
            router.push(`${base}/team?id=${tId}`);
        }
    };

    const openSetLeadModal = (teamId) => {
        setSetLeadForm({ email: "", teamId });
        setShowSetLeadModal(true);
    };

    const openReassignModal = (email) => {
        setReassignForm({ email, teamId: "" });
        setShowReassignModal(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FaSpinner className="animate-spin text-4xl text-blue-600" />
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
                <FaUsers className="text-6xl mb-4 text-gray-300" />
                <p>No team data found.</p>
            </div>
        );
    }

    // Determine view based on data structure
    // If a specific teamId is provided and the API returned a teams array (regional data),
    // find the selected team from the array
    let selectedTeam = null;
    if (teamId && dashboardData.teams && Array.isArray(dashboardData.teams)) {
        selectedTeam = dashboardData.teams.find(
            (t) => (t._id || t.id) === teamId
        );
    }

    const isRegionalView = !teamId && (
        (dashboardData?.teams && Array.isArray(dashboardData.teams)) || 
        (dashboardData?.zone && (dashboardData.role === 'regional-leader' || dashboardData.role === 'rm' || userData?.role === 'rm' || userData?.role === 'regional-leader'))
    );
    // Team view if: API returned members directly, OR we found a selectedTeam from the regional teams array
    const isTeamView = !!(dashboardData?.members && Array.isArray(dashboardData.members)) || !!selectedTeam;
    // If a specific team was selected from the regional data, show it as a single-team detail view
    const isSingleTeamFromRegion = !!selectedTeam;

    // Prepare teams for modal
    const availableTeams = isRegionalView 
        ? (dashboardData?.teams || []) 
        : (dashboardData?.teams || (selectedTeam ? [selectedTeam] : (dashboardData?.team ? [dashboardData.team] : [])));

    const isUserRegionalLeader = userData?.role === 'rm' || userData?.role === 'regional-leader' || userData?.role === 'bdm' || userData?.role === 'bd' || userData?.role === 'sm';


    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {userData?.role === 'rm' ? "Regional Manager Dashboard" : "My Team Dashboard"}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {isSingleTeamFromRegion 
                            ? `Team: ${selectedTeam.name || "Selected Team"}`
                            : (dashboardData?.team?.name || dashboardData?.teamName)
                                ? `Team: ${dashboardData.team?.name || dashboardData.teamName}`
                                : `Overview of your ${isRegionalView ? (userData?.role === 'rm' ? "Region Management" : "Region's Teams") : "Team Members"}`
                        }
                    </p>
                </div>
                
                {/* Actions: Create Team, Register Staff, and Assign Member */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:justify-end">
                    {/* Create Team - Only for Regional Leaders */}
                    {isRegionalView && (userData?.role === 'rm' || userData?.role === 'regional-leader') && (
                        <button 
                            onClick={() => setShowCreateTeamModal(true)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 whitespace-nowrap"
                        >
                            <FaPlusCircle className="text-sm" /> Create Team
                        </button>
                    )}

                    {/* Register Staff - Only for Regional Leaders */}
                    {(isRegionalView || isTeamView) && dashboardData?.role !== 'member' && (userData?.role === 'rm' || userData?.role === 'regional-leader') && (
                        <>
                            <button 
                                onClick={() => {
                                    const zoneId = dashboardData?.zone?._id || dashboardData?.zone?.id || userData?.zoneId;
                                    setRegisterForm({ ...initialRegisterForm, role: "sm", regionalId: zoneId });
                                    setShowRegisterModal(true);
                                }}
                                className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 whitespace-nowrap"
                            >
                                <FaPlusCircle /> Register SM
                            </button>
                            <button 
                                onClick={() => {
                                    const zoneId = dashboardData?.zone?._id || dashboardData?.zone?.id || userData?.zoneId;
                                    setRegisterForm({ ...initialRegisterForm, role: "bdm", regionalId: zoneId });
                                    setShowRegisterModal(true);
                                }}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 whitespace-nowrap"
                            >
                                <FaPlusCircle /> Register BDM
                            </button>
                            <button 
                                onClick={() => {
                                    const zoneId = dashboardData?.zone?._id || dashboardData?.zone?.id || userData?.zoneId;
                                    setRegisterForm({ ...initialRegisterForm, role: "tl", isTeamLead: true, regionalId: zoneId });
                                    setShowRegisterModal(true);
                                }}
                                className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 whitespace-nowrap"
                            >
                                <FaPlusCircle /> Register TL
                            </button>
                        </>
                    )}

                    {/* Assign Member Button */}
                    {(isRegionalView || isTeamView) && dashboardData?.role !== 'member' && (
                        <button 
                            onClick={() => {
                                if (!isRegionalView) {
                                    const currentTeamId = teamId || dashboardData.team?._id || (selectedTeam?._id || selectedTeam?.id);
                                    if (currentTeamId) {
                                        setAssignForm(prev => ({ ...prev, teamId: currentTeamId }));
                                    }
                                }
                                setShowAssignModal(true);
                            }}
                            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 whitespace-nowrap"
                        >
                            <FaUserPlus className="text-sm" /> Assign Member
                        </button>
                    )}
                </div>
            </div>

            {/* Wallet Overview */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isRegionalView ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <FaWallet className="text-8xl" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4 opacity-80">
                                <FaWallet className="text-sm" />
                                <span className="text-xs font-bold uppercase tracking-wider">Current Balance</span>
                            </div>
                            {walletLoading ? (
                                 <FaSpinner className="animate-spin text-2xl" />
                            ) : (
                                <h2 className="text-2xl font-bold">₦{walletData?.balance?.toLocaleString() || "0"}</h2>
                            )}
                            <p className="text-xs mt-2 opacity-60">Currency: {walletData?.currency || "NGN"}</p>
                        </div>
                        
                        <div className="space-y-2 mt-4 pt-4 border-t border-indigo-500/30 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="opacity-80 text-xs text-indigo-100">Commission on Sales</span>
                                <span className="font-semibold">₦{walletData?.commissions?.sales?.toLocaleString() || "0"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="opacity-80 text-xs text-indigo-100">Delivery</span>
                                <span className="font-semibold">₦{walletData?.commissions?.delivery?.toLocaleString() || "0"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="opacity-80 text-xs text-indigo-100">Vendor Subscriptions</span>
                                <span className="font-semibold">₦{walletData?.commissions?.subscriptions?.toLocaleString() || "0"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <FaChartLine className="text-xl" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Orders</p>
                        <h3 className="text-2xl font-bold text-gray-800">{dashboardData?.stats?.totalOrders || dashboardData?.metrics?.totalOrders || 0}</h3>
                    </div>
                </div>

                {isRegionalView && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                            <FaLayerGroup className="text-xl" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Region Teams</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {dashboardData?.totalTeams || dashboardData?.teams?.length || 0}
                            </h3>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                        <FaUsers className="text-xl" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                            {isRegionalView ? "Region Members" : "Team Members"}
                        </p>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {isRegionalView 
                                ? (dashboardData?.totalMembers || (dashboardData?.teams?.reduce((acc, t) => acc + (t.totalMembers || 0), 0)) || 0)
                                : (teamMembers?.length || 0)
                            }
                        </h3>
                    </div>
                </div>
            </div>

            {/* Extended Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <MetricCard icon={<FaBox className="text-blue-500" />} title="Total Products" value={dashboardData?.metrics?.totalProducts || 0} bg="bg-blue-50" />
                <MetricCard icon={<FaStore className="text-purple-500" />} title="Total Vendors" value={dashboardData?.metrics?.totalVendors || 0} bg="bg-purple-50" />
                <MetricCard icon={<FaUserCheck className="text-green-500" />} title="Total Customers" value={dashboardData?.metrics?.totalCustomers || 0} bg="bg-green-50" />
                <MetricCard icon={<FaTruck className="text-orange-500" />} title="Delivery Men" value={dashboardData?.metrics?.totalDeliveryMen || 0} bg="bg-orange-50" />
                <MetricCard icon={<FaBriefcase className="text-teal-500" />} title="Total SM" value={dashboardData?.metrics?.totalSM || 0} bg="bg-teal-50" />
                <MetricCard icon={<FaUserTie className="text-indigo-500" />} title="Total BDM / BDs" value={dashboardData?.metrics?.totalBDM || 0} bg="bg-indigo-50" />
                <MetricCard icon={<FaIdBadge className="text-pink-500" />} title="Total Agents" value={dashboardData?.metrics?.totalAgents || 0} bg="bg-pink-50" />
                <MetricCard icon={<FaClipboardList className="text-yellow-500" />} title="Delivery Requests" value={dashboardData?.metrics?.totalDeliveryRequests || 0} bg="bg-yellow-50" />
                <MetricCard icon={<FaStore className="text-red-500" />} title="New Vendors (Active)" value={dashboardData?.metrics?.newActiveVendors || 0} bg="bg-red-50" />
                <MetricCard icon={<FaChartLine className="text-cyan-500" />} title="Total Orders" value={dashboardData?.stats?.totalOrders || dashboardData?.metrics?.totalOrders || 0} bg="bg-cyan-50" />
            </div>

            {/* Content: Regional View - Show all teams */}
            {isRegionalView && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {dashboardData.teams?.map((team, index) => (
                             <div 
                                 key={index} 
                                 className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all relative group cursor-pointer"
                                 onClick={(e) => {
                                     if (!e.target.closest('button')) {
                                         handleViewTeam(team._id || team.id);
                                     }
                                 }}
                             >
                                 <div className="flex items-center justify-between mb-4">
                                     <div className="flex items-center gap-4">
                                         <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                             <FaLayerGroup />
                                         </div>
                                         <div>
                                             <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{team.name || "Unnamed Team"}</h3>
                                              <p className="text-xs text-gray-500 uppercase tracking-wider">{team.code || "No Code"}</p>
                                         </div>
                                     </div>
                                     <div className="p-2 text-gray-300 group-hover:text-blue-500 transition-colors">
                                         <FaChevronRight className="text-sm" />
                                     </div>
                                 </div>
                                 
                                 <div className="space-y-3">
                                     <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl group/lead">
                                        <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                 <FaUserTie className="text-sm" />
                                             </div>
                                             <div>
                                                 <p className="text-xs text-gray-500">Team Lead</p>
                                                  <p className="text-sm font-semibold text-gray-800">
                                                  {(team.teamLeadId?.firstName || team.teamLead?.firstName) ? `${team.teamLeadId?.firstName || team.teamLead?.firstName} ${team.teamLeadId?.lastName || team.teamLead?.lastName}` : "Not Assigned"}
                                              </p>
                                             </div>
                                        </div>
                                         <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openSetLeadModal(team._id || team.id);
                                            }}
                                            className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                                            title="Set Team Leader"
                                         >
                                            Change
                                         </button>
                                     </div>
                                        
                                      <div className="grid grid-cols-2 gap-2 mt-2">
                                         <div className="text-center p-2 bg-blue-50 rounded-lg">
                                             <p className="text-xs text-blue-600 font-bold uppercase tracking-widest text-[10px]">Members</p>
                                             <p className="font-bold text-blue-900">{team.totalMembers || 0}</p>
                                         </div>
                                         <div className="text-center p-2 bg-purple-50 rounded-lg">
                                             <p className="text-xs text-purple-600 font-bold uppercase tracking-widest text-[10px]">Wallet</p>
                                             <p className="font-bold text-purple-900 truncate">₦{(teamWallets[team._id || team.id]?.balance || 0).toLocaleString()}</p>
                                         </div>
                                      </div>
                                      
                                      <div className="flex items-center justify-between gap-2 mt-2">
                                          <div className="flex-1 text-center p-2 bg-green-50 rounded-lg">
                                              <p className="text-xs text-green-600 font-bold uppercase tracking-widest text-[10px]">Performance</p>
                                              <p className="font-bold text-green-900">{team.performance || 0}%</p>
                                          </div>
                                      </div>

                                      <div className="pt-3 mt-1 border-t border-gray-50 flex justify-center">
                                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              View Team Details <FaArrowRight />
                                          </span>
                                      </div>
                                   </div>
                               </div>
                          ))}
                    </div>
                    {(!dashboardData.teams || dashboardData.teams.length === 0) && dashboardData.zone && (
                        <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 text-center">
                            <FaLayerGroup className="text-4xl text-blue-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800">{dashboardData.zone.name} Region Overview</h3>
                            <p className="text-gray-500 mt-2">Manage teams and members for the {dashboardData.zone.code} region.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Content: Single Team Detail View (selected from regional teams) */}
            {isSingleTeamFromRegion && (
                <div className="space-y-6">
                    {/* Team Info Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">
                                    <FaLayerGroup />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{selectedTeam.name || "Unnamed Team"}</h2>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">{selectedTeam.code || "No Code"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-center px-4 py-2 bg-blue-50 rounded-xl">
                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-widest text-[10px]">Total Members</p>
                                    <p className="font-bold text-blue-900">{selectedTeam.totalMembers || 0}</p>
                                </div>
                                <div className="text-center px-4 py-2 bg-purple-50 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                                    <p className="text-xs text-purple-600">Wallet</p>
                                    <p className="font-bold text-purple-900">₦{(walletData?.balance || 0).toLocaleString()}</p>
                                </div>
                                <div className="text-center px-4 py-2 bg-green-50 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                                    <p className="text-xs text-green-600">Performance</p>
                                    <p className="font-bold text-green-900">{selectedTeam.performance || 0}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Lead Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">TL</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <FaUserTie className="text-lg" />
                                </div>
                                 <div>
                                    <p className="font-semibold text-gray-800">
                                        {(selectedTeam.teamLeadId?.firstName || selectedTeam.teamLead?.firstName) 
                                            ? `${selectedTeam.teamLeadId?.firstName || selectedTeam.teamLead?.firstName} ${selectedTeam.teamLeadId?.lastName || selectedTeam.teamLead?.lastName}` 
                                            : "Not Assigned"}
                                    </p>
                                    {(selectedTeam.teamLeadId?.email || selectedTeam.teamLead?.email) && (
                                        <p className="text-sm text-gray-500">{selectedTeam.teamLeadId?.email || selectedTeam.teamLead?.email}</p>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => openSetLeadModal(selectedTeam._id || selectedTeam.id)}
                                className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Set TL"
                            >
                                Change TL
                            </button>
                        </div>
                    </div>

                    {/* Members Table */}
                    {teamMembers.length > 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-800">Team Members</h3>
                                <p className="text-sm text-gray-500">{teamMembers.length} members in this team</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Member Name</th>
                                            <th className="px-6 py-4 font-semibold">Email</th>
                                            <th className="px-6 py-4 font-semibold">Role</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                            <th className="px-6 py-4 font-semibold">Joined Date</th>
                                            {isUserRegionalLeader && dashboardData?.role !== 'tl' && dashboardData?.role !== 'team-lead' && dashboardData?.role !== 'member' && <th className="px-6 py-4 font-semibold">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {teamMembers.map((member, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                            {member.firstName?.charAt(0) || "U"}
                                                        </div>
                                                        <span className="font-medium text-gray-800">
                                                            {member.firstName} {member.lastName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                                                <td className="px-6 py-4 text-sm">
                                                     <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        (member.isTeamLead || member.role === 'team_lead' || member.email === (selectedTeam?.teamLeadId?.email || selectedTeam?.teamLead?.email)) 
                                                            ? 'bg-indigo-100 text-indigo-700' 
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {(member.isTeamLead || member.role === 'team_lead' || member.email === (selectedTeam?.teamLeadId?.email || selectedTeam?.teamLead?.email)) 
                                                            ? 'TL' 
                                                            : (member.role?.toUpperCase() || 'MEMBER')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        (member.isActive !== false) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {(member.isActive !== false) ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "N/A"}
                                                </td>
                                                {isUserRegionalLeader && dashboardData?.role !== 'tl' && dashboardData?.role !== 'team-lead' && dashboardData?.role !== 'member' && (
                                                    <td className="px-6 py-4">
                                                        <button 
                                                            onClick={() => openReassignModal(member.email)}
                                                            className="flex items-center gap-1.5 text-xs bg-orange-50 text-orange-600 px-2.5 py-1.5 rounded-lg hover:bg-orange-100 transition-colors font-medium border border-orange-100"
                                                            title="Reassign to another team"
                                                        >
                                                            <FaExchangeAlt className="text-[10px]" /> Reassign
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 text-center">
                            <FaUsers className="text-4xl text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-700">No Members Yet</h3>
                            <p className="text-gray-500 mt-2">This team currently has no members listed. Use the "Assign Member" button to add members.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Content: Team View (API returned members directly, e.g. for team leads) */}
            {!isSingleTeamFromRegion && isTeamView && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div>
                             <h2 className="text-lg font-bold text-gray-800">{dashboardData.team?.name || dashboardData.teamName || "My Team"}</h2>
                             {(dashboardData.team?.teamLeadId || dashboardData.team?.teamLead || dashboardData.lead) && (
                                 <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                     <FaUserTie className="text-indigo-500" />
                                     Lead by: <span className="font-medium text-gray-700">
                                        {(dashboardData.team?.teamLeadId?.firstName || dashboardData.team?.teamLead?.firstName || dashboardData.lead?.firstName)} {(dashboardData.team?.teamLeadId?.lastName || dashboardData.team?.teamLead?.lastName || dashboardData.lead?.lastName)}
                                     </span>
                                 </p>
                             )}
                        </div>
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                            {dashboardData.members?.length || 0} Members
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Member Name</th>
                                    <th className="px-6 py-4 font-semibold">Email</th>
                                    <th className="px-6 py-4 font-semibold">Role</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Joined Date</th>
                                    {isUserRegionalLeader && dashboardData?.role !== 'tl' && dashboardData?.role !== 'team-lead' && dashboardData?.role !== 'member' && <th className="px-6 py-4 font-semibold">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dashboardData.members?.map((member, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                    {member.firstName?.charAt(0) || "U"}
                                                </div>
                                                <span className="font-medium text-gray-800">
                                                    {member.firstName} {member.lastName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                (member.isTeamLead || member.role === 'team_lead' || (member.email === (dashboardData.team?.teamLeadId?.email || dashboardData.team?.teamLead?.email || dashboardData.lead?.email))) ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {(member.isTeamLead || member.role === 'team_lead' || (member.email === (dashboardData.team?.teamLeadId?.email || dashboardData.team?.teamLead?.email || dashboardData.lead?.email))) ? 'TL' : (member.role?.toUpperCase() || 'MEMBER')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                (member.isActive !== false) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {(member.isActive !== false) ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "N/A"}
                                        </td>
                                        {isUserRegionalLeader && dashboardData?.role !== 'tl' && dashboardData?.role !== 'team-lead' && dashboardData?.role !== 'member' && (
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => openReassignModal(member.email)}
                                                    className="flex items-center gap-1.5 text-xs bg-orange-50 text-orange-600 px-2.5 py-1.5 rounded-lg hover:bg-orange-100 transition-colors font-medium border border-orange-100"
                                                    title="Reassign to another team"
                                                >
                                                    <FaExchangeAlt className="text-[10px]" /> Reassign
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Performance Rankings */}
            <div className="space-y-6 pt-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Team Performance Rankings</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* SM Performance List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-teal-50/50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2"><FaBriefcase className="text-teal-600"/> Top Sales Managers (SM)</h3>
                        </div>
                        <div className="p-0">
                            {(dashboardData?.performances?.sm || []).length > 0 ? (
                                <ul className="divide-y divide-gray-100">
                                    {(dashboardData?.performances?.sm || []).map((user, idx) => (
                                        <li key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-semibold text-sm text-gray-800">{user.name}</span>
                                                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">Rank #{idx + 1}</span>
                                            </div>
                                            <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
                                                <span>Sales: <strong className="text-gray-700">{user.sales || 0}</strong></span>
                                                <span>Customers: <strong className="text-gray-700">{user.customers || 0}</strong></span>
                                                <span>Agents: <strong className="text-gray-700">{user.agents || 0}</strong></span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-6 text-center text-sm text-gray-500">No SM performance data available.</div>
                            )}
                        </div>
                    </div>

                    {/* BDM Performance List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-indigo-50/50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2"><FaUserTie className="text-indigo-600"/> Top BDMs</h3>
                        </div>
                        <div className="p-0">
                            {(dashboardData?.performances?.bdm || []).length > 0 ? (
                                <ul className="divide-y divide-gray-100">
                                    {(dashboardData?.performances?.bdm || []).map((user, idx) => (
                                        <li key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-semibold text-sm text-gray-800">{user.name}</span>
                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Rank #{idx + 1}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                                <span>Vendors: <strong className="text-gray-700">{user.vendors || 0}</strong></span>
                                                <span>Customers: <strong className="text-gray-700">{user.customers || 0}</strong></span>
                                                <span>BDs: <strong className="text-gray-700">{user.bds || 0}</strong></span>
                                                <span>Agents: <strong className="text-gray-700">{user.agents || 0}</strong></span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-6 text-center text-sm text-gray-500">No BDM performance data available.</div>
                            )}
                        </div>
                    </div>

                    {/* BD Performance List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-blue-50/50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2"><FaIdBadge className="text-blue-600"/> Top BDs</h3>
                        </div>
                        <div className="p-0">
                            {(dashboardData?.performances?.bd || []).length > 0 ? (
                                <ul className="divide-y divide-gray-100">
                                    {(dashboardData?.performances?.bd || []).map((user, idx) => (
                                        <li key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-semibold text-sm text-gray-800">{user.name}</span>
                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Rank #{idx + 1}</span>
                                            </div>
                                            <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
                                                <span>Vendors: <strong className="text-gray-700">{user.vendors || 0}</strong></span>
                                                <span>Customers: <strong className="text-gray-700">{user.customers || 0}</strong></span>
                                                <span>Agents: <strong className="text-gray-700">{user.agents || 0}</strong></span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-6 text-center text-sm text-gray-500">No BD performance data available.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {!isRegionalView && !isTeamView && (
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 text-yellow-800">
                    <h3 className="font-bold">Unrecognized Data Format</h3>
                    <p className="text-sm mt-2">The data returned from the server could not be visualized. Please contact support.</p>
                    <pre className="mt-4 p-4 bg-yellow-100/50 rounded-lg text-xs overflow-auto max-h-40">
                        {JSON.stringify(dashboardData, null, 2)}
                    </pre>
                </div>
            )}

            <AssignMemberModal 
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onAssign={handleAssignMember}
                loading={assignLoading}
                form={assignForm}
                setForm={setAssignForm}
                teams={availableTeams}
                showTeamSelect={isRegionalView}
            />

            <CreateTeamModal 
                isOpen={showCreateTeamModal}
                onClose={() => setShowCreateTeamModal(false)}
                onCreate={handleCreateTeam}
                loading={createTeamLoading}
                form={createTeamForm}
                setForm={setCreateTeamForm}
                fetchingStates={fetchingStates}
                states={selectedZoneStates}
            />


            <SetTeamLeadModal
                isOpen={showSetLeadModal}
                onClose={() => setShowSetLeadModal(false)}
                onSetLead={handleSetTeamLead}
                loading={setLeadLoading}
                form={setLeadForm}
                setForm={setSetLeadForm}
            />

            <ReassignMemberModal
                isOpen={showReassignModal}
                onClose={() => setShowReassignModal(false)}
                onReassign={handleReassignMember}
                loading={reassignLoading}
                form={reassignForm}
                setForm={setReassignForm}
                teams={availableTeams}
            />

            <RegisterMemberModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onRegister={handleRegisterMember}
                loading={registerLoading}
                form={registerForm}
                setForm={setRegisterForm}
                teams={availableTeams}
            />
        </div>
    );
};

export default MyTeamDashboardView;

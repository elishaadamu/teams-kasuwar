"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  FaUserShield, FaUserPlus, FaEnvelope, FaPhone, FaLock, FaUserTie, 
  FaVenusMars, FaRing, FaCalendarAlt, FaHome, FaCity, FaMapMarkerAlt, FaCreditCard, FaUniversity, 
  FaFileInvoice, FaIdCard, FaPassport, FaBriefcase, FaTimes, FaSearch, FaUserCircle, FaEllipsisV,
  FaLayerGroup, FaChevronLeft, FaChevronRight, FaArrowUp
} from "react-icons/fa";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/Loading";

const ROLE_LABELS = {
  sm: "Sales Manager",
  bdm: "Business Dev. Manager",
  bd: "Business Developer",
  tl: "Team Leader",
  rm: "Regional Manager",
};

export default function Onboarding() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "sm",
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
    passportPhoto: null,
    teamId: "",
    isTeamLead: false,
    isRegionalLeader: false,
    regionalId: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [regions, setRegions] = useState([]);
  const [teams, setTeams] = useState([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Refs for scrolling
  const topRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToRef = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    fetchStaffList();
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const resp = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONES), API_CONFIG);
      setRegions(resp.data.zones || []);
    } catch (err) {
      console.error("Error fetching regions:", err);
    }
  };

  const fetchTeams = async (zoneId) => {
    try {
      const resp = await axios.get(apiUrl(`${API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONE_TEAMS}${zoneId}/teams`), API_CONFIG);
      setTeams(resp.data.teams || []);
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  useEffect(() => {
    if (formData.regionalId) {
      fetchTeams(formData.regionalId);
    } else {
      setTeams([]);
    }
  }, [formData.regionalId]);

  const fetchStaffList = async () => {
    setIsFetching(true);
    try {
      const resp = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.HR.GET_STAFF), API_CONFIG);
      setStaffList(resp.data.data || []);
    } catch (err) {
      console.error("Error fetching staff:", err);
      toast.error("Failed to load staff list.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      if (file) {
        if (file.size > 100 * 1024) {
          toast.error("Image must be less than 100KB");
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
        payload.password = formData.phone;
      } else if (['isTeamLead', 'isRegionalLeader'].includes(key)) {
        if (formData[key]) payload[key] = true;
      } else if (formData[key] !== null && formData[key] !== "") {
        payload[key] = formData[key];
      }
    });

    try {
      const resp = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.HR.REGISTER_STAFF), payload, { withCredentials: true });
      
      if (resp.data?.success || resp?.status === 200 || resp?.status === 201) {
        toast.success(`${formData.role.toUpperCase()} Created Successfully!`);
        setFormData({
          firstName: "", lastName: "", email: "", phone: "", role: "sm", password: "",
          gender: "", maritalStatus: "", dateOfBirth: "", address: "", localGovt: "", state: "",
          accountName: "", accountNumber: "", bankName: "", validId: "", passportPhoto: null,
          teamId: "", isTeamLead: false, isRegionalLeader: false, regionalId: ""
        });
        document.querySelectorAll('input[type="file"]').forEach(input => input.value = "");
        fetchStaffList(); // Refresh the table
      } else {
        toast.error(resp.data?.message || "Failed to create staff");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff = staffList.filter(staff => {
    const term = searchTerm.toLowerCase();
    return (
      staff.firstName?.toLowerCase().includes(term) ||
      staff.lastName?.toLowerCase().includes(term) ||
      staff.email?.toLowerCase().includes(term) ||
      staff.phone?.includes(term)
    );
  });

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isFetching && staffList.length === 0) {
    return <Loading />;
  }

  return (
    <>
      <div ref={topRef} className="max-w-6xl mx-auto space-y-16 animate-fade-in pb-20 transition-colors duration-300 relative">
      <ToastContainer theme="dark" position="top-right" />
      
      {/* Section 1: Page Header & Onboarding Form */}
      <div className="space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white px-2 border-l-8 border-blue-600 transition-colors">
            Staff <span className="text-blue-500">Onboarding</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
            Create new staff profiles and assign them to specific roles within the ecosystem.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl dark:shadow-2xl relative overflow-hidden group transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none rounded-full" />
          
          <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Deployment Setup</h3>
              <label className="text-xs uppercase font-black text-slate-500 tracking-[0.2em]">Select Deployment Tier <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-4">
                {["bd", "bdm", "sm", "tl", "rm"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, role: r }))}
                    className={`flex-1 min-w-[200px] py-4 px-6 rounded-3xl border-2 transition-all duration-300 flex items-center justify-center gap-3 font-bold text-sm tracking-wide shadow-md ${
                      formData.role === r 
                        ? "bg-blue-600 border-blue-400 text-white scale-[1.02] ring-4 ring-blue-600/20 shadow-blue-600/20" 
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-600/50 hover:text-blue-600 dark:hover:text-slate-200"
                    }`}
                  >
                    {r === "sm" ? <FaUserTie className="w-5 h-5" /> : 
                     r === "bdm" ? <FaUserShield className="w-5 h-5" /> : 
                     r === "tl" ? <FaUserPlus className="w-5 h-5" /> : 
                     r === "rm" ? <FaMapMarkerAlt className="w-5 h-5" /> : 
                     <FaBriefcase className="w-5 h-5" />}
                    {ROLE_LABELS[r]} ({r.toUpperCase()})
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 space-y-6 bg-slate-50 dark:bg-slate-950/20 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap gap-8 items-center border-b border-slate-200 dark:border-slate-800 pb-6 mb-2">
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-blue-500/50">
                  <input 
                    type="checkbox" 
                    id="isRegionalLeader"
                    checked={formData.isRegionalLeader}
                    onChange={(e) => setFormData(p => ({ ...p, isRegionalLeader: e.target.checked }))}
                    className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="isRegionalLeader" className="text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                    Regional Leader
                  </label>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-500/50">
                  <input 
                    type="checkbox" 
                    id="isTeamLead"
                    checked={formData.isTeamLead}
                    onChange={(e) => setFormData(p => ({ ...p, isTeamLead: e.target.checked }))}
                    className="w-6 h-6 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="isTeamLead" className="text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                    Team Lead
                  </label>
                </div>
              </div>

              {(formData.isRegionalLeader || formData.isTeamLead) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="space-y-4">
                    <label className="text-xs uppercase font-black text-slate-500 tracking-[0.2em] flex items-center gap-2">
                      <FaMapMarkerAlt className="text-blue-500" /> Assign Region
                    </label>
                    <select 
                      name="regionalId" 
                      value={formData.regionalId} 
                      onChange={handleInputChange} 
                      className="w-full h-14 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-6 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-all shadow-sm font-medium"
                    >
                      <option value="">Select Region (Optional)</option>
                      {regions.map(region => (
                        <option key={region._id} value={region._id}>{region.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs uppercase font-black text-slate-500 tracking-[0.2em] flex items-center gap-2">
                      <FaLayerGroup className="text-indigo-500" /> Assign Team/State
                    </label>
                    <select 
                      name="teamId" 
                      value={formData.teamId} 
                      onChange={handleInputChange} 
                      disabled={!formData.regionalId}
                      className="w-full h-14 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-6 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-all shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{formData.regionalId ? "Select Team (Optional)" : "Select a Region first"}</option>
                      {teams.map(team => (
                        <option key={team._id} value={team._id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2 mt-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Personal Information</h3>
            </div>
            <TextInput label="First Name *" name="firstName" required icon={FaUserPlus} value={formData.firstName} onChange={handleInputChange} placeholder="E.g. John" />
            <TextInput label="Last Name *" name="lastName" required icon={FaUserPlus} value={formData.lastName} onChange={handleInputChange} placeholder="E.g. Doe" />
            <TextInput label="Email Address *" type="email" required name="email" icon={FaEnvelope} value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
            <TextInput label="Phone Number *" name="phone" required icon={FaPhone} value={formData.phone} onChange={handleInputChange} placeholder="080 1234 5678" />
            
            <div className="space-y-4">
              <label className="text-xs uppercase font-black text-slate-500 tracking-[0.2em] flex items-center gap-2">
                <FaVenusMars className="text-blue-500" /> Gender
              </label>
              <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full h-14 bg-slate-50 dark:bg-slate-950/80 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-6 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-all shadow-inner font-medium">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-xs uppercase font-black text-slate-500 tracking-[0.2em] flex items-center gap-2">
                <FaRing className="text-blue-500" /> Marital Status
              </label>
              <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="w-full h-14 bg-slate-50 dark:bg-slate-950/80 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-6 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-all shadow-inner font-medium">
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

            <div className="md:col-span-2 mt-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Financial Details</h3>
            </div>
            <TextInput label="Account Name" name="accountName" icon={FaUserTie} value={formData.accountName} onChange={handleInputChange} placeholder="John Doe" />
            <TextInput label="Account Number" name="accountNumber" icon={FaFileInvoice} value={formData.accountNumber} onChange={handleInputChange} placeholder="0123456789" />
            <TextInput label="Bank Name" name="bankName" icon={FaUniversity} value={formData.bankName} onChange={handleInputChange} placeholder="First Bank" />

            <div className="md:col-span-2 mt-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Documents</h3>
            </div>
            <TextInput label="Valid ID Number" name="validId" icon={FaIdCard} value={formData.validId} onChange={handleInputChange} placeholder="E.g. NIN, Passport No." />
            <div className="space-y-4">
              <FileInput label="Passport Photograph" name="passportPhoto" icon={FaPassport} onChange={handleInputChange} accept="image/*" />
              {formData.passportPhoto && (
                <div className="mt-2 relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 group/preview">
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

            <div className="md:col-span-2 mt-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Security Override</h3>
            </div>
            <TextInput label="Temporary Password" type="password" name="password" icon={FaLock} value={formData.password} onChange={handleInputChange} placeholder="Leave blank to use phone number default" />

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
      </div>

      {/* Section 2: Staff List Table */}
      <div className="space-y-8">
        <div ref={tableRef} className="flex flex-col md:flex-row md:items-center justify-between gap-6 scroll-mt-24">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Staff <span className="text-indigo-500">Directory</span></h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Manage and view all registered staff members.</p>
          </div>
          <div className="relative w-full md:w-80 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by name, email or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-6 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl transition-colors">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Staff Member</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Role & Dept</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Contact Details</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {isFetching ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <Loading fullPage={false} />
                      <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest">Scanning Staff Records...</p>
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((staff) => (
                    <tr key={staff._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 group-hover:border-indigo-500/50 transition-colors shadow-sm">
                            {staff.passportPhoto ? (
                              <img src={staff.passportPhoto} alt={staff.firstName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"><FaUserCircle className="text-2xl" /></div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white capitalize leading-tight">{staff.firstName} {staff.lastName}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">ID: {staff.idCardId || "Pending"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 w-fit">
                            {ROLE_LABELS[staff.role] || staff.role}
                          </span>
                          <p className="text-xs text-slate-500 font-medium">Operations Unit</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 space-y-1">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <FaEnvelope className="text-[10px] opacity-60" />
                          <span className="text-xs font-semibold">{staff.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <FaPhone className="text-[10px] opacity-60" />
                          <span className="text-xs font-semibold">{staff.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all">
                          <FaEllipsisV />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                          <FaUserCircle className="text-4xl text-slate-300" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold italic">No staff members found match your criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination UI */}
        {filteredStaff.length > itemsPerPage && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
            <p className="text-sm font-bold text-slate-500">
              Showing <span className="text-slate-900 dark:text-white">{indexOfFirstItem + 1}</span> to{" "}
              <span className="text-slate-900 dark:text-white">{Math.min(indexOfLastItem, filteredStaff.length)}</span> of{" "}
              <span className="text-slate-900 dark:text-white">{filteredStaff.length}</span> staff members
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-indigo-500 hover:text-indigo-500 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-500 transition-all bg-white dark:bg-slate-950"
              >
                <FaChevronLeft className="text-sm" />
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      currentPage === i + 1
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-110"
                        : "bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-500"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-indigo-500 hover:text-indigo-500 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-500 transition-all bg-white dark:bg-slate-950"
              >
                <FaChevronRight className="text-sm" />
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-4">
          <button 
            onClick={() => scrollToRef(tableRef)}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-500 transition-colors flex items-center gap-2 py-2 px-4 rounded-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800"
          >
            <FaArrowUp className="text-[8px]" /> Back to Top of Table
          </button>
        </div>
      </div>
    </div>

      {/* Floating Back to Top Button - Outside the filtered container to ensure fixed positioning works with transforms */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-[100] w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-600/40 flex items-center justify-center hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all duration-300 group ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        title="Back to Top"
      >
        <FaArrowUp className="text-xl group-hover:-translate-y-1 transition-transform" />
      </button>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(100, 116, 139, 0.1); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: rgba(100, 116, 139, 0.2); 
        }
      `}</style>
    </>
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
        className="w-full h-14 bg-slate-50 dark:bg-slate-950/80 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-6 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-blue-500 focus:outline-none transition-all shadow-inner font-medium"
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
        className="w-full text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all font-medium border-2 border-dashed border-slate-200 dark:border-slate-700 p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/80"
      />
    </div>
  </div>
);

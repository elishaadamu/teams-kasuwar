"use client";
import React, { useState, useRef, useEffect } from "react";
import { 
  FaIdCard, 
  FaUpload, 
  FaPrint, 
  FaSearch, 
  FaSignature, 
  FaUserCircle, 
  FaFingerprint, 
  FaMapMarkerAlt,
  FaArrowRight
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";

export default function IDCardPrint() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [signature, setSignature] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.HR.GET_STAFF), { withCredentials: true });
        if (response.data.success) {
          setUsers(response.data.staff || []);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };
    fetchStaff();
  }, []);

  const handlePrint = () => {
    if (!selectedUser) return toast.error("Please select a user first");
    window.print();
  };

  const onSelectFile = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "image/png") {
      const reader = new FileReader();
      reader.onload = () => setSignature(reader.result);
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload a PNG signature file");
    }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in print:hidden">
      <ToastContainer theme="dark" />
      
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-5xl font-black text-white px-2 border-l-8 border-indigo-600">
          ID Card <span className="text-indigo-500">Forge</span>
        </h1>
        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
          Generate secure, print-ready identification cards for authorized staff and regional managers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Selection & Controls */}
        <div className="space-y-10">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
            <div className="relative group">
              <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search staff database..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-16 pr-8 h-16 bg-slate-950/50 border-2 border-slate-800 rounded-3xl w-full text-white text-lg placeholder:text-slate-700 focus:border-indigo-500 focus:outline-none transition-all shadow-inner"
              />
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all flex items-center gap-6 group ${
                    selectedUser?.id === user.id 
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-xl scale-[1.01]" 
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <img src={user.passport} className="w-14 h-14 rounded-2xl border-2 border-white/20 shadow-md group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <h3 className="font-black text-xl tracking-tight leading-none">{user.name}</h3>
                    <p className="text-xs font-bold opacity-60 mt-1 uppercase tracking-wider">{user.role}</p>
                  </div>
                  <FaFingerprint className={`text-2xl ${selectedUser?.id === user.id ? 'opacity-40' : 'opacity-10'}`} />
                </button>
              ))}
            </div>

            {/* Signature Upload */}
            <div className="pt-8 border-t border-slate-800 space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <FaSignature className="text-indigo-500" /> Digital Authorization (Signature PNG)
              </label>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".png" 
                  onChange={onSelectFile}
                  className="hidden" 
                  id="sig-upload" 
                />
                <label 
                  htmlFor="sig-upload"
                  className="w-full h-20 bg-slate-950 border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center gap-4 text-slate-500 hover:text-indigo-400 hover:border-indigo-500 transition-all cursor-pointer font-black text-sm uppercase tracking-widest active:scale-95 shadow-inner"
                >
                  <FaUpload />
                  {signature ? "Change Signature" : "Upload PNG File"}
                </label>
              </div>
            </div>

            <button 
              onClick={handlePrint}
              className="w-full h-20 rounded-3xl bg-indigo-600 text-white font-black text-xl uppercase tracking-widest shadow-2xl hover:scale-[1.02] hover:shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-4"
            >
              <FaPrint size={24} />
              Transmit to Printer
            </button>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="sticky top-32 group flex justify-center">
            {selectedUser ? (
                <div className="w-[380px] h-[600px] bg-white rounded-[2rem] shadow-[0_50px_100px_rgba(0,0,0,0.6)] flex flex-col items-center overflow-hidden relative group transition-all duration-700 hover:rotate-2">
                    
                    {/* Modern Card Design */}
                    <div className="w-full h-40 bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-950 p-8 flex flex-col justify-end text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-[50px] rotate-45 -mr-20 -mt-20" />
                        <h4 className="text-2xl font-black tracking-tighter uppercase relative z-10 italic">KASUWAR</h4>
                        <p className="text-[10px] font-black tracking-[0.4em] opacity-70 relative z-10">OFFICIAL PERSONNEL</p>
                    </div>

                    <div className="flex-1 w-full bg-white px-10 pt-16 flex flex-col items-center text-slate-900 text-center">
                        <div className="absolute top-24 left-1/2 -translate-x-1/2">
                           <div className="w-40 h-40 rounded-[2.5rem] border-[6px] border-white shadow-2xl overflow-hidden relative group">
                                <img src={selectedUser.passport} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />
                           </div>
                        </div>

                        <div className="mt-8 space-y-1">
                            <h3 className="text-3xl font-black tracking-tight text-slate-950 uppercase">{selectedUser.name}</h3>
                            <p className="text-lg font-black text-indigo-600 uppercase tracking-widest">{selectedUser.role}</p>
                        </div>

                        <div className="mt-10 grid grid-cols-2 gap-8 w-full border-y border-slate-100 py-8">
                            <div className="text-left">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee ID</p>
                                <p className="text-xs font-black text-slate-800 mt-1">{selectedUser.id}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">State Council</p>
                                <p className="text-xs font-black text-slate-800 mt-1 uppercase">{selectedUser.state}</p>
                            </div>
                            <div className="text-left col-span-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Regional Manager</p>
                                <p className="text-xs font-black text-slate-800 mt-1 uppercase italic">{selectedUser.regionalManager}</p>
                            </div>
                        </div>

                        <div className="mt-auto mb-10 w-full flex flex-col items-center gap-4">
                            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.4em]">Authorized Signatory</p>
                            {signature && <img src={signature} className="h-14 w-auto object-contain grayscale brightness-90 shadow-sm" />}
                            <div className="w-full h-px bg-slate-100" />
                            <div className="flex items-center gap-2 opacity-30">
                                <FaFingerprint size={24} />
                                <span className="text-[10px] font-black">BIOMETRIC VERIFIED</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Barcode */}
                    <div className="w-full h-4 bg-slate-950 flex gap-0.5 overflow-hidden">
                        {[1,4,2,7,8,4,3,2,6,7,2,1,9,4,3,2,6,1,4,8,4,3].map((v,i) => (
                            <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-white/10' : 'bg-transparent'}`} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="w-[380px] h-[600px] border-4 border-dashed border-slate-900 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center opacity-30">
                    <FaIdCard className="text-8xl mb-8 text-slate-800" />
                    <h3 className="text-2xl font-black text-slate-700 tracking-tight uppercase">Virtual Forge</h3>
                    <p className="mt-4 text-slate-500 font-medium">Select a staff member to visualize their high-security digital identification card in real-time.</p>
                </div>
            )}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; background: white !important; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex !important; justify-content: center; align-items: center; }
          .print-area div { transform: scale(1.5) rotate(0deg) !important; box-shadow: none !important; border: 1px solid #ddd !important; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>

      {/* Actual Print Area (Hidden in browser) */}
      {selectedUser && (
        <div className="hidden print-area justify-center items-center h-screen w-screen absolute inset-0 bg-white">
             {/* Copy of the card from above but simplified for print */}
             <div className="w-[350px] h-[550px] border border-slate-200 flex flex-col items-center text-slate-900 bg-white">
                 <div className="w-full h-32 bg-indigo-900 flex flex-col justify-center px-8 text-white">
                    <h4 className="text-2xl font-black">KASUWAR</h4>
                    <p className="text-[8px] font-black tracking-widest opacity-70">OFFICIAL PERSONNEL</p>
                 </div>
                 <div className="flex-1 w-full flex flex-col items-center px-10 pt-10 text-center">
                    <img src={selectedUser.passport} className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl -mt-24" />
                    <h3 className="text-2xl font-black mt-6">{selectedUser.name}</h3>
                    <p className="text-sm font-black text-indigo-600 uppercase mt-2">{selectedUser.role}</p>
                    <div className="mt-8 grid grid-cols-2 gap-6 w-full py-6 border-y border-slate-100 text-[10px] font-bold">
                        <div className="text-left"><p className="text-slate-400">ID NUMBER</p><p>{selectedUser.id}</p></div>
                        <div className="text-right"><p className="text-slate-400">STATE</p><p>{selectedUser.state}</p></div>
                    </div>
                    {signature && <img src={signature} className="h-10 mt-auto mb-10 object-contain grayscale" />}
                 </div>
             </div>
        </div>
      )}
    </div>
  );
}

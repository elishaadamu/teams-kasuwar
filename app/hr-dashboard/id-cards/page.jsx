"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Logo from "@/assets/logo/logo-white.png";
import {
  FaIdCard, FaUpload, FaSearch, FaSignature,
  FaUserCircle, FaFingerprint, FaArrowRight,
  FaCheckCircle, FaDownload, FaFilePdf, FaPrint
} from "react-icons/fa";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ROLE_LABELS = {
  sm: "Sales Manager",
  bdm: "Business Dev. Manager",
  bd: "Business Developer",
  tl: "Team Leader",
};

export default function IDCardGenerator() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [passportPhoto, setPassportPhoto] = useState(null); // preview base64
  const [passportFile, setPassportFile] = useState(null);   // actual file
  const [signature, setSignature] = useState(null);         // preview base64
  const [signatureFile, setSignatureFile] = useState(null); // actual file
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState(null);
  const cardRef = useRef(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.HR.GET_STAFF), API_CONFIG);
      console.log("Staff list response:", res.data);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching staff:", err);
      toast.error("Failed to load staff list.");
    }
  };

  const handleGenerate = async () => {
    if (!selectedUser) return toast.warn("Please select a staff member first.");
    if (!passportPhoto) return toast.warn("Passport photo is required (pre-filled or new upload).");
    if (!signatureFile && !signature) return toast.warn("Signature is required.");

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("userId", selectedUser._id);
      if (passportFile) formData.append("passportPhoto", passportFile);
      if (signatureFile) formData.append("signaturePhoto", signatureFile);

      console.log("Sending upload request for user:", selectedUser._id);
      
      const res = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.HR.GENERATE_ID_CARD), formData, {
        ...API_CONFIG,
        headers: {
          ...API_CONFIG.headers,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload success response:", res.data);
      setGeneratedCard({
        ...res.data.data,
        state: selectedUser?.state || res.data.data.state
      });
      toast.success(`Success! ID Card ${res.data.data.idCardId} generated.`);
    } catch (err) {
      console.error("Upload error details:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to generate ID card. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = `ID_Card_${generatedCard?.idCardId || "staff"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("ID Card downloaded as image!");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download image.");
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    try {
      toast.info("Generating PDF...");
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(cardRef.current, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const cardWidthMm = 85.6;
      const cardHeightMm = (canvas.height / canvas.width) * cardWidthMm;

      const pdf = new jsPDF({
        orientation: cardHeightMm > cardWidthMm ? "portrait" : "landscape",
        unit: "mm",
        format: [cardWidthMm, cardHeightMm],
      });

      pdf.addImage(imgData, "PNG", 0, 0, cardWidthMm, cardHeightMm, undefined, "FAST");
      pdf.save(`ID_Card_${generatedCard?.idCardId || "staff"}.pdf`);
      toast.success("PDF downloaded!");
    } catch (err) {
      console.error("PDF error:", err);
      toast.error("Failed to generate PDF.");
    }
  };

  const onSelectPassport = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setPassportFile(file);
      const reader = new FileReader();
      reader.onload = () => setPassportPhoto(reader.result);
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload a valid image file for passport");
    }
  };

  const onSelectSignature = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSignatureFile(file);
      const reader = new FileReader();
      reader.onload = () => setSignature(reader.result);
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload a valid image file for signature");
    }
  };

  const filteredUsers = (Array.isArray(users) ? users : []).filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(term) ||
      u.lastName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.accountNumber?.toString().includes(term) ||
      u.phone?.toString().includes(term)
    );
  });

  return (
    <>
      <ToastContainer theme="dark" position="top-right" />

      <div className="max-w-7xl mx-auto space-y-12 animate-fade-in print:hidden transition-colors duration-300">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white px-2 border-l-8 border-indigo-600 transition-colors">
            ID Card <span className="text-indigo-500">Generator</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
            Search for a staff member, upload their passport and signature, then generate and download their official ID card.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Controls */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-xl dark:shadow-2xl space-y-8 transition-colors">

              {/* Search */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Find Staff Member</label>
                <div className="relative group">
                  <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search by name, email, account or phone..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setGeneratedCard(null); setSelectedUser(null); }}
                    className="pl-14 pr-6 h-14 bg-slate-100 dark:bg-slate-950/50 border-2 border-slate-200 dark:border-slate-800 rounded-2xl w-full text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {searchTerm.trim() !== "" ? (
                  filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <button
                        key={user._id}
                        onClick={() => { 
                          setSelectedUser(user); 
                          setGeneratedCard(null); 
                          setSearchTerm(""); 
                          if (user.passportPhoto) {
                            setPassportPhoto(user.passportPhoto);
                          } else {
                            setPassportPhoto(null);
                          }
                          setPassportFile(null);
                        }}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group ${
                          selectedUser?._id === user._id
                            ? "bg-indigo-600 border-indigo-400 text-white shadow-xl"
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-600/50"
                        }`}
                      >
                        {user.passportPhoto ? (
                          <img src={user.passportPhoto} className="w-12 h-12 rounded-xl border-2 border-white/20 object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <FaUserCircle className="text-slate-400 dark:text-slate-500 text-2xl" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`font-black text-base leading-tight ${selectedUser?._id === user._id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{user.firstName} {user.lastName}</p>
                          <p className={`text-xs uppercase tracking-wider ${selectedUser?._id === user._id ? 'text-indigo-100' : 'text-slate-400 opacity-60'}`}>{ROLE_LABELS[user.role] || user.role}</p>
                        </div>
                        <FaFingerprint className={`opacity-20 shrink-0 ${selectedUser?._id === user._id ? 'opacity-40' : ''}`} />
                      </button>
                    ))
                  ) : (
                    <p className="text-center py-6 text-slate-500 font-bold italic">No results found for "{searchTerm}"</p>
                  )
                ) : null}
              </div>

              {selectedUser && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="p-6 rounded-3xl bg-indigo-600/10 border-2 border-indigo-600/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">Active Selection</p>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">{selectedUser.firstName} {selectedUser.lastName}</h4>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                      <FaCheckCircle className="text-2xl" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-500">Passport Photo</label>
                      <label className="relative block h-40 bg-slate-100 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl cursor-pointer hover:border-indigo-600/50 transition-all overflow-hidden group">
                        <input type="file" className="hidden" onChange={onSelectPassport} accept="image/*" />
                        {passportPhoto ? (
                          <img src={passportPhoto} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-500">
                            <FaUpload className="text-2xl animate-bounce" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Upload Photo</span>
                          </div>
                        )}
                      </label>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-500">Staff Signature</label>
                      <label className="relative block h-40 bg-slate-100 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl cursor-pointer hover:border-indigo-600/50 transition-all overflow-hidden group">
                        <input type="file" className="hidden" onChange={onSelectSignature} accept="image/*" />
                        {signature ? (
                          <img src={signature} className="w-full h-full object-contain p-4 transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-500">
                            <FaSignature className="text-2xl animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Upload Signature</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !passportPhoto || !signature}
                    className={`w-full h-16 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-4 ${
                      isGenerating || !passportPhoto || !signature
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/30 hover:-translate-y-1"
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        Uploading to Cloud...
                      </>
                    ) : (
                      <>
                        <FaArrowRight /> Generate &amp; Upload
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="sticky top-32 flex flex-col items-center gap-6">
            {generatedCard ? (
              <>
                <div
                  ref={cardRef}
                  id="id-card-render"
                  className="w-[300px] select-none scale-110 drop-shadow-2xl"
                >
                  <IDCard card={generatedCard} />
                </div>

                <div className="text-center space-y-1">
                  <p className="text-emerald-500 dark:text-emerald-400 font-black text-sm flex items-center gap-2 justify-center italic">
                    <FaCheckCircle /> Card Generated Successfully
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-mono">{generatedCard.idCardId}</p>
                </div>

                <div className="flex gap-3 w-[300px]">
                  <button
                    onClick={handleDownloadImage}
                    className="flex-1 h-12 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <FaDownload /> Image
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 h-12 bg-blue-800 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <FaIdCard /> PDF
                  </button>
                </div>
              </>
            ) : (
              <div className="w-[300px] h-[480px] border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-5 text-center px-10 transition-colors">
                {!selectedUser ? (
                  <>
                    <FaSearch className="text-5xl text-slate-300 dark:text-slate-700" />
                    <p className="text-slate-400 dark:text-slate-600 font-bold text-sm italic">Search and select a staff member to begin</p>
                  </>
                ) : !passportFile && !signatureFile ? (
                  <>
                    <FaUpload className="text-5xl text-slate-300 dark:text-slate-700" />
                    <p className="text-slate-400 dark:text-slate-600 font-bold text-sm italic">Upload passport &amp; signature, then click Generate</p>
                  </>
                ) : (
                  <>
                    <FaArrowRight className="text-5xl text-slate-300 dark:text-slate-700" />
                    <p className="text-slate-400 dark:text-slate-600 font-bold text-sm italic">Ready! Click <span className="text-indigo-500">Generate &amp; Upload</span> to create the ID card</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {generatedCard && (
        <div className="hidden print:flex print:items-center print:justify-center print:min-h-screen print:bg-white">
          <IDCard card={generatedCard} />
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(100, 116, 139, 0.2); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: rgba(100, 116, 139, 0.4); 
        }
      `}</style>
    </>
  );
}

function QRCodeImage({ data, size = 60 }) {
  const [qrSrc, setQrSrc] = React.useState("");
  React.useEffect(() => {
    if (!data) return;
    import("qrcode").then(({ default: QRCode }) => {
      QRCode.toDataURL(data, {
        width: size * 4,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
        errorCorrectionLevel: "H",
      }).then(setQrSrc);
    });
  }, [data, size]);
  if (!qrSrc) return <div style={{ width: size, height: size, background: "#f1f5f9", borderRadius: 4 }} />;
  return <img src={qrSrc} alt="QR" style={{ width: size, height: size, imageRendering: "pixelated" }} />;
}

const ROLE_LABELS_MAP = {
  sm: "Sales Manager",
  bdm: "Business Dev. Manager",
  bd: "Business Developer",
  tl: "Team Leader",
};

function IDCard({ card }) {
  if (!card) return null;
  return (
    <div
      style={{
        width: "300px",
        background: "white",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        border: "1px solid #dbeafe",
        fontFamily: "Arial, sans-serif",
        position: "relative",
      }}
    >
      <div style={{ background: "linear-gradient(135deg, #0a1657 0%, #1e40af 100%)", padding: "16px 16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
          <img
            src="/logo-white.png"
            alt="Kasuwar Zamani"
            style={{ height: "44px", width: "auto", objectFit: "contain" }}
            crossOrigin="anonymous"
          />
        </div>
        <div style={{ textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "8px" }}>
          <p style={{ color: "#bfdbfe", fontSize: "8px", letterSpacing: "0.25em", fontWeight: "bold", textTransform: "uppercase", margin: 0 }}>Official Staff Identity Card</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", background: "#eff6ff", paddingTop: "0", paddingBottom: "0" }}>
        <div style={{ marginTop: "-1px", padding: "14px 0 10px" }}>
          <div style={{
            width: "100px", height: "120px",
            borderRadius: "12px",
            border: "4px solid white",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            overflow: "hidden",
            background: "#cbd5e1",
          }}>
            {card.passportPhoto ? (
              <img src={card.passportPhoto} style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", color: "#94a3b8" }}>👤</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: "white", padding: "10px 18px 14px" }}>
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <p style={{ fontSize: "7px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: "bold", margin: "0 0 2px" }}>Full Name</p>
          <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", textTransform: "uppercase", margin: 0 }}>{card.fullName}</h3>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1e40af",
            fontSize: "9px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            height: "18px",
            padding: "0 16px",
            borderRadius: "100px",
            whiteSpace: "nowrap",
            lineHeight: "1",
          }}>
            {ROLE_LABELS_MAP[card.role] || card.role}
          </div>
        </div>

        <div style={{ borderTop: "1px solid #e2e8f0", marginBottom: "10px" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
          <div>
            <p style={{ fontSize: "7px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: "bold", margin: "0 0 2px" }}>State</p>
            <p style={{ fontSize: "11px", fontWeight: "800", color: "#1e293b", textTransform: "uppercase", margin: 0 }}>{card.state || "—"}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "7px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: "bold", margin: "0 0 2px" }}>ID No.</p>
            <p style={{ fontSize: "10px", fontWeight: "900", color: "#1e3a8a", margin: 0 }}>{card.idCardId}</p>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "10px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "7px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: "bold", margin: "0 0 4px" }}>Authorized Signature</p>
            {card.signaturePhoto ? (
              <img src={card.signaturePhoto} style={{ height: "36px", width: "auto", objectFit: "contain" }} crossOrigin="anonymous" />
            ) : (
              <div style={{ height: "36px", width: "80px", borderBottom: "1px dashed #cbd5e1" }} />
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <QRCodeImage
              data={[
                `Name: ${card.fullName}`,
                `Role: ${ROLE_LABELS_MAP[card.role] || card.role}`,
                `ID: ${card.idCardId}`,
                `State: ${card.state || "-"}`,
              ].join("\n")}
              size={58}
            />
            <p style={{ fontSize: "6px", color: "#94a3b8", margin: 0, letterSpacing: "0.1em" }}>SCAN TO VERIFY</p>
          </div>
        </div>
      </div>
      <div style={{ background: "linear-gradient(135deg, #0a1657 0%, #1e40af 100%)", height: "8px" }} />

      {/* Background Watermark Role */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(-30deg)",
        fontSize: "36px",
        fontWeight: "950",
        color: "rgba(30, 64, 175, 0.04)",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: 0,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        width: "100%",
        textAlign: "center"
      }}>
        {ROLE_LABELS_MAP[card.role] || card.role}
      </div>
    </div>
  );
}

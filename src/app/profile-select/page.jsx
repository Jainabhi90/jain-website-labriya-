"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  UserPlus, 
  MapPin, 
  Phone, 
  ArrowRight, 
  AlertCircle, 
  Check, 
  LogOut,
  Trash2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { translations } from "@/services/translations";

export default function ProfileSelect() {
  const router = useRouter();
  const { 
    user, 
    profile, 
    profilesList, 
    loading, 
    isAuthenticated, 
    selectProfile, 
    createSecondaryProfile,
    deleteSecondaryProfile,
    logout 
  } = useAuth();

  const [lang, setLang] = useState("en");
  const [showAddForm, setShowAddForm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Deletion states
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Sync language selection
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "en");
      const syncLang = () => {
        setLang(localStorage.getItem("lang") || "en");
      };
      window.addEventListener("languageChange", syncLang);
      return () => window.removeEventListener("languageChange", syncLang);
    }
  }, []);

  // Handle ?add=true on mount to display form automatically
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("add=true")) {
      setShowAddForm(true);
    }
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/login");
      }
    }
  }, [loading, isAuthenticated, router]);

  const t = translations[lang] || translations["en"];

  // Helper translations for Profile selection
  const pt = {
    en: {
      title: "Choose Devotee Profile",
      subtitle: "Select a family member's profile to enter the Chaturmas portal",
      primary: "Primary Member",
      secondary: "Secondary Member",
      addMember: "Add Family Member",
      addMemberDesc: "Create a secondary family profile",
      formTitle: "Add Family Profile",
      formName: "Full Name",
      formPhone: "Mobile Number",
      formCity: "City",
      formSubmit: "Create Profile",
      formCancel: "Cancel",
      signOut: "Sign Out",
      maxMembers: "Maximum of 2 family members per account reached.",
      nameLengthError: "Full name must be at least 3 characters.",
      phoneLengthError: "Please enter a valid 10-digit mobile number.",
      cityError: "City is required.",
      duplicatePhoneError: "This mobile number is already registered to your family.",
      globalDuplicatePhoneError: "This mobile number is already registered to another devotee."
    },
    hi: {
      title: "भक्त प्रोफाइल चुनें",
      subtitle: "चातुर्मास पोर्टल में प्रवेश करने के लिए परिवार के सदस्य की प्रोफाइल चुनें",
      primary: "मुख्य सदस्य",
      secondary: "द्वितीय सदस्य",
      addMember: "परिवार का सदस्य जोड़ें",
      addMemberDesc: "परिवार की दूसरी प्रोफाइल बनाएँ",
      formTitle: "परिवार की प्रोफाइल जोड़ें",
      formName: "पूरा नाम",
      formPhone: "मोबाइल नंबर",
      formCity: "शहर",
      formSubmit: "प्रोफाइल बनाएँ",
      formCancel: "रद्द करें",
      signOut: "लॉग आउट",
      maxMembers: "प्रति खाता अधिकतम २ परिवार के सदस्यों की सीमा समाप्त हो चुकी है।",
      nameLengthError: "पूरा नाम कम से कम ३ अक्षरों का होना चाहिए।",
      phoneLengthError: "कृपया एक वैध १० अंकों का मोबाइल नंबर दर्ज करें।",
      cityError: "शहर आवश्यक है।",
      duplicatePhoneError: "यह मोबाइल नंबर आपके परिवार में पहले से पंजीकृत है।",
      globalDuplicatePhoneError: "यह मोबाइल नंबर किसी अन्य भक्त के साथ पहले से पंजीकृत है।"
    }
  }[lang] || {
    en: {}
  };

  const handleSelect = async (profileId) => {
    try {
      const selected = await selectProfile(profileId);
      if (selected) {
        const destination = selected.role === "admin" ? "/admin" : "/dashboard";
        router.push(destination);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to select profile.");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedName = fullName.trim();
    const trimmedCity = city.trim();
    const trimmedPhone = mobile.trim().replace(/\D/g, "");

    if (trimmedName.length < 3) {
      setErrorMsg(pt.nameLengthError);
      return;
    }
    if (trimmedPhone.length > 0 && trimmedPhone.length < 10) {
      setErrorMsg(pt.phoneLengthError);
      return;
    }
    if (!trimmedCity) {
      setErrorMsg(pt.cityError);
      return;
    }

    // Client-side duplicate check (only if mobile is provided)
    let formattedPhone = "";
    if (trimmedPhone.length === 10) {
      formattedPhone = `+91${trimmedPhone}`;
      const isPhoneDup = profilesList.some(p => p.mobile === formattedPhone || p.mobile === trimmedPhone);
      if (isPhoneDup) {
        setErrorMsg(pt.duplicatePhoneError);
        return;
      }
    }

    if (profilesList.length >= 2) {
      setErrorMsg(pt.maxMembers);
      return;
    }

    setIsSubmitting(true);
    try {
      const newProf = await createSecondaryProfile({
        fullName: trimmedName,
        phone: formattedPhone || null,
        city: trimmedCity
      });
      if (newProf) {
        setShowAddForm(false);
        setFullName("");
        setMobile("");
        setCity("");
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", "/profile-select");
        }
      }
    } catch (err) {
      if (err.message?.includes("unique_active_mobile") || err.code === "23505") {
        setErrorMsg(pt.globalDuplicatePhoneError);
      } else {
        setErrorMsg(err.message || "Failed to create profile.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!profileToDelete) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteSecondaryProfile(profileToDelete.id);
      setProfileToDelete(null);
    } catch (err) {
      setDeleteError(err.message || "Failed to delete profile.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setErrorMsg("");
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", "/profile-select");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("ProfileSelect: Signout failed:", err);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-bg-custom">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping duration-1000" />
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="absolute text-[10px]">🪷</span>
          </div>
          <p className="text-xs text-text-secondary">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 min-h-[85vh] flex flex-col justify-center items-center">
      
      <div className="w-full text-center max-w-xl mb-12">
        <span className="px-2.5 py-1 rounded bg-secondary text-primary font-bold text-[9px] uppercase tracking-wider border border-primary/10 select-none">
          {lang === "en" ? "Family Account System" : "पारिवारिक खाता व्यवस्था"}
        </span>
        <h2 className="font-display font-semibold text-text-primary text-2xl sm:text-3xl mt-4">
          {pt.title}
        </h2>
        <p className="text-xs text-text-secondary mt-2.5 leading-relaxed">
          {pt.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl items-stretch">
        {/* Render Existing profiles */}
        {profilesList.map((p) => {
          const isCurrent = profile?.id === p.id;
          const isPrimary = p.member_number === 1;

          return (
            <motion.div
              key={p.id}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelect(p.id)}
              className={`relative p-6 rounded-custom-lg border transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-64 overflow-hidden bg-white hover:shadow-premium group ${
                isCurrent 
                  ? "bg-gradient-to-br from-primary/5 via-secondary/10 to-white border-primary/45 ring-2 ring-primary/10" 
                  : "border-border-custom hover:border-primary/20"
              }`}
            >
              {/* Accent Top saffron border */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all ${
                isCurrent ? "bg-primary" : "bg-neutral-100 group-hover:bg-primary/50"
              }`} />

              {/* Tag and Deletion actions */}
              <div className="w-full flex justify-between items-center mb-4 select-none">
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                  isPrimary 
                    ? "bg-orange-50 text-primary border-primary/10" 
                    : "bg-amber-50 text-amber-700 border-amber-500/10"
                }`}>
                  {isPrimary ? pt.primary : pt.secondary}
                </span>

                {!isPrimary && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileToDelete(p);
                    }}
                    className="p-1.5 rounded-full hover:bg-red-50 text-text-secondary hover:text-red-600 transition-colors"
                    title="Delete family member"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-white border-4 border-secondary shadow-md relative">
                <span className="text-3xl font-display font-medium select-none">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover rounded-full" />
                  ) : "🪷"}
                </span>
                {isCurrent && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Profile Metadata */}
              <div className="mt-4 flex-grow flex flex-col justify-center">
                <h3 className="font-display font-semibold text-text-primary text-base group-hover:text-primary transition-colors">
                  {p.full_name || "Devotee"}
                </h3>
                <p className="text-[10px] text-text-secondary mt-1 flex items-center justify-center gap-1">
                  <MapPin size={10} />
                  <span>{p.city || "Labriya"}</span>
                </p>
              </div>

              {/* Sadhana highlights */}
              <div className="mt-4 pt-3 border-t border-border-custom w-full grid grid-cols-2 text-center text-[10px]">
                <div className="border-r border-border-custom">
                  <span className="text-text-secondary block uppercase tracking-wider text-[8px] font-semibold">Points</span>
                  <span className="font-bold text-text-primary text-xs mt-0.5 block">{p.total_points || 0}</span>
                </div>
                <div>
                  <span className="text-text-secondary block uppercase tracking-wider text-[8px] font-semibold">Streak</span>
                  <span className="font-bold text-text-primary text-xs mt-0.5 block">🔥 {p.current_streak || 0}</span>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* SECONDARY PROFILE SLOT OR INLINE FORM */}
        {profilesList.length < 2 && (
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className={`rounded-custom-lg border transition-all flex flex-col justify-between overflow-hidden relative min-h-64 ${
              showAddForm 
                ? "bg-white border-primary/30 shadow-premium p-5 sm:p-6" 
                : "border-2 border-dashed border-border-custom hover:border-primary/40 bg-neutral-50/50 hover:bg-white cursor-pointer"
            }`}
          >
            <AnimatePresence mode="wait">
              {!showAddForm ? (
                <motion.div
                  key="dashed-add-button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => { setShowAddForm(true); setErrorMsg(""); }}
                  className="flex flex-col items-center justify-center text-center p-6 h-full flex-grow group"
                >
                  <div className="w-14 h-14 rounded-full bg-secondary/50 text-primary flex items-center justify-center border border-primary/10 group-hover:scale-105 transition-transform duration-300">
                    <UserPlus size={24} />
                  </div>
                  <h3 className="font-display font-semibold text-text-primary text-sm mt-4 group-hover:text-primary transition-colors">
                    {pt.addMember}
                  </h3>
                  <p className="text-[10px] text-text-secondary mt-1.5 max-w-[200px] leading-relaxed">
                    {pt.addMemberDesc}
                  </p>
                  <span className="mt-3 text-[8px] font-bold text-primary/75 bg-secondary px-2 py-0.5 rounded border border-primary/15 uppercase tracking-wider select-none">
                    Limit: 2 Members
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="inline-add-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col h-full w-full justify-between"
                >
                  <h3 className="font-display font-semibold text-text-primary text-sm mb-3 pb-2 border-b border-neutral-100 flex items-center gap-1.5">
                    <UserPlus size={16} className="text-primary" />
                    <span>{pt.formTitle}</span>
                  </h3>

                  <form onSubmit={handleAddSubmit} className="flex flex-col gap-2.5 flex-grow">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">
                        {pt.formName} <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Devotee name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={isSubmitting}
                          className="w-full pl-8 pr-3 py-1.5 rounded bg-bg-custom border border-border-custom focus:border-primary/50 focus:outline-none text-xs transition-all text-text-primary font-medium"
                          autoFocus
                        />
                        <User size={12} className="text-text-secondary/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">
                        {pt.formPhone} <span className="text-text-secondary/80">(Optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs font-semibold select-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="10-digit mobile"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                          disabled={isSubmitting}
                          className="w-full pl-10 pr-3 py-1.5 rounded bg-bg-custom border border-border-custom focus:border-primary/50 focus:outline-none text-xs transition-all text-text-primary font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">
                        {pt.formCity} <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          disabled={isSubmitting}
                          className="w-full pl-8 pr-3 py-1.5 rounded bg-bg-custom border border-border-custom focus:border-primary/50 focus:outline-none text-xs transition-all text-text-primary font-medium"
                        />
                        <MapPin size={12} className="text-text-secondary/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="flex items-start gap-1.5 p-2 rounded bg-red-50 text-red-600 border border-red-500/10 text-[9px] leading-relaxed">
                        <AlertCircle size={11} className="shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-2 pt-2 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={handleCancelForm}
                        disabled={isSubmitting}
                        className="flex-1 py-1.5 rounded border border-border-custom hover:bg-neutral-50 text-text-primary font-semibold text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center"
                      >
                        {pt.formCancel}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-1.5 rounded bg-primary hover:bg-primary/95 text-white font-bold text-[10px] uppercase tracking-wider shadow-premium transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <>
                            <span>{pt.formSubmit}</span>
                            <ArrowRight size={10} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Footer controls: Back to Dashboard & Logout options */}
      <div className="mt-12 flex items-center gap-6 justify-center">
        {profilesList.length > 0 && profile && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const destination = profile.role === "admin" ? "/admin" : "/dashboard";
              router.push(destination);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-custom-md text-xs font-semibold text-text-secondary hover:text-primary hover:bg-neutral-50 transition-all border border-transparent hover:border-border-custom cursor-pointer"
          >
            <span>←</span>
            <span>{lang === "en" ? "Back to Dashboard" : "डैशबोर्ड पर वापस"}</span>
          </motion.button>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-custom-md text-xs font-semibold text-text-secondary hover:text-red-600 hover:bg-red-50/50 transition-all border border-transparent hover:border-red-500/10 cursor-pointer"
        >
          <LogOut size={14} />
          <span>{pt.signOut}</span>
        </motion.button>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {profileToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfileToDelete(null)}
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            />
            {/* Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-white rounded-custom-lg border border-border-custom p-6 shadow-premium z-10 flex flex-col gap-4 text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
              
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-2">
                <Trash2 size={22} />
              </div>

              <div>
                <h4 className="font-display font-semibold text-text-primary text-base">
                  {lang === "en" ? "Delete Family Profile?" : "पारिवारिक प्रोफाइल हटाएं?"}
                </h4>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                  {lang === "en" 
                    ? `Are you sure you want to delete ${profileToDelete.full_name || "this devotee"}'s profile? All daily sadhana history and logs for this profile will be permanently erased.` 
                    : `क्या आप ${profileToDelete.full_name || "इस भक्त"} की प्रोफाइल हटाना चाहते हैं? इस प्रोफाइल का सभी दैनिक साधना इतिहास और लॉग स्थायी रूप से मिटा दिया जाएगा।`}
                </p>
              </div>

              {deleteError && (
                <div className="p-2 rounded bg-red-50 text-red-600 text-[10px] leading-relaxed text-left border border-red-500/10">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setProfileToDelete(null); setDeleteError(""); }}
                  disabled={isDeleting}
                  className="flex-1 py-2 text-[10px] uppercase font-bold tracking-wider rounded border border-border-custom hover:bg-neutral-50 text-text-primary transition-all cursor-pointer"
                >
                  {lang === "en" ? "Cancel" : "रद्द करें"}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-2 text-[10px] uppercase font-bold tracking-wider rounded bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <span>{lang === "en" ? "Delete" : "हटाएं"}</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

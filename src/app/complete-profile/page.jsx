"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { translations } from "@/services/translations";
import { User, MapPin, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

export default function CompleteProfile() {

  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { profile, loading: profileLoading, complete, isProfileComplete } = useProfile();



  const [lang, setLang] = useState("en");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Sync language selection with global app state
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

  // Set default values from profile database record if available
  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone.replace("+91", ""));
    }
    if (profile) {
      if (profile.full_name && profile.full_name !== "Devotee") {
        setFullName(profile.full_name);
      }
      if (profile.city) {
        setCity(profile.city);
      }
      if (profile.phone || profile.mobile) {
        setPhone((profile.phone || profile.mobile).replace("+91", ""));
      }

      // If profile is already complete, redirect immediately to target dashboard
      if (profile.is_profile_complete) {
        const destination = profile.role === "admin" ? "/admin" : "/dashboard";
        router.push(destination);
      }
    }
  }, [profile, user, router]);

  // Enforce session security checks
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const t = translations[lang] || translations["en"];

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg("");

    // Validate inputs
    const trimmedName = fullName.trim();
    const trimmedCity = city.trim();
    const trimmedPhone = phone.trim().replace(/\D/g, "");

    if (trimmedName.length < 3) {
      setErrorMsg(t.nameMinLengthError || "Full name must be at least 3 characters");
      return;
    }

    if (trimmedPhone.length < 10) {
      setErrorMsg(lang === "en" ? "Please enter a valid 10-digit phone number." : "कृपया एक वैध १० अंकों का मोबाइल नंबर दर्ज करें।");
      return;
    }

    if (!trimmedCity) {
      setErrorMsg(t.cityRequiredError || "City is required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Save updates to Supabase
      const updatedProfile = await complete({
        fullName: trimmedName,
        phone: `+91${trimmedPhone}`,
        city: trimmedCity
      });

      triggerToast(t.profileUpdateSuccess || "Profile updated successfully!");

      // Wait briefly for toast visibility before redirecting based on role
      setTimeout(() => {
        const destination = updatedProfile?.role === "admin" ? "/admin" : "/dashboard";
        router.push(destination);
      }, 1500);

    } catch (err) {
      console.error("CompleteProfile form save failed:", err);
      setErrorMsg(err.message || t.profileUpdateError || "Failed to update profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Show a clean loading state while checking sessions
  if (authLoading || profileLoading || !isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-bg-custom">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping duration-1000" />
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="absolute text-[10px]">🪷</span>
          </div>
          <p className="text-xs text-text-secondary">Loading profile setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto px-6 py-16 md:py-24 flex flex-col justify-center min-h-[75vh]">

      {/* Toast Alert Banner */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3.5 bg-green-50 text-green-800 border border-green-200/50 rounded-custom-md shadow-premium max-w-sm w-full transition-all duration-300">
          <CheckCircle size={18} className="text-green-600 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Form Card Container */}
      <div className="bg-white border border-border-custom shadow-premium rounded-custom-lg p-6 sm:p-8 relative overflow-hidden">
        {/* Top saffron outline bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

        {/* Card Header & Avatar section */}
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          {/* Default Avatar Design: Premium Saffron Circle with Lotus */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-white border-4 border-secondary shadow-md relative group overflow-hidden">
            <img src="/assets/avatars/avatar_male.png" alt="Devotee Avatar" className="w-full h-full object-cover rounded-full" />
            <div className="absolute -bottom-1 -right-1 bg-white border border-border-custom text-[10px] px-2 py-0.5 rounded-full shadow-sm text-text-secondary font-semibold">
              Devotee
            </div>
          </div>

          <div>
            <h2 className="font-display font-semibold text-text-primary text-xl sm:text-2xl">
              {t.completeProfileTitle || "Complete Your Profile"}
            </h2>
            <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
              {t.completeProfileSubtitle || "Please provide your details to access the devotee portal"}
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Full Name Input Group */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="full-name" className="text-xs text-text-secondary font-bold uppercase tracking-wider">
              {t.fullNameLabel || "Full Name"} <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <input
                id="full-name"
                type="text"
                required
                placeholder={t.fullNamePlaceholder || "Enter your full name"}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-3 rounded-custom-md bg-bg-custom border border-border-custom focus:border-primary/50 focus:outline-none text-sm transition-all text-text-primary font-medium focus:ring-1 focus:ring-primary/20"
                autoFocus
              />
              <User size={16} className="text-text-secondary/60 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Phone Number Input Group */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone-number" className="text-xs text-text-secondary font-bold uppercase tracking-wider">
              {lang === "en" ? "Phone Number" : "मोबाइल नंबर"} <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-semibold select-none">
                +91
              </span>
              <input
                id="phone-number"
                type="tel"
                required
                maxLength={10}
                placeholder={lang === "en" ? "Enter 10-digit number" : "१० अंकों का नंबर दर्ज करें"}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                disabled={isSubmitting}
                className="w-full pl-12 pr-4 py-3 rounded-custom-md bg-bg-custom border border-border-custom focus:border-primary/50 focus:outline-none text-sm transition-all text-text-primary font-medium focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* City Input Group */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="city" className="text-xs text-text-secondary font-bold uppercase tracking-wider">
              {t.cityLabel || "City"} <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <input
                id="city"
                type="text"
                required
                placeholder={t.cityPlaceholder || "Enter your city"}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-3 rounded-custom-md bg-bg-custom border border-border-custom focus:border-primary/50 focus:outline-none text-sm transition-all text-text-primary font-medium focus:ring-1 focus:ring-primary/20"
              />
              <MapPin size={16} className="text-text-secondary/60 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Localized Form Error Banner */}
          {errorMsg && (
            <div className="flex items-start gap-2 p-3.5 rounded bg-red-50 text-red-600 border border-red-500/10 text-xs transition-all">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-custom-md bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider shadow-premium hover:shadow-premium-hover transition-all mt-2 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t.savingProfile || "Saving Profile..."}
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                {t.saveProfile || "Save & Continue"}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            )}
          </button>
        </form>

        {/* Brand Footer Info */}
        <div className="mt-8 pt-6 border-t border-border-custom text-[10px] text-text-secondary text-center leading-relaxed">
          {lang === "en" ? (
            <span>🛡️ Verification data is securely saved in the temple database.</span>
          ) : (
            <span>🛡️ सत्यापन डेटा सुरक्षित रूप से मंदिर डेटाबेस में सहेजा गया है।</span>
          )}
        </div>
      </div>
    </div>
  );
}

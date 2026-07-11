"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, 
  Lock, 
  ArrowRight, 
  MessageSquare,
  AlertCircle,
  RotateCcw
} from "lucide-react";
import { db } from "@/services/db";

export default function Login() {
  const router = useRouter();
  
  useEffect(() => {
    const user = db.getCurrentUser();
    if (user) {
      router.push(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [router]);

  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [simulatedOTP, setSimulatedOTP] = useState(null);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);
    try {
      const code = await db.sendOTP(phone);
      
      if (code && !code.startsWith("OTP Sent")) {
        setSimulatedOTP(code);
      } else {
        setSimulatedOTP("123456");
      }

      setStep("otp");
      setResendTimer(60);
    } catch (err) {
      setErrorMsg(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);
    try {
      const user = await db.verifyOTP(phone, otpCode);
      window.dispatchEvent(new Event("authChange"));
      
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setErrorMsg(err.message || "Invalid code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      const code = await db.sendOTP(phone);
      if (code && !code.startsWith("OTP Sent")) {
        setSimulatedOTP(code);
      }
      setResendTimer(60);
      setErrorMsg("");
    } catch {
      setErrorMsg("Resend failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-28 flex flex-col items-center justify-center min-h-[75vh]">
      
      <div className="w-full max-w-md bg-white border border-border-custom shadow-premium rounded-custom-lg overflow-hidden flex flex-col p-6 sm:p-8 relative">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

        {/* Brand/Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary border border-primary/20">
            <span className="text-xl">🪷</span>
          </div>
          <div>
            <h2 className="font-display font-semibold text-text-primary text-xl">Portal Sign In</h2>
            <p className="text-xs text-text-secondary mt-1">Access announcements and view donation receipts</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "phone" ? (
            
            /* STEP 1: ENTER PHONE NUMBER */
            <motion.form
              key="phone-step"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSendOTP}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="phone-number" className="text-xs text-text-secondary font-bold uppercase tracking-wider">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-semibold select-none">
                    +91
                  </span>
                  <input 
                    id="phone-number"
                    type="tel" 
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-14 pr-4 py-3 rounded-custom-md bg-bg-custom border border-border-custom focus:border-primary/50 focus:outline-none text-sm transition-all text-text-primary font-medium"
                    autoFocus
                  />
                  <Phone size={16} className="text-text-secondary/60 absolute right-4 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] text-text-secondary leading-relaxed">
                  We will send a one-time verification code (OTP). Rates may apply. <br />
                  <strong className="text-primary font-semibold">Tip:</strong> Enter any number ending in <strong className="text-primary">9000</strong> to test the Admin Panel.
                </p>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 p-3 rounded bg-red-50 text-red-600 border border-red-500/10 text-xs">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-custom-md bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider shadow-premium hover:shadow-premium-hover transition-all mt-2 cursor-pointer flex items-center justify-center gap-1.5"
              >
                Send Verification Code
                <ArrowRight size={14} />
              </motion.button>
            </motion.form>
          ) : (
            
            /* STEP 2: ENTER OTP CODE */
            <motion.form
              key="otp-step"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleVerifyOTP}
              className="flex flex-col gap-5"
            >
              {/* Back Button */}
              <button 
                type="button"
                onClick={() => { setStep("phone"); setErrorMsg(""); }}
                className="text-xs text-primary font-bold hover:underline self-start mb-2 cursor-pointer"
              >
                &larr; Back to Phone Number
              </button>

              <div className="flex flex-col gap-2">
                <label htmlFor="otp-code" className="text-xs text-text-secondary font-bold uppercase tracking-wider">
                  Verification Code (OTP)
                </label>
                <div className="relative">
                  <input 
                    id="otp-code"
                    type="text" 
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-3 rounded-custom-md bg-bg-custom border border-border-custom focus:border-primary/50 focus:outline-none text-sm tracking-widest text-center font-bold text-text-primary transition-all"
                    autoFocus
                  />
                  <Lock size={16} className="text-text-secondary/60 absolute right-4 top-1/2 -translate-y-1/2" />
                </div>
                <div className="flex justify-between items-center text-[10px] text-text-secondary mt-1">
                  <span>Sent code to +91 {phone}</span>
                  <button 
                    type="button"
                    onClick={handleResend}
                    disabled={resendTimer > 0 || isLoading}
                    className={`flex items-center gap-1 font-bold ${
                      resendTimer > 0 ? "text-text-secondary cursor-not-allowed" : "text-primary hover:underline cursor-pointer"
                    }`}
                  >
                    <RotateCcw size={10} />
                    <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}</span>
                  </button>
                </div>
              </div>

              {/* Simulated OTP Card */}
              {simulatedOTP && (
                <div className="p-4 rounded-custom-md bg-amber-50 border border-primary/20 text-xs text-accent flex flex-col gap-2 shadow-premium animate-pulse-soft">
                  <div className="flex items-center gap-1.5 font-bold text-text-primary">
                    <MessageSquare size={14} className="text-primary" />
                    <span>Simulated SMS Delivery</span>
                  </div>
                  <p className="text-[10px] text-text-secondary">
                    Your mock OTP verification code is: <strong className="text-text-primary font-mono text-sm bg-white px-2 py-0.5 rounded border border-border-custom ml-1">{simulatedOTP}</strong>
                  </p>
                  <p className="text-[9px] text-text-secondary/70 italic">
                    Type this code (or use bypass <strong className="text-text-primary font-mono font-bold">123456</strong>) to verify session.
                  </p>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-1.5 p-3 rounded bg-red-50 text-red-600 border border-red-500/10 text-xs">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-custom-md bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider shadow-premium hover:shadow-premium-hover transition-all mt-2 cursor-pointer flex items-center justify-center"
              >
                Verify & Continue
              </motion.button>

            </motion.form>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}

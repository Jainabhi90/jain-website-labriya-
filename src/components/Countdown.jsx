"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Countdown() {
  const targetDate = "2026-07-25T08:00:00+05:30"; // Chaturmas Start: July 25, 2026
  
  const [timeLeft, setTimeLeft] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "en");
      const syncLang = () => {
        setLang(localStorage.getItem("lang") || "en");
      };
      window.addEventListener("languageChange", syncLang);
      
      const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        if (difference <= 0) {
          setTimeLeft(null);
          return;
        }
        
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      
      return () => {
        window.removeEventListener("languageChange", syncLang);
        clearInterval(timer);
      };
    }
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch by rendering a clean empty placeholder layout on SSR
    return <div className="h-28" />;
  }

  if (!timeLeft) {
    return (
      <div className="flex items-center justify-center py-4 bg-emerald-50 text-emerald-700 rounded-custom-md px-6 border border-emerald-500/10">
        <span className="font-semibold text-sm">
          🪷 {lang === "en" 
            ? "Chaturmas 2026 has commenced in full purity. Jai Jinendra." 
            : "चातुर्मास २०२६ पूर्ण शुद्धता के साथ प्रारंभ हो चुका है। जय जिनेन्द्र।"}
        </span>
      </div>
    );
  }

  const labelMap = {
    Days: lang === "en" ? "Days" : "दिन",
    Hours: lang === "en" ? "Hours" : "घंटे",
    Minutes: lang === "en" ? "Minutes" : "मिनट",
    Seconds: lang === "en" ? "Seconds" : "सेकंड",
  };

  const items = [
    { label: labelMap.Days, value: timeLeft.days },
    { label: labelMap.Hours, value: timeLeft.hours },
    { label: labelMap.Minutes, value: timeLeft.minutes },
    { label: labelMap.Seconds, value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-text-secondary uppercase tracking-widest font-medium">
        {lang === "en" ? "Countdown to Chaturmas 2026" : "चातुर्मास २०२६ की उलटी गिनती"}
      </p>
      
      <div className="flex items-center gap-3 sm:gap-4">
        {items.map((item, idx) => (
          <div key={item.label} className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center justify-center bg-white border border-border-custom shadow-premium w-18 h-20 sm:w-20 sm:h-22 rounded-custom-lg relative overflow-hidden">
              {/* Saffron top border line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
              
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={item.value}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14 }}
                  className="font-display font-semibold text-2xl sm:text-3xl text-text-primary"
                >
                  {item.value.toString().padStart(2, "0")}
                </motion.span>
              </AnimatePresence>

              <span className="text-[10px] sm:text-[11px] text-text-secondary uppercase tracking-wider font-semibold mt-1">
                {item.label}
              </span>
            </div>
            
            {idx < items.length - 1 && (
              <span className="text-xl sm:text-2xl font-bold text-primary/60 animate-pulse-soft">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

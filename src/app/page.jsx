"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  Heart, 
  Megaphone, 
  ArrowRight, 
  BookOpen,
  CalendarDays
} from "lucide-react";
import Countdown from "@/components/Countdown";
import { db } from "@/services/db";
import { translations } from "@/services/translations";
import { useCMS } from "@/context/CMSContext";
import { sanitizeHTML } from "@/lib/sanitize";

// Framer Motion staggered transition variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function Home() {
  const [schedules, setSchedules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [lang, setLang] = useState("en");
  const { cms } = useCMS();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schedData = await db.getSchedules();
        const annData = await db.getAnnouncements();
        
        setSchedules(schedData || []);
        setAnnouncements(annData || []);
      } catch (err) {
        console.error("Error loading homepage data", err);
      }
    };
    
    fetchData();

    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "en");
      const syncLang = () => {
        setLang(localStorage.getItem("lang") || "en");
      };
      window.addEventListener("languageChange", syncLang);
      return () => window.removeEventListener("languageChange", syncLang);
    }
  }, []);

  const t = translations[lang] || translations["en"];

  const morningSchedules = schedules.filter(s => s.session === "morning");
  const eveningSchedules = schedules.filter(s => s.session === "evening");

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full flex flex-col items-center overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[95vh] flex flex-col items-center justify-center px-4 sm:px-6 py-12 md:py-16 lg:py-20 bg-gradient-to-b from-[#FCFBF7] via-[#FFFDF9] to-white border-b border-[#EA580C]/5 overflow-hidden">
        {/* Background Saffron/Yellow Circle Orbs representing purity */}
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            x: [0, 15, 0],
            y: [0, -15, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[600px] h-[600px] rounded-full bg-[#FFF7ED] blur-3xl -top-48 -left-48 pointer-events-none -z-10" 
        />
        <motion.div 
          animate={{ 
            scale: [1.05, 1, 1.05],
            x: [0, -20, 0],
            y: [0, 15, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[500px] h-[500px] rounded-full bg-orange-100/5 blur-3xl -bottom-36 -right-36 pointer-events-none -z-10" 
        />

        {/* Traditional Jain mandala-inspired layout lines */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[#EA580C]/3 animate-pulse-soft flex items-center justify-center -z-10 pointer-events-none">
          <div className="w-[400px] h-[400px] rounded-full border border-[#C28A3E]/3 flex items-center justify-center">
            <div className="w-[300px] h-[300px] rounded-full border border-[#EA580C]/3 flex items-center justify-center">
              <div className="w-[200px] h-[200px] rounded-full border border-[#C28A3E]/2" />
            </div>
          </div>
        </div>

        {/* Modern Split Grid Layout */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center z-10">
          
          {/* LEFT SIDE: Spiritual content, CTAs, details */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="col-span-1 lg:col-span-7 flex flex-col items-start text-left gap-5"
          >
            {/* Top Badge */}
            <motion.div 
              variants={itemVariants}
              className="px-4 py-1.5 rounded-full bg-[#FFF7ED] border border-[#C28A3E]/20 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C28A3E] flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] animate-ping" />
              <span>{lang === "en" ? "🌸 Jai Jinendra" : "🌸 जय जिनेन्द्र"}</span>
            </motion.div>

            {/* Temple Name */}
            <motion.h2 
              variants={itemVariants}
              className="font-display font-semibold text-text-secondary text-xs sm:text-sm tracking-widest uppercase leading-none"
            >
              {cms.templeName || t.shreeLabriyaMandir}
            </motion.h2>

            {/* Hero Main Title */}
            <motion.h1 
              variants={itemVariants}
              className="font-display font-bold text-text-primary text-3xl sm:text-4xl md:text-5xl lg:text-[54px] tracking-tight leading-[1.1] max-w-2xl"
            >
              {cms.heroTitle || (lang === "en" ? "Sacred Chaturmas Festival 2026" : "पावन चातुर्मास महोत्सव २०२६")}
            </motion.h1>

            {/* Hero Subtitle */}
            {cms.heroSubtitle && (
              <motion.p
                variants={itemVariants}
                className="text-[#EA580C] text-sm sm:text-base font-semibold tracking-wide uppercase leading-none"
              >
                {cms.heroSubtitle}
              </motion.p>
            )}

            {/* Description */}
            <motion.p 
              variants={itemVariants}
              className="text-[#4B5563] text-xs sm:text-sm md:text-base max-w-xl leading-relaxed"
            >
              {cms.heroDescription || t.welcomeDescription}
            </motion.p>

            {/* CTA Buttons - Side by Side on Desktop, Stacked on Mobile */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-2"
            >
              {/* Primary button */}
              <button
                onClick={() => scrollToSection("schedule")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-custom-md bg-[#EA580C] text-white font-semibold text-sm shadow-sm hover:bg-[#EA580C]/90 active:bg-[#EA580C]/95 transition-all cursor-pointer text-center select-none"
              >
                {t.viewTodaySchedule}
              </button>

              {/* Secondary button */}
              <Link href="/panchang" className="w-full sm:w-auto">
                <button className="w-full px-8 py-3.5 rounded-custom-md border border-[#C28A3E]/20 bg-white text-[#C28A3E] hover:bg-[#FFF7ED]/30 hover:border-[#C28A3E]/40 active:bg-[#FFF7ED]/50 transition-all font-semibold text-sm shadow-sm cursor-pointer text-center select-none">
                  {lang === "en" ? "View Panchang" : "पंचांग देखें"}
                </button>
              </Link>
            </motion.div>

            {/* Quick Information Cards */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 w-full mt-4"
            >
              {/* Card 1: Location */}
              {cms.templeAddress && (
                <div className="flex items-center gap-2 p-2.5 rounded-custom-sm bg-white border border-[#C28A3E]/10 shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left shrink-0">
                  <span className="text-base">📍</span>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#C28A3E] uppercase font-bold tracking-wider leading-none">
                      {lang === "en" ? "Location" : "स्थान"}
                    </span>
                    <span className="text-[11px] text-text-primary font-medium mt-0.5 max-w-[110px] truncate">
                      {cms.templeAddress.split(",")[1]?.trim() || cms.templeAddress.split(",")[0]?.trim() || "Labriya"}
                    </span>
                  </div>
                </div>
              )}

              {/* Card 2: Year */}
              {cms.chaturmasYear && (
                <div className="flex items-center gap-2 p-2.5 rounded-custom-sm bg-white border border-[#C28A3E]/10 shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left shrink-0">
                  <span className="text-base">🗓</span>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#C28A3E] uppercase font-bold tracking-wider leading-none">
                      {lang === "en" ? "Year" : "वर्ष"}
                    </span>
                    <span className="text-[11px] text-text-primary font-medium mt-0.5">
                      {cms.chaturmasYear}
                    </span>
                  </div>
                </div>
              )}

              {/* Card 3: Daily Timing */}
              {(cms.aartiTiming || cms.dailyTimings) && (
                <div className="flex items-center gap-2 p-2.5 rounded-custom-sm bg-white border border-[#C28A3E]/10 shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left shrink-0 col-span-2 sm:col-span-1">
                  <span className="text-base">🙏</span>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#C28A3E] uppercase font-bold tracking-wider leading-none">
                      {lang === "en" ? "Worship" : "दर्शन/आरती"}
                    </span>
                    <span className="text-[11px] text-text-primary font-medium mt-0.5 max-w-[130px] truncate">
                      {cms.aartiTiming || cms.dailyTimings}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Countdown timer */}
            <motion.div 
              variants={itemVariants}
              className="w-full mt-4"
            >
              <Countdown />
            </motion.div>

          </motion.div>

          {/* RIGHT SIDE: Aspect-ratio preserved image with floating overlays */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="col-span-1 lg:col-span-5 flex items-center justify-center relative w-full mt-6 lg:mt-0"
          >
            {/* Saffron soft glow background behind image */}
            <div className="absolute inset-0 bg-[#FFF7ED] rounded-2xl filter blur-xl scale-95 opacity-50 -z-10 pointer-events-none" />

            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-[480px] aspect-[16/11.5] sm:aspect-[16/11] lg:aspect-[16/12] rounded-custom-lg border border-[#C28A3E]/20 shadow-premium overflow-hidden bg-white select-none group"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent z-10" />
              <img 
                src={cms.heroBanner || "/jain_hero_spiritual.png"} 
                alt={cms.templeName || "Shree Labriya Jain Shwetambar Mandir Chaturmas 2026"} 
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]" 
              />

              {/* Floating Overlay Card A (Chaturmas Year badge) */}
              {cms.chaturmasYear && (
                <div className="bg-white/95 backdrop-blur-sm border border-[#C28A3E]/10 px-3 py-1.5 rounded-custom-sm flex items-center gap-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] absolute top-3 right-3 z-20 select-none">
                  <span className="text-[10px] text-[#C28A3E]">🕊</span>
                  <span className="text-[10px] font-semibold text-text-primary tracking-wider uppercase">
                    {lang === "en" ? "Chaturmas" : "चातुर्मास"} {cms.chaturmasYear}
                  </span>
                </div>
              )}

              {/* Floating Overlay Card B (Location badge) */}
              <div className="bg-white/95 backdrop-blur-sm border border-[#C28A3E]/10 px-3 py-1.5 rounded-custom-sm flex items-center gap-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] absolute bottom-3 left-3 z-20 select-none">
                <span className="text-[10px] text-[#C28A3E]">📍</span>
                <span className="text-[10px] font-semibold text-[#1F2937] tracking-wider">
                  {cms.templeAddress ? cms.templeAddress.split(",").slice(0, 2).join(",").trim() : (lang === "en" ? "Labriya Mandir, Dhar" : "लाबड़िया मंदिर, धार")}
                </span>
              </div>
            </motion.div>
          </motion.div>

        </div>

        {/* Scroll down animated indicator (visible on desktop) */}
        <div 
          className="hidden lg:flex flex-col items-center gap-1 absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer text-[#4B5563] hover:text-[#EA580C] transition-colors duration-150 z-10 select-none"
          onClick={() => scrollToSection("schedule")}
        >
          <span className="text-[9px] uppercase font-bold tracking-widest leading-none">
            {lang === "en" ? "Scroll to Explore" : "अन्वेषण करें"}
          </span>
          <motion.span
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-[12px] text-[#C28A3E] font-bold mt-1"
          >
            ↓
          </motion.span>
        </div>

      </section>

      {/* 2. QUICK ACCESS GRID */}
      <section className="max-w-6xl w-full px-6 py-12">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          
          {/* Featured Sadhana Tracker Banner */}
          <motion.div 
            variants={itemVariants}
            className="col-span-full group relative overflow-hidden p-6 sm:p-8 rounded-custom-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-premium transition-all duration-300 min-h-[160px] flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer"
            onClick={() => window.location.href = "/dashboard"}
          >
            {/* Ambient background decoration */}
            <div className="absolute right-0 bottom-0 translate-y-12 translate-x-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl shrink-0">
                🏆
              </div>
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl mb-1 flex items-center justify-center sm:justify-start gap-2">
                  <span>{t.sadhanaTracker}</span>
                  <span className="text-[9px] bg-white text-orange-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {t.sadhanaTrackerJoin}
                  </span>
                </h3>
                <p className="text-xs text-orange-50 leading-relaxed max-w-xl">
                  {t.sadhanaTrackerDesc}
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-custom-md shadow-md transition-colors w-full md:w-auto justify-center">
              <span>{t.goToDevoteePortal}</span>
              <ArrowRight size={14} />
            </div>
          </motion.div>
          
          {/* Schedule Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 12px 30px -4px rgba(234, 88, 12, 0.08)" }}
            onClick={() => scrollToSection("schedule")}
            className="group cursor-pointer p-6 rounded-custom-lg bg-white border border-border-custom hover:border-primary/20 shadow-premium transition-all duration-300 flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                <Clock size={20} />
              </div>
              <ArrowRight size={16} className="text-text-secondary group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-text-primary text-base mb-1">{t.todaysSchedule}</h3>
              <p className="text-xs text-text-secondary">{t.todaysScheduleDesc}</p>
            </div>
          </motion.div>

          {/* Panchang Card */}
          <motion.div variants={itemVariants}>
            <Link href="/panchang" className="group p-6 rounded-custom-lg bg-white border border-border-custom hover:border-primary/20 shadow-premium transition-all duration-300 flex flex-col justify-between min-h-[160px] block">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                  <Calendar size={20} />
                </div>
                <ArrowRight size={16} className="text-text-secondary group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base mb-1">{t.jainPanchang}</h3>
                <p className="text-xs text-text-secondary">{t.jainPanchangDesc}</p>
              </div>
            </Link>
          </motion.div>

          {/* Announcements Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 12px 30px -4px rgba(234, 88, 12, 0.08)" }}
            onClick={() => scrollToSection("announcements")}
            className="group cursor-pointer p-6 rounded-custom-lg bg-white border border-border-custom hover:border-primary/20 shadow-premium transition-all duration-300 flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                <Megaphone size={20} />
              </div>
              <ArrowRight size={16} className="text-text-secondary group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-text-primary text-base mb-1">{t.latestUpdates}</h3>
              <p className="text-xs text-text-secondary">{t.latestUpdatesDesc}</p>
            </div>
          </motion.div>

          {/* Events Card */}
          <motion.div variants={itemVariants}>
            <Link href="/events" className="group p-6 rounded-custom-lg bg-white border border-border-custom hover:border-primary/20 shadow-premium transition-all duration-300 flex flex-col justify-between min-h-[160px] block">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                  <CalendarDays size={20} />
                </div>
                <ArrowRight size={16} className="text-text-secondary group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base mb-1">{t.eventsPrograms}</h3>
                <p className="text-xs text-text-secondary">{t.eventsProgramsDesc}</p>
              </div>
            </Link>
          </motion.div>

          {/* Donate Card */}
          <motion.div variants={itemVariants}>
            <Link href="/donate" className="group p-6 rounded-custom-lg bg-white border border-border-custom hover:border-primary/20 shadow-premium transition-all duration-300 flex flex-col justify-between min-h-[160px] block">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                  <Heart size={20} />
                </div>
                <ArrowRight size={16} className="text-text-secondary group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base mb-1">{t.donationDesk}</h3>
                <p className="text-xs text-text-secondary">{t.donationDeskDesc}</p>
              </div>
            </Link>
          </motion.div>

          {/* About Card */}
          <motion.div variants={itemVariants}>
            <Link href="/about" className="group p-6 rounded-custom-lg bg-white border border-border-custom hover:border-primary/20 shadow-premium transition-all duration-300 flex flex-col justify-between min-h-[160px] block">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                  <BookOpen size={20} />
                </div>
                <ArrowRight size={16} className="text-text-secondary group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base mb-1">{t.aboutMandir}</h3>
                <p className="text-xs text-text-secondary">{t.aboutMandirDesc}</p>
              </div>
            </Link>
          </motion.div>

        </motion.div>
      </section>

      {/* 3. TODAY'S SCHEDULE SECTION */}
      <section id="schedule" className="w-full bg-secondary/10 border-y border-border-custom py-24 px-6 scroll-mt-10">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          
          <div className="text-center max-w-2xl mb-16">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">{t.dailyWorshipTimeline}</span>
            <h2 className="font-display font-semibold text-text-primary text-3xl mt-1">{t.todaysSchedule}</h2>
            <p className="text-sm text-text-secondary mt-2">{t.scheduleSubtitle}</p>
          </div>

          {schedules.length > 0 ? (
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Morning Timeline */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3 pb-3 border-b border-border-custom">
                  <span className="text-lg">☀️</span>
                  <h3 className="font-display font-semibold text-text-primary text-base uppercase tracking-wider">{t.morningSessions}</h3>
                </div>
                
                <div className="flex flex-col gap-4">
                  {morningSchedules.length > 0 ? (
                    morningSchedules.map((item, idx) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08, type: "spring", stiffness: 100 }}
                        viewport={{ once: true, margin: "-50px" }}
                        className="flex items-center gap-5 p-4 rounded-custom-md bg-white border border-border-custom shadow-premium"
                      >
                        <div className="flex flex-col items-center justify-center py-2 px-3 bg-secondary text-primary rounded-custom-sm font-semibold text-[10px] tracking-wider uppercase min-w-[90px] border border-primary/5">
                          {item.time}
                        </div>
                        <div className="text-sm font-medium text-text-primary">
                          {item.activity}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-xs text-text-secondary italic text-center py-6">{t.noMorningSchedules}</div>
                  )}
                </div>
              </div>

              {/* Evening Timeline */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3 pb-3 border-b border-border-custom">
                  <span className="text-lg">🌙</span>
                  <h3 className="font-display font-semibold text-text-primary text-base uppercase tracking-wider">{t.eveningSessions}</h3>
                </div>
                
                <div className="flex flex-col gap-4">
                  {eveningSchedules.length > 0 ? (
                    eveningSchedules.map((item, idx) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08, type: "spring", stiffness: 100 }}
                        viewport={{ once: true, margin: "-50px" }}
                        className="flex items-center gap-5 p-4 rounded-custom-md bg-white border border-border-custom shadow-premium"
                      >
                        <div className="flex flex-col items-center justify-center py-2 px-3 bg-secondary text-primary rounded-custom-sm font-semibold text-[10px] tracking-wider uppercase min-w-[90px] border border-primary/5">
                          {item.time}
                        </div>
                        <div className="text-sm font-medium text-text-primary">
                          {item.activity}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-xs text-text-secondary italic text-center py-6">{t.noEveningSchedules}</div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* Illustrated empty state banner for schedule */
            <div className="w-full max-w-2xl mx-auto p-8 sm:p-10 rounded-custom-lg bg-white border border-border-custom shadow-premium text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-primary text-3xl border border-primary/15 animate-pulse-soft">
                🪷
              </div>
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base">
                  {lang === "en" ? "Daily Timetable Syncing" : "दैनिक समय-सारणी उपलब्ध होगी"}
                </h3>
                <p className="text-xs text-text-secondary mt-2 max-w-md mx-auto leading-relaxed">
                  {t.programsWillBeUpdated}
                </p>
              </div>
              <div className="px-4 py-2 rounded-custom-sm bg-secondary text-primary border border-primary/10 text-[10px] font-bold uppercase tracking-wider mt-1">
                {lang === "en" ? "Chaturmas 2026 Season" : "चातुर्मास २०२६ सत्र"}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. ANNOUNCEMENTS SECTION */}
      <section id="announcements" className="max-w-6xl w-full px-6 py-24 scroll-mt-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary">{t.stayConnected}</span>
          <h2 className="font-display font-semibold text-text-primary text-3xl mt-1">{t.announcementsTitle}</h2>
          <p className="text-sm text-text-secondary mt-2">{t.announcementsSub}</p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {announcements.length > 0 ? (
            announcements.map((ann) => {
              const typeLabelStyles = ann.type === "program" 
                ? "bg-emerald-50 text-emerald-700 border-emerald-500/10" 
                : ann.type === "update" 
                ? "bg-blue-50 text-blue-700 border-blue-500/10" 
                : "bg-orange-50 text-primary border-primary/10";

              const typeText = lang === "en"
              ? (ann.type ?? "").toUpperCase()
                : ann.type === "program"
                ? "उत्सव कार्यक्रम"
                : ann.type === "update"
                ? "अपडेट"
                : "सूचना";

              return (
                <motion.div 
                  key={ann.id}
                  variants={itemVariants}
                  whileHover={{ y: -3, boxShadow: "0 10px 25px -4px rgba(0, 0, 0, 0.03)" }}
                  className="p-6 rounded-custom-lg bg-white border border-border-custom shadow-premium flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${typeLabelStyles}`}>
                        {typeText}
                      </span>
                      <span className="text-[10px] text-text-secondary">
                        {new Date(ann.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "hi-IN", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-text-primary text-base leading-snug">
                      {ann.title}
                    </h3>
                    <div 
                      className="text-xs text-text-secondary leading-relaxed whitespace-pre-line"
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(ann.content) }}
                    />
                  </div>
                </motion.div>
              );
            })
          ) : (
            /* Custom illustrated empty state for announcements */
            <div className="col-span-full py-16 text-center border border-dashed border-border-custom rounded-custom-lg flex flex-col items-center justify-center gap-3 bg-white p-8 shadow-premium">
              <span className="text-3xl text-primary animate-bounce-soft">📢</span>
              <h3 className="font-display font-semibold text-text-primary text-sm mt-1">
                {lang === "en" ? "Updates Pending" : "नवीनतम समाचार प्रतीक्षित"}
              </h3>
              <p className="text-xs text-text-secondary max-w-sm leading-relaxed mt-1">
                {lang === "en" 
                  ? "Daily notices, program lists, and trust announcements will be posted here. Check back soon." 
                  : "दैनिक सूचनाएं, विशेष घोषणाएं और प्रवचन कार्यक्रम यहां पोस्ट किए जाएंगे। कृपया शीघ्र जांचें।"}
              </p>
            </div>
          )}
        </motion.div>
      </section>

    </div>
  );
}

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schedData = await db.getSchedules();
        const annData = await db.getAnnouncements();
        
        setSchedules(schedData);
        setAnnouncements(annData);
      } catch (err) {
        console.error("Error loading homepage data", err);
      }
    };
    fetchData();
  }, []);

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
      <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-b from-secondary/40 via-white to-bg-custom">
        {/* Background Saffron/Yellow Circle Orbs representing purity */}
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            x: [0, 10, 0],
            y: [0, -10, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[500px] h-[500px] rounded-full bg-secondary/25 blur-3xl -top-48 -left-48 pointer-events-none -z-10" 
        />
        <motion.div 
          animate={{ 
            scale: [1.05, 1, 1.05],
            x: [0, -15, 0],
            y: [0, 10, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[450px] h-[450px] rounded-full bg-orange-100/10 blur-3xl -bottom-36 -right-36 pointer-events-none -z-10" 
        />

        {/* Traditional Jain mandala-inspired layout line */}
        <div className="absolute w-[380px] h-[380px] rounded-full border border-primary/5 animate-pulse-soft flex items-center justify-center -z-10">
          <div className="w-[300px] h-[300px] rounded-full border border-accent/5 flex items-center justify-center">
            <div className="w-[220px] h-[220px] rounded-full border border-primary/5" />
          </div>
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl flex flex-col items-center gap-6"
        >
          {/* Badge */}
          <motion.span 
            variants={itemVariants}
            className="px-4 py-1.5 rounded-full bg-secondary border border-primary/10 text-xs font-semibold uppercase tracking-widest text-primary flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            Jai Jinendra
          </motion.span>

          {/* Temple Name */}
          <motion.h2 
            variants={itemVariants}
            className="font-display font-medium text-text-secondary text-sm tracking-widest uppercase mt-1"
          >
            Shree Labriya Jain Shwetambar Mandir
          </motion.h2>

          {/* Main Title */}
          <motion.h1 
            variants={itemVariants}
            className="font-display font-semibold text-text-primary text-4xl sm:text-5xl md:text-6xl tracking-tight leading-tight max-w-3xl"
          >
            Sacred Chaturmas <br />
            <span className="text-primary font-bold">Festival 2026</span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            variants={itemVariants}
            className="text-text-secondary text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed"
          >
            Welcome the season of reflection, purification, and spiritual discourse. Connect with the daily pravachans, holy chants, and auspicious timings from wherever you are.
          </motion.p>

          {/* Main CTA */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center mt-6 w-full"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToSection("schedule")}
              className="px-10 py-4 rounded-custom-md bg-primary text-white font-bold text-sm shadow-premium hover:shadow-premium-hover hover:bg-primary/95 transition-all w-full sm:w-auto cursor-pointer"
            >
              View Today's Schedule
            </motion.button>
          </motion.div>
          
          {/* Countdown timer */}
          <motion.div 
            variants={itemVariants}
            className="mt-10 w-full"
          >
            <Countdown />
          </motion.div>
        </motion.div>
      </section>

      {/* 2. QUICK ACCESS GRID */}
      <section className="max-w-6xl w-full px-6 py-16">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          
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
              <h3 className="font-display font-semibold text-text-primary text-base mb-1">{"Today's Schedule"}</h3>
              <p className="text-xs text-text-secondary">View daily morning and evening worship timelines.</p>
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
                <h3 className="font-display font-semibold text-text-primary text-base mb-1">Jain Panchang</h3>
                <p className="text-xs text-text-secondary">Explore auspicious tithis, sunrise, sunset, and Choghadiyas.</p>
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
              <h3 className="font-display font-semibold text-text-primary text-base mb-1">Latest Updates</h3>
              <p className="text-xs text-text-secondary">Read official news, upcoming programs, and trust notices.</p>
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
                <h3 className="font-display font-semibold text-text-primary text-base mb-1">Events & Programs</h3>
                <p className="text-xs text-text-secondary">Browse upcoming festival slots and register for waitlists.</p>
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
                <h3 className="font-display font-semibold text-text-primary text-base mb-1">Donation Desk</h3>
                <p className="text-xs text-text-secondary">Support Chaturmas arrangements and temple welfare projects.</p>
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
                <h3 className="font-display font-semibold text-text-primary text-base mb-1">About Mandir</h3>
                <p className="text-xs text-text-secondary">Read historical scrolls, Guru lineage, and trust mission details.</p>
              </div>
            </Link>
          </motion.div>

        </motion.div>
      </section>

      {/* 3. TODAY'S SCHEDULE SECTION */}
      <section id="schedule" className="w-full bg-secondary/10 border-y border-border-custom py-24 px-6 scroll-mt-10">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          
          <div className="text-center max-w-2xl mb-16">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Daily Worship Timeline</span>
            <h2 className="font-display font-semibold text-text-primary text-3xl mt-1">{"Today's Schedule"}</h2>
            <p className="text-sm text-text-secondary mt-2">Daily spiritual programs, Pujas, and discourses at Shree Labriya Mandir. Updates made by the administration are reflected instantly.</p>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Morning Timeline */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-3 border-b border-border-custom">
                <span className="text-lg">☀️</span>
                <h3 className="font-display font-semibold text-text-primary text-base uppercase tracking-wider">Morning Sessions</h3>
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
                  <div className="text-xs text-text-secondary italic text-center py-6">No scheduled morning programs.</div>
                )}
              </div>
            </div>

            {/* Evening Timeline */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-3 border-b border-border-custom">
                <span className="text-lg">🌙</span>
                <h3 className="font-display font-semibold text-text-primary text-base uppercase tracking-wider">Evening Sessions</h3>
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
                  <div className="text-xs text-text-secondary italic text-center py-6">No scheduled evening programs.</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. ANNOUNCEMENTS SECTION */}
      <section id="announcements" className="max-w-6xl w-full px-6 py-24 scroll-mt-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Stay Connected</span>
          <h2 className="font-display font-semibold text-text-primary text-3xl mt-1">Announcements & Notices</h2>
          <p className="text-sm text-text-secondary mt-2">Latest updates, programs, and guidelines from the Temple Committee.</p>
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
                        {ann.type}
                      </span>
                      <span className="text-[10px] text-text-secondary">
                        {new Date(ann.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-text-primary text-base leading-snug">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center border border-dashed border-border-custom rounded-custom-lg flex flex-col items-center justify-center gap-3">
              <span className="text-2xl">📢</span>
              <p className="text-xs text-text-secondary font-semibold">No recent announcements available</p>
            </div>
          )}
        </motion.div>
      </section>

    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Home, 
  Calendar, 
  Heart, 
  Info, 
  User, 
  Sparkles,
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { translations } from "@/services/translations";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAuthenticated, logout } = useAuth();
  const [lang, setLang] = useState("en");
  
  useEffect(() => {
    // Add js-loaded class to document once React bundle is loaded and hydrated
    document.documentElement.classList.add("js-loaded");
    
    // Read initial language
    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "en");
    }

    const syncLang = () => {
      setLang(localStorage.getItem("lang") || "en");
    };

    window.addEventListener("languageChange", syncLang);
    
    return () => {
      window.removeEventListener("languageChange", syncLang);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/");
    } catch (err) {
      console.error("Navigation: Logout failed:", err.message);
    }
  };

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "hi" : "en";
    localStorage.setItem("lang", nextLang);
    setLang(nextLang);
    window.dispatchEvent(new Event("languageChange"));
  };

  const t = translations[lang] || translations["en"];

  const navLinks = [
    { label: t.home, href: "/", icon: Home },
    { label: t.events, href: "/events", icon: Sparkles },
    { label: t.panchang, href: "/panchang", icon: Calendar },
    { label: t.donate, href: "/donate", icon: Heart },
    { label: t.about, href: "/about", icon: Info },
  ];

  return (
    <>
      {/* MOBILE TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-border-custom px-4 py-3 flex items-center justify-between md:hidden bg-white/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-1.5 group">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-primary/20">
            <span className="text-primary font-display font-bold text-sm">📿</span>
          </div>
          <div>
            <h1 className="font-display font-semibold text-text-primary text-[10px] sm:text-xs tracking-wide leading-tight">
              {t.shreeLabriyaMandir}
            </h1>
            <p className="text-[7px] text-text-secondary uppercase tracking-widest font-medium">
              {lang === "en" ? "Chaturmas 2026" : "चातुर्मास २०२६"}
            </p>
          </div>
        </Link>

        {/* Language Toggle switcher */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleLanguage}
          className="px-2.5 py-1.5 rounded-custom-md border border-border-custom bg-white text-[9px] font-bold tracking-wider text-text-secondary hover:text-primary transition-all cursor-pointer flex items-center gap-1 shadow-sm"
          title="Change Language / भाषा बदलें"
        >
          <span>🌐</span>
          <span>{lang === "en" ? "हिन्दी" : "ENG"}</span>
        </motion.button>
      </header>

      {/* DESKTOP STICKY NAVIGATION */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-border-custom transition-all duration-300 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-primary font-display font-bold text-lg">📿</span>
            </div>
            <div>
              <h1 className="font-display font-semibold text-text-primary text-base tracking-wide leading-tight group-hover:text-primary transition-colors duration-300">
                {t.shreeLabriyaMandir}
              </h1>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest font-medium">
                {lang === "en" ? "Chaturmas 2026" : "चातुर्मास २०२६"}
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-custom-md text-sm font-semibold transition-colors duration-300 ${
                    isActive 
                      ? "text-primary" 
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="desktop-nav-underline"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Area */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-custom-md border border-border-custom hover:border-primary/20 bg-white text-xs font-bold tracking-wider text-text-secondary hover:text-primary transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              title="Change Language / भाषा बदलें"
            >
              <span>🌐</span>
              <span className="text-[10px]">{lang === "en" ? "हिन्दी" : "ENG"}</span>
            </motion.button>

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href={profile?.role === "admin" ? "/admin" : "/dashboard"}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-custom-md bg-secondary text-accent border border-accent/20 hover:border-accent text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer"
                  >
                    <LayoutDashboard size={14} />
                    <span>{profile?.role === "admin" ? t.admin : t.portal}</span>
                  </motion.button>
                </Link>
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-custom-md bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors duration-200 cursor-pointer"
                  title={t.logout}
                >
                  <LogOut size={16} />
                </motion.button>
              </div>
            ) : (
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 rounded-custom-md bg-primary text-white text-xs font-bold tracking-wider uppercase shadow-premium hover:shadow-premium-hover hover:bg-primary/95 transition-all cursor-pointer"
                >
                  {t.login}
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </header>
 
      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-6 left-4 right-4 z-50 glass-panel border border-border-custom/80 shadow-premium rounded-custom-lg py-3 px-4 flex items-center justify-around md:hidden">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center justify-center relative py-1"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 ${
                  isActive ? "bg-primary text-white" : "text-text-secondary"
                }`}
              >
                <Icon size={20} />
              </motion.div>
              <span className={`text-[10px] mt-1 font-medium ${
                isActive ? "text-primary font-semibold" : "text-text-secondary"
              }`}>
                {link.label}
              </span>
            </Link>
          );
        })}
 
        {/* User Portal Link / Login on Mobile */}
        <Link 
          href={isAuthenticated ? (profile?.role === "admin" ? "/admin" : "/dashboard") : "/login"}
          className="flex flex-col items-center justify-center relative py-1"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 ${
              pathname === "/login" || pathname === "/dashboard" || pathname === "/admin"
                ? "bg-primary text-white" 
                : "text-text-secondary"
            }`}
          >
            <User size={20} />
          </motion.div>
          <span className={`text-[10px] mt-1 font-medium ${
            pathname === "/login" || pathname === "/dashboard" || pathname === "/admin"
              ? "text-primary font-semibold" 
              : "text-text-secondary"
          }`}>
            {isAuthenticated ? (profile?.role === "admin" ? t.admin : t.portal) : t.login}
          </span>
        </Link>
      </nav>
    </>
  );
}

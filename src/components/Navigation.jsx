"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Home, 
  Calendar, 
  Heart, 
  Info, 
  User, 
  Sparkles,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Globe
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { translations } from "@/services/translations";
import { useCMS } from "@/context/CMSContext";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAuthenticated, logout } = useAuth();
  const { cms } = useCMS();
  const [lang, setLang] = useState("en");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrollState, setScrollState] = useState({
    isAtTop: true,
    visible: true,
  });

  const menuButtonRef = useRef(null);
  const drawerRef = useRef(null);

  // Sync initial language and handle changes
  useEffect(() => {
    document.documentElement.classList.add("js-loaded");
    
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

  // Optimized Scroll detection: hides header on scroll down, shows on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isAtTopNow = currentScrollY < 15;
      let visibleNow = scrollState.visible;

      // Hiding threshold: hide after scrolling down past 120px
      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        visibleNow = false;
      } else if (currentScrollY < lastScrollY) {
        visibleNow = true;
      }

      setScrollState({
        isAtTop: isAtTopNow,
        visible: visibleNow
      });
      lastScrollY = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollState.visible]);

  // Keyboard navigation & accessibility for mobile drawer (focus trapping + Escape key)
  useEffect(() => {
    if (!drawerOpen) return;

    const previousActiveElement = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        menuButtonRef.current?.focus();
      }

      if (e.key === "Tab") {
        if (!drawerRef.current) return;
        const focusableElements = drawerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex="0"]'
        );
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Auto-focus the close button
    const timer = setTimeout(() => {
      const closeBtn = drawerRef.current?.querySelector('[aria-label="Close menu"]');
      closeBtn?.focus();
    }, 60);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [drawerOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setDrawerOpen(false);
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

  // Navigation Links
  const navLinks = [
    { label: t.home, href: "/", icon: Home },
    { label: t.events, href: "/events", icon: Sparkles },
    { label: t.panchang, href: "/panchang", icon: Calendar },
    { label: t.donate, href: "/donate", icon: Heart },
    { label: t.about, href: "/about", icon: Info },
  ];

  // Mobile Group Layout links
  const exploreLinks = navLinks.slice(0, 3); // Home, Events, Panchang
  const templeLinks = navLinks.slice(3); // Donate, About

  // Framer Motion Drawer Animation Settings
  const drawerVariants = {
    closed: { 
      x: "100%",
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    open: { 
      x: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const overlayVariants = {
    closed: { 
      opacity: 0,
      transition: { duration: 0.25, ease: "easeInOut" }
    },
    open: { 
      opacity: 1,
      transition: { duration: 0.25, ease: "easeInOut" }
    }
  };

  return (
    <>
      {/* HEADER COMPONENT (STICKY AND ANIMATED) */}
      <header 
        className={`sticky top-0 left-0 right-0 z-50 w-full transition-all duration-250 ease-out border-b ${
          scrollState.visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        } ${
          scrollState.isAtTop
            ? "bg-[#FCFBF7]/40 backdrop-blur-sm border-transparent"
            : "bg-[#FCFBF7]/95 backdrop-blur-md border-[#EA580C]/10 shadow-[0_4px_20px_-2px_rgba(234,88,12,0.03)]"
        }`}
        style={{
          paddingTop: "calc(0.5rem + env(safe-area-inset-top))",
          paddingBottom: "0.5rem"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16 md:h-18">
          
          {/* Logo & Brand Info */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group select-none">
            <div className="w-[38px] h-[38px] sm:w-[44px] sm:h-[44px] md:w-[52px] md:h-[52px] rounded-full bg-[#FFF7ED] border border-[#EA580C]/20 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-105">
              {(cms.templeLogo || cms.portalLogo) ? (
                <img src={cms.templeLogo || cms.portalLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#EA580C] font-display font-semibold text-base sm:text-lg md:text-xl">📿</span>
              )}
            </div>
            <div className="flex flex-col justify-center max-w-[170px] xs:max-w-[210px] sm:max-w-xs md:max-w-none">
              <h1 className="font-display font-semibold text-sm sm:text-base md:text-lg text-[#1F2937] tracking-wide leading-tight transition-colors duration-300 group-hover:text-[#EA580C] break-words">
                {cms.templeName || t.shreeLabriyaMandir}
              </h1>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] text-[#C28A3E] uppercase tracking-widest font-semibold mt-0.5 leading-none">
                {cms.subtitle || (lang === "en" ? "Chaturmas 2026" : "चातुर्मास २०२६")}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm transition-colors duration-150 rounded-custom-md font-medium select-none ${
                    isActive 
                      ? "text-[#EA580C] font-semibold" 
                      : "text-[#4B5563] hover:text-[#1F2937]"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="desktop-nav-underline"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#EA580C] rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-custom-md border border-[#F3F4F6] hover:border-[#EA580C]/20 bg-white text-xs font-semibold text-[#4B5563] hover:text-[#EA580C] transition-all duration-150 shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Change Language / भाषा बदलें"
              aria-label="Change language"
            >
              <Globe size={14} className="text-[#C28A3E]" />
              <span>{lang === "en" ? "हिन्दी" : "ENG"}</span>
            </button>

            {/* Account Portal Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href={profile?.role === "admin" ? "/admin" : "/dashboard"}>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-custom-md bg-[#FFF7ED] text-[#EA580C] border border-[#EA580C]/20 hover:bg-[#EA580C] hover:text-white transition-all duration-150 text-xs font-semibold tracking-wide cursor-pointer shadow-sm">
                    <LayoutDashboard size={14} />
                    <span>{profile?.role === "admin" ? t.admin : t.portal}</span>
                  </button>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-9 h-9 rounded-custom-md bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors duration-150 cursor-pointer border border-red-100"
                  title={t.logout}
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="px-5 py-2 rounded-custom-md bg-[#EA580C] text-white text-xs font-semibold tracking-wide hover:bg-[#EA580C]/90 active:bg-[#EA580C]/95 transition-all duration-150 cursor-pointer shadow-sm">
                  {t.login}
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Right Action Elements (Language Toggle + Menu Toggle) */}
          <div className="flex md:hidden items-center gap-2">
            {/* Minimal Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="w-10 h-10 rounded-full border border-[#F3F4F6] bg-white flex items-center justify-center text-xs font-semibold text-[#4B5563] active:bg-[#FFF7ED]/50 transition-colors duration-150 cursor-pointer shadow-sm"
              title="Change Language"
              aria-label="Change language"
            >
              <span className="text-[#C28A3E] font-semibold text-[11px]">{lang === "en" ? "हिं" : "EN"}</span>
            </button>

            {/* Menu Hamburger Button */}
            <button
              ref={menuButtonRef}
              onClick={() => setDrawerOpen(true)}
              className="w-10 h-10 rounded-full border border-[#F3F4F6] bg-white flex items-center justify-center text-[#4B5563] active:bg-[#FFF7ED]/50 transition-colors duration-150 cursor-pointer shadow-sm"
              aria-expanded={drawerOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE PREMIUM DRAWER COMPONENT */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              className="fixed inset-0 bg-black/30 z-[100] backdrop-blur-sm md:hidden"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-out drawer element */}
            <motion.div
              ref={drawerRef}
              id="mobile-navigation-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation drawer"
              initial="closed"
              animate="open"
              exit="closed"
              variants={drawerVariants}
              className="fixed right-0 top-0 bottom-0 z-[101] bg-[#FCFBF7] shadow-2xl p-6 flex flex-col justify-between md:hidden border-l border-[#C28A3E]/10"
              style={{ width: "min(88vw, 380px)" }}
            >
              {/* Drawer Top Row: Title + Close button */}
              <div className="flex items-center justify-between pb-5 border-b border-[#EA580C]/10">
                <div className="flex items-center gap-2">
                  <div className="w-[32px] h-[32px] rounded-full bg-[#FFF7ED] border border-[#EA580C]/20 flex items-center justify-center overflow-hidden">
                    {(cms.templeLogo || cms.portalLogo) ? (
                      <img src={cms.templeLogo || cms.portalLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#EA580C] text-xs">📿</span>
                    )}
                  </div>
                  <span className="font-display font-semibold text-xs text-[#1F2937] tracking-wider uppercase">
                    {t.shreeLabriyaMandir.split(" ")[0] || "Labriya"}
                  </span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center text-[#4B5563] cursor-pointer transition-colors duration-150"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Grouped Links Body */}
              <div className="flex-1 py-6 overflow-y-auto space-y-6">
                
                {/* EXPLORE GROUP */}
                <div className="space-y-2">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#C28A3E]">
                    {lang === "en" ? "Explore" : "खोजें"}
                  </h3>
                  <div className="grid gap-1">
                    {exploreLinks.map((link) => {
                      const isActive = pathname === link.href;
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setDrawerOpen(false)}
                          className={`flex items-center gap-3 py-3 px-3 rounded-custom-md text-sm font-medium transition-all duration-150 ${
                            isActive 
                              ? "bg-[#FFF7ED] text-[#EA580C] border-l-2 border-[#EA580C]" 
                              : "text-[#4B5563] hover:bg-[#FFF7ED]/30 hover:text-[#1F2937] border-l-2 border-transparent"
                          }`}
                          style={{ minHeight: "48px" }}
                        >
                          <Icon size={16} className={isActive ? "text-[#EA580C]" : "text-[#C28A3E]"} />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* TEMPLE GROUP */}
                <div className="space-y-2">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#C28A3E]">
                    {lang === "en" ? "Temple" : "मंदिर"}
                  </h3>
                  <div className="grid gap-1">
                    {templeLinks.map((link) => {
                      const isActive = pathname === link.href;
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setDrawerOpen(false)}
                          className={`flex items-center gap-3 py-3 px-3 rounded-custom-md text-sm font-medium transition-all duration-150 ${
                            isActive 
                              ? "bg-[#FFF7ED] text-[#EA580C] border-l-2 border-[#EA580C]" 
                              : "text-[#4B5563] hover:bg-[#FFF7ED]/30 hover:text-[#1F2937] border-l-2 border-transparent"
                          }`}
                          style={{ minHeight: "48px" }}
                        >
                          <Icon size={16} className={isActive ? "text-[#EA580C]" : "text-[#C28A3E]"} />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* ACCOUNT GROUP */}
                <div className="space-y-2 pt-2 border-t border-[#EA580C]/10">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#C28A3E]">
                    {lang === "en" ? "Account" : "खाता"}
                  </h3>
                  <div className="grid gap-1">
                    {isAuthenticated ? (
                      <>
                        <Link
                          href={profile?.role === "admin" ? "/admin" : "/dashboard"}
                          onClick={() => setDrawerOpen(false)}
                          className={`flex items-center gap-3 py-3 px-3 rounded-custom-md text-sm font-medium transition-all duration-150 ${
                            pathname === "/admin" || pathname === "/dashboard"
                              ? "bg-[#FFF7ED] text-[#EA580C] border-l-2 border-[#EA580C]"
                              : "text-[#4B5563] hover:bg-[#FFF7ED]/30 hover:text-[#1F2937] border-l-2 border-transparent"
                          }`}
                          style={{ minHeight: "48px" }}
                        >
                          <LayoutDashboard size={16} className="text-[#C28A3E]" />
                          <span>{profile?.role === "admin" ? t.admin : t.portal}</span>
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 py-3 px-3 rounded-custom-md text-sm font-medium text-red-600 hover:bg-red-50/50 transition-colors duration-150 border-l-2 border-transparent w-full text-left cursor-pointer"
                          style={{ minHeight: "48px" }}
                        >
                          <LogOut size={16} />
                          <span>{t.logout}</span>
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-3 py-3 px-3 rounded-custom-md text-sm font-medium transition-all duration-150 ${
                          pathname === "/login"
                            ? "bg-[#FFF7ED] text-[#EA580C] border-l-2 border-[#EA580C]"
                            : "text-[#4B5563] hover:bg-[#FFF7ED]/30 hover:text-[#1F2937] border-l-2 border-transparent"
                        }`}
                        style={{ minHeight: "48px" }}
                      >
                        <User size={16} className="text-[#C28A3E]" />
                        <span>{t.login}</span>
                      </Link>
                    )}
                  </div>
                </div>

              </div>

              {/* Drawer Footer Quote */}
              <div 
                className="pt-4 border-t border-[#EA580C]/10 text-center select-none"
                style={{
                  paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))"
                }}
              >
                <p className="font-display font-semibold text-sm sm:text-base text-[#EA580C] tracking-wide">
                  अहिंसा परमो धर्मः
                </p>
                <p className="text-[9px] sm:text-[10px] text-[#C28A3E] font-medium tracking-wider uppercase mt-1">
                  Non-violence is the supreme path of dharma
                </p>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

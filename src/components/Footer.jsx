"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  ChevronUp,
  Globe,
  Calendar,
  Heart,
  User,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { translations } from "@/services/translations";
import { useCMS } from "@/context/CMSContext";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [lang, setLang] = useState("en");
  const { cms } = useCMS();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copiedText, setCopiedText] = useState(null);

  // Monitor scroll for Scroll-to-Top visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 320) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const t = translations[lang] || translations["en"];

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyContact = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const localDict = {
    en: {
      ctaTitle: "Join us in this sacred Chaturmas journey.",
      ctaSub: "Participate in daily Pujas, hear divine discourses, and contribute Seva to cultivate inner peace.",
      registerBtn: "Register Devotee",
      donateBtn: "Seva Donation",
      eventsBtn: "Upcoming Events",
      templeLinks: "Temple Links",
      philosophyStrip: ["Ahimsa Parmo Dharma", "Live and Let Live", "Parasparopagraho Jivanam"],
      needHelp: "Need Help?",
      volunteerDesk: "Volunteer Desk",
      copySuccess: "Copied!",
      emergencyContact: "Emergency Temple Contact",
      lastUpdated: "Last Updated: July 2026",
      version: "Version 1.4.2"
    },
    hi: {
      ctaTitle: "इस पावन चातुर्मास यात्रा में हमारे सहभागी बनें।",
      ctaSub: "दैनिक पूजा-आरती में सम्मिलित हों, दिव्य प्रवचन श्रवण करें और आत्म-कल्याण हेतु अपना सहयोग प्रदान करें।",
      registerBtn: "भक्त पंजीकरण",
      donateBtn: "सेवा दान करें",
      eventsBtn: "आगामी कार्यक्रम",
      templeLinks: "मंदिर कड़ियाँ",
      philosophyStrip: ["अहिंसा परमो धर्मः", "जियो और जीने दो", "परस्परोपग्रहो जीवानाम्"],
      needHelp: "सहायता चाहिए?",
      volunteerDesk: "स्वयंसेवक डेस्क",
      copySuccess: "कॉपी किया गया!",
      emergencyContact: "आपातकालीन संपर्क",
      lastUpdated: "अंतिम संशोधन: जुलाई २०२६",
      version: "संस्करण १.४.२"
    }
  };

  const l = localDict[lang] || localDict["en"];

  return (
    <footer className="w-full bg-[#FCFBF7] border-t border-[#EA580C]/10 transition-all duration-300 pt-0 pb-24 md:pb-12 mt-auto relative" role="contentinfo">

      {/* 1. TOP FOOTER SACRED CTA BLOCK */}
      <section className="w-full bg-[#FFF7ED] border-b border-[#EA580C]/5 py-10 sm:py-12 select-none relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#EA580C_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-4 relative z-10">
          <span className="text-xl">🪷</span>
          <h3 className="font-display font-bold text-text-primary text-xl sm:text-2xl md:text-3xl max-w-xl leading-tight">
            {l.ctaTitle}
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary max-w-lg leading-relaxed">
            {l.ctaSub}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2 w-full max-w-md">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <button className="w-full px-5 py-2.5 rounded-custom-md bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                <User size={14} />
                <span>{l.registerBtn}</span>
              </button>
            </Link>
            <Link href="/events" className="w-full sm:w-auto">
              <button className="w-full px-5 py-2.5 rounded-custom-md border border-[#C28A3E]/20 bg-white text-[#C28A3E] hover:bg-[#FFF7ED]/30 hover:border-[#C28A3E]/40 transition-colors font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer flex items-center justify-center gap-1.5">
                <Calendar size={14} />
                <span>{l.eventsBtn}</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. MAIN 4-COLUMN FOOTER GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 text-left">

        {/* COLUMN 1: TEMPLE IDENTITY (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#C28A3E]/20 overflow-hidden shrink-0 shadow-sm select-none">
              {(cms.templeLogo || cms.footerLogo) ? (
                <img src={cms.templeLogo || cms.footerLogo} alt="Temple Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">📿</span>
              )}
            </div>
            <div>
              <h4 className="font-display font-bold text-text-primary text-base sm:text-lg">
                {cms.templeName || t.shreeLabriyaMandir}
              </h4>
              <p className="text-[10px] text-[#C28A3E] uppercase tracking-widest font-bold mt-0.5">
                {cms.subtitle || (lang === "en" ? "Shwetambar Mandir Trust" : "श्वेतांबर मंडल ट्रस्ट")}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-sm">
            {cms.footerDescription || (lang === "en"
              ? "Experience peace and divine vibes at Shree Labriya Jain Mandir during the Chaturmas 2026 festival. We welcome all devotees to participate."
              : "चातुर्मास २०२६ महोत्सव के पावन अवसर पर श्री लाबरिया जैन मंदिर में अपूर्व शांति और आत्मिक आनंद का अनुभव करें। सभी भक्तों का स्वागत है।")}
          </p>

          {/* Sanskrit verse tag */}
          <div className="flex items-center gap-2 text-[#EA580C] select-none">
            <span className="text-sm">🪷</span>
            <span className="text-xs font-semibold italic">"परस्परोपग्रहो जीवानाम्"</span>
          </div>
        </div>

        {/* COLUMN 2: QUICK NAVIGATION (lg:col-span-2) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h4 className="font-display font-bold text-[#C28A3E] text-xs uppercase tracking-wider select-none">
            {l.templeLinks}
          </h4>
          <nav className="flex flex-col gap-2.5 text-xs sm:text-sm text-[#4B5563] font-medium" aria-label="Footer Navigation">
            <Link href="/" className="hover:text-[#EA580C] hover:translate-x-0.5 transition-all w-fit">
              {lang === "en" ? "Home" : "मुख्य पृष्ठ"}
            </Link>
            <Link href="/events" className="hover:text-[#EA580C] hover:translate-x-0.5 transition-all w-fit">
              {lang === "en" ? "Events" : "कार्यक्रम"}
            </Link>
            <Link href="/panchang" className="hover:text-[#EA580C] hover:translate-x-0.5 transition-all w-fit">
              {lang === "en" ? "Panchang" : "पंचांग"}
            </Link>
            {/* Donation & About links removed — re-enable when needed */}
            <Link href="/dashboard" className="hover:text-[#EA580C] hover:translate-x-0.5 transition-all w-fit">
              {lang === "en" ? "Devotee Portal" : "भक्त पोर्टल"}
            </Link>
          </nav>
        </div>

        {/* COLUMN 3: CONTACT INFORMATION (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h4 className="font-display font-bold text-[#C28A3E] text-xs uppercase tracking-wider select-none">
            {lang === "en" ? "Contact Office" : "कार्यालय संपर्क"}
          </h4>

          <div className="flex flex-col gap-3 text-xs sm:text-sm text-[#4B5563]">
            <div className="flex items-start gap-2.5">
              <MapPin className="text-[#EA580C] w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>
                {cms.templeAddress || (lang === "en"
                  ? "Mandir Marg, Labriya, Dhar District, MP - 454111, India"
                  : "मंदिर मार्ग, लाबरिया, जिला धार, मध्य प्रदेश - 454111")}
              </span>
            </div>

            {(cms.contactNumber || cms.alternatePhone) && (
              <div className="flex items-center gap-2.5 justify-between">
                <div className="flex items-center gap-2.5">
                  <Phone className="text-[#EA580C] w-4 h-4 shrink-0" />
                  <a href={`tel:${cms.contactNumber || cms.alternatePhone}`} className="hover:text-[#EA580C] transition-colors truncate max-w-[150px] sm:max-w-none">
                    {cms.contactNumber || cms.alternatePhone}
                  </a>
                </div>
                <button
                  onClick={() => copyContact(cms.contactNumber || cms.alternatePhone, "phone")}
                  className="p-1 rounded hover:bg-[#FFF7ED] text-[#6B7280] hover:text-[#EA580C] border border-[#C28A3E]/10 bg-white"
                  title="Copy Phone"
                >
                  {copiedText === "phone" ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                </button>
              </div>
            )}

            {cms.email && (
              <div className="flex items-center gap-2.5 justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail className="text-[#EA580C] w-4 h-4 shrink-0" />
                  <a href={`mailto:${cms.email}`} className="hover:text-[#EA580C] transition-colors truncate max-w-[150px] sm:max-w-none">
                    {cms.email}
                  </a>
                </div>
                <button
                  onClick={() => copyContact(cms.email, "email")}
                  className="p-1 rounded hover:bg-[#FFF7ED] text-[#6B7280] hover:text-[#EA580C] border border-[#C28A3E]/10 bg-white"
                  title="Copy Email"
                >
                  {copiedText === "email" ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                </button>
              </div>
            )}

            <div className="flex items-start gap-2.5 text-[11px] text-text-secondary mt-1 bg-[#FCFBF7] p-2 rounded border border-[#C28A3E]/10">
              <span className="font-semibold">{lang === "en" ? "Hours:" : "समय:"}</span>
              <span>{cms.officeTiming || "09:00 AM - 06:00 PM"}</span>
            </div>
          </div>
        </div>

        {/* COLUMN 4: LOCATION MAP PREVIEW (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h4 className="font-display font-bold text-[#C28A3E] text-xs uppercase tracking-wider select-none">
            {lang === "en" ? "Location Map" : "स्थान मानचित्र"}
          </h4>

          <div className="w-full h-36 sm:h-40 rounded-custom-md overflow-hidden border border-[#EA580C]/10 shadow-sm relative select-none">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3676.3149837891706!2d75.0264296!3d22.8648199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3963d9cd288034cb%3A0xf0e955f6fa9e0fa4!2z4KS24KWN4KSw4KWAIOCksOCkvuCknOClh-CkguCkpuCljeCksOCkuOClgeCksOClgCDgpJzgpY3gpJ7gpL7gpKgg4KSu4KSo4KWN4KSm4KS_4KSwICwg4KSy4KS-4KSs4KSw4KS_4KSv4KS-!5e0!3m2!1sen!2sin!4v1785143380203!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              aria-label="Google Maps Location of Shree Labriya Jain Mandir"
            />
          </div>

          <a
            href="https://maps.app.goo.gl/aDJnaFps36MkkGm86"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#EA580C] hover:text-[#EA580C]/85 font-semibold w-fit select-none"
          >
            <span>{lang === "en" ? "Open Google Maps" : "गूगल मैप्स खोलें"}</span>
            <ExternalLink size={12} />
          </a>
        </div>

      </section>

      {/* 3. SACRED PHILOSOPHY BANNER STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 select-none">
        <div className="py-5 border-y border-[#C28A3E]/20 flex flex-col sm:flex-row items-center justify-around gap-4 text-center">
          {l.philosophyStrip.map((phrase, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && <span className="hidden sm:inline text-[#C28A3E]/50">•</span>}
              <span className="font-display font-bold text-xs uppercase tracking-widest text-[#EA580C]">
                {phrase}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HELP WIDGET SUPPORT BAR */}
      {cms.whatsapp && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 select-none">
          <div className="p-4 rounded-custom-lg bg-white border border-[#EA580C]/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <MessageSquare size={16} />
              </div>
              <div>
                <h5 className="font-bold text-xs text-text-primary">{l.needHelp}</h5>
                <p className="text-[10px] text-text-secondary mt-0.5">{lang === "en" ? "Connect directly with our WhatsApp coordination cell." : "हमारे व्हाट्सएप स्वयंसेवक समन्वय सेल से सीधे जुड़ें।"}</p>
              </div>
            </div>

            <a
              href={cms.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <button className="w-full px-5 py-2.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                <MessageSquare size={14} />
                <span>{l.volunteerDesk}</span>
              </button>
            </a>
          </div>
        </section>
      )}

      {/* 5. SOCIAL MEDIA LINKS ROW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 flex justify-center gap-4 select-none">
        {cms.facebook && (
          <a href={cms.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook Link" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#4B5563] hover:text-[#EA580C] border border-[#EA580C]/5 hover:border-[#EA580C]/20 transition-colors shadow-sm">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" /></svg>
          </a>
        )}
        {cms.instagram && (
          <a href={cms.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram Link" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#4B5563] hover:text-[#EA580C] border border-[#EA580C]/5 hover:border-[#EA580C]/20 transition-colors shadow-sm">
            <svg className="w-4 h-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" /></svg>
          </a>
        )}
        {cms.youtube && (
          <a href={cms.youtube} target="_blank" rel="noopener noreferrer" aria-label="Youtube Link" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#4B5563] hover:text-[#EA580C] border border-[#EA580C]/5 hover:border-[#EA580C]/20 transition-colors shadow-sm">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.108C19.528 3.545 12 3.545 12 3.545s-7.528 0-9.388.51a3.004 3.004 0 00-2.11 2.108C0 8.022 0 12 0 12s0 3.978.502 5.837a3.004 3.004 0 002.11 2.108c1.86.51 9.388.51 9.388.51s7.528 0 9.388-.51a3.003 3.003 0 002.11-2.108C24 15.978 24 12 24 12s0-3.978-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
          </a>
        )}
        {cms.telegram && (
          <a href={cms.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram Link" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#4B5563] hover:text-[#EA580C] border border-[#EA580C]/5 hover:border-[#EA580C]/20 transition-colors shadow-sm">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.02-.75 4 1.74 6.67 2.88 8 3.45 3.81 1.63 4.6 1.91 5.12 1.92.11 0 .37-.03.54-.17.14-.12.18-.28.2-.44.02-.17.02-.85-.02-1.53z" /></svg>
          </a>
        )}
      </section>

      {/* 6. MINIMALIST BOTTOM COPYRIGHT STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 pt-6 border-t border-[#EA580C]/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] sm:text-xs text-text-secondary select-none">
        <p>
          {cms.copyrightText || `© ${currentYear} ${lang === "en" ? "Shree Labriya Jain Shwetambar Mandir Trust. All Rights Reserved." : "श्री लाबरिया जैन श्वेतांबर मंदिर ट्रस्ट। सर्वाधिकार सुरक्षित।"}`}
        </p>

        <div className="flex items-center gap-4 text-[10px]">
          <span>{l.version}</span>
          <span className="hidden sm:inline">•</span>
          <span>{l.lastUpdated}</span>
        </div>

        <p className="flex items-center gap-1.5">
          {cms.designedByText || (lang === "en" ? "Designed with peace and simplicity. 🪷 Jai Jinendra." : "शांति और सादगी के साथ निर्मित। 🪷 जय जिनेन्द्र।")}
        </p>
      </section>

      {/* 7. SCROLL-TO-TOP FLOATING TRIGGER BUTTON */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleScrollToTop}
            aria-label="Scroll to Top"
            className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40 p-3 rounded-full bg-[#EA580C] hover:bg-[#EA580C]/90 text-white shadow-premium hover:shadow-premium-hover transition-all cursor-pointer flex items-center justify-center border border-white/10"
          >
            <ChevronUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {cms.customFooterHtml && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 text-xs" dangerouslySetInnerHTML={{ __html: cms.customFooterHtml }} />
      )}
    </footer>
  );
}

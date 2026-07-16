"use client";

import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { translations } from "@/services/translations";
import { useCMS } from "@/context/CMSContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [lang, setLang] = useState("en");
  const { cms } = useCMS();

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

  return (
    <footer className="w-full bg-secondary border-t border-border-custom transition-all duration-300 pt-16 pb-28 md:pb-16 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Contact Info & Address */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-primary/20 overflow-hidden shrink-0">
              {cms.footerLogo ? (
                <img src={cms.footerLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">📿</span>
              )}
            </div>
            <div>
              <h3 className="font-display font-semibold text-text-primary text-lg">
                {cms.templeName || t.shreeLabriyaMandir}
              </h3>
              <p className="text-xs text-text-secondary uppercase tracking-widest font-medium">
                {cms.subtitle || (lang === "en" ? "Shwetambar Mandap Trust" : "श्वेतांबर मंडल ट्रस्ट")}
              </p>
            </div>
          </div>
          
          <p className="text-sm text-text-secondary leading-relaxed max-w-sm">
            {cms.footerDescription || (lang === "en" 
              ? "Experience peace and divine vibes at Shree Labriya Jain Mandir during the Chaturmas 2026 festival. We welcome all devotees." 
              : "चातुर्मास २०२६ महोत्सव के पावन अवसर पर श्री लाबरिया जैन मंदिर में अपूर्व शांति और आत्मिक आनंद का अनुभव करें। सभी भक्तों का स्वागत है।")}
          </p>
 
          <div className="flex flex-col gap-3 text-sm text-text-secondary">
            <div className="flex items-start gap-3">
              <MapPin className="text-primary w-5 h-5 shrink-0 mt-0.5" />
              <span>
                {cms.templeAddress || (lang === "en" 
                  ? "Mandir Marg, Labriya, Dhar District, Madhya Pradesh - 454111, India" 
                  : "मंदिर मार्ग, लाबरिया, जिला धार, मध्य प्रदेश - 454111, भारत")}
              </span>
            </div>
            
            {(cms.contactNumber || cms.alternatePhone) && (
              <div className="flex items-center gap-3">
                <Phone className="text-primary w-5 h-5 shrink-0" />
                <a href={`tel:${cms.contactNumber || cms.alternatePhone}`} className="hover:text-primary transition-colors">
                  {cms.contactNumber} {cms.alternatePhone ? `/ ${cms.alternatePhone}` : ""}
                </a>
              </div>
            )}
 
            {cms.email && (
              <div className="flex items-center gap-3">
                <Mail className="text-primary w-5 h-5 shrink-0" />
                <a href={`mailto:${cms.email}`} className="hover:text-primary transition-colors">
                  {cms.email}
                </a>
              </div>
            )}
          </div>
        </div>
 
        {/* Quick Links & WhatsApp Help */}
        <div className="flex flex-col gap-6">
          <h4 className="font-display font-semibold text-text-primary text-base">
            {lang === "en" ? "Quick Connect & Socials" : "त्वरित संपर्क एवं सोशल मीडिया"}
          </h4>
          
          <p className="text-sm text-text-secondary leading-relaxed">
            {cms.quickContactText || (lang === "en" 
              ? "Have questions regarding Chaturmas schedule, accommodation, or donations? Contact our volunteer desk directly via WhatsApp." 
              : "चातुर्मास कार्यक्रम, आवास या दान सहयोग के संबंध में कोई प्रश्न है? व्हाट्सएप के माध्यम से हमारे स्वयंसेवक डेस्क से सीधे संपर्क करें।")}
          </p>
 
          {cms.whatsapp && (
            <a 
              href={cms.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2.5 px-5 py-3 rounded-custom-md bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-premium hover:shadow-premium-hover transition-all w-fit cursor-pointer"
              >
                <MessageSquare size={18} />
                <span>{lang === "en" ? "Chat on WhatsApp" : "व्हाट्सएप पर चैट करें"}</span>
              </motion.button>
            </a>
          )}
 
          <div className="flex items-center gap-4 mt-2">
            {cms.facebook && (
              <a href={cms.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook Link" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-text-secondary hover:text-primary border border-border-custom transition-all shadow-premium">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
              </a>
            )}
            {cms.instagram && (
              <a href={cms.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram Link" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-text-secondary hover:text-primary border border-border-custom transition-all shadow-premium">
                <svg className="w-4.5 h-4.5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01"/></svg>
              </a>
            )}
            {cms.youtube && (
              <a href={cms.youtube} target="_blank" rel="noopener noreferrer" aria-label="Youtube Link" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-text-secondary hover:text-primary border border-border-custom transition-all shadow-premium">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.108C19.528 3.545 12 3.545 12 3.545s-7.528 0-9.388.51a3.004 3.004 0 00-2.11 2.108C0 8.022 0 12 0 12s0 3.978.502 5.837a3.004 3.004 0 002.11 2.108c1.86.51 9.388.51 9.388.51s7.528 0 9.388-.51a3.003 3.003 0 002.11-2.108C24 15.978 24 12 24 12s0-3.978-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            )}
            {cms.telegram && (
              <a href={cms.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram Link" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-text-secondary hover:text-primary border border-border-custom transition-all shadow-premium">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.02-.75 4 1.74 6.67 2.88 8 3.45 3.81 1.63 4.6 1.91 5.12 1.92.11 0 .37-.03.54-.17.14-.12.18-.28.2-.44.02-.17.02-.85-.02-1.53z"/></svg>
              </a>
            )}
          </div>
        </div>
 
        {/* Map Location */}
        <div className="flex flex-col gap-4">
          <h4 className="font-display font-semibold text-text-primary text-base">
            {lang === "en" ? "Location Map" : "स्थान मानचित्र"}
          </h4>
          <div className="w-full h-64 rounded-custom-md overflow-hidden border border-border-custom shadow-premium relative">
            <iframe 
              src={cms.googleMapsEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14748.868779954045!2d75.05051918349503!3d22.458428589255866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396263595679930f%3A0xe54e60bf76d0590c!2sLabriya%2C%20Madhya%20Pradesh%20454111!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              aria-label="Google Maps Location of Shree Labriya Jain Mandir"
            />
          </div>
        </div>
 
      </div>
 
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-border-custom flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
        <p>
          {cms.copyrightText || `© ${currentYear} ${lang === "en" ? "Shree Labriya Jain Shwetambar Mandir Trust. All Rights Reserved." : "श्री लाबरिया जैन श्वेतांबर मंदिर ट्रस्ट। सर्वाधिकार सुरक्षित।"}`}
        </p>
        <p className="flex items-center gap-1">
          {cms.designedByText || (lang === "en" ? "Designed with peace and simplicity. 🪷 Jai Jinendra." : "शांति और सादगी के साथ निर्मित। 🪷 जय जिनेन्द्र।")}
        </p>
      </div>
 
      {cms.customFooterHtml && (
        <div className="max-w-7xl mx-auto px-6 mt-4" dangerouslySetInnerHTML={{ __html: cms.customFooterHtml }} />
      )}
    </footer>
  );
}

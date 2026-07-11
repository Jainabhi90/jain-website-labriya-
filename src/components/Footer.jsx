"use client";

import React from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-secondary border-t border-border-custom transition-all duration-300 pt-16 pb-28 md:pb-16 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Contact Info & Address */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📿</span>
            <div>
              <h3 className="font-display font-semibold text-text-primary text-lg">
                Shree Labriya Jain Mandir
              </h3>
              <p className="text-xs text-text-secondary uppercase tracking-widest font-medium">
                Shwetambar Mandap Trust
              </p>
            </div>
          </div>
          
          <p className="text-sm text-text-secondary leading-relaxed max-w-sm">
            Experience peace and divine vibes at Shree Labriya Jain Mandir during the Chaturmas 2026 festival. We welcome all devotees.
          </p>

          <div className="flex flex-col gap-3 text-sm text-text-secondary">
            <div className="flex items-start gap-3">
              <MapPin className="text-primary w-5 h-5 shrink-0 mt-0.5" />
              <span>
                Shree Labriya Jain Shwetambar Mandir, <br />
                Mandir Marg, Labriya, Dhar District, <br />
                Madhya Pradesh - 454111, India
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="text-primary w-5 h-5 shrink-0" />
              <a href="tel:+919876543210" className="hover:text-primary transition-colors">
                +91 98765 43210
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="text-primary w-5 h-5 shrink-0" />
              <a href="mailto:info@labriyajainmandir.org" className="hover:text-primary transition-colors">
                info@labriyajainmandir.org
              </a>
            </div>
          </div>
        </div>

        {/* Quick Links & WhatsApp Help */}
        <div className="flex flex-col gap-6">
          <h4 className="font-display font-semibold text-text-primary text-base">
            Quick Connect & Socials
          </h4>
          
          <p className="text-sm text-text-secondary leading-relaxed">
            Have questions regarding Chaturmas schedule, accommodation, or donations? Contact our volunteer desk directly via WhatsApp.
          </p>

          <a 
            href="https://wa.me/919876543210?text=Jai%20Jinendra%2C%20I%20would%20like%20to%20know%20about%20Chaturmas%20schedules."
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2.5 px-5 py-3 rounded-custom-md bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-premium hover:shadow-premium-hover transition-all w-fit cursor-pointer"
            >
              <MessageSquare size={18} />
              <span>Chat on WhatsApp</span>
            </motion.button>
          </a>

          <div className="flex items-center gap-4 mt-2">
            <a href="#" aria-label="Facebook Link" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-text-secondary hover:text-primary border border-border-custom transition-all shadow-premium">
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
            </a>
            <a href="#" aria-label="Instagram Link" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-text-secondary hover:text-primary border border-border-custom transition-all shadow-premium">
              <svg className="w-4.5 h-4.5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01"/></svg>
            </a>
            <a href="#" aria-label="Youtube Link" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-text-secondary hover:text-primary border border-border-custom transition-all shadow-premium">
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.108C19.528 3.545 12 3.545 12 3.545s-7.528 0-9.388.51a3.004 3.004 0 00-2.11 2.108C0 8.022 0 12 0 12s0 3.978.502 5.837a3.004 3.004 0 002.11 2.108c1.86.51 9.388.51 9.388.51s7.528 0 9.388-.51a3.003 3.003 0 002.11-2.108C24 15.978 24 12 24 12s0-3.978-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

        {/* Map Location */}
        <div className="flex flex-col gap-4">
          <h4 className="font-display font-semibold text-text-primary text-base">
            Location Map
          </h4>
          <div className="w-full h-44 rounded-custom-md overflow-hidden border border-border-custom shadow-premium relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14748.868779954045!2d75.05051918349503!3d22.458428589255866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396263595679930f%3A0xe54e60bf76d0590c!2sLabriya%2C%20Madhya%20Pradesh%20454111!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
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
          &copy; {currentYear} Shree Labriya Jain Shwetambar Mandir Trust. All Rights Reserved.
        </p>
        <p className="flex items-center gap-1">
          Designed with peace and simplicity. 🪷 Jai Jinendra.
        </p>
      </div>
    </footer>
  );
}

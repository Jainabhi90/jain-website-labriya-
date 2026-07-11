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
import { db } from "@/services/db";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in
    const currentUser = db.getCurrentUser();
    setUser(currentUser);
    
    // Listen for custom storage events to keep auth state sync'd
    const syncAuth = () => {
      setUser(db.getCurrentUser());
    };
    window.addEventListener("storage", syncAuth);
    window.addEventListener("authChange", syncAuth);
    
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("authChange", syncAuth);
    };
  }, [pathname]);

  const handleLogout = () => {
    db.logout();
    setUser(null);
    window.dispatchEvent(new Event("authChange"));
    router.push("/");
  };

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Events", href: "/events", icon: Sparkles },
    { label: "Panchang", href: "/panchang", icon: Calendar },
    { label: "Donate", href: "/donate", icon: Heart },
    { label: "About", href: "/about", icon: Info },
  ];

  return (
    <>
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
                Shree Labriya Mandir
              </h1>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest font-medium">
                Chaturmas 2026
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
            {/* Auth Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-custom-md bg-secondary text-accent border border-accent/20 hover:border-accent text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer"
                  >
                    <LayoutDashboard size={14} />
                    <span>{user.role === "admin" ? "Admin" : "Portal"}</span>
                  </motion.button>
                </Link>
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-custom-md bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors duration-200 cursor-pointer"
                  title="Logout"
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
                  Login
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
          href={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login"}
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
            {user ? (user.role === "admin" ? "Admin" : "Portal") : "Login"}
          </span>
        </Link>
      </nav>
    </>
  );
}

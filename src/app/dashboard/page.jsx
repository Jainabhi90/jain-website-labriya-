"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  User, 
  Heart, 
  Calendar as CalendarIcon, 
  LogOut, 
  Download,
  AlertCircle,
  FileCheck,
  Megaphone
} from "lucide-react";
import { db } from "@/services/db";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = db.getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      try {
        const donationsList = await db.getDonations();
        const userDonations = donationsList.filter(d => d.phone === currentUser.phone);
        setDonations(userDonations);

        const announcementsList = await db.getAnnouncements();
        setAnnouncements(announcementsList.slice(0, 3));

        const eventsList = await db.getEvents();
        setEvents(eventsList.slice(0, 2));
      } catch (err) {
        console.error("Dashboard data load error", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    db.logout();
    window.dispatchEvent(new Event("authChange"));
    router.push("/");
  };

  const triggerPrintReceipt = (donation) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Donation Receipt - Shree Labriya Mandir Trust</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #1F2937; padding: 40px; line-height: 1.6; }
            .receipt-box { max-width: 700px; margin: 0 auto; border: 1px solid #ECECEC; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
            .header { text-align: center; border-bottom: 2px solid #EA580C; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { font-size: 24px; margin: 0; color: #C28A3E; }
            .header p { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0; color: #6B7280; }
            .title { text-align: center; font-size: 18px; font-weight: bold; text-decoration: underline; margin-bottom: 30px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
            .detail-item { font-size: 14px; }
            .detail-item strong { display: block; color: #6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
            .amount-word { font-size: 15px; font-weight: 600; background-color: #FFF7ED; padding: 15px; border-radius: 6px; border: 1px solid #FFE3C3; margin-bottom: 40px; }
            .footer-notes { font-size: 11px; color: #6B7280; border-top: 1px solid #ECECEC; padding-top: 20px; text-align: center; }
            .signatures { display: flex; justify-content: space-between; margin-top: 50px; margin-bottom: 30px; }
            .sig-line { width: 180px; border-top: 1px solid #6B7280; text-align: center; font-size: 12px; padding-top: 5px; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
              .receipt-box { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="max-width: 700px; margin: 0 auto 20px auto; text-align: right;">
            <button onclick="window.print()" style="background:#EA580C; color:white; border:none; padding:10px 20px; font-weight:bold; border-radius:6px; cursor:pointer;">Print Receipt</button>
          </div>
          <div class="receipt-box">
            <div class="header">
              <h1>SHREE LABRIYA JAIN SHWETAMBAR MANDIR TRUST</h1>
              <p>Mandir Marg, Labriya, Dhar, Madhya Pradesh - 454111</p>
            </div>
            
            <div class="title">DONATION RECEIPT VOUCHER</div>

            <div class="details-grid">
              <div class="detail-item">
                <strong>Receipt Number</strong>
                #LAB-REC-${donation.id.toUpperCase()}
              </div>
              <div class="detail-item">
                <strong>Date & Time</strong>
                ${new Date(donation.createdAt).toLocaleString()}
              </div>
              <div class="detail-item">
                <strong>Donor Name</strong>
                ${donation.donorName}
              </div>
              <div class="detail-item">
                <strong>Contact Number</strong>
                +91 ${donation.phone}
              </div>
              <div class="detail-item">
                <strong>Transaction ID</strong>
                ${donation.txnId}
              </div>
              <div class="detail-item">
                <strong>Donation Status</strong>
                ${donation.verified ? "Verified & Cleared" : "Pending Verification"}
              </div>
            </div>

            <div class="amount-word">
              <strong style="display:block; font-size:11px; text-transform:uppercase; color:#EA580C; margin-bottom:5px;">Amount Donated</strong>
              INR ${donation.amount.toLocaleString("en-IN")}.00
            </div>

            <div class="signatures">
              <div class="sig-line">Donor Signature</div>
              <div class="sig-line" style="color: #EA580C; font-weight: bold;">
                <span style="font-family: 'Brush Script MT', cursive; font-size: 20px; display: block; height: 24px; margin-top: -15px;">Trust Office</span>
                Authorized Signatory
              </div>
            </div>

            <div class="footer-notes">
              Thank you for your generous contribution towards the Chaturmas 2026 arrangements. <br />
              This is a computer-generated voucher and does not require a physical stamp. <br />
              All contributions are exempt under Section 80G of the Income Tax Act.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading || !user) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-text-secondary">Retrieving devotee profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
      
      {/* Upper Dashboard Banner */}
      <div className="w-full bg-white border border-border-custom shadow-premium p-6 sm:p-8 rounded-custom-lg mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-full bg-primary/5 -skew-x-12 pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-primary border border-primary/20 shrink-0">
            <User size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Jai Jinendra</span>
            <h1 className="font-display font-semibold text-text-primary text-xl sm:text-2xl mt-0.5">
              {user.fullName}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">Registered Number: +91 {user.phone}</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-custom-md bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </motion.button>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Donations & Receipts History */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="p-6 rounded-custom-lg bg-white border border-border-custom shadow-premium">
            
            <div className="flex items-center gap-3 pb-4 border-b border-border-custom mb-6">
              <Heart size={18} className="text-primary" />
              <h2 className="font-display font-semibold text-text-primary text-base">Your Donation History</h2>
            </div>

            {donations.length > 0 ? (
              <div className="flex flex-col gap-4">
                {donations.map((donation) => (
                  <div 
                    key={donation.id} 
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-custom-md bg-bg-custom border border-border-custom gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileCheck size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-text-primary">
                            INR {donation.amount.toLocaleString("en-IN")}.00
                          </span>
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            donation.verified 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-500/10" 
                              : "bg-amber-50 text-amber-700 border-amber-500/10"
                          }`}>
                            {donation.verified ? "Verified" : "Pending"}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-secondary mt-1">Txn ID: {donation.txnId} &bull; {new Date(donation.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => triggerPrintReceipt(donation)}
                      className="px-4 py-2 rounded-custom-md bg-white border border-border-custom hover:border-primary/50 text-accent text-xs font-bold uppercase tracking-wider shadow flex items-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <Download size={14} />
                      <span>Receipt</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border-custom rounded-custom-md flex flex-col items-center justify-center gap-3">
                <AlertCircle size={24} className="text-text-secondary" />
                <div>
                  <p className="text-sm text-text-primary font-semibold">No donations registered under +91 {user.phone}</p>
                  <p className="text-xs text-text-secondary max-w-sm mt-1">If you have made a transfer via QR/UPI, please report it in the Donation desk to link the receipt here.</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Updates & Events */}
        <div className="flex flex-col gap-6">
          
          {/* Recent Announcements Panel */}
          <div className="p-6 rounded-custom-lg bg-white border border-border-custom shadow-premium flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border-custom text-text-primary">
              <Megaphone size={16} className="text-primary" />
              <h3 className="font-display font-semibold text-sm">Recent Notices</h3>
            </div>
            
            <div className="flex flex-col gap-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="flex flex-col gap-1 border-l-2 border-primary/20 pl-3">
                  <span className="text-[9px] text-text-secondary">{new Date(ann.createdAt).toLocaleDateString()}</span>
                  <h4 className="text-xs font-semibold text-text-primary leading-tight">{ann.title}</h4>
                  <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Registered Events */}
          <div className="p-6 rounded-custom-lg bg-white border border-border-custom shadow-premium flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border-custom text-text-primary">
              <CalendarIcon size={16} className="text-primary" />
              <h3 className="font-display font-semibold text-sm">Your Registered Events</h3>
            </div>
            
            <div className="flex flex-col gap-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-bg-custom border border-border-custom rounded-custom-md">
                  <span className="text-lg mt-0.5">🗓️</span>
                  <div>
                    <h4 className="text-xs font-semibold text-text-primary">{event.title}</h4>
                    <p className="text-[10px] text-text-secondary mt-1">{event.location}</p>
                    <p className="text-[9px] text-primary font-bold uppercase tracking-wider mt-0.5">
                      {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

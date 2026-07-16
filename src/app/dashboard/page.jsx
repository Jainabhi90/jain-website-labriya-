"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Heart,
  Calendar as CalendarIcon,
  LogOut,
  Download,
  AlertCircle,
  FileCheck,
  Megaphone,
  Flame,
  Award,
  History,
  CheckSquare,
  Sparkles,
  BookOpen,
  ArrowRight,
  Compass,
  Trophy,
  Save,
  UserCheck,
  UserPlus
} from "lucide-react";
import { db } from "@/services/db";
import { useAuth } from "@/context/AuthContext";
import { profileService } from "@/services/profileService";

const BADGES_DEFINITIONS = {
  "badge_first_upvas": { name: "First Upvas", desc: "Completed your first complete day fast", icon: "🌸" },
  "badge_10_upvas": { name: "10 Upvas", desc: "Completed 10 days of fasting", icon: "🙏" },
  "badge_30_pravachans": { name: "30 Pravachans", desc: "Attended 30 holy pravachan discourses", icon: "📖" },
  "badge_100_temple": { name: "100 Temple Visits", desc: "Visited the temple 100 times", icon: "🪔" },
  "badge_30_streak": { name: "30 Day Streak", desc: "Maintained a 30-day continuous sadhana", icon: "🔥" },
  "badge_100_points": { name: "100 Points Milestone", desc: "Earned 100 total Sadhana points", icon: "🏅" },
  "badge_500_points": { name: "500 Points Milestone", desc: "Earned 500 total Sadhana points", icon: "🌼" },
  "badge_1000_points": { name: "1000 Points Milestone", desc: "Earned 1000 total Sadhana points", icon: "✨" }
};

const MOTIVATIONAL_QUOTES = [
  "A soul can attain liberation only by getting rid of its karmas through self-control and austerity. - Lord Mahavira",
  "Fasting cleanses not just the physical body, but burns away negative mental impressions. - Jain Scripture",
  "One moment of sincere meditation (Samayik) can destroy karmas accumulated over lifetimes. - Acharya Bhadrabahu",
  "Non-violence and kindness to all living beings is the greatest form of volunteer service.",
  "Swadhyay is the third eye of a spiritual seeker. It illuminates the inner truth.",
  "Consistency in small daily vows builds a mountain of spiritual strength.",
  "True victory is victory over oneself. Conquer your passions through mindfulness."
];

export default function Dashboard() {
  const router = useRouter();
  const { user, profile, profilesList, loading, logout, refreshProfile } = useAuth();

  // Dashboard Tabs: 'sadhana', 'badges', 'history', 'leaderboard', 'donations', 'profile'
  const [activeTab, setActiveTab] = useState("sadhana");
  const [isLoading, setIsLoading] = useState(true);

  // Devotee Sadhana States
  const [activities, setActivities] = useState([]);
  const [logs, setLogs] = useState([]);
  const [checkedActivities, setCheckedActivities] = useState([]);
  const [checkInDate, setCheckInDate] = useState("2026-07-11"); // defaults to July 11, 2026
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(false);
  const [quote, setQuote] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Devotee Donation History
  const [donations, setDonations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);

  // Profile Edit fields
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  // Setup quote once on mount
  useEffect(() => {
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setQuote(randomQuote);
  }, []);

  // Sync profile details into editing form fields
  useEffect(() => {
    if (profile) {
      setEditName(profile.fullName || profile.full_name || "");
      setEditCity(profile.city || "Labriya");
      setEditAvatar(profile.avatar || profile.avatar_url || "");
    }
  }, [profile]);

  // Auth and general data loading mount effect
  useEffect(() => {
    if (loading) return;
    if (!user || !profile) {
      router.push("/login");
      return;
    }

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Initialize local profile fallback properties (leaderboard compatibility)
        await db.getDevoteeProfile(profile.id);

        // Load Sadhana Activities
        const acts = await db.getSadhanaActivities();
        setActivities(acts);

        // Load Devotee Sadhana Logs
        const sadhanaLogs = await db.getSadhanaLogs(profile.id);
        setLogs(sadhanaLogs);

        // Precheck activities if user has already checked in for today
        const todaysLog = sadhanaLogs.find(l => l.dateStr === "2026-07-11");
        if (todaysLog) {
          setCheckedActivities(todaysLog.activities);
        }

        // Leaderboard check
        const lbEnabled = await db.isLeaderboardEnabled();
        setLeaderboardEnabled(lbEnabled);
        if (lbEnabled) {
          const lbData = await db.getLeaderboard();
          setLeaderboard(lbData);
        }

        // Load Donations Receipts
        const donationsList = await db.getDonations();
        const userPhone = profile.mobile || profile.phone || user.phone || "";
        const cleanPhone = userPhone.replace("+91", "");
        const userDonations = donationsList.filter(d =>
          d.phone === cleanPhone ||
          d.phone === userPhone ||
          (d.profileId && d.profileId === profile.id)
        );
        setDonations(userDonations);

        // Load Announcements/Noticeboards
        const announcementsList = await db.getAnnouncements();
        setAnnouncements(announcementsList.slice(0, 3));

        // Load events
        const eventsList = await db.getEvents();
        setEvents(eventsList.slice(0, 2));
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user, profile, loading, router]);

  // Load check-in checkboxes for a specific selected date
  useEffect(() => {
    if (logs.length > 0) {
      const selectedLog = logs.find(l => l.dateStr === checkInDate);
      if (selectedLog) {
        setCheckedActivities(selectedLog.activities);
      } else {
        setCheckedActivities([]);
      }
    }
  }, [checkInDate, logs]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Dashboard logout failed:", err.message);
    }
  };

  const handleToggleActivity = (id) => {
    setCheckedActivities(prev =>
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  const handleSaveSadhana = async () => {
    if (!profile) return;
    try {
      const result = await db.submitDailySadhana(profile.id, checkInDate, checkedActivities);

      // Keep points and streaks synced in the Supabase database profiles table
      await profileService.updateProfile(profile.id, {
        totalPoints: result.profile.totalPoints,
        streak: result.profile.streak
      });

      // Refresh AuthContext profile details
      await refreshProfile(profile.id);

      // Reload logs
      const updatedLogs = await db.getSadhanaLogs(profile.id);
      setLogs(updatedLogs);

      // Reload leaderboard if active
      if (leaderboardEnabled) {
        const lbData = await db.getLeaderboard();
        setLeaderboard(lbData);
      }

      // Calculate points earned
      let pointsCalculated = 0;
      checkedActivities.forEach(id => {
        const act = activities.find(a => a.id === id);
        if (act) pointsCalculated += act.points;
      });

      setStatusMessage(`✨ Logs saved! You earned ${pointsCalculated} Sadhana Points for ${checkInDate}.`);
      setTimeout(() => setStatusMessage(""), 5000);
    } catch (err) {
      console.error(err);
      setStatusMessage("❌ Failed to save activities.");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profile) return;
    try {
      // 1. Update in local storage fallback database for leaderboard compatibility
      await db.updateDevoteeProfile(profile.id, {
        fullName: editName,
        city: editCity,
        avatar: editAvatar
      });

      // 2. Persist profile edits ONLY through Supabase
      await profileService.updateProfile(profile.id, {
        fullName: editName,
        city: editCity,
        avatar: editAvatar
      });

      // 3. Refresh context profile details
      await refreshProfile(profile.id);

      setStatusMessage("🌸 Profile details updated successfully.");
      setTimeout(() => setStatusMessage(""), 4000);
    } catch (err) {
      console.error(err);
      setStatusMessage("❌ Failed to update profile details.");
    }
  };

  // Calculates today's points in real-time
  const getTodayPointsPreview = () => {
    let pts = 0;
    checkedActivities.forEach(id => {
      const act = activities.find(a => a.id === id);
      if (act) pts += act.points;
    });
    return pts;
  };

  // Helper for analytic summaries
  const getMonthlySummary = () => {
    if (logs.length === 0) return { count: 0, points: 0, mostPerformed: "None" };

    let totalPoints = 0;
    const actCount = {};

    logs.forEach(log => {
      totalPoints += log.points;
      log.activities.forEach(id => {
        actCount[id] = (actCount[id] || 0) + 1;
      });
    });

    let maxCount = 0;
    let mostPerformedId = "None";
    for (const [id, count] of Object.entries(actCount)) {
      if (count > maxCount) {
        maxCount = count;
        mostPerformedId = id;
      }
    }

    const mostPerformedAct = activities.find(a => a.id === mostPerformedId);

    return {
      count: logs.length,
      points: totalPoints,
      mostPerformed: mostPerformedAct ? mostPerformedAct.name : "None"
    };
  };

  const monthlySummary = getMonthlySummary();

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

  if (isLoading || !user || !profile) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-text-secondary">Retrieving devotee profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">

      {/* Devotee Header Profile Banner */}
      <div className="w-full bg-white border border-border-custom shadow-premium p-6 sm:p-8 rounded-custom-lg mb-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-full bg-secondary/30 -skew-x-12 pointer-events-none" />

        {/* Profile Info */}
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto text-center sm:text-left">
          <img
            src={profile.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"}
            alt="Profile Avatar"
            className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 bg-secondary"
          />
          <div>
            <span className="text-[9px] uppercase tracking-widest font-bold text-primary px-2.5 py-0.5 rounded bg-secondary border border-primary/10">Jai Jinendra</span>
            <h1 className="font-display font-semibold text-text-primary text-xl sm:text-2xl mt-1.5 leading-tight">
              {profile.fullName}
            </h1>
            <p className="text-xs text-text-secondary mt-1 font-medium">
              📍 {profile.city} &bull; +91 {profile.phone}
            </p>
          </div>
        </div>

        {/* Sadhana Points & Streak Counters */}
        <div className="flex flex-wrap items-center justify-center gap-6 shrink-0 w-full md:w-auto border-t md:border-t-0 border-neutral-100 pt-4 md:pt-0">

          <div className="flex items-center gap-3 bg-secondary/50 px-4 py-3 rounded-custom-md border border-primary/10">
            <span className="text-xl">🪷</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Total Sadhana</span>
              <span className="text-sm font-bold text-primary">{profile.totalPoints || 0} Points</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-orange-50 px-4 py-3 rounded-custom-md border border-primary/10">
            <Flame size={20} className="text-primary animate-pulse-soft" />
            <div className="flex flex-col">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Practice Streak</span>
              <span className="text-sm font-bold text-primary">{profile.streak || 0} Days</span>
            </div>
          </div>

          {profilesList.length === 1 ? (
            <button
              onClick={() => router.push("/profile-select")}
              className="px-4 py-2.5 rounded-custom-md bg-white text-text-secondary hover:text-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 border border-neutral-200"
            >
              <UserPlus size={14} />
              <span>Add Family Member</span>
            </button>
          ) : (
            <button
              onClick={() => router.push("/profile-select")}
              className="px-4 py-2.5 rounded-custom-md bg-white text-text-secondary hover:text-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 border border-neutral-200"
            >
              <User size={14} />
              <span>Switch Profile</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-custom-md bg-neutral-100 text-text-secondary hover:bg-red-50 hover:text-red-600 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 border border-neutral-200"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>

        </div>
      </div>

      {/* Message Notifications Banner */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full p-4 mb-6 rounded-custom-md bg-secondary text-primary border border-primary/15 text-xs font-semibold flex items-center justify-between shadow-premium"
          >
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage("")} className="text-primary hover:text-primary/75 text-xs uppercase font-bold shrink-0">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Side: Navigation Tabs Sidebar */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-thin">
          {[
            { id: "sadhana", label: "Daily Check-In", icon: CheckSquare },
            { id: "badges", label: "Earned Badges", icon: Award },
            { id: "history", label: "History & Summary", icon: History },
            ...(leaderboardEnabled ? [{ id: "leaderboard", label: "Inspiring Leaderboard", icon: Trophy }] : []),
            { id: "donations", label: "Tax Receipts (80G)", icon: Heart },
            { id: "profile", label: "Edit Profile", icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-custom-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap lg:w-full text-left ${isTabActive
                    ? "bg-primary text-white shadow-premium"
                    : "bg-white border border-border-custom text-text-secondary hover:text-text-primary hover:border-primary/20"
                  }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Motivational Quote in sidebar (desktop only) */}
          <div className="hidden lg:flex flex-col gap-3 p-5 rounded-custom-md bg-secondary/35 border border-primary/10 mt-4">
            <span className="text-xs">📚</span>
            <p className="text-[10px] text-text-secondary italic leading-relaxed">
              "{quote}"
            </p>
          </div>
        </div>

        {/* Right Side: Tab workspace */}
        <div className="lg:col-span-9 bg-white border border-border-custom shadow-premium p-6 sm:p-8 rounded-custom-lg min-h-[500px]">

          {/* TAB 1: DAILY CHECK-IN */}
          {activeTab === "sadhana" && (
            <div className="flex flex-col gap-6">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border-custom">
                <div>
                  <h3 className="font-display font-semibold text-text-primary text-base">Daily Sadhana Check-In</h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Submit vows & self-improvement routines</p>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="check-in-date" className="text-[10px] uppercase font-bold text-text-secondary">Target Date:</label>
                  <input
                    id="check-in-date"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded bg-bg-custom border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium"
                  />
                </div>
              </div>

              {/* Point Calculator Preview */}
              <div className="p-4 rounded bg-secondary/50 border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <h4 className="text-xs font-bold text-primary">Sadhana Check-in Preview</h4>
                  <p className="text-[10px] text-text-secondary">Checking completed routines updates streak counts and unlocks digital badges.</p>
                </div>
                <div className="flex items-center gap-1 bg-white border border-primary/15 px-3 py-1.5 rounded font-bold text-xs text-primary shrink-0">
                  <span>Earn Today:</span>
                  <span className="text-sm font-extrabold">{getTodayPointsPreview()} Points</span>
                </div>
              </div>

              {/* Checkboxes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {activities.map((act) => {
                  const isChecked = checkedActivities.includes(act.id);
                  return (
                    <div
                      key={act.id}
                      onClick={() => handleToggleActivity(act.id)}
                      className={`p-3.5 border rounded-custom-md flex items-center justify-between cursor-pointer transition-all ${isChecked
                          ? "bg-secondary/40 border-primary shadow-premium"
                          : "bg-white border-border-custom hover:border-primary/10"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => { }} // handled by div click
                          className="w-4 h-4 rounded text-primary border-border-custom focus:ring-primary cursor-pointer shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-primary">{act.name}</span>
                          <span className="text-[9px] text-text-secondary mt-0.5">{act.category}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-primary bg-white border border-primary/10 px-2 py-0.5 rounded">
                        +{act.points} pts
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-border-custom mt-2">
                <button
                  onClick={handleSaveSadhana}
                  className="px-6 py-2.5 rounded bg-primary text-white text-xs font-bold uppercase tracking-wider shadow hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                >
                  <Save size={14} />
                  <span>Submit Sadhana Logs</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: EARNED BADGES */}
          {activeTab === "badges" && (
            <div className="flex flex-col gap-6">

              <div>
                <h3 className="font-display font-semibold text-text-primary text-base">Devotional Achievements</h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Spiritual milestone badges</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-2">
                {Object.entries(BADGES_DEFINITIONS).map(([badgeId, val]) => {
                  const isUnlocked = profile.badges?.includes(badgeId);
                  return (
                    <div
                      key={badgeId}
                      className={`p-5 rounded-custom-lg border text-center flex flex-col items-center justify-center gap-3 transition-all ${isUnlocked
                          ? "bg-white border-primary shadow-premium ring-2 ring-primary/5"
                          : "bg-neutral-50/50 border-neutral-100 opacity-40 select-none"
                        }`}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm ${isUnlocked ? "bg-secondary text-primary" : "bg-neutral-200"
                        }`}>
                        {val.icon}
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${isUnlocked ? "text-text-primary" : "text-text-secondary"}`}>{val.name}</h4>
                        <p className="text-[9px] text-text-secondary mt-1 leading-normal max-w-xs">{val.desc}</p>
                      </div>

                      {isUnlocked ? (
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-primary bg-secondary px-2 py-0.5 rounded border border-primary/10">Unlocked</span>
                      ) : (
                        <span className="text-[8px] uppercase tracking-wider font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">Locked</span>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 3: HISTORY & SUMMARY LOGS */}
          {activeTab === "history" && (
            <div className="flex flex-col gap-6">

              <div>
                <h3 className="font-display font-semibold text-text-primary text-base">Spiritual Logs & Metrics</h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Summary analyses of monthly routines</p>
              </div>

              {/* Monthly Analytics Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                <div className="p-4 rounded-custom-md bg-secondary/35 border border-primary/10 flex items-center gap-3">
                  <span className="text-xl">📅</span>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Days Active</span>
                    <span className="text-sm font-bold text-primary">{monthlySummary.count} Days</span>
                  </div>
                </div>

                <div className="p-4 rounded-custom-md bg-secondary/35 border border-primary/10 flex items-center gap-3">
                  <span className="text-xl">🔥</span>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Most Active Duty</span>
                    <span className="text-sm font-bold text-primary truncate max-w-[120px]" title={monthlySummary.mostPerformed}>
                      {monthlySummary.mostPerformed}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-custom-md bg-secondary/35 border border-primary/10 flex items-center gap-3">
                  <span className="text-xl">🏅</span>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Monthly Points</span>
                    <span className="text-sm font-bold text-primary">{monthlySummary.points} Points</span>
                  </div>
                </div>

              </div>

              {/* History Table */}
              <div className="w-full mt-4 overflow-hidden border border-border-custom rounded-custom-lg bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-bg-custom border-b border-border-custom text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                        <th className="p-4">Date</th>
                        <th className="p-4">Activities Completed</th>
                        <th className="p-4 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length > 0 ? (
                        logs.map((log) => (
                          <tr key={log.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                            <td className="p-4 font-semibold text-text-primary">{log.dateStr}</td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1.5">
                                {log.activities.map((actId) => {
                                  const name = activities.find(a => a.id === actId)?.name || actId;
                                  return (
                                    <span key={actId} className="px-2 py-0.5 rounded bg-neutral-100 text-text-secondary text-[9px] font-medium border border-neutral-200">
                                      {name}
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="p-4 text-right font-extrabold text-primary">+{log.points} pts</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-text-secondary italic">
                            No logs submitted yet. Check in to record your activities.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: LEADERBOARD */}
          {activeTab === "leaderboard" && leaderboardEnabled && (
            <div className="flex flex-col gap-6">

              <div className="pb-3 border-b border-border-custom">
                <h3 className="font-display font-semibold text-text-primary text-base">Participant Inspiration</h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Top 10 devotees consistency board</p>
              </div>

              {/* Inspiring Leaderboard description */}
              <div className="p-4 rounded-custom-md bg-secondary/30 border border-primary/10 text-xs text-text-secondary leading-relaxed flex items-start gap-2.5">
                <Compass size={16} className="text-primary shrink-0 mt-0.5" />
                <span>
                  This board serves to inspire consistency and devotion. We encourage devotees to maintain their daily vows. Top participants represent consistency in their daily check-ins.
                </span>
              </div>

              {/* Top 10 Participants List */}
              <div className="flex flex-col gap-3 mt-2">
                {leaderboard.map((item, index) => {
                  const isCurrentUser = item.id === profile.id;
                  let medal = "";
                  if (index === 0) medal = "🥇";
                  else if (index === 1) medal = "🥈";
                  else if (index === 2) medal = "🥉";

                  return (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-custom-md flex items-center justify-between gap-4 transition-all ${isCurrentUser
                          ? "bg-secondary/40 border-primary ring-1 ring-primary/10"
                          : "bg-white border-border-custom"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-bold text-xs text-text-secondary shrink-0">
                          {medal || `${index + 1}`}
                        </span>

                        <img
                          src={item.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"}
                          alt={item.fullName}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-neutral-100"
                        />

                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                            {item.fullName}
                            {isCurrentUser && (
                              <span className="text-[8px] uppercase tracking-wider font-bold bg-primary text-white px-1.5 py-0.2 rounded">You</span>
                            )}
                          </span>
                          <span className="text-[9px] text-text-secondary mt-0.5">{item.city} &bull; 🔥 {item.streak || 0} Day Streak</span>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-primary bg-secondary px-3 py-1 rounded-full border border-primary/5 shrink-0">
                        {item.totalPoints} Points
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 5: TAX RECEIPTS */}
          {activeTab === "donations" && (
            <div className="flex flex-col gap-6">

              <div className="flex items-center gap-3 pb-4 border-b border-border-custom">
                <Heart size={18} className="text-primary" />
                <div>
                  <h2 className="font-display font-semibold text-text-primary text-base">Your Donation Tax Receipts</h2>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Download 80G tax certificates</p>
                </div>
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
                            <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${donation.verified
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
                        <span>Print 80G Receipt</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-border-custom rounded-custom-md flex flex-col items-center justify-center gap-3">
                  <AlertCircle size={24} className="text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-primary font-semibold">No donations registered under {profile.phone || profile.mobile || user.phone || ""}</p>
                    <p className="text-xs text-text-secondary max-w-sm mt-1">If you have made a transfer via QR/UPI, please report it in the Donation desk to link the receipt here.</p>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 6: EDIT PROFILE */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-6">

              <div className="pb-3 border-b border-border-custom">
                <h3 className="font-display font-semibold text-text-primary text-base">Edit Devotee Profile</h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Personalize your sadhana identity</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-5 rounded-custom-lg bg-bg-custom border border-border-custom flex flex-col gap-4 max-w-xl">

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-secondary uppercase font-bold">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-secondary uppercase font-bold">City / Residence</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    required
                    className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium"
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="text-[10px] text-text-secondary uppercase font-bold">Avatar Image Preset URL</label>
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com..."
                    className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium"
                  />

                  <div className="flex items-center gap-3.5 mt-1 bg-white p-3 rounded border border-border-custom">
                    <span className="text-[9px] uppercase font-bold text-text-secondary shrink-0">Quick presets:</span>
                    <div className="flex gap-2">
                      {[
                        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150",
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150",
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150"
                      ].map((presetUrl, idx) => (
                        <img
                          key={idx}
                          src={presetUrl}
                          alt="Preset Avatar"
                          onClick={() => setEditAvatar(presetUrl)}
                          className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition-all ${editAvatar === presetUrl ? "border-primary scale-110 shadow-premium" : "border-transparent hover:border-primary/40"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded bg-primary text-white text-xs font-bold uppercase tracking-wider shadow hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 w-fit cursor-pointer ml-auto mt-2"
                >
                  <Save size={14} />
                  <span>Update Profile</span>
                </button>

              </form>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Heart,
  LogOut,
  Download,
  FileCheck,
  Flame,
  Award,
  History,
  CheckSquare,
  Compass,
  Trophy,
  Save,
  UserCheck,
  UserPlus,
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  X,
  TrendingUp,
  Bell,
  Megaphone
} from "lucide-react";
import { db } from "@/services/db";
import { useAuth } from "@/context/AuthContext";
import { profileService } from "@/services/profileService";
import { sanitizeHTML } from "@/lib/sanitize";

// ─── Constants ────────────────────────────────────────────────────────────────
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

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonCard({ className = "" }) {
  return <div className={`animate-pulse rounded-custom-md bg-neutral-100 ${className}`} />;
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 1000, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) { setCount(0); return; }
    let current = 0;
    const steps = 40;
    const increment = target / steps;
    const interval = duration / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count.toLocaleString("en-IN")}{suffix}</span>;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === "Approved") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-500/20">
        <CheckCircle2 size={10} /> Approved
      </span>
    );
  }
  if (status === "Rejected") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-500/20">
        <XCircle size={10} /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-500/20">
      <Clock size={10} /> Pending Approval
    </span>
  );
}

// ─── Success Modal ────────────────────────────────────────────────────────────
function SuccessModal({ isOpen, onClose, pointsEarned, totalPoints, streak, date }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-orange-400 to-amber-500 rounded-t-2xl" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 15 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg"
            >
              <CheckCircle2 size={40} className="text-white" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="font-display font-bold text-text-primary text-xl mb-1">Jai Jinendra! 🙏</h3>
              <p className="text-xs text-text-secondary mb-6">Your Sadhana has been recorded for {date}</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-custom-md bg-secondary/40 border border-primary/10">
                  <div className="text-xl font-extrabold text-primary">+{pointsEarned}</div>
                  <div className="text-[9px] uppercase tracking-wider text-text-secondary font-bold mt-0.5">Points Earned</div>
                </div>
                <div className="p-3 rounded-custom-md bg-orange-50 border border-orange-200/50">
                  <div className="text-xl font-extrabold text-orange-600">{totalPoints}</div>
                  <div className="text-[9px] uppercase tracking-wider text-text-secondary font-bold mt-0.5">Total Points</div>
                </div>
                <div className="p-3 rounded-custom-md bg-amber-50 border border-amber-200/50">
                  <div className="text-xl font-extrabold text-amber-600">🔥 {streak}</div>
                  <div className="text-[9px] uppercase tracking-wider text-text-secondary font-bold mt-0.5">Day Streak</div>
                </div>
              </div>
              <div className="p-3 rounded-custom-md bg-blue-50 border border-blue-200/50 flex items-start gap-2 text-left mb-5">
                <Clock size={14} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-700 leading-relaxed">
                  Your submission is <strong>pending admin approval</strong>. Points will be officially confirmed after review.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-custom-md bg-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer"
              >
                Continue Sadhana
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Deterministic Serial ID Helper ───────────────────────────────────────────
const toReadableId = (uuid = "", prefix = "ID", padLen = 4) => {
  if (!uuid) return `${prefix}-0000`;
  const num = parseInt(uuid.replace(/-/g, "").slice(-6), 16) % 10000;
  return `${prefix}-${String(num).padStart(padLen, "0")}`;
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const { user, profile, profilesList, loading, logout, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState("sadhana");
  const [isLoading, setIsLoading] = useState(true);

  const [activities, setActivities] = useState([]);
  const [logs, setLogs] = useState([]);
  const [checkedActivities, setCheckedActivities] = useState([]);
  const [checkInDate, setCheckInDate] = useState(() => {
    if (typeof window !== "undefined") {
      const local = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
      return local.toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ pointsEarned: 0, totalPoints: 0, streak: 0, date: "" });

  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(false);
  const [quote, setQuote] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [donations, setDonations] = useState([]);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadAnnCount, setUnreadAnnCount] = useState(0);
  const [lastViewedTime, setLastViewedTime] = useState("1970-01-01T00:00:00.000Z");

  // Notification center states
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  useEffect(() => {
    if (profile) {
      setEditName(profile.fullName || profile.full_name || "");
      setEditCity(profile.city || "Labriya");
      setEditAvatar(profile.avatar || profile.avatar_url || "");
      const rawMobile = profile.phone || profile.mobile || "";
      setEditPhone(rawMobile.replace(/^\+91/, ""));
    }
  }, [profile]);

  const handleMarkNotifRead = async (notifId) => {
    await db.markNotificationRead(notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    setUnreadNotifCount(prev => Math.max(0, prev - 1));
  };

  useEffect(() => {
    if (loading) return;
    if (!user || !profile) { router.push("/login"); return; }

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        await db.getDevoteeProfile(profile.id);
        const acts = await db.getSadhanaActivities();
        setActivities(acts);

        const sadhanaLogs = await db.getSadhanaLogs(profile.id);
        setLogs(sadhanaLogs);

        const todayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];
        const todaysLog = sadhanaLogs.find(l => l.dateStr === todayStr);
        if (todaysLog) setCheckedActivities(todaysLog.activities);

        let badgesList = [];
        if (db.isSupabaseConfigured && db.supabase) {
          const { data: dbBadges } = await db.supabase
            .from("profile_badges").select("badge_id").eq("profile_id", profile.id);
          if (dbBadges) badgesList = dbBadges.map(b => b.badge_id);
        } else {
          badgesList = profile.badges || [];
        }
        setUnlockedBadges(badgesList);

        const lbEnabled = await db.isLeaderboardEnabled();
        setLeaderboardEnabled(lbEnabled);
        if (lbEnabled) {
          const lbData = await db.getLeaderboard();
          setLeaderboard(lbData);
        }

        const donationsList = await db.getDonations();
        const userPhone = profile.mobile || profile.phone || user.phone || "";
        const cleanPhone = userPhone.replace("+91", "");
        setDonations(donationsList.filter(d =>
          d.phone === cleanPhone || d.phone === userPhone ||
          (d.profileId && d.profileId === profile.id)
        ));

        // Load notifications
        const notifList = await db.getNotifications(profile.id);
        setNotifications(notifList);
        setUnreadNotifCount(notifList.filter(n => !n.read).length);

        // Load active announcements
        const activeAnn = await db.getAnnouncements();
        setAnnouncements(activeAnn);
        const lastViewed = localStorage.getItem("last_viewed_announcements_time") || "1970-01-01T00:00:00.000Z";
        setLastViewedTime(lastViewed);
        const unreadAnn = activeAnn.filter(a => new Date(a.createdAt).getTime() > new Date(lastViewed).getTime()).length;
        setUnreadAnnCount(unreadAnn);

        // Check maintenance mode
        const settings = await db.getSettings();
        if (settings && settings.maintenanceMode && profile.role !== "admin") {
          setMaintenanceMode(true);
        }
      } catch {
        showNotification("Failed to load dashboard data.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (logs.length > 0) {
      const selectedLog = logs.find(l => l.dateStr === checkInDate);
      setCheckedActivities(selectedLog ? selectedLog.activities : []);
    }
  }, [checkInDate, logs]);

  const showNotification = (msg, type = "success") => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => setStatusMessage(""), 5000);
  };

  const todayStr = useMemo(() =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0],
    []
  );

  const selectedDateLog = useMemo(() => logs.find(l => l.dateStr === checkInDate), [logs, checkInDate]);
  const isLocked = !!selectedDateLog;
  const todayStatus = selectedDateLog?.status || "Pending";
  const isViewingToday = checkInDate === todayStr;
  const isTodaySubmitted = useMemo(() => logs.some(l => l.dateStr === todayStr), [logs, todayStr]);

  const getTodayPointsPreview = useCallback(() => {
    let pts = 0;
    checkedActivities.forEach(id => {
      const act = activities.find(a => a.id === id);
      if (act) pts += act.points;
    });
    return pts;
  }, [checkedActivities, activities]);

  const getMonthlySummary = useCallback(() => {
    if (logs.length === 0) return { count: 0, points: 0, mostPerformed: "None" };
    let totalPoints = 0;
    const actCount = {};
    logs.forEach(log => {
      totalPoints += log.points;
      log.activities.forEach(id => { actCount[id] = (actCount[id] || 0) + 1; });
    });
    let maxCount = 0; let mostPerformedId = "None";
    for (const [id, count] of Object.entries(actCount)) {
      if (count > maxCount) { maxCount = count; mostPerformedId = id; }
    }
    const mostPerformedAct = activities.find(a => a.id === mostPerformedId);
    return { count: logs.length, points: totalPoints, mostPerformed: mostPerformedAct?.name || "None" };
  }, [logs, activities]);

  const monthlySummary = getMonthlySummary();

  const handleLogout = async () => {
    try { await logout(); router.push("/"); } catch { /* silent */ }
  };

  const handleToggleActivity = (id) => {
    if (isLocked) return;
    setCheckedActivities(prev =>
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  const handleSaveSadhana = async () => {
    if (!profile || isSubmitting || isLocked) return;
    if (checkedActivities.length === 0) {
      showNotification("Please select at least one activity before submitting.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await db.submitDailySadhana(profile.id, checkInDate, checkedActivities);
      if (!db.isSupabaseConfigured) {
        await profileService.updateProfile(profile.id, {
          totalPoints: result.profile.totalPoints,
          streak: result.profile.streak
        });
      }
      await refreshProfile(profile.id);
      const updatedLogs = await db.getSadhanaLogs(profile.id);
      setLogs(updatedLogs);

      let badgesList = [];
      if (db.isSupabaseConfigured && db.supabase) {
        const { data: dbBadges } = await db.supabase
          .from("profile_badges").select("badge_id").eq("profile_id", profile.id);
        if (dbBadges) badgesList = dbBadges.map(b => b.badge_id);
      } else {
        badgesList = result.profile.badges || [];
      }
      setUnlockedBadges(badgesList);

      if (leaderboardEnabled) {
        const lbData = await db.getLeaderboard();
        setLeaderboard(lbData);
      }

      let pointsCalculated = 0;
      checkedActivities.forEach(id => {
        const act = activities.find(a => a.id === id);
        if (act) pointsCalculated += act.points;
      });

      setSuccessData({
        pointsEarned: pointsCalculated,
        totalPoints: result.profile.totalPoints || profile.totalPoints || 0,
        streak: result.profile.streak || profile.streak || 0,
        date: checkInDate
      });
      setShowSuccessModal(true);

      // Create notifications
      const title = "Sadhana Log Submitted 📝";
      const message = `You checked in ${checkedActivities.length} vows for ${checkInDate} (+${pointsCalculated} claimed pts).`;
      await db.createNotification(profile.id, title, message, "submission_received");

      // Notify admins
      await db.createNotification(
        null,
        `New Submission: ${profile.fullName}`,
        `${profile.fullName} submitted logs for ${checkInDate} (${pointsCalculated} pts).`,
        "admin_new_submission"
      );

      // Reload notifications list
      const notifList = await db.getNotifications(profile.id);
      setNotifications(notifList);
      setUnreadNotifCount(notifList.filter(n => !n.read).length);

      // Scroll to the status card smoothly
      setTimeout(() => {
        const el = document.getElementById("submission-status-card");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);

    } catch (err) {
      const msg = err.message?.includes("approved")
        ? "This entry was approved by admin and cannot be modified."
        : `Failed to save: ${err.message}`;
      showNotification(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profile) return;
    const trimmedPhone = editPhone.trim().replace(/\D/g, "");
    if (trimmedPhone && trimmedPhone.length < 10) {
      showNotification("Please enter a valid 10-digit mobile number.", "error");
      return;
    }
    const formattedPhone = trimmedPhone ? `+91${trimmedPhone}` : null;
    try {
      await db.updateDevoteeProfile(profile.id, { fullName: editName, city: editCity, avatar: editAvatar, phone: formattedPhone });
      await profileService.updateProfile(profile.id, { fullName: editName, city: editCity, avatar: editAvatar, phone: formattedPhone });
      await refreshProfile(profile.id);
      showNotification("🌸 Profile details updated successfully.", "success");
    } catch (err) {
      if (err.message?.includes("unique_active_mobile") || err.code === "23505") {
        showNotification("This phone number is already registered to another devotee.", "error");
      } else {
        showNotification("Failed to update profile details.", "error");
      }
    }
  };

  const triggerPrintReceipt = (donation) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Donation Receipt - Shree Labriya Mandir Trust</title>
      <style>body{font-family:Inter,sans-serif;color:#1F2937;padding:40px;line-height:1.6}.receipt-box{max-width:700px;margin:0 auto;border:1px solid #ECECEC;border-radius:12px;padding:40px;box-shadow:0 4px 12px rgba(0,0,0,.02)}.header{text-align:center;border-bottom:2px solid #EA580C;padding-bottom:20px;margin-bottom:30px}.header h1{font-size:24px;margin:0;color:#C28A3E}.header p{font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:5px 0 0;color:#6B7280}.title{text-align:center;font-size:18px;font-weight:700;text-decoration:underline;margin-bottom:30px}.details-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:40px}.detail-item{font-size:14px}.detail-item strong{display:block;color:#6B7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px}.amount-word{font-size:15px;font-weight:600;background:#FFF7ED;padding:15px;border-radius:6px;border:1px solid #FFE3C3;margin-bottom:40px}.footer-notes{font-size:11px;color:#6B7280;border-top:1px solid #ECECEC;padding-top:20px;text-align:center}.signatures{display:flex;justify-content:space-between;margin-top:50px;margin-bottom:30px}.sig-line{width:180px;border-top:1px solid #6B7280;text-align:center;font-size:12px;padding-top:5px}@media print{.no-print{display:none}body{padding:0}.receipt-box{border:none;box-shadow:none;padding:0}}</style>
      </head><body>
      <div class="no-print" style="max-width:700px;margin:0 auto 20px auto;text-align:right"><button onclick="window.print()" style="background:#EA580C;color:#fff;border:none;padding:10px 20px;font-weight:700;border-radius:6px;cursor:pointer">Print Receipt</button></div>
      <div class="receipt-box"><div class="header"><h1>SHREE LABRIYA JAIN SHWETAMBAR MANDIR TRUST</h1><p>Mandir Marg, Labriya, Dhar, Madhya Pradesh - 454111</p></div>
      <div class="title">DONATION RECEIPT VOUCHER</div>
      <div class="details-grid">
      <div class="detail-item"><strong>Receipt Number</strong>#LAB-REC-${donation.id.toUpperCase()}</div>
      <div class="detail-item"><strong>Date &amp; Time</strong>${new Date(donation.createdAt).toLocaleString()}</div>
      <div class="detail-item"><strong>Donor Name</strong>${donation.donorName}</div>
      <div class="detail-item"><strong>Contact Number</strong>+91 ${donation.phone}</div>
      <div class="detail-item"><strong>Transaction ID</strong>${donation.txnId}</div>
      <div class="detail-item"><strong>Donation Status</strong>${donation.verified ? "Verified &amp; Cleared" : "Pending Verification"}</div>
      </div>
      <div class="amount-word"><strong style="display:block;font-size:11px;text-transform:uppercase;color:#EA580C;margin-bottom:5px">Amount Donated</strong>INR ${donation.amount.toLocaleString("en-IN")}.00</div>
      <div class="signatures"><div class="sig-line">Donor Signature</div><div class="sig-line" style="color:#EA580C;font-weight:700"><span style="font-family:'Brush Script MT',cursive;font-size:20px;display:block;height:24px;margin-top:-15px">Trust Office</span>Authorized Signatory</div></div>
      <div class="footer-notes">Thank you for your generous contribution towards the Chaturmas 2026 arrangements.<br>This is a computer-generated voucher and does not require a physical stamp.<br>All contributions are exempt under Section 80G of the Income Tax Act.</div>
      </div></body></html>`);
    printWindow.document.close();
  };

  // ── Loading State ─────────────────────────────────────────────────────────────
  if (maintenanceMode) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-border-custom shadow-premium rounded-custom-lg text-center flex flex-col items-center gap-4">
        <span className="text-4xl animate-pulse">🛠️</span>
        <h2 className="font-display font-bold text-lg text-text-primary">Maintenance Mode Active</h2>
        <p className="text-xs text-text-secondary leading-relaxed">
          Shree Labriya Jain Shwetambar Mandir portal is currently undergoing scheduled database maintenance. 
          Please check back in a few hours.
        </p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded bg-primary text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:bg-primary/95"
        >
          Sign Out
        </button>
      </div>
    );
  }

  if (isLoading || !user || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="w-full bg-white border border-border-custom shadow-premium p-6 sm:p-8 rounded-custom-lg mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <SkeletonCard className="w-16 h-16 rounded-full" />
            <div className="flex flex-col gap-2">
              <SkeletonCard className="w-24 h-3" />
              <SkeletonCard className="w-40 h-5" />
              <SkeletonCard className="w-32 h-3" />
            </div>
          </div>
          <div className="flex gap-4">
            <SkeletonCard className="w-28 h-14 rounded-custom-md" />
            <SkeletonCard className="w-28 h-14 rounded-custom-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 flex flex-col gap-2">
            {[1,2,3,4,5].map(i => <SkeletonCard key={i} className="h-10 rounded-custom-md" />)}
          </div>
          <div className="lg:col-span-9 bg-white border border-border-custom shadow-premium p-6 rounded-custom-lg">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} className="h-20 rounded-custom-md" />)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} className="h-16 rounded-custom-md" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalSubmissions = logs.length;
  const completionPercentage = Math.min(100, Math.round((totalSubmissions / 120) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        pointsEarned={successData.pointsEarned}
        totalPoints={successData.totalPoints}
        streak={successData.streak}
        date={successData.date}
      />

      {/* ── Header ── */}
      <div className="w-full bg-white border border-border-custom shadow-premium p-6 sm:p-8 rounded-custom-lg mb-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-full bg-secondary/30 -skew-x-12 pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto text-center sm:text-left">
          <img
            src={profile.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 bg-secondary"
          />
          <div>
            <span className="text-[9px] uppercase tracking-widest font-bold text-primary px-2.5 py-0.5 rounded bg-secondary border border-primary/10">Jai Jinendra</span>
            <h1 className="font-display font-semibold text-text-primary text-xl sm:text-2xl mt-1.5 leading-tight">{profile.fullName}</h1>
            <p className="text-xs text-text-secondary mt-1 font-medium">
              📍 {profile.city}{profile.phone ? ` • +91 ${profile.phone}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 shrink-0 w-full md:w-auto border-t md:border-t-0 border-neutral-100 pt-4 md:pt-0">
          <div className="flex items-center gap-3 bg-secondary/50 px-4 py-3 rounded-custom-md border border-primary/10">
            <span className="text-xl">🪷</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Total Sadhana</span>
              <span className="text-sm font-bold text-primary">{profile.totalPoints || 0} Points</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-orange-50 px-4 py-3 rounded-custom-md border border-primary/10">
            <Flame size={20} className="text-primary animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Practice Streak</span>
              <span className="text-sm font-bold text-primary">{profile.streak || 0} Days</span>
            </div>
          </div>
          {profilesList.length === 1 ? (
            <button onClick={() => router.push("/profile-select")} className="px-4 py-2.5 rounded-custom-md bg-white text-text-secondary hover:text-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 border border-neutral-200">
              <UserPlus size={14} /><span>Add Family Member</span>
            </button>
          ) : (
            <button onClick={() => router.push("/profile-select")} className="px-4 py-2.5 rounded-custom-md bg-white text-text-secondary hover:text-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 border border-neutral-200">
              <User size={14} /><span>Switch Profile</span>
            </button>
          )}

          {/* Bell Icon / Notification Center Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2.5 rounded-custom-md bg-white text-text-secondary hover:text-primary transition-all cursor-pointer border border-neutral-200 relative flex items-center justify-center shrink-0"
              title="Notifications"
            >
              <Bell size={14} />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowNotifMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-white border border-border-custom rounded-custom-md shadow-premium z-40 p-3 flex flex-col gap-2 max-h-80 overflow-y-auto"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                      <span className="text-[10px] font-bold uppercase text-text-primary">Notifications</span>
                      {unreadNotifCount > 0 && (
                        <button
                          onClick={async () => {
                            for (const n of notifications) {
                              if (!n.read) await handleMarkNotifRead(n.id);
                            }
                          }}
                          className="text-[8px] font-extrabold uppercase text-primary cursor-pointer hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-[10px] text-text-secondary italic text-center py-4">No notifications yet</p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkNotifRead(n.id)}
                            className={`p-2 rounded text-[10px] cursor-pointer transition-colors border ${
                              n.read ? "bg-neutral-50/50 text-text-secondary border-transparent" : "bg-secondary/10 text-text-primary border-primary/20 border-l-2 border-l-primary"
                            }`}
                          >
                            <p className="font-bold">{n.title}</p>
                            <p className="mt-0.5 leading-normal">{n.message}</p>
                            <span className="text-[8px] text-text-secondary block mt-1">
                              {new Date(n.created_at || n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button onClick={handleLogout} className="px-4 py-2.5 rounded-custom-md bg-neutral-100 text-text-secondary hover:bg-red-50 hover:text-red-600 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 border border-neutral-200">
            <LogOut size={14} /><span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* ── Notification Banner ── */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`w-full p-4 mb-6 rounded-custom-md text-xs font-semibold flex items-center justify-between shadow-premium border ${
              statusType === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-secondary text-primary border-primary/15"
            }`}
          >
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage("")} className="text-xs uppercase font-bold shrink-0 ml-4 hover:opacity-75 cursor-pointer">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Grid ── */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Sidebar */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-thin">
          {[
            { id: "sadhana", label: "Daily Check-In", icon: CheckSquare },
            { id: "notices", label: "Temple Notices", icon: Megaphone, count: unreadAnnCount },
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
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "notices") {
                    localStorage.setItem("last_viewed_announcements_time", new Date().toISOString());
                    setUnreadAnnCount(0);
                  }
                }}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-custom-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap lg:w-full text-left ${
                  isTabActive ? "bg-primary text-white shadow-premium" : "bg-white border border-border-custom text-text-secondary hover:text-text-primary hover:border-primary/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </div>
                {tab.count > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] font-bold animate-pulse">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
          <div className="hidden lg:flex flex-col gap-3 p-5 rounded-custom-md bg-secondary/35 border border-primary/10 mt-4">
            <span className="text-xs">📚</span>
            <p className="text-[10px] text-text-secondary italic leading-relaxed">&quot;{quote}&quot;</p>
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-9 bg-white border border-border-custom shadow-premium p-6 sm:p-8 rounded-custom-lg min-h-[500px]">

          {/* ── DAILY CHECK-IN TAB ── */}
          {activeTab === "sadhana" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border-custom">
                <div>
                  <h3 className="font-display font-semibold text-text-primary text-base">Daily Sadhana Check-In</h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Submit vows & self-improvement routines</p>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="check-in-date" className="text-[10px] uppercase font-bold text-text-secondary shrink-0">Target Date:</label>
                  <input
                    id="check-in-date"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded bg-bg-custom border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium"
                  />
                </div>
              </div>

              {/* Submitted banner */}
              {isViewingToday && isTodaySubmitted && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-custom-md bg-amber-50 border border-amber-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Lock size={14} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-800">Today&apos;s check-in has been submitted</p>
                      <p className="text-[10px] text-amber-600 mt-0.5">Editing is disabled. Contact admin if changes are needed.</p>
                    </div>
                  </div>
                  <StatusBadge status={todayStatus} />
                </div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: "🔥", label: "Current Streak", value: profile.streak || 0, suffix: " Days", bg: "bg-orange-50", border: "border-orange-100" },
                  { icon: "🏆", label: "Longest Streak", value: profile.longestStreak || 0, suffix: " Days", bg: "bg-amber-50", border: "border-amber-100" },
                  { icon: "🪷", label: "Total Points", value: profile.totalPoints || 0, suffix: " pts", bg: "bg-secondary/30", border: "border-primary/10" },
                  { icon: "📝", label: "Submissions", value: totalSubmissions, suffix: " Days", bg: "bg-white", border: "border-border-custom" },
                  { icon: "⚡", label: "Completion Rate", value: completionPercentage, suffix: "%", bg: "bg-white", border: "border-border-custom" },
                  { icon: "📅", label: "Today's Check-In", isStatus: true, status: isTodaySubmitted ? "submitted" : "pending", bg: isTodaySubmitted ? "bg-green-50" : "bg-white", border: isTodaySubmitted ? "border-green-100" : "border-border-custom" }
                ].map((stat, i) => (
                  <div key={i} className={`p-4 rounded-custom-md ${stat.bg} border ${stat.border} flex items-center gap-3`}>
                    <span className="text-xl select-none">{stat.icon}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider truncate">{stat.label}</span>
                      {stat.isStatus ? (
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border inline-block mt-0.5 ${
                          stat.status === "submitted" ? "bg-green-100 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"
                        }`}>
                          {stat.status === "submitted" ? "✓ Submitted" : "⏰ Pending"}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-text-primary">
                          <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Points preview */}
              <div className="p-4 rounded bg-secondary/50 border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <h4 className="text-xs font-bold text-primary">Sadhana Check-in Preview</h4>
                  <p className="text-[10px] text-text-secondary">Checking completed routines updates streak counts and unlocks digital badges.</p>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-primary/15 px-3 py-1.5 rounded font-bold text-xs text-primary shrink-0">
                  <TrendingUp size={12} />
                  <span>Earn Today:</span>
                  <span className="text-sm font-extrabold">{getTodayPointsPreview()} Points</span>
                </div>
              </div>

              {/* Checklist Grid */}
              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {activities.map((act) => {
                    const isChecked = checkedActivities.includes(act.id);
                    return (
                      <div
                        key={act.id}
                        onClick={() => handleToggleActivity(act.id)}
                        className={`p-3.5 border rounded-custom-md flex items-center justify-between transition-all ${
                          isLocked
                            ? isChecked
                              ? "bg-green-50 border-green-500/20 cursor-default"
                              : "bg-white border-neutral-100 opacity-50 cursor-default"
                            : isChecked
                            ? "bg-secondary/40 border-primary shadow-premium cursor-pointer"
                            : "bg-white border-border-custom hover:border-primary/20 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            disabled={isLocked}
                            className="w-4 h-4 rounded text-primary border-border-custom focus:ring-primary cursor-pointer shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-text-primary">{act.name}</span>
                            <span className="text-[9px] text-text-secondary mt-0.5">{act.category}</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-primary bg-white border border-primary/10 px-2 py-0.5 rounded">+{act.points} pts</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sadhana Submission Status Card (Stream 1 & 2) */}
              {isLocked && selectedDateLog && (
                <div id="submission-status-card" className="p-6 rounded-custom-lg border border-border-custom bg-neutral-50/50 flex flex-col gap-5 mt-6 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} className="text-green-600 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">✓ Submitted Successfully</h4>
                      <p className="text-[9px] text-text-secondary">Your spiritual check-in has been filed and locked for today.</p>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-custom-md border border-border-custom text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase font-bold text-text-secondary">Submission ID</span>
                      <span className="font-mono font-bold text-text-primary">
                        {toReadableId(selectedDateLog.submissionId || selectedDateLog.id, "S")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase font-bold text-text-secondary">Submission Date</span>
                      <span className="font-semibold text-text-primary">
                        {selectedDateLog.createdAt ? new Date(selectedDateLog.createdAt).toLocaleDateString() : checkInDate}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase font-bold text-text-secondary">Submission Time</span>
                      <span className="font-semibold text-text-primary">
                        {selectedDateLog.createdAt ? new Date(selectedDateLog.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "12:00 PM"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase font-bold text-text-secondary">Claimed Points</span>
                      <span className="font-extrabold text-primary">
                        +{selectedDateLog.points || 0} Points
                      </span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="flex flex-col gap-3 bg-white p-4 rounded-custom-md border border-border-custom">
                    <p className="text-[9px] uppercase font-bold text-text-secondary">Verification Timeline</p>
                    
                    <div className="flex items-center justify-between max-w-sm mx-auto w-full relative py-3 mt-1">
                      <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-neutral-100 -translate-y-1/2 z-0" />
                      
                      {/* Step 1 */}
                      <div className="flex flex-col items-center gap-1 z-10">
                        <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[9px] font-bold">✓</div>
                        <span className="text-[8px] font-bold text-text-primary">Submitted</span>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col items-center gap-1 z-10">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          todayStatus === "Pending" ? "bg-amber-500 text-white animate-pulse" : "bg-green-500 text-white"
                        }`}>
                          {todayStatus === "Pending" ? "🟡" : "✓"}
                        </div>
                        <span className="text-[8px] font-bold text-text-primary">
                          {todayStatus === "Pending" ? "Reviewing" : "Reviewed"}
                        </span>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col items-center gap-1 z-10">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          todayStatus === "Approved" ? "bg-green-500 text-white" : todayStatus === "Rejected" ? "bg-red-500 text-white" : "bg-neutral-200 text-neutral-400"
                        }`}>
                          {todayStatus === "Approved" ? "🟢" : todayStatus === "Rejected" ? "🔴" : "○"}
                        </div>
                        <span className="text-[8px] font-bold text-text-primary">
                          {todayStatus === "Approved" ? "Approved" : todayStatus === "Rejected" ? "Rejected" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Remarks details */}
                  {selectedDateLog.adminNote && (
                    <div className={`p-4 rounded-custom-md border flex flex-col gap-1 ${
                      todayStatus === "Rejected" ? "bg-red-50 border-red-200/50 text-red-800" : "bg-green-50 border-green-200/50 text-green-800"
                    }`}>
                      <span className="text-[9px] uppercase font-bold">Admin Notes / Remarks</span>
                      <p className="text-xs font-semibold">{selectedDateLog.adminNote}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Submit footer */}
              {!isLocked && (
                <div className="flex justify-end pt-4 border-t border-border-custom mt-4">
                  <button
                    onClick={handleSaveSadhana}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded bg-primary text-white text-xs font-bold uppercase tracking-wider shadow hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <><Loader2 size={14} className="animate-spin" /><span>Saving...</span></>
                    ) : (
                      <><Save size={14} /><span>Submit Sadhana Logs</span></>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── TEMPLE NOTICES TAB ── */}
          {activeTab === "notices" && (
            <div className="flex flex-col gap-6">
              <div className="pb-3 border-b border-border-custom">
                <h3 className="font-display font-semibold text-text-primary text-base">Temple Announcements & Notice Board</h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Stay updated with official bulletins, programs, and notice updates</p>
              </div>

              {announcements.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {announcements.map((ann) => {
                    const isNew = new Date(ann.createdAt).getTime() > new Date(lastViewedTime).getTime();
                    return (
                      <div key={ann.id} className="p-5 rounded-custom-md border border-border-custom bg-neutral-50/50 flex flex-col gap-3 relative overflow-hidden">
                        {isNew && (
                          <div className="absolute top-0 right-0 bg-primary text-white text-[7px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl">
                            New
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-text-primary text-xs">{ann.title}</h4>
                            <span className={`text-[7.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              ann.priority === "high"
                                ? "bg-red-50 text-red-600 border-red-500/10"
                                : ann.priority === "low"
                                ? "bg-blue-50 text-blue-600 border-blue-500/10"
                                : "bg-orange-50 text-primary border-primary/10"
                            }`}>
                              {ann.priority || "normal"}
                            </span>
                            {ann.pinned && (
                              <span className="text-[7.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-amber-50 text-amber-600 border-amber-500/10 flex items-center gap-1">
                                📌 Pinned
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-text-secondary font-medium">
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div 
                          className="text-xs text-text-secondary leading-relaxed whitespace-pre-line"
                          dangerouslySetInnerHTML={{ __html: sanitizeHTML(ann.content) }}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-border-custom rounded-custom-md bg-neutral-50/20">
                  <span className="text-2xl">🪷</span>
                  <p className="text-xs text-text-secondary mt-2">No announcements posted at this time. Check back later.</p>
                </div>
              )}
            </div>
          )}

          {/* ── BADGES TAB ── */}
          {activeTab === "badges" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base">Devotional Achievements</h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Spiritual milestone badges</p>
              </div>
              {unlockedBadges.length === 0 && (
                <div className="py-10 flex flex-col items-center justify-center gap-3 border border-dashed border-border-custom rounded-custom-md">
                  <span className="text-4xl">🏅</span>
                  <p className="text-sm font-semibold text-text-secondary">No badges earned yet</p>
                  <p className="text-xs text-text-secondary text-center max-w-xs">Complete daily activities consistently to unlock spiritual achievement badges.</p>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-2">
                {Object.entries(BADGES_DEFINITIONS).map(([badgeId, val]) => {
                  const isUnlocked = unlockedBadges.includes(badgeId);
                  return (
                    <div key={badgeId} className={`p-5 rounded-custom-lg border text-center flex flex-col items-center justify-center gap-3 transition-all ${
                      isUnlocked ? "bg-white border-primary shadow-premium ring-2 ring-primary/5" : "bg-neutral-50/50 border-neutral-100 opacity-40 select-none"
                    }`}>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm ${isUnlocked ? "bg-secondary text-primary" : "bg-neutral-200"}`}>{val.icon}</div>
                      <div>
                        <h4 className={`text-xs font-bold ${isUnlocked ? "text-text-primary" : "text-text-secondary"}`}>{val.name}</h4>
                        <p className="text-[9px] text-text-secondary mt-1 leading-normal">{val.desc}</p>
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

          {/* ── HISTORY TAB ── */}
          {activeTab === "history" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base">Spiritual Logs & Metrics</h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Summary analyses of monthly routines</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { icon: "📅", label: "Days Active", value: `${monthlySummary.count} Days` },
                  { icon: "🔥", label: "Most Active Duty", value: monthlySummary.mostPerformed },
                  { icon: "🏅", label: "Monthly Points", value: `${monthlySummary.points} Points` }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-custom-md bg-secondary/35 border border-primary/10 flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">{item.label}</span>
                      <span className="text-sm font-bold text-primary truncate">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-full mt-4 overflow-hidden border border-border-custom rounded-custom-lg bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-bg-custom border-b border-border-custom text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                        <th className="p-4">Date</th>
                        <th className="p-4">Activities Completed</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length > 0 ? (
                        logs.map((log) => (
                          <tr key={log.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                            <td className="p-4 font-semibold text-text-primary whitespace-nowrap">{log.dateStr}</td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1.5">
                                {log.activities.map((actId) => {
                                  const name = activities.find(a => a.id === actId)?.name || actId;
                                  return <span key={actId} className="px-2 py-0.5 rounded bg-neutral-100 text-text-secondary text-[9px] font-medium border border-neutral-200">{name}</span>;
                                })}
                              </div>
                            </td>
                            <td className="p-4 text-center"><StatusBadge status={log.status || "Pending"} /></td>
                            <td className="p-4 text-right font-extrabold text-primary">+{log.points} pts</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={4} className="p-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <span className="text-4xl">📋</span>
                            <p className="text-sm font-semibold text-text-secondary">No logs submitted yet</p>
                            <p className="text-xs text-text-secondary">Check in daily to build your spiritual record.</p>
                          </div>
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── LEADERBOARD TAB ── */}
          {activeTab === "leaderboard" && leaderboardEnabled && (
            <div className="flex flex-col gap-6">
              <div className="pb-3 border-b border-border-custom">
                <h3 className="font-display font-semibold text-text-primary text-base">Participant Inspiration</h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Top 10 devotees consistency board</p>
              </div>
              <div className="p-4 rounded-custom-md bg-secondary/30 border border-primary/10 text-xs text-text-secondary leading-relaxed flex items-start gap-2.5">
                <Compass size={16} className="text-primary shrink-0 mt-0.5" />
                <span>This board serves to inspire consistency and devotion. We encourage devotees to maintain their daily vows. Top participants represent consistency in their daily check-ins.</span>
              </div>
              {leaderboard.length === 0 ? (
                <div className="py-10 flex flex-col items-center gap-3">
                  <span className="text-4xl">🏆</span>
                  <p className="text-sm font-semibold text-text-secondary">Leaderboard is empty</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 mt-2">
                  {leaderboard.map((item, index) => {
                    const isCurrentUser = item.id === profile.id;
                    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";
                    return (
                      <div key={item.id} className={`p-4 border rounded-custom-md flex items-center justify-between gap-4 transition-all ${isCurrentUser ? "bg-secondary/40 border-primary ring-1 ring-primary/10" : "bg-white border-border-custom"}`}>
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-center font-bold text-xs text-text-secondary shrink-0">{medal || `${index + 1}`}</span>
                          <img src={item.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"} alt={item.fullName} className="w-10 h-10 rounded-full object-cover shrink-0 border border-neutral-100" />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                              {item.fullName}
                              {isCurrentUser && <span className="text-[8px] uppercase tracking-wider font-bold bg-primary text-white px-1.5 py-0.5 rounded">You</span>}
                            </span>
                            <span className="text-[9px] text-text-secondary mt-0.5">{item.city} • 🔥 {item.streak || 0} Day Streak</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-primary bg-secondary px-3 py-1 rounded-full border border-primary/5 shrink-0">{item.totalPoints} Points</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── DONATIONS TAB ── */}
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
                    <div key={donation.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-custom-md bg-bg-custom border border-border-custom gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <FileCheck size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-text-primary">INR {donation.amount.toLocaleString("en-IN")}.00</span>
                            <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${donation.verified ? "bg-emerald-50 text-emerald-700 border-emerald-500/10" : "bg-amber-50 text-amber-700 border-amber-500/10"}`}>
                              {donation.verified ? "Verified" : "Pending"}
                            </span>
                          </div>
                          <p className="text-[10px] text-text-secondary mt-1">Txn ID: {donation.txnId} • {new Date(donation.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button onClick={() => triggerPrintReceipt(donation)} className="px-4 py-2 rounded-custom-md bg-white border border-border-custom hover:border-primary/50 text-accent text-xs font-bold uppercase tracking-wider shadow flex items-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto justify-center">
                        <Download size={14} /><span>Print 80G Receipt</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-border-custom rounded-custom-md flex flex-col items-center justify-center gap-3">
                  <span className="text-4xl">💝</span>
                  <div>
                    <p className="text-sm text-text-primary font-semibold">No donations registered under {profile.phone || profile.mobile || user.phone || "your account"}</p>
                    <p className="text-xs text-text-secondary max-w-sm mt-1">If you have made a transfer via QR/UPI, please report it at the Donation desk to link the receipt here.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── EDIT PROFILE TAB ── */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-6">
              <div className="pb-3 border-b border-border-custom">
                <h3 className="font-display font-semibold text-text-primary text-base">Edit Devotee Profile</h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Personalize your sadhana identity</p>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-5 rounded-custom-lg bg-bg-custom border border-border-custom flex flex-col gap-4 max-w-xl">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-secondary uppercase font-bold">Full Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-secondary uppercase font-bold">City / Residence</label>
                  <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} required className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-secondary uppercase font-bold">Mobile Number (Optional)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs text-text-secondary font-semibold select-none">+91</span>
                    <input type="tel" maxLength={10} value={editPhone} onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ""))} className="w-full pl-10 pr-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium" placeholder="10-digit number" />
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-[10px] text-text-secondary uppercase font-bold">Avatar Image URL</label>
                  <input type="text" value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} placeholder="https://images.unsplash.com..." className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium" />
                  <div className="flex items-center gap-3.5 mt-1 bg-white p-3 rounded border border-border-custom">
                    <span className="text-[9px] uppercase font-bold text-text-secondary shrink-0">Quick presets:</span>
                    <div className="flex gap-2">
                      {[
                        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150",
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150",
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150"
                      ].map((presetUrl, idx) => (
                        <img key={idx} src={presetUrl} alt="Preset Avatar" onClick={() => setEditAvatar(presetUrl)} className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition-all ${editAvatar === presetUrl ? "border-primary scale-110 shadow-premium" : "border-transparent hover:border-primary/40"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <button type="submit" className="px-5 py-2.5 rounded bg-primary text-white text-xs font-bold uppercase tracking-wider shadow hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 w-fit cursor-pointer ml-auto mt-2">
                  <Save size={14} /><span>Update Profile</span>
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

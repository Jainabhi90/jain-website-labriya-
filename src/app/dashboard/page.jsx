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
  Megaphone,
  UserCircle,
  HelpCircle,
  Check
} from "lucide-react";
import { db } from "@/services/db";
import { useAuth } from "@/context/AuthContext";
import { profileService } from "@/services/profileService";
import { sanitizeHTML } from "@/lib/sanitize";
import confetti from "canvas-confetti";
import { useCMS } from "@/context/CMSContext";

import { translations } from "@/services/translations";

// ─── Constants ────────────────────────────────────────────────────────────────
const BADGES_DEFINITIONS = {
  "badge_first_upvas": { nameEn: "First Upvas", nameHi: "प्रथम उपवास", descEn: "Completed your first complete day fast", descHi: "पहला पूर्ण दिन उपवास सम्पन्न किया", icon: "🌸" },
  "badge_10_upvas": { nameEn: "10 Upvas", nameHi: "१० उपवास", descEn: "Completed 10 days of fasting", descHi: "१० दिन का उपवास पूरा किया", icon: "🙏" },
  "badge_30_pravachans": { nameEn: "30 Pravachans", nameHi: "३० प्रवचन", descEn: "Attended 30 holy pravachan discourses", descHi: "३० पवित्र प्रवचनों का श्रवण किया", icon: "📖" },
  "badge_100_temple": { nameEn: "100 Temple Visits", nameHi: "१०० मंदिर दर्शन", descEn: "Visited the temple 100 times", descHi: "१०० बार मंदिर जी दर्शन किए", icon: "🪔" },
  "badge_30_streak": { nameEn: "30 Day Streak", nameHi: "३०-दिवसीय निरंतरता", descEn: "Maintained a 30-day continuous sadhana", descHi: "३० दिन निरंतर साधना बनाए रखी", icon: "🔥" },
  "badge_100_points": { nameEn: "100 Points Milestone", nameHi: "१०० अंक उपलब्धि", descEn: "Earned 100 total Sadhana points", descHi: "कुल १०० साधना अंक अर्जित किए", icon: "🏅" },
  "badge_500_points": { nameEn: "500 Points Milestone", nameHi: "५०० अंक उपलब्धि", descEn: "Earned 500 total Sadhana points", descHi: "कुल ५०० साधना अंक अर्जित किए", icon: "🌼" },
  "badge_1000_points": { nameEn: "1000 Points Milestone", nameHi: "१००० अंक उपलब्धि", descEn: "Earned 1000 total Sadhana points", descHi: "कुल १००० साधना अंक अर्जित किए", icon: "✨" }
};

const MOTIVATIONAL_QUOTES = {
  en: [
    "A soul can attain liberation only by getting rid of its karmas through self-control and austerity. - Lord Mahavira",
    "Fasting cleanses not just the physical body, but burns away negative mental impressions. - Jain Scripture",
    "One moment of sincere meditation (Samayik) can destroy karmas accumulated over lifetimes. - Acharya Bhadrabahu",
    "Non-violence and kindness to all living beings is the greatest form of volunteer service.",
    "Swadhyay is the third eye of a spiritual seeker. It illuminates the inner truth.",
    "Consistency in small daily vows builds a mountain of spiritual strength.",
    "True victory is victory over oneself. Conquer your passions through mindfulness."
  ],
  hi: [
    "आत्मा केवल संयम और तप के माध्यम से अपने कर्मों को नष्ट करके ही मोक्ष प्राप्त कर सकती है। - भगवान महावीर",
    "उपवास न केवल शरीर को शुद्ध करता है, बल्कि नकारात्मक मानसिक विचारों को भी भस्म कर देता है। - जैन शास्त्र",
    "सच्चे भाव से की गई एक सामायिक जन्मों-जन्मों के संचित कर्मों को क्षय कर सकती है। - आचार्य भद्रबाहु",
    "अहिंसा और प्राणीमात्र के प्रति करुणा ही सबसे बड़ी मानव सेवा है।",
    "स्वाध्याय साधक का तीसरा नेत्र है। यह आंतरिक सत्य को प्रकाशित करता है।",
    "छोटे-छोटे दैनिक नियमों में निरंतरता से ही महान आत्मिक शक्ति का निर्माण होता है।",
    "सच्ची विजय स्वयं पर विजय पाना है। अपनी कषायों पर विजय प्राप्त करें।"
  ]
};

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
function StatusBadge({ status, t }) {
  if (status === "Approved") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-500/20">
        <CheckCircle2 size={10} /> {t?.approved || "Approved"}
      </span>
    );
  }
  if (status === "Rejected") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-500/20">
        <XCircle size={10} /> {t?.rejected || "Rejected"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-500/20">
      <Clock size={10} /> {t?.pending || "Pending"}
    </span>
  );
}

// ─── Success Modal ────────────────────────────────────────────────────────────
function SuccessModal({ isOpen, onClose, pointsEarned, totalPoints, streak, date, t }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="bg-white rounded-custom-lg shadow-premium p-7 max-w-sm w-full text-center relative border border-[#EA580C]/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#EA580C]" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-text-primary hover:bg-[#FCFBF7] transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 450, damping: 15 }}
              className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-500/10 shadow-sm"
            >
              <CheckCircle2 size={32} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <h3 className="font-display font-bold text-text-primary text-lg mb-0.5">{t?.jaiJinendra || "Jai Jinendra"}! 🙏</h3>
              <p className="text-[10px] text-text-secondary mb-5">{t?.sadhanaRecordedFor || "Your Sadhana has been recorded for"} {date}</p>
              
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <div className="p-2.5 rounded-custom-md bg-[#FCFBF7] border border-[#C28A3E]/10 text-center">
                  <div className="text-sm font-extrabold text-[#EA580C]">+{pointsEarned}</div>
                  <div className="text-[7.5px] uppercase tracking-wider text-text-secondary font-bold mt-0.5">{t?.claimed || "Claimed"}</div>
                </div>
                <div className="p-2.5 rounded-custom-md bg-[#FCFBF7] border border-[#C28A3E]/10 text-center">
                  <div className="text-sm font-extrabold text-[#EA580C]">{totalPoints}</div>
                  <div className="text-[7.5px] uppercase tracking-wider text-text-secondary font-bold mt-0.5">{t?.totalPts || "Total Pts"}</div>
                </div>
                <div className="p-2.5 rounded-custom-md bg-[#FFF7ED] border border-[#EA580C]/10 text-center">
                  <div className="text-sm font-extrabold text-[#EA580C]">🔥 {streak}</div>
                  <div className="text-[7.5px] uppercase tracking-wider text-text-secondary font-bold mt-0.5">{t?.streak || "Streak"}</div>
                </div>
              </div>

              <div className="p-3 rounded-custom-md bg-emerald-50 border border-emerald-500/10 flex items-start gap-2 text-left mb-5">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[9.5px] text-[#4B5563] leading-relaxed">
                  {t?.sadhanaSubmitConfirmMsg || "Your daily sadhana has been successfully submitted and confirmed! Your stats are updated instantly."}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-custom-md bg-[#EA580C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#EA580C]/90 transition-colors cursor-pointer"
              >
                {t?.continueSadhana || "Continue Sadhana"}
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
  const { cms } = useCMS();

  const [lang, setLang] = useState("en");
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

  const translateActivityName = (act) => {
    if (!act) return "";
    const name = typeof act === "string" ? act : act.name || "";
    if (lang === "en") return name;

    const lower = name.toLowerCase().trim();

    if (lower.includes("ayambil")) return "आयंबिल तप";
    if (lower.includes("samayik")) return "सामायिक (४८ मिनट ध्यान)";
    if (lower.includes("swadhyay")) return "स्वाध्याय (१ घंटा)";
    if (lower.includes("tivhar")) return "तीविहार तप";
    if (lower.includes("biyash")) return "बियासना (दो समय भोजन)";
    if (lower.includes("ekas")) return "एकासना (एक समय भोजन)";
    if (lower.includes("upwas") || lower.includes("upvas")) {
      if (lower.includes("chovihar")) return "उपवास (चौविहार)";
      return "उपवास (पूर्ण तप)";
    }
    if (lower.includes("navkarshi") || lower.includes("navkarsi")) return "नवकारशी";
    if (lower.includes("porsi")) return "पोरसी";
    if (lower.includes("bhaktambar") || lower.includes("bhaktamar")) return "भक्तामर पाठ (सामूहिक)";
    if (lower.includes("kesar")) return "केसर पूजा";
    if (lower.includes("asth") || lower.includes("asht")) return "अष्ट प्रकारी पूजा";
    if (lower.includes("dev darshan") || lower.includes("temple")) {
      if (lower.includes("2")) return "देव दर्शन (२ मंदिर)";
      return "देव दर्शन (१ मंदिर)";
    }
    if (lower.includes("vyakhyan") || lower.includes("pravachan")) return "व्याख्यान / प्रवचन श्रवण";
    if (lower.includes("pratik")) {
      if (lower.includes("subh") || lower.includes("morning")) return "प्रतिक्रमण (सुबह)";
      if (lower.includes("sham") || lower.includes("evening")) return "प्रतिक्रमण (शाम)";
      return "प्रतिक्रमण साधना";
    }
    if (lower.includes("vandan") || lower.includes("chaitya")) return "देव वंदन / चैत्य वंदन";
    if (lower.includes("chovihar") || lower.includes("chauvihar")) return "चौविहार नियम";
    if (lower.includes("jivdaya") || lower.includes("seva")) return "जीवदया / सेवा";
    if (lower.includes("navkar")) return "नवकार माला (१०८ जाप)";
    if (lower.includes("pooja") || lower.includes("puja")) return "पूजा साधना";
    if (lower.includes("guru")) return "गुरु भक्ति";

    return name;
  };

  const translateCategory = (cat) => {
    if (!cat) return "";
    if (lang === "en") return cat;
    const lower = (cat || "").toLowerCase();
    if (lower.includes("fast") || lower.includes("tap")) return "तप / व्रत";
    if (lower.includes("pray") || lower.includes("bhakti")) return "प्रार्थना";
    if (lower.includes("meditat")) return "ध्यान";
    if (lower.includes("temp") || lower.includes("darshan")) return "दर्शन";
    if (lower.includes("learn") || lower.includes("gyan")) return "ज्ञान";
    if (lower.includes("self") || lower.includes("swadhyay")) return "स्वाध्याय";
    if (lower.includes("serv") || lower.includes("seva")) return "सेवा";
    const map = {
      "Fasting": "तप / व्रत",
      "Prayer": "प्रार्थना",
      "Meditation": "ध्यान",
      "Temple": "दर्शन",
      "Learning": "ज्ञान",
      "Self Study": "स्वाध्याय"
    };
    return map[cat] || cat;
  };

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

  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editPhone, setEditPhone] = useState("");

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

        // Load active announcements
        const activeAnn = await db.getAnnouncements();
        setAnnouncements(activeAnn);
        const lastViewed = localStorage.getItem("last_viewed_announcements_time") || "1970-01-01T00:00:00.000Z";
        setLastViewedTime(lastViewed);
        const unreadAnn = activeAnn.filter(a => new Date(a.createdAt).getTime() > new Date(lastViewed).getTime()).length;
        setUnreadAnnCount(unreadAnn);

        // Maintenance mode is handled via CMS context (no extra DB call needed)
      } catch {
        showNotification(t.failedLoadDashboard, "error");
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
    return { count: logs.length, points: totalPoints, mostPerformed: translateActivityName(mostPerformedAct) || "None" };
  }, [logs, activities, lang]);

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
      showNotification(t.selectActivityAlert, "error");
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
      const title = lang === "hi" ? "साधना प्रविष्टि सबमिट हुई 📝" : "Sadhana Log Submitted 📝";
      const message = lang === "hi"
        ? `आपने ${checkInDate} हेतु ${checkedActivities.length} नियम सबमिट किए (+${pointsCalculated} अंक)।`
        : `You checked in ${checkedActivities.length} vows for ${checkInDate} (+${pointsCalculated} claimed pts).`;
      await db.createNotification(profile.id, title, message, "submission_received");

      // Notify admins
      await db.createNotification(
        null,
        `New Submission: ${profile.fullName}`,
        `${profile.fullName} submitted logs for ${checkInDate} (${pointsCalculated} pts).`,
        "admin_new_submission"
      );

      // Scroll to status card
      setTimeout(() => {
        const el = document.getElementById("submission-status-card");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);

    } catch (err) {
      const msg = err.message?.includes("approved")
        ? (t.vowsLockedDesc || "This entry was approved by admin and cannot be modified.")
        : `${t.profileUpdateError}: ${err.message}`;
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
      showNotification(t.validPhoneAlert, "error");
      return;
    }
    const formattedPhone = trimmedPhone ? `+91${trimmedPhone}` : null;
    try {
      await db.updateDevoteeProfile(profile.id, { fullName: editName, city: editCity, avatar: editAvatar, phone: formattedPhone });
      await profileService.updateProfile(profile.id, { fullName: editName, city: editCity, avatar: editAvatar, phone: formattedPhone });
      await refreshProfile(profile.id);
      showNotification(`🌸 ${t.profileUpdateSuccess}`, "success");
    } catch (err) {
      if (err.message?.includes("unique_active_mobile") || err.code === "23505") {
        showNotification(t.phoneInUseAlert, "error");
      } else {
        showNotification(t.profileUpdateError, "error");
      }
    }
  };

  const triggerPrintReceipt = (donation) => {
    const templeName = cms.templeName || "Shree Labriya Jain Shwetambar Mandir";
    const trustName = (cms.accountHolder || templeName).toUpperCase() + " TRUST";
    const templeAddress = cms.templeAddress || "Mandir Marg, Labriya, Dhar, Madhya Pradesh - 454111";
    const taxDisclaimer = cms.taxDisclaimer || "All contributions are exempt under Section 80G of the Income Tax Act.";
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${t.receiptTitle} - ${trustName}</title>
      <style>body{font-family:Inter,sans-serif;color:#1F2937;padding:40px;line-height:1.6}.receipt-box{max-width:700px;margin:0 auto;border:1px solid #ECECEC;border-radius:12px;padding:40px;box-shadow:0 4px 12px rgba(0,0,0,.02)}.header{text-align:center;border-bottom:2px solid #EA580C;padding-bottom:20px;margin-bottom:30px}.header h1{font-size:24px;margin:0;color:#C28A3E}.header p{font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:5px 0 0;color:#6B7280}.title{text-align:center;font-size:18px;font-weight:700;text-decoration:underline;margin-bottom:30px}.details-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:40px}.detail-item{font-size:14px}.detail-item strong{display:block;color:#6B7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px}.amount-word{font-size:15px;font-weight:600;background:#FFF7ED;padding:15px;border-radius:6px;border:1px solid #FFE3C3;margin-bottom:40px}.footer-notes{font-size:11px;color:#6B7280;border-top:1px solid #ECECEC;padding-top:20px;text-align:center}.signatures{display:flex;justify-content:space-between;margin-top:50px;margin-bottom:30px}.sig-line{width:180px;border-top:1px solid #6B7280;text-align:center;font-size:12px;padding-top:5px}@media print{.no-print{display:none}body{padding:0}.receipt-box{border:none;box-shadow:none;padding:0}}</style>
      </head><body>
      <div class="no-print" style="max-width:700px;margin:0 auto 20px auto;text-align:right"><button onclick="window.print()" style="background:#EA580C;color:#fff;border:none;padding:10px 20px;font-weight:700;border-radius:6px;cursor:pointer">${t.printReceiptBtn}</button></div>
      <div class="receipt-box"><div class="header"><h1>${trustName}</h1><p>${templeAddress}</p></div>
      <div class="title">${t.receiptVoucherHeader}</div>
      <div class="details-grid">
      <div class="detail-item"><strong>${t.receiptNumber}</strong>#LAB-REC-${donation.id.toUpperCase()}</div>
      <div class="detail-item"><strong>${t.receiptDateTime}</strong>${new Date(donation.createdAt).toLocaleString()}</div>
      <div class="detail-item"><strong>${t.donorName}</strong>${donation.donorName}</div>
      <div class="detail-item"><strong>${t.contactNumber}</strong>+91 ${donation.phone}</div>
      <div class="detail-item"><strong>${t.transactionId}</strong>${donation.txnId}</div>
      <div class="detail-item"><strong>${t.donationStatus}</strong>${donation.verified ? t.verifiedAndCleared : t.pendingVerification}</div>
      </div>
      <div class="amount-word"><strong style="display:block;font-size:11px;text-transform:uppercase;color:#EA580C;margin-bottom:5px">${t.amountDonated}</strong>INR ${donation.amount.toLocaleString("en-IN")}.00</div>
      <div class="signatures"><div class="sig-line">${t.donorSignature}</div><div class="sig-line" style="color:#EA580C;font-weight:700"><span style="font-family:'Brush Script MT',cursive;font-size:20px;display:block;height:24px;margin-top:-15px">Trust Office</span>${t.authorizedSignatory}</div></div>
      <div class="footer-notes">Thank you for your generous contribution towards the ${cms.subtitle || "Chaturmas"} ${cms.chaturmasYear || ""} arrangements.<br>This is a computer-generated voucher and does not require a physical stamp.<br>${taxDisclaimer}</div>
      </div></body></html>`);
    printWindow.document.close();
  };

  // ── Maintenance Mode (from CMS context) ──
  if (cms.maintenanceMode && profile?.role !== "admin") {
    return (
      <div className="w-full min-h-screen bg-[#FCFBF7] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 bg-white border border-[#EA580C]/10 shadow-premium rounded-custom-lg text-center flex flex-col items-center gap-4">
          <span className="text-4xl animate-pulse">🛠️</span>
          <h2 className="font-display font-bold text-lg text-text-primary">{t.maintenanceActive}</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            {cms.templeName || "Shree Labriya Jain Shwetambar Mandir"} {t.maintenanceDesc}
          </p>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded bg-[#EA580C] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:bg-[#EA580C]/90"
          >
            {t.signOut}
          </button>
        </div>
      </div>
    );
  }

  // ── Skeleton Loader ──
  if (isLoading || !user || !profile) {
    return (
      <div className="w-full min-h-screen bg-[#FCFBF7] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="w-full bg-white border border-[#EA580C]/5 shadow-premium p-6 sm:p-8 rounded-custom-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 w-full">
              <SkeletonCard className="w-16 h-16 rounded-full" />
              <div className="flex flex-col gap-2 w-1/3">
                <SkeletonCard className="w-24 h-3.5" />
                <SkeletonCard className="w-44 h-5" />
                <SkeletonCard className="w-32 h-3" />
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <SkeletonCard className="w-24 h-11 rounded-custom-md" />
              <SkeletonCard className="w-24 h-11 rounded-custom-md" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              {[1,2,3,4,5].map(i => <SkeletonCard key={i} className="h-11 w-32 lg:w-full rounded-custom-md" />)}
            </div>
            <div className="lg:col-span-9 bg-white border border-[#EA580C]/5 shadow-premium p-6 sm:p-8 rounded-custom-lg">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} className="h-20 rounded-custom-md" />)}
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[1,2,3].map(i => <SkeletonCard key={i} className="h-14 rounded-custom-md" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalSubmissions = logs.length;
  const completionPercentage = Math.min(100, Math.round((totalSubmissions / 120) * 100));

  return (
    <div className="w-full min-h-screen bg-[#FCFBF7] pt-24 pb-16">
      
      {/* Dynamic Vow Registration Success Confetti Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        pointsEarned={successData.pointsEarned}
        totalPoints={successData.totalPoints}
        streak={successData.streak}
        date={successData.date}
        t={t}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* 1. SACRED WELCOME HEADER CARD */}
        <div className="w-full bg-white border border-[#EA580C]/5 shadow-premium p-6 sm:p-8 rounded-custom-lg mb-8 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-36 h-full bg-[#FFF7ED]/30 -skew-x-12 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center gap-5 w-full lg:w-auto text-center sm:text-left">
            <img
              src={profile.avatar || "/assets/avatars/avatar_female.png"}
              alt="Profile Avatar Preset"
              className="w-16 h-16 rounded-full object-cover border border-[#C28A3E]/20 bg-[#FCFBF7] shadow-sm select-none"
            />
            <div>
              <span className="text-[9.5px] uppercase tracking-widest font-bold text-[#C28A3E] px-2.5 py-0.5 rounded bg-[#FFF7ED] border border-[#EA580C]/10 select-none">
                {t.jaiJinendra} 🙏
              </span>
              <h1 className="font-display font-semibold text-text-primary text-xl sm:text-2xl mt-2 leading-tight">
                {profile.fullName}
              </h1>
              <p className="text-xs text-text-secondary mt-1 font-medium">
                📍 {profile.city}{profile.phone ? ` • +91 ${profile.phone}` : ""}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0 w-full lg:w-auto border-t lg:border-t-0 border-neutral-100 pt-4 lg:pt-0">
            
            <div className="flex items-center gap-3 bg-[#FCFBF7] px-4 py-2.5 rounded-custom-md border border-[#C28A3E]/10 select-none">
              <span className="text-xl">🪷</span>
              <div className="flex flex-col">
                <span className="text-[8px] text-text-secondary font-bold uppercase tracking-wider">{t.totalSadhana}</span>
                <span className="text-xs font-bold text-[#EA580C]">{profile.totalPoints || 0} {t.pts}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#FFF7ED] px-4 py-2.5 rounded-custom-md border border-[#EA580C]/10 select-none">
              <Flame size={18} className="text-[#EA580C]" />
              <div className="flex flex-col">
                <span className="text-[8px] text-text-secondary font-bold uppercase tracking-wider">{t.dayStreak}</span>
                <span className="text-xs font-bold text-[#EA580C]">{profile.streak || 0} {t.daysActive?.includes("दिन") ? "दिन" : "Days"}</span>
              </div>
            </div>

            {profilesList.length === 1 ? (
              <button 
                onClick={() => router.push("/profile-select")} 
                className="px-4 py-2.5 rounded-custom-md bg-white hover:bg-[#FCFBF7] text-text-secondary hover:text-[#EA580C] flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 border border-[#C28A3E]/10 shadow-sm cursor-pointer"
              >
                <UserPlus size={14} />
                <span>{t.addFamily}</span>
              </button>
            ) : (
              <button 
                onClick={() => router.push("/profile-select")} 
                className="px-4 py-2.5 rounded-custom-md bg-white hover:bg-[#FCFBF7] text-text-secondary hover:text-[#EA580C] flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 border border-[#C28A3E]/10 shadow-sm cursor-pointer"
              >
                <User size={14} />
                <span>{t.switchProfile}</span>
              </button>
            )}

            <button 
              onClick={handleLogout} 
              className="px-4 py-2.5 rounded-custom-md bg-neutral-50 hover:bg-red-50 text-text-secondary hover:text-red-600 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 border border-[#C28A3E]/10 shadow-sm cursor-pointer"
            >
              <LogOut size={14} />
              <span>{t.signOut}</span>
            </button>
          </div>
        </div>

        {/* 2. DYNAMIC ALERTS AND BANNERS */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`w-full p-4 mb-6 rounded-custom-md text-xs font-semibold flex items-center justify-between shadow-sm border text-left ${
                statusType === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-[#FFF7ED] text-[#EA580C] border-[#EA580C]/10"
              }`}
            >
              <span>{statusMessage}</span>
              <button 
                onClick={() => setStatusMessage("")} 
                className="text-[10px] uppercase font-bold shrink-0 ml-4 hover:opacity-75 cursor-pointer select-none"
              >
                {t.dismiss}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. TWO COLUMN PORTAL NAVIGATION LAYOUT */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Menu Panel */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-3 lg:pb-0 scrollbar-thin select-none">
            {[
              { id: "sadhana", label: t.dailyCheckIn, icon: CheckSquare },
              { id: "notices", label: t.templeNotices, icon: Megaphone, count: unreadAnnCount },
              { id: "badges", label: t.earnedBadges, icon: Award },
              { id: "history", label: t.historySummary, icon: History },
              ...(leaderboardEnabled ? [{ id: "leaderboard", label: t.inspiringLeaderboard, icon: Trophy }] : []),
              { id: "donations", label: t.taxReceipts80G, icon: Heart },
              { id: "profile", label: t.editProfileTab, icon: UserCheck },
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
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-custom-md text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap lg:w-full text-left border shadow-sm ${
                    isTabActive 
                      ? "bg-[#EA580C] text-white border-transparent" 
                      : "bg-white border-[#C28A3E]/10 text-text-secondary hover:text-[#EA580C] hover:border-[#EA580C]/25"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={14} />
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
            
            {/* Quote Block */}
            <div className="hidden lg:flex flex-col gap-2 p-5 rounded-custom-md bg-[#FFF7ED]/35 border border-[#C28A3E]/15 mt-4 text-left">
              <span className="text-xs">📚</span>
              <p className="text-[10px] text-[#4B5563] italic leading-relaxed">&quot;{quote}&quot;</p>
            </div>
          </div>

          {/* Right Panel Main Panel Content */}
          <div className="lg:col-span-9 bg-white border border-[#EA580C]/5 shadow-premium p-6 sm:p-8 rounded-custom-lg min-h-[500px]">
            
            {/* TAB CONTENT A: DAILY CHECK-IN */}
            {activeTab === "sadhana" && (
              <div className="flex flex-col gap-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#EA580C]/5 text-left">
                  <div>
                    <h3 className="font-display font-bold text-text-primary text-base">{t.dailySadhanaCheckIn}</h3>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">{t.submitVowsSubtitle}</p>
                  </div>
                  <div className="flex items-center gap-2 select-none">
                    <label htmlFor="check-in-date" className="text-[9.5px] uppercase font-bold text-text-secondary shrink-0">{t.targetDate}</label>
                    <input
                      id="check-in-date"
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded bg-[#FCFBF7] border border-[#EA580C]/10 focus:outline-none focus:border-[#EA580C]/40 text-text-primary font-semibold"
                    />
                  </div>
                </div>

                {/* Submitted lock banner */}
                {isViewingToday && isTodaySubmitted && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-custom-md bg-[#FCFBF7] border border-[#C28A3E]/20 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FFF7ED] flex items-center justify-center shrink-0 border border-[#EA580C]/10">
                        <Lock size={14} className="text-[#EA580C]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#EA580C]">{t.todayCheckinSubmitted}</p>
                        <p className="text-[9.5px] text-text-secondary mt-0.5">{t.vowsLockedContactAdmin}</p>
                      </div>
                    </div>
                    <StatusBadge status={todayStatus} t={t} />
                  </div>
                )}

                {/* Stats summary grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 select-none">
                  {[
                    { icon: "🔥", label: t.currentStreak, value: profile.streak || 0, suffix: lang === "hi" ? " दिन" : " Days", bg: "bg-[#FFF7ED]/35", border: "border-[#EA580C]/10" },
                    { icon: "🏆", label: t.longestStreak, value: profile.longestStreak || 0, suffix: lang === "hi" ? " दिन" : " Days", bg: "bg-[#FFF7ED]/35", border: "border-[#EA580C]/10" },
                    { icon: "🪷", label: t.totalPoints, value: profile.totalPoints || 0, suffix: ` ${t.pts}`, bg: "bg-[#FCFBF7]", border: "border-[#C28A3E]/10" },
                    { icon: "📝", label: t.totalSubmissions, value: totalSubmissions, suffix: lang === "hi" ? " दिन" : " Days", bg: "bg-white", border: "border-[#EA580C]/5" },
                    { icon: "⚡", label: t.completionRate, value: completionPercentage, suffix: "%", bg: "bg-white", border: "border-[#EA580C]/5" },
                    { icon: "📅", label: t.todayStatus, isStatus: true, status: isTodaySubmitted ? "submitted" : "pending", bg: isTodaySubmitted ? "bg-emerald-50/40" : "bg-white", border: isTodaySubmitted ? "border-emerald-500/10" : "border-[#EA580C]/5" }
                  ].map((stat, i) => (
                    <div key={i} className={`p-4 rounded-custom-md ${stat.bg} border ${stat.border} flex items-center gap-3 text-left`}>
                      <span className="text-xl">{stat.icon}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider truncate">{stat.label}</span>
                        {stat.isStatus ? (
                          <span className={`text-[9px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded border inline-block mt-0.5 w-fit ${
                            stat.status === "submitted" ? "bg-emerald-50 text-emerald-700 border-emerald-500/10" : "bg-orange-50 text-orange-700 border-orange-200"
                          }`}>
                            {stat.status === "submitted" ? t.statusSubmitted : t.statusPending}
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

                {/* Claim preview panel */}
                <div className="p-4 rounded bg-[#FCFBF7] border border-[#C28A3E]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left select-none">
                  <div>
                    <h4 className="text-xs font-bold text-[#EA580C]">{t.checkinPreview}</h4>
                    <p className="text-[9.5px] text-text-secondary">{t.checkinPreviewDesc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white border border-[#EA580C]/10 px-3 py-1.5 rounded font-bold text-xs text-[#EA580C] shrink-0 shadow-sm">
                    <TrendingUp size={12} />
                    <span>{t.earnToday}</span>
                    <span className="text-sm font-extrabold">{getTodayPointsPreview()} {t.points}</span>
                  </div>
                </div>

                {/* Vow checklist grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
                  {activities.map((act) => {
                    const isChecked = checkedActivities.includes(act.id);
                    return (
                      <div
                        key={act.id}
                        onClick={() => handleToggleActivity(act.id)}
                        className={`p-3.5 border rounded-custom-md flex items-center justify-between transition-all select-none ${
                          isLocked
                            ? isChecked
                              ? "bg-emerald-50/40 border-emerald-500/10 cursor-default opacity-85"
                              : "bg-white border-neutral-100 opacity-45 cursor-default"
                            : isChecked
                            ? "bg-[#FFF7ED]/55 border-[#EA580C] shadow-sm cursor-pointer"
                            : "bg-white border-[#EA580C]/5 hover:border-[#EA580C]/20 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            disabled={isLocked}
                            className="w-4 h-4 rounded text-[#EA580C] border-neutral-300 focus:ring-[#EA580C] cursor-pointer shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-[#1F2937]">{translateActivityName(act)}</span>
                            <span className="text-[9px] text-[#4B5563] mt-0.5">{translateCategory(act.category)}</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-[#EA580C] bg-white border border-[#EA580C]/10 px-2 py-0.5 rounded">+{act.points} {t.pts}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Locked Verification Timeline details (Stream 1 & 2) */}
                {isLocked && selectedDateLog && (
                  <div id="submission-status-card" className="p-6 rounded-custom-lg border border-[#EA580C]/15 bg-[#FCFBF7]/35 flex flex-col gap-5 text-left">
                    <div className="flex items-center gap-3 select-none">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text-primary">{t.logsRegistered}</h4>
                        <p className="text-[9px] text-text-secondary">{t.logsRegisteredDesc}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-custom-md border border-[#EA580C]/10 text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase font-bold text-text-secondary">{t.submissionId}</span>
                        <span className="font-mono font-bold text-text-primary">
                          {toReadableId(selectedDateLog.submissionId || selectedDateLog.id, "S")}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase font-bold text-text-secondary">{t.date}</span>
                        <span className="font-semibold text-text-primary">
                          {selectedDateLog.createdAt ? new Date(selectedDateLog.createdAt).toLocaleDateString() : checkInDate}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase font-bold text-text-secondary">{t.time}</span>
                        <span className="font-semibold text-text-primary">
                          {selectedDateLog.createdAt ? new Date(selectedDateLog.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "12:00 PM"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase font-bold text-text-secondary">{t.claimedPoints}</span>
                        <span className="font-extrabold text-[#EA580C]">
                          +{selectedDateLog.points || 0} {t.points}
                        </span>
                      </div>
                    </div>

                    {/* Status timeline visual details */}
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-500/10 rounded-custom-md select-none text-xs text-emerald-800">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>{t.scoreCreditedNotice}</span>
                    </div>

                    {selectedDateLog.adminNote && (
                      <div className={`p-4 rounded-custom-md border flex flex-col gap-1 ${
                        todayStatus === "Rejected" ? "bg-red-50 border-red-200/50 text-red-800" : "bg-green-50 border-green-200/50 text-green-800"
                      }`}>
                        <span className="text-[9px] uppercase font-bold">{t.adminRemarks}</span>
                        <p className="text-xs font-semibold">{selectedDateLog.adminNote}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Form submit triggers */}
                {!isLocked && (
                  <div className="flex justify-end pt-4 border-t border-neutral-100 mt-4 select-none">
                    <button
                      onClick={handleSaveSadhana}
                      disabled={isSubmitting}
                      className="px-8 py-3 rounded bg-[#EA580C] hover:bg-[#EA580C]/90 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <><Loader2 size={14} className="animate-spin" /><span>{t.saving}</span></>
                      ) : (
                        <><Save size={14} /><span>{t.submitDailyLogs}</span></>
                      )}
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* TAB CONTENT B: TEMPLE ANNOUNCEMENTS */}
            {activeTab === "notices" && (
              <div className="flex flex-col gap-6 text-left">
                <div className="pb-3 border-b border-[#EA580C]/5">
                  <h3 className="font-display font-semibold text-text-primary text-base">{t.templeAnnouncements}</h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">{t.templeAnnouncementsSub}</p>
                </div>

                {announcements.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {announcements.map((ann) => {
                      const isNew = new Date(ann.createdAt).getTime() > new Date(lastViewedTime).getTime();
                      return (
                        <div key={ann.id} className="p-5 rounded-custom-md border border-[#EA580C]/10 bg-[#FCFBF7]/35 flex flex-col gap-3 relative overflow-hidden">
                          {isNew && (
                            <span className="absolute top-0 right-0 bg-[#EA580C] text-white text-[7.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-bl select-none">
                              {t.newNotice}
                            </span>
                          )}
                          <div className="flex items-center justify-between gap-4 select-none">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-[#1F2937] text-xs sm:text-sm">{ann.title}</h4>
                              <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                ann.priority === "high"
                                  ? "bg-red-50 text-red-600 border-red-500/10"
                                  : ann.priority === "low"
                                  ? "bg-blue-50 text-blue-600 border-blue-500/10"
                                  : "bg-orange-50 text-primary border-primary/10"
                              }`}>
                                {ann.priority === "high" ? t.highPriority : ann.priority === "low" ? t.lowPriority : t.mediumPriority}
                              </span>
                              {ann.pinned && (
                                <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-amber-50 text-amber-600 border-amber-500/10 flex items-center gap-1">
                                  📌 {t.pinned}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-text-secondary font-medium">
                              {new Date(ann.createdAt).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN")}
                            </span>
                          </div>
                          <div 
                            className="text-xs text-[#4B5563] leading-relaxed whitespace-pre-line"
                            dangerouslySetInnerHTML={{ __html: sanitizeHTML(ann.content) }}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 border border-dashed border-[#C28A3E]/20 rounded-custom-md bg-[#FCFBF7]/10 select-none">
                    <span className="text-3xl">🪷</span>
                    <p className="text-xs text-text-secondary mt-2">{t.noAnnouncementsDesc}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT C: DIGITAL BADGES */}
            {activeTab === "badges" && (
              <div className="flex flex-col gap-6 text-left">
                <div className="pb-3 border-b border-[#EA580C]/5">
                  <h3 className="font-display font-semibold text-text-primary text-base">{t.devotionalAchievements}</h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">{t.milestoneBadgesSub}</p>
                </div>
                
                {unlockedBadges.length === 0 && (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 border border-dashed border-[#C28A3E]/20 rounded-custom-md select-none bg-[#FCFBF7]/10">
                    <span className="text-4xl">🏅</span>
                    <p className="text-sm font-semibold text-[#4B5563]">{t.noBadgesYet}</p>
                    <p className="text-xs text-text-secondary text-center max-w-xs leading-relaxed">{t.noBadgesDesc}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Object.entries(BADGES_DEFINITIONS).map(([badgeId, val]) => {
                    const isUnlocked = unlockedBadges.includes(badgeId);
                    const name = lang === "hi" ? val.nameHi : val.nameEn;
                    const desc = lang === "hi" ? val.descHi : val.descEn;
                    return (
                      <div key={badgeId} className={`p-5 rounded-custom-lg border text-center flex flex-col items-center justify-center gap-3 transition-all select-none ${
                        isUnlocked 
                          ? "bg-white border-[#EA580C] shadow-sm ring-1 ring-[#EA580C]/10" 
                          : "bg-neutral-50/50 border-neutral-100 opacity-40"
                      }`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm border ${
                          isUnlocked ? "bg-[#FFF7ED] text-[#EA580C] border-[#EA580C]/10" : "bg-neutral-200"
                        }`}>
                          {val.icon}
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold ${isUnlocked ? "text-text-primary" : "text-text-secondary"}`}>{name}</h4>
                          <p className="text-[9px] text-text-secondary mt-1 leading-normal">{desc}</p>
                        </div>
                        {isUnlocked ? (
                          <span className="text-[8.5px] uppercase tracking-wider font-extrabold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded border border-[#EA580C]/10">{t.unlocked}</span>
                        ) : (
                          <span className="text-[8.5px] uppercase tracking-wider font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">{t.locked}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT D: HISTORY LOGS */}
            {activeTab === "history" && (
              <div className="flex flex-col gap-6 text-left">
                <div className="pb-3 border-b border-[#EA580C]/5">
                  <h3 className="font-display font-semibold text-text-primary text-base">{t.spiritualLogsMetrics}</h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">{t.historySub}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 select-none">
                  {[
                    { icon: "📅", label: t.daysActive, value: `${monthlySummary.count} ${lang === "hi" ? "दिन" : "Days"}` },
                    { icon: "🔥", label: t.mostPerformed, value: monthlySummary.mostPerformed },
                    { icon: "🏅", label: t.monthlyPoints, value: `${monthlySummary.points} ${t.pts}` }
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-custom-md bg-[#FCFBF7] border border-[#C28A3E]/10 flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">{item.label}</span>
                        <span className="text-xs font-bold text-[#EA580C] truncate">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="w-full mt-4 overflow-hidden border border-[#EA580C]/10 rounded-custom-lg bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#FCFBF7] border-b border-[#EA580C]/10 text-[9.5px] text-[#C28A3E] font-bold uppercase tracking-widest select-none">
                          <th className="p-4">{t.tableDate}</th>
                          <th className="p-4">{t.activitiesCompleted}</th>
                          <th className="p-4 text-center">{t.status}</th>
                          <th className="p-4 text-right">{t.pointsHeader}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.length > 0 ? (
                          logs.map((log) => (
                            <tr key={log.id} className="border-b border-neutral-100 hover:bg-[#FCFBF7]/35 transition-colors">
                              <td className="p-4 font-semibold text-text-primary whitespace-nowrap">{log.dateStr}</td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {log.activities.map((actId) => {
                                    const actObj = activities.find(a => a.id === actId);
                                    const name = translateActivityName(actObj) || actId;
                                    return (
                                      <span key={actId} className="px-2 py-0.5 rounded bg-white text-text-secondary text-[9.5px] font-medium border border-[#C28A3E]/10">
                                        {name}
                                      </span>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="p-4 text-center"><StatusBadge status={log.status || "Pending"} t={t} /></td>
                              <td className="p-4 text-right font-extrabold text-[#EA580C]">+{log.points} {t.pts}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-12 text-center">
                              <div className="flex flex-col items-center gap-3 select-none">
                                <span className="text-4xl">📋</span>
                                <p className="text-sm font-semibold text-[#4B5563]">{t.noLogsSubmitted}</p>
                                <p className="text-xs text-text-secondary">{t.noLogsSubmittedDesc}</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT E: LEADERBOARD BOARD */}
            {activeTab === "leaderboard" && leaderboardEnabled && (
              <div className="flex flex-col gap-6 text-left">
                <div className="pb-3 border-b border-[#EA580C]/5">
                  <h3 className="font-display font-semibold text-text-primary text-base">{t.participantInspiration}</h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">{t.leaderboardSub}</p>
                </div>
                
                <div className="p-4 rounded-custom-md bg-[#FCFBF7] border border-[#C28A3E]/10 text-xs text-text-secondary leading-relaxed flex items-start gap-2.5 select-none">
                  <Compass size={16} className="text-[#EA580C] shrink-0 mt-0.5" />
                  <span>{t.leaderboardDisclaimer}</span>
                </div>

                {leaderboard.length === 0 ? (
                  <div className="py-10 flex flex-col items-center gap-3 select-none">
                    <span className="text-4xl">🏆</span>
                    <p className="text-sm font-semibold text-text-secondary">{t.leaderboardEmpty}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3.5 mt-2">
                    {leaderboard.map((item, index) => {
                      const isCurrentUser = item.id === profile.id;
                      const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";
                      return (
                        <div 
                          key={item.id} 
                          className={`p-4 border rounded-custom-md flex items-center justify-between gap-4 transition-colors ${
                            isCurrentUser 
                              ? "bg-[#FFF7ED]/55 border-[#EA580C] shadow-sm" 
                              : "bg-white border-[#EA580C]/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-center font-bold text-xs text-text-secondary shrink-0 select-none">
                              {medal || `${index + 1}`}
                            </span>
                            <img 
                              src={item.avatar || "/assets/avatars/avatar_male.png"} 
                              alt={item.fullName} 
                              className="w-10 h-10 rounded-full object-cover shrink-0 border border-neutral-100 select-none" 
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                                {item.fullName}
                                {isCurrentUser && (
                                  <span className="text-[8px] uppercase tracking-wider font-extrabold bg-[#EA580C] text-white px-2 py-0.5 rounded select-none">
                                    {t.youTag}
                                  </span>
                                )}
                              </span>
                              <span className="text-[9.5px] text-text-secondary mt-0.5">{item.city} • 🔥 {item.streak || 0} {t.dayStreak}</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#EA580C] bg-[#FFF7ED] px-3.5 py-1 rounded-full border border-[#EA580C]/10 shrink-0 select-none">
                            {item.totalPoints} {t.points}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT F: DONATIONS 80G RECEIPTS */}
            {activeTab === "donations" && (
              <div className="flex flex-col gap-6 text-left">
                <div className="flex items-center gap-3 pb-3 border-b border-[#EA580C]/5">
                  <Heart size={18} className="text-[#EA580C]" />
                  <div>
                    <h2 className="font-display font-semibold text-text-primary text-base">{t.yourDonationReceipts}</h2>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">{t.download80GSub}</p>
                  </div>
                </div>

                {donations.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {donations.map((donation) => (
                      <div key={donation.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-custom-md bg-[#FCFBF7] border border-[#EA580C]/10 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/10 shadow-sm">
                            <FileCheck size={18} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-text-primary">INR {donation.amount.toLocaleString("en-IN")}.00</span>
                              <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border select-none ${
                                donation.verified ? "bg-emerald-50 text-emerald-700 border-emerald-500/10" : "bg-amber-50 text-amber-700 border-amber-500/10"
                              }`}>
                                {donation.verified ? t.verified : t.pending}
                              </span>
                            </div>
                            <p className="text-[10px] text-text-secondary mt-1">{t.txnIdLabel} {donation.txnId} • {new Date(donation.createdAt).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN")}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => triggerPrintReceipt(donation)} 
                          className="px-4 py-2.5 rounded-custom-md bg-white border border-[#C28A3E]/20 hover:border-[#EA580C]/40 text-[#C28A3E] hover:text-[#EA580C] text-xs font-bold uppercase tracking-wider shadow flex items-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto justify-center"
                        >
                          <Download size={14} />
                          <span>{t.print80GReceipt}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-[#C28A3E]/20 rounded-custom-md flex flex-col items-center justify-center gap-3 select-none bg-[#FCFBF7]/10">
                    <span className="text-4xl">💝</span>
                    <div>
                      <p className="text-sm text-text-primary font-semibold">{t.noDonationsUnder} {profile.phone || profile.mobile || user.phone || "your account"}</p>
                      <p className="text-xs text-text-secondary max-w-sm mt-1.5 leading-relaxed">{t.noDonationsDesc}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT G: EDIT PROFILE SETTINGS */}
            {activeTab === "profile" && (
              <div className="flex flex-col gap-6 text-left">
                <div className="pb-3 border-b border-[#EA580C]/5">
                  <h3 className="font-display font-semibold text-text-primary text-base">{t.editDevoteeProfileTitle}</h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">{t.editProfileSub}</p>
                </div>
                
                <form onSubmit={handleUpdateProfile} className="p-5 sm:p-6 rounded-custom-lg bg-[#FCFBF7]/40 border border-[#EA580C]/10 flex flex-col gap-4 max-w-xl shadow-sm">
                  
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-name" className="text-[9.5px] text-text-secondary uppercase font-bold">{t.fullNameLabel}</label>
                    <input 
                      id="edit-name"
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      required 
                      className="px-3 py-2.5 text-xs sm:text-sm rounded bg-white border border-[#EA580C]/10 focus:outline-none focus:border-[#EA580C]/40 text-text-primary font-semibold" 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-city" className="text-[9.5px] text-text-secondary uppercase font-bold">{t.cityResidenceLabel}</label>
                    <input 
                      id="edit-city"
                      type="text" 
                      value={editCity} 
                      onChange={(e) => setEditCity(e.target.value)} 
                      required 
                      className="px-3 py-2.5 text-xs sm:text-sm rounded bg-white border border-[#EA580C]/10 focus:outline-none focus:border-[#EA580C]/40 text-text-primary font-semibold" 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-phone" className="text-[9.5px] text-text-secondary uppercase font-bold">{t.mobileNumberOptional}</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs text-text-secondary font-bold select-none">+91</span>
                      <input 
                        id="edit-phone"
                        type="tel" 
                        maxLength={10} 
                        value={editPhone} 
                        onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ""))} 
                        className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded bg-white border border-[#EA580C]/10 focus:outline-none focus:border-[#EA580C]/40 text-text-primary font-semibold" 
                        placeholder={t.tenDigitPlaceholder} 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="edit-avatar" className="text-[9.5px] text-text-secondary uppercase font-bold">{t.avatarImageUrl}</label>
                    <input 
                      id="edit-avatar"
                      type="text" 
                      value={editAvatar} 
                      onChange={(e) => setEditAvatar(e.target.value)} 
                      placeholder="https://..." 
                      className="px-3 py-2.5 text-xs sm:text-sm rounded bg-white border border-[#EA580C]/10 focus:outline-none focus:border-[#EA580C]/40 text-text-primary font-semibold" 
                    />
                    
                    <div className="flex items-center gap-3.5 mt-2.5 bg-white p-3.5 rounded border border-[#EA580C]/10 select-none">
                      <span className="text-[9px] uppercase font-bold text-text-secondary shrink-0">{t.presetsLabel}</span>
                      <div className="flex gap-2.5">
                        {[
                          { label: t.femaleAvatar, url: "/assets/avatars/avatar_female.png" },
                          { label: t.maleAvatar, url: "/assets/avatars/avatar_male.png" }
                        ].map((preset, idx) => (
                          <img 
                            key={idx} 
                            src={preset.url} 
                            alt={preset.label} 
                            title={preset.label}
                            onClick={() => setEditAvatar(preset.url)} 
                            className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 transition-all ${
                              editAvatar === preset.url ? "border-[#EA580C] scale-110 shadow-sm" : "border-transparent hover:border-[#EA580C]/40"
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="px-6 py-2.5 rounded bg-[#EA580C] hover:bg-[#EA580C]/90 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-1.5 w-fit cursor-pointer ml-auto mt-2 select-none"
                  >
                    <Save size={14} />
                    <span>{t.updateProfileBtn}</span>
                  </button>

                </form>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

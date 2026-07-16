"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Clock, 
  Megaphone, 
  Calendar as CalendarIcon, 
  Heart, 
  CalendarDays,
  Plus, 
  Trash2, 
  Check, 
  Save, 
  LogOut,
  Award,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Settings as SettingsIcon,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/services/db";
import { useAuth } from "@/context/AuthContext";
import { translations } from "@/services/translations";
import { useCMS } from "@/context/CMSContext";
const toReadableId = (uuid = "", prefix = "ID", padLen = 4) => {
  if (!uuid) return `${prefix}-0000`;
  const num = parseInt(uuid.replace(/-/g, "").slice(-6), 16) % 10000;
  return `${prefix}-${String(num).padStart(padLen, "0")}`;
};

export default function Admin() {
  const router = useRouter();
  const { user, profile, loading, isAdmin, logout } = useAuth();
  const { refreshCMS } = useCMS();
  
  const [lang, setLang] = useState("en");
  const [activeTab, setActiveTab] = useState("analytics");
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success"); // success, error

  // Live Database States
  const [analytics, setAnalytics] = useState({
    devoteesCount: 0,
    totalPoints: 0,
    logsCount: 0,
    approvedLogsCount: 0,
    totalDonations: 0,
    verifiedDonations: 0
  });
  const [schedules, setSchedules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [donations, setDonations] = useState([]);
  const [sadhanaActivities, setSadhanaActivities] = useState([]);
  const [leaderboardToggle, setLeaderboardToggle] = useState(false);
  const [sadhanaReports, setSadhanaReports] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [templeSettings, setTempleSettings] = useState({
    templeName: "",
    upiId: "",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    contactNumber: "",
    templeAddress: "",
    facebook: "",
    instagram: "",
    youtube: "",
    website: ""
  });

  // Target Filters/Searches
  const [profileSearch, setProfileSearch] = useState("");
  const [logStatusFilter, setLogStatusFilter] = useState("Pending");
  const [donationSearch, setDonationSearch] = useState("");

  // Expanded operational stats & popovers states
  const [unreadAdminNotifsCount, setUnreadAdminNotifsCount] = useState(0);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [showAdminNotifMenu, setShowAdminNotifMenu] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  // Expanded Approvals Detail states
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [logRemarks, setLogRemarks] = useState({});
  const [logPoints, setLogPoints] = useState({});

  // Devotee details timeline subview states
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [selectedProfileDetail, setSelectedProfileDetail] = useState(null);
  const [adminNotesText, setAdminNotesText] = useState("");
  const [profileLogs, setProfileLogs] = useState([]);
  const [profileDonations, setProfileDonations] = useState([]);

  // Devotees sorting advanced filter state
  const [devoteeFilters, setDevoteeFilters] = useState({ sortBy: "points_desc" });

  // Create Form states
  const [newSched, setNewSched] = useState({ time: "", activity: "", session: "Morning", orderNum: 10 });
  const [newAnn, setNewAnn] = useState({ title: "", content: "", type: "program", active: true });
  const [newEvent, setNewEvent] = useState({ title: "", description: "", date: "", location: "", imageUrl: "" });
  const [panchangDate, setPanchangDate] = useState(() => {
    const local = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  });
  const [panchangVal, setPanchangVal] = useState({ tithi: "", month: "", paksha: "Shukla", sunrise: "06:00 AM", sunset: "07:00 PM", shubh_din: false, samayik: false, event: "" });
  const [newSadhanaAct, setNewSadhanaAct] = useState({ name: "", points: 5, category: "Devotion" });
  
  // Confirmation states
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [annToDelete, setAnnToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync Language
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

  // Secure Route Clearance
  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin || !profile) {
        router.push("/login");
        return;
      }
      refreshData();
    }
  }, [loading, user, isAdmin, profile, router]);

  // Fetch Panchang details on date shifts
  useEffect(() => {
    if (user && isAdmin) {
      const fetchPanchangForDate = async () => {
        try {
          const data = await db.getPanchang(panchangDate);
          setPanchangVal({
            tithi: data.tithi || "",
            month: data.month || "Chatra",
            paksha: data.paksha || "Shukla",
            sunrise: data.sunrise || "06:00 AM",
            sunset: data.sunset || "07:00 PM",
            shubh_din: !!data.shubh_din,
            samayik: !!data.samayik,
            event: data.event || ""
          });
        } catch (e) {
          console.error("Panchang load failed", e);
        }
      };
      fetchPanchangForDate();
    }
  }, [panchangDate, user, isAdmin]);

  const showNotification = (msg, type = "success") => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => setStatusMessage(""), 5000);
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Enhanced Analytics
      const stats = await db.getAdminAnalyticsEnhanced();
      setAnalytics(stats);

      // 2. Fetch Schedules
      const schedData = await db.getSchedules();
      setSchedules(schedData);

      // 3. Fetch Announcements
      const annData = await db.getAnnouncements();
      setAnnouncements(annData);

      // 4. Fetch Events
      const eventsData = await db.getEvents();
      setEvents(eventsData);

      // 5. Fetch Donations
      const donationsData = await db.getDonations();
      setDonations(donationsData);

      // 6. Fetch Sadhana Activities
      const activitiesList = await db.getSadhanaActivities();
      setSadhanaActivities(activitiesList);

      // 7. Fetch Leaderboard status
      const lbToggle = await db.isLeaderboardEnabled();
      setLeaderboardToggle(lbToggle);

      // 8. Fetch Sadhana Reports
      const reportsList = await db.getAdminSadhanaReports();
      setSadhanaReports(reportsList);

      // 9. Fetch Devotee Accounts
      const profilesList = await db.getAllProfiles();
      setAllProfiles(profilesList);

      // 10. Fetch Devotee Check-in logs
      const logsList = await db.getLogsAdmin(logStatusFilter);
      setAdminLogs(logsList);

      // 11. Fetch Settings
      const settingsData = await db.getSettings();
      setTempleSettings(settingsData);

      // 12. Fetch Admin Notifications & Audit Logs
      const notifs = await db.getNotifications(profile.id);
      setAdminNotifications(notifs);
      setUnreadAdminNotifsCount(notifs.filter(n => !n.read).length);

      const audits = await db.getAuditLogs();
      setAuditLogs(audits);

      // 13. If devotee details sub-view is selected, reload their info
      if (selectedProfileId) {
        const detail = await db.getDevoteeProfile(selectedProfileId);
        setSelectedProfileDetail(detail);
        setAdminNotesText(detail.adminNotes || detail.admin_notes || "");
        const pLogs = await db.getSadhanaLogs(selectedProfileId);
        setProfileLogs(pLogs);
        setProfileDonations(donationsData.filter(d => d.profileId === selectedProfileId || d.phone === detail.phone));
      }
    } catch (e) {
      console.error(e);
      showNotification("Failed to reload data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Reload logs specifically when approvals status filter changes
  const reloadLogsOnly = async (status) => {
    try {
      const logsList = await db.getLogsAdmin(status);
      setAdminLogs(logsList);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Admin logout failed:", err.message);
    }
  };

  // --- CRUD: Worship Schedules ---
  const handleScheduleUpdate = async (id, field, value) => {
    try {
      const updates = { [field]: value };
      const updated = await db.updateSchedule(id, updates);
      setSchedules(prev => prev.map(s => s.id === id ? updated : s));
      showNotification("Schedule item updated.");
    } catch (err) {
      console.error(err);
      showNotification("Failed to update schedule.", "error");
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!newSched.time || !newSched.activity) return;
    try {
      const added = await db.createSchedule(newSched);
      setSchedules(prev => [...prev, added].sort((a, b) => a.orderNum - b.orderNum));
      setNewSched({ time: "", activity: "", session: "Morning", orderNum: 10 });
      showNotification("Schedule item created successfully.");
    } catch (err) {
      console.error(err);
      showNotification("Failed to create schedule item.", "error");
    }
  };

  const handleDeleteScheduleConfirm = async () => {
    if (!scheduleToDelete) return;
    setIsDeleting(true);
    try {
      await db.deleteSchedule(scheduleToDelete.id);
      setSchedules(prev => prev.filter(s => s.id !== scheduleToDelete.id));
      setScheduleToDelete(null);
      showNotification("Schedule item deleted successfully.");
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete schedule item.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- CRUD: Announcements Notices ---
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnn.title || !newAnn.content) return;
    try {
      const added = await db.createAnnouncement(newAnn);
      setAnnouncements(prev => [added, ...prev]);
      setNewAnn({ title: "", content: "", type: "program", active: true });
      showNotification("Notice announced successfully.");
    } catch (err) {
      console.error(err);
      showNotification("Failed to create announcement.", "error");
    }
  };

  const handleDeleteAnnConfirm = async () => {
    if (!annToDelete) return;
    setIsDeleting(true);
    try {
      await db.deleteAnnouncement(annToDelete.id);
      setAnnouncements(prev => prev.filter(a => a.id !== annToDelete.id));
      setAnnToDelete(null);
      showNotification("Announcement de-activated.");
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete announcement.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- CRUD: Panchang ---
  const handleSavePanchang = async () => {
    try {
      await db.updatePanchang(panchangDate, panchangVal);
      showNotification(`Panchang configurations updated for ${panchangDate}`);
    } catch (err) {
      console.error(err);
      showNotification("Failed to save panchang.", "error");
    }
  };

  // --- CRUD: Events ---
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    try {
      const added = await db.addEvent(newEvent);
      setEvents(prev => [...prev, added]);
      setNewEvent({ title: "", description: "", date: "", location: "", imageUrl: "" });
      showNotification("Spiritual event created successfully.");
    } catch (err) {
      console.error(err);
      showNotification("Failed to add event.", "error");
    }
  };

  // --- CRUD: Donations Receipts ---
  const handleApproveDonation = async (id) => {
    try {
      const updated = await db.verifyDonation(id, true);
      setDonations(prev => prev.map(d => d.id === id ? updated : d));
      showNotification("Donation receipt verified successfully.");
    } catch (err) {
      console.error(err);
      showNotification("Failed to verify donation.", "error");
    }
  };

  // --- CRUD: Sadhana Configs ---
  const handleToggleLeaderboardState = async () => {
    try {
      const nextVal = !leaderboardToggle;
      await db.setLeaderboardEnabled(nextVal);
      setLeaderboardToggle(nextVal);
      showNotification(nextVal ? "Inspiring leaderboard enabled." : "Leaderboard disabled.");
    } catch (e) {
      showNotification("Failed to toggle leaderboard settings.", "error");
    }
  };

  const handleUpdateSadhanaPointVal = async (id, points) => {
    try {
      const list = sadhanaActivities.map(act => act.id === id ? { ...act, points: parseInt(points) || 0 } : act);
      await db.updateSadhanaActivities(list);
      setSadhanaActivities(list);
      showNotification("Points values updated.");
    } catch (e) {
      showNotification("Failed to update points weight.", "error");
    }
  };

  const handleCreateSadhanaActivity = async (e) => {
    e.preventDefault();
    if (!newSadhanaAct.name) return;
    try {
      const newAct = {
        id: "act_" + Math.random().toString(36).substr(2, 9),
        name: newSadhanaAct.name,
        points: parseInt(newSadhanaAct.points) || 0,
        category: newSadhanaAct.category
      };
      const list = [...sadhanaActivities, newAct];
      await db.updateSadhanaActivities(list);
      setSadhanaActivities(list);
      setNewSadhanaAct({ name: "", points: 5, category: "Devotion" });
      showNotification("Sadhana vow activity created.");
    } catch (e) {
      showNotification("Failed to create activity.", "error");
    }
  };

  const handleDeleteSadhanaActivity = async (id) => {
    try {
      const list = sadhanaActivities.filter(act => act.id !== id);
      await db.updateSadhanaActivities(list);
      setSadhanaActivities(list);
      showNotification("Sadhana vow activity deleted.");
    } catch (e) {
      showNotification("Failed to delete activity.", "error");
    }
  };

  const handleExportSadhanaReports = () => {
    let csvContent = "data:text/csv;charset=utf-8,Name,Phone,City,Total Points,Current Streak,Longest Streak\n";
    sadhanaReports.forEach(r => {
      csvContent += `"${r.fullName}","${r.phone || ""}","${r.city}",${r.totalPoints || 0},${r.streak || 0},${r.longestStreak || 0}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Jain_Sadhana_Devotee_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFamiliesCSV = () => {
    const map = {};
    allProfiles.forEach(p => {
      if (!map[p.userId]) {
        map[p.userId] = { userId: p.userId, members: [] };
      }
      map[p.userId].members.push(p);
    });
    
    let csvContent = "data:text/csv;charset=utf-8,Family ID,Member ID,Name,Phone,City,Points,Streak,Registration Date\n";
    Object.values(map).forEach(fam => {
      const familyReadableId = toReadableId(fam.userId, "F");
      fam.members.forEach(m => {
        const memberReadableId = toReadableId(m.id, "M");
        const regDate = m.createdAt || m.created_at ? new Date(m.createdAt || m.created_at).toLocaleDateString() : "";
        csvContent += `"${familyReadableId}","${memberReadableId}","${m.fullName}","${m.phone || ""}","${m.city}",${m.totalPoints || 0},${m.streak || 0},"${regDate}"\n`;
      });
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `Devotee_Families_Report_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Devotee families report CSV exported!");
  };

  const handleSelectDevoteeProfile = async (profileId) => {
    setSelectedProfileId(profileId);
    try {
      const detail = await db.getDevoteeProfile(profileId);
      setSelectedProfileDetail(detail);
      setAdminNotesText(detail.adminNotes || detail.admin_notes || "");
      const pLogs = await db.getSadhanaLogs(profileId);
      setProfileLogs(pLogs);
      const allDons = await db.getDonations();
      setProfileDonations(allDons.filter(d => d.profileId === profileId || d.phone === detail.phone));
    } catch (e) {
      console.error(e);
      showNotification("Failed to load devotee detailed timeline profile.", "error");
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedProfileId) return;
    try {
      await db.updateProfileNotes(selectedProfileId, adminNotesText);
      await db.createAuditLog(
        profile.id,
        profile.fullName,
        "UPDATE_DEVOTEE_NOTES",
        selectedProfileId,
        `Updated devotee admin notes remarks: "${adminNotesText.substring(0, 45)}..."`
      );
      showNotification("Devotee profile notes remarks updated successfully.");
      refreshData();
    } catch (e) {
      console.error(e);
      showNotification("Failed to update devotee admin remarks.", "error");
    }
  };

  const handleMarkAdminNotifRead = async (notifId) => {
    try {
      await db.markNotificationRead(notifId);
      setAdminNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
      setUnreadAdminNotifsCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleBackupRestoreUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const payload = JSON.parse(event.target.result);
        const ok = await db.restoreSystemBackup(payload);
        if (ok) {
          await db.createAuditLog(
            profile.id,
            profile.fullName,
            "DATABASE_RESTORE",
            "system",
            "Restored database backup JSON file"
          );
          showNotification("Database backups restored successfully.");
          refreshData();
        } else {
          showNotification("Database restoration failed. Verify file schema.", "error");
        }
      } catch (err) {
        console.error(err);
        showNotification("Failed to parse JSON file structure.", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadBackup = async () => {
    try {
      const backupObj = await db.downloadSystemBackup();
      const str = JSON.stringify(backupObj, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(str);
      const link = document.createElement("a");
      link.href = dataUri;
      link.download = `Labriya_Chaturmas_Database_Backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification("Database JSON backup downloaded!");
    } catch (e) {
      console.error(e);
      showNotification("Failed to download database backup.", "error");
    }
  };

  // --- CRUD: Devotee Profiles Admin ---
  const handleDeleteProfileConfirm = async () => {
    if (!profileToDelete) return;
    setIsDeleting(true);
    try {
      await db.deleteProfileAdmin(profileToDelete.id);
      setAllProfiles(prev => prev.filter(p => p.id !== profileToDelete.id));
      setProfileToDelete(null);
      showNotification("Devotee account profile deleted.");
    } catch (e) {
      console.error(e);
      showNotification("Failed to delete profile.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- CRUD: Approvals & Logs ---
  const handleUpdateLogStatus = async (id, status) => {
    try {
      await db.updateLogStatus(id, status);
      setAdminLogs(prev => prev.filter(l => l.id !== id));
      showNotification(`Daily check-in log updated to ${status}.`);
    } catch (e) {
      console.error(e);
      showNotification("Failed to update log status.", "error");
    }
  };

  const handleApproveAllPending = async () => {
    try {
      await db.approveAllPendingLogs();
      setAdminLogs([]);
      showNotification("Approved all pending check-in entries.");
    } catch (e) {
      console.error(e);
      showNotification("Failed to approve check-ins.", "error");
    }
  };

  // --- CRUD: Settings Console ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await db.updateSettings(templeSettings);
      await refreshCMS();
      showNotification("Temple console settings updated successfully.");
    } catch (e) {
      console.error(e);
      showNotification("Failed to update settings.", "error");
    }
  };

  const handleImageUpload = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempleSettings(prev => ({ ...prev, [key]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const t = translations[lang] || translations["en"];

  if (loading || !profile || !isAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-bg-custom">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping duration-1000" />
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="absolute text-[10px]">🪷</span>
          </div>
          <p className="text-xs text-text-secondary">Authenticating secure panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 min-h-[90vh]">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border-custom mb-8">
        <div>
          <span className="px-2.5 py-1 rounded bg-accent/15 text-accent font-bold text-[9px] uppercase tracking-wider border border-accent/25 select-none">
            Secure Admin Console
          </span>
          <h2 className="font-display font-semibold text-text-primary text-xl mt-3">
            Temple Management System
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Logged in as: <strong className="text-text-primary">{profile.fullName}</strong> (System Admin)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Bell Icon / Notification Center Popover */}
          <div className="relative">
            <button
              onClick={() => setShowAdminNotifMenu(!showAdminNotifMenu)}
              className="p-2.5 rounded-custom-md bg-white text-text-secondary hover:text-primary transition-all cursor-pointer border border-border-custom relative flex items-center justify-center shrink-0"
              title="Admin Notifications"
            >
              <Bell size={14} />
              {unreadAdminNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center animate-pulse">
                  {unreadAdminNotifsCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showAdminNotifMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowAdminNotifMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-white border border-border-custom rounded-custom-md shadow-premium z-40 p-3 flex flex-col gap-2 max-h-80 overflow-y-auto"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                      <span className="text-[10px] font-bold uppercase text-text-primary">Notifications</span>
                      {unreadAdminNotifsCount > 0 && (
                        <button
                          onClick={async () => {
                            for (const n of adminNotifications) {
                              if (!n.read) await handleMarkAdminNotifRead(n.id);
                            }
                          }}
                          className="text-[8px] font-extrabold uppercase text-primary cursor-pointer hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {adminNotifications.length === 0 ? (
                      <p className="text-[10px] text-text-secondary italic text-center py-4">No notifications yet</p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {adminNotifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkAdminNotifRead(n.id)}
                            className={`p-2 rounded text-[10px] cursor-pointer transition-colors border ${
                              n.read ? "bg-neutral-50/50 text-text-secondary border-transparent" : "bg-amber-50/20 text-text-primary border-amber-200 border-l-2 border-l-amber-500"
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

          <button 
            onClick={handleLogout}
            className="px-4 py-2 rounded-custom-md bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer w-fit"
          >
            <LogOut size={14} />
            <span>Exit Panel</span>
          </button>
        </div>
      </div>

      {/* Message Notifications Banner */}
      {statusMessage && (
        <div className={`w-full p-4 mb-6 rounded-custom-md border text-xs font-semibold flex items-center justify-between shadow-premium select-none ${
          statusType === "success" 
            ? "bg-green-50 text-green-700 border-green-500/10" 
            : "bg-red-50 text-red-600 border-red-500/10"
        }`}>
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage("")} className="text-xs uppercase font-bold shrink-0">Dismiss</button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Sidebar Tabs */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0 scrollbar-thin select-none">
          {[
            { id: "analytics", label: "Analytics Dashboard", icon: TrendingUp },
            { id: "approvals", label: "Check-in Approvals", icon: CheckCircle2 },
            { id: "profiles", label: "Devotee Accounts", icon: User },
            { id: "schedules", label: "Worship Timetable", icon: Clock },
            { id: "announcements", label: "Notices & Notices", icon: Megaphone },
            { id: "panchang", label: "Panchang Calendar", icon: CalendarIcon },
            { id: "events", label: "Event Organizer", icon: CalendarDays },
            { id: "donations", label: "Donation Audit Desk", icon: Heart },
            { id: "sadhana", label: "Sadhana Vows Config", icon: Award },
            { id: "reports", label: "Reports & Exporter", icon: Download },
            { id: "audit", label: "System Audit Logs", icon: ShieldAlert },
            { id: "settings", label: "Temple Settings", icon: SettingsIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setStatusMessage(""); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-custom-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer lg:w-full text-left shrink-0 ${
                  isTabActive 
                    ? "bg-primary text-white shadow-premium" 
                    : "bg-white border border-border-custom text-text-secondary hover:text-text-primary hover:border-primary/20"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab Workspace Content */}
        <div className="lg:col-span-9 bg-white border border-border-custom shadow-premium p-6 sm:p-8 rounded-custom-lg min-h-[500px]">
          
          {isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-xs text-text-secondary">Syncing logs with Supabase...</p>
            </div>
          ) : (
            <>
              {/* TAB 0: ANALYTICS CONTROL CENTER (STREAM 4) */}
              {activeTab === "analytics" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-display font-semibold text-text-primary text-base">Control Command Center</h3>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Real-time overview of temple chaturmas operations</p>
                  </div>

                  {/* SNAPSHOT SLOTS */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-custom-lg border border-primary/15 bg-secondary/25">
                    {[
                      { icon: "📝", label: "Today's Logs", value: analytics.todayCheckinsCount || 0, color: "text-primary" },
                      { icon: "⏳", label: "Pending Reviews", value: analytics.pendingCount || 0, color: "text-amber-600", action: () => setActiveTab("approvals") },
                      { icon: "💰", label: "Today's Donation", value: `₹ ${(analytics.todayDonationsAmount || 0).toLocaleString("en-IN")}`, color: "text-emerald-600" },
                      { icon: "👤", label: "New Devotees", value: analytics.newRegistrationsToday || 0, color: "text-blue-600" }
                    ].map((item, i) => (
                      <div
                        key={i}
                        onClick={item.action}
                        className={`p-3 rounded-custom-md bg-white border border-border-custom flex flex-col gap-1 ${item.action ? "cursor-pointer hover:shadow-premium hover:border-primary/20 transition-all" : ""}`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className={`text-lg font-extrabold ${item.color}`}>{item.value}</span>
                        <span className="text-[9px] uppercase font-bold text-text-secondary tracking-wide">{item.label}</span>
                        {item.action && <span className="text-[8px] text-primary font-bold">→ Review Queue</span>}
                      </div>
                    ))}
                  </div>

                  {/* COUNTER CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {[
                      { icon: "👥", label: "Devotees Registered", value: analytics.devoteesCount },
                      { icon: "🏡", label: "Total Family Units", value: analytics.familiesCount || 0 },
                      { icon: "🪷", label: "Total Points Accumulated", value: analytics.totalPoints },
                      { icon: "📝", label: "Total Submissions", value: analytics.logsCount },
                      { icon: "✓", label: "Approved Checkins", value: analytics.approvedLogsCount },
                      { icon: "🎖️", label: "Verified Donations (80G)", value: `₹ ${(analytics.verifiedDonations || 0).toLocaleString("en-IN")}` }
                    ].map((card, i) => (
                      <div key={i} className="p-4 rounded-custom-lg border border-border-custom bg-neutral-50/50 hover:bg-white hover:shadow-premium transition-all">
                        <span className="text-xl">{card.icon}</span>
                        <h4 className="text-2xl font-bold font-display text-text-primary mt-2">{card.value}</h4>
                        <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mt-1">{card.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* QUICK ACCESS ACTIONS */}
                  <div>
                    <p className="text-[9px] uppercase font-bold text-text-secondary tracking-wider mb-2">Operational Tasks</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setActiveTab("approvals")} className="px-3 py-2 rounded-custom-md bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-100 transition-all cursor-pointer flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> Review Approvals Queue ({analytics.pendingCount || 0})
                      </button>
                      <button onClick={() => setActiveTab("announcements")} className="px-3 py-2 rounded-custom-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1.5">
                        <Megaphone size={12} /> Post Notices Bulletins
                      </button>
                      <button onClick={() => setActiveTab("profiles")} className="px-3 py-2 rounded-custom-md bg-secondary/50 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider hover:bg-secondary transition-all cursor-pointer flex items-center gap-1.5">
                        <User size={12} /> Devotees Registry Directory
                      </button>
                      <button onClick={() => setActiveTab("donations")} className="px-3 py-2 rounded-custom-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-100 transition-all cursor-pointer flex items-center gap-1.5">
                        <Heart size={12} /> Audit UPI Donations
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* AUDIT LOG TIMELINE */}
                    <div>
                      <p className="text-[9px] uppercase font-bold text-text-secondary tracking-wider mb-3">Recent Administrative Actions</p>
                      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                        {auditLogs.length === 0 ? (
                          <p className="text-xs text-text-secondary italic p-4 border border-dashed border-border-custom rounded-custom-md text-center">No actions recorded yet</p>
                        ) : (
                          auditLogs.map(log => (
                            <div key={log.id} className="p-3 rounded bg-neutral-50/50 border border-border-custom text-[10px]">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-text-primary">{log.admin_name}</span>
                                <span className="text-text-secondary text-[8px]">{new Date(log.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-primary font-semibold uppercase text-[8px] tracking-wider mt-1">{log.action}</p>
                              <p className="text-text-secondary mt-1 leading-normal">{log.details}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* TOP LEADERS LIST */}
                    <div>
                      <p className="text-[9px] uppercase font-bold text-text-secondary tracking-wider mb-3">Top Performing Devotees</p>
                      <div className="flex flex-col gap-2">
                        {(analytics.topDevotees || []).length === 0 ? (
                          <p className="text-xs text-text-secondary italic p-4 border border-dashed border-border-custom rounded-custom-md text-center">No scores computed yet</p>
                        ) : (
                          (analytics.topDevotees || []).map((d, i) => (
                            <div
                              key={d.id}
                              onClick={() => handleSelectDevoteeProfile(d.id)}
                              className="flex items-center gap-3 p-3 rounded-custom-md border border-border-custom bg-white cursor-pointer hover:border-primary/20 hover:shadow-sm transition-all"
                            >
                              <span className="text-xs font-bold text-text-secondary w-4 shrink-0">{i + 1}</span>
                              <div className="w-7 h-7 rounded-full bg-secondary overflow-hidden shrink-0 border border-primary/10 flex items-center justify-center text-xs">
                                {d.avatar ? <img src={d.avatar} alt="avatar" className="w-full h-full object-cover" /> : "🪷"}
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs font-semibold text-text-primary truncate">{d.fullName}</span>
                                <span className="text-[9px] text-text-secondary">{d.city} • 🔥 {d.streak || 0}d</span>
                              </div>
                              <span className="text-[10px] font-bold text-primary bg-secondary px-2.5 py-0.5 rounded-full shrink-0">
                                {d.totalPoints} pts
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: EXPANDED APPROVAL WORKFLOW (STREAM 3) */}
              {activeTab === "approvals" && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-semibold text-text-primary text-base">Check-In Approvals Workflow</h3>
                      <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Audit and approve daily spiritual vow logs</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={logStatusFilter}
                        onChange={(e) => { setLogStatusFilter(e.target.value); reloadLogsOnly(e.target.value); }}
                        className="px-3 py-1.5 text-xs rounded border border-border-custom text-text-primary font-semibold focus:outline-none bg-white"
                      >
                        <option value="Pending">Pending Approvals</option>
                        <option value="Approved">Approved Logs</option>
                        <option value="Rejected">Rejected Logs</option>
                      </select>
                      {logStatusFilter === "Pending" && adminLogs.length > 0 && (
                        <button onClick={handleApproveAllPending} className="px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer">Approve All</button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {adminLogs.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-border-custom rounded-custom-md">
                        <span className="text-3xl block mb-2">✅</span>
                        <p className="text-xs font-semibold text-text-secondary">No check-in logs require verification</p>
                      </div>
                    ) : (
                      adminLogs.map(log => {
                        const isExpanded = expandedLogId === log.id;
                        return (
                          <div key={log.id} className="border border-border-custom rounded-custom-md bg-white overflow-hidden">
                            {/* Summary row */}
                            <div
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50/50 transition-colors"
                            >
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-xs text-text-primary">{log.devoteeName}</span>
                                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                    log.status === "Approved" ? "bg-green-50 text-green-700 border-green-200"
                                      : log.status === "Rejected" ? "bg-red-50 text-red-700 border-red-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                  }`}>{log.status}</span>
                                </div>
                                <span className="text-[9px] text-text-secondary">{log.dateStr} • {log.activityName} • +{log.points} claimed pts</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {log.status === "Pending" && (
                                  <>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleUpdateLogStatus(log.id, "Approved"); }}
                                      className="p-1.5 rounded bg-green-50 hover:bg-green-100 text-green-600 cursor-pointer"
                                      title="Approve"
                                    >
                                      <Check size={12} strokeWidth={2.5} />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleUpdateLogStatus(log.id, "Rejected"); }}
                                      className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                                      title="Reject"
                                    >
                                      <XCircle size={12} />
                                    </button>
                                  </>
                                )}
                                <span className="text-[10px] text-text-secondary font-medium pl-2">{isExpanded ? "▲" : "▼"}</span>
                              </div>
                            </div>

                            {/* Detail remarks panel */}
                            {isExpanded && (
                              <div className="p-4 bg-neutral-50/50 border-t border-border-custom flex flex-col gap-4">
                                <p className="text-[9px] uppercase font-bold text-text-secondary">Verify Devotee Sadhana Logs & Override Points</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div className="sm:col-span-2 flex flex-col gap-1">
                                    <label className="text-[9px] uppercase font-bold text-text-secondary">Admin Remarks / Notes</label>
                                    <input
                                      type="text"
                                      value={logRemarks[log.id] || ""}
                                      onChange={(e) => setLogRemarks(prev => ({ ...prev, [log.id]: e.target.value }))}
                                      placeholder="Write remarks or rejection reasons here..."
                                      className="px-3 py-1.5 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] uppercase font-bold text-text-secondary">Override Points</label>
                                    <input
                                      type="number"
                                      value={logPoints[log.id] !== undefined ? logPoints[log.id] : log.points}
                                      onChange={(e) => setLogPoints(prev => ({ ...prev, [log.id]: e.target.value }))}
                                      className="px-3 py-1.5 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none font-bold text-primary"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateLogStatus(log.id, "Approved")}
                                    className="flex-1 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                  >
                                    Approve & Save Vows
                                  </button>
                                  <button
                                    onClick={() => handleUpdateLogStatus(log.id, "Rejected")}
                                    className="flex-1 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                  >
                                    Reject Check-In
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: DEVOTEE ACCOUNTS - FAMILY CARDS GRID (STREAM 5 & 6) */}
              {activeTab === "profiles" && (
                <div className="flex flex-col gap-6">
                  {selectedProfileId ? (
                    /* Devotee Profile details panel subview */
                    <div className="flex flex-col gap-6 border border-border-custom rounded-custom-lg p-6 bg-white shadow-premium">
                      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                        <button
                          onClick={() => { setSelectedProfileId(null); setSelectedProfileDetail(null); }}
                          className="px-3 py-1.5 rounded border border-border-custom text-[10px] font-bold uppercase tracking-wider hover:border-primary/20 text-text-secondary hover:text-primary transition-all cursor-pointer bg-white"
                        >
                          ← Back to Devotees List
                        </button>
                        <span className="text-[10px] font-extrabold text-primary bg-secondary px-2.5 py-0.5 rounded border border-primary/20">
                          {toReadableId(selectedProfileDetail?.id, "M")}
                        </span>
                      </div>

                      {/* Header profile info */}
                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-secondary overflow-hidden shrink-0 border-2 border-primary/20 flex items-center justify-center text-2xl font-bold">
                          {selectedProfileDetail?.avatar ? <img src={selectedProfileDetail.avatar} alt="avatar" className="w-full h-full object-cover" /> : "🪷"}
                        </div>
                        <div className="text-center sm:text-left">
                          <h4 className="font-display font-semibold text-text-primary text-lg leading-snug">{selectedProfileDetail?.fullName}</h4>
                          <p className="text-xs text-text-secondary mt-0.5">📍 {selectedProfileDetail?.city} • +91 {selectedProfileDetail?.phone || "No phone number"}</p>
                        </div>
                      </div>

                      {/* Counters grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-neutral-50 border border-border-custom rounded-custom-md text-center">
                          <span className="text-sm font-extrabold text-primary block">{selectedProfileDetail?.totalPoints || 0} pts</span>
                          <span className="text-[9px] uppercase tracking-wider text-text-secondary font-bold block mt-0.5">Total Points</span>
                        </div>
                        <div className="p-3 bg-neutral-50 border border-border-custom rounded-custom-md text-center">
                          <span className="text-sm font-extrabold text-orange-600 block">🔥 {selectedProfileDetail?.streak || 0} days</span>
                          <span className="text-[9px] uppercase tracking-wider text-text-secondary font-bold block mt-0.5">Current Streak</span>
                        </div>
                        <div className="p-3 bg-neutral-50 border border-border-custom rounded-custom-md text-center">
                          <span className="text-sm font-extrabold text-amber-600 block">🔥 {selectedProfileDetail?.longest_streak || selectedProfileDetail?.longestStreak || 0} days</span>
                          <span className="text-[9px] uppercase tracking-wider text-text-secondary font-bold block mt-0.5">Longest Streak</span>
                        </div>
                      </div>

                      {/* Edit Admin Notes */}
                      <div className="flex flex-col gap-2 p-4 bg-secondary/15 border border-primary/10 rounded-custom-md">
                        <label className="text-[9px] uppercase font-bold text-primary">Permanent Devotee Admin Remarks</label>
                        <textarea
                          rows={3}
                          value={adminNotesText}
                          onChange={(e) => setAdminNotesText(e.target.value)}
                          placeholder="Write private administrative notes about this devotee here..."
                          className="w-full p-2.5 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none"
                        />
                        <button
                          onClick={handleSaveAdminNotes}
                          className="px-4 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded shadow hover:bg-primary/95 transition-all w-fit self-end cursor-pointer"
                        >
                          Save Admin Notes
                        </button>
                      </div>

                      {/* History check-in logs list */}
                      <div>
                        <p className="text-[10px] uppercase font-bold text-text-secondary mb-3">Sadhana Check-in History</p>
                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 text-xs">
                          {profileLogs.length === 0 ? (
                            <p className="text-xs text-text-secondary italic py-4 text-center">No logs recorded yet</p>
                          ) : (
                            profileLogs.map(log => (
                              <div key={log.id} className="flex justify-between items-center p-3 border border-border-custom rounded hover:bg-neutral-50/50">
                                <div>
                                  <span className="font-bold text-text-primary">{log.dateStr}</span>
                                  <span className="text-[10px] text-text-secondary ml-3">{log.points} pts</span>
                                </div>
                                <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                  log.status === "Approved" ? "bg-green-50 text-green-700 border-green-200"
                                    : log.status === "Rejected" ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}>{log.status}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Linked donations lists */}
                      <div>
                        <p className="text-[10px] uppercase font-bold text-text-secondary mb-3">Verified Donations</p>
                        <div className="flex flex-col gap-2 text-xs">
                          {profileDonations.length === 0 ? (
                            <p className="text-xs text-text-secondary italic py-4 text-center">No donation transfers audited</p>
                          ) : (
                            profileDonations.map(d => (
                              <div key={d.id} className="flex justify-between items-center p-3 border border-border-custom rounded hover:bg-neutral-50/50">
                                <div>
                                  <span className="font-bold text-text-primary">₹ {d.amount.toLocaleString("en-IN")}</span>
                                  <span className="font-mono text-[9px] text-text-secondary ml-3">{d.txnId}</span>
                                </div>
                                <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                  d.verified ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"
                                }`}>{d.verified ? "Verified" : "Pending"}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Devotee Family directory cards grid list view */
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-display font-semibold text-text-primary text-base">Registered Devotee Profiles</h3>
                          <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Manage family account devotees</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search devotee name..."
                              value={profileSearch}
                              onChange={(e) => setProfileSearch(e.target.value)}
                              className="pl-8 pr-3 py-1.5 text-xs rounded border border-border-custom text-text-primary focus:outline-none w-48 bg-white"
                            />
                            <Search size={12} className="text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                          </div>
                          
                          {/* Devotee advanced sort selector */}
                          <select
                            value={devoteeFilters.sortBy}
                            onChange={(e) => setDevoteeFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                            className="px-3 py-1.5 text-xs rounded border border-border-custom text-text-primary font-semibold focus:outline-none bg-white"
                          >
                            <option value="points_desc">Highest Points</option>
                            <option value="points_asc">Lowest Points</option>
                            <option value="streak_desc">Highest Streak</option>
                            <option value="newest">Newest Devotee</option>
                          </select>

                          <button
                            onClick={exportFamiliesCSV}
                            className="px-3 py-1.5 rounded border border-border-custom bg-white text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-primary hover:border-primary/20 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Download size={12} />
                            <span>Export CSV</span>
                          </button>
                        </div>
                      </div>

                      {(() => {
                        const searchLower = profileSearch.toLowerCase();
                        let filtered = allProfiles.filter(p =>
                          p.fullName.toLowerCase().includes(searchLower) ||
                          (p.phone && p.phone.includes(profileSearch)) ||
                          (p.city && p.city.toLowerCase().includes(searchLower))
                        );

                        // Sorting algorithms
                        if (devoteeFilters.sortBy === "points_desc") {
                          filtered.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
                        } else if (devoteeFilters.sortBy === "points_asc") {
                          filtered.sort((a, b) => (a.totalPoints || 0) - (b.totalPoints || 0));
                        } else if (devoteeFilters.sortBy === "streak_desc") {
                          filtered.sort((a, b) => (b.streak || 0) - (a.streak || 0));
                        } else if (devoteeFilters.sortBy === "newest") {
                          filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                        }

                        // Group profiles helper local definition to ensure zero dependencies
                        const groupByFamily = (list) => {
                          const map = {};
                          list.forEach(p => {
                            if (!map[p.userId]) {
                              map[p.userId] = { userId: p.userId, members: [], totalPoints: 0 };
                            }
                            map[p.userId].members.push(p);
                            map[p.userId].totalPoints += (p.totalPoints || 0);
                          });
                          return Object.values(map).sort((a, b) => b.totalPoints - a.totalPoints);
                        };

                        const families = groupByFamily(filtered);

                        if (families.length === 0) {
                          return (
                            <div className="py-10 flex flex-col items-center gap-3 border border-dashed border-border-custom rounded-custom-md">
                              <span className="text-3xl">👥</span>
                              <p className="text-sm font-semibold text-text-secondary">No profiles matched your search parameters</p>
                            </div>
                          );
                        }

                        return (
                          <div className="flex flex-col gap-4">
                            {families.map(family => {
                              const primary = family.members.find(m => m.memberNumber === 1);
                              const familyReadableId = toReadableId(family.userId, "F");

                              return (
                                <div key={family.userId} className="border border-border-custom rounded-custom-lg overflow-hidden bg-white hover:shadow-premium transition-all">
                                  {/* Family Card Header */}
                                  <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border-custom select-none">
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider bg-white border border-primary/20 px-2 py-0.5 rounded">{familyReadableId}</span>
                                      <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">{family.members.length} Members</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[9px] text-text-secondary font-semibold">Combined: <strong className="text-primary">{family.totalPoints} pts</strong></span>
                                      {primary && <span className="text-[9px] text-text-secondary">{primary.createdAt ? new Date(primary.createdAt).toLocaleDateString() : ""}</span>}
                                    </div>
                                  </div>

                                  {/* Family member rows list */}
                                  <div className="divide-y divide-border-custom">
                                    {family.members.map(member => (
                                      <div key={member.id} className="flex items-center justify-between px-4 py-3 gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="relative shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden border border-primary/10 flex items-center justify-center text-xs">
                                              {member.avatar
                                                ? <img src={member.avatar} alt={member.fullName} className="w-full h-full object-cover" />
                                                : <span className="flex items-center justify-center w-full h-full text-xs">🪷</span>
                                              }
                                            </div>
                                          </div>
                                          <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-2">
                                              {/* Click devotee name opens profile detail sheet */}
                                              <span
                                                onClick={() => handleSelectDevoteeProfile(member.id)}
                                                className="text-xs font-semibold text-text-primary hover:text-primary cursor-pointer hover:underline truncate"
                                              >
                                                {member.fullName}
                                              </span>
                                              <span className={`text-[7px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                                                member.memberNumber === 1
                                                  ? "bg-primary/10 text-primary border border-primary/20"
                                                  : "bg-neutral-100 text-text-secondary border border-neutral-200"
                                              }`}>
                                                {member.memberNumber === 1 ? "Primary" : "Secondary"}
                                              </span>
                                            </div>
                                            <span className="text-[9px] text-text-secondary">{toReadableId(member.id, "M")} • {member.phone || "No phone"} • {member.city}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                          <div className="hidden sm:flex flex-col items-end">
                                            <span className="text-xs font-bold text-primary">{member.totalPoints || 0} pts</span>
                                            <span className="text-[9px] text-text-secondary">🔥 {member.streak || 0}d streak</span>
                                          </div>
                                          {member.memberNumber === 2 && (
                                            <button
                                              onClick={() => setProfileToDelete(member)}
                                              className="p-1.5 text-text-secondary hover:text-red-600 transition-colors cursor-pointer"
                                              title="Delete Secondary Profile"
                                            >
                                              <Trash2 size={13} />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}

              {/* TAB 3: TIMETABLE MANAGEMENT */}
              {activeTab === "schedules" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-display font-semibold text-text-primary text-base">Worship Timetable Management</h3>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Edit Morning/Evening temple schedule</p>
                  </div>

                  <form onSubmit={handleAddSchedule} className="p-4 rounded-custom-md border border-border-custom bg-neutral-50/50 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-text-secondary">Time interval</label>
                      <input 
                        type="text"
                        placeholder="e.g. 06:30 AM"
                        value={newSched.time}
                        onChange={(e) => setNewSched(prev => ({ ...prev, time: e.target.value }))}
                        className="px-3 py-1.5 text-xs rounded border border-border-custom text-text-primary focus:outline-none bg-white"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-text-secondary">Activity description</label>
                      <input 
                        type="text"
                        placeholder="e.g. Mangal Aarti"
                        value={newSched.activity}
                        onChange={(e) => setNewSched(prev => ({ ...prev, activity: e.target.value }))}
                        className="px-3 py-1.5 text-xs rounded border border-border-custom text-text-primary focus:outline-none bg-white"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-text-secondary">Session category</label>
                      <select 
                        value={newSched.session}
                        onChange={(e) => setNewSched(prev => ({ ...prev, session: e.target.value }))}
                        className="px-3 py-1.5 text-xs rounded border border-border-custom text-text-primary focus:outline-none bg-white font-semibold"
                      >
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="py-1.5 rounded bg-primary hover:bg-primary/95 text-white text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer h-[34px]"
                    >
                      <Plus size={12} />
                      <span>Add Activity</span>
                    </button>
                  </form>

                  <div className="border border-border-custom rounded-custom-lg overflow-hidden w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-bg-custom text-[9px] uppercase font-bold text-text-secondary tracking-wider border-b border-border-custom">
                          <th className="p-3">Session</th>
                          <th className="p-3">Time</th>
                          <th className="p-3">Activity Title</th>
                          <th className="p-3 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedules.map(sched => (
                          <tr key={sched.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                            <td className="p-3 font-bold text-primary">{sched.session}</td>
                            <td className="p-3">
                              <input 
                                type="text"
                                value={sched.time}
                                onChange={(e) => handleScheduleUpdate(sched.id, "time", e.target.value)}
                                className="bg-transparent focus:bg-white px-2 py-0.5 rounded border border-transparent focus:border-border-custom font-semibold text-text-primary max-w-[100px]"
                              />
                            </td>
                            <td className="p-3 w-full">
                              <input 
                                type="text"
                                value={sched.activity}
                                onChange={(e) => handleScheduleUpdate(sched.id, "activity", e.target.value)}
                                className="bg-transparent focus:bg-white px-2 py-0.5 rounded border border-transparent focus:border-border-custom font-medium text-text-primary w-full"
                              />
                            </td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => setScheduleToDelete(sched)}
                                className="p-1 text-text-secondary hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: ANNOUNCEMENTS */}
              {activeTab === "announcements" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-display font-semibold text-text-primary text-base">Notices & Bulletins</h3>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Publish community notifications</p>
                  </div>

                  <form onSubmit={handleAddAnnouncement} className="p-4 rounded-custom-md border border-border-custom bg-neutral-50/50 flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Notice Title</label>
                        <input 
                          type="text"
                          placeholder="e.g. Paryushan Mahotsav dates"
                          value={newAnn.title}
                          onChange={(e) => setNewAnn(prev => ({ ...prev, title: e.target.value }))}
                          className="px-3 py-1.5 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Priority Category</label>
                        <select 
                          value={newAnn.type}
                          onChange={(e) => setNewAnn(prev => ({ ...prev, type: e.target.value }))}
                          className="px-3 py-1.5 text-xs rounded border border-border-custom text-text-primary bg-white font-semibold focus:outline-none"
                        >
                          <option value="program">High Priority (Program)</option>
                          <option value="notice">Medium Priority (Notice)</option>
                          <option value="update">Low Priority (Update)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-text-secondary">Message content</label>
                      <textarea 
                        rows={3}
                        placeholder="Write announcement description details..."
                        value={newAnn.content}
                        onChange={(e) => setNewAnn(prev => ({ ...prev, content: e.target.value }))}
                        className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="py-2 px-5 rounded bg-primary hover:bg-primary/95 text-white text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer w-fit ml-auto"
                    >
                      <Plus size={12} />
                      <span>Post Notice</span>
                    </button>
                  </form>

                  <div className="flex flex-col gap-4">
                    {announcements.map(ann => (
                      <div key={ann.id} className="p-4 rounded-custom-md border border-border-custom flex items-start justify-between gap-4 bg-white hover:shadow-premium transition-shadow">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-text-primary text-xs">{ann.title}</h4>
                            <span className={`text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              ann.type === "program" 
                                ? "bg-red-50 text-red-600 border-red-500/10" 
                                : "bg-neutral-50 text-text-secondary border-neutral-200"
                            }`}>
                              {ann.type}
                            </span>
                          </div>
                          <p className="text-[10px] text-text-secondary mt-1.5 leading-relaxed">{ann.content}</p>
                          <span className="text-[8px] text-text-secondary mt-2 block font-semibold">{new Date(ann.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button 
                          onClick={() => setAnnToDelete(ann)}
                          className="p-1.5 rounded-full hover:bg-red-50 text-text-secondary hover:text-red-600 transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: PANCHANG */}
              {activeTab === "panchang" && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-semibold text-text-primary text-base">Panchang Editor</h3>
                      <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Auspicious lunar days setup</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label htmlFor="panchang-date" className="text-[10px] uppercase font-bold text-text-secondary">Calendar Date:</label>
                      <input 
                        id="panchang-date"
                        type="date"
                        value={panchangDate}
                        onChange={(e) => setPanchangDate(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded border border-border-custom text-text-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-5 rounded-custom-lg border border-border-custom bg-neutral-50/50 flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Lunar Tithi</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Sud Ekadashi"
                          value={panchangVal.tithi}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, tithi: e.target.value }))}
                          className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none text-text-primary font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Lunar Month</label>
                        <select 
                          value={panchangVal.month}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, month: e.target.value }))}
                          className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none text-text-primary font-medium"
                        >
                          <option value="Chatra">Chatra (चैत्र)</option>
                          <option value="Vaisakha">Vaisakha (वैशाख)</option>
                          <option value="Jyeshtha">Jyeshtha (ज्येष्ठ)</option>
                          <option value="Ashadha">Ashadha (आषाढ़)</option>
                          <option value="Shravana">Shravana (श्रावण)</option>
                          <option value="Bhadrapada">Bhadrapada (भाद्रपद)</option>
                          <option value="Ashvina">Ashvina (आश्विन)</option>
                          <option value="Kartika">Kartika (कार्तिक)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Paksha</label>
                        <select 
                          value={panchangVal.paksha}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, paksha: e.target.value }))}
                          className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none text-text-primary font-medium"
                        >
                          <option value="Shukla">Shukla Paksha (शुक्ल पक्ष)</option>
                          <option value="Krishna">Krishna Paksha (कृष्ण पक्ष)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Festival / Fast Day description</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Mahavir Janma Kalyanak"
                          value={panchangVal.festival}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, festival: e.target.value }))}
                          className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none text-text-primary font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Sunrise Time</label>
                        <input 
                          type="text" 
                          value={panchangVal.sunrise}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, sunrise: e.target.value }))}
                          className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none text-text-primary font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Sunset Time</label>
                        <input 
                          type="text" 
                          value={panchangVal.sunset}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, sunset: e.target.value }))}
                          className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none text-text-primary font-medium"
                        />
                      </div>
                      <div className="flex items-center gap-4 sm:col-span-3 py-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={!!panchangVal.shubh_din}
                            onChange={(e) => setPanchangVal(prev => ({ ...prev, shubh_din: e.target.checked }))}
                            className="rounded border-border-custom text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          />
                          <span>Shubh Din (卐 Swastik Marker)</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={!!panchangVal.samayik}
                            onChange={(e) => setPanchangVal(prev => ({ ...prev, samayik: e.target.checked }))}
                            className="rounded border-border-custom text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          />
                          <span>Samayik Day (📖 Book Marker)</span>
                        </label>
                      </div>
                    </div>

                    <button 
                      onClick={handleSavePanchang}
                      className="px-4 py-2 rounded bg-primary text-white text-[10px] font-bold uppercase tracking-wider shadow hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 w-fit cursor-pointer ml-auto mt-2"
                    >
                      <Save size={14} />
                      <span>Save Panchang</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 6: EVENTS ORGANIZER */}
              {activeTab === "events" && (
                <div className="flex flex-col gap-8">
                  <form onSubmit={handleAddEvent} className="p-5 rounded-custom-lg bg-bg-custom border border-border-custom flex flex-col gap-4">
                    <h4 className="font-display font-semibold text-text-primary text-sm">Add New Spiritual Event</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Event Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Paryushan Discourse"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                          className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Date & Time</label>
                        <input 
                          type="datetime-local" 
                          value={newEvent.date}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                          className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-secondary font-semibold"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Location Hall</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Pandal Hall"
                          value={newEvent.location}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                          className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Image URL</label>
                        <input 
                          type="text" 
                          placeholder="https://images.unsplash.com..."
                          value={newEvent.imageUrl}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, imageUrl: e.target.value }))}
                          className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="px-5 py-2 rounded bg-primary text-white text-[10px] font-bold uppercase tracking-wider shadow hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 w-fit cursor-pointer ml-auto"
                    >
                      <Plus size={12} />
                      <span>Create Event</span>
                    </button>
                  </form>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {events.map(e => (
                      <div key={e.id} className="p-4 rounded-custom-md border border-border-custom bg-white flex flex-col justify-between hover:shadow-premium transition-shadow">
                        <div>
                          <h4 className="font-semibold text-text-primary text-xs">{e.title}</h4>
                          <p className="text-[10px] text-text-secondary mt-1 flex items-center gap-1.5">
                            <span>📍 {e.location || "Labriya Temple"}</span>
                            <span>&bull;</span>
                            <span>{new Date(e.date).toLocaleString()}</span>
                          </p>
                          <p className="text-[10px] text-text-secondary mt-2 leading-relaxed">{e.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: DONATIONS */}
              {activeTab === "donations" && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-semibold text-text-primary text-base">Donation Verification Desk</h3>
                      <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Approve 80G tax vouchers</p>
                    </div>

                    <div className="relative max-w-xs w-full">
                      <input 
                        type="text"
                        placeholder="Search by transaction ID..."
                        value={donationSearch}
                        onChange={(e) => setDonationSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-border-custom text-text-primary focus:outline-none"
                      />
                      <Search size={12} className="text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="border border-border-custom rounded-custom-lg overflow-hidden w-full">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-bg-custom text-[9px] uppercase font-bold text-text-secondary tracking-wider border-b border-border-custom">
                            <th className="p-3">Donor Name</th>
                            <th className="p-3">Phone</th>
                            <th className="p-3 text-right">Amount</th>
                            <th className="p-3">Transaction Reference ID</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const filtered = donations.filter(d => 
                              d.txnId?.toLowerCase().includes(donationSearch.toLowerCase()) ||
                              d.donorName?.toLowerCase().includes(donationSearch.toLowerCase())
                            );

                            return filtered.length > 0 ? (
                              filtered.map(d => (
                                <tr key={d.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                                  <td className="p-3 font-semibold text-text-primary">{d.donorName}</td>
                                  <td className="p-3 text-text-secondary font-semibold">{d.phone}</td>
                                  <td className="p-3 text-right font-bold text-text-primary">₹ {d.amount.toLocaleString("en-IN")}</td>
                                  <td className="p-3 font-mono text-text-secondary text-[10px]">{d.txnId}</td>
                                  <td className="p-3 text-center">
                                    <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block ${
                                      d.verified 
                                        ? "bg-green-50 text-green-700 border-green-500/10" 
                                        : "bg-orange-50 text-orange-700 border-orange-500/10"
                                    }`}>
                                      {d.verified ? "Verified" : "Pending"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right">
                                    {!d.verified ? (
                                      <button 
                                        onClick={() => handleApproveDonation(d.id)}
                                        className="px-2 py-1 rounded bg-green-50 hover:bg-green-100 text-green-600 font-bold text-[9px] uppercase tracking-wider cursor-pointer"
                                      >
                                        Verify Receipt
                                      </button>
                                    ) : (
                                      <span className="text-[9px] text-text-secondary font-medium">Approved</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="p-8 text-center text-text-secondary italic">
                                  No transaction records matched your search parameters.
                                </td>
                              </tr>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: SADHANA CONFIGS */}
              {activeTab === "sadhana" && (
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-semibold text-text-primary text-base">Sadhana Tracker Configuration</h3>
                      <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Verify devotees points & streaking audits</p>
                    </div>

                    <button
                      onClick={handleExportSadhanaReports}
                      className="px-3 py-1.5 rounded border border-border-custom hover:border-primary/20 bg-white text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-primary transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <Download size={12} />
                      <span>Export CSV Reports</span>
                    </button>
                  </div>

                  {/* Leaderboard control switch */}
                  <div className="p-5 rounded-custom-lg border border-border-custom flex items-center justify-between gap-6 bg-secondary/25 select-none">
                    <div>
                      <h4 className="text-xs font-bold text-primary">Enable Inspiring Leaderboard</h4>
                      <p className="text-[10px] text-text-secondary mt-0.5">Toggle the Top 10 public Devotees points board visible on devotee portals.</p>
                    </div>
                    <button
                      onClick={handleToggleLeaderboardState}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                        leaderboardToggle ? "bg-primary" : "bg-neutral-200"
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
                        leaderboardToggle ? "left-7" : "left-1"
                      }`} />
                    </button>
                  </div>

                  {/* Sadhana vow weights CRUD */}
                  <div className="flex flex-col gap-4">
                    <h4 className="font-display font-semibold text-text-primary text-sm pb-2 border-b border-neutral-100">Configure Sadhana Vows (Points Weight)</h4>
                    
                    <form onSubmit={handleCreateSadhanaActivity} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end p-4 rounded bg-neutral-50/50 border border-neutral-150">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Vow Activity Name</label>
                        <input 
                          type="text"
                          placeholder="e.g. Swadhyay"
                          value={newSadhanaAct.name}
                          onChange={(e) => setNewSadhanaAct(prev => ({ ...prev, name: e.target.value }))}
                          className="px-3 py-1.5 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none font-semibold"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Points Value</label>
                        <input 
                          type="number"
                          value={newSadhanaAct.points}
                          onChange={(e) => setNewSadhanaAct(prev => ({ ...prev, points: e.target.value }))}
                          className="px-3 py-1.5 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none font-semibold"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Category</label>
                        <select 
                          value={newSadhanaAct.category}
                          onChange={(e) => setNewSadhanaAct(prev => ({ ...prev, category: e.target.value }))}
                          className="px-3 py-1.5 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none font-semibold"
                        >
                          <option value="Fasting">Fasting</option>
                          <option value="Prayer">Prayer</option>
                          <option value="Meditation">Meditation</option>
                          <option value="Learning">Learning</option>
                          <option value="Temple">Temple</option>
                          <option value="Seva">Seva</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="py-1.5 rounded bg-primary hover:bg-primary/95 text-white text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer h-[34px]"
                      >
                        <Plus size={12} />
                        <span>Add Vow</span>
                      </button>
                    </form>

                    <div className="border border-border-custom rounded-custom-lg overflow-hidden w-full">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-bg-custom text-[9px] uppercase font-bold text-text-secondary tracking-wider border-b border-border-custom">
                            <th className="p-3">Category</th>
                            <th className="p-3">Name</th>
                            <th className="p-3 text-right">Points Weight</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sadhanaActivities.map(act => (
                            <tr key={act.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                              <td className="p-3 text-text-secondary font-bold text-[10px] uppercase tracking-wider">{act.category}</td>
                              <td className="p-3 font-semibold text-text-primary">{act.name}</td>
                              <td className="p-3 text-right">
                                <input 
                                  type="number"
                                  value={act.points}
                                  onChange={(e) => handleUpdateSadhanaPointVal(act.id, e.target.value)}
                                  className="bg-transparent focus:bg-white text-right px-2 py-0.5 rounded border border-transparent focus:border-border-custom font-extrabold text-primary max-w-[60px]"
                                />
                              </td>
                              <td className="p-3 text-right">
                                <button 
                                  onClick={() => handleDeleteSadhanaActivity(act.id)}
                                  className="p-1 text-text-secondary hover:text-red-600 transition-colors cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: SETTINGS CONSOLE (CMS - STREAM 9) */}
              {activeTab === "settings" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-display font-semibold text-text-primary text-base">Temple Website CMS Console</h3>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Control every text, setting, and image on the portal in real-time</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="flex flex-col gap-8 bg-neutral-50/50 p-6 rounded-custom-lg border border-border-custom">
                    {/* Section 1: General Info */}
                    <div className="flex flex-col gap-4 border-b border-border-custom pb-6">
                      <h4 className="font-display font-semibold text-primary text-xs uppercase tracking-wider">1. General Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Temple Name</label>
                          <input type="text" value={templeSettings.templeName || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, templeName: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" required />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Subtitle</label>
                          <input type="text" value={templeSettings.subtitle || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, subtitle: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Temple Logo URL</label>
                          <div className="flex gap-2">
                            <input type="text" value={templeSettings.templeLogo || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, templeLogo: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("templeLogo", e.target.files[0])} className="text-xs w-28 text-text-secondary" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Favicon URL</label>
                          <input type="text" value={templeSettings.favicon || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, favicon: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Chaturmas Year</label>
                          <input type="text" value={templeSettings.chaturmasYear || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, chaturmasYear: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Website Title</label>
                          <input type="text" value={templeSettings.websiteTitle || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, websiteTitle: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">SEO Title</label>
                          <input type="text" value={templeSettings.seoTitle || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, seoTitle: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Primary Theme Color</label>
                          <input type="text" value={templeSettings.primaryThemeColor || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, primaryThemeColor: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">SEO Description</label>
                          <textarea rows={2} value={templeSettings.seoDescription || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, seoDescription: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Contact Info */}
                    <div className="flex flex-col gap-4 border-b border-border-custom pb-6">
                      <h4 className="font-display font-semibold text-primary text-xs uppercase tracking-wider">2. Contact Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Phone Number</label>
                          <input type="text" value={templeSettings.contactNumber || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, contactNumber: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Alternate Phone</label>
                          <input type="text" value={templeSettings.alternatePhone || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, alternatePhone: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">WhatsApp Number</label>
                          <input type="text" value={templeSettings.whatsappNumber || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Email Address</label>
                          <input type="email" value={templeSettings.email || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, email: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Website URL</label>
                          <input type="text" value={templeSettings.website || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, website: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-text-secondary uppercase font-bold">Latitude</label>
                            <input type="number" step="any" value={templeSettings.latitude || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, latitude: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-text-secondary uppercase font-bold">Longitude</label>
                            <input type="number" step="any" value={templeSettings.longitude || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, longitude: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Address</label>
                          <input type="text" value={templeSettings.templeAddress || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, templeAddress: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Google Maps Embed URL</label>
                          <textarea rows={2} value={templeSettings.googleMapsEmbedUrl || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, googleMapsEmbedUrl: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Donation Info */}
                    <div className="flex flex-col gap-4 border-b border-border-custom pb-6">
                      <h4 className="font-display font-semibold text-primary text-xs uppercase tracking-wider">3. Donation Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">UPI ID</label>
                          <input type="text" value={templeSettings.upiId || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, upiId: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">UPI QR Image URL</label>
                          <div className="flex gap-2">
                            <input type="text" value={templeSettings.donationQr || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, donationQr: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("donationQr", e.target.files[0])} className="text-xs w-28 text-text-secondary" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Account Holder</label>
                          <input type="text" value={templeSettings.accountHolder || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, accountHolder: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Bank Name</label>
                          <input type="text" value={templeSettings.bankName || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, bankName: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Branch</label>
                          <input type="text" value={templeSettings.branch || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, branch: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Account Number</label>
                          <input type="text" value={templeSettings.accountNumber || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, accountNumber: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">IFSC</label>
                          <input type="text" value={templeSettings.ifsc || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, ifsc: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">80G Information</label>
                          <input type="text" value={templeSettings.eightyGInfo || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, eightyGInfo: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Donation Instructions</label>
                          <textarea rows={2} value={templeSettings.donationInstructions || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, donationInstructions: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Tax Disclaimer</label>
                          <textarea rows={2} value={templeSettings.taxDisclaimer || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, taxDisclaimer: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Homepage Content */}
                    <div className="flex flex-col gap-4 border-b border-border-custom pb-6">
                      <h4 className="font-display font-semibold text-primary text-xs uppercase tracking-wider">4. Homepage Content</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Hero Title</label>
                          <input type="text" value={templeSettings.heroTitle || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, heroTitle: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Hero Subtitle</label>
                          <input type="text" value={templeSettings.heroSubtitle || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, heroSubtitle: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Welcome Message</label>
                          <input type="text" value={templeSettings.welcomeMessage || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Hero Image URL</label>
                          <div className="flex gap-2">
                            <input type="text" value={templeSettings.heroBanner || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, heroBanner: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("heroBanner", e.target.files[0])} className="text-xs w-28 text-text-secondary" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Latest Announcement Banner Text</label>
                          <input type="text" value={templeSettings.latestAnnouncementBanner || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, latestAnnouncementBanner: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Hero Description</label>
                          <textarea rows={2} value={templeSettings.heroDescription || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, heroDescription: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">About Temple Summary</label>
                          <textarea rows={2} value={templeSettings.aboutTempleSummary || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, aboutTempleSummary: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Featured Quote</label>
                          <textarea rows={2} value={templeSettings.featuredQuote || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, featuredQuote: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Footer Content */}
                    <div className="flex flex-col gap-4 border-b border-border-custom pb-6">
                      <h4 className="font-display font-semibold text-primary text-xs uppercase tracking-wider">5. Footer Content</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Copyright Text</label>
                          <input type="text" value={templeSettings.copyrightText || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, copyrightText: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Designed By Text</label>
                          <input type="text" value={templeSettings.designedByText || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, designedByText: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Quick Contact Text</label>
                          <input type="text" value={templeSettings.quickContactText || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, quickContactText: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Footer Logo URL</label>
                          <div className="flex gap-2">
                            <input type="text" value={templeSettings.footerLogo || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, footerLogo: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("footerLogo", e.target.files[0])} className="text-xs w-28 text-text-secondary" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Footer Description</label>
                          <textarea rows={2} value={templeSettings.footerDescription || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, footerDescription: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                        </div>
                      </div>
                    </div>

                    {/* Section 6: Social Media */}
                    <div className="flex flex-col gap-4 border-b border-border-custom pb-6">
                      <h4 className="font-display font-semibold text-primary text-xs uppercase tracking-wider">6. Social Media Links</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Instagram URL</label>
                          <input type="text" value={templeSettings.instagram || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, instagram: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Facebook URL</label>
                          <input type="text" value={templeSettings.facebook || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, facebook: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">YouTube URL</label>
                          <input type="text" value={templeSettings.youtube || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, youtube: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">WhatsApp Direct URL</label>
                          <input type="text" value={templeSettings.whatsapp || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, whatsapp: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Telegram Invite Link</label>
                          <input type="text" value={templeSettings.telegram || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, telegram: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">X (Twitter) URL</label>
                          <input type="text" value={templeSettings.xTwitter || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, xTwitter: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Section 7: Temple Information */}
                    <div className="flex flex-col gap-4 border-b border-border-custom pb-6">
                      <h4 className="font-display font-semibold text-primary text-xs uppercase tracking-wider">7. Temple Information & Timings</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Daily Open Timings</label>
                          <input type="text" value={templeSettings.dailyTimings || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, dailyTimings: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Aarti Timing</label>
                          <input type="text" value={templeSettings.aartiTiming || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, aartiTiming: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Puja Timing</label>
                          <input type="text" value={templeSettings.pujaTiming || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, pujaTiming: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Office Timings</label>
                          <input type="text" value={templeSettings.officeTiming || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, officeTiming: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">About Temple Description</label>
                          <textarea rows={2} value={templeSettings.aboutText || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, aboutText: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Temple History Scroll</label>
                          <textarea rows={2} value={templeSettings.templeHistory || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, templeHistory: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Trust Information</label>
                          <textarea rows={2} value={templeSettings.trustInformation || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, trustInformation: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Mission Statement</label>
                          <textarea rows={2} value={templeSettings.mission || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, mission: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Vision Statement</label>
                          <textarea rows={2} value={templeSettings.vision || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, vision: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                        </div>
                      </div>
                    </div>

                    {/* Section 8: Event Configuration */}
                    <div className="flex flex-col gap-4 border-b border-border-custom pb-6">
                      <h4 className="font-display font-semibold text-primary text-xs uppercase tracking-wider">8. Event Configurations</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Maximum Event Participants</label>
                          <input type="number" value={templeSettings.maxParticipants || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, maxParticipants: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Default Event Banner URL</label>
                          <div className="flex gap-2">
                            <input type="text" value={templeSettings.defaultEventBanner || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, defaultEventBanner: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("defaultEventBanner", e.target.files[0])} className="text-xs w-28 text-text-secondary" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white border border-border-custom rounded-custom-md">
                          <div>
                            <span className="text-xs font-bold text-text-primary">Event Registration Open</span>
                            <p className="text-[9px] text-text-secondary">Allow devotees to book passes and seats for Chaturmas events.</p>
                          </div>
                          <button type="button" onClick={() => setTempleSettings(prev => ({ ...prev, registrationOpen: !prev.registrationOpen }))} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${templeSettings.registrationOpen ? "bg-green-600" : "bg-neutral-200"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${templeSettings.registrationOpen ? "left-7" : "left-1"}`} /></button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white border border-border-custom rounded-custom-md">
                          <div>
                            <span className="text-xs font-bold text-text-primary">Force Registration Closed</span>
                            <p className="text-[9px] text-text-secondary">Disable event registry across all templates globally.</p>
                          </div>
                          <button type="button" onClick={() => setTempleSettings(prev => ({ ...prev, registrationClosed: !prev.registrationClosed }))} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${templeSettings.registrationClosed ? "bg-red-600" : "bg-neutral-200"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${templeSettings.registrationClosed ? "left-7" : "left-1"}`} /></button>
                        </div>
                      </div>
                    </div>

                    {/* Section 9: Portal Configuration */}
                    <div className="flex flex-col gap-4 border-b border-border-custom pb-6">
                      <h4 className="font-display font-semibold text-primary text-xs uppercase tracking-wider">9. Devotee Portal Configurations</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 bg-white border border-border-custom rounded-custom-md">
                          <div>
                            <span className="text-xs font-bold text-text-primary">Allow New Devotee Registrations</span>
                            <p className="text-[9px] text-text-secondary">Toggle toggle login onboarding forms for new devotees.</p>
                          </div>
                          <button type="button" onClick={() => setTempleSettings(prev => ({ ...prev, allowNewRegistration: !prev.allowNewRegistration }))} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${templeSettings.allowNewRegistration ? "bg-green-600" : "bg-neutral-200"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${templeSettings.allowNewRegistration ? "left-7" : "left-1"}`} /></button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white border border-border-custom rounded-custom-md">
                          <div>
                            <span className="text-xs font-bold text-text-primary">Allow Daily Sadhana Check-ins</span>
                            <p className="text-[9px] text-text-secondary">Enable daily vow calendar check-in list submissions.</p>
                          </div>
                          <button type="button" onClick={() => setTempleSettings(prev => ({ ...prev, allowDailyCheckIn: !prev.allowDailyCheckIn }))} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${templeSettings.allowDailyCheckIn ? "bg-green-600" : "bg-neutral-200"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${templeSettings.allowDailyCheckIn ? "left-7" : "left-1"}`} /></button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white border border-border-custom rounded-custom-md">
                          <div>
                            <span className="text-xs font-bold text-text-primary">Allow Donations Forms</span>
                            <p className="text-[9px] text-text-secondary">Display support desk support contributions forms globally.</p>
                          </div>
                          <button type="button" onClick={() => setTempleSettings(prev => ({ ...prev, allowDonations: !prev.allowDonations }))} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${templeSettings.allowDonations ? "bg-green-600" : "bg-neutral-200"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${templeSettings.allowDonations ? "left-7" : "left-1"}`} /></button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white border border-border-custom rounded-custom-md">
                          <div>
                            <span className="text-xs font-bold text-text-primary">Allow Family Accounts Linkings</span>
                            <p className="text-[9px] text-text-secondary">Toggle profiles list select panels and family profile onboarding.</p>
                          </div>
                          <button type="button" onClick={() => setTempleSettings(prev => ({ ...prev, allowFamilyProfiles: !prev.allowFamilyProfiles }))} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${templeSettings.allowFamilyProfiles ? "bg-green-600" : "bg-neutral-200"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${templeSettings.allowFamilyProfiles ? "left-7" : "left-1"}`} /></button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white border border-border-custom rounded-custom-md">
                          <div>
                            <span className="text-xs font-bold text-text-primary">Enable Automated Portal Notifications</span>
                            <p className="text-[9px] text-text-secondary">Alert devotees on submissions approvals and donations verifications.</p>
                          </div>
                          <button type="button" onClick={() => setTempleSettings(prev => ({ ...prev, enableNotifications: !prev.enableNotifications }))} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${templeSettings.enableNotifications ? "bg-green-600" : "bg-neutral-200"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${templeSettings.enableNotifications ? "left-7" : "left-1"}`} /></button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white border border-border-custom rounded-custom-md">
                          <div>
                            <span className="text-xs font-bold text-red-600">Maintenance Lockout Mode</span>
                            <p className="text-[9px] text-text-secondary">Restrict standard devotee access to display maintenance screen.</p>
                          </div>
                          <button type="button" onClick={() => setTempleSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${templeSettings.maintenanceMode ? "bg-red-600" : "bg-neutral-200"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${templeSettings.maintenanceMode ? "left-7" : "left-1"}`} /></button>
                        </div>
                      </div>
                    </div>

                    {/* Section 10: Branding */}
                    <div className="flex flex-col gap-4 border-b border-border-custom pb-6">
                      <h4 className="font-display font-semibold text-primary text-xs uppercase tracking-wider">10. Portal & System Branding</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Portal Logo URL</label>
                          <div className="flex gap-2">
                            <input type="text" value={templeSettings.portalLogo || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, portalLogo: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("portalLogo", e.target.files[0])} className="text-xs w-28 text-text-secondary" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Admin Logo URL</label>
                          <div className="flex gap-2">
                            <input type="text" value={templeSettings.adminLogo || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, adminLogo: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("adminLogo", e.target.files[0])} className="text-xs w-28 text-text-secondary" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Loading Logo URL</label>
                          <div className="flex gap-2">
                            <input type="text" value={templeSettings.loadingLogo || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, loadingLogo: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("loadingLogo", e.target.files[0])} className="text-xs w-28 text-text-secondary" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Login Background URL</label>
                          <div className="flex gap-2">
                            <input type="text" value={templeSettings.loginBackground || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, loginBackground: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("loginBackground", e.target.files[0])} className="text-xs w-28 text-text-secondary" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Dashboard Banner URL</label>
                          <div className="flex gap-2">
                            <input type="text" value={templeSettings.dashboardBanner || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, dashboardBanner: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" />
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("dashboardBanner", e.target.files[0])} className="text-xs w-28 text-text-secondary" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 11: Advanced */}
                    <div className="flex flex-col gap-4">
                      <h4 className="font-display font-semibold text-primary text-xs uppercase tracking-wider">11. Advanced Analytics & Custom Tracking</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Google Analytics measurement ID</label>
                          <input type="text" value={templeSettings.googleAnalyticsId || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, googleAnalyticsId: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Meta Pixel ID</label>
                          <input type="text" value={templeSettings.metaPixelId || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, metaPixelId: e.target.value }))} className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Custom Head Scripts</label>
                          <textarea rows={2} value={templeSettings.customHeadScripts || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, customHeadScripts: e.target.value }))} className="px-3 py-2 text-xs font-mono rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" placeholder="<!-- e.g. <script src='...'></script> -->" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold">Custom Footer HTML</label>
                          <textarea rows={2} value={templeSettings.customFooterHtml || ""} onChange={(e) => setTempleSettings(prev => ({ ...prev, customFooterHtml: e.target.value }))} className="px-3 py-2 text-xs font-mono rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full" placeholder="<!-- e.g. <div>...</div> -->" />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded bg-primary hover:bg-primary/95 text-white text-[10px] font-bold uppercase tracking-wider shadow transition-all flex items-center justify-center gap-1.5 w-fit ml-auto cursor-pointer"
                    >
                      <Save size={14} />
                      <span>Save CMS Configuration</span>
                    </button>
                  </form>

                  {/* Database Backup & JSON file recovery center */}
                  <div className="flex flex-col gap-4 bg-red-50/15 border border-red-500/10 p-5 rounded-custom-lg mt-4">
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">System Database Backup & Disaster Recovery Desk</h4>
                      <p className="text-[10px] text-text-secondary mt-0.5">Download full JSON schemas copies or import saved files to overwrite database states.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                      <button
                        onClick={handleDownloadBackup}
                        className="px-4 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded shadow hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-1 w-full sm:w-fit"
                      >
                        <Download size={12} /> Download DB JSON Backup
                      </button>
                      
                      <div className="relative overflow-hidden w-full sm:w-fit">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleBackupRestoreUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          title="Restore Backup JSON file"
                        />
                        <button className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-text-primary text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer w-full text-center">
                          📥 Upload JSON Restore File
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 10: REPORTS EXPORTER CENTRE (STREAM 8) */}
              {activeTab === "reports" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-display font-semibold text-text-primary text-base">System Reports Exporter Desk</h3>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Export live temple registry entries & submission aggregates</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      {
                        title: "Devotees Registry CSV",
                        desc: "Export registrations details containing Streaks, Family groups, City and Phone numbers details.",
                        action: exportFamiliesCSV
                      },
                      {
                        title: "Vow Submissions CSV",
                        desc: "Download daily/monthly check-in logs history containing devotee claims and admin status notes.",
                        action: () => {
                          let csvContent = "data:text/csv;charset=utf-8,Devotee Name,Phone,Date,Activity,Claimed Points,Status,Remarks\n";
                          adminLogs.forEach(l => {
                            csvContent += `"${l.devoteeName}","${l.devoteePhone || ""}","${l.dateStr}","${l.activityName}",${l.points},"${l.status}","${l.remarks || ""}"\n`;
                          });
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement("a");
                          link.href = encodedUri;
                          link.download = `Sadhana_Vow_Submissions_Report_${new Date().toISOString().split("T")[0]}.csv`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          showNotification("Vow submissions report CSV exported!");
                        }
                      },
                      {
                        title: "UPI Donations Registry CSV",
                        desc: "Export donation receipts registers containing Transaction reference strings, timestamps and audit statuses.",
                        action: () => {
                          let csvContent = "data:text/csv;charset=utf-8,Donor Name,Phone,Amount,Txn ID,Verified,Submitted At\n";
                          donations.forEach(d => {
                            csvContent += `"${d.donorName}","${d.phone}",${d.amount},"${d.txnId}","${d.verified ? "YES" : "NO"}","${d.createdAt || d.created_at || ""}"\n`;
                          });
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement("a");
                          link.href = encodedUri;
                          link.download = `UPI_Donations_Registry_Report_${new Date().toISOString().split("T")[0]}.csv`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          showNotification("UPI donations report CSV exported!");
                        }
                      }
                    ].map((item, i) => (
                      <div key={i} className="p-4 bg-neutral-50/50 border border-border-custom rounded-custom-lg flex flex-col justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-text-primary text-xs">{item.title}</h4>
                          <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                        <button
                          onClick={item.action}
                          className="px-3 py-1.5 bg-primary text-white hover:bg-primary/95 font-bold uppercase text-[9px] tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Download size={11} /> Download Report
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 11: SYSTEM AUDIT LOGS TIMELINE FEED (STREAM 12) */}
              {activeTab === "audit" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-display font-semibold text-text-primary text-base">System Audit Desk</h3>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Permanent immutable timeline of administrative configuration changes</p>
                  </div>

                  <div className="border border-border-custom rounded-custom-lg overflow-hidden w-full bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-bg-custom text-[9px] uppercase font-bold text-text-secondary tracking-wider border-b border-border-custom">
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Administrator</th>
                            <th className="p-3">Action Type</th>
                            <th className="p-3">Target ID</th>
                            <th className="p-3">Action Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditLogs.length > 0 ? (
                            auditLogs.map(log => (
                              <tr key={log.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors text-[11px]">
                                <td className="p-3 text-text-secondary font-mono text-[9px]">
                                  {new Date(log.created_at || log.createdAt).toLocaleString()}
                                </td>
                                <td className="p-3 font-semibold text-text-primary">
                                  {log.admin_name || log.adminName}
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-text-secondary text-[8px] font-bold uppercase border tracking-wider">
                                    {log.action}
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-text-secondary text-[9px]">
                                  {log.target_id || log.targetId || "system"}
                                </td>
                                <td className="p-3 text-text-primary leading-normal font-medium">
                                  {log.details}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-text-secondary italic">
                                No actions have been logged yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirmation: Delete devotee profile */}
      {profileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setProfileToDelete(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-custom-lg border border-border-custom p-6 shadow-premium z-10 flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h4 className="font-display font-semibold text-text-primary text-base">Delete Devotee Account?</h4>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Are you sure you want to delete devotee profile <strong>{profileToDelete.fullName}</strong>? This will erase all check-in history permanently.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setProfileToDelete(null)} disabled={isDeleting} className="flex-1 py-2 text-[10px] font-bold uppercase border border-border-custom hover:bg-neutral-50 rounded transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={handleDeleteProfileConfirm} disabled={isDeleting} className="flex-1 py-2 text-[10px] font-bold uppercase bg-red-600 text-white hover:bg-red-700 rounded transition-all cursor-pointer">
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation: Delete Worship timetable activity */}
      {scheduleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setScheduleToDelete(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-custom-lg border border-border-custom p-6 shadow-premium z-10 flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h4 className="font-display font-semibold text-text-primary text-base">Delete Timetable Activity?</h4>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Are you sure you want to delete activity <strong>{scheduleToDelete.activity}</strong> scheduled at {scheduleToDelete.time}?
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setScheduleToDelete(null)} disabled={isDeleting} className="flex-1 py-2 text-[10px] font-bold uppercase border border-border-custom hover:bg-neutral-50 rounded transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={handleDeleteScheduleConfirm} disabled={isDeleting} className="flex-1 py-2 text-[10px] font-bold uppercase bg-red-600 text-white hover:bg-red-700 rounded transition-all cursor-pointer">
                {isDeleting ? "Deleting..." : "Delete Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation: Delete Announcement */}
      {annToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setAnnToDelete(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-custom-lg border border-border-custom p-6 shadow-premium z-10 flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h4 className="font-display font-semibold text-text-primary text-base">Delete Announcement?</h4>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Are you sure you want to delete notice <strong>{annToDelete.title}</strong>? It will no longer be visible on devotee noticeboards.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setAnnToDelete(null)} disabled={isDeleting} className="flex-1 py-2 text-[10px] font-bold uppercase border border-border-custom hover:bg-neutral-50 rounded transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={handleDeleteAnnConfirm} disabled={isDeleting} className="flex-1 py-2 text-[10px] font-bold uppercase bg-red-600 text-white hover:bg-red-700 rounded transition-all cursor-pointer">
                {isDeleting ? "Deleting..." : "Delete Notice"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

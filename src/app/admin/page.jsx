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
  ChevronRight
} from "lucide-react";
import { db } from "@/services/db";
import { useAuth } from "@/context/AuthContext";
import { translations } from "@/services/translations";

export default function Admin() {
  const router = useRouter();
  const { user, profile, loading, isAdmin, logout } = useAuth();
  
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
      // 1. Fetch Analytics
      const stats = await db.getAdminAnalytics();
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
      showNotification("Temple console settings updated successfully.");
    } catch (e) {
      console.error(e);
      showNotification("Failed to update settings.", "error");
    }
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

        <button 
          onClick={handleLogout}
          className="px-4 py-2 rounded-custom-md bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer w-fit"
        >
          <LogOut size={14} />
          <span>Exit Panel</span>
        </button>
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
              {/* TAB 0: ANALYTICS DASHBOARD */}
              {activeTab === "analytics" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-display font-semibold text-text-primary text-base">Temple Analytics Summary</h3>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Real-time system parameters</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="p-5 rounded-custom-lg border border-border-custom bg-neutral-50/50">
                      <span className="text-xl">👥</span>
                      <h4 className="text-2xl font-bold font-display text-text-primary mt-3">{analytics.devoteesCount}</h4>
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mt-1">Devotees Registered</p>
                    </div>
                    <div className="p-5 rounded-custom-lg border border-border-custom bg-neutral-50/50">
                      <span className="text-xl">🪷</span>
                      <h4 className="text-2xl font-bold font-display text-text-primary mt-3">{analytics.totalPoints}</h4>
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mt-1">Total Points Accumulated</p>
                    </div>
                    <div className="p-5 rounded-custom-lg border border-border-custom bg-neutral-50/50">
                      <span className="text-xl">📝</span>
                      <h4 className="text-2xl font-bold font-display text-text-primary mt-3">{analytics.logsCount}</h4>
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mt-1">Total Submissions</p>
                    </div>
                    <div className="p-5 rounded-custom-lg border border-border-custom bg-neutral-50/50">
                      <span className="text-xl">✓</span>
                      <h4 className="text-2xl font-bold font-display text-text-primary mt-3">{analytics.approvedLogsCount}</h4>
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mt-1">Approved Check-ins</p>
                    </div>
                    <div className="p-5 rounded-custom-lg border border-border-custom bg-neutral-50/50">
                      <span className="text-xl">💰</span>
                      <h4 className="text-2xl font-bold font-display text-text-primary mt-3">₹ {analytics.totalDonations.toLocaleString("en-IN")}</h4>
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mt-1">Total Donations Filed</p>
                    </div>
                    <div className="p-5 rounded-custom-lg border border-border-custom bg-neutral-50/50">
                      <span className="text-xl">🎖️</span>
                      <h4 className="text-2xl font-bold font-display text-text-primary mt-3">₹ {analytics.verifiedDonations.toLocaleString("en-IN")}</h4>
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mt-1">Verified Donations (80G)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: APPROVALS */}
              {activeTab === "approvals" && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-semibold text-text-primary text-base">Check-in Approvals Sheet</h3>
                      <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Approve devotee daily vow logs</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select 
                        value={logStatusFilter} 
                        onChange={(e) => { setLogStatusFilter(e.target.value); reloadLogsOnly(e.target.value); }}
                        className="px-3 py-1.5 text-xs rounded border border-border-custom text-text-primary font-semibold focus:outline-none"
                      >
                        <option value="Pending">Pending Approvals</option>
                        <option value="Approved">Approved Logs</option>
                        <option value="Rejected">Rejected Logs</option>
                      </select>
                      
                      {logStatusFilter === "Pending" && adminLogs.length > 0 && (
                        <button
                          onClick={handleApproveAllPending}
                          className="px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Approve All
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="border border-border-custom rounded-custom-lg overflow-hidden w-full">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-bg-custom text-[9px] uppercase font-bold text-text-secondary tracking-wider border-b border-border-custom">
                            <th className="p-3">Devotee</th>
                            <th className="p-3">Log Date</th>
                            <th className="p-3">Activity</th>
                            <th className="p-3 text-right">Points</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminLogs.length > 0 ? (
                            adminLogs.map(log => (
                              <tr key={log.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                                <td className="p-3">
                                  <div className="font-semibold text-text-primary">{log.devoteeName}</div>
                                  <div className="text-[9px] text-text-secondary mt-0.5">{log.devoteePhone}</div>
                                </td>
                                <td className="p-3 text-text-secondary font-medium">{log.dateStr}</td>
                                <td className="p-3">
                                  <span className="font-semibold text-text-primary">{log.activityName}</span>
                                  <span className="text-[9px] text-text-secondary ml-1.5 uppercase font-medium">{log.activityCategory}</span>
                                </td>
                                <td className="p-3 text-right font-bold text-primary">+{log.points}</td>
                                <td className="p-3 text-center">
                                  <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block ${
                                    log.status === "Approved" 
                                      ? "bg-green-50 text-green-700 border-green-500/10" 
                                      : log.status === "Rejected" 
                                      ? "bg-red-50 text-red-700 border-red-500/10" 
                                      : "bg-orange-50 text-orange-700 border-orange-500/10"
                                  }`}>
                                    {log.status}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  {log.status === "Pending" ? (
                                    <div className="flex justify-end gap-1">
                                      <button 
                                        onClick={() => handleUpdateLogStatus(log.id, "Approved")}
                                        className="p-1 rounded bg-green-50 hover:bg-green-100 text-green-600 cursor-pointer"
                                        title="Approve"
                                      >
                                        <Check size={12} strokeWidth={2.5} />
                                      </button>
                                      <button 
                                        onClick={() => handleUpdateLogStatus(log.id, "Rejected")}
                                        className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                                        title="Reject"
                                      >
                                        <XCircle size={12} />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[9px] text-text-secondary font-medium">Locked</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-text-secondary italic">
                                No check-in log records found for this status.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DEVOTEE ACCOUNTS */}
              {activeTab === "profiles" && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-semibold text-text-primary text-base">Registered Devotee Profiles</h3>
                      <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Manage family account devotees</p>
                    </div>

                    <div className="relative max-w-xs w-full">
                      <input 
                        type="text"
                        placeholder="Search by name or phone..."
                        value={profileSearch}
                        onChange={(e) => setProfileSearch(e.target.value)}
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
                            <th className="p-3">Name</th>
                            <th className="p-3">Member No</th>
                            <th className="p-3">Phone</th>
                            <th className="p-3">Residence</th>
                            <th className="p-3 text-right">Points</th>
                            <th className="p-3 text-right">Streak</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const filtered = allProfiles.filter(p => 
                              p.fullName.toLowerCase().includes(profileSearch.toLowerCase()) ||
                              (p.phone && p.phone.includes(profileSearch))
                            );
                            
                            return filtered.length > 0 ? (
                              filtered.map(p => (
                                <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                                  <td className="p-3 font-semibold text-text-primary flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs border border-primary/10 overflow-hidden">
                                      {p.avatar ? <img src={p.avatar} alt="avatar" className="w-full h-full object-cover" /> : "🪷"}
                                    </div>
                                    <span>{p.fullName}</span>
                                  </td>
                                  <td className="p-3 text-text-secondary font-medium">Member {p.memberNumber}</td>
                                  <td className="p-3 text-text-secondary font-semibold">{p.phone || "None"}</td>
                                  <td className="p-3 text-text-secondary font-medium">{p.city}</td>
                                  <td className="p-3 text-right font-bold text-primary">{p.totalPoints || 0}</td>
                                  <td className="p-3 text-right font-semibold text-text-primary">🔥 {p.streak || 0}</td>
                                  <td className="p-3 text-right">
                                    {p.memberNumber === 2 ? (
                                      <button 
                                        onClick={() => setProfileToDelete(p)}
                                        className="p-1 text-text-secondary hover:text-red-600 transition-colors cursor-pointer"
                                        title="Delete Devotee Account"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    ) : (
                                      <span className="text-[9px] text-text-secondary font-semibold">Primary</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="p-8 text-center text-text-secondary italic">
                                  No profiles matched your search parameters.
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

              {/* TAB 9: SETTINGS CONSOLE */}
              {activeTab === "settings" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-display font-semibold text-text-primary text-base">Temple Settings Console</h3>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Edit Temple profiles & configurations</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="flex flex-col gap-5 bg-neutral-50/50 p-5 rounded-custom-lg border border-border-custom">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Temple Name</label>
                        <input 
                          type="text" 
                          value={templeSettings.templeName}
                          onChange={(e) => setTempleSettings(prev => ({ ...prev, templeName: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary font-medium focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Contact Number</label>
                        <input 
                          type="text" 
                          value={templeSettings.contactNumber}
                          onChange={(e) => setTempleSettings(prev => ({ ...prev, contactNumber: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary font-medium focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Temple Address</label>
                        <input 
                          type="text" 
                          value={templeSettings.templeAddress}
                          onChange={(e) => setTempleSettings(prev => ({ ...prev, templeAddress: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary font-medium focus:outline-none"
                          required
                        />
                      </div>
                      
                      {/* Bank Details */}
                      <div className="sm:col-span-2 border-t border-neutral-200 mt-2 pt-3">
                        <h4 className="text-xs font-bold text-primary mb-3">Bank Details (Donation Desk)</h4>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">UPI ID</label>
                        <input 
                          type="text" 
                          value={templeSettings.upiId}
                          onChange={(e) => setTempleSettings(prev => ({ ...prev, upiId: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary font-medium focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Bank Name</label>
                        <input 
                          type="text" 
                          value={templeSettings.bankName}
                          onChange={(e) => setTempleSettings(prev => ({ ...prev, bankName: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary font-medium focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Account Holder Name</label>
                        <input 
                          type="text" 
                          value={templeSettings.accountHolder}
                          onChange={(e) => setTempleSettings(prev => ({ ...prev, accountHolder: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary font-medium focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Account Number</label>
                        <input 
                          type="text" 
                          value={templeSettings.accountNumber}
                          onChange={(e) => setTempleSettings(prev => ({ ...prev, accountNumber: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary font-medium focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">IFSC Code</label>
                        <input 
                          type="text" 
                          value={templeSettings.ifsc}
                          onChange={(e) => setTempleSettings(prev => ({ ...prev, ifsc: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom bg-white text-text-primary font-medium focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded bg-primary hover:bg-primary/95 text-white text-[10px] font-bold uppercase tracking-wider shadow transition-all flex items-center justify-center gap-1.5 w-fit ml-auto cursor-pointer"
                    >
                      <Save size={14} />
                      <span>Save Settings</span>
                    </button>
                  </form>
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

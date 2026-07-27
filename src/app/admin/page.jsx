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
import { storageService } from "@/services/storageService";
import { useAuth } from "@/context/AuthContext";
import { translations } from "@/services/translations";
import { useCMS } from "@/context/CMSContext";
import { sanitizeHTML } from "@/lib/sanitize";
const toReadableId = (uuid = "", prefix = "ID", padLen = 4) => {
  if (!uuid) return `${prefix}-0000`;
  const num = parseInt(uuid.replace(/-/g, "").slice(-6), 16) % 10000;
  return `${prefix}-${String(num).padStart(padLen, "0")}`;
};

function ImageUpload({ label, value, onChange, accept = "image/png, image/jpeg, image/jpg, image/webp" }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const inputRef = React.useRef(null);

  const getFileSize = (str) => {
    if (!str) return null;
    if (typeof str === "string" && str.startsWith("data:")) {
      const base64Length = str.length - (str.indexOf(",") + 1);
      const sizeInBytes = Math.round((base64Length * 3) / 4);
      if (sizeInBytes > 1024 * 1024) return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    }
    return "Asset File";
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.match(/image\/(png|jpeg|jpg|webp)/i)) {
      alert("Please upload a valid image file (PNG, JPG, JPEG, or WEBP)");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result);
      setUploadStatus("Uploaded successfully!");
      setTimeout(() => setUploadStatus(""), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const fileSize = getFileSize(value);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">{label}</label>

      {value ? (
        <div className="relative flex items-center gap-4 p-3 rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="w-16 h-16 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center overflow-hidden shrink-0">
            <img src={value} alt={label} className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <span className="text-xs font-semibold text-text-primary truncate">{label}</span>
            {fileSize && (
              <span className="text-[10px] text-text-secondary">Size: {fileSize}</span>
            )}
            {uploadStatus && (
              <span className="text-[10px] text-emerald-600 font-bold">✓ {uploadStatus}</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[#1F2937] text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${dragActive
              ? "border-[#EA580C] bg-[#FFF7ED]"
              : "border-neutral-200 bg-white hover:border-[#EA580C]/40 hover:bg-[#FFF7ED]/20"
            }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center text-lg">
            📷
          </div>
          <div>
            <span className="text-xs font-bold text-text-primary block">Click or Drag & Drop to Upload</span>
            <span className="text-[10px] text-text-secondary">PNG, JPG, JPEG, or WEBP supported</span>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />
    </div>
  );
}

export default function Admin() {
  const router = useRouter();
  const { user, profile, loading, isAdmin, logout } = useAuth();
  const { refreshCMS } = useCMS();

  const [lang, setLang] = useState("en");
  const [activeTab, setActiveTab] = useState("analytics");
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success"); // success, error

  // CMS Save & Status States
  const [cmsSaveState, setCmsSaveState] = useState("published"); // published, unsaved, saving, failed
  const [lastSavedTime, setLastSavedTime] = useState("6:42 PM");
  const [isDirty, setIsDirty] = useState(false);
  const [isSavingCms, setIsSavingCms] = useState(false);
  const [floatingToast, setFloatingToast] = useState(null);
  const initialSettingsRef = React.useRef("");

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
  const [logStatusFilter, setLogStatusFilter] = useState("Approved");
  const [donationSearch, setDonationSearch] = useState("");

  const [editedLogActivities, setEditedLogActivities] = useState({});
  const [isSavingLog, setSavingLog] = useState({});

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
  const [newAnn, setNewAnn] = useState({
    id: "",
    title: "",
    content: "",
    priority: "normal",
    pinned: false,
    active: true,
    publishDate: "",
    publishTime: "",
    expiryDate: "",
    expiryTime: ""
  });
  const [annPage, setAnnPage] = useState(1);
  const [annLimit, setAnnLimit] = useState(5);
  const [annTotal, setAnnTotal] = useState(0);
  const [annSearch, setAnnSearch] = useState("");
  const [annStatusFilter, setAnnStatusFilter] = useState("");
  const [annPriorityFilter, setAnnPriorityFilter] = useState("");
  const [annPinnedFilter, setAnnPinnedFilter] = useState(null);
  const [annDateStart, setAnnDateStart] = useState("");
  const [annDateEnd, setAnnDateEnd] = useState("");
  const [isEditingAnn, setIsEditingAnn] = useState(false);
  const [annPreview, setAnnPreview] = useState(null);
  const [showAnnPreview, setShowAnnPreview] = useState(false);

  const [newEvent, setNewEvent] = useState({ title: "", description: "", date: "", location: "", imageUrl: "" });
  const [panchangDate, setPanchangDate] = useState(() => {
    const local = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  });
  const [panchangVal, setPanchangVal] = useState({
    tithi: "",
    month: "Chatra",
    paksha: "Shukla",
    sunrise: "06:00 AM",
    sunset: "07:00 PM",
    shubh_din: false,
    samayik: false,
    event: "",
    nakshatra: "",
    yoga: "",
    karana: "",
    moonSign: "",
    specialNotes: "",
    fastingInfo: "",
    importantTimings: "",
    additionalRemarks: "",
    festival: ""
  });
  const [panchangVersionsList, setPanchangVersionsList] = useState([]);
  const [adminCalYear, setAdminCalYear] = useState(() => new Date().getFullYear());
  const [adminCalMonth, setAdminCalMonth] = useState(() => new Date().getMonth() + 1);
  const [adminMonthPanchangs, setAdminMonthPanchangs] = useState({});

  useEffect(() => {
    if (user && isAdmin) {
      const loadMonthData = async () => {
        try {
          const data = await db.getPanchangForMonth(adminCalYear, adminCalMonth);
          setAdminMonthPanchangs(data);
        } catch (e) {
          console.error("Month panchang load failed", e);
        }
      };
      loadMonthData();
    }
  }, [adminCalYear, adminCalMonth, user, isAdmin, panchangDate]);

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
            event: data.event || "",
            nakshatra: data.nakshatra || "",
            yoga: data.yoga || "",
            karana: data.karana || "",
            moonSign: data.moonSign || "",
            specialNotes: data.specialNotes || "",
            fastingInfo: data.fastingInfo || "",
            importantTimings: data.importantTimings || "",
            additionalRemarks: data.additionalRemarks || "",
            festival: data.festival || ""
          });

          const history = await db.getPanchangVersions(panchangDate);
          setPanchangVersionsList(history);
        } catch (e) {
          console.error("Panchang load failed", e);
        }
      };
      fetchPanchangForDate();
    }
  }, [panchangDate, user, isAdmin]);

  // Handle setting field change & track dirty state
  const handleSettingChange = (key, value) => {
    setTempleSettings(prev => {
      const updated = { ...prev, [key]: value };
      if (JSON.stringify(updated) !== initialSettingsRef.current) {
        setIsDirty(true);
        setCmsSaveState("unsaved");
      } else {
        setIsDirty(false);
        setCmsSaveState("published");
      }
      return updated;
    });
  };

  // Unsaved changes browser prompt protection
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Leave without saving?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Auto-reload announcements on filter/pagination changes
  useEffect(() => {
    if (user && isAdmin) {
      loadAnnouncementsAdmin();
    }
  }, [annPage, annLimit, annSearch, annStatusFilter, annPriorityFilter, annPinnedFilter, annDateStart, annDateEnd, user, isAdmin]);

  const showNotification = (msg, type = "success") => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => setStatusMessage(""), 5000);
  };

  const loadAnnouncementsAdmin = async () => {
    try {
      const result = await db.getAnnouncementsAdmin({
        page: annPage,
        limit: annLimit,
        search: annSearch,
        status: annStatusFilter,
        priority: annPriorityFilter,
        pinned: annPinnedFilter,
        dateStart: annDateStart,
        dateEnd: annDateEnd
      });
      setAnnouncements(result.data);
      setAnnTotal(result.totalCount);
    } catch (err) {
      console.error("Failed to load admin announcements:", err);
    }
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
      await loadAnnouncementsAdmin();

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
      initialSettingsRef.current = JSON.stringify(settingsData);
      setIsDirty(false);
      setCmsSaveState("published");

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

    let createdAtIso = undefined;
    if (newAnn.publishDate) {
      const timeStr = newAnn.publishTime || "00:00";
      createdAtIso = new Date(`${newAnn.publishDate}T${timeStr}`).toISOString();
    }

    let expiresAtIso = null;
    if (newAnn.expiryDate) {
      const timeStr = newAnn.expiryTime || "23:59";
      expiresAtIso = new Date(`${newAnn.expiryDate}T${timeStr}`).toISOString();
    }

    try {
      const payload = {
        title: newAnn.title,
        content: newAnn.content,
        priority: newAnn.priority,
        pinned: newAnn.pinned === true,
        active: newAnn.active !== false,
        createdAt: createdAtIso,
        expiresAt: expiresAtIso
      };

      if (isEditingAnn) {
        await db.updateAnnouncement(newAnn.id, payload);
        showNotification("Notice updated successfully.");
      } else {
        await db.createAnnouncement(payload);
        showNotification("Notice announced successfully.");
      }

      setNewAnn({
        id: "",
        title: "",
        content: "",
        priority: "normal",
        pinned: false,
        active: true,
        publishDate: "",
        publishTime: "",
        expiryDate: "",
        expiryTime: ""
      });
      setIsEditingAnn(false);
      await loadAnnouncementsAdmin();
    } catch (err) {
      console.error(err);
      showNotification("Failed to save announcement.", "error");
    }
  };

  const handleEditAnnClick = (ann) => {
    let pDate = "";
    let pTime = "";
    if (ann.createdAt) {
      const dt = new Date(ann.createdAt);
      pDate = dt.toISOString().split("T")[0];
      pTime = dt.toTimeString().slice(0, 5);
    }

    let eDate = "";
    let eTime = "";
    if (ann.expiresAt) {
      const dt = new Date(ann.expiresAt);
      eDate = dt.toISOString().split("T")[0];
      eTime = dt.toTimeString().slice(0, 5);
    }

    setNewAnn({
      id: ann.id,
      title: ann.title,
      content: ann.content,
      priority: ann.priority,
      pinned: ann.pinned,
      active: ann.active,
      publishDate: pDate,
      publishTime: pTime,
      expiryDate: eDate,
      expiryTime: eTime
    });
    setIsEditingAnn(true);
  };

  const handleCancelEditAnn = () => {
    setNewAnn({
      id: "",
      title: "",
      content: "",
      priority: "normal",
      pinned: false,
      active: true,
      publishDate: "",
      publishTime: "",
      expiryDate: "",
      expiryTime: ""
    });
    setIsEditingAnn(false);
  };

  const injectFormat = (tagStart, tagEnd) => {
    const txtArea = document.getElementById("ann-content-textarea");
    if (!txtArea) return;
    const start = txtArea.selectionStart;
    const end = txtArea.selectionEnd;
    const text = newAnn.content || "";
    const selected = text.substring(start, end);
    const replacement = tagStart + selected + tagEnd;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setNewAnn(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      txtArea.focus();
      txtArea.setSelectionRange(start + tagStart.length, start + tagStart.length + selected.length);
    }, 0);
  };

  const handleDeleteAnnConfirm = async () => {
    if (!annToDelete) return;
    setIsDeleting(true);
    try {
      await db.deleteAnnouncement(annToDelete.id);
      setAnnToDelete(null);
      showNotification("Announcement deleted successfully.");
      await loadAnnouncementsAdmin();
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete announcement.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month - 1, 1).getDay();

  const renderAdminCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(adminCalYear, adminCalMonth);
    const firstDayIndex = getFirstDayOfMonth(adminCalYear, adminCalMonth);
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const dayCells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      dayCells.push(<div key={`empty-${i}`} className="h-10 border border-neutral-100 bg-neutral-50/50" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${adminCalYear}-${adminCalMonth.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      const isSelected = dateStr === panchangDate;

      const today = new Date();
      const isToday = today.getFullYear() === adminCalYear && (today.getMonth() + 1) === adminCalMonth && today.getDate() === day;

      const record = adminMonthPanchangs[dateStr];
      const hasFestival = record && (record.festival || record.event);
      const hasFasting = record && record.fastingInfo;
      const isShubh = record && record.shubh_din;
      const isSamayik = record && record.samayik;

      dayCells.push(
        <button
          key={`day-${day}`}
          type="button"
          onClick={() => setPanchangDate(dateStr)}
          className={`h-10 border border-neutral-100 text-left p-1 text-[10px] font-semibold flex flex-col justify-between transition-all select-none hover:bg-primary/5 cursor-pointer ${isSelected
            ? "bg-primary/10 text-primary border-primary/30 font-bold ring-1 ring-primary"
            : isToday
              ? "bg-orange-50 text-primary border-orange-200"
              : "bg-white text-text-primary"
            }`}
        >
          <div className="flex justify-between items-center w-full">
            <span>{day}</span>
            <div className="flex gap-0.5">
              {isShubh && <span className="text-[7px]" title="Shubh Din">卐</span>}
              {isSamayik && <span className="text-[7px]" title="Samayik">📖</span>}
            </div>
          </div>

          <div className="flex gap-0.5 items-center w-full overflow-hidden">
            {hasFestival && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title={record.festival || record.event} />
            )}
            {hasFasting && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" title={record.fastingInfo} />
            )}
            {record && record.tithi && (
              <span className="text-[7px] text-text-secondary truncate max-w-[35px] font-medium leading-none">
                {record.tithi.replace("Sud", "S").replace("Vad", "V")}
              </span>
            )}
          </div>
        </button>
      );
    }

    const totalCells = dayCells.length;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remaining; i++) {
      dayCells.push(<div key={`empty-end-${i}`} className="h-10 border border-neutral-100 bg-neutral-50/50" />);
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[8px] uppercase tracking-wider text-text-secondary bg-neutral-50 py-1.5 rounded border border-border-custom">
          {dayLabels.map(label => <div key={label}>{label}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 rounded overflow-hidden border border-border-custom bg-neutral-100/35">
          {dayCells}
        </div>
      </div>
    );
  };

  // --- CRUD: Panchang ---
  const handleSavePanchang = async () => {
    try {
      await db.updatePanchang(panchangDate, panchangVal);
      showNotification(`Panchang configurations updated for ${panchangDate}`);
      const history = await db.getPanchangVersions(panchangDate);
      setPanchangVersionsList(history);
    } catch (err) {
      console.error(err);
      showNotification("Failed to save panchang.", "error");
    }
  };

  const handleRestorePanchangVersion = (ver) => {
    setPanchangVal({
      tithi: ver.tithi || "",
      month: ver.month || "Chatra",
      paksha: ver.paksha || "Shukla",
      sunrise: ver.sunrise || "06:00 AM",
      sunset: ver.sunset || "07:00 PM",
      shubh_din: !!ver.shubh_din,
      samayik: !!ver.samayik,
      event: ver.event || "",
      nakshatra: ver.nakshatra || "",
      yoga: ver.yoga || "",
      karana: ver.karana || "",
      moonSign: ver.moonSign || "",
      specialNotes: ver.specialNotes || "",
      fastingInfo: ver.fastingInfo || "",
      importantTimings: ver.importantTimings || "",
      additionalRemarks: ver.additionalRemarks || "",
      festival: ver.festival || ""
    });
    showNotification(`Restored inputs to Version ${ver.versionNumber}. Click "Save Panchang" to commit changes.`);
  };

  const handlePanchangImportCSV = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        showNotification("CSV is empty or invalid.", "error");
        return;
      }

      const headers = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
      const rows = [];
      const validationErrors = [];

      for (let i = 1; i < lines.length; i++) {
        const rowVals = [];
        let inQuotes = false;
        let currentVal = "";
        const line = lines[i];
        for (let charIdx = 0; charIdx < line.length; charIdx++) {
          const char = line[charIdx];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            rowVals.push(currentVal.trim().replace(/^["']|["']$/g, ""));
            currentVal = "";
          } else {
            currentVal += char;
          }
        }
        rowVals.push(currentVal.trim().replace(/^["']|["']$/g, ""));

        if (rowVals.length < headers.length) {
          validationErrors.push(`Row ${i + 1}: Column count mismatch`);
          continue;
        }

        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = rowVals[idx];
        });

        const dateStr = rowObj.date || rowObj.date_str || "";
        const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
        if (!isDateValid) {
          validationErrors.push(`Row ${i + 1}: Invalid date format "${dateStr}" (use YYYY-MM-DD)`);
          continue;
        }

        const tithi = rowObj.tithi || "";
        if (!tithi) {
          validationErrors.push(`Row ${i + 1}: Missing tithi`);
          continue;
        }

        rows.push({
          dateStr,
          tithi,
          month: rowObj.month || "Chatra",
          paksha: rowObj.paksha || "Shukla",
          sunrise: rowObj.sunrise || "06:00 AM",
          sunset: rowObj.sunset || "07:00 PM",
          festival: rowObj.festival || "",
          event: rowObj.event || "",
          nakshatra: rowObj.nakshatra || "",
          yoga: rowObj.yoga || "",
          karana: rowObj.karana || "",
          moonSign: rowObj.moon_sign || rowObj.moonsign || "",
          specialNotes: rowObj.special_notes || rowObj.specialnotes || "",
          fastingInfo: rowObj.fasting_info || rowObj.fastinginfo || "",
          importantTimings: rowObj.important_timings || rowObj.importanttimings || "",
          additionalRemarks: rowObj.additional_remarks || rowObj.additionalremarks || "",
          shubh_din: rowObj.shubh_din === "true" || rowObj.shubh_din === "1",
          samayik: rowObj.samayik === "true" || rowObj.samayik === "1"
        });
      }

      if (validationErrors.length > 0) {
        alert("Validation Errors Found:\n" + validationErrors.slice(0, 10).join("\n") + (validationErrors.length > 10 ? `\n...and ${validationErrors.length - 10} more` : ""));
        showNotification("Import aborted due to validation failures.", "error");
        return;
      }

      setIsDeleting(true);
      try {
        for (const row of rows) {
          await db.updatePanchang(row.dateStr, row);
        }
        showNotification(`Successfully imported ${rows.length} panchang entries.`);
        const currentData = await db.getPanchang(panchangDate);
        setPanchangVal(currentData);
        const history = await db.getPanchangVersions(panchangDate);
        setPanchangVersionsList(history);
      } catch (err) {
        console.error("Import failed:", err);
        showNotification("Import failed to commit.", "error");
      } finally {
        setIsDeleting(false);
      }
    };
    reader.readAsText(file);
  };

  const handlePanchangExportCSV = async (mode) => {
    let startDate = "1970-01-01";
    let endDate = "9999-12-31";
    const [selYear, selMonth] = panchangDate.split("-");

    if (mode === "month") {
      startDate = `${selYear}-${selMonth}-01`;
      endDate = `${selYear}-${selMonth}-31`;
    } else if (mode === "year") {
      startDate = `${selYear}-01-01`;
      endDate = `${selYear}-12-31`;
    }

    try {
      let exportData = [];
      if (db.isSupabaseConfigured && db.supabase) {
        const { data } = await db.supabase
          .from("panchang")
          .select("*")
          .gte("date_str", startDate)
          .lte("date_str", endDate)
          .order("date_str", { ascending: true });
        if (data) exportData = data;
      } else {
        const records = getLocalItem("temp_tithi_panchang", DEFAULT_PANCHANG);
        exportData = Object.keys(records)
          .filter(d => d >= startDate && d <= endDate)
          .sort()
          .map(d => ({ date_str: d, ...records[d] }));
      }

      let csvContent = "data:text/csv;charset=utf-8,Date,Tithi,Month,Paksha,Sunrise,Sunset,Festival,Event,Nakshatra,Yoga,Karana,Moon_Sign,Special_Notes,Fasting_Info,Important_Timings,Additional_Remarks,Shubh_Din,Samayik\n";

      exportData.forEach(row => {
        const clean = (val) => {
          if (val === null || val === undefined) return "";
          return `"${String(val).replace(/"/g, '""')}"`;
        };
        csvContent += `${row.date_str || ""},${clean(row.tithi)},${clean(row.month)},${clean(row.paksha)},${clean(row.sunrise)},${clean(row.sunset)},${clean(row.festival)},${clean(row.event)},${clean(row.nakshatra)},${clean(row.yoga)},${clean(row.karana)},${clean(row.moon_sign || row.moonSign)},${clean(row.special_notes || row.specialNotes)},${clean(row.fasting_info || row.fastingInfo)},${clean(row.important_timings || row.importantTimings)},${clean(row.additional_remarks || row.additionalRemarks)},${row.shubh_din || false},${row.samayik || false}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Jain_Panchang_Export_${mode}_${panchangDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification("Panchang CSV exported successfully.");
    } catch (e) {
      console.error(e);
      showNotification("Export failed.", "error");
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

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      await db.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      showNotification("Event deleted successfully.");
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete event.", "error");
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
      const persistedList = await db.updateSadhanaActivities(list);
      setSadhanaActivities(persistedList);
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

  // --- CRUD: Settings Console (Production Pipeline - Single Image Upload & Post-Upload Diffing) ---
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    if (isSavingCms) return;
    setIsSavingCms(true);
    setCmsSaveState("saving");

    const pipelineStartTime = Date.now();

    try {
      let initialObj = {};
      try { initialObj = JSON.parse(initialSettingsRef.current || "{}"); } catch { /* ignore */ }

      // 1. Storage Upload Phase: Upload each physical image ONCE to Supabase Storage & sync aliases
      const { processedObj, uploadCount, uploadedFields, totalUploadTimeMs } =
        await storageService.processImageUploadsWithAliases(templeSettings, initialObj);

      // Update form state with returned Storage HTTPS URLs (0 Base64 strings survive)
      setTempleSettings(processedObj);

      // 2. Post-Upload Diffing Phase: Compare final Storage URLs against initial settings
      const changedFields = {};
      const modifiedKeysList = [];
      Object.keys(processedObj).forEach(key => {
        if (processedObj[key] !== initialObj[key]) {
          changedFields[key] = processedObj[key];
          modifiedKeysList.push(key);
        }
      });

      console.log("=================================================");
      console.log("📊 [CMS PRE-PATCH TELEMETRY AUDIT]");
      console.log(`• Uploaded Image Count: ${uploadCount} (Physical Uploads)`);
      console.log(`• Modified Image Fields: ${uploadedFields.length > 0 ? uploadedFields.join(", ") : "None"}`);
      console.log(`• Storage Upload Duration: ${totalUploadTimeMs} ms`);
      console.log(`• Total Changed Fields to Update: ${modifiedKeysList.length}`);
      console.log(`• List of Changed Fields:`, modifiedKeysList);
      console.log("=================================================");

      // 3. Database Write Phase: PATCH only changed fields
      const dbStartTime = Date.now();
      await db.updateSettings(changedFields);
      const dbDuration = Date.now() - dbStartTime;

      // 4. Verification Phase: Re-fetch latest settings from Supabase
      const verifyStartTime = Date.now();
      const verifyData = await db.getSettings();
      const verifyDuration = Date.now() - verifyStartTime;

      const isVerified = verifyData && (
        !processedObj.templeName || verifyData.templeName === processedObj.templeName
      );

      if (!isVerified) {
        throw new Error("Verification check failed after save operation");
      }

      console.log("[CMS Verification Read] Successfully verified persisted settings:", {
        templeName: verifyData.templeName,
        templeLogo: verifyData.templeLogo,
        heroBanner: verifyData.heroBanner
      });

      // 5. Context Sync Phase: Refresh CMS Context across public site
      await refreshCMS();

      // 6. State Clean Phase: Reset dirty state & update initial reference
      initialSettingsRef.current = JSON.stringify(processedObj);
      setIsDirty(false);

      // 7. Status & Timestamp Logging
      const totalPipelineMs = Date.now() - pipelineStartTime;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setLastSavedTime(timeStr);
      setCmsSaveState("published");

      console.log("=================================================");
      console.log("⚡ [CMS SAVE PIPELINE COMPLETED SUCCESSFULLY]");
      console.log(`• Storage Upload Duration: ${totalUploadTimeMs} ms`);
      console.log(`• Database Write Duration: ${dbDuration} ms`);
      console.log(`• Verification Read Duration: ${verifyDuration} ms`);
      console.log(`• Total Pipeline Execution Time: ${totalPipelineMs} ms`);
      console.log("=================================================");

      // 8. Show floating success toast
      setFloatingToast({ message: "Temple website updated successfully.", type: "success" });
      setTimeout(() => setFloatingToast(null), 2500);

    } catch (err) {
      console.error("❌ [CMS Save Pipeline Failed]", err);
      setCmsSaveState("failed");
      setFloatingToast({ message: err.message || "Couldn't save your changes. Please try again.", type: "error" });
      setTimeout(() => setFloatingToast(null), 3500);
    } finally {
      setIsSavingCms(false);
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

      {/* Floating Top Notification Toast */}
      {floatingToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className={`px-5 py-3 rounded-full shadow-2xl border text-xs font-semibold flex items-center gap-3 select-none backdrop-blur-md ${floatingToast.type === "success"
              ? "bg-emerald-900/95 text-emerald-100 border-emerald-500/30 shadow-emerald-950/20"
              : "bg-red-900/95 text-red-100 border-red-500/30 shadow-red-950/20"
            }`}>
            <span className="text-base">{floatingToast.type === "success" ? "✓" : "⚠️"}</span>
            <div className="flex flex-col">
              <span className="font-bold leading-none">{floatingToast.type === "success" ? "Changes Saved Successfully" : "Save Error"}</span>
              <span className="text-[10px] opacity-90 mt-0.5">{floatingToast.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border-custom mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-accent/15 text-accent font-bold text-[9px] uppercase tracking-wider border border-accent/25 select-none">
              Secure Admin Console
            </span>

            {/* Live CMS Status Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold shadow-xs select-none transition-all">
              {cmsSaveState === "saving" && (
                <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border-amber-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>🔄 Saving…</span>
                </span>
              )}
              {cmsSaveState === "unsaved" && (
                <span className="flex items-center gap-1.5 text-yellow-800 bg-yellow-50 border-yellow-300 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  <span>🟡 Unsaved Changes</span>
                </span>
              )}
              {cmsSaveState === "published" && (
                <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border-emerald-300 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>🟢 Published · Last saved {lastSavedTime}</span>
                </span>
              )}
              {cmsSaveState === "failed" && (
                <span className="flex items-center gap-1.5 text-red-800 bg-red-50 border-red-300 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>🔴 Save Failed</span>
                </span>
              )}
            </div>
          </div>

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
                            className={`p-2 rounded text-[10px] cursor-pointer transition-colors border ${n.read ? "bg-neutral-50/50 text-text-secondary border-transparent" : "bg-amber-50/20 text-text-primary border-amber-200 border-l-2 border-l-amber-500"
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
        <div className={`w-full p-4 mb-6 rounded-custom-md border text-xs font-semibold flex items-center justify-between shadow-premium select-none ${statusType === "success"
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
                className={`flex items-center gap-3 px-4 py-2.5 rounded-custom-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer lg:w-full text-left shrink-0 ${isTabActive
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
                                <img src={d.avatar || "/assets/avatars/avatar_male.png"} alt="avatar" className="w-full h-full object-cover" />
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
                      <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Audit and update daily devotee checked vows</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={logStatusFilter}
                        onChange={(e) => { setLogStatusFilter(e.target.value); reloadLogsOnly(e.target.value); }}
                        className="px-3 py-1.5 text-xs rounded border border-border-custom text-text-primary font-semibold focus:outline-none bg-white"
                      >
                        <option value="Approved">Submitted Logs</option>
                        <option value="Rejected">Rejected Logs</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 text-left">
                    {adminLogs.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-border-custom rounded-custom-md">
                        <span className="text-3xl block mb-2">✅</span>
                        <p className="text-xs font-semibold text-text-secondary">No check-in logs found for this status</p>
                      </div>
                    ) : (
                      adminLogs.map(log => {
                        const isExpanded = expandedLogId === log.id;
                        const currentSelections = editedLogActivities[log.id] || log.activities.map(a => a.id);
                        const isSaving = isSavingLog[log.id] || false;

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
                                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${log.status === "Approved" ? "bg-green-50 text-green-700 border-green-200"
                                    : log.status === "Rejected" ? "bg-red-50 text-red-700 border-red-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}>{log.status}</span>
                                </div>
                                <span className="text-[9px] text-text-secondary leading-normal mt-0.5">
                                  <strong>{log.dateStr}</strong> • Checked: {log.activities.map(a => a.name).join(", ") || "None"} • <strong>+{log.points} pts</strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {log.status === "Approved" ? (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (confirm(`Are you sure you want to reject ${log.devoteeName}'s check-in for ${log.dateStr}?`)) {
                                        try {
                                          await db.updateGroupedLogStatus(log.profileId, log.dateStr, "Rejected");
                                          showNotification(`Rejected ${log.devoteeName}'s check-in.`);
                                          await reloadLogsOnly(logStatusFilter);
                                        } catch (err) {
                                          console.error(err);
                                          showNotification("Failed to reject check-in.", "error");
                                        }
                                      }
                                    }}
                                    className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-500/10 transition-colors cursor-pointer mr-1"
                                  >
                                    Reject
                                  </button>
                                ) : (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        await db.updateGroupedLogStatus(log.profileId, log.dateStr, "Approved");
                                        showNotification(`Approved ${log.devoteeName}'s check-in.`);
                                        await reloadLogsOnly(logStatusFilter);
                                      } catch (err) {
                                        console.error(err);
                                        showNotification("Failed to approve check-in.", "error");
                                      }
                                    }}
                                    className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-green-600 bg-green-50 hover:bg-green-100 rounded border border-green-500/10 transition-colors cursor-pointer mr-1"
                                  >
                                    Approve
                                  </button>
                                )}
                                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider text-[#EA580C] hover:underline cursor-pointer">
                                  {isExpanded ? "Hide Details" : "Edit Vows"}
                                </span>
                                <span className="text-[10px] text-text-secondary font-medium pl-2">{isExpanded ? "▲" : "▼"}</span>
                              </div>
                            </div>

                            {/* Detail remarks panel */}
                            {isExpanded && (
                              <div className="p-4 bg-neutral-50/50 border-t border-border-custom flex flex-col gap-4">
                                <div className="border-b border-neutral-100 pb-2">
                                  <p className="text-[10px] uppercase font-bold text-[#EA580C]">Edit Devotee Checked Vows</p>
                                  <p className="text-[9px] text-text-secondary mt-0.5">Select what points they ticked below. Stats will auto-recalculate upon saving.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  {sadhanaActivities.map(act => {
                                    const isChecked = currentSelections.includes(act.id);
                                    return (
                                      <label
                                        key={act.id}
                                        className={`flex items-center gap-2.5 p-2.5 rounded border transition-colors cursor-pointer select-none ${isChecked ? "bg-[#FFF7ED] border-[#EA580C]/30" : "bg-white border-neutral-150"
                                          }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => {
                                            const updated = isChecked
                                              ? currentSelections.filter(id => id !== act.id)
                                              : [...currentSelections, act.id];
                                            setEditedLogActivities(prev => ({ ...prev, [log.id]: updated }));
                                          }}
                                          className="w-4 h-4 rounded text-[#EA580C] border-neutral-300 focus:ring-[#EA580C]"
                                        />
                                        <div className="flex flex-col text-left">
                                          <span className="text-xs font-semibold text-text-primary">{act.name}</span>
                                          <span className="text-[9px] text-text-secondary">{act.category} • +{act.points} pts</span>
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>

                                <div className="flex gap-2 justify-end pt-2 border-t border-neutral-100 mt-2">
                                  <button
                                    onClick={async () => {
                                      try {
                                        setSavingLog(prev => ({ ...prev, [log.id]: true }));
                                        await db.submitDailySadhana(log.profileId, log.dateStr, currentSelections);
                                        showNotification("🌸 Devotee daily sadhana logs updated successfully.");
                                        await reloadLogsOnly(logStatusFilter);
                                      } catch (err) {
                                        console.error(err);
                                        showNotification("Failed to save sadhana changes: " + err.message, "error");
                                      } finally {
                                        setSavingLog(prev => ({ ...prev, [log.id]: false }));
                                      }
                                    }}
                                    disabled={isSaving}
                                    className="px-6 py-2.5 rounded bg-[#EA580C] hover:bg-[#EA580C]/90 text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                                  >
                                    {isSaving ? "Saving changes..." : "Save Vow Changes"}
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
                          <img src={selectedProfileDetail?.avatar || "/assets/avatars/avatar_female.png"} alt="avatar" className="w-full h-full object-cover" />
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
                                <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${log.status === "Approved" ? "bg-green-50 text-green-700 border-green-200"
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
                                <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${d.verified ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"
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
                                              <img src={member.avatar || "/assets/avatars/avatar_male.png"} alt={member.fullName} className="w-full h-full object-cover" />
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
                                              <span className={`text-[7px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${member.memberNumber === 1
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
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-display font-semibold text-text-primary text-base">Notices & Community Bulletins</h3>
                      <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Manage trust notices, community updates, and holy programs</p>
                    </div>
                    {isEditingAnn && (
                      <button
                        onClick={handleCancelEditAnn}
                        className="px-3 py-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-text-secondary text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Cancel Editing
                      </button>
                    )}
                  </div>

                  {/* Announcement Creation/Edition Form */}
                  <form onSubmit={handleAddAnnouncement} className="p-5 rounded-custom-lg border border-border-custom bg-neutral-50/50 flex flex-col gap-4">
                    <h4 className="font-display font-semibold text-primary text-xs uppercase tracking-wider">
                      {isEditingAnn ? "✍️ Edit Announcement" : "📢 Create New Announcement"}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Title */}
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Notice Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Paryushan Mahotsav holy dates 2026"
                          value={newAnn.title}
                          onChange={(e) => setNewAnn(prev => ({ ...prev, title: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
                          required
                        />
                      </div>

                      {/* Priority */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Priority Level</label>
                        <select
                          value={newAnn.priority}
                          onChange={(e) => setNewAnn(prev => ({ ...prev, priority: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white font-semibold focus:outline-none focus:ring-1 focus:ring-primary/30"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Publishing Status</label>
                        <select
                          value={newAnn.active ? "Published" : "Draft"}
                          onChange={(e) => setNewAnn(prev => ({ ...prev, active: e.target.value === "Published" }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white font-semibold focus:outline-none focus:ring-1 focus:ring-primary/30"
                        >
                          <option value="Published">Published / Active</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </div>
                    </div>

                    {/* Rich Text Editor Toolbar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Announcement Message Content (HTML Enabled)</label>
                        <span className="text-[8px] text-text-secondary font-semibold uppercase">Use formatting toolbar to inject tags</span>
                      </div>

                      <div className="border border-border-custom rounded overflow-hidden bg-white focus-within:ring-1 focus-within:ring-primary/30">
                        {/* Toolbar */}
                        <div className="flex flex-wrap gap-1 p-1.5 bg-neutral-50 border-b border-border-custom text-[10px]">
                          <button type="button" onClick={() => injectFormat("<strong>", "</strong>")} className="px-2 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 font-bold cursor-pointer">B</button>
                          <button type="button" onClick={() => injectFormat("<em>", "</em>")} className="px-2 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 italic cursor-pointer">I</button>
                          <button type="button" onClick={() => injectFormat("<u>", "</u>")} className="px-2 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 underline cursor-pointer">U</button>
                          <button type="button" onClick={() => injectFormat("<h3>", "</h3>")} className="px-2 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 font-extrabold cursor-pointer">H3</button>
                          <button type="button" onClick={() => injectFormat("<h4>", "</h4>")} className="px-2 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 font-bold cursor-pointer">H4</button>
                          <button type="button" onClick={() => injectFormat("<blockquote>", "</blockquote>")} className="px-2 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 cursor-pointer">Quote</button>
                          <button type="button" onClick={() => injectFormat("<ul><li>", "</li></ul>")} className="px-2 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 cursor-pointer">• List</button>
                          <button type="button" onClick={() => injectFormat("<ol><li>", "</li></ol>")} className="px-2 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 cursor-pointer">1. List</button>
                          <button type="button" onClick={() => {
                            const url = prompt("Enter hyperlink URL:");
                            if (url) injectFormat(`<a href="${url}" target="_blank" class="text-primary hover:underline">`, "</a>");
                          }} className="px-2 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 text-primary font-semibold cursor-pointer">Link</button>
                          <button type="button" onClick={() => injectFormat("<br/>", "")} className="px-2 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 cursor-pointer">Line Break</button>
                        </div>
                        {/* Textarea */}
                        <textarea
                          id="ann-content-textarea"
                          rows={4}
                          placeholder="Write notice descriptions... HTML format works natively."
                          value={newAnn.content}
                          onChange={(e) => setNewAnn(prev => ({ ...prev, content: e.target.value }))}
                          className="px-3 py-2 text-xs text-text-primary bg-white focus:outline-none w-full border-none resize-y"
                          required
                        />
                      </div>
                    </div>

                    {/* Pin and Scheduling */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      {/* Pinned checkbox */}
                      <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={newAnn.pinned}
                          onChange={(e) => setNewAnn(prev => ({ ...prev, pinned: e.target.checked }))}
                          className="w-4 h-4 rounded text-primary border-border-custom focus:ring-primary cursor-pointer"
                        />
                        <span>📌 Pin Notice to Top</span>
                      </label>

                      {/* Publish Schedule */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Publish Date & Time (Optional)</label>
                        <div className="flex gap-1.5">
                          <input
                            type="date"
                            value={newAnn.publishDate}
                            onChange={(e) => setNewAnn(prev => ({ ...prev, publishDate: e.target.value }))}
                            className="px-2 py-1 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full"
                          />
                          <input
                            type="time"
                            value={newAnn.publishTime}
                            onChange={(e) => setNewAnn(prev => ({ ...prev, publishTime: e.target.value }))}
                            className="px-2 py-1 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-[100px]"
                          />
                        </div>
                      </div>

                      {/* Expiry Schedule */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Expiry Date & Time (Optional)</label>
                        <div className="flex gap-1.5">
                          <input
                            type="date"
                            value={newAnn.expiryDate}
                            onChange={(e) => setNewAnn(prev => ({ ...prev, expiryDate: e.target.value }))}
                            className="px-2 py-1 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-full"
                          />
                          <input
                            type="time"
                            value={newAnn.expiryTime}
                            onChange={(e) => setNewAnn(prev => ({ ...prev, expiryTime: e.target.value }))}
                            className="px-2 py-1 text-xs rounded border border-border-custom bg-white text-text-primary focus:outline-none w-[100px]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAnnPreview(newAnn);
                          setShowAnnPreview(true);
                        }}
                        className="py-1.5 px-4 rounded bg-white hover:bg-neutral-50 text-text-secondary border border-border-custom text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        👁️ Preview Notice
                      </button>

                      <button
                        type="submit"
                        className="py-1.5 px-5 rounded bg-primary hover:bg-primary/95 text-white text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-premium"
                      >
                        <Plus size={12} />
                        <span>{isEditingAnn ? "Update Notice" : "Publish Notice"}</span>
                      </button>
                    </div>
                  </form>

                  {/* Filter Panel */}
                  <div className="p-4 rounded-custom-md border border-border-custom bg-white flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-border-custom pb-2">
                      <h4 className="font-display font-semibold text-text-primary text-[10px] uppercase tracking-wider">🔍 Search & Filter Notices</h4>
                      <button
                        onClick={() => {
                          setAnnSearch("");
                          setAnnStatusFilter("");
                          setAnnPriorityFilter("");
                          setAnnPinnedFilter(null);
                          setAnnDateStart("");
                          setAnnDateEnd("");
                        }}
                        className="text-[9px] uppercase tracking-wider text-primary font-bold hover:underline cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                      {/* Search */}
                      <div className="flex flex-col gap-0.5 md:col-span-2">
                        <label className="text-[8px] uppercase font-bold text-text-secondary">Search Keyword</label>
                        <input
                          type="text"
                          placeholder="Search title, message..."
                          value={annSearch}
                          onChange={(e) => setAnnSearch(e.target.value)}
                          className="px-2 py-1 text-xs rounded border border-border-custom text-text-primary focus:outline-none"
                        />
                      </div>

                      {/* Status filter */}
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] uppercase font-bold text-text-secondary">Filter Status</label>
                        <select
                          value={annStatusFilter}
                          onChange={(e) => setAnnStatusFilter(e.target.value)}
                          className="px-2 py-1 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none"
                        >
                          <option value="">All Statuses</option>
                          <option value="Published">Published</option>
                          <option value="Draft">Draft</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Expired">Expired</option>
                        </select>
                      </div>

                      {/* Priority filter */}
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] uppercase font-bold text-text-secondary">Filter Priority</label>
                        <select
                          value={annPriorityFilter}
                          onChange={(e) => setAnnPriorityFilter(e.target.value)}
                          className="px-2 py-1 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none"
                        >
                          <option value="">All Priorities</option>
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High / Critical</option>
                        </select>
                      </div>

                      {/* Pinned filter */}
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] uppercase font-bold text-text-secondary">Filter Pinned</label>
                        <select
                          value={annPinnedFilter === null ? "" : String(annPinnedFilter)}
                          onChange={(e) => setAnnPinnedFilter(e.target.value === "" ? null : e.target.value === "true")}
                          className="px-2 py-1 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none"
                        >
                          <option value="">All Pinned</option>
                          <option value="true">Pinned Only</option>
                          <option value="false">Unpinned Only</option>
                        </select>
                      </div>

                      {/* Limit filter */}
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8px] uppercase font-bold text-text-secondary">Items Per Page</label>
                        <select
                          value={annLimit}
                          onChange={(e) => {
                            setAnnLimit(Number(e.target.value));
                            setAnnPage(1);
                          }}
                          className="px-2 py-1 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none"
                        >
                          <option value={5}>5 per page</option>
                          <option value={10}>10 per page</option>
                          <option value={20}>20 per page</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notices List Table */}
                  <div className="border border-border-custom rounded-custom-lg overflow-hidden w-full bg-white shadow-premium">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-bg-custom text-[9px] uppercase font-bold text-text-secondary tracking-wider border-b border-border-custom">
                          <th className="p-3">Notice Info</th>
                          <th className="p-3">Schedule Dates</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {announcements.length > 0 ? (
                          announcements.map(ann => {
                            const isExpired = ann.expiresAt && new Date(ann.expiresAt) < new Date();
                            const isScheduled = new Date(ann.createdAt) > new Date();
                            const calcStatus = !ann.active ? "Draft" : isExpired ? "Expired" : isScheduled ? "Scheduled" : "Published";

                            const statusColor =
                              calcStatus === "Published"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : calcStatus === "Scheduled"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : calcStatus === "Expired"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-neutral-50 text-text-secondary border-neutral-300";

                            return (
                              <tr key={ann.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                                <td className="p-3 max-w-[320px]">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-semibold text-text-primary">{ann.title}</span>
                                      <span className={`text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${ann.priority === "high"
                                        ? "bg-red-50 text-red-600 border-red-500/10"
                                        : ann.priority === "low"
                                          ? "bg-blue-50 text-blue-600 border-blue-500/10"
                                          : "bg-orange-50 text-primary border-primary/10"
                                        }`}>
                                        {ann.priority}
                                      </span>
                                      {ann.pinned && (
                                        <span className="text-[7.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-500/10">
                                          📌 Pinned
                                        </span>
                                      )}
                                    </div>
                                    <div
                                      className="text-[10px] text-text-secondary max-h-[40px] overflow-hidden text-ellipsis line-clamp-2"
                                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(ann.content) }}
                                    />
                                  </div>
                                </td>
                                <td className="p-3 whitespace-nowrap text-[10px] text-text-secondary">
                                  <div className="flex flex-col gap-0.5">
                                    <span>🕒 Publish: {new Date(ann.createdAt).toLocaleString()}</span>
                                    <span>⌛ Expiry: {ann.expiresAt ? new Date(ann.expiresAt).toLocaleString() : "Never Expires"}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>
                                    {calcStatus}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex justify-end gap-1">
                                    <button
                                      onClick={() => handleEditAnnClick(ann)}
                                      className="p-1 rounded text-primary hover:bg-neutral-100 transition-colors cursor-pointer"
                                      title="Edit Notice"
                                    >
                                      📝
                                    </button>
                                    <button
                                      onClick={() => setAnnToDelete(ann)}
                                      className="p-1 rounded text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                      title="Delete Notice"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-text-secondary italic text-xs">
                              No announcements match your search or filter configuration.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Server pagination controls */}
                  {annTotal > annLimit && (
                    <div className="flex items-center justify-between text-xs px-2">
                      <span className="text-text-secondary">
                        Showing {Math.min(annTotal, (annPage - 1) * annLimit + 1)} - {Math.min(annTotal, annPage * annLimit)} of {annTotal} notices
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAnnPage(prev => Math.max(1, prev - 1))}
                          disabled={annPage === 1}
                          className="px-3 py-1.5 rounded border border-border-custom bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setAnnPage(prev => Math.min(Math.ceil(annTotal / annLimit), prev + 1))}
                          disabled={annPage >= Math.ceil(annTotal / annLimit)}
                          className="px-3 py-1.5 rounded border border-border-custom bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Live Devotee Preview Modal */}
                  {showAnnPreview && annPreview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                      <div className="bg-white rounded-custom-lg shadow-2xl p-6 max-w-md w-full relative overflow-hidden flex flex-col gap-4">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-orange-400" />

                        <div className="flex items-center justify-between pb-2 border-b border-border-custom">
                          <h4 className="font-display font-bold text-text-primary text-xs uppercase tracking-wider">👁️ Notice Live Devotee Preview</h4>
                          <button onClick={() => { setAnnPreview(null); setShowAnnPreview(false); }} className="text-text-secondary hover:text-text-primary text-xs font-bold font-display cursor-pointer">✕ Close</button>
                        </div>

                        {/* Emulated Devotee Notice Card */}
                        <div className="p-5 rounded-custom-lg bg-white border border-border-custom shadow-premium flex flex-col gap-4 text-left">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${annPreview.priority === "high"
                                ? "bg-red-50 text-red-700 border-red-500/10"
                                : annPreview.priority === "low"
                                  ? "bg-blue-50 text-blue-700 border-blue-500/10"
                                  : "bg-orange-50 text-primary border-primary/10"
                                }`}>
                                {annPreview.priority === "high" ? "PROGRAM" : annPreview.priority === "low" ? "NOTICE" : "UPDATE"}
                              </span>
                              <span className="text-[10px] text-text-secondary">
                                {new Date(annPreview.publishDate || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                            <h3 className="font-display font-semibold text-text-primary text-base leading-snug">
                              {annPreview.title || "Announcement Title"}
                            </h3>
                            <div
                              className="text-xs text-text-secondary leading-relaxed whitespace-pre-line"
                              dangerouslySetInnerHTML={{ __html: sanitizeHTML(annPreview.content || "<i>Announcement content draft...</i>") }}
                            />
                          </div>
                        </div>

                        <div className="bg-neutral-50 p-3 rounded text-[9.5px] text-text-secondary border border-border-custom">
                          ⚠️ This is how devotees will see the notice on the homepage and dashboard once published.
                        </div>

                        <button
                          onClick={() => { setAnnPreview(null); setShowAnnPreview(false); }}
                          className="w-full py-2.5 rounded bg-primary text-white text-[10px] font-bold uppercase tracking-wider hover:bg-primary/95 transition-all cursor-pointer"
                        >
                          Back to Editor
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PANCHANG */}
              {activeTab === "panchang" && (
                <div className="flex flex-col gap-6">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-custom pb-4">
                    <div>
                      <h3 className="font-display font-semibold text-text-primary text-base">Panchang Calendar Management CMS</h3>
                      <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Control daily coordinates, solar calculations, and moon transits</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label htmlFor="panchang-date" className="text-[10px] uppercase font-bold text-text-secondary">Selected Date:</label>
                        <input
                          id="panchang-date"
                          type="date"
                          value={panchangDate}
                          onChange={(e) => setPanchangDate(e.target.value)}
                          className="px-3 py-1.5 text-xs rounded border border-border-custom text-text-primary focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Main Grid: Left (Calendar) & Right (Utilities/CSV) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Calendar View */}
                    <div className="lg:col-span-2 p-5 rounded-custom-lg border border-border-custom bg-white flex flex-col gap-4 shadow-premium">
                      <div className="flex justify-between items-center">
                        <h4 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider">📅 Monthly Schedule Grid</h4>

                        <div className="flex items-center gap-1.5">
                          <select
                            value={adminCalMonth}
                            onChange={(e) => setAdminCalMonth(Number(e.target.value))}
                            className="px-2 py-1 text-[10px] font-semibold bg-white border border-border-custom rounded focus:outline-none"
                          >
                            {Array.from({ length: 12 }, (_, idx) => (
                              <option key={idx + 1} value={idx + 1}>
                                {new Date(2000, idx).toLocaleString("en-US", { month: "long" })}
                              </option>
                            ))}
                          </select>
                          <select
                            value={adminCalYear}
                            onChange={(e) => setAdminCalYear(Number(e.target.value))}
                            className="px-2 py-1 text-[10px] font-semibold bg-white border border-border-custom rounded focus:outline-none"
                          >
                            {Array.from({ length: 10 }, (_, idx) => {
                              const y = new Date().getFullYear() - 5 + idx;
                              return <option key={y} value={y}>{y}</option>;
                            })}
                          </select>
                        </div>
                      </div>

                      {renderAdminCalendarGrid()}

                      <div className="flex gap-4 text-[9px] text-text-secondary justify-end border-t border-neutral-100 pt-2 font-medium">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400 block" /> Festival / Event
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500 block" /> Fasting Day
                        </span>
                        <span className="flex items-center gap-1">
                          <span>卐</span> Shubh Din
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📖</span> Samayik Day
                        </span>
                      </div>
                    </div>

                    {/* Import / Export / Operations */}
                    <div className="p-5 rounded-custom-lg border border-border-custom bg-neutral-50/50 flex flex-col gap-5 shadow-premium">
                      <div>
                        <h4 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider">📤 Data Import & Export</h4>
                        <p className="text-[9px] text-text-secondary mt-0.5">Bulk update calendar sheets via Excel CSV templates</p>
                      </div>

                      {/* Export Options */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[8px] uppercase font-bold text-text-secondary">Export Data Sheet</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handlePanchangExportCSV("month")}
                            className="px-2 py-1.5 rounded border border-border-custom bg-white hover:bg-neutral-50 text-[9px] font-bold text-text-primary uppercase tracking-wider cursor-pointer text-center"
                          >
                            Selected Month
                          </button>
                          <button
                            onClick={() => handlePanchangExportCSV("year")}
                            className="px-2 py-1.5 rounded border border-border-custom bg-white hover:bg-neutral-50 text-[9px] font-bold text-text-primary uppercase tracking-wider cursor-pointer text-center"
                          >
                            Selected Year
                          </button>
                          <button
                            onClick={() => handlePanchangExportCSV("all")}
                            className="px-2 py-1.5 rounded border border-border-custom bg-white hover:bg-neutral-50 text-[9px] font-bold text-text-primary uppercase tracking-wider cursor-pointer text-center"
                          >
                            Entire Calendar
                          </button>
                        </div>
                      </div>

                      {/* Import Option */}
                      <div className="flex flex-col gap-2 pt-2 border-t border-border-custom">
                        <label className="text-[8px] uppercase font-bold text-text-secondary">Bulk CSV Upload</label>
                        <div className="relative border border-dashed border-border-custom rounded p-3 bg-white hover:bg-neutral-50/80 transition-colors flex flex-col items-center justify-center text-center">
                          <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePanchangImportCSV(file);
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <span className="text-xs">📂 Click to Upload CSV file</span>
                          <span className="text-[7.5px] text-text-secondary mt-1 uppercase tracking-wider font-semibold">Will validate coordinates and reject rows with errors</span>
                        </div>
                      </div>

                      {/* Template Instructions */}
                      <div className="p-3 rounded border border-border-custom bg-amber-50/60 text-[9px] text-text-secondary leading-relaxed flex flex-col gap-1.5">
                        <strong className="text-amber-800 uppercase font-semibold text-[8px]">💡 CSV Template Format:</strong>
                        <span>Ensure columns map to headers exactly: <code>Date, Tithi, Month, Paksha, Sunrise, Sunset, Festival, Event, Nakshatra, Yoga, Karana, Moon_Sign, Special_Notes, Fasting_Info, Important_Timings, Additional_Remarks, Shubh_Din, Samayik</code></span>
                      </div>
                    </div>
                  </div>

                  {/* Editor form panel */}
                  <div className="p-6 rounded-custom-lg border border-border-custom bg-white shadow-premium flex flex-col gap-4">
                    <h4 className="font-display font-semibold text-primary text-xs uppercase tracking-wider">
                      ✍️ Panchang Editor & Daily Form Details for {panchangDate}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Tithi */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Lunar Tithi</label>
                        <input
                          type="text"
                          placeholder="e.g. Sud Ekadashi"
                          value={panchangVal.tithi}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, tithi: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
                          required
                        />
                      </div>

                      {/* Lunar Month */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Lunar Month</label>
                        <select
                          value={panchangVal.month}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, month: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white font-semibold focus:outline-none focus:ring-1 focus:ring-primary/30"
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

                      {/* Paksha */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Paksha</label>
                        <select
                          value={panchangVal.paksha}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, paksha: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white font-semibold focus:outline-none focus:ring-1 focus:ring-primary/30"
                        >
                          <option value="Shukla">Shukla Paksha (शुक्ल पक्ष)</option>
                          <option value="Krishna">Krishna Paksha (कृष्ण पक्ष)</option>
                        </select>
                      </div>

                      {/* Nakshatra */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Nakshatra</label>
                        <input
                          type="text"
                          placeholder="e.g. Rohini"
                          value={panchangVal.nakshatra}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, nakshatra: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>

                      {/* Yoga */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Yoga</label>
                        <input
                          type="text"
                          placeholder="e.g. Ayushman"
                          value={panchangVal.yoga}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, yoga: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>

                      {/* Karana */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Karana</label>
                        <input
                          type="text"
                          placeholder="e.g. Bava"
                          value={panchangVal.karana}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, karana: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>

                      {/* Moon Sign */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Moon Sign (Rashi)</label>
                        <input
                          type="text"
                          placeholder="e.g. Vrishabha"
                          value={panchangVal.moonSign}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, moonSign: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>

                      {/* Festival Name */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Festival Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Mahavir Janma Kalyanak"
                          value={panchangVal.festival}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, festival: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>

                      {/* Event Banner */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Dashboard Alert banner text</label>
                        <input
                          type="text"
                          placeholder="e.g. Holy Discourse today at 09:00 AM"
                          value={panchangVal.event}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, event: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>

                      {/* Sunrise */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Sunrise Time</label>
                        <input
                          type="text"
                          placeholder="e.g. 06:12 AM"
                          value={panchangVal.sunrise}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, sunrise: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>

                      {/* Sunset */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Sunset Time</label>
                        <input
                          type="text"
                          placeholder="e.g. 07:18 PM"
                          value={panchangVal.sunset}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, sunset: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>
                    </div>

                    {/* Text Areas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Fasting Information */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Fasting Information</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Upvas, Ekasana, Biyasana allowed timings..."
                          value={panchangVal.fastingInfo}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, fastingInfo: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                        />
                      </div>

                      {/* Important Timings */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Important Timings (Navkarshi, Porashi etc)</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Navkarshi: 07:05 AM, Porashi: 09:30 AM"
                          value={panchangVal.importantTimings}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, importantTimings: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                        />
                      </div>

                      {/* Special Notes */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Special Spiritual Notes</label>
                        <textarea
                          rows={2}
                          placeholder="Write key auspicious warnings or guidelines..."
                          value={panchangVal.specialNotes}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, specialNotes: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                        />
                      </div>

                      {/* Additional Remarks */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary">Additional Remarks</label>
                        <textarea
                          rows={2}
                          placeholder="Administrative or extra temple annotations..."
                          value={panchangVal.additionalRemarks}
                          onChange={(e) => setPanchangVal(prev => ({ ...prev, additionalRemarks: e.target.value }))}
                          className="px-3 py-2 text-xs rounded border border-border-custom text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                        />
                      </div>
                    </div>

                    {/* Flags & Save Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t border-neutral-100">
                      <div className="flex items-center gap-4 py-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!panchangVal.shubh_din}
                            onChange={(e) => setPanchangVal(prev => ({ ...prev, shubh_din: e.target.checked }))}
                            className="rounded border-border-custom text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          />
                          <span>卐 Shubh Din Marker (Flag Swastik on devotee calendar)</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!panchangVal.samayik}
                            onChange={(e) => setPanchangVal(prev => ({ ...prev, samayik: e.target.checked }))}
                            className="rounded border-border-custom text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          />
                          <span>📖 Samayik Day Marker (Flag Book symbol on devotee calendar)</span>
                        </label>
                      </div>

                      <button
                        onClick={handleSavePanchang}
                        className="py-2 px-6 rounded bg-primary text-white text-[10px] font-bold uppercase tracking-wider shadow hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                      >
                        <Save size={14} />
                        <span>Save Panchang Sheet</span>
                      </button>
                    </div>
                  </div>

                  {/* Version History List */}
                  <div className="p-5 rounded-custom-lg border border-border-custom bg-white shadow-premium flex flex-col gap-4">
                    <h4 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider">🕒 Version History & Audit Logs ({panchangDate})</h4>

                    <div className="border border-border-custom rounded overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-bg-custom text-[9px] uppercase font-bold text-text-secondary tracking-wider border-b border-border-custom">
                            <th className="p-3">Ver #</th>
                            <th className="p-3">Tithi</th>
                            <th className="p-3">Festival</th>
                            <th className="p-3">Modified By</th>
                            <th className="p-3">Modified Time</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {panchangVersionsList.length > 0 ? (
                            panchangVersionsList.map(ver => (
                              <tr key={ver.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                                <td className="p-3 font-bold text-primary">v{ver.versionNumber}</td>
                                <td className="p-3 font-semibold text-text-primary">{ver.tithi}</td>
                                <td className="p-3 text-text-secondary">{ver.festival || "-"}</td>
                                <td className="p-3 text-text-secondary font-medium">{ver.updatedByName}</td>
                                <td className="p-3 text-text-secondary">{new Date(ver.updatedAt).toLocaleString()}</td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => handleRestorePanchangVersion(ver)}
                                    className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-text-primary text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                                  >
                                    Load / Restore
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-text-secondary italic text-xs">
                                No modifications tracked for this date yet. Making edits will record version history.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
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
                      <div key={e.id} className="p-4 rounded-custom-md border border-border-custom bg-white flex flex-col justify-between hover:shadow-premium transition-shadow gap-3">
                        <div>
                          <h4 className="font-semibold text-text-primary text-xs">{e.title}</h4>
                          <p className="text-[10px] text-text-secondary mt-1 flex items-center gap-1.5">
                            <span>📍 {e.location || "Labriya Temple"}</span>
                            <span>&bull;</span>
                            <span>{new Date(e.date).toLocaleString()}</span>
                          </p>
                          <p className="text-[10px] text-text-secondary mt-2 leading-relaxed">{e.description}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(e.id)}
                          className="mt-auto self-end px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 size={11} />
                          <span>Delete</span>
                        </button>
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
                                    <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block ${d.verified
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
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${leaderboardToggle ? "bg-primary" : "bg-neutral-200"
                        }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${leaderboardToggle ? "left-7" : "left-1"
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

              {/* TAB 9: SETTINGS CONSOLE (NON-TECHNICAL CMS) */}
              {activeTab === "settings" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-display font-bold text-text-primary text-lg">Temple Website Content Management System</h3>
                    <p className="text-xs text-text-secondary mt-0.5">Edit content, images, timings, and contact details directly visible on the public website</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">

                    {/* CARD A: TEMPLE IDENTITY */}
                    <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col gap-5">
                      <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                        <span className="text-lg">📿</span>
                        <div>
                          <h4 className="font-display font-bold text-[#1F2937] text-sm">Card A – Temple Identity & Branding</h4>
                          <p className="text-[10px] text-text-secondary">Primary temple identity used across navigation header, footer, and login pages</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Temple Name</label>
                          <input type="text" value={templeSettings.templeName || ""} onChange={(e) => handleSettingChange("templeName", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" required />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Subtitle</label>
                          <input type="text" value={templeSettings.subtitle || ""} onChange={(e) => handleSettingChange("subtitle", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" placeholder="e.g. Chaturmas Festival 2026" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Chaturmas Year</label>
                          <input type="text" value={templeSettings.chaturmasYear || ""} onChange={(e) => handleSettingChange("chaturmasYear", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" placeholder="e.g. 2026" />
                        </div>
                        <div className="sm:col-span-2">
                          <ImageUpload
                            label="Temple Logo (Primary Branding Source)"
                            value={templeSettings.templeLogo || ""}
                            onChange={(newLogo) => {
                              handleSettingChange("templeLogo", newLogo);
                              handleSettingChange("portalLogo", newLogo);
                              handleSettingChange("footerLogo", newLogo);
                              handleSettingChange("adminLogo", newLogo);
                              handleSettingChange("loadingLogo", newLogo);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* CARD B: HOMEPAGE */}
                    <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col gap-5">
                      <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                        <span className="text-lg">🏛️</span>
                        <div>
                          <h4 className="font-display font-bold text-[#1F2937] text-sm">Card B – Homepage Banner & Intro</h4>
                          <p className="text-[10px] text-text-secondary">Main welcome banner text, hero description, and background hero image</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Hero Title</label>
                          <input type="text" value={templeSettings.heroTitle || ""} onChange={(e) => handleSettingChange("heroTitle", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Hero Subtitle</label>
                          <input type="text" value={templeSettings.heroSubtitle || ""} onChange={(e) => handleSettingChange("heroSubtitle", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Welcome Message</label>
                          <input type="text" value={templeSettings.welcomeMessage || ""} onChange={(e) => handleSettingChange("welcomeMessage", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Hero Description</label>
                          <textarea rows={2} value={templeSettings.heroDescription || ""} onChange={(e) => handleSettingChange("heroDescription", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 w-full" />
                        </div>
                        <div className="sm:col-span-2">
                          <ImageUpload
                            label="Hero Banner Image"
                            value={templeSettings.heroBanner || ""}
                            onChange={(newBanner) => handleSettingChange("heroBanner", newBanner)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* CARD C: CONTACT INFORMATION */}
                    <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col gap-5">
                      <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                        <span className="text-lg">📍</span>
                        <div>
                          <h4 className="font-display font-bold text-[#1F2937] text-sm">Card C – Contact Information</h4>
                          <p className="text-[10px] text-text-secondary">Office address, map embed, phone, WhatsApp, and official email</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Temple Address</label>
                          <input type="text" value={templeSettings.templeAddress || ""} onChange={(e) => handleSettingChange("templeAddress", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Google Maps Embed URL</label>
                          <textarea rows={2} value={templeSettings.googleMapsEmbedUrl || ""} onChange={(e) => handleSettingChange("googleMapsEmbedUrl", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 w-full" placeholder="https://www.google.com/maps/embed?..." />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Primary Phone</label>
                          <input type="text" value={templeSettings.contactNumber || ""} onChange={(e) => { handleSettingChange("contactNumber", e.target.value); handleSettingChange("alternatePhone", e.target.value); }} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">WhatsApp Number</label>
                          <input type="text" value={templeSettings.whatsappNumber || ""} onChange={(e) => handleSettingChange("whatsappNumber", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Email Address</label>
                          <input type="email" value={templeSettings.email || ""} onChange={(e) => handleSettingChange("email", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                      </div>
                    </div>

                    {/* CARD D: DONATION */}
                    <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col gap-5">
                      <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                        <span className="text-lg">💖</span>
                        <div>
                          <h4 className="font-display font-bold text-[#1F2937] text-sm">Card D – Donation Channels</h4>
                          <p className="text-[10px] text-text-secondary">UPI ID, bank account details for transfers, and UPI QR image upload</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">UPI ID</label>
                          <input type="text" value={templeSettings.upiId || ""} onChange={(e) => handleSettingChange("upiId", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Bank Name</label>
                          <input type="text" value={templeSettings.bankName || ""} onChange={(e) => handleSettingChange("bankName", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Account Holder</label>
                          <input type="text" value={templeSettings.accountHolder || ""} onChange={(e) => handleSettingChange("accountHolder", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Account Number</label>
                          <input type="text" value={templeSettings.accountNumber || ""} onChange={(e) => handleSettingChange("accountNumber", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">IFSC Code</label>
                          <input type="text" value={templeSettings.ifsc || ""} onChange={(e) => handleSettingChange("ifsc", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="sm:col-span-2">
                          <ImageUpload
                            label="UPI QR Code Image"
                            value={templeSettings.donationQr || ""}
                            onChange={(newQr) => handleSettingChange("donationQr", newQr)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* CARD E: FOOTER */}
                    <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col gap-5">
                      <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                        <span className="text-lg">📄</span>
                        <div>
                          <h4 className="font-display font-bold text-[#1F2937] text-sm">Card E – Footer Content</h4>
                          <p className="text-[10px] text-text-secondary">Footer paragraph summary, copyright statement, and volunteer help text</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Footer Description</label>
                          <textarea rows={2} value={templeSettings.footerDescription || ""} onChange={(e) => handleSettingChange("footerDescription", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 w-full" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Copyright Text</label>
                          <input type="text" value={templeSettings.copyrightText || ""} onChange={(e) => handleSettingChange("copyrightText", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Designed By Text</label>
                          <input type="text" value={templeSettings.designedByText || ""} onChange={(e) => handleSettingChange("designedByText", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Volunteer Help Bar Text</label>
                          <input type="text" value={templeSettings.volunteerHelpText || ""} onChange={(e) => handleSettingChange("volunteerHelpText", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" placeholder="e.g. Connect directly with our WhatsApp coordination cell." />
                        </div>
                      </div>
                    </div>

                    {/* CARD F: SOCIAL MEDIA */}
                    <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col gap-5">
                      <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                        <span className="text-lg">🌐</span>
                        <div>
                          <h4 className="font-display font-bold text-[#1F2937] text-sm">Card F – Social Media Channels</h4>
                          <p className="text-[10px] text-text-secondary">Official URLs displayed in the website footer and contact bars</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Instagram URL</label>
                          <input type="text" value={templeSettings.instagram || ""} onChange={(e) => handleSettingChange("instagram", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Facebook URL</label>
                          <input type="text" value={templeSettings.facebook || ""} onChange={(e) => handleSettingChange("facebook", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">YouTube URL</label>
                          <input type="text" value={templeSettings.youtube || ""} onChange={(e) => handleSettingChange("youtube", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">WhatsApp Direct URL</label>
                          <input type="text" value={templeSettings.whatsapp || ""} onChange={(e) => handleSettingChange("whatsapp", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Telegram Invite Link</label>
                          <input type="text" value={templeSettings.telegram || ""} onChange={(e) => handleSettingChange("telegram", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                      </div>
                    </div>

                    {/* CARD G: TEMPLE TIMINGS */}
                    <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col gap-5">
                      <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                        <span className="text-lg">⏰</span>
                        <div>
                          <h4 className="font-display font-bold text-[#1F2937] text-sm">Card G – Temple Timings & Worship Hours</h4>
                          <p className="text-[10px] text-text-secondary">Timings displayed on the About Page and daily worship schedule cards</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Daily Opening Hours</label>
                          <input type="text" value={templeSettings.dailyTimings || ""} onChange={(e) => handleSettingChange("dailyTimings", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" placeholder="e.g. 06:00 AM - 09:00 PM" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Aarti Timing</label>
                          <input type="text" value={templeSettings.aartiTiming || ""} onChange={(e) => handleSettingChange("aartiTiming", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" placeholder="e.g. 07:00 PM Daily" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Puja Timing</label>
                          <input type="text" value={templeSettings.pujaTiming || ""} onChange={(e) => handleSettingChange("pujaTiming", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" placeholder="e.g. 06:30 AM - 08:30 AM" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Pravachan Timing</label>
                          <input type="text" value={templeSettings.pravachanTiming || ""} onChange={(e) => handleSettingChange("pravachanTiming", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" placeholder="e.g. 09:00 AM - 10:30 AM" />
                        </div>
                      </div>
                    </div>

                    {/* CARD H: PORTAL CONTROLS */}
                    <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col gap-5">
                      <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                        <span className="text-lg">⚙️</span>
                        <div>
                          <h4 className="font-display font-bold text-[#1F2937] text-sm">Card H – Devotee Portal Controls</h4>
                          <p className="text-[10px] text-text-secondary">Functional toggles for registrations, sadhana submissions, and maintenance lockout</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3.5 bg-neutral-50/50 border border-neutral-200 rounded-xl">
                          <div>
                            <span className="text-xs font-bold text-text-primary">Allow Registrations</span>
                            <p className="text-[10px] text-text-secondary">New devotee signup access</p>
                          </div>
                          <button type="button" onClick={() => handleSettingChange("allowNewRegistration", !templeSettings.allowNewRegistration)} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${templeSettings.allowNewRegistration ? "bg-emerald-600" : "bg-neutral-200"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${templeSettings.allowNewRegistration ? "left-7" : "left-1"}`} /></button>
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-neutral-50/50 border border-neutral-200 rounded-xl">
                          <div>
                            <span className="text-xs font-bold text-text-primary">Allow Daily Sadhana</span>
                            <p className="text-[10px] text-text-secondary">Enable daily vow submissions</p>
                          </div>
                          <button type="button" onClick={() => handleSettingChange("allowDailyCheckIn", !templeSettings.allowDailyCheckIn)} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${templeSettings.allowDailyCheckIn ? "bg-emerald-600" : "bg-neutral-200"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${templeSettings.allowDailyCheckIn ? "left-7" : "left-1"}`} /></button>
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-neutral-50/50 border border-neutral-200 rounded-xl">
                          <div>
                            <span className="text-xs font-bold text-text-primary">Allow Donations</span>
                            <p className="text-[10px] text-text-secondary">Enable donation form desk</p>
                          </div>
                          <button type="button" onClick={() => handleSettingChange("allowDonations", !templeSettings.allowDonations)} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${templeSettings.allowDonations ? "bg-emerald-600" : "bg-neutral-200"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${templeSettings.allowDonations ? "left-7" : "left-1"}`} /></button>
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-neutral-50/50 border border-neutral-200 rounded-xl">
                          <div>
                            <span className="text-xs font-bold text-text-primary">Allow Family Accounts</span>
                            <p className="text-[10px] text-text-secondary">Family profile linkings</p>
                          </div>
                          <button type="button" onClick={() => handleSettingChange("allowFamilyProfiles", !templeSettings.allowFamilyProfiles)} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${templeSettings.allowFamilyProfiles ? "bg-emerald-600" : "bg-neutral-200"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${templeSettings.allowFamilyProfiles ? "left-7" : "left-1"}`} /></button>
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-neutral-50/50 border border-neutral-200 rounded-xl">
                          <div>
                            <span className="text-xs font-bold text-text-primary">Enable Notifications</span>
                            <p className="text-[10px] text-text-secondary">Automated portal notifications</p>
                          </div>
                          <button type="button" onClick={() => handleSettingChange("enableNotifications", !templeSettings.enableNotifications)} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${templeSettings.enableNotifications ? "bg-emerald-600" : "bg-neutral-200"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${templeSettings.enableNotifications ? "left-7" : "left-1"}`} /></button>
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-red-50/40 border border-red-200 rounded-xl">
                          <div>
                            <span className="text-xs font-bold text-red-600">Maintenance Mode</span>
                            <p className="text-[10px] text-text-secondary">Lockout portal for maintenance</p>
                          </div>
                          <button type="button" onClick={() => handleSettingChange("maintenanceMode", !templeSettings.maintenanceMode)} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${templeSettings.maintenanceMode ? "bg-red-600" : "bg-neutral-200"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${templeSettings.maintenanceMode ? "left-7" : "left-1"}`} /></button>
                        </div>
                      </div>
                    </div>

                    {/* CARD I: ABOUT TEMPLE */}
                    <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col gap-5">
                      <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                        <span className="text-lg">📖</span>
                        <div>
                          <h4 className="font-display font-bold text-[#1F2937] text-sm">Card I – About Temple Content</h4>
                          <p className="text-[10px] text-text-secondary">Historical story, spiritual mission, future vision, guru lineage, and pilgrim guidelines</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">About Temple Summary (Page Header Subtitle)</label>
                          <textarea rows={2} value={templeSettings.aboutTempleSummary || ""} onChange={(e) => handleSettingChange("aboutTempleSummary", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 w-full" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Historical Story & Architecture Narrative</label>
                          <textarea rows={3} value={templeSettings.templeHistory || ""} onChange={(e) => handleSettingChange("templeHistory", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 w-full" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Additional Historical Context / Temple Details</label>
                          <textarea rows={2} value={templeSettings.aboutText || ""} onChange={(e) => handleSettingChange("aboutText", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 w-full" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Spiritual Mission</label>
                          <textarea rows={2} value={templeSettings.mission || ""} onChange={(e) => handleSettingChange("mission", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 w-full" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Future Vision</label>
                          <textarea rows={2} value={templeSettings.vision || ""} onChange={(e) => handleSettingChange("vision", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 w-full" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">What is Chaturmas? (Sacred Explanation)</label>
                          <textarea rows={3} value={templeSettings.chaturmasDescription || ""} onChange={(e) => handleSettingChange("chaturmasDescription", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 w-full" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Guru / Spiritual Leader Name</label>
                          <input type="text" value={templeSettings.guruName || ""} onChange={(e) => handleSettingChange("guruName", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Guru Title / Role</label>
                          <input type="text" value={templeSettings.guruTitle || ""} onChange={(e) => handleSettingChange("guruTitle", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Guru Biography & Guidance</label>
                          <textarea rows={3} value={templeSettings.guruBio || ""} onChange={(e) => handleSettingChange("guruBio", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 w-full" />
                        </div>
                        <div className="sm:col-span-2">
                          <ImageUpload
                            label="Guru / Spiritual Leader Portrait"
                            value={templeSettings.guruImage || ""}
                            onChange={(newImg) => handleSettingChange("guruImage", newImg)}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Dress Code Guidelines</label>
                          <textarea rows={2} value={templeSettings.dressCodeText || ""} onChange={(e) => handleSettingChange("dressCodeText", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 w-full" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Accommodation / Dharamshala Info</label>
                          <textarea rows={2} value={templeSettings.lodgingText || ""} onChange={(e) => handleSettingChange("lodgingText", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 w-full" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Trust Information & Directory Description</label>
                          <textarea rows={2} value={templeSettings.trustInformation || ""} onChange={(e) => handleSettingChange("trustInformation", e.target.value)} className="px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 w-full" />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Closing Spiritual Quote (Sanskrit / Hindi)</label>
                          <input type="text" value={templeSettings.aboutEndingQuote || ""} onChange={(e) => handleSettingChange("aboutEndingQuote", e.target.value)} className="px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-neutral-200 bg-neutral-50/50 text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20" placeholder="e.g. सच्चं लोगम्मि सारभूयं" />
                        </div>
                        <div className="sm:col-span-2">
                          <ImageUpload
                            label="About Page Hero / History Section Image"
                            value={templeSettings.aboutHeroBanner || ""}
                            onChange={(newBanner) => handleSettingChange("aboutHeroBanner", newBanner)}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!isDirty || isSavingCms}
                      className={`px-6 py-3 rounded-xl text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 w-full sm:w-fit ml-auto ${!isDirty || isSavingCms
                          ? "bg-neutral-300 cursor-not-allowed opacity-70"
                          : "bg-[#EA580C] hover:bg-[#EA580C]/90 cursor-pointer shadow-md"
                        }`}
                    >
                      {isSavingCms ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving…</span>
                        </>
                      ) : !isDirty ? (
                        <span>No Changes</span>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Save CMS Configuration</span>
                        </>
                      )}
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

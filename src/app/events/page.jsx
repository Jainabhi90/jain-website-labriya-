"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  MapPin,
  Sparkles,
  Bell,
  CheckCircle,
  AlertCircle,
  Search,
  Users,
  Compass,
  ArrowRight
} from "lucide-react";
import { db } from "@/services/db";
import { translations } from "@/services/translations";
import { useCMS } from "@/context/CMSContext";

export default function Events() {
  const { cms } = useCMS();
  const [events, setEvents] = useState([]);
  const [subName, setSubName] = useState("");
  const [subPhone, setSubPhone] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [lang, setLang] = useState("en");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchEvents = async () => {
      const list = await db.getEvents();
      setEvents(list || []);
      if (list && list.length > 0) {
        setSelectedEvent(list[0]);
      }
    };
    fetchEvents();

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

  // Helper: Calculate event status dynamically
  const getEventStatus = (event) => {
    if (event.status === "Cancelled") return "Cancelled";

    const eventDate = new Date(event.date);
    const today = new Date();

    // Compare date strings
    const eventDateStr = eventDate.toDateString();
    const todayDateStr = today.toDateString();

    if (eventDateStr === todayDateStr) {
      return "Live";
    } else if (eventDate < today) {
      return "Completed";
    } else {
      return "Upcoming";
    }
  };

  // Helper: Verify if registration is open
  const isRegistrationOpen = (event) => {
    if (!event.registration_required) return false;
    const status = getEventStatus(event);
    if (status === "Cancelled" || status === "Completed") return false;

    // If deadline is set, compare deadline
    if (event.registration_deadline) {
      return new Date(event.registration_deadline) >= new Date();
    }
    return true;
  };

  // Memoized Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const title = event.title ? event.title.toLowerCase() : "";
      const desc = event.description ? event.description.toLowerCase() : "";
      const loc = event.location ? event.location.toLowerCase() : "";
      const query = searchQuery.toLowerCase();

      // Search matches
      const matchesSearch = title.includes(query) || desc.includes(query) || loc.includes(query);
      if (!matchesSearch) return false;

      // Status filters
      const status = getEventStatus(event);
      const regOpen = isRegistrationOpen(event);

      switch (activeFilter) {
        case "Live":
          return status === "Live";
        case "Upcoming":
          return status === "Upcoming";
        case "Today":
          return status === "Live";
        case "Completed":
          return status === "Completed";
        case "RegOpen":
          return regOpen;
        case "RegClosed":
          return event.registration_required && !regOpen;
        default:
          return true;
      }
    });
  }, [events, searchQuery, activeFilter]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subName.trim() || !subPhone.trim()) {
      setValidationError(lang === "en" ? "Please fill in all fields." : "कृपया सभी फ़ील्ड भरें।");
      return;
    }
    if (subPhone.length < 10) {
      setValidationError(lang === "en" ? "Please enter a valid phone number." : "कृपया एक मान्य फ़ोन नंबर दर्ज करें।");
      return;
    }

    setValidationError("");
    setIsSubmitting(true);
    try {
      if (selectedEvent) {
        await db.subscribeWaitlist(subName, subPhone, selectedEvent.title);
        setSubmitSuccess(true);
        setSubName("");
        setSubPhone("");
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
      setValidationError(lang === "en" ? "An error occurred. Please try again." : "त्रुटि हुई। कृपया पुनः प्रयास करें।");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar .ics download generator
  const downloadICSFile = (event) => {
    const title = event.title;
    const description = event.description || "";
    const location = event.location;
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours duration

    const formatICSDate = (date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Shree Labriya Mandir//Chaturmas Festival//EN",
      "BEGIN:VEVENT",
      `UID:${event.id}@labriyachaturmasin.vercel.app`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = (event) => {
    const title = encodeURIComponent(event.title);
    const description = encodeURIComponent(event.description || "");
    const location = encodeURIComponent(event.location);
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours duration

    const formatGCalDate = (date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGCalDate(startDate)}/${formatGCalDate(endDate)}&details=${description}&location=${location}`;
  };

  const translateEventTitle = (title) => {
    if (!title) return "";
    if (lang === "en") return title;
    if (title.includes("Mahavir Janma Kalyanak")) return "वार्षिक महावीर जन्म कल्याणक पूजा विधान";
    if (title.includes("Paryushan Parva")) return "पर्युषण पर्व ८-दिवसीय महापर्व आराधना";
    return title;
  };

  const translateEventDescription = (desc) => {
    if (!desc) return "";
    if (lang === "en") return desc;
    if (desc.includes("Lord Mahavira")) return "प्रभु महावीर जन्म कल्याणक के शुभ अवसर पर १४ स्वप्न दर्शन और १८-अभिषेक महापूजन का भव्य आयोजन किया जाएगा।";
    if (desc.includes("Paryushan")) return "आत्म-शुद्धि, त्याग-तपस्या और क्षमापना का महापर्व। दैनिक कल्पसूत्र वाचन, व्याख्यान सभा और सांवत्सरिक प्रतिक्रमण आराधना।";
    return desc;
  };

  const translateEventLocation = (loc) => {
    if (!loc) return "";
    if (lang === "en") return loc;
    if (loc.includes("Main Assembly")) return "मुख्य सभागार, श्री लाबरिया मंदिर";
    if (loc.includes("Sanskriti Hall")) return "संस्कृति भवन एवं मुख्य प्रवचन पंडाल";
    return loc;
  };

  const upcomingEventsCount = useMemo(() => {
    return events.filter(e => getEventStatus(e) === "Upcoming").length;
  }, [events]);

  // Filters Options
  const filterChips = [
    { value: "All", label: lang === "en" ? "All Programs" : "सभी कार्यक्रम" },
    { value: "Live", label: lang === "en" ? "Live/Today" : "सजीव / आज" },
    { value: "Upcoming", label: lang === "en" ? "Upcoming" : "आगामी" },
    { value: "Completed", label: lang === "en" ? "Completed" : "पूर्ण" },
    { value: "RegOpen", label: lang === "en" ? "Registration Open" : "पंजीकरण चालू" },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FCFBF7] pt-20 pb-16 flex flex-col items-center">

      {/* 1. EVENT HERO */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-[#EA580C]/10 pb-8">
        <div className="max-w-2xl">
          <span className="px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#C28A3E]/20 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C28A3E] flex items-center gap-1.5 w-fit mx-auto md:mx-0">
            <Sparkles size={12} className="text-[#EA580C]" />
            {cms.chaturmasYear ? `${lang === "en" ? "Chaturmas" : "चातुर्मास"} ${cms.chaturmasYear}` : t.utsavPrograms}
          </span>
          <h1 className="font-display font-bold text-text-primary text-3xl sm:text-4xl mt-3 leading-tight">
            {t.upcomingEvents}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-2">
            {t.eventsSub || (lang === "en" ? "Daily worship, pujas, and assembly schedule at Shree Labriya Mandir" : "श्री लाबरिया मंदिर में दैनिक प्रवचन, पूजा और विशेष सांस्कृतिक कार्यक्रम")}
          </p>
        </div>

        {/* Count Badge */}
        <div className="flex justify-center md:justify-end">
          <div className="bg-white border border-[#C28A3E]/20 px-4 py-2 rounded-custom-md shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C] animate-pulse" />
            <span className="text-xs font-semibold text-[#1F2937] tracking-wide">
              {lang === "en" ? `${upcomingEventsCount} Upcoming Events` : `${upcomingEventsCount} आगामी कार्यक्रम`}
            </span>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTERS CONTROLS */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md select-none">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder={lang === "en" ? "Search programs, venues, speakers..." : "कार्यक्रम, स्थान या विवरण खोजें..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-custom-md bg-white border border-[#EA580C]/10 text-xs sm:text-sm text-text-primary placeholder-[#9CA3AF] focus:outline-none focus:border-[#EA580C]/40 shadow-sm transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full md:w-auto no-scrollbar scroll-smooth">
          {filterChips.map(chip => (
            <button
              key={chip.value}
              onClick={() => setActiveFilter(chip.value)}
              className={`px-4 py-2 rounded-custom-md text-xs font-semibold tracking-wide border transition-all duration-150 shrink-0 cursor-pointer ${activeFilter === chip.value
                  ? "bg-[#EA580C] text-white border-transparent shadow-sm"
                  : "bg-white text-text-secondary border-[#F3F4F6] hover:border-[#EA580C]/20 hover:text-text-primary"
                }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3. TWO COLUMN EVENTS LAYOUT */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Events Grid/List (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          <AnimatePresence mode="popLayout">
            {filteredEvents.length > 0 ? (
              <div className="grid gap-5">
                {filteredEvents.map((event) => {
                  const status = getEventStatus(event);
                  const regOpen = isRegistrationOpen(event);
                  const isSelected = selectedEvent?.id === event.id;

                  return (
                    <motion.div
                      key={event.id}
                      layoutId={`event-card-${event.id}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setSelectedEvent(event)}
                      className={`p-5 rounded-custom-lg border transition-all duration-200 cursor-pointer flex flex-col gap-4 items-start ${isSelected
                          ? "bg-white border-[#EA580C] shadow-premium-hover ring-1 ring-[#EA580C]/20"
                          : "bg-white border-[#EA580C]/5 hover:border-[#C28A3E]/20 shadow-premium"
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row gap-5 items-start w-full">
                        {/* Event Thumbnail aspect ratio preserved */}
                        <div className="w-full sm:w-36 h-28 rounded-custom-md overflow-hidden shrink-0 border border-[#C28A3E]/10 bg-[#FFF7ED] relative">
                          {event.imageUrl ? (
                            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#EA580C] font-semibold text-2xl">🪷</div>
                          )}

                          {/* Floating Date Overlay */}
                          <div className="absolute top-2 left-2 bg-[#EA580C] text-white text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-custom-sm">
                            {new Date(event.date).toLocaleDateString(lang === "en" ? "en-US" : "hi-IN", { month: "short", day: "numeric" })}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex flex-col justify-between gap-2.5 w-full">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Live Status Badge */}
                            {status === "Live" && (
                              <span className="px-2 py-0.5 rounded-custom-sm bg-emerald-50 text-emerald-700 border border-emerald-500/20 text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-600 animate-ping" />
                                {lang === "en" ? "Live Today" : "आज सजीव"}
                              </span>
                            )}
                            {status === "Upcoming" && (
                              <span className="px-2 py-0.5 rounded-custom-sm bg-[#FFF7ED] text-[#EA580C] border border-[#EA580C]/20 text-[9px] font-bold tracking-wider uppercase">
                                {lang === "en" ? "Upcoming" : "आगामी"}
                              </span>
                            )}
                            {status === "Completed" && (
                              <span className="px-2 py-0.5 rounded-custom-sm bg-neutral-50 text-neutral-600 border border-neutral-200 text-[9px] font-bold tracking-wider uppercase">
                                {lang === "en" ? "Completed" : "पूर्ण"}
                              </span>
                            )}
                            {status === "Cancelled" && (
                              <span className="px-2 py-0.5 rounded-custom-sm bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold tracking-wider uppercase">
                                {lang === "en" ? "Cancelled" : "निरस्त"}
                              </span>
                            )}

                            {/* Registration Badge */}
                            {event.registration_required && (
                              regOpen ? (
                                <span className="px-2 py-0.5 rounded-custom-sm bg-emerald-50/50 text-emerald-700 border border-emerald-500/20 text-[9px] font-medium tracking-wide">
                                  {lang === "en" ? "Registration Open" : "पंजीकरण चालू"}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-custom-sm bg-neutral-50 text-neutral-600 border border-neutral-200 text-[9px] font-medium tracking-wide">
                                  {lang === "en" ? "Registration Closed" : "पंजीकरण बंद"}
                                </span>
                              )
                            )}
                          </div>

                          <div>
                            <h3 className="font-display font-bold text-text-primary text-base sm:text-lg mb-1 leading-snug">
                              {translateEventTitle(event.title)}
                            </h3>
                            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                              {translateEventDescription(event.description)}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-4 text-xs text-text-secondary font-medium mt-1">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon size={14} className="text-[#C28A3E]" />
                              <span>
                                {new Date(event.date).toLocaleDateString(lang === "en" ? "en-US" : "hi-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin size={14} className="text-[#C28A3E]" />
                              <span>{translateEventLocation(event.location)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Add to Calendar Section */}
                      <div className="flex flex-wrap items-center gap-2 mt-1 pt-3.5 border-t border-[#EA580C]/5 w-full select-none">
                        <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                          {t.addToCalendar}:
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadICSFile(event);
                          }}
                          className="px-3 py-1 rounded bg-[#FFF7ED] hover:bg-[#EA580C] hover:text-white text-[#EA580C] border border-[#EA580C]/20 text-[9px] font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer"
                        >
                          .ICS File
                        </button>

                        <a
                          href={getGoogleCalendarUrl(event)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1 rounded bg-[#FFF7ED] hover:bg-[#EA580C] hover:text-white text-[#EA580C] border border-[#EA580C]/20 text-[9px] font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer"
                        >
                          Google Calendar
                        </a>
                      </div>

                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* ELEGANT EMPTY STATE */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 rounded-custom-lg bg-white border border-[#EA580C]/5 shadow-premium flex flex-col items-center justify-center text-center gap-5 min-h-[300px]"
              >
                <Compass className="w-14 h-14 text-[#C28A3E] animate-pulse" />
                <div>
                  <h4 className="font-display font-semibold text-text-primary text-base sm:text-lg mb-1.5">
                    {lang === "en" ? "No Programs Found" : "कोई कार्यक्रम नहीं मिला"}
                  </h4>
                  <p className="text-xs text-text-secondary max-w-sm leading-relaxed">
                    {lang === "en"
                      ? "There are no events matching your filter query. Explore daily Choghadiya and auspicious timelines on our Panchang page."
                      : "आपकी खोज के अनुसार कोई कार्यक्रम उपलब्ध नहीं है। दैनिक पंचांग और चौघड़िया देखने के लिए पंचांग पृष्ठ पर जाएं।"}
                  </p>
                </div>
                <Link href="/panchang">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-custom-md bg-[#EA580C] text-white hover:bg-[#EA580C]/90 text-xs font-semibold shadow-sm transition-colors cursor-pointer">
                    <span>{lang === "en" ? "Check Panchang" : "पंचांग देखें"}</span>
                    <ArrowRight size={14} />
                  </button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Premium Coming Soon Card */}
          <div className="p-8 rounded-custom-lg bg-[#FFF7ED]/30 border border-dashed border-[#C28A3E]/20 flex flex-col items-center text-center gap-4 mt-2">
            <span className="text-2xl">🗓️</span>
            <div>
              <h4 className="font-display font-semibold text-text-primary text-base mb-1">{t.moreProgramsSoon}</h4>
              <p className="text-xs text-text-secondary max-w-md leading-relaxed">
                {t.moreProgramsSoonDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Waitlist / Info Panel (col-span-4) */}
        <div className="lg:col-span-4 w-full">
          <div className="sticky top-24 p-6 sm:p-7 rounded-custom-lg bg-white border border-[#EA580C]/5 shadow-premium flex flex-col gap-6">

            {/* Header info */}
            <div className="flex items-center gap-3 pb-3.5 border-b border-[#EA580C]/5">
              <div className="w-10 h-10 rounded-full bg-[#FFF7ED] border border-[#EA580C]/10 flex items-center justify-center text-[#EA580C]">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base">{t.bookingWaitlist}</h3>
                <p className="text-[9px] text-[#C28A3E] uppercase tracking-widest font-bold">{t.notifyMe}</p>
              </div>
            </div>

            {selectedEvent ? (
              <div className="flex flex-col gap-4">
                {/* Visual Header preview of chosen event */}
                <div className="p-3.5 rounded-custom-md bg-[#FCFBF7] border border-[#C28A3E]/10 select-none">
                  <span className="text-[9px] text-[#C28A3E] uppercase font-bold tracking-wider">{lang === "en" ? "Selected Program" : "चयनित कार्यक्रम"}</span>
                  <h4 className="font-semibold text-xs sm:text-sm text-text-primary mt-1 max-w-[280px] truncate leading-tight">
                    {translateEventTitle(selectedEvent.title)}
                  </h4>
                  <div className="flex items-center gap-3 text-[10px] text-text-secondary mt-1.5">
                    <span className="flex items-center gap-1"><CalendarIcon size={11} /> {new Date(selectedEvent.date).toLocaleDateString(lang === "en" ? "en-US" : "hi-IN", { month: "short", day: "numeric" })}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} /> {translateEventLocation(selectedEvent.location).split(",")[0]}</span>
                  </div>
                </div>

                {/* Submitting/closed alerts */}
                {(cms.registrationClosed || cms.registrationOpen === false) ? (
                  <div className="p-4 rounded-custom-md bg-red-50 border border-red-100 text-red-700 text-xs font-semibold text-center select-none">
                    ⚠️ {lang === "en" ? "Registration is currently closed by temple administration." : "पंजीकरण वर्तमान में मंदिर प्रशासन द्वारा बंद है।"}
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {lang === "en" ? (
                        <>
                          Join the notification circle for <strong className="text-text-primary">{translateEventTitle(selectedEvent.title)}</strong>. We will alert you via SMS/WhatsApp as soon as seating registrations and passes open.
                        </>
                      ) : (
                        <>
                          <strong className="text-text-primary">{translateEventTitle(selectedEvent.title)}</strong> के लिए सूचना समूह में शामिल हों। सीट बुकिंग और दर्शन पास शुरू होते ही हम आपको व्हाट्सएप/एसएमएस पर सूचित करेंगे।
                        </>
                      )}
                    </p>

                    <form onSubmit={handleSubscribe} className="flex flex-col gap-4.5">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="sub-name" className="text-[11px] text-text-secondary font-semibold">{t.yourName}</label>
                        <input
                          id="sub-name"
                          type="text"
                          placeholder={lang === "en" ? "e.g. Rahul Shah" : "जैसे: राहुल शाह"}
                          value={subName}
                          onChange={(e) => setSubName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-custom-md bg-[#FCFBF7] border border-[#EA580C]/10 focus:border-[#EA580C]/40 focus:outline-none text-xs sm:text-sm text-text-primary transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="sub-phone" className="text-[11px] text-text-secondary font-semibold">{t.phoneLabel}</label>
                        <input
                          id="sub-phone"
                          type="tel"
                          maxLength={10}
                          placeholder={lang === "en" ? "e.g. 9876543210" : "जैसे: 9876543210"}
                          value={subPhone}
                          onChange={(e) => setSubPhone(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-4 py-2.5 rounded-custom-md bg-[#FCFBF7] border border-[#EA580C]/10 focus:border-[#EA580C]/40 focus:outline-none text-xs sm:text-sm text-text-primary transition-all"
                        />
                      </div>

                      {validationError && (
                        <div className="flex items-center gap-1.5 text-xs text-red-600">
                          <AlertCircle size={14} className="shrink-0" />
                          <span>{validationError}</span>
                        </div>
                      )}

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-custom-md bg-[#EA580C] hover:bg-[#EA580C]/90 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all mt-1 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? t.submittingSub : t.notifyMe}
                      </motion.button>
                    </form>
                  </>
                )}

                <AnimatePresence>
                  {submitSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-2.5 p-3 rounded-custom-sm bg-emerald-50 text-emerald-700 border border-emerald-500/10 text-xs font-semibold mt-2"
                    >
                      <CheckCircle size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <p>{t.subSuccessTitle}</p>
                        <p className="text-[10px] text-emerald-600/80 mt-0.5">{t.subSuccessDesc}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            ) : (
              <div className="text-sm text-text-secondary italic text-center py-6 select-none">{t.selectEventToNotify}</div>
            )}
          </div>
        </div>

      </section>

    </div>
  );
}

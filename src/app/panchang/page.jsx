"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Sun, 
  Moon, 
  Calendar as CalendarIcon, 
  Compass, 
  Clock, 
  Sparkles,
  AlertCircle,
  BookOpen,
  Info,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { db } from "@/services/db";
import { translations } from "@/services/translations";

export default function Panchang() {
  const [selectedDate, setSelectedDate] = useState("");
  const [panchang, setPanchang] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState("en");

  // Calendar monthly view states
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth() + 1); // 1-12
  const [monthRecords, setMonthRecords] = useState({});

  // Set today's date dynamically to local date formatted YYYY-MM-DD
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    
    setSelectedDate(formattedDate);
    setCalYear(yyyy);
    setCalMonth(today.getMonth() + 1);
    fetchPanchang(formattedDate);

    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "en");
      const syncLang = () => {
        setLang(localStorage.getItem("lang") || "en");
      };
      window.addEventListener("languageChange", syncLang);
      return () => window.removeEventListener("languageChange", syncLang);
    }
  }, []);

  // Fetch monthly records whenever calendar view shifts
  useEffect(() => {
    const loadMonthData = async () => {
      try {
        const data = await db.getPanchangForMonth(calYear, calMonth);
        setMonthRecords(data);
      } catch (e) {
        console.error("Month records fetch failed", e);
      }
    };
    loadMonthData();
  }, [calYear, calMonth, selectedDate]);

  const t = translations[lang] || translations["en"];

  const localDict = {
    en: {
      astronomicalDetails: "Astronomical & Transit Details",
      nakshatra: "Nakshatra",
      yoga: "Yoga",
      karana: "Karana",
      moonSign: "Moon Sign",
      fastingInfo: "Fasting & Tapas Guide",
      specialNotes: "Auspicious Notes",
      importantTimings: "Auspicious Timings (Navkarshi, etc.)",
      additionalRemarks: "Remarks",
      none: "None",
      calendarGrid: "Panchang Monthly Grid Map",
      prevMonth: "Previous",
      nextMonth: "Next",
      shubhDinMarker: "Shubh Din",
      samayikMarker: "Samayik Day",
      selectDateTip: "Click any date on the monthly grid card to fetch its auspicious alignments below.",
      dayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    },
    hi: {
      astronomicalDetails: "खगोलीय एवं गोचर गणना",
      nakshatra: "नक्षत्र",
      yoga: "योग",
      karana: "करण",
      moonSign: "चन्द्र राशि",
      fastingInfo: "तप / उपवास विवरण",
      specialNotes: "विशेष निर्देश",
      importantTimings: "शुभ समय (नवकारशी, पोरसी आदि)",
      additionalRemarks: "टिप्पणी",
      none: "कोई नहीं",
      calendarGrid: "मासिक पंचांग ग्रिड",
      prevMonth: "पिछला",
      nextMonth: "अगला",
      shubhDinMarker: "शुभ दिन",
      samayikMarker: "सामायिक दिन",
      selectDateTip: "दैनिक मुहूर्त और विवरण देखने के लिए मासिक ग्रिड में किसी भी तिथि पर क्लिक करें।",
      dayLabels: ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"]
    }
  };

  const l = localDict[lang] || localDict["en"];

  const fetchPanchang = async (dateStr) => {
    setIsLoading(true);
    try {
      const data = await db.getPanchang(dateStr);
      setPanchang(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    fetchPanchang(dateStr);
  };

  // Helper to dynamically calculate Day Choghadiya intervals based on Sunrise & Sunset
  const calculateChoghadiyas = (sunriseStr, sunsetStr, dateStr) => {
    if (!sunriseStr || !sunsetStr) return [];

    const parseToMin = (tStr) => {
      const clean = tStr.replace(/(AM|PM)/i, "").trim();
      const [h, m] = clean.split(":").map(Number);
      let hours = h;
      if (tStr.toLowerCase().includes("pm") && h < 12) hours += 12;
      if (tStr.toLowerCase().includes("am") && h === 12) hours = 0;
      return hours * 60 + m;
    };

    const formatToTimeStr = (totalMin) => {
      const h = Math.floor(totalMin / 60) % 24;
      const m = Math.floor(totalMin % 60);
      const period = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 === 0 ? 12 : h % 12;
      return `${displayH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
    };

    const srMin = parseToMin(sunriseStr);
    const ssMin = parseToMin(sunsetStr);
    const dayLength = ssMin - srMin;
    const partSize = dayLength / 8;

    const dayOfWeek = new Date(dateStr).getDay();

    const CHOGHADIYA_DAYS = [
      ["Udveg", "Chala", "Labh", "Amrit", "Kaal", "Shubh", "Roga", "Udveg"],
      ["Amrit", "Kaal", "Shubh", "Roga", "Udveg", "Chala", "Labh", "Amrit"],
      ["Roga", "Udveg", "Chala", "Labh", "Amrit", "Kaal", "Shubh", "Roga"],
      ["Labh", "Amrit", "Kaal", "Shubh", "Roga", "Udveg", "Chala", "Labh"],
      ["Shubh", "Roga", "Udveg", "Chala", "Labh", "Amrit", "Kaal", "Shubh"],
      ["Chala", "Labh", "Amrit", "Kaal", "Shubh", "Roga", "Udveg", "Chala"],
      ["Kaal", "Shubh", "Roga", "Udveg", "Chala", "Labh", "Amrit", "Kaal"],
    ];

    const STATUS_MAP = {
      "Amrit": "Auspicious",
      "Shubh": "Auspicious",
      "Labh": "Auspicious",
      "Chala": "Normal",
      "Udveg": "Inauspicious",
      "Roga": "Inauspicious",
      "Kaal": "Inauspicious",
    };

    const daySequence = CHOGHADIYA_DAYS[dayOfWeek] || CHOGHADIYA_DAYS[0];

    return daySequence.map((name, i) => {
      const start = srMin + i * partSize;
      const end = srMin + (i + 1) * partSize;
      return {
        name: `${name} Choghadiya`,
        time: `${formatToTimeStr(start)} - ${formatToTimeStr(end)}`,
        status: STATUS_MAP[name] || "Normal"
      };
    });
  };

  const choghadiyaIntervals = panchang 
    ? calculateChoghadiyas(panchang.sunrise, panchang.sunset, selectedDate)
    : [];

  const translateTithi = (tithiText) => {
    if (!tithiText || lang === "en") return tithiText;
    return tithiText
      .replace("Jeth", "ज्येष्ठ")
      .replace("Ashadh", "आषाढ़")
      .replace("Shraavan", "श्रावण")
      .replace("Bhadarvo", "भाद्रपद")
      .replace("Aaso", "आश्विन")
      .replace("Sud", "सुद (शुक्ल)")
      .replace("Vad", "वद (कृष्ण)")
      .replace("Krishna Dwadashi (12th)", "कृष्ण द्वादशी (१२वीं)");
  };

  const translateChoghadiyaName = (name) => {
    if (lang === "en") return name;
    return name
      .replace("Udveg", "उद्वेग")
      .replace("Chala", "चल")
      .replace("Labh", "लाभ")
      .replace("Amrit", "अमृत")
      .replace("Kaal", "काल")
      .replace("Shubh", "शुभ")
      .replace("Roga", "रोग")
      .replace("Choghadiya", "चौघड़िया");
  };

  const translateChoghadiyaStatus = (status) => {
    if (lang === "en") return status;
    if (status === "Auspicious") return "शुभ";
    if (status === "Inauspicious") return "अशुभ";
    return "सामान्य";
  };

  const translatePaksha = (paksha) => {
    if (lang === "en") return paksha;
    if (!paksha) return "";
    return paksha
      .replace("Shukla (Sud)", "शुक्ल पक्ष (सुद)")
      .replace("Krishna (Vad)", "कृष्ण पक्ष (वद)")
      .replace("Shukla", "शुक्ल पक्ष")
      .replace("Krishna", "कृष्ण पक्ष");
  };

  const translateMonth = (month) => {
    if (lang === "en") return month;
    if (!month) return "";
    return month
      .replace("Jeth", "ज्येष्ठ")
      .replace("Ashadh", "आषाढ़")
      .replace("Shraavan", "श्रावण")
      .replace("Bhadarvo", "भाद्रपद")
      .replace("Aaso", "आश्विन")
      .replace("Chatra", "चैत्र")
      .replace("Vaisakha", "वैशाख")
      .replace("Jyeshtha", "ज्येष्ठ")
      .replace("Ashadha", "आषाढ़")
      .replace("Shravana", "श्रावण")
      .replace("Bhadrapada", "भाद्रपद")
      .replace("Ashvina", "आश्विन")
      .replace("Kartika", "कार्तिक");
  };

  // Monthly Calendar generator
  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month - 1, 1).getDay();

  const handlePrevMonth = () => {
    if (calMonth === 1) {
      setCalMonth(12);
      setCalYear(prev => prev - 1);
    } else {
      setCalMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 12) {
      setCalMonth(1);
      setCalYear(prev => prev + 1);
    } else {
      setCalMonth(prev => prev + 1);
    }
  };

  const renderPublicCalendarGrid = () => {
    const days = getDaysInMonth(calYear, calMonth);
    const startOffset = getFirstDayOfMonth(calYear, calMonth);
    const cells = [];

    const dayLabels = l.dayLabels;

    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="h-14 sm:h-16 border border-neutral-100 bg-neutral-50/50" />);
    }

    for (let d = 1; d <= days; d++) {
      const dateStr = `${calYear}-${calMonth.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
      const isSelected = dateStr === selectedDate;
      const today = new Date();
      const isToday = today.getFullYear() === calYear && (today.getMonth() + 1) === calMonth && today.getDate() === d;
      
      const record = monthRecords[dateStr];
      const hasFestival = record && (record.festival || record.event);
      const hasFasting = record && record.fastingInfo;
      const isShubh = record && record.shubh_din;
      const isSamayik = record && record.samayik;

      cells.push(
        <button
          key={`day-${d}`}
          onClick={() => handleDateClick(dateStr)}
          className={`h-14 sm:h-16 border border-neutral-100 p-1.5 flex flex-col justify-between text-left transition-all relative select-none hover:bg-primary/5 cursor-pointer ${
            isSelected 
              ? "bg-primary/10 text-primary border-primary/40 font-bold ring-1 ring-primary" 
              : isToday 
              ? "bg-orange-50 text-primary border-orange-200" 
              : "bg-white text-text-primary"
          }`}
        >
          <div className="flex justify-between items-center w-full">
            <span className="text-[11px] font-bold">{d}</span>
            <div className="flex gap-0.5">
              {isShubh && <span className="text-[7.5px] font-bold text-primary" title="Shubh Din">卐</span>}
              {isSamayik && <span className="text-[7.5px] font-bold text-accent" title="Samayik">📖</span>}
            </div>
          </div>

          <div className="flex flex-col gap-0.5 w-full overflow-hidden">
            {record?.tithi && (
              <span className="text-[7.5px] text-text-secondary truncate font-medium">
                {record.tithi.replace("Sud", "S").replace("Vad", "V")}
              </span>
            )}
            <div className="flex items-center gap-1">
              {hasFestival && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
              {hasFasting && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />}
            </div>
          </div>
        </button>
      );
    }

    const totalCells = cells.length;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remaining; i++) {
      cells.push(<div key={`empty-end-${i}`} className="h-14 sm:h-16 border border-neutral-100 bg-neutral-50/50" />);
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] uppercase tracking-wider text-text-secondary bg-neutral-50 py-2 rounded border border-border-custom">
          {dayLabels.map(lbl => <div key={lbl}>{lbl}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 border border-border-custom rounded-custom-lg bg-neutral-100/20 overflow-hidden">
          {cells}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col items-center">
      
      {/* Header */}
      <div className="text-center max-w-2xl mb-10">
        <span className="px-3 py-1 rounded-full bg-secondary border border-primary/10 text-[10px] font-semibold uppercase tracking-widest text-primary flex items-center gap-1.5 w-fit mx-auto">
          <CalendarIcon size={12} />
          {t.spiritualCalendar}
        </span>
        <h1 className="font-display font-semibold text-text-primary text-3xl sm:text-4xl mt-3">
          {t.panchangTitle}
        </h1>
        <p className="text-sm text-text-secondary mt-2">
          {t.panchangSub}
        </p>
      </div>

      {/* Main Container: Monthly Calendar Top & Day Details Bottom */}
      <div className="w-full flex flex-col gap-8">
        
        {/* Calendar visual card */}
        <div className="p-5 sm:p-6 rounded-custom-lg border border-border-custom bg-white shadow-premium flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="font-display font-semibold text-text-primary text-sm uppercase tracking-wider flex items-center gap-1.5">
                <span>📅</span> {l.calendarGrid}
              </h2>
              <p className="text-[10px] text-text-secondary mt-0.5">{l.selectDateTip}</p>
            </div>

            <div className="flex items-center gap-2 self-end">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 rounded border border-border-custom bg-white hover:bg-neutral-50 text-text-secondary cursor-pointer"
                title={l.prevMonth}
              >
                <ChevronLeft size={16} />
              </button>
              
              <span className="text-xs font-bold text-text-primary uppercase min-w-[120px] text-center select-none">
                {new Date(calYear, calMonth - 1).toLocaleString("en-US", { month: "long", year: "numeric" })}
              </span>

              <button 
                onClick={handleNextMonth}
                className="p-1.5 rounded border border-border-custom bg-white hover:bg-neutral-50 text-text-secondary cursor-pointer"
                title={l.nextMonth}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {renderPublicCalendarGrid()}

          <div className="flex flex-wrap gap-4 text-[9.5px] text-text-secondary justify-end border-t border-neutral-100 pt-3 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block" /> Festival / Event
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 block" /> {l.fastingInfo}
            </span>
            <span className="flex items-center gap-1.5 text-text-primary font-bold">
              <span>卐</span> {l.shubhDinMarker}
            </span>
            <span className="flex items-center gap-1.5 text-text-primary font-bold">
              <span>📖</span> {l.samayikMarker}
            </span>
          </div>
        </div>

        {/* Selected Day Details Panel */}
        {isLoading ? (
          <div className="w-full h-80 flex flex-col items-center justify-center gap-3 bg-white border border-border-custom rounded-custom-lg shadow-premium">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-text-secondary">{t.recalculatingAlignments}</p>
          </div>
        ) : panchang ? (
          <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Left 3 Columns: Core calculations, Tithis & Astronomical details */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* Daily Overview Card */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 sm:p-8 rounded-custom-lg bg-white border border-border-custom shadow-premium relative overflow-hidden flex flex-col gap-5"
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-xl pointer-events-none" />
                
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary">{t.tithiOfDay} ({selectedDate})</span>
                  <h2 className="font-display font-semibold text-text-primary text-2xl sm:text-3xl mt-1 leading-snug">
                    {translateTithi(panchang.tithi)}
                  </h2>
                  {panchang.event && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-primary/20 text-xs font-bold text-primary">
                      <Sparkles size={12} />
                      <span>{panchang.event}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-custom">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">
                      {lang === "en" ? "Paksha" : "पक्ष"}
                    </span>
                    <span className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                      <Moon size={14} className="text-accent" />
                      {translatePaksha(panchang.paksha)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">
                      {lang === "en" ? "Month" : "माह"}
                    </span>
                    <span className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                      <CalendarIcon size={14} className="text-accent" />
                      {translateMonth(panchang.month)} {lang === "en" ? "Mah" : "माह"}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Astronomical Transits Details Grid */}
              <div className="p-6 rounded-custom-lg bg-white border border-border-custom shadow-premium flex flex-col gap-4">
                <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-100">
                  <Info size={14} className="text-primary" />
                  <span>{l.astronomicalDetails}</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold text-text-secondary">{l.nakshatra}</span>
                    <span className="text-xs font-semibold text-text-primary">{panchang.nakshatra || l.none}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold text-text-secondary">{l.yoga}</span>
                    <span className="text-xs font-semibold text-text-primary">{panchang.yoga || l.none}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold text-text-secondary">{l.karana}</span>
                    <span className="text-xs font-semibold text-text-primary">{panchang.karana || l.none}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold text-text-secondary">{l.moonSign}</span>
                    <span className="text-xs font-semibold text-text-primary">{panchang.moonSign || l.none}</span>
                  </div>
                </div>
              </div>

              {/* Fasting & Special Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Fasting Card */}
                <div className="p-5 rounded-custom-lg bg-white border border-border-custom shadow-premium flex flex-col gap-2">
                  <span className="text-[9px] uppercase font-bold text-green-600 tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 block" /> {l.fastingInfo}
                  </span>
                  <p className="text-xs text-text-primary font-medium leading-relaxed">
                    {panchang.fastingInfo || (lang === "en" ? "No fasting guidelines recorded for this date." : "इस तिथि के लिए कोई विशेष तप निर्देश उपलब्ध नहीं हैं।")}
                  </p>
                </div>

                {/* Auspicious Notes Card */}
                <div className="p-5 rounded-custom-lg bg-white border border-border-custom shadow-premium flex flex-col gap-2">
                  <span className="text-[9px] uppercase font-bold text-amber-600 tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 block" /> {l.specialNotes}
                  </span>
                  <p className="text-xs text-text-primary font-medium leading-relaxed">
                    {panchang.specialNotes || (lang === "en" ? "Standard auspicious activities allowed." : "सामान्य शुभ कार्य स्वीकृत हैं।")}
                  </p>
                </div>
              </div>

              {/* Sun cycles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-custom-lg bg-white border border-border-custom shadow-premium flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                    <Sun size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">{t.sunrise}</span>
                    <h4 className="font-display font-bold text-text-primary text-base">{panchang.sunrise}</h4>
                  </div>
                </div>

                <div className="p-5 rounded-custom-lg bg-white border border-border-custom shadow-premium flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                    <Moon size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">{t.sunset}</span>
                    <h4 className="font-display font-bold text-text-primary text-base">{panchang.sunset}</h4>
                  </div>
                </div>
              </div>

              {/* Panchang Notice Footnote */}
              <div className="p-4 rounded-custom-lg bg-secondary/35 border border-border-custom flex items-start gap-3">
                <Compass size={18} className="text-accent shrink-0 mt-0.5" />
                <p className="text-[10px] text-text-secondary leading-relaxed">
                  {t.panchangFootnote}
                </p>
              </div>

            </div>

            {/* Right 2 Columns: Choghadiyas & Important Timings */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Important Timings (Navkarshi, Porashi) */}
              <div className="p-5 rounded-custom-lg bg-white border border-border-custom shadow-premium flex flex-col gap-3">
                <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={14} className="text-accent" />
                  <span>{l.importantTimings}</span>
                </h3>
                <div className="p-4 rounded bg-neutral-50/70 border border-neutral-100 text-xs text-text-primary font-semibold whitespace-pre-line leading-relaxed">
                  {panchang.importantTimings || (lang === "en" ? "Standard timings based on local sunrise." : "सूर्योदय के आधार पर सामान्य समय।")}
                </div>
              </div>

              {/* Choghadiya Intervals */}
              <div className="p-6 rounded-custom-lg bg-white border border-border-custom shadow-premium flex flex-col gap-5">
                
                <div className="flex items-center gap-3 pb-3 border-b border-border-custom">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-primary">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-text-primary text-base">{t.auspiciousTimings}</h3>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">{t.choghadiyaIntervals}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {choghadiyaIntervals.map((time, idx) => {
                    let statusColor = "bg-neutral-50 text-neutral-700 border-neutral-200/50";
                    if (time.status === "Auspicious") {
                      statusColor = "bg-emerald-50 text-emerald-700 border-emerald-500/10";
                    } else if (time.status === "Inauspicious") {
                      statusColor = "bg-red-50 text-red-700 border-red-500/10";
                    }

                    return (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-3 rounded-custom-md bg-bg-custom border border-border-custom"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-primary">
                            {translateChoghadiyaName(time.name)}
                          </span>
                          <span className="text-[9.5px] text-text-secondary mt-0.5">{time.time}</span>
                        </div>
                        <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusColor}`}>
                          {translateChoghadiyaStatus(time.status)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="p-6 rounded-custom-lg bg-red-50 border border-red-500/10 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600 shrink-0" />
            <p className="text-sm text-red-600">
              {lang === "en" ? "Panchang details could not be parsed for this date." : "इस तिथि के लिए पंचांग विवरण की गणना नहीं की जा सकी।"}
            </p>
          </div>
        )}

      </div>

    </div>
  );
}

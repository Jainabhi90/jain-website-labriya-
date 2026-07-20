"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  BookOpenCheck,
  Video,
  FileText,
  MapPin
} from "lucide-react";
import { db } from "@/services/db";
import { translations } from "@/services/translations";
import { useCMS } from "@/context/CMSContext";

const JAIN_QUOTES = [
  {
    text: "अहिंसा परमो धर्मः",
    translation: "Non-violence is the supreme path of dharma.",
    source: "Lord Mahavira"
  },
  {
    text: "परस्परोपग्रहो जीवानाम्",
    translation: "All living beings are bound to help and serve one another.",
    source: "Tattvartha Sutra 5.21"
  },
  {
    text: "सम्यग्दर्शनज्ञानचारित्राणि मोक्षमार्गः",
    translation: "Right faith, right knowledge, and right conduct together constitute the path to liberation.",
    source: "Tattvartha Sutra 1.1"
  },
  {
    text: "खामेमि सव्व जीवे, सव्वे जीवा खमंतु मे।",
    translation: "I forgive all living beings; let all living beings forgive me.",
    source: "Jain Prayer of Forgiveness"
  },
  {
    text: "अपरिग्रह वयाई",
    translation: "Non-possessiveness leads to inner balance, simplicity, and mental peace.",
    source: "Jain Doctrine"
  },
  {
    text: "सच्चं लोगम्मि सारभूयं",
    translation: "Truth is the only essence and core truth in this universe.",
    source: "Dasavaikalika Sutra"
  }
];

export default function Panchang() {
  const { cms } = useCMS();
  const [selectedDate, setSelectedDate] = useState("");
  const [panchang, setPanchang] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState("en");
  const [schedules, setSchedules] = useState([]);

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

    // Fetch schedules
    const loadSchedules = async () => {
      try {
        const data = await db.getSchedules();
        setSchedules(data || []);
      } catch (err) {
        console.error("Schedules load failed", err);
      }
    };
    loadSchedules();

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
        setMonthRecords(data || {});
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
      calendarGrid: "Panchang Monthly Grid",
      prevMonth: "Previous",
      nextMonth: "Next",
      shubhDinMarker: "Shubh",
      samayikMarker: "Samayik",
      selectDateTip: "Click any date to load daily details below.",
      dayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      spiritualQuote: "Spiritual Guidance",
      todayPravachan: "Today's Discourse / Activity",
      upcomingDays: "Upcoming Week Outlook",
      festivalsThisMonth: "Important Festivals This Month"
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
      shubhDinMarker: "शुभ",
      samayikMarker: "सामायिक",
      selectDateTip: "दैनिक मुहूर्त और विवरण देखने के लिए ग्रिड में किसी तिथि पर क्लिक करें।",
      dayLabels: ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"],
      spiritualQuote: "दैनिक अध्यात्म प्रेरणा",
      todayPravachan: "आज के प्रवचन एवं गतिविधियां",
      upcomingDays: "आगामी साप्ताहिक झलक",
      festivalsThisMonth: "इस माह के प्रमुख पर्व एवं उत्सव"
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

    try {
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
    } catch (err) {
      console.error("Error calculating Choghadiyas", err);
      return [];
    }
  };

  const choghadiyaIntervals = useMemo(() => {
    return panchang && panchang.sunrise && panchang.sunset
      ? calculateChoghadiyas(panchang.sunrise, panchang.sunset, selectedDate)
      : [];
  }, [panchang, selectedDate]);

  const translateTithi = (tithiText) => {
    if (!tithiText || lang === "en") return tithiText;
    return tithiText
      .replace("Jeth", "ज्येष्ठ")
      .replace("Ashadh", "आषाढ़")
      .replace("Shraavan", "श्रावण")
      .replace("Bhadarvo", "भाद्रपद")
      .replace("Aaso", "आश्विन")
      .replace("Sud", "शुक्ल पक्ष (सुद)")
      .replace("Vad", "कृष्ण पक्ष (वद)")
      .replace("Krishna Dwadashi (12th)", "कृष्ण द्वादशी (१२वीं)")
      .replace("Dwitiya (2nd)", "द्वितीया")
      .replace("Tritiya (3rd)", "तृतीया")
      .replace("Chaturthi (4th)", "चतुर्थी")
      .replace("Panchami (5th)", "पंचमी")
      .replace("Shashthi (6th)", "षष्ठी")
      .replace("Saptami (7th)", "सप्तमी")
      .replace("Ashtami (8th)", "अष्टमी")
      .replace("Navami (9th)", "नवमी")
      .replace("Dashami (10th)", "दशमी")
      .replace("Ekadashi (11th)", "एकादशी")
      .replace("Dwadashi (12th)", "द्वादशी")
      .replace("Trayodashi (13th)", "त्रयोदशी")
      .replace("Chaturdashi (14th)", "चतुर्दशी")
      .replace("Poonam (Full Moon)", "पूर्णिमा (पूनम)")
      .replace("Amavasya (New Moon)", "अमावस्या");
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

  // Helper: Quotes shifts daily
  const dailyQuote = useMemo(() => {
    if (!selectedDate) return JAIN_QUOTES[0];
    const day = new Date(selectedDate).getDate() || 1;
    return JAIN_QUOTES[day % JAIN_QUOTES.length];
  }, [selectedDate]);

  // Helper: Extract pravachan sessions from loaded schedules
  const pravachans = useMemo(() => {
    return schedules.filter(s => 
      s.activity.toLowerCase().includes("pravachan") || 
      s.activity.toLowerCase().includes("प्रवचन") ||
      s.activity.toLowerCase().includes("vachana") ||
      s.activity.toLowerCase().includes("discourse") ||
      s.activity.toLowerCase().includes("lecture")
    );
  }, [schedules]);

  // Helper: Timeline upcoming week
  const timelineDays = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const next = new Date(today);
      next.setDate(today.getDate() + i);
      const yyyy = next.getFullYear();
      const mm = String(next.getMonth() + 1).padStart(2, "0");
      const dd = String(next.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      list.push({
        dateStr,
        dayLabel: next.toLocaleDateString(lang === "en" ? "en-US" : "hi-IN", { weekday: "short" }),
        dateNum: next.getDate(),
        monthLabel: next.toLocaleDateString(lang === "en" ? "en-US" : "hi-IN", { month: "short" })
      });
    }
    return list;
  }, [lang]);

  // Helper: Festivals in viewed month
  const monthlyFestivals = useMemo(() => {
    const list = [];
    Object.keys(monthRecords).forEach(dateStr => {
      const record = monthRecords[dateStr];
      if (record && (record.festival || record.event)) {
        list.push({
          dateStr,
          title: record.festival || record.event,
          tithi: record.tithi,
          dateObj: new Date(dateStr)
        });
      }
    });
    return list.sort((a, b) => a.dateObj - b.dateObj);
  }, [monthRecords]);

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
      cells.push(<div key={`empty-${i}`} className="h-12 border border-[#EA580C]/5 bg-[#FCFBF7]/30" />);
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
          className={`h-14 sm:h-16 border border-[#EA580C]/5 p-1.5 flex flex-col justify-between text-left transition-all relative select-none hover:bg-[#FFF7ED] cursor-pointer ${
            isSelected 
              ? "bg-[#FFF7ED] text-[#EA580C] border-[#EA580C] font-bold ring-1 ring-[#EA580C]/30" 
              : isToday 
              ? "bg-[#FFF7ED]/45 text-[#EA580C] border-[#EA580C]/25" 
              : "bg-white text-text-primary"
          }`}
        >
          <div className="flex justify-between items-center w-full">
            <span className="text-[11px] font-semibold">{d}</span>
            <div className="flex gap-0.5">
              {isShubh && <span className="text-[7.5px] font-bold text-[#EA580C]" title="Shubh Din">卐</span>}
              {isSamayik && <span className="text-[7.5px] font-bold text-[#C28A3E]" title="Samayik">📖</span>}
            </div>
          </div>

          <div className="flex flex-col gap-0.5 w-full overflow-hidden">
            {record?.tithi && (
              <span className="text-[7px] sm:text-[8px] text-[#4B5563] truncate font-medium">
                {record.tithi.replace("Sud", "S").replace("Vad", "V")}
              </span>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              {hasFestival && <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] shrink-0" />}
              {hasFasting && <span className="w-1.5 h-1.5 rounded-full bg-[#C28A3E] shrink-0" />}
            </div>
          </div>
        </button>
      );
    }

    const totalCells = cells.length;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remaining; i++) {
      cells.push(<div key={`empty-end-${i}`} className="h-12 border border-[#EA580C]/5 bg-[#FCFBF7]/30" />);
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] sm:text-[10px] uppercase tracking-widest text-[#C28A3E] bg-[#FCFBF7] py-2.5 rounded border border-[#EA580C]/5">
          {dayLabels.map(lbl => <div key={lbl}>{lbl}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 border border-[#EA580C]/5 rounded-custom-lg bg-[#FCFBF7]/20 overflow-hidden">
          {cells}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#FCFBF7] pt-20 pb-16 flex flex-col items-center">
      
      {/* 1. PANCHANG HERO */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-8 text-center md:text-left flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[#EA580C]/10 pb-8">
        <div>
          <span className="px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#C28A3E]/20 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C28A3E] flex items-center gap-1.5 w-fit mx-auto md:mx-0 select-none">
            <Sparkles size={12} className="text-[#EA580C]" />
            {lang === "en" ? "🌸 Sacred Chaturmas Portal" : "🌸 पावन चातुर्मास पोर्टल"}
          </span>
          <h1 className="font-display font-bold text-text-primary text-3xl sm:text-4xl mt-3 leading-tight">
            {t.panchangTitle}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1.5 max-w-xl">
            {t.panchangSub || (lang === "en" ? "Auspicious Tithis, day calculations, and sunset intervals for daily tapas" : "दैनिक तप, सामायिक और मांगलिक कार्यों हेतु शुभ तिथियां एवं समय")}
          </p>
        </div>

        {/* Hero Quote Card */}
        <div className="w-full md:max-w-md bg-white border border-[#C28A3E]/10 p-4 rounded-custom-lg shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-center md:text-left">
          <span className="text-[9px] uppercase font-bold text-[#C28A3E] tracking-wider block mb-1">
            {l.spiritualQuote}
          </span>
          <p className="font-display italic text-[#EA580C] text-sm font-semibold">
            "{dailyQuote.text}"
          </p>
          <p className="text-[10px] text-text-secondary mt-1.5">
            — {dailyQuote.translation} ({dailyQuote.source})
          </p>
        </div>
      </section>

      {/* 2. TWO COLUMN LAYOUT */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Core Details, Quotes, and Festivals (col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Upcoming Days timeline */}
          <div className="w-full">
            <h3 className="font-display font-bold text-text-primary text-xs uppercase tracking-wider text-left mb-3 flex items-center gap-1.5">
              <span>🗓️</span> {l.upcomingDays}
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 w-full no-scrollbar scroll-smooth">
              {timelineDays.map(item => {
                const isSelected = item.dateStr === selectedDate;
                const record = monthRecords[item.dateStr];
                const hasFestival = record && (record.festival || record.event);
                
                return (
                  <button
                    key={item.dateStr}
                    onClick={() => handleDateClick(item.dateStr)}
                    className={`flex flex-col items-center justify-between p-3 rounded-custom-md border transition-all duration-150 shrink-0 select-none cursor-pointer w-[76px] h-[92px] ${
                      isSelected
                        ? "bg-[#EA580C] text-white border-transparent shadow-sm"
                        : "bg-white border-[#EA580C]/5 hover:border-[#C28A3E]/20 text-text-secondary"
                    }`}
                  >
                    <span className="text-[10px] font-semibold tracking-wider uppercase">
                      {item.dayLabel}
                    </span>
                    <span className="text-xl font-bold leading-none my-1">
                      {item.dateNum}
                    </span>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] leading-none uppercase font-semibold">
                        {item.monthLabel}
                      </span>
                      {hasFestival && (
                        <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[#EA580C]"} mt-0.5`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today's Panchang Featured Card */}
          {isLoading ? (
            <div className="w-full h-80 flex flex-col items-center justify-center gap-3 bg-white border border-[#EA580C]/5 rounded-custom-lg shadow-premium">
              <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-xs text-text-secondary">{t.recalculatingAlignments}</p>
            </div>
          ) : panchang ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-7 rounded-custom-lg bg-white border border-[#EA580C]/5 shadow-premium flex flex-col gap-6"
            >
              {/* Header inside Card */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-4 border-b border-[#EA580C]/5">
                <div>
                  <span className="text-[9.5px] uppercase font-bold tracking-widest text-[#C28A3E]">{t.tithiOfDay} ({selectedDate})</span>
                  <h2 className="font-display font-bold text-text-primary text-2xl sm:text-3xl mt-1 leading-snug">
                    {translateTithi(panchang.tithi)}
                  </h2>
                  {panchang.event && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF7ED] border border-[#EA580C]/10 text-xs font-bold text-[#EA580C]">
                      <Sparkles size={12} />
                      <span>{panchang.event}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 self-start">
                  <div className="bg-[#FCFBF7] border border-[#C28A3E]/10 p-2.5 rounded-custom-sm text-left">
                    <span className="text-[8px] uppercase tracking-wider text-[#C28A3E] font-bold block">{lang === "en" ? "Paksha" : "पक्ष"}</span>
                    <span className="text-xs font-semibold text-text-primary mt-0.5 block flex items-center gap-1">
                      <Moon size={12} className="text-[#EA580C]" />
                      {translatePaksha(panchang.paksha)}
                    </span>
                  </div>
                  <div className="bg-[#FCFBF7] border border-[#C28A3E]/10 p-2.5 rounded-custom-sm text-left">
                    <span className="text-[8px] uppercase tracking-wider text-[#C28A3E] font-bold block">{lang === "en" ? "Month" : "माह"}</span>
                    <span className="text-xs font-semibold text-text-primary mt-0.5 block flex items-center gap-1">
                      <CalendarIcon size={12} className="text-[#EA580C]" />
                      {translateMonth(panchang.month)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sun/Moon cycles grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-custom-md bg-[#FCFBF7] border border-[#EA580C]/5">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[#EA580C] shrink-0">
                    <Sun size={15} />
                  </div>
                  <div>
                    <span className="text-[9px] text-text-secondary uppercase tracking-wider block leading-none">{t.sunrise}</span>
                    <span className="font-semibold text-text-primary text-xs sm:text-sm mt-1 block">{panchang.sunrise || "--"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-custom-md bg-[#FCFBF7] border border-[#EA580C]/5">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                    <Moon size={15} />
                  </div>
                  <div>
                    <span className="text-[9px] text-text-secondary uppercase tracking-wider block leading-none">{t.sunset}</span>
                    <span className="font-semibold text-text-primary text-xs sm:text-sm mt-1 block">{panchang.sunset || "--"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-custom-md bg-[#FCFBF7] border border-[#EA580C]/5">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <Sparkles size={15} />
                  </div>
                  <div>
                    <span className="text-[9px] text-text-secondary uppercase tracking-wider block leading-none">{lang === "en" ? "Moon Sign" : "चन्द्र राशि"}</span>
                    <span className="font-semibold text-text-primary text-xs sm:text-sm mt-1 block truncate max-w-[80px]">{panchang.moonSign || l.none}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-custom-md bg-[#FCFBF7] border border-[#EA580C]/5">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#EA580C] shrink-0">
                    <Compass size={15} />
                  </div>
                  <div>
                    <span className="text-[9px] text-text-secondary uppercase tracking-wider block leading-none">{l.nakshatra}</span>
                    <span className="font-semibold text-text-primary text-xs sm:text-sm mt-1 block truncate max-w-[80px]">{panchang.nakshatra || l.none}</span>
                  </div>
                </div>
              </div>

              {/* Transit calculations grid */}
              <div className="p-4 rounded-custom-md bg-[#FCFBF7] border border-[#C28A3E]/10 grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col">
                  <span className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">{l.yoga}</span>
                  <span className="text-xs font-semibold text-[#1F2937] mt-1">{panchang.yoga || l.none}</span>
                </div>
                <div className="flex flex-col border-x border-[#C28A3E]/10">
                  <span className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">{l.karana}</span>
                  <span className="text-xs font-semibold text-[#1F2937] mt-1">{panchang.karana || l.none}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">{lang === "en" ? "Remarks" : "अन्य विवरण"}</span>
                  <span className="text-xs font-semibold text-[#1F2937] mt-1 truncate max-w-[120px]">{panchang.additionalRemarks || l.none}</span>
                </div>
              </div>

              {/* Fasting & Special Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="p-4 rounded-custom-md bg-white border border-[#C28A3E]/10 flex flex-col gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left">
                  <span className="text-[9.5px] uppercase font-bold text-emerald-700 tracking-wider flex items-center gap-1.5 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block" /> {l.fastingInfo}
                  </span>
                  <p className="text-xs text-text-primary leading-relaxed mt-1 font-medium">
                    {panchang.fastingInfo || (lang === "en" ? "No fasting guidelines recorded for this date." : "इस तिथि के लिए कोई विशेष तप निर्देश उपलब्ध नहीं हैं।")}
                  </p>
                </div>

                <div className="p-4 rounded-custom-md bg-white border border-[#C28A3E]/10 flex flex-col gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left">
                  <span className="text-[9.5px] uppercase font-bold text-[#EA580C] tracking-wider flex items-center gap-1.5 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] block" /> {l.specialNotes}
                  </span>
                  <p className="text-xs text-text-primary leading-relaxed mt-1 font-medium">
                    {panchang.specialNotes || (lang === "en" ? "Standard auspicious activities allowed." : "सामान्य शुभ कार्य स्वीकृत हैं।")}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="p-6 rounded-custom-lg bg-red-50 border border-red-200 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0" />
              <p className="text-sm text-red-600">
                {lang === "en" ? "Panchang details could not be parsed for this date." : "इस तिथि के लिए पंचांग विवरण की गणना नहीं की जा सकी।"}
              </p>
            </div>
          )}

          {/* Today's Pravachan Card */}
          {pravachans.length > 0 && (
            <div className="p-6 rounded-custom-lg bg-white border border-[#EA580C]/5 shadow-premium text-left flex flex-col gap-4">
              <h3 className="font-display font-bold text-text-primary text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-100">
                <BookOpenCheck size={15} className="text-[#EA580C]" />
                <span>{l.todayPravachan}</span>
              </h3>
              
              <div className="grid gap-3.5">
                {pravachans.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-custom-md bg-[#FCFBF7] border border-[#C28A3E]/10 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-[#1F2937] leading-snug">
                        {item.activity}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-text-secondary mt-1.5">
                        <span className="flex items-center gap-1"><Clock size={12} /> {item.time}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {cms.templeName || "Shree Labriya Mandir"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 select-none self-end sm:self-center">
                      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-50 border border-red-200 text-[10px] font-bold text-red-600 hover:bg-red-100 transition-colors">
                        <Video size={12} />
                        <span>LIVESTREAM</span>
                      </a>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#FFF7ED] border border-[#EA580C]/10 text-[10px] font-bold text-[#EA580C] hover:bg-[#EA580C]/10 transition-colors">
                        <FileText size={12} />
                        <span>NOTES</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Festivals this month */}
          {monthlyFestivals.length > 0 && (
            <div className="p-6 rounded-custom-lg bg-white border border-[#EA580C]/5 shadow-premium text-left flex flex-col gap-4">
              <h3 className="font-display font-bold text-text-primary text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-100">
                <Sparkles size={15} className="text-[#C28A3E]" />
                <span>{l.festivalsThisMonth}</span>
              </h3>

              <div className="grid gap-3">
                {monthlyFestivals.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleDateClick(item.dateStr)}
                    className="p-3.5 rounded-custom-md bg-[#FCFBF7] border border-[#C28A3E]/5 hover:border-[#EA580C]/20 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🪷</span>
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm text-text-primary">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-text-secondary mt-0.5">
                          {translateTithi(item.tithi)}
                        </p>
                      </div>
                    </div>
                    
                    <span className="text-[10px] font-bold text-[#C28A3E] bg-white border border-[#C28A3E]/10 px-2.5 py-1 rounded-custom-sm uppercase tracking-wider select-none shrink-0">
                      {item.dateObj.toLocaleDateString(lang === "en" ? "en-US" : "hi-IN", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Calendar Grid & Choghadiya intervals (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Calendar visual card */}
          <div className="p-5 sm:p-6 rounded-custom-lg border border-[#EA580C]/5 bg-white shadow-premium flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="font-display font-semibold text-text-primary text-sm uppercase tracking-wider flex items-center gap-1.5 select-none">
                  <span>📅</span> {l.calendarGrid}
                </h2>
                <p className="text-[10px] text-[#4B5563] mt-0.5 select-none">{l.selectDateTip}</p>
              </div>

              <div className="flex items-center gap-2 self-end">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded border border-[#EA580C]/5 bg-white hover:bg-neutral-50 text-[#EA580C] cursor-pointer"
                  title={l.prevMonth}
                >
                  <ChevronLeft size={16} />
                </button>
                
                <span className="text-xs font-bold text-[#1F2937] uppercase min-w-[125px] text-center select-none">
                  {new Date(calYear, calMonth - 1).toLocaleString(lang === "en" ? "en-US" : "hi-IN", { month: "long", year: "numeric" })}
                </span>

                <button 
                  onClick={handleNextMonth}
                  className="p-1.5 rounded border border-[#EA580C]/5 bg-white hover:bg-neutral-50 text-[#EA580C] cursor-pointer"
                  title={l.nextMonth}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {renderPublicCalendarGrid()}

            <div className="flex flex-wrap gap-4 text-[9.5px] text-text-secondary justify-end border-t border-neutral-100 pt-3 font-medium select-none">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EA580C] block" /> Festival / Event
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C28A3E] block" /> {lang === "en" ? "Fasting" : "तप / उपवास"}
              </span>
              <span className="flex items-center gap-1.5 text-text-primary font-bold">
                <span>卐</span> {lang === "en" ? "Shubh" : "शुभ दिन"}
              </span>
              <span className="flex items-center gap-1.5 text-text-primary font-bold">
                <span>📖</span> {lang === "en" ? "Samayik" : "सामायिक"}
              </span>
            </div>
          </div>

          {/* Timings card (Navkarshi, Porashi) */}
          {panchang && (
            <div className="p-5 rounded-custom-lg bg-white border border-[#EA580C]/5 shadow-premium flex flex-col gap-3.5 text-left">
              <h3 className="font-display font-bold text-text-primary text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-100">
                <BookOpen size={14} className="text-[#C28A3E]" />
                <span>{l.importantTimings}</span>
              </h3>
              <div className="p-4 rounded bg-[#FCFBF7] border border-[#C28A3E]/10 text-xs text-text-primary font-semibold whitespace-pre-line leading-relaxed shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
                {panchang.importantTimings || (lang === "en" ? "Standard timings based on local sunrise." : "सूर्योदय के आधार पर सामान्य समय।")}
              </div>
            </div>
          )}

          {/* Choghadiya Intervals */}
          {choghadiyaIntervals.length > 0 && (
            <div className="p-5 rounded-custom-lg bg-white border border-[#EA580C]/5 shadow-premium flex flex-col gap-4 text-left">
              
              <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                <div className="w-9 h-9 rounded-full bg-[#FFF7ED] flex items-center justify-center text-[#EA580C]">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-text-primary text-sm leading-none">{t.auspiciousTimings}</h3>
                  <p className="text-[9px] text-[#C28A3E] uppercase tracking-widest font-bold mt-1 leading-none">{t.choghadiyaIntervals}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
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
                      className="flex items-center justify-between p-3 rounded-custom-md bg-[#FCFBF7] border border-[#C28A3E]/10 hover:border-[#EA580C]/20 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary">
                          {translateChoghadiyaName(time.name)}
                        </span>
                        <span className="text-[9.5px] text-text-secondary mt-0.5">{time.time}</span>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusColor}`}>
                        {translateChoghadiyaStatus(time.status)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Panchang Notice Footnote */}
          <div className="p-4 rounded-custom-lg bg-[#FFF7ED]/35 border border-[#EA580C]/10 flex items-start gap-3 text-left">
            <Compass size={18} className="text-[#C28A3E] shrink-0 mt-0.5" />
            <p className="text-[9.5px] text-[#4B5563] leading-relaxed">
              {t.panchangFootnote || `All calculations are approximated based on standard local coordinates and coordinates of ${cms.templeName || "Shree Labriya Mandir"}. Devotees are requested to consult local experts for highly specific rites.`}
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

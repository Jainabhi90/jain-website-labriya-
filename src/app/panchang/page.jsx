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
  AlertCircle
} from "lucide-react";
import { db } from "@/services/db";

export default function Panchang() {
  const [selectedDate, setSelectedDate] = useState("");
  const [panchang, setPanchang] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set today's date default to "2026-07-11" which matches seed data
  useEffect(() => {
    const formattedDate = "2026-07-11";
    setSelectedDate(formattedDate);
    fetchPanchang(formattedDate);
  }, []);

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

  const handleDateChange = (e) => {
    const val = e.target.value;
    setSelectedDate(val);
    fetchPanchang(val);
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

    // Day of the week index (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = new Date(dateStr).getDay();

    const CHOGHADIYA_DAYS = [
      // 0: Sunday
      ["Udveg", "Chala", "Labh", "Amrit", "Kaal", "Shubh", "Roga", "Udveg"],
      // 1: Monday
      ["Amrit", "Kaal", "Shubh", "Roga", "Udveg", "Chala", "Labh", "Amrit"],
      // 2: Tuesday
      ["Roga", "Udveg", "Chala", "Labh", "Amrit", "Kaal", "Shubh", "Roga"],
      // 3: Wednesday
      ["Labh", "Amrit", "Kaal", "Shubh", "Roga", "Udveg", "Chala", "Labh"],
      // 4: Thursday
      ["Shubh", "Roga", "Udveg", "Chala", "Labh", "Amrit", "Kaal", "Shubh"],
      // 5: Friday
      ["Chala", "Labh", "Amrit", "Kaal", "Shubh", "Roga", "Udveg", "Chala"],
      // 6: Saturday
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center">
      
      {/* Header */}
      <div className="text-center max-w-2xl mb-12">
        <span className="px-3 py-1 rounded-full bg-secondary border border-primary/10 text-[10px] font-semibold uppercase tracking-widest text-primary flex items-center gap-1.5 w-fit mx-auto">
          <CalendarIcon size={12} />
          Spiritual Calendar
        </span>
        <h1 className="font-display font-semibold text-text-primary text-3xl sm:text-4xl mt-3">
          Jain Panchang & Choghadiya
        </h1>
        <p className="text-sm text-text-secondary mt-2">
          Daily lunar calculations, Tithis, and auspicious intervals of the day. Essential guide for vows, fasts (Tapas), and starting new activities during Chaturmas.
        </p>
      </div>

      {/* Date Picker Section */}
      <div className="w-full max-w-md bg-white border border-border-custom shadow-premium p-4 rounded-custom-lg mb-10 flex flex-col sm:flex-row items-center gap-4">
        <label htmlFor="panchang-date" className="text-xs text-text-secondary font-bold uppercase tracking-wider shrink-0">
          Select Date:
        </label>
        <input 
          id="panchang-date"
          type="date" 
          value={selectedDate}
          onChange={handleDateChange}
          className="w-full px-4 py-2.5 rounded-custom-md bg-bg-custom border border-border-custom focus:border-primary/50 focus:outline-none text-sm transition-all text-text-primary font-medium"
        />
      </div>

      {/* Panchang Content */}
      {isLoading ? (
        <div className="w-full max-w-5xl h-96 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-text-secondary">Recalculating alignments...</p>
        </div>
      ) : panchang ? (
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Main Details Card (Left 3 Columns) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Today's Tithi Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-custom-lg bg-white border border-border-custom shadow-premium relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex flex-col gap-5">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary">Tithi of the Day</span>
                  <h2 className="font-display font-semibold text-text-primary text-2xl sm:text-3xl mt-1 leading-snug">
                    {panchang.tithi}
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
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Paksha</span>
                    <span className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                      <Moon size={14} className="text-accent" />
                      {panchang.paksha}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Month</span>
                    <span className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                      <CalendarIcon size={14} className="text-accent" />
                      {panchang.month} Mah
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sun cycles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="p-6 rounded-custom-lg bg-white border border-border-custom shadow-premium flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                  <Sun size={20} />
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Sunrise</span>
                  <h4 className="font-display font-bold text-text-primary text-lg">{panchang.sunrise}</h4>
                </div>
              </div>

              <div className="p-6 rounded-custom-lg bg-white border border-border-custom shadow-premium flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <Moon size={20} />
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Sunset</span>
                  <h4 className="font-display font-bold text-text-primary text-lg">{panchang.sunset}</h4>
                </div>
              </div>

            </div>

            {/* Panchang Notice */}
            <div className="p-5 rounded-custom-lg bg-secondary/35 border border-border-custom flex items-start gap-3">
              <Compass size={18} className="text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary leading-relaxed">
                Panchang metrics are calculated based on Local Standard Time for Labriya coordinates. Under standard conditions, Choghadiya intervals shift by approximately 4 minutes per day. For special Pujas or Vrat rules, please cross-verify with Pujya Swamiji or the Temple office.
              </p>
            </div>

          </div>

          {/* Choghadiya Timings Card (Right 2 Columns) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-6 rounded-custom-lg bg-white border border-border-custom shadow-premium flex flex-col gap-6">
              
              <div className="flex items-center gap-3 pb-3 border-b border-border-custom">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-primary">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-text-primary text-base">Auspicious Timings</h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Choghadiya Intervals</p>
                </div>
              </div>

              <div className="flex flex-col gap-3.5">
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
                      className="flex items-center justify-between p-3.5 rounded-custom-md bg-bg-custom border border-border-custom"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-text-primary">{time.name}</span>
                        <span className="text-[10px] text-text-secondary mt-0.5">{time.time}</span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${statusColor}`}>
                        {time.status}
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
          <p className="text-sm text-red-600">Panchang details could not be parsed for this date.</p>
        </div>
      )}

    </div>
  );
}

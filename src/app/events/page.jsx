"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Sparkles, 
  Bell, 
  CheckCircle,
  AlertCircle
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

  useEffect(() => {
    const fetchEvents = async () => {
      const list = await db.getEvents();
      setEvents(list);
      if (list.length > 0) {
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
    const description = event.description;
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
    const description = encodeURIComponent(event.description);
    const location = encodeURIComponent(event.location);
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours duration

    const formatGCalDate = (date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGCalDate(startDate)}/${formatGCalDate(endDate)}&details=${description}&location=${location}`;
  };

  const translateEventTitle = (title) => {
    if (lang === "en") return title;
    if (title.includes("Mahavir Janma Kalyanak")) return "वार्षिक महावीर जन्म कल्याणक पूजा विधान";
    if (title.includes("Paryushan Parva")) return "पर्युषण पर्व ८-दिवसीय महापर्व आराधना";
    return title;
  };

  const translateEventDescription = (desc) => {
    if (lang === "en") return desc;
    if (desc.includes("Lord Mahavira")) return "प्रभु महावीर जन्म कल्याणक के शुभ अवसर पर १४ स्वप्न दर्शन और १८-अभिषेक महापूजन का भव्य आयोजन किया जाएगा।";
    if (desc.includes("Paryushan")) return "आत्म-शुद्धि, त्याग-तपस्या और क्षमापना का महापर्व। दैनिक कल्पसूत्र वाचन, व्याख्यान सभा और सांवत्सरिक प्रतिक्रमण आराधना।";
    return desc;
  };

  const translateEventLocation = (loc) => {
    if (lang === "en") return loc;
    if (loc.includes("Main Assembly")) return "मुख्य सभागार, श्री लाबरिया मंदिर";
    if (loc.includes("Sanskriti Hall")) return "संस्कृति भवन एवं मुख्य प्रवचन पंडाल";
    return loc;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center">
      
      {/* Header */}
      <div className="text-center max-w-2xl mb-16">
        <span className="px-3 py-1 rounded-full bg-secondary border border-primary/10 text-[10px] font-semibold uppercase tracking-widest text-primary flex items-center gap-1 w-fit mx-auto">
          <Sparkles size={12} />
          {t.utsavPrograms}
        </span>
        <h1 className="font-display font-semibold text-text-primary text-3xl sm:text-4xl mt-3">
          {t.upcomingEvents}
        </h1>
        <p className="text-sm text-text-secondary mt-2">
          {t.eventsSub}
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl">
        
        {/* Events List */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => setSelectedEvent(event)}
                className={`p-6 rounded-custom-lg border transition-all duration-300 cursor-pointer flex flex-col gap-5 items-start ${
                  selectedEvent?.id === event.id 
                    ? "bg-white border-primary shadow-premium-hover" 
                    : "bg-white/50 border-border-custom hover:border-primary/20 shadow-premium"
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-6 items-start w-full">
                  {/* Simulated Thumbnail */}
                  <div className="w-full sm:w-32 h-24 rounded-custom-md overflow-hidden shrink-0 border border-border-custom bg-secondary relative">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold text-2xl">🪷</div>
                    )}
                    {/* Floating Date Badge */}
                    <div className="absolute top-2 left-2 bg-primary text-white text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-custom-sm">
                      {new Date(event.date).toLocaleDateString(lang === "en" ? "en-US" : "hi-IN", { month: "short", day: "numeric" })}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-3 h-full w-full">
                    <div>
                      <h3 className="font-display font-semibold text-text-primary text-base sm:text-lg mb-1 leading-snug">
                        {translateEventTitle(event.title)}
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                        {translateEventDescription(event.description)}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-text-secondary font-medium mt-1">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon size={14} className="text-primary" />
                        <span>
                          {new Date(event.date).toLocaleDateString(lang === "en" ? "en-US" : "hi-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-primary" />
                        <span>{translateEventLocation(event.location)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add to Calendar Section */}
                <div className="flex items-center gap-3 mt-1 pt-3 border-t border-border-custom w-full">
                  <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                    {t.addToCalendar}:
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadICSFile(event);
                    }}
                    className="px-3 py-1 rounded bg-secondary hover:bg-primary/10 text-primary border border-primary/10 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    .ICS File
                  </button>

                  <a
                    href={getGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1 rounded bg-secondary hover:bg-primary/10 text-primary border border-primary/10 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Google Calendar
                  </a>
                </div>

              </motion.div>
            ))}
          </div>

          {/* Premium Coming Soon Card */}
          <div className="p-8 rounded-custom-lg bg-secondary/30 border border-dashed border-border-custom flex flex-col items-center text-center gap-4">
            <span className="text-2xl">🗓️</span>
            <div>
              <h4 className="font-display font-semibold text-text-primary text-base mb-1">{t.moreProgramsSoon}</h4>
              <p className="text-xs text-text-secondary max-w-md leading-relaxed">
                {t.moreProgramsSoonDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Waitlist Subscription Panel */}
        <div className="w-full">
          <div className="sticky top-24 p-6 sm:p-8 rounded-custom-lg bg-white border border-border-custom shadow-premium flex flex-col gap-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border-custom">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base">{t.bookingWaitlist}</h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">{t.notifyMe}</p>
              </div>
            </div>

            {selectedEvent ? (
              <div className="flex flex-col gap-4">
                {(cms.registrationClosed || cms.registrationOpen === false) ? (
                  <div className="p-4 rounded-custom-md bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center mt-2">
                    ⚠️ {lang === "en" ? "Registration is currently closed by temple administration." : "पंजीकरण वर्तमान में मंदिर प्रशासन द्वारा बंद है।"}
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {lang === "en" ? (
                        <>
                          Join the VIP notification circle for <strong className="text-text-primary">{translateEventTitle(selectedEvent.title)}</strong>. We will alert you via SMS/WhatsApp as soon as seating registrations, passes, and dharamshala allocations open.
                        </>
                      ) : (
                        <>
                          <strong className="text-text-primary">{translateEventTitle(selectedEvent.title)}</strong> के लिए विशेष सूचना समूह में शामिल हों। सीट बुकिंग, दर्शन पास, और धर्मशाला आवंटन शुरू होते ही हम आपको व्हाट्सएप/एसएमएस पर सूचित करेंगे।
                        </>
                      )}
                    </p>

                    <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="sub-name" className="text-xs text-text-secondary font-semibold">{t.yourName}</label>
                        <input 
                          id="sub-name"
                          type="text" 
                          placeholder={lang === "en" ? "e.g. Rahul Shah" : "जैसे: राहुल शाह"}
                          value={subName}
                          onChange={(e) => setSubName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-custom-md bg-bg-custom border border-border-custom focus:border-primary/50 focus:outline-none text-sm transition-all text-text-primary"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="sub-phone" className="text-xs text-text-secondary font-semibold">{t.phoneLabel}</label>
                        <input 
                          id="sub-phone"
                          type="tel" 
                          maxLength={10}
                          placeholder={lang === "en" ? "e.g. 9876543210" : "जैसे: 9876543210"}
                          value={subPhone}
                          onChange={(e) => setSubPhone(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-4 py-2.5 rounded-custom-md bg-bg-custom border border-border-custom focus:border-primary/50 focus:outline-none text-sm transition-all text-text-primary"
                        />
                      </div>

                      {validationError && (
                        <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1">
                          <AlertCircle size={14} />
                          <span>{validationError}</span>
                        </div>
                      )}

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-custom-md bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider shadow-premium hover:shadow-premium-hover transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
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
              <div className="text-sm text-text-secondary italic text-center py-6">{t.selectEventToNotify}</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

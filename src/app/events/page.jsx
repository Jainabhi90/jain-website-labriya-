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

export default function Events() {
  const [events, setEvents] = useState([]);
  const [subName, setSubName] = useState("");
  const [subPhone, setSubPhone] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      const list = await db.getEvents();
      setEvents(list);
      if (list.length > 0) {
        setSelectedEvent(list[0]);
      }
    };
    fetchEvents();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subName.trim() || !subPhone.trim()) {
      setValidationError("Please fill in all fields.");
      return;
    }
    if (subPhone.length < 10) {
      setValidationError("Please enter a valid phone number.");
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
      setValidationError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center">
      
      {/* Header */}
      <div className="text-center max-w-2xl mb-16">
        <span className="px-3 py-1 rounded-full bg-secondary border border-primary/10 text-[10px] font-semibold uppercase tracking-widest text-primary flex items-center gap-1 w-fit mx-auto">
          <Sparkles size={12} />
          Utsav & Programs
        </span>
        <h1 className="font-display font-semibold text-text-primary text-3xl sm:text-4xl mt-3">
          Upcoming Events
        </h1>
        <p className="text-sm text-text-secondary mt-2">
          Special festivals, discourses, and worship schedules planned for the Chaturmas 2026 tenure. Register early for seating and accommodation.
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
                className={`p-6 rounded-custom-lg border transition-all duration-300 cursor-pointer flex flex-col sm:flex-row gap-6 items-start ${
                  selectedEvent?.id === event.id 
                    ? "bg-white border-primary shadow-premium-hover" 
                    : "bg-white/50 border-border-custom hover:border-primary/20 shadow-premium"
                }`}
              >
                {/* Simulated Thumbnail */}
                <div className="w-full sm:w-32 h-24 rounded-custom-md overflow-hidden shrink-0 border border-border-custom bg-secondary relative">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-bold text-2xl">🪷</div>
                  )}
                  {/* Floating Date Badge */}
                  <div className="absolute top-2 left-2 bg-primary text-white text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-custom-sm">
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-3 h-full">
                  <div>
                    <h3 className="font-display font-semibold text-text-primary text-base sm:text-lg mb-1 leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-text-secondary font-medium mt-1">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon size={14} className="text-primary" />
                      <span>
                        {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-primary" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Premium Coming Soon Card */}
          <div className="p-8 rounded-custom-lg bg-secondary/30 border border-dashed border-border-custom flex flex-col items-center text-center gap-4">
            <span className="text-2xl">🗓️</span>
            <div>
              <h4 className="font-display font-semibold text-text-primary text-base mb-1">More Programs Commencing Soon</h4>
              <p className="text-xs text-text-secondary max-w-md leading-relaxed">
                The Temple Committee is finalising dates for the grand Chaturmas Samvatsari, Diwali Snartra Puja, and Guru Vandana Varghoda. Ensure you subscribe below to receive real-time notifications.
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
                <h3 className="font-display font-semibold text-text-primary text-base">Booking Waitlist</h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Notify Me</p>
              </div>
            </div>

            {selectedEvent ? (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-text-secondary leading-relaxed">
                  Join the VIP notification circle for <strong className="text-text-primary">{selectedEvent.title}</strong>. We will alert you via SMS/WhatsApp as soon as seating registrations, passes, and dharamshala allocations open.
                </p>

                <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="sub-name" className="text-xs text-text-secondary font-semibold">Your Name</label>
                    <input 
                      id="sub-name"
                      type="text" 
                      placeholder="e.g. Rahul Shah"
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-custom-md bg-bg-custom border border-border-custom focus:border-primary/50 focus:outline-none text-sm transition-all text-text-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="sub-phone" className="text-xs text-text-secondary font-semibold">Phone Number</label>
                    <input 
                      id="sub-phone"
                      type="tel" 
                      maxLength={10}
                      placeholder="e.g. 9876543210"
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
                    {isSubmitting ? "Subscribing..." : "Notify Me"}
                  </motion.button>
                </form>

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
                        <p>Subscription Successful!</p>
                        <p className="text-[10px] text-emerald-600/80 mt-0.5">You will receive an alert as soon as bookings go live.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            ) : (
              <div className="text-sm text-text-secondary italic text-center py-6">Select an event to subscribe.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

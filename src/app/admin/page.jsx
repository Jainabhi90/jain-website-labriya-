"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  LogOut
} from "lucide-react";
import { db } from "@/services/db";

export default function Admin() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("schedules");
  const [isLoading, setIsLoading] = useState(true);

  // States for each section
  const [schedules, setSchedules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [donations, setDonations] = useState([]);

  // Form states for adding items
  const [newAnn, setNewAnn] = useState({ title: "", content: "", type: "program", active: true });
  const [newEvent, setNewEvent] = useState({ title: "", description: "", date: "", location: "", imageUrl: "" });
  const [panchangDate, setPanchangDate] = useState("2026-07-11");
  const [panchangVal, setPanchangVal] = useState({ tithi: "", festival: "", month: "", paksha: "", sunrise: "", sunset: "" });

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = db.getCurrentUser();
      if (!currentUser || currentUser.role !== "admin") {
        router.push("/login");
        return;
      }
      setAdmin(currentUser);
      refreshData();
    };
    checkAuth();
  }, [router]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const schedData = await db.getSchedules();
      setSchedules(schedData);

      const annData = await db.getAnnouncements();
      setAnnouncements(annData);

      const eventsData = await db.getEvents();
      setEvents(eventsData);

      const donationsData = await db.getDonations();
      setDonations(donationsData);

      const panchangData = await db.getPanchang(panchangDate);
      setPanchangVal({
        tithi: panchangData.tithi,
        festival: panchangData.festival || "",
        month: panchangData.month,
        paksha: panchangData.paksha,
        sunrise: panchangData.sunrise,
        sunset: panchangData.sunset
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      const fetchPanchangForDate = async () => {
        const data = await db.getPanchang(panchangDate);
        setPanchangVal({
          tithi: data.tithi,
          festival: data.festival || "",
          month: data.month,
          paksha: data.paksha,
          sunrise: data.sunrise,
          sunset: data.sunset
        });
      };
      fetchPanchangForDate();
    }
  }, [panchangDate, admin]);

  const handleLogout = () => {
    db.logout();
    window.dispatchEvent(new Event("authChange"));
    router.push("/");
  };

  // Schedule Update handler
  const handleScheduleUpdate = async (id, field, value) => {
    try {
      const item = schedules.find(s => s.id === id);
      const updates = { [field]: value };
      const updated = await db.updateSchedule(id, updates);
      setSchedules(prev => prev.map(s => s.id === id ? updated : s));
    } catch (err) {
      console.error(err);
    }
  };

  // Announcement creators
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnn.title || !newAnn.content) return;
    try {
      const added = await db.createAnnouncement(newAnn);
      setAnnouncements(prev => [added, ...prev]);
      setNewAnn({ title: "", content: "", type: "program", active: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      const success = await db.deleteAnnouncement(id);
      if (success) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Panchang updates
  const handleSavePanchang = async () => {
    try {
      await db.updatePanchang(panchangDate, panchangVal);
      alert("Panchang updated successfully for " + panchangDate);
    } catch (err) {
      console.error(err);
    }
  };

  // Event creators
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    try {
      const added = await db.addEvent(newEvent);
      setEvents(prev => [...prev, added]);
      setNewEvent({ title: "", description: "", date: "", location: "", imageUrl: "" });
    } catch (err) {
      console.error(err);
    }
  };

  // Donation approvals
  const handleApproveDonation = async (id) => {
    try {
      const updated = await db.verifyDonation(id, true);
      setDonations(prev => prev.map(d => d.id === id ? updated : d));
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !admin) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-text-secondary">Authenticating secure panel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
      
      {/* Banner */}
      <div className="w-full bg-white border border-border-custom shadow-premium p-6 rounded-custom-lg mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-primary border border-primary/20">
            <User size={20} />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-widest font-bold text-primary">Secure Access</span>
            <h1 className="font-display font-semibold text-text-primary text-lg">Temple Administration Console</h1>
            <p className="text-[10px] text-text-secondary">Manage daily updates, announcements, calendar entries, and verify audits.</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="px-4 py-2 rounded-custom-md bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          <span>Exit Panel</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Sidebar Tabs */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-thin">
          {[
            { id: "schedules", label: "Worship Timetable", icon: Clock },
            { id: "announcements", label: "Notices & Announcements", icon: Megaphone },
            { id: "panchang", label: "Panchang Calendar", icon: CalendarIcon },
            { id: "events", label: "Event Organizer", icon: CalendarDays },
            { id: "donations", label: "Donation Audit Desk", icon: Heart },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-custom-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap lg:w-full text-left ${
                  isTabActive 
                    ? "bg-primary text-white shadow-premium" 
                    : "bg-white border border-border-custom text-text-secondary hover:text-text-primary hover:border-primary/20"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab Workspace Content */}
        <div className="lg:col-span-9 bg-white border border-border-custom shadow-premium p-6 sm:p-8 rounded-custom-lg min-h-[480px]">
          
          {/* TAB 1: SCHEDULES MANAGEMENT */}
          {activeTab === "schedules" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base">Worship Timetable Management</h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Edit Morning/Evening Activities</p>
              </div>

              <div className="flex flex-col gap-4">
                {schedules.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-custom-md bg-bg-custom border border-border-custom">
                    
                    <div className="w-full sm:w-28 shrink-0">
                      <input 
                        type="text" 
                        value={item.time} 
                        onChange={(e) => handleScheduleUpdate(item.id, "time", e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-white border border-border-custom text-xs font-semibold text-primary focus:outline-none"
                      />
                    </div>
                    
                    <div className="w-full">
                      <input 
                        type="text" 
                        value={item.activity} 
                        onChange={(e) => handleScheduleUpdate(item.id, "activity", e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-white border border-border-custom text-xs font-medium text-text-primary focus:outline-none"
                      />
                    </div>

                    <div className="w-full sm:w-28 shrink-0">
                      <select 
                        value={item.session} 
                        onChange={(e) => handleScheduleUpdate(item.id, "session", e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-white border border-border-custom text-xs font-semibold text-text-secondary focus:outline-none cursor-pointer"
                      >
                        <option value="morning">Morning</option>
                        <option value="evening">Evening</option>
                      </select>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ANNOUNCEMENTS */}
          {activeTab === "announcements" && (
            <div className="flex flex-col gap-8">
              
              {/* Add form */}
              <form onSubmit={handleAddAnnouncement} className="p-5 rounded-custom-lg bg-bg-custom border border-border-custom flex flex-col gap-4">
                <h4 className="font-display font-semibold text-text-primary text-sm">Write New Announcement Notice</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-text-secondary uppercase font-bold">Notice Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Varghoda Routings"
                      value={newAnn.title}
                      onChange={(e) => setNewAnn(prev => ({ ...prev, title: e.target.value }))}
                      className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-text-secondary uppercase font-bold">Notice Type Tag</label>
                    <select 
                      value={newAnn.type}
                      onChange={(e) => setNewAnn(prev => ({ ...prev, type: e.target.value }))}
                      className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-secondary font-semibold cursor-pointer"
                    >
                      <option value="program">Program Utsav</option>
                      <option value="update">Operational Update</option>
                      <option value="notice">Public Trust Notice</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-secondary uppercase font-bold">Notice Body Details</label>
                  <textarea 
                    rows={3}
                    placeholder="Enter the notification announcement content..."
                    value={newAnn.content}
                    onChange={(e) => setNewAnn(prev => ({ ...prev, content: e.target.value }))}
                    className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="px-4 py-2 rounded bg-primary text-white text-xs font-bold uppercase tracking-wider shadow hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 w-fit cursor-pointer ml-auto"
                >
                  <Plus size={14} />
                  <span>Publish Notice</span>
                </button>
              </form>

              {/* Announcements list */}
              <div className="flex flex-col gap-4">
                <h4 className="font-display font-semibold text-text-primary text-sm">Active Published Announcements</h4>
                
                <div className="flex flex-col gap-3">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="flex items-center justify-between p-4 rounded-custom-md bg-bg-custom border border-border-custom gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-text-primary">{ann.title}</span>
                          <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-secondary text-primary font-bold border border-primary/5">{ann.type}</span>
                        </div>
                        <p className="text-[10px] text-text-secondary mt-1">{ann.content}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer shrink-0"
                        title="Delete announcement"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: PANCHANG UPDATES */}
          {activeTab === "panchang" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base">Panchang Metrics Manager</h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Customize daily auspicious coordinates</p>
              </div>

              <div className="p-5 rounded-custom-lg bg-bg-custom border border-border-custom flex flex-col gap-4">
                
                <div className="flex flex-col gap-1.5 max-w-xs">
                  <label className="text-[10px] text-text-secondary uppercase font-bold">Edit Target Date</label>
                  <input 
                    type="date" 
                    value={panchangDate}
                    onChange={(e) => setPanchangDate(e.target.value)}
                    className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-text-secondary uppercase font-bold">Tithi of the day</label>
                    <input 
                      type="text" 
                      value={panchangVal.tithi}
                      onChange={(e) => setPanchangVal(prev => ({ ...prev, tithi: e.target.value }))}
                      className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none text-text-primary font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-text-secondary uppercase font-bold">Festival Info (Optional)</label>
                    <input 
                      type="text" 
                      value={panchangVal.festival}
                      onChange={(e) => setPanchangVal(prev => ({ ...prev, festival: e.target.value }))}
                      className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none text-text-primary font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-text-secondary uppercase font-bold">Jain Month</label>
                    <input 
                      type="text" 
                      value={panchangVal.month}
                      onChange={(e) => setPanchangVal(prev => ({ ...prev, month: e.target.value }))}
                      className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none text-text-primary font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-text-secondary uppercase font-bold">Paksha (Lunar phase)</label>
                    <input 
                      type="text" 
                      value={panchangVal.paksha}
                      onChange={(e) => setPanchangVal(prev => ({ ...prev, paksha: e.target.value }))}
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
                </div>

                <button 
                  onClick={handleSavePanchang}
                  className="px-4 py-2 rounded bg-primary text-white text-xs font-bold uppercase tracking-wider shadow hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 w-fit cursor-pointer ml-auto mt-2"
                >
                  <Save size={14} />
                  <span>Save Panchang</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 4: EVENTS ORGANIZER */}
          {activeTab === "events" && (
            <div className="flex flex-col gap-8">
              
              {/* Add event form */}
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
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-text-secondary uppercase font-bold">Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                      className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-secondary font-semibold"
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
                    <label className="text-[10px] text-text-secondary uppercase font-bold">Image URL (Scenic/Stock)</label>
                    <input 
                      type="text" 
                      placeholder="https://images.unsplash.com..."
                      value={newEvent.imageUrl}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-secondary uppercase font-bold">Event Description</label>
                  <textarea 
                    rows={2}
                    placeholder="Enter short details explaining the program schedule..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    className="px-3 py-2 text-xs rounded bg-white border border-border-custom focus:outline-none focus:border-primary/50 text-text-primary font-medium resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="px-4 py-2 rounded bg-primary text-white text-xs font-bold uppercase tracking-wider shadow hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 w-fit cursor-pointer ml-auto"
                >
                  <Plus size={14} />
                  <span>Create Event</span>
                </button>
              </form>

              {/* Event Listings */}
              <div className="flex flex-col gap-4">
                <h4 className="font-display font-semibold text-text-primary text-sm">Currently Active Events</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {events.map((ev) => (
                    <div key={ev.id} className="p-4 rounded-custom-md bg-bg-custom border border-border-custom flex flex-col gap-2">
                      <h5 className="font-semibold text-text-primary text-xs truncate">{ev.title}</h5>
                      <span className="text-[9px] text-primary font-bold uppercase tracking-wider">{new Date(ev.date).toLocaleDateString()}</span>
                      <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed">{ev.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: DONATIONS AUDIT */}
          {activeTab === "donations" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-display font-semibold text-text-primary text-base">Donation Verification Audit Desk</h3>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Verify and clear devotee transaction receipts</p>
              </div>

              <div className="flex flex-col gap-4">
                {donations.length > 0 ? (
                  donations.map((d) => (
                    <div key={d.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-custom-md bg-bg-custom border border-border-custom gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary">INR {d.amount.toLocaleString("en-IN")}.00</span>
                          <span className="text-[10px] text-text-secondary font-medium">&bull; From {d.donorName} (+91 {d.phone})</span>
                        </div>
                        <p className="text-[9px] text-text-secondary mt-1 font-mono uppercase">Txn ID: {d.txnId} &bull; Received {new Date(d.createdAt).toLocaleDateString()}</p>
                      </div>

                      {d.verified ? (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-500/10 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Check size={12} />
                          <span>Cleared</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApproveDonation(d.id)}
                          className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider shadow transition-colors cursor-pointer w-full sm:w-auto flex items-center justify-center gap-1"
                        >
                          <Check size={12} />
                          <span>Approve & Exemp</span>
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border border-dashed border-border-custom rounded-custom-md">
                    <span className="text-xl">💰</span>
                    <p className="text-xs text-text-secondary font-semibold mt-2">No reported donations require clearing.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

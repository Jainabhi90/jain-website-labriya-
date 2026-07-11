import { createClient } from "@supabase/supabase-js";

// Initialize Supabase if environment variables are provided
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// SEED DATA FOR LOCAL STORAGE FALLBACK
// ==========================================

const DEFAULT_SCHEDULE = [
  { id: "s1", time: "06:30 AM", activity: "Dev Darshan & Pakshal Puja", session: "morning", orderNum: 1 },
  { id: "s2", time: "08:00 AM", activity: "Pravachan by Pujya Gurudev", session: "morning", orderNum: 2 },
  { id: "s3", time: "10:00 AM", activity: "Swadhyay & Tattvachintan", session: "morning", orderNum: 3 },
  { id: "s4", time: "07:00 PM", activity: "Bhakti Sangeet & Shraman Pravachan", session: "evening", orderNum: 4 },
  { id: "s5", time: "08:00 PM", activity: "Aarti & Mangal Divo", session: "evening", orderNum: 5 },
];

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: "a1",
    title: "Chaturmas 2026 Pravesh Mahotsav",
    content: "The grand entry and welcoming festival of our revered Guruji will be held on July 25th, 2026. All devotees are cordially invited to participate in the Varghoda and Guru Vandana.",
    type: "program",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "a2",
    title: "Pratishtha Varshgandh Notice",
    content: "Special snatra puja on the auspicious occasion of the temple's 25th anniversary will start at 9:00 AM. Please register families for the Kalash Puja.",
    type: "update",
    active: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "a3",
    title: "Dharmashala Accommodation Booking Open",
    content: "Due to high demand during the Chaturmas festival, devotees traveling from other cities are requested to pre-book their rooms online or contact the office.",
    type: "notice",
    active: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const DEFAULT_PANCHANG = {
  "2026-07-11": {
    dateStr: "2026-07-11",
    tithi: "Ashadh Krishna Dwadashi (12th)",
    sunrise: "05:48 AM",
    sunset: "07:12 PM",
    paksha: "Krishna Paksha",
    month: "Ashadh",
    festival: "Pradosh Vrat & Shravan Prep",
    auspiciousTimings: [
      { name: "Amrit Choghadiya", time: "05:48 AM - 07:28 AM", status: "Auspicious" },
      { name: "Shubh Choghadiya", time: "09:08 AM - 10:48 AM", status: "Auspicious" },
      { name: "Rahu Kaal (Avoid)", time: "09:08 AM - 10:48 AM", status: "Inauspicious" },
      { name: "Char Choghadiya", time: "02:08 PM - 03:48 PM", status: "Normal" },
    ],
  },
  "default": {
    dateStr: "Today",
    tithi: "Shrawan Shukla Ekadashi (11th)",
    sunrise: "05:52 AM",
    sunset: "07:09 PM",
    paksha: "Shukla Paksha",
    month: "Shrawan",
    festival: "Chaturmas Swadhyay Utsav",
    auspiciousTimings: [
      { name: "Amrit Choghadiya", time: "06:00 AM - 07:30 AM", status: "Auspicious" },
      { name: "Shubh Choghadiya", time: "09:00 AM - 10:30 AM", status: "Auspicious" },
      { name: "Rahu Kaal (Avoid)", time: "04:30 PM - 06:00 PM", status: "Inauspicious" },
      { name: "Labh Choghadiya", time: "12:00 PM - 01:30 PM", status: "Auspicious" },
    ]
  }
};

const DEFAULT_EVENTS = [
  {
    id: "e1",
    title: "Varshik Mahavir Janma Kalyanak Puja",
    description: "A grand 18-abhishek worship dedicated to Lord Mahavira, detailing stories from Trishala Mata's 14 dreams.",
    date: "2026-08-15T09:00:00Z",
    location: "Main Assembly Hall, Labriya Mandir",
    imageUrl: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "e2",
    title: "Paryushan Parva 8-Day Mahotsav",
    description: "The most sacred days of reflection, forgiveness, and fasting. Featuring daily pravachans, Kalpasutra path, and ending with Kshamapana (Samvatsari).",
    date: "2026-09-08T06:00:00Z",
    location: "Sanskriti Hall & Pravachan Pandal",
    imageUrl: "https://images.unsplash.com/photo-1609137144814-0e31189c445a?q=80&w=1000&auto=format&fit=crop",
  }
];

// Helper to initialize local storage data
function getLocalItem(key, defaultValue) {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (e) {
    console.error("Local storage error reading " + key, e);
    return defaultValue;
  }
}

function setLocalItem(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Local storage error writing " + key, e);
  }
}

// ==========================================
// DATABASE INTERFACE IMPLEMENTATION
// ==========================================

export const db = {
  // --- Schedules ---
  async getSchedules() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .order("order_num", { ascending: true });
      if (!error && data) {
        return data.map(item => ({
          id: item.id,
          time: item.time,
          activity: item.activity,
          session: item.session,
          orderNum: item.order_num
        }));
      }
      console.warn("Supabase schedules error, falling back to local storage:", error);
    }
    return getLocalItem("temp_schedules", DEFAULT_SCHEDULE)
      .sort((a, b) => a.orderNum - b.orderNum);
  },

  async updateSchedule(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const dbUpdates = {};
      if (updates.time !== undefined) dbUpdates.time = updates.time;
      if (updates.activity !== undefined) dbUpdates.activity = updates.activity;
      if (updates.session !== undefined) dbUpdates.session = updates.session;
      if (updates.orderNum !== undefined) dbUpdates.order_num = updates.orderNum;

      const { data, error } = await supabase
        .from("schedules")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        return {
          id: data.id,
          time: data.time,
          activity: data.activity,
          session: data.session,
          orderNum: data.order_num
        };
      }
      console.error("Supabase update error:", error);
    }

    const items = getLocalItem("temp_schedules", DEFAULT_SCHEDULE);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error("Schedule item not found");
    
    items[index] = { ...items[index], ...updates };
    setLocalItem("temp_schedules", items);
    return items[index];
  },

  // --- Announcements ---
  async getAnnouncements() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map(item => ({
          id: item.id,
          title: item.title,
          content: item.content,
          type: item.type,
          active: item.active,
          createdAt: item.created_at
        }));
      }
    }
    return getLocalItem("temp_announcements", DEFAULT_ANNOUNCEMENTS)
      .filter(a => a.active)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createAnnouncement(announcement) {
    const newAnn = {
      ...announcement,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("announcements")
        .insert({
          title: announcement.title,
          content: announcement.content,
          type: announcement.type,
          active: announcement.active
        })
        .select()
        .single();
      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          content: data.content,
          type: data.type,
          active: data.active,
          createdAt: data.created_at
        };
      }
    }

    const items = getLocalItem("temp_announcements", DEFAULT_ANNOUNCEMENTS);
    items.unshift(newAnn);
    setLocalItem("temp_announcements", items);
    return newAnn;
  },

  async deleteAnnouncement(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("announcements")
        .update({ active: false })
        .eq("id", id);
      if (!error) return true;
    }

    const items = getLocalItem("temp_announcements", DEFAULT_ANNOUNCEMENTS);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index].active = false;
      setLocalItem("temp_announcements", items);
      return true;
    }
    return false;
  },

  // --- Panchang ---
  async getPanchang(dateStr) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("panchang")
        .select("*")
        .eq("date_str", dateStr)
        .single();
      if (!error && data) {
        return {
          dateStr: data.date_str,
          tithi: data.tithi,
          sunrise: data.sunrise,
          sunset: data.sunset,
          paksha: data.paksha,
          month: data.month,
          festival: data.festival,
          auspiciousTimings: data.auspicious_timings
        };
      }
    }

    const records = getLocalItem("temp_panchang", DEFAULT_PANCHANG);
    return records[dateStr] || {
      ...records["default"],
      dateStr: dateStr
    };
  },

  async updatePanchang(dateStr, updates) {
    const current = await this.getPanchang(dateStr);
    const updated = { ...current, ...updates, dateStr };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("panchang")
        .upsert({
          date_str: dateStr,
          tithi: updated.tithi,
          sunrise: updated.sunrise,
          sunset: updated.sunset,
          paksha: updated.paksha,
          month: updated.month,
          festival: updated.festival,
          auspicious_timings: updated.auspiciousTimings
        });
      if (!error) return updated;
    }

    const records = getLocalItem("temp_panchang", DEFAULT_PANCHANG);
    records[dateStr] = updated;
    setLocalItem("temp_panchang", records);
    return updated;
  },

  // --- Events ---
  async getEvents() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });
      if (!error && data) {
        return data;
      }
    }
    return getLocalItem("temp_events", DEFAULT_EVENTS)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  async addEvent(event) {
    const newEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("events")
        .insert(event)
        .select()
        .single();
      if (!error && data) return data;
    }

    const items = getLocalItem("temp_events", DEFAULT_EVENTS);
    items.push(newEvent);
    setLocalItem("temp_events", items);
    return newEvent;
  },

  async subscribeWaitlist(name, phone, eventTitle) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("subscriptions")
        .insert({ name, phone, event_title: eventTitle });
      if (!error) return true;
    }
    
    const list = getLocalItem("temp_subscriptions", []);
    list.push({ name, phone, eventTitle, date: new Date().toISOString() });
    setLocalItem("temp_subscriptions", list);
    return true;
  },

  // --- Donations ---
  async getDonations() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map(d => ({
          id: d.id,
          donorName: d.donor_name,
          phone: d.phone,
          amount: d.amount,
          txnId: d.txn_id,
          verified: d.verified,
          createdAt: d.created_at
        }));
      }
    }
    return getLocalItem("temp_donations", [])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createDonation(donation) {
    const newDonation = {
      ...donation,
      id: Math.random().toString(36).substr(2, 9),
      verified: false,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("donations")
        .insert({
          donor_name: donation.donorName,
          phone: donation.phone,
          amount: donation.amount,
          txn_id: donation.txnId
        })
        .select()
        .single();
      if (!error && data) {
        return {
          id: data.id,
          donorName: data.donor_name,
          phone: data.phone,
          amount: data.amount,
          txnId: data.txn_id,
          verified: data.verified,
          createdAt: data.created_at
        };
      }
    }

    const items = getLocalItem("temp_donations", []);
    items.unshift(newDonation);
    setLocalItem("temp_donations", items);
    return newDonation;
  },

  async verifyDonation(id, verified = true) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("donations")
        .update({ verified })
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        return {
          id: data.id,
          donorName: data.donor_name,
          phone: data.phone,
          amount: data.amount,
          txnId: data.txn_id,
          verified: data.verified,
          createdAt: data.created_at
        };
      }
    }

    const items = getLocalItem("temp_donations", []);
    const idx = items.findIndex(d => d.id === id);
    if (idx === -1) throw new Error("Donation not found");
    items[idx].verified = verified;
    setLocalItem("temp_donations", items);
    return items[idx];
  },

  // --- Authentication Sim ---
  async sendOTP(phone) {
    const mockOTP = Math.floor(100000 + Math.random() * 900000).toString();
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      return "OTP Sent Successfully (Real SMS)";
    }
    
    // Simulate SMS sending by logging and saving in storage for recovery
    setLocalItem(`mock_otp_${phone}`, mockOTP);
    console.log(`[OTP SIMULATOR] Code sent to ${phone}: ${mockOTP}`);
    return mockOTP;
  },

  async verifyOTP(phone, otp) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
      if (error) throw error;
      
      const user = data.user;
      // Get role from public.profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return {
        id: user.id,
        phone: phone,
        fullName: profile?.full_name || "Devotee",
        role: profile?.role || "user"
      };
    }

    // Mock Login
    const savedOTP = getLocalItem(`mock_otp_${phone}`, null);
    // Allow '123456' as master bypass for easy evaluation
    if (otp === "123456" || otp === savedOTP) {
      // Determine if admin (any number ending in '9000' is an admin for mock purposes)
      const role = phone.endsWith("9000") ? "admin" : "user";
      const profile = {
        id: "usr_" + phone,
        phone,
        fullName: role === "admin" ? "Temple Administrator" : "Jain Devotee",
        role
      };
      setLocalItem("session_user", profile);
      return profile;
    } else {
      throw new Error("Invalid verification code");
    }
  },

  getCurrentUser() {
    if (typeof window === "undefined") return null;
    return getLocalItem("session_user", null);
  },

  logout() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("session_user");
  }
};

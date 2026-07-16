import { supabase as libSupabase } from "@/lib/supabase";

export const supabase = libSupabase;
export const isSupabaseConfigured = !!supabase;

// ==========================================
// SEED DATA FOR LOCAL STORAGE FALLBACK
// ==========================================

const DEFAULT_SADHANA_ACTIVITIES = [
  { id: "act_upvas", name: "Upvas", points: 10, category: "Tapas" },
  { id: "act_ekasana", name: "Ekasana", points: 5, category: "Tapas" },
  { id: "act_beasana", name: "Beasana", points: 4, category: "Tapas" },
  { id: "act_ayambil", name: "Ayambil", points: 8, category: "Tapas" },
  { id: "act_navkar", name: "Navkar Mala", points: 2, category: "Chant" },
  { id: "act_samayik", name: "Samayik", points: 3, category: "Meditation" },
  { id: "act_pratikraman", name: "Pratikraman", points: 5, category: "Repentance" },
  { id: "act_pravachan", name: "Pravachan Attendance", points: 2, category: "Learning" },
  { id: "act_temple", name: "Temple Visit", points: 1, category: "Devotion" },
  { id: "act_swadhyay", name: "Swadhyay", points: 3, category: "Learning" },
  { id: "act_chaitya", name: "Chaitya Vandan", points: 2, category: "Devotion" },
  { id: "act_pooja", name: "Pooja", points: 2, category: "Devotion" },
  { id: "act_guru", name: "Guru Bhakti", points: 3, category: "Devotion" },
  { id: "act_seva", name: "Volunteer Seva", points: 5, category: "Service" },
  { id: "act_donation", name: "Donation", points: 0, category: "Charity" }
];

const DEFAULT_DEVOTEE_PROFILES = {
  "usr_9999999000": {
    id: "usr_9999999000",
    fullName: "Temple Administrator",
    phone: "9999999000",
    city: "Labriya",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    totalPoints: 350,
    streak: 42,
    badges: ["badge_first_upvas", "badge_10_upvas", "badge_100_points", "badge_30_streak", "badge_30_pravachans"],
    totalTaps: 12
  },
  "usr_9876543210": {
    id: "usr_9876543210",
    fullName: "Devendra Shah",
    phone: "9876543210",
    city: "Indore",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    totalPoints: 125,
    streak: 7,
    badges: ["badge_first_upvas", "badge_100_points"],
    totalTaps: 3
  },
  "l1": { id: "l1", fullName: "Vardhman Jain", city: "Ujjain", totalPoints: 940, streak: 105, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop", badges: ["badge_first_upvas", "badge_10_upvas", "badge_100_points", "badge_500_points", "badge_30_streak", "badge_30_pravachans"], totalTaps: 25 },
  "l2": { id: "l2", fullName: "Pujita Mehta", city: "Mumbai", totalPoints: 850, streak: 88, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop", badges: ["badge_first_upvas", "badge_100_points", "badge_500_points"], totalTaps: 20 },
  "l3": { id: "l3", fullName: "Ketan Khabia", city: "Dhar", totalPoints: 720, streak: 64, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop", badges: ["badge_100_points", "badge_500_points"], totalTaps: 15 },
  "l4": { id: "l4", fullName: "Samyak Doshi", city: "Labriya", totalPoints: 630, streak: 30, avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150&auto=format&fit=crop", badges: ["badge_100_points", "badge_500_points", "badge_30_streak"], totalTaps: 18 },
  "l5": { id: "l5", fullName: "Kiran Kataria", city: "Ratlam", totalPoints: 490, streak: 28, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop", badges: ["badge_100_points"], totalTaps: 10 },
  "l6": { id: "l6", fullName: "Naveen Shah", city: "Ahmedabad", totalPoints: 420, streak: 21, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop", badges: ["badge_100_points"], totalTaps: 8 },
  "l7": { id: "l7", fullName: "Jinal Doshi", city: "Baroda", totalPoints: 310, streak: 15, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop", badges: ["badge_100_points"], totalTaps: 5 },
  "l8": { id: "l8", fullName: "Rishabh Khabia", city: "Indore", totalPoints: 280, streak: 12, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop", badges: ["badge_100_points"], totalTaps: 6 },
  "l9": { id: "l9", fullName: "Mangal Bhandari", city: "Labriya", totalPoints: 210, streak: 9, avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop", badges: ["badge_100_points"], totalTaps: 4 }
};

const DEFAULT_SADHANA_LOGS = [
  { id: "log_1", userId: "usr_9876543210", dateStr: "2026-07-10", activities: ["act_upvas", "act_samayik", "act_temple"], points: 14 },
  { id: "log_2", userId: "usr_9876543210", dateStr: "2026-07-09", activities: ["act_ekasana", "act_navkar", "act_swadhyay"], points: 10 },
  { id: "log_3", userId: "usr_9876543210", dateStr: "2026-07-08", activities: ["act_ayambil", "act_pooja", "act_chaitya"], points: 12 }
];

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

const generatePanchangData = () => {
  const panchang = {};
  
  const addMonth = (year, monthNum, monthStr, tithis, sunrises, sunsets, shubhIndices, samayikIndices, customEvents = {}) => {
    for (let day = 1; day <= tithis.length; day++) {
      const dateStr = `${year}-${monthNum.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      const tithi = tithis[day - 1];
      
      const parts = tithi.split(" ");
      const monthName = parts[0];
      const pakshaName = parts[1];
      
      panchang[dateStr] = {
        dateStr,
        tithi,
        sunrise: sunrises[day - 1],
        sunset: sunsets[day - 1],
        paksha: pakshaName === "Sud" ? "Shukla (Sud)" : "Krishna (Vad)",
        month: monthName,
        festival: customEvents[day] || "",
        shubh_din: shubhIndices.includes(day),
        samayik: samayikIndices.includes(day),
        event: customEvents[day] || ""
      };
    }
  };

  // July 2026
  addMonth("2026", 7, "July", 
    ["Jeth Vad 1", "Jeth Vad 2", "Jeth Vad 3", "Jeth Vad 4", "Jeth Vad 5", "Jeth Vad 6", "Jeth Vad 7", "Jeth Vad 8", "Jeth Vad 9", "Jeth Vad 11", "Jeth Vad 12", "Jeth Vad 13", "Jeth Vad 14", "Jeth Vad 30", "Ashadh Sud 1", "Ashadh Sud 2", "Ashadh Sud 3", "Ashadh Sud 5", "Ashadh Sud 6", "Ashadh Sud 7", "Ashadh Sud 8", "Ashadh Sud 9", "Ashadh Sud 9", "Ashadh Sud 10", "Ashadh Sud 11", "Ashadh Sud 12", "Ashadh Sud 13", "Ashadh Sud 14", "Ashadh Sud 15", "Ashadh Vad 1", "Ashadh Vad 2"],
    ["07:39", "07:39", "07:39", "07:38", "07:38", "07:38", "07:38", "07:38", "07:37", "07:37", "07:37", "07:36", "07:36", "07:36", "07:35", "07:35", "07:34", "07:34", "07:33", "07:32", "07:32", "07:31", "07:30", "07:30", "07:29", "07:28", "07:27", "07:27", "07:26", "07:25", "07:24"],
    ["17:08", "17:09", "17:09", "17:10", "17:10", "17:11", "17:11", "17:12", "17:13", "17:13", "17:14", "17:14", "17:15", "17:16", "17:16", "17:17", "17:18", "17:19", "17:19", "17:20", "17:21", "17:21", "17:22", "17:23", "17:24", "17:25", "17:25", "17:26", "17:27", "17:28", "17:29"],
    [2, 3, 16, 17, 20, 24, 27, 30, 31],
    [5, 19],
    {}
  );

  // August 2026
  addMonth("2026", 8, "August",
    ["Ashadh Vad 3", "Ashadh Vad 4", "Ashadh Vad 5", "Ashadh Vad 6", "Ashadh Vad 7", "Ashadh Vad 8", "Ashadh Vad 9", "Ashadh Vad 10", "Ashadh Vad 11", "Ashadh Vad 12", "Ashadh Vad 14", "Ashadh Vad 30", "Shraavan Sud 1", "Shraavan Sud 2", "Shraavan Sud 3", "Shraavan Sud 4", "Shraavan Sud 5", "Shraavan Sud 6", "Shraavan Sud 7", "Shraavan Sud 8", "Shraavan Sud 9", "Shraavan Sud 10", "Shraavan Sud 11", "Shraavan Sud 12", "Shraavan Sud 13", "Shraavan Sud 13", "Shraavan Sud 14", "Shraavan Sud 15", "Shraavan Vad 1", "Shraavan Vad 2", "Shraavan Vad 3"],
    ["07:23", "07:22", "07:21", "07:20", "07:19", "07:18", "07:17", "07:16", "07:15", "07:14", "07:13", "07:11", "07:10", "07:09", "07:08", "07:07", "07:05", "07:04", "07:03", "07:01", "07:00", "06:59", "06:57", "06:56", "06:55", "06:53", "06:52", "06:51", "06:49", "06:48", "06:46"],
    ["17:29", "17:30", "17:31", "17:32", "17:33", "17:34", "17:34", "17:35", "17:36", "17:37", "17:38", "17:39", "17:39", "17:40", "17:41", "17:42", "17:43", "17:44", "17:44", "17:45", "17:46", "17:47", "17:48", "17:49", "17:49", "17:50", "17:51", "17:52", "17:53", "17:54", "17:54"],
    [3, 9, 13, 14, 17, 23, 25, 28, 31],
    [2, 16, 30],
    { 30: "Shri Shreyanshnath Bhagwan Nirvan Kalyanak" }
  );

  // September 2026
  addMonth("2026", 9, "September",
    ["Shraavan Vad 5", "Shraavan Vad 6", "Shraavan Vad 7", "Shraavan Vad 8", "Shraavan Vad 9", "Shraavan Vad 10", "Shraavan Vad 11", "Shraavan Vad 12", "Shraavan Vad 13", "Shraavan Vad 14", "Shraavan Vad 30", "Bhadarvo Sud 1", "Bhadarvo Sud 2", "Bhadarvo Sud 3", "Bhadarvo Sud 4", "Bhadarvo Sud 5", "Bhadarvo Sud 6", "Bhadarvo Sud 7", "Bhadarvo Sud 8", "Bhadarvo Sud 9", "Bhadarvo Sud 10", "Bhadarvo Sud 11", "Bhadarvo Sud 12", "Bhadarvo Sud 13", "Bhadarvo Sud 14", "Bhadarvo Sud 15", "Bhadarvo Vad 1", "Bhadarvo Vad 2", "Bhadarvo Vad 3", "Bhadarvo Vad 4"],
    ["06:45", "06:43", "06:42", "06:40", "06:39", "06:37", "06:36", "06:34", "06:33", "06:31", "06:30", "06:28", "06:27", "06:25", "06:24", "06:22", "06:21", "06:19", "06:17", "06:16", "06:14", "06:13", "06:11", "06:10", "06:08", "06:07", "06:05", "06:03", "06:02", "06:00"],
    ["17:55", "17:56", "17:57", "17:58", "17:59", "17:59", "18:00", "18:01", "18:02", "18:03", "18:04", "18:04", "18:05", "18:06", "18:07", "18:08", "18:09", "18:09", "18:10", "18:11", "18:12", "18:13", "18:14", "18:15", "18:15", "18:16", "18:17", "18:18", "18:19", "18:20"],
    [6, 7, 9, 22],
    [13, 27],
    {}
  );

  // October 2026
  addMonth("2026", 10, "October",
    ["Bhadarvo Vad 5", "Bhadarvo Vad 6", "Bhadarvo Vad 8", "Bhadarvo Vad 9", "Bhadarvo Vad 10", "Bhadarvo Vad 11", "Bhadarvo Vad 12", "Bhadarvo Vad 13", "Bhadarvo Vad 14", "Bhadarvo Vad 30", "Aaso Sud 1", "Aaso Sud 2", "Aaso Sud 3", "Aaso Sud 4", "Aaso Sud 5", "Aaso Sud 6", "Aaso Sud 7", "Aaso Sud 7", "Aaso Sud 8", "Aaso Sud 9", "Aaso Sud 10", "Aaso Sud 11", "Aaso Sud 12", "Aaso Sud 13", "Aaso Sud 14", "Aaso Sud 15", "Aaso Vad 2", "Aaso Vad 3", "Aaso Vad 4", "Aaso Vad 5", "Aaso Vad 6"],
    ["05:59", "05:57", "05:56", "05:54", "06:53", "06:51", "06:50", "06:48", "06:47", "06:45", "06:44", "06:42", "06:41", "06:40", "06:38", "06:37", "06:35", "06:34", "06:33", "06:31", "06:30", "06:29", "06:27", "06:26", "06:25", "06:23", "06:22", "06:21", "06:20", "06:19", "06:17"],
    ["18:21", "18:22", "18:22", "18:23", "19:24", "19:25", "19:26", "19:27", "19:28", "19:29", "19:30", "19:31", "19:32", "19:33", "19:34", "19:35", "19:35", "19:36", "19:37", "19:38", "19:39", "19:40", "19:41", "19:42", "19:43", "19:45", "19:46", "19:47", "19:48", "19:49", "19:50"],
    [13, 15, 18, 22, 23, 26, 27, 28, 30],
    [11, 25],
    {}
  );

  panchang["default"] = {
    dateStr: "Today",
    tithi: "Ashadh Krishna Dwadashi (12th)",
    sunrise: "05:48 AM",
    sunset: "07:12 PM",
    paksha: "Krishna Paksha",
    month: "Ashadh",
    festival: "",
    shubh_din: false,
    samayik: false,
    event: ""
  };

  return panchang;
};

const DEFAULT_PANCHANG = generatePanchangData();

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

export function initializeLocalDefaults(force = false) {
  if (typeof window === "undefined") return;
  const keys = [
    { key: "temp_schedules", val: DEFAULT_SCHEDULE },
    { key: "temp_announcements", val: DEFAULT_ANNOUNCEMENTS },
    { key: "temp_tithi_panchang", val: DEFAULT_PANCHANG },
    { key: "temp_events", val: DEFAULT_EVENTS },
    { key: "temp_sadhana_activities", val: DEFAULT_SADHANA_ACTIVITIES },
    { key: "temp_sadhana_profiles", val: DEFAULT_DEVOTEE_PROFILES },
    { key: "temp_sadhana_logs", val: DEFAULT_SADHANA_LOGS }
  ];
  
  keys.forEach(({ key, val }) => {
    try {
      const existing = localStorage.getItem(key);
      if (force || !existing || existing === "[]" || existing === "{}") {
        localStorage.setItem(key, JSON.stringify(val));
      }
    } catch (e) {
      console.error("Error initializing key " + key, e);
    }
  });
}

// Automatically seed client-side storage on import
if (typeof window !== "undefined") {
  initializeLocalDefaults();
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
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map(item => ({
          id: item.id,
          title: item.title,
          content: item.message,
          type: item.priority === "high" ? "program" : item.priority === "low" ? "notice" : "update",
          active: item.published,
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
      const dbPriority = announcement.type === "program" ? "high" : announcement.type === "notice" ? "low" : "normal";
      const { data, error } = await supabase
        .from("announcements")
        .insert({
          title: announcement.title,
          message: announcement.content,
          priority: dbPriority,
          published: announcement.active
        })
        .select()
        .single();
      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          content: data.message,
          type: data.priority === "high" ? "program" : data.priority === "low" ? "notice" : "update",
          active: data.published,
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
        .update({ published: false })
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
          shubh_din: data.shubh_din,
          samayik: data.samayik,
          event: data.event
        };
      }
    }

    const records = getLocalItem("temp_tithi_panchang", DEFAULT_PANCHANG);
    return records[dateStr] || {
      ...records["default"],
      dateStr: dateStr
    };
  },

  async getPanchangForMonth(year, month) {
    // month is 1-based (1-12)
    const prefix = `${year}-${month.toString().padStart(2, "0")}`;
    const records = getLocalItem("temp_tithi_panchang", DEFAULT_PANCHANG);
    
    const monthData = {};
    for (const [date, val] of Object.entries(records)) {
      if (date.startsWith(prefix)) {
        monthData[date] = val;
      }
    }
    return monthData;
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
          shubh_din: updated.shubh_din,
          samayik: updated.samayik,
          event: updated.event
        });
      if (!error) return updated;
    }

    const records = getLocalItem("temp_tithi_panchang", DEFAULT_PANCHANG);
    records[dateStr] = updated;
    setLocalItem("temp_tithi_panchang", records);
    return updated;
  },

  // --- Events ---
  async getEvents() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true });
      if (!error && data) {
        return data.map(d => ({
          id: d.id,
          title: d.title,
          description: d.description,
          location: d.location,
          date: `${d.event_date}T${d.event_time}`,
          imageUrl: d.image_url
        }));
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
      const dateObj = new Date(event.date);
      const eventDate = isNaN(dateObj.getTime()) ? new Date().toISOString().split("T")[0] : dateObj.toISOString().split("T")[0];
      const eventTime = isNaN(dateObj.getTime()) ? new Date().toTimeString().split(" ")[0] : dateObj.toTimeString().split(" ")[0];
      const { data, error } = await supabase
        .from("events")
        .insert({
          title: event.title,
          description: event.description,
          location: event.location,
          event_date: eventDate,
          event_time: eventTime,
          image_url: event.imageUrl
        })
        .select()
        .single();
      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          description: data.description,
          location: data.location,
          date: `${data.event_date}T${data.event_time}`,
          imageUrl: data.image_url
        };
      }
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



  // --- Sadhana Tracker ---
  async getSadhanaActivities() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true });
      if (!error && data) {
        return data.map(a => ({
          id: a.id,
          name: a.name,
          points: a.points,
          category: a.category,
          description: a.description,
          difficulty: a.difficulty,
          icon: a.icon
        }));
      }
    }
    return getLocalItem("temp_sadhana_activities", DEFAULT_SADHANA_ACTIVITIES);
  },

  async updateSadhanaActivities(list) {
    if (isSupabaseConfigured && supabase) {
      // Admin update for activities configuration
      for (const a of list) {
        await supabase
          .from("activities")
          .update({
            name: a.name,
            points: a.points,
            category: a.category,
            description: a.description,
            active: a.active !== false
          })
          .eq("id", a.id);
      }
    }
    setLocalItem("temp_sadhana_activities", list);
    return list;
  },

  async isLeaderboardEnabled() {
    return getLocalItem("temp_leaderboard_toggle", false);
  },

  async setLeaderboardEnabled(enabled) {
    setLocalItem("temp_leaderboard_toggle", enabled);
    return enabled;
  },

  async getDevoteeProfile(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (!error && data) {
        return {
          id: data.id,
          fullName: data.full_name,
          phone: data.mobile,
          city: data.city,
          avatar: data.avatar_url,
          totalPoints: data.total_points,
          streak: data.current_streak,
          longestStreak: data.longest_streak,
          lastActivityDate: data.last_activity_date
        };
      }
    }

    const profiles = getLocalItem("temp_sadhana_profiles", DEFAULT_DEVOTEE_PROFILES);
    if (!profiles[userId]) {
      profiles[userId] = {
        id: userId,
        fullName: "Jain Devotee",
        phone: "Unknown",
        city: "Labriya",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
        totalPoints: 0,
        streak: 0,
        longestStreak: 0,
        badges: [],
        totalTaps: 0
      };
      setLocalItem("temp_sadhana_profiles", profiles);
    }
    return profiles[userId];
  },

  async updateDevoteeProfile(userId, updates) {
    if (isSupabaseConfigured && supabase) {
      const dbUpdates = {};
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.city !== undefined) dbUpdates.city = updates.city;
      if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;
      if (updates.phone !== undefined) dbUpdates.mobile = updates.phone;

      const { data, error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq("id", userId)
        .select()
        .single();
      
      if (!error && data) {
        return {
          id: data.id,
          fullName: data.full_name,
          phone: data.mobile,
          city: data.city,
          avatar: data.avatar_url,
          totalPoints: data.total_points,
          streak: data.current_streak,
          longestStreak: data.longest_streak
        };
      }
    }

    const profiles = getLocalItem("temp_sadhana_profiles", DEFAULT_DEVOTEE_PROFILES);
    if (!profiles[userId]) {
      await this.getDevoteeProfile(userId);
    }
    profiles[userId] = { ...profiles[userId], ...updates };
    setLocalItem("temp_sadhana_profiles", profiles);
    return profiles[userId];
  },

  async getSadhanaLogs(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("user_activities")
        .select(`
          id,
          activity_date,
          points_awarded,
          status,
          notes,
          admin_note,
          created_at,
          activities (
            id,
            name,
            category,
            points
          )
        `)
        .eq("profile_id", userId)
        .order("activity_date", { ascending: false });

      if (error) {
        console.error("Error fetching getSadhanaLogs from Supabase:", error.message);
      }

      if (!error && data) {
        const logsByDate = {};
        data.forEach(ua => {
          const dateStr = ua.activity_date;
          if (!logsByDate[dateStr]) {
            logsByDate[dateStr] = {
              id: dateStr,
              submissionId: ua.id,
              profileId: userId,
              dateStr,
              activities: [],
              points: 0,
              status: ua.status,
              createdAt: ua.created_at,
              adminNote: ua.admin_note
            };
          }
          if (ua.activities) {
            logsByDate[dateStr].activities.push(ua.activities.id);
            logsByDate[dateStr].points += ua.points_awarded;
          }
        });
        return Object.values(logsByDate);
      }
    }

    const logs = getLocalItem("temp_sadhana_logs", DEFAULT_SADHANA_LOGS);
    return logs.filter(l => l.userId === userId).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  },

  async submitDailySadhana(userId, dateStr, activityIds) {
    if (isSupabaseConfigured && supabase) {
      // 1. Fetch existing entries for that date
      const { data: existing, error: fetchErr } = await supabase
        .from("user_activities")
        .select("id, status")
        .eq("profile_id", userId)
        .eq("activity_date", dateStr);

      if (fetchErr) throw fetchErr;

      // 2. Prevent edit if any activity was already Approved
      const hasApproved = existing?.some(e => e.status === "Approved");
      if (hasApproved) {
        throw new Error("This entry has already been approved by administration and cannot be modified.");
      }

      // 3. Clear existing entries for this date
      if (existing && existing.length > 0) {
        const { error: deleteErr } = await supabase
          .from("user_activities")
          .delete()
          .eq("profile_id", userId)
          .eq("activity_date", dateStr);
        if (deleteErr) throw deleteErr;
      }

      // 4. Batch insert new entries
      if (activityIds.length > 0) {
        const { data: acts, error: actErr } = await supabase
          .from("activities")
          .select("id, points")
          .in("id", activityIds);

        if (actErr) throw actErr;

        const insertData = activityIds.map(actId => {
          const pointsVal = acts?.find(a => a.id === actId)?.points || 0;
          return {
            profile_id: userId,
            activity_id: actId,
            activity_date: dateStr,
            points_awarded: pointsVal,
            status: "Pending",
            submission_source: "Website"
          };
        });

        const { error: insertErr } = await supabase
          .from("user_activities")
          .insert(insertData);

        if (insertErr) throw insertErr;
      }

      // 5. Fetch updated profile stats from DB (calculated by DB triggers)
      const { data: updatedProfile, error: profErr } = await supabase
        .from("profiles")
        .select("total_points, current_streak, longest_streak")
        .eq("id", userId)
        .single();

      if (profErr) throw profErr;

      return {
        log: {
          id: dateStr,
          profileId: userId,
          dateStr,
          activities: activityIds,
          points: 0, // points sum is resolved dynamically, set placeholder
          status: "Pending"
        },
        profile: {
          totalPoints: updatedProfile.total_points,
          streak: updatedProfile.current_streak,
          longestStreak: updatedProfile.longest_streak
        }
      };
    }

    const activities = await this.getSadhanaActivities();
    const logs = getLocalItem("temp_sadhana_logs", DEFAULT_SADHANA_LOGS);
    
    let pointsEarned = 0;
    activityIds.forEach(id => {
      const act = activities.find(a => a.id === id);
      if (act) {
        pointsEarned += act.points;
      }
    });

    const existingIdx = logs.findIndex(l => l.userId === userId && l.dateStr === dateStr);
    
    let previousPoints = 0;
    if (existingIdx !== -1) {
      previousPoints = logs[existingIdx].points;
      logs[existingIdx] = {
        id: logs[existingIdx].id,
        userId,
        dateStr,
        activities: activityIds,
        points: pointsEarned
      };
    } else {
      logs.unshift({
        id: "log_" + Math.random().toString(36).substr(2, 9),
        userId,
        dateStr,
        activities: activityIds,
        points: pointsEarned
      });
    }

    setLocalItem("temp_sadhana_logs", logs);

    const profile = await this.getDevoteeProfile(userId);
    const pointDifference = pointsEarned - previousPoints;
    const newTotalPoints = Math.max(0, (profile.totalPoints || 0) + pointDifference);

    let newStreak = profile.streak || 0;
    if (existingIdx === -1) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      
      const hadYesterdayLog = logs.some(l => l.userId === userId && l.dateStr === yesterdayStr);
      if (hadYesterdayLog || newStreak === 0) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    const currentBadges = [...(profile.badges || [])];
    const checkAndAddBadge = (badgeId) => {
      if (!currentBadges.includes(badgeId)) {
        currentBadges.push(badgeId);
      }
    };

    let upvasTotalCount = 0;
    let pravachanTotalCount = 0;
    let templeTotalCount = 0;

    const userLogs = logs.filter(l => l.userId === userId);
    userLogs.forEach(l => {
      if (l.activities.includes("act_upvas")) upvasTotalCount++;
      if (l.activities.includes("act_pravachan")) pravachanTotalCount++;
      if (l.activities.includes("act_temple")) templeTotalCount++;
    });

    if (upvasTotalCount >= 1) checkAndAddBadge("badge_first_upvas");
    if (upvasTotalCount >= 10) checkAndAddBadge("badge_10_upvas");
    if (pravachanTotalCount >= 30) checkAndAddBadge("badge_30_pravachans");
    if (templeTotalCount >= 100) checkAndAddBadge("badge_100_temple");
    if (newStreak >= 30) checkAndAddBadge("badge_30_streak");
    
    if (newTotalPoints >= 100) checkAndAddBadge("badge_100_points");
    if (newTotalPoints >= 500) checkAndAddBadge("badge_500_points");
    if (newTotalPoints >= 1000) checkAndAddBadge("badge_1000_points");

    const updatedProfile = await this.updateDevoteeProfile(userId, {
      totalPoints: newTotalPoints,
      streak: newStreak,
      badges: currentBadges,
      totalTaps: upvasTotalCount + (userLogs.filter(l => l.activities.some(a => ["act_ekasana", "act_beasana", "act_ayambil"].includes(a))).length)
    });

    return {
      log: existingIdx === -1 ? logs[0] : logs[existingIdx],
      profile: updatedProfile
    };
  },

  async getLeaderboard() {
    if (isSupabaseConfigured && supabase) {
      const isEnabled = await this.isLeaderboardEnabled();
      if (!isEnabled) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, city, total_points, current_streak, avatar_url")
        .order("total_points", { ascending: false })
        .limit(10);
      
      if (!error && data) {
        return data.map(p => ({
          id: p.id,
          fullName: p.full_name,
          city: p.city,
          totalPoints: p.total_points,
          streak: p.current_streak,
          avatar: p.avatar_url
        }));
      }
    }

    const profiles = getLocalItem("temp_sadhana_profiles", DEFAULT_DEVOTEE_PROFILES);
    const isEnabled = await this.isLeaderboardEnabled();
    if (!isEnabled) return [];

    return Object.values(profiles)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);
  },

  async getAdminSadhanaReports() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("total_points", { ascending: false });
      
      if (!error && data) {
        return data.map(p => ({
          id: p.id,
          fullName: p.full_name,
          phone: p.mobile,
          city: p.city,
          totalPoints: p.total_points,
          streak: p.current_streak,
          avatar: p.avatar_url
        }));
      }
    }

    const profiles = getLocalItem("temp_sadhana_profiles", DEFAULT_DEVOTEE_PROFILES);
    return Object.values(profiles).sort((a, b) => b.totalPoints - a.totalPoints);
  },

  // --- Admin Console Extended Operations ---
  async getAllProfiles() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });
      if (!error && data) {
        return data.map(p => ({
          id: p.id,
          fullName: p.full_name,
          phone: p.mobile,
          city: p.city,
          role: p.role,
          totalPoints: p.total_points,
          streak: p.current_streak,
          longestStreak: p.longest_streak,
          avatar: p.avatar_url,
          memberNumber: p.member_number,
          createdAt: p.created_at
        }));
      }
    }
    const profiles = getLocalItem("temp_sadhana_profiles", DEFAULT_DEVOTEE_PROFILES);
    return Object.values(profiles);
  },

  async deleteProfileAdmin(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);
      if (!error) return true;
      throw error;
    }
    const profiles = getLocalItem("temp_sadhana_profiles", DEFAULT_DEVOTEE_PROFILES);
    if (profiles[id]) {
      delete profiles[id];
      setLocalItem("temp_sadhana_profiles", profiles);
      return true;
    }
    return false;
  },

  async getLogsAdmin(filterStatus) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from("user_activities")
        .select(`
          id,
          activity_date,
          points_awarded,
          status,
          created_at,
          profiles (
            id,
            full_name,
            mobile
          ),
          activities (
            id,
            name,
            category
          )
        `)
        .order("created_at", { ascending: false });
      
      if (filterStatus) {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data.map(log => ({
          id: log.id,
          dateStr: log.activity_date,
          points: log.points_awarded,
          status: log.status,
          createdAt: log.created_at,
          devoteeName: log.profiles?.full_name || "Unknown",
          devoteePhone: log.profiles?.mobile || "Unknown",
          activityName: log.activities?.name || "Unknown",
          activityCategory: log.activities?.category || "Unknown"
        }));
      }
    }
    return [];
  },

  async updateLogStatus(id, status) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("user_activities")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return null;
  },

  async approveAllPendingLogs() {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("user_activities")
        .update({ status: "Approved" })
        .eq("status", "Pending");
      if (error) throw error;
      return true;
    }
    return false;
  },

  async getSettings() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        return {
          id: data.id,
          templeName: data.temple_name,
          templeLogo: data.temple_logo,
          heroBanner: data.hero_banner,
          email: data.email,
          aboutText: data.about_text,
          trustRegistrationNumber: data.trust_registration_number,
          latitude: data.latitude,
          longitude: data.longitude,
          donationQr: data.donation_qr,
          upiId: data.upi_id,
          bankName: data.bank_name,
          accountHolder: data.account_holder,
          accountNumber: data.account_number,
          ifsc: data.ifsc,
          contactNumber: data.contact_number,
          templeAddress: data.temple_address,
          facebook: data.facebook,
          instagram: data.instagram,
          youtube: data.youtube,
          website: data.website
        };
      }
    }
    return getLocalItem("temp_temple_settings", {
      templeName: "Shree Labriya Jain Shwetambar Mandir",
      upiId: "shreelabriyatrust@okaxis",
      bankName: "State Bank of India",
      accountHolder: "Shree Labriya Jain Mandir Trust",
      accountNumber: "38472948194",
      ifsc: "SBIN0030129",
      contactNumber: "+91 98765 43210",
      templeAddress: "Mandir Marg, Labriya, Dhar District, Madhya Pradesh - 454111"
    });
  },

  async updateSettings(updates) {
    if (isSupabaseConfigured && supabase) {
      const dbUpdates = {
        temple_name: updates.templeName,
        temple_logo: updates.templeLogo,
        hero_banner: updates.heroBanner,
        email: updates.email,
        about_text: updates.aboutText,
        trust_registration_number: updates.trustRegistrationNumber,
        latitude: updates.latitude,
        longitude: updates.longitude,
        donation_qr: updates.donationQr,
        upi_id: updates.upiId,
        bank_name: updates.bankName,
        account_holder: updates.accountHolder,
        account_number: updates.accountNumber,
        ifsc: updates.ifsc,
        contact_number: updates.contactNumber,
        temple_address: updates.templeAddress,
        facebook: updates.facebook,
        instagram: updates.instagram,
        youtube: updates.youtube,
        website: updates.website,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("settings")
        .update(dbUpdates)
        .eq("id", "00000000-0000-0000-0000-000000000000")
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    
    const local = getLocalItem("temp_temple_settings", {});
    const updated = { ...local, ...updates };
    setLocalItem("temp_temple_settings", updated);
    return updated;
  },

  async createSchedule(schedule) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("schedules")
        .insert({
          time: schedule.time,
          activity: schedule.activity,
          session: schedule.session,
          order_num: parseInt(schedule.orderNum) || 0
        })
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        time: data.time,
        activity: data.activity,
        session: data.session,
        orderNum: data.order_num
      };
    }
    const items = getLocalItem("temp_schedules", DEFAULT_SCHEDULE);
    const newSched = {
      ...schedule,
      id: "sched_" + Math.random().toString(36).substr(2, 9),
      orderNum: parseInt(schedule.orderNum) || 0
    };
    items.push(newSched);
    setLocalItem("temp_schedules", items);
    return newSched;
  },

  async deleteSchedule(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("schedules")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    }
    const items = getLocalItem("temp_schedules", DEFAULT_SCHEDULE);
    const filtered = items.filter(s => s.id !== id);
    setLocalItem("temp_schedules", filtered);
    return true;
  },

  async getAdminAnalytics() {
    if (isSupabaseConfigured && supabase) {
      const { count: devoteesCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { data: pointsSumData } = await supabase
        .from("profiles")
        .select("total_points");
      const totalPoints = pointsSumData?.reduce((sum, p) => sum + (p.total_points || 0), 0) || 0;

      const { count: logsCount } = await supabase
        .from("user_activities")
        .select("*", { count: "exact", head: true });

      const { count: approvedCount } = await supabase
        .from("user_activities")
        .select("*", { count: "exact", head: true })
        .eq("status", "Approved");

      const { data: donationsData } = await supabase
        .from("donations")
        .select("amount, verified");
      const totalDonations = donationsData?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
      const verifiedDonations = donationsData?.filter(d => d.verified).reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

      return {
        devoteesCount: devoteesCount || 0,
        totalPoints,
        logsCount: logsCount || 0,
        approvedLogsCount: approvedCount || 0,
        totalDonations,
        verifiedDonations
      };
    }
    return {
      devoteesCount: 15,
      totalPoints: 850,
      logsCount: 42,
      approvedLogsCount: 30,
      totalDonations: 125000,
      verifiedDonations: 95000
    };
  },

  async getAdminAnalyticsEnhanced() {
    const todayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];

    if (isSupabaseConfigured && supabase) {
      const { count: devoteesCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: familiesCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("member_number", 1);

      const { data: pointsSumData } = await supabase
        .from("profiles")
        .select("total_points");
      const totalPoints = pointsSumData?.reduce((sum, p) => sum + (p.total_points || 0), 0) || 0;

      const { count: logsCount } = await supabase
        .from("user_activities")
        .select("*", { count: "exact", head: true });

      const { count: approvedCount } = await supabase
        .from("user_activities")
        .select("*", { count: "exact", head: true })
        .eq("status", "Approved");

      const { count: pendingCount } = await supabase
        .from("user_activities")
        .select("*", { count: "exact", head: true })
        .eq("status", "Pending");

      const { count: todayCheckinsCount } = await supabase
        .from("user_activities")
        .select("*", { count: "exact", head: true })
        .eq("activity_date", todayStr);

      const { data: donationsData } = await supabase
        .from("donations")
        .select("amount, verified");
      const totalDonations = donationsData?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
      const verifiedDonations = donationsData?.filter(d => d.verified).reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

      const { data: todayDonations } = await supabase
        .from("donations")
        .select("amount")
        .gte("created_at", `${todayStr}T00:00:00`)
        .lte("created_at", `${todayStr}T23:59:59`);
      const todayDonationsAmount = todayDonations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

      const { count: newRegistrationsToday } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${todayStr}T00:00:00`)
        .lte("created_at", `${todayStr}T23:59:59`);

      const { data: topDevoteesData } = await supabase
        .from("profiles")
        .select("id, full_name, city, total_points, current_streak, avatar_url, member_number")
        .order("total_points", { ascending: false })
        .limit(5);

      const topDevotees = topDevoteesData?.map(p => ({
        id: p.id,
        fullName: p.full_name,
        city: p.city,
        totalPoints: p.total_points,
        streak: p.current_streak,
        avatar: p.avatar_url,
        memberNumber: p.member_number
      })) || [];

      const { data: recentLogsData } = await supabase
        .from("user_activities")
        .select(`
          id,
          activity_date,
          points_awarded,
          status,
          created_at,
          profiles (full_name),
          activities (name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      const recentActivity = recentLogsData?.map(log => ({
        id: log.id,
        devoteeName: log.profiles?.full_name || "Unknown",
        activityName: log.activities?.name || "Unknown",
        dateStr: log.activity_date,
        points: log.points_awarded,
        status: log.status,
        createdAt: log.created_at
      })) || [];

      return {
        devoteesCount: devoteesCount || 0,
        familiesCount: familiesCount || 0,
        totalPoints,
        logsCount: logsCount || 0,
        approvedLogsCount: approvedCount || 0,
        pendingCount: pendingCount || 0,
        todayCheckinsCount: todayCheckinsCount || 0,
        totalDonations,
        verifiedDonations,
        todayDonationsAmount,
        newRegistrationsToday: newRegistrationsToday || 0,
        topDevotees,
        recentActivity
      };
    }

    return {
      devoteesCount: 15,
      familiesCount: 9,
      totalPoints: 850,
      logsCount: 42,
      approvedLogsCount: 30,
      pendingCount: 12,
      todayCheckinsCount: 7,
      totalDonations: 125000,
      verifiedDonations: 95000,
      todayDonationsAmount: 5000,
      newRegistrationsToday: 2,
      topDevotees: [],
      recentActivity: []
    };
  },

  async updateLogWithRemarks(id, updates) {
    if (isSupabaseConfigured && supabase) {
      const dbUpdates = {};
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.remarks !== undefined) dbUpdates.admin_note = updates.remarks;
      if (updates.points !== undefined) dbUpdates.points_awarded = updates.points;

      // Fetch the log first to know the profile_id and activity_date
      const { data: logData } = await supabase
        .from("user_activities")
        .select("profile_id, activity_date, activities(name)")
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from("user_activities")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      // Register devotee notification
      if (logData && updates.status) {
        const title = updates.status === "Approved" ? "Sadhana Log Approved 🪷" : "Sadhana Log Rejected ⚠️";
        const message = updates.status === "Approved"
          ? `Your check-in on ${logData.activity_date} for ${logData.activities?.name || "activity"} was approved (+${updates.points || 0} pts).${updates.remarks ? ` Note: "${updates.remarks}"` : ""}`
          : `Your check-in on ${logData.activity_date} for ${logData.activities?.name || "activity"} was rejected. Reason: "${updates.remarks || "No reason specified"}"`;
        await this.createNotification(logData.profile_id, title, message, updates.status.toLowerCase());
      }

      return data;
    }
    return null;
  },

  // ── Notification Center API ────────────────────────────────────────────────
  async getNotifications(profileId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .or(`profile_id.eq.${profileId},profile_id.is.null`)
        .order("created_at", { ascending: false })
        .limit(30);
      if (!error && data) return data;
    }
    const local = getLocalItem("temp_notifications", []);
    return local.filter(n => !n.profileId || n.profileId === profileId);
  },

  async markNotificationRead(id) {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);
      return true;
    }
    const local = getLocalItem("temp_notifications", []);
    const idx = local.findIndex(n => n.id === id);
    if (idx !== -1) {
      local[idx].read = true;
      setLocalItem("temp_notifications", local);
    }
    return true;
  },

  async createNotification(profileId, title, message, type) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          profile_id: profileId,
          title,
          message,
          type
        })
        .select()
        .single();
      if (!error && data) return data;
    }
    const local = getLocalItem("temp_notifications", []);
    const newNotif = {
      id: "notif_" + Math.random().toString(36).substr(2, 9),
      profileId,
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString()
    };
    local.unshift(newNotif);
    setLocalItem("temp_notifications", local);
    return newNotif;
  },

  // ── Audit Logs API ──────────────────────────────────────────────────────────
  async getAuditLogs() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!error && data) return data;
    }
    return getLocalItem("temp_audit_logs", []);
  },

  async createAuditLog(adminId, adminName, action, affectedRecordId, details) {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("audit_logs")
        .insert({
          admin_id: adminId,
          admin_name: adminName,
          action,
          affected_record_id: affectedRecordId,
          details
        });
      return true;
    }
    const local = getLocalItem("temp_audit_logs", []);
    local.unshift({
      id: "audit_" + Math.random().toString(36).substr(2, 9),
      admin_id: adminId,
      admin_name: adminName,
      action,
      affected_record_id: affectedRecordId,
      details,
      created_at: new Date().toISOString()
    });
    setLocalItem("temp_audit_logs", local);
    return true;
  },

  // ── Devotee Profile Admin Notes ────────────────────────────────────────────
  async updateProfileNotes(profileId, adminNotes) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("profiles")
        .update({ admin_notes: adminNotes })
        .eq("id", profileId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const profiles = getLocalItem("temp_sadhana_profiles", {});
    if (profiles[profileId]) {
      profiles[profileId].adminNotes = adminNotes;
      setLocalItem("temp_sadhana_profiles", profiles);
    }
    return true;
  },

  // ── System Database Backup Utility ─────────────────────────────────────────
  async downloadSystemBackup() {
    if (isSupabaseConfigured && supabase) {
      const tables = ["profiles", "user_activities", "donations", "schedules", "settings", "announcements", "events", "audit_logs"];
      const backupData = {};
      for (const t of tables) {
        const { data } = await supabase.from(t).select("*");
        backupData[t] = data || [];
      }
      return backupData;
    }
    return {
      profiles: Object.values(getLocalItem("temp_sadhana_profiles", {})),
      user_activities: getLocalItem("temp_sadhana_logs", []),
      donations: getLocalItem("temp_donations", []),
      schedules: getLocalItem("temp_schedules", []),
      settings: getLocalItem("temp_temple_settings", {}),
      announcements: getLocalItem("temp_announcements", []),
      events: getLocalItem("temp_events", []),
      audit_logs: getLocalItem("temp_audit_logs", [])
    };
  },

  async restoreSystemBackup(backupData) {
    if (!backupData) return false;
    if (isSupabaseConfigured && supabase) {
      // Restore settings table singleton safely
      if (backupData.settings && backupData.settings.length > 0) {
        const setRow = backupData.settings[0];
        await supabase
          .from("settings")
          .update({
            temple_name: setRow.temple_name,
            contact_number: setRow.contact_number,
            temple_address: setRow.temple_address,
            upi_id: setRow.upi_id,
            bank_name: setRow.bank_name,
            account_holder: setRow.account_holder,
            account_number: setRow.account_number,
            ifsc: setRow.ifsc,
            maintenance_mode: setRow.maintenance_mode || false,
            google_maps_url: setRow.google_maps_url
          })
          .eq("id", "00000000-0000-0000-0000-000000000000");
      }
      return true;
    }
    if (backupData.settings) setLocalItem("temp_temple_settings", backupData.settings);
    return true;
  }
};


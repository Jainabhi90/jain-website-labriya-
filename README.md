# Shree Labriya Jain Chaturmas Portal

Welcome to the official repository of the **Labriya Chaturmas Portal**, a digital platform designed for the Shree Labriya Jain Shwetambar Mandir. This portal connects devotees with daily spiritual schedules, lunar Panchang coordinates, community updates, calendar-exported events, waitlist notifications, direct tax-exempt donation reporting, and a family account system, along with an administrative console to manage temple operations.

---

## ⚡ Tech Stack

- **Frontend Framework**: Next.js 15 (App Router, Turbopack)
- **Programming Language**: JavaScript (ES6+, JSX)
- **Styling Engine**: Tailwind CSS (v4)
- **Backend-as-a-Service**: Supabase (Database, Auth, Row Level Security)
- **Database**: PostgreSQL (relational storage, schema constraints, triggers, and procedures)
- **Hosting & Deployment**: Vercel

---

## 📂 Folder Structure

```text
jain-website-labriya/
├── docs/                      # Architectural & API Engineering Documentation
│   ├── README.md              # Project Overview
│   ├── ARCHITECTURE.md        # Technical System Design
│   ├── DATABASE.md            # Schema, Relations, & Security Policies
│   ├── FEATURES.md            # Detailed Feature Specifications
│   ├── ROADMAP.md             # Project Release Phases
│   ├── API.md                 # Supabase RPC & Client Endpoint Specs
│   ├── CONTRIBUTING.md        # Contribution & Code Quality Guidelines
│   └── CHANGELOG.md           # Version Releases
├── public/                    # Static Assets (Images, Icons, Media)
├── supabase/
│   └── migrations/            # PostgreSQL Schema Migrations
│       ├── 001_initial_schema.sql
│       ├── 002_add_profile_complete_fields.sql
│       ├── 003_family_accounts.sql
│       ├── 004_sadhana_tracker.sql  # Streaks, Points, and Badges Triggers
│       └── 005_admin_controls.sql   # Schedules RLS & secure admin rules
├── src/
│   ├── app/                   # App Router Pages & Global Layouts
│   │   ├── admin/             # Temple Admin Console
│   │   ├── complete-profile/  # Profile Onboarding Form
│   │   ├── dashboard/         # Devotee Vow Tracker & Portal
│   │   ├── donate/            # Donation & 80G Verification Desk
│   │   ├── events/            # Events Registry
│   │   ├── login/             # Google Sign-In Page
│   │   ├── profile-select/    # Family Member Selector (Member 1 / 2)
│   │   ├── panchang/          # Lunar Calendar & Choghadiyas
│   │   ├── layout.jsx         # Root Layout
│   │   └── page.jsx           # Main Landing Page
│   ├── components/            # Reusable Presentational UI Components
│   ├── context/               # React Context Providers
│   │   └── AuthContext.jsx    # Auth, Profile, and Active Session Provider
│   ├── hooks/                 # Custom React Hooks
│   │   └── useProfile.js      # Active Profile Helper Hook
│   ├── lib/                   # Config Clients & SDK Initializations
│   │   ├── supabase.js        # Supabase Client Singleton
│   │   └── auth-utils.js      # Onboarding Validation Helpers
│   └── services/              # Business Logic & Database Adapters
│       ├── db.js              # Database Access Service Layer
│       ├── profileService.js  # Supabase Profile Database Manager
│       └── translations.js    # English/Hindi Translation Dictionary
```

---

## 🚀 How to Run

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd jain-website-labriya-
   ```
2. Install the node dependencies:
   ```bash
   npm install
   ```

### Running Locally
1. Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```
2. Launch the local development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your web browser.

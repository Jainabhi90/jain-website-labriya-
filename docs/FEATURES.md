# Feature Specifications - Labriya Chaturmas Portal

This document lists the currently implemented features and outlines the specifications for future feature expansions of the **Labriya Chaturmas Portal**.

---

## 📱 Current Features

### 1. Home (`/`)
- **Spiritual Hero Image**: A high-resolution golden lotus and temple layout designed to establish a sacred tone.
- **Schedules Timeline**: Grouped morning and evening schedules (worship timelines, pravachans, aarti) updated dynamically. Includes styled empty states.
- **Countdown Clock**: Dynamic timer displaying days, hours, minutes, and seconds until the Chaturmas begins, built with client-side hydration protections.
- **Quick Links**: Visual grid navigation pointing to Panchang, Events, Donate, About, and the Devotee portal.

### 2. About (`/about`)
- **Temple Scrolls**: Detailed historical records of the Shree Labriya Jain Shwetambar Mandir.
- **Guru Lineage**: Sections highlighting Gurudev's history, publications, and mission statements.
- **Location Pin**: Directions, contact phone lines, and email coordinates.

### 3. Events (`/events`)
- **Event Catalog**: Visual listings of upcoming festivals, paryushans, and major pujas with date badges and location markers.
- **Direct Calendar Export**: One-click download of `.ics` files and pre-filled Google Calendar event generation.
- **Waitlist Notification Form**: A text form allowing devotees to register for alerts when seat reservations and accommodation bookings open.

### 4. Panchang (`/panchang`)
- **Dynamic Date Picker**: Defaults directly to the user's actual calendar date on load.
- **Auspicious Coordinates**: Daily sunrise, sunset, Paksha, month, and specific calendar events (e.g. Kalyanak dates).
- **Choghadiya Calculations**: Dynamically computes day Choghadiya intervals based on sunrise/sunset timings. Translates to Hindi.

### 5. Donate (`/donate`)
- **UPI QR Code Card**: Display of a realistic scan-to-pay QR graphic.
- **Bank Transfers**: Formatted lists of Bank Account Names, Account Numbers, and IFSC Codes.
- **Trust credentials**: Verified displays of PAN details, Trust Registration numbers, and Section 80G tax-exemption codes.
- **Donation Logging & Receipts**: A submission form to report transaction reference IDs and instantly download printable Section 80G tax vouchers.

### 6. Login (`/login`)
- **Sign-in Benefits Panel**: Desktop split-pane layout outlining Sadhana tracking, streak rewards, and tax receipt records.
- **OTP verification**: Simulated SMS code generation with master bypass credentials (`123456`) for demonstration.

### 7. User Dashboard (`/dashboard`)
- **Spiritual Progress Board**: Displays devotee profile statistics (current points, streaks, profile details).
- **Daily Sadhana Logging**: Interface to log daily fasts (Upvas, Ekasana), chanting, study, and volunteer work.

### 8. Admin Dashboard (`/admin`)
- **Operational Console**: Tabbed workspace for managing daily updates:
  - Edit daily morning/evening schedules.
  - Write and delete public announcements.
  - Update Panchang parameters for selected dates.
  - Review, verify, and approve transaction receipts.
  - Configure active Sadhana activities and export audits as CSV spreadsheets.

---

## 🔮 Future Features

### 1. Spiritual Badges
- **Goal**: Automatically reward devotees for spiritual accomplishments.
- **Criteria**: Grant badges like "First Upvas" (first logged fast), "Streak Vow" (10 consecutive logs), or "Dharma Seva" (20 hours of volunteer service).

### 2. Daily Streak Systems
- **Goal**: Encourage consistency in spiritual practices.
- **Criteria**: Automatically increment a devotee's active logging streak for consecutive daily updates, resetting to zero if a log is missed.

### 3. CSV Audits & Reports
- **Goal**: Allow temple administrators to audit spiritual logs.
- **Criteria**: Generate monthly reports showing averages, totals, and logs grouped by city for Guruji's review.

### 4. Push Notifications
- **Goal**: Send reminders for daily tasks.
- **Criteria**: Implement service worker notifications reminding devotees to submit their sadhana logs before sunset.

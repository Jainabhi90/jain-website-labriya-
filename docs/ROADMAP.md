# Development Roadmap - Labriya Chaturmas Portal

This document outlines the milestones, objectives, checklists, and estimated timelines for the phases of the **Labriya Chaturmas Portal** project.

---

## 📅 Roadmap Overview

| Phase | Title | Objective | Status |
|---|---|---|---|
| Phase 1 | Google Auth & Family Accounts | Implement single authentication provider and two-profile family limits | Completed |
| Phase 2 | Family Account Management | Support deletion, editing, mobile validation, and query-parameter-based entry modes | Completed |
| Phase 3 | Sadhana Tracker | Daily vow log sheet, streak triggers, and automatic badge unlocks | Completed |
| Phase 4 | Admin Portal & Polish | Fully operational dashboards, RLS policies, mobile navigation bars, and translations | Completed |
| Phase 5 | Profiles & Onboarding | Complete profile onboarding forms and selector checks | Completed |
| Phase 6 | Events Waitlist | Upcoming event waitlist query connections | Completed |
| Phase 7 | Announcements | Notice board updates & tag management | Completed |
| Phase 8 | Donations Audit | Transaction logging & 80G PDF receipt outputs | Completed |
| Phase 9 | Admin Dashboard | Tabbed panel query management & audits | Completed |
| Phase 10 | System Testing | RLS policy validation & multi-profile testing | Completed |
| Phase 11 | Deployment | Vercel production hosting configurations | Completed |

---

## 📋 Detailed Phases

### Phase 1: Google Auth & Family Accounts (Completed)
- **Objectives**: Convert the auth system into a production-ready setup by removing Phone OTP completely and implementing Google Sign-In as the single provider. Enforce a maximum of 2 family members per Google account. Redesign the user experience to use an inline animated registration form with no page-routing flashes or query parameter hooks.
- **Checklist**:
  - [x] Remove Phone OTP verification UI, logic, and timers.
  - [x] Integrate Google Sign-In with auto-redirect options.
  - [x] Enforce family account maximum limits (up to 2).
  - [x] Implement inline animated Framer Motion transitions in the profile selector.

### Phase 2: Family Account Management (Completed)
- **Objectives**: Support editing devotee profile fields (including phone numbers with validations), deleting secondary profiles with confirmation modals, and handling direct `?add=true` navigation parameters.
- **Checklist**:
  - [x] Auto-display registration form if URL contains `?add=true`.
  - [x] Support profile edits for Name, City, Phone, and Avatar presets, guarding against invalid mobile formats and database duplicate conflicts.
  - [x] Support deleting secondary profiles only (member_number = 2), protected by confirmation dialogs.
  - [x] Automatically switch context active profiles to primary devotee profile upon secondary member deletion.

### Phase 3: Sadhana Tracker (Completed)
- **Objectives**: Implement a completely database-driven devotee daily activity vow log system, with PL/pgSQL database trigger functions for points summation, consecutive check-in streaks calculation, and automated milestone badges unlocks.
- **Checklist**:
  - [x] Fetch active spiritual activities dynamically from `activities` table.
  - [x] Batch insert daily check-in routines into `user_activities` (storing profile_id, activity_id, and date).
  - [x] Prevent editing of logs that have already been Approved.
  - [x] Calculate devotee total points dynamically on the server from approved check-ins only.
  - [x] Recalculate devotee streaks (current, longest, last activity date) automatically via a Gaps & Islands server algorithm.
  - [x] Automatically unlock digital milestone badges inside `profile_badges` through PostgreSQL triggers.
  - [x] Add a detailed statistics dashboard grid displaying streaks, submissions, rates, and today's status.

### Phase 4: Admin Portal, Localization, Mobile Optimization & Polish (Completed)
- **Objectives**: Build fully operational administrative dashboards with real-time analytics, check-in log approvals, profile editors, schedules creators, and bank settings consoles. Move mobile language switcher switches to a sticky top navigation bar to prevent layout overlaps. Add translation frameworks and secure RLS controls on tables.
- **Checklist**:
  - [x] Replace all mock datasets in admin portal with live queries (analytics, logs, approvals, settings).
  - [x] Add CRUD operations for timetables, announcements, events, and devotee accounts.
  - [x] Implement confirmation dialogs for profile deletions, timetable removals, and notice deletions.
  - [x] Add mobile sticky top navigation bar and migrate the globe language switcher inside it.
  - [x] Set up translation structures supporting multilingual fallbacks (English, Hindi, and extensible schemas).
  - [x] Enable RLS and add strict policies on the `schedules` table (`005_admin_controls.sql`).
  - [x] Verify production builds pack successfully with zero linter errors/warnings.

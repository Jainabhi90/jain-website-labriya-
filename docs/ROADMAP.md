# Development Roadmap - Labriya Chaturmas Portal

This document outlines the milestones, objectives, checklists, and estimated timelines for the phases of the **Labriya Chaturmas Portal** project.

---

## 📅 Roadmap Overview

| Phase | Title | Objective | Status |
|---|---|---|---|
| Phase 1 | Google Auth & Family Accounts | Implement single authentication provider and two-profile family limits | Completed |
| Phase 2 | Family Account Management | Support deletion, editing, mobile validation, and query-parameter-based entry modes | Completed |
| Phase 3 | Sadhana Tracker | Daily vow log sheet, streak triggers, and automatic badge unlocks | Completed |
| Phase 4 | Database Design | Schema updates, constraints, triggers, and migrations | Completed |
| Phase 5 | Profiles & Selection | Profile select screen, onboarding logic, active state context | Completed |
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
- **Deliverables**: Updated [login/page.jsx](file:///src/app/login/page.jsx), [AuthContext.jsx](file:///src/context/AuthContext.jsx), [useProfile.js](file:///src/hooks/useProfile.js).
- **Checklist**:
  - [x] Remove Phone OTP verification UI, logic, and timers.
  - [x] Integrate Google Sign-In with auto-redirect options.
  - [x] Enforce family account maximum limits (up to 2).
  - [x] Implement inline animated Framer Motion transitions in the profile selector.

### Phase 2: Family Account Management (Completed)
- **Objectives**: Support editing devotee profile fields (including phone numbers with validations), deleting secondary profiles with confirmation modals, and handling direct `?add=true` navigation parameters.
- **Deliverables**: Updated [profile-select/page.jsx](file:///src/app/profile-select/page.jsx), [dashboard/page.jsx](file:///src/app/dashboard/page.jsx), and [profileService.js](file:///src/services/profileService.js).
- **Checklist**:
  - [x] Auto-display registration form if URL contains `?add=true`.
  - [x] Support profile edits for Name, City, Phone, and Avatar presets, guarding against invalid mobile formats and database duplicate conflicts.
  - [x] Support deleting secondary profiles only (member_number = 2), protected by confirmation dialogs.
  - [x] Automatically switch context active profiles to primary devotee profile upon secondary member deletion.

### Phase 3: Sadhana Tracker (Completed)
- **Objectives**: Implement a completely database-driven devotee daily activity vow log system, with PL/pgSQL database trigger functions for points summation, consecutive check-in streaks calculation, and automated milestone badges unlocks.
- **Deliverables**: Updated [db.js](file:///src/services/db.js), [dashboard/page.jsx](file:///src/app/dashboard/page.jsx), and migration [004_sadhana_tracker.sql](file:///supabase/migrations/004_sadhana_tracker.sql).
- **Checklist**:
  - [x] Fetch active spiritual activities dynamically from `activities` table.
  - [x] Batch insert daily check-in routines into `user_activities` (storing profile_id, activity_id, and date).
  - [x] Prevent editing of logs that have already been Approved.
  - [x] Calculate devotee total points dynamically on the server from approved check-ins only.
  - [x] Recalculate devotee streaks (current, longest, last activity date) automatically via a Gaps & Islands server algorithm.
  - [x] Automatically unlock digital milestone badges inside `profile_badges` through PostgreSQL triggers.
  - [x] Add a detailed statistics dashboard grid displaying streaks, submissions, rates, and today's status.

### Phase 4: Database Design (Completed)
- **Objectives**: Set up SQL schemas, table keys, security policies, and indexes on Supabase.
- **Deliverables**: [001_initial_schema.sql](file:///supabase/migrations/001_initial_schema.sql), [002_add_profile_complete_fields.sql](file:///supabase/migrations/002_add_profile_complete_fields.sql), and [003_family_accounts.sql](file:///supabase/migrations/003_family_accounts.sql).
- **Checklist**:
  - [x] Decouple profiles from auth.users primary key.
  - [x] Implement check constraints (`member_number IN (1, 2)`) and unique index (`UNIQUE(user_id, member_number)`).
  - [x] Implement partial unique index `unique_active_mobile` for phone number validations across devotees.
  - [x] Create helper `public.is_admin()` function and enable RLS policies.

### Phase 5: Profiles & Selection (Completed)
- **Objectives**: Support choosing family member profiles on login and adding secondary members dynamically.
- **Deliverables**: [profile-select/page.jsx](file:///src/app/profile-select/page.jsx), [complete-profile/page.jsx](file:///src/app/complete-profile/page.jsx), and [profileService.js](file:///src/services/profileService.js).
- **Checklist**:
  - [x] Automatically direct users to dashboard if only 1 profile exists.
  - [x] Show selection screen if two profiles exist, allowing profile switching.
  - [x] Expose "Add Family Member" buttons on the dashboard when a user only has one profile.

### Phase 6: Events Waitlist (Completed)
- **Objectives**: Populate upcoming events list from database tables and manage subscriber waitlists.
- **Deliverables**: Events query integrations.
- **Checklist**:
  - [x] Connect `/events` page to read from the `events` table.
  - [x] Set up waitlist subscriptions database inserts.

### Phase 7: Announcements (Completed)
- **Objectives**: Connect the notices feed directly to Supabase.
- **Deliverables**: Announcements list with priority tagging (Notices vs Program updates).
- **Checklist**:
  - [x] Connect homepage announcements to database.
  - [x] Set up priority tag colors.

### Phase 8: Donations Audit (Completed)
- **Objectives**: Process and store transaction logs for Section 80G tax receipts.
- **Deliverables**: Verification adapter.
- **Checklist**:
  - [x] Query receipts based on active profile phone/mobile numbers.
  - [x] Support 80G print vouchers.

### Phase 9: Admin Dashboard (Completed)
- **Objectives**: Maintain temple configurations, panchang schedules, and verify donations.
- **Deliverables**: Admin Console tab queries.
- **Checklist**:
  - [x] Connect schedule, panchang, events, and notices creators.
  - [x] Set up donation audit desk verification actions.

### Phase 10: System Testing (Completed)
- **Objectives**: Verify security clearance and responsive boundaries.
- **Deliverables**: Compile audits.
- **Checklist**:
  - [x] Validate RLS filters.
  - [x] Verify production builds pack successfully with zero warnings/errors.

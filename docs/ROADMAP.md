# Development Roadmap - Labriya Chaturmas Portal

This document outlines the milestones, objectives, checklists, and estimated timelines for the phases of the **Labriya Chaturmas Portal** project.

---

## 📅 Roadmap Overview

| Phase | Title | Objective | Status |
|---|---|---|---|
| Phase 1 | Google Auth & Family Accounts | Implement single authentication provider and two-profile family limits with inline animated UX | Completed |
| Phase 2 | Database Design | Schema updates, constraints, triggers, and migrations | Completed |
| Phase 3 | Profiles & Selection | Profile select screen, onboarding logic, active state context | Completed |
| Phase 4 | Sadhana Tracker | Daily vow log sheet & tally tables | Completed |
| Phase 5 | Events Waitlist | Upcoming event waitlist query connections | Completed |
| Phase 6 | Announcements | Notice board updates & tag management | Completed |
| Phase 7 | Donations Audit | Transaction logging & 80G PDF receipt outputs | Completed |
| Phase 8 | Admin Dashboard | Tabbed panel query management & audits | Completed |
| Phase 9 | System Testing | RLS policy validation & multi-profile testing | Completed |
| Phase 10 | Deployment | Vercel production hosting configurations | Completed |

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

### Phase 2: Database Design (Completed)
- **Objectives**: Set up SQL schemas, table keys, security policies, and indexes on Supabase.
- **Deliverables**: [001_initial_schema.sql](file:///supabase/migrations/001_initial_schema.sql), [002_add_profile_complete_fields.sql](file:///supabase/migrations/002_add_profile_complete_fields.sql), and [003_family_accounts.sql](file:///supabase/migrations/003_family_accounts.sql).
- **Checklist**:
  - [x] Decouple profiles from auth.users primary key.
  - [x] Implement check constraints (`member_number IN (1, 2)`) and unique index (`UNIQUE(user_id, member_number)`).
  - [x] Implement partial unique index `unique_active_mobile` for phone number validations across devotees.
  - [x] Create helper `public.is_admin()` function and enable RLS policies.

### Phase 3: Profiles & Selection (Completed)
- **Objectives**: Support choosing family member profiles on login and adding secondary members dynamically.
- **Deliverables**: [profile-select/page.jsx](file:///src/app/profile-select/page.jsx), [complete-profile/page.jsx](file:///src/app/complete-profile/page.jsx), and [profileService.js](file:///src/services/profileService.js).
- **Checklist**:
  - [x] Automatically direct users to dashboard if only 1 profile exists.
  - [x] Show selection screen if two profiles exist, allowing profile switching.
  - [x] Expose "Add Family Member" buttons on the dashboard when a user only has one profile.

### Phase 4: Sadhana Tracker (Completed)
- **Objectives**: Build daily logging tables and tally points for completed vows.
- **Deliverables**: Dashboard daily checks adapter updated to use profile IDs instead of user IDs.
- **Checklist**:
  - [x] Submit vows utilizing profile UUID as the principal identifier.
  - [x] Read check-ins and streaks metrics from specific profile objects.
  - [x] Update devotee points and badges per member.

### Phase 5: Events Waitlist (Completed)
- **Objectives**: Populate upcoming events list from database tables and manage subscriber waitlists.
- **Deliverables**: Events query integrations.
- **Checklist**:
  - [x] Connect `/events` page to read from the `events` table.
  - [x] Set up waitlist subscriptions database inserts.

### Phase 6: Announcements (Completed)
- **Objectives**: Connect the notices feed directly to Supabase.
- **Deliverables**: Announcements list with priority tagging (Notices vs Program updates).
- **Checklist**:
  - [x] Connect homepage announcements to database.
  - [x] Set up priority tag colors.

### Phase 7: Donations Audit (Completed)
- **Objectives**: Process and store transaction logs for Section 80G tax receipts.
- **Deliverables**: Verification adapter.
- **Checklist**:
  - [x] Query receipts based on active profile phone/mobile numbers.
  - [x] Support 80G print vouchers.

### Phase 8: Admin Dashboard (Completed)
- **Objectives**: Maintain temple configurations, panchang schedules, and verify donations.
- **Deliverables**: Admin Console tab queries.
- **Checklist**:
  - [x] Connect schedule, panchang, events, and notices creators.
  - [x] Set up donation audit desk verification actions.

### Phase 9: System Testing (Completed)
- **Objectives**: Verify security clearance and responsive boundaries.
- **Deliverables**: Compile audits.
- **Checklist**:
  - [x] Validate RLS filters.
  - [x] Verify production builds pack successfully with zero warnings/errors.

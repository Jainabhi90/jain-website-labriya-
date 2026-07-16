# Changelog - Labriya Chaturmas Portal

All notable changes to the **Labriya Chaturmas Portal** project will be documented in this file. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.0] - 2026-07-16

### Added
- **Unified Mobile Sticky Headers**: Introduced a sticky mobile top navigation bar containing the temple brand and language switch toggle🌐. This prevents layout overlaps with the bottom navigation panel.
- **Admin Dashboards Consolidation**: Implemented full CRUD dashboards inside the secure Admin Console for devotee accounts, check-in logs approvals, temple configurations settings, schedules, announcements, panchang, events, and donation receipts.
- **Worship Timetable CRUD**: Extended the schedules editor to support adding new activities and deleting existing timetable rows with confirmation popups.
- **Devotee Approvals System**: Added list verification desks allowing administrators to approve or reject devotee daily check-ins, linking directly to the devotees' approved points.
- **Schedules RLS Policies**: Added the migration script `005_admin_controls.sql` enabling RLS on schedules and mapping SELECT/manage rules to verified admins.

### Fixed
- **Mobile Overlaps**: Resolved bottom navigation overlaps on smaller viewports (320px - 430px) by removing floating buttons and restructuring mobile layouts.
- **Admin Panel Mock Decoupling**: Connected all administrative actions (approvals, config adjustments, notices posting, event creators) directly to Supabase PostgREST endpoints.

---

## [1.2.0] - 2026-07-16

### Added
- **Database-Driven Activities**: Replaced the local mock arrays with live queries to the `activities` table on Supabase, ordering them by display weight.
- **Transactional Log Submissions**: Connected daily vow check-ins to perform bulk writes to the `user_activities` table.
- **Approved Status Check Lockout**: Added lockout checks on check-ins editing. If any entry for a date is Approved by the admin, the devotee is blocked from modifying that date.
- **Server-Side Streak Calculations**: Added the migration script `004_sadhana_tracker.sql` containing a gaps-and-islands algorithm in PL/pgSQL to compute consecutive active devotee streaks on row mutations.
- **Server-Side Points Accumulation**: Configured database trigger to aggregate `total_points` on profiles from approved check-ins only.
- **Automated Milestone Badge Awards**: Created `profile_badges` table and configured PostgreSQL trigger evaluating devotee points/streaks updates to automatically unlock milestone achievements.
- **Statistics Overview Grid**: Rendered a detailed statistics grid in the check-in panel displaying current streaks, longest streaks, total submissions, Chaturmas completion percentage, and today's completion status.

### Fixed
- **Unused Variable Warnings**: Removed `insertedCount` variable from the db controller layer to achieve a clean compilation build.

---

## [1.1.0] - 2026-07-16

### Added
- **Profile Deletion Flow**: Implemented profile deletion API (`profileService.deleteSecondaryProfile`) restricted strictly to the secondary profile (member number 2). Added a trash bin button on the card layout that triggers a confirmation modal dialog before confirming deletion.
- **Switch Profile Fallback**: Configured deletion logic to fallback the context active profile to the primary devotee profile (`member_number = 1`) immediately after secondary member deletion.
- **Devotee Phone Updating**: Added a Mobile Number input to the edit devotee settings panel, mapping values cleanly between camelCase properties and snake_case PostgreSQL schema columns.
- **Direct Add Navigation Checks**: Added mount parameters verification inside `/profile-select` checking for `?add=true` to automatically pop up the devotee creation form on direct navigation from the dashboard.

### Removed
- **Query Parameter Redundant Checks**: Deleted duplicate layout redirects, routing devotee selects cleanly.

### Fixed
- **Mobile Prefix Norms**: Patched state sets to strip the country code (`+91`) during form fields hydration, ensuring that the 10-digit format validators parse length cleanly without leaking prefix offsets.

---

## [1.0.0] - 2026-07-16

### Added
- **Google Sign-In integration**: Connected authentication context and pages with Google OAuth provider.
- **Family Account System**: Decoupled devotee profiles from authentication user primary keys, allowing up to 2 family members (profiles) per Google account.
- **Dynamic Profile Selector**: Created the profile selector screen `/profile-select`, supporting active profile switching, fallback recovery list fetches, and secondary profile creation.
- **Dynamic Dashboard Header buttons**: Configured header buttons to dynamically render "Add Family Member" (for single-profile accounts) or "Switch Profile" (for two-profile accounts).
- **Database Constraints Migration**: Created database migration `003_family_accounts.sql` introducing `user_id` and `member_number` constraints (1 or 2 check limits, uniqueness rules) and security helper `is_admin()`.
- **Database Row-Level Security Policies**: Added INSERT, SELECT, and UPDATE policies supporting secure profile management for multiple profiles.
- **Partial Unique Mobile Index**: Integrated `unique_active_mobile` partial index on `mobile` columns where values are not null/empty to enforce phone number uniqueness database-wide.

### Removed
- **Phone OTP SMS authentication**: Deleted SMS forms, timers, inputs, context triggers, and configuration variables completely.

---

## [0.1.0] - 2026-07-12

### Added
- **Project Initialized**: Set up the Next.js 15 template using the App Router.
- **Supabase Connected**: Created the SDK initialization module in [src/lib/supabase.js](file:///src/lib/supabase.js) using environment variables.
- **Engineering Documentation**: Created the standard repository manuals:
  - `README.md` for project introduction and instructions.
  - `ARCHITECTURE.md` detailing high-level diagrams, layout choices, and standards.
  - `DATABASE.md` mapping schema configurations, foreign keys, and RLS tables.
  - `FEATURES.md` outlining functional blocks.
  - `ROADMAP.md` setting up 12 development milestones.
  - `API.md` defining HTTP REST queries.
  - `CONTRIBUTING.md` setting branch, coding, and pull request guidelines.

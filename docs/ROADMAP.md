# Development Roadmap - Labriya Chaturmas Portal

This document outlines the milestones, objectives, checklists, and estimated timelines for the 12 phases of the **Labriya Chaturmas Portal** project.

---

## 📅 Roadmap Overview

| Phase | Title | Objective | Estimated Time |
|---|---|---|---|
| Phase 1 | Frontend | UI & Layout Implementation | Completed |
| Phase 2 | Supabase Integration | SDK & Environment Configuration | Completed |
| Phase 3 | Database Design | Schema definitions & relations | 2 Days |
| Phase 4 | Authentication | OTP flow & auth session management | 2 Days |
| Phase 5 | Profiles | Syncing auth accounts with database profiles | 1 Day |
| Phase 6 | Sadhana Tracker | Daily vow log sheet & tally tables | 3 Days |
| Phase 7 | Events | Upcoming event waitlist query connections | 1 Day |
| Phase 8 | Announcements | Notice board updates & tag management | 1 Day |
| Phase 9 | Donations | Transaction logging & 80G PDF receipt outputs | 3 Days |
| Phase 10 | Admin Dashboard | Tabbed panel query management & audits | 3 Days |
| Phase 11 | Testing | System tests & database security audits | 2 Days |
| Phase 12 | Deployment | Vercel production hosting configurations | 1 Day |

---

## 📋 Detailed Phases

### Phase 1: Frontend (Completed)
- **Objectives**: Build a responsive user interface with localized translation toggles and spiritual theme patterns.
- **Deliverables**: Pages (`/`, `/about`, `/events`, `/panchang`, `/donate`, `/login`, `/dashboard`, `/admin`).
- **Checklist**:
  - [x] Create layout grids and bottom navigation bar.
  - [x] Implement local translation helper.
  - [x] Create hydration-safe countdown and date calendars.

### Phase 2: Supabase Integration (Completed)
- **Objectives**: Establish direct SDK credentials connecting the client application to Supabase.
- **Deliverables**: [supabase.js](file:///src/lib/supabase.js) initialization.
- **Checklist**:
  - [x] Install `@supabase/supabase-js`.
  - [x] Map environment keys in `.env.local`.
  - [x] Export reusable singleton client.

### Phase 3: Database Design
- **Objectives**: Set up SQL schemas, table keys, and relationships on Supabase.
- **Deliverables**: Schema migrations.
- **Checklist**:
  - [ ] Write schema tables (`profiles`, `schedules`, `announcements`, `events`, `subscriptions`, `donations`, `sadhana_activities`, `sadhana_logs`).
  - [ ] Set up foreign key constraints.
  - [ ] Configure PostgreSQL indexes.

### Phase 4: Authentication
- **Objectives**: Implement OTP mobile sign-in flows.
- **Deliverables**: Auth adapters and verified login screens.
- **Checklist**:
  - [ ] Configure Supabase Auth settings.
  - [ ] Connect OTP request triggers to SMS providers (or verification bypass codes).
  - [ ] Add session redirect rules to protect the dashboard routes.

### Phase 5: Profiles
- **Objectives**: Create a database record in the `profiles` table automatically when a user registers.
- **Deliverables**: Database trigger function.
- **Checklist**:
  - [ ] Create a PostgreSQL function to initialize user profiles.
  - [ ] Define user profiles RLS policies.

### Phase 6: Sadhana Tracker
- **Objectives**: Build daily logging tables and tally points for completed vows.
- **Deliverables**: Sadhana adapters.
- **Checklist**:
  - [ ] Set up user validation checks for daily sadhana submissions.
  - [ ] Connect dashboard pages to read log tables from Supabase.
  - [ ] Calculate points totals dynamically.

### Phase 7: Events
- **Objectives**: Populate upcoming events list from database tables instead of local mocks.
- **Deliverables**: Database-linked events feed.
- **Checklist**:
  - [ ] Connect `/events` page to read from the `events` table.
  - [ ] Set up waitlist subscriptions database inserts.

### Phase 8: Announcements
- **Objectives**: Connect the landing page updates feed directly to the database.
- **Deliverables**: Dynamic notices feed.
- **Checklist**:
  - [ ] Connect homepage announcements list to query the database.
  - [ ] Add tags filters (e.g. Notices vs Operational updates).

### Phase 9: Donations
- **Objectives**: Process and store transaction logs.
- **Deliverables**: Transaction validation adapter.
- **Checklist**:
  - [ ] Store donation logs (`donor_name`, `phone`, `amount`, `txn_id`).
  - [ ] Connect tax receipt downloads to display verified transactional details.

### Phase 10: Admin Dashboard
- **Objectives**: Build data management tables for administrators.
- **Deliverables**: Tabbed console queries.
- **Checklist**:
  - [ ] Connect admin table lists to read and update schedules, events, and announcements.
  - [ ] Set up donation audit validation actions.
  - [ ] Export reports as CSV spreadsheets.

### Phase 11: Testing
- **Objectives**: Run end-to-end user validations.
- **Deliverables**: Test reports.
- **Checklist**:
  - [ ] Verify Row-Level Security policies.
  - [ ] Run cross-browser responsiveness tests.

### Phase 12: Deployment
- **Objectives**: Release the application to production hosting.
- **Deliverables**: Live production deployment.
- **Checklist**:
  - [ ] Link Vercel project to production repository branch.
  - [ ] Setup production database backups.
  - [ ] Run final build compiler checks.

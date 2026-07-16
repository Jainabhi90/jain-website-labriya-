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
| Phase 4b | Final Production Hardening & QA | Code sweeping, linter resolving, console logs purge, and admin localization | Completed |
| Phase 4.1 | Database Synchronization & RLS Fixes | Synchronize client-side table models and schemas, create corrective SQL migrations | Completed |

---

## 📋 Detailed Phases

### Phase 1: Google Auth & Family Accounts (Completed)
- **Objectives**: Convert the auth system into a production-ready setup by removing Phone OTP completely and implementing Google Sign-In as the single provider. Enforce a maximum of 2 family members per Google account. Redesign the user experience to use an inline animated registration form with no page-routing flashes or query parameter hooks.

### Phase 2: Family Account Management (Completed)
- **Objectives**: Support editing devotee profile fields (including phone numbers with validations), deleting secondary profiles with confirmation modals, and handling direct `?add=true` navigation parameters.

### Phase 3: Sadhana Tracker (Completed)
- **Objectives**: Implement a completely database-driven devotee daily activity vow log system, with PL/pgSQL database trigger functions for points summation, consecutive check-in streaks calculation, and automated milestone badges unlocks.

### Phase 4: Admin Portal, Localization, Mobile Optimization & Polish (Completed)
- **Objectives**: Build fully operational administrative dashboards with real-time analytics, check-in log approvals, profile editors, schedules creators, and bank settings consoles. Move mobile language switcher switches to a sticky top navigation bar to prevent layout overlaps. Add translation frameworks and secure RLS controls on tables.

### Phase 4b: Final Production Hardening & QA (Completed)
- **Objectives**: Final code quality sweep and QA testing. Purge all debugging console logs, warnings, and unnecessary logging blocks. Translate the entire administration console dynamically to support English and Hindi languages. Conduct performance builds and linter runs to guarantee zero runtime and compilation errors.

### Phase 4.1: Database Synchronization & RLS Fixes (Completed)
- **Objectives**: Correct schema mismatches. Define missing schemas for `schedules`, `donations`, and `subscriptions` in corrective migrations. Correct the mismatch between the `panchang` and `daily_panchang` tables. Define secure, comprehensive RLS policies allowing authenticated users to create family members and delete secondary profiles without encountering access violations.

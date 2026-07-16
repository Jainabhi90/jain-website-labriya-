# Changelog - Labriya Chaturmas Portal

All notable changes to the **Labriya Chaturmas Portal** project will be documented in this file. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

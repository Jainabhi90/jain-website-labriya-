# Changelog - Labriya Chaturmas Portal

All notable changes to the **Labriya Chaturmas Portal** project will be documented in this file. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

### Fixed & Refactored (UX Redesign)
- **Inline Card Transformation UX**: Replaced the URL parameter-based `?add=true` workflow with a high-fidelity inline card transformation. When selected, the "Add Family Member" card smoothly morphs into the registration form via spring animations without moving the primary card or performing route/page changes.
- **Client Duplicate Phone Guard**: Added local checks to immediately alert if the user attempts to reuse a phone number already registered to their family account.
- **Simplified Selection Routing**: Deleted URL `searchParams` parsing, state handlers (`isAddMode`), and redundant dashboard redirects from the selection layout, making the component lightweight.

# Feature Specifications - Labriya Chaturmas Portal

This document catalogs the screens, components, user flows, and business rules implemented in the **Labriya Chaturmas Portal**.

---

## 🎛️ Active Feature Catalog

### 1. Unified Authentication System
- **Provider**: Google OAuth Sign-In.
- **Rules**:
  - Automatically provisions a primary devotee profile (`member_number = 1`) on first signup.
  - Limits each Google account to a maximum of 2 devotee profiles.
  - Automatically routes single-profile accounts to `/dashboard` and multi-profile accounts to `/profile-select`.

### 2. Devotee Profile Selection & Management
- **Profile Selector Screen**:
  - Displays the primary member and a secondary slot.
  - Dashed card slot turns into an inline animated registration form to add a family member, avoiding routing flashes or parameter dependencies.
  - Supports loading registration forms directly when routed via `?add=true`.
  - Supports deleting secondary members (`member_number = 2`) via trash indicators and confirmation dialogs.
  - Supports switching devotee profiles securely.
- **Devotee Settings Panel**:
  - Allows editing Name, Residence City, and Avatar presets.
  - Supports adding/modifying Mobile Numbers with 10-digit format validators and database phone conflicts detection.

### 3. Sadhana Daily Check-in & Logs Tracker
- **Target Date Checklist**:
  - Devotees pick a calendar date (defaulting to today's local date) and select check boxes representing completed spiritual vows.
  - Submitting saves rows directly into the database.
  - Existing check-ins are loaded automatically upon date changes.
  - Devotees can edit their logged activities at any time while the logs are in `'Pending'` status.
  - If any logged activity is Approved by administrators, the form lock checks trigger and prevent modifications.
- **Devotee Statistics Grid**:
  - Displays a visual layout of metrics:
    - **Current Streak**: Consecutively checked days starting from today/yesterday.
    - **Longest Streak**: Devotee's absolute longest streak on record.
    - **Total Points**: Sum of points from approved routines.
    - **Submissions**: Total days devotee logged vows.
    - **Completion Rate**: Rate calculated out of the 120-day Chaturmas period.
    - **Today's Status**: Highlights whether today's vows check-in is complete.

### 4. Automated Badges Achievements
- **Badges Tab**:
  - Unlocked milestones are highlighted using dynamic badges synced from the server.
  - Locked milestones appear translucent.
  - **Milestones**:
    - **First Check-in**: Awarded on the devotee's first daily log submission.
    - **7 Day Streak**: Awarded when devotee achieves a consecutive streak of 7 days.
    - **30 Day Streak**: Awarded when devotee achieves a consecutive streak of 30 days.
    - **100 Points Milestone**: Awarded when devotee's approved points total reaches 100.
    - **Volunteer Seva**: Awarded when devotee completes at least one Approved activity under the `'Seva'` category.

### 5. Historic Sadhana Timeline
- **Summary Cards**: Displays Days Active, Most Performed activity, and total monthly points.
- **Log Table**: Chronological table showing completed activities on each date and points earned.

### 6. Noticeboards & Announcements
- **Feed**: Located on homepage and dashboard sidebar showing priority cards (General Notice vs Program Updates).

### 7. Chaturmas Event Registry
- **Schedule**: Displays upcoming assemblies and dates.
- **ICS Calendar export**: Allows downloading event coordinates directly to Apple, Google, or Outlook calendars.

### 8. Direct Tax-Exempt Donations Desk
- **Filing Form**: Collects amount, transaction ID, and phone number.
- **Verification Desk**: Devotees enter their registered phone number to pull up verified receipts.
- **Voucher Printer**: Outputs 80G tax receipt PDFs.

### 9. Temple Administrative Console
A secure panel (protected by RLS and Google OAuth checks) allowing temple administrators to oversee operations:
-   **Analytics Dashboard**: Displays real-time metrics for total devotee profiles, points logs, audit tallies, and Section 80G donations value.
-   **Check-in Approvals Panel**: Allows the admin to approve or reject devotee daily sadhana vow checklists. Points only credit upon log approval. Includes a bulk "Approve All Pending" command.
-   **Devotee Accounts Viewer**: Lists all registered devotees, streaks, and points, with profile deletion commands (member 2) and filters.
-   **Worship Timetable Editor**: Full CRUD (Create, Read, Update, Delete) dashboard to add, reorder, modify, or delete morning and evening schedules.
-   **Notices & Bulletins**: Interface to publish or de-activate notice feeds.
-   **Panchang Manager**: Form fields to modify daily Tithi metadata, paksha, sunrise/sunset, and fast recommendations.
-   **Event Organizer**: Tool to launch spiritual events and view devotee waitlists.
-   **Donation Audit Desk**: Approves filed UPI transfer transaction IDs to verify receipts.
-   **Sadhana Vows Configurator**: Interface to configure point values (weights) and categories for spiritual vows, with devotee CSV reports downloader.
-   **Settings Console**: Panel to modify bank credentials, contact details, and address configurations.

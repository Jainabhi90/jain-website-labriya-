# System Architecture - Labriya Chaturmas Portal

This document outlines the architectural blueprints, high-level design decisions, security configurations, and deployment strategies for the **Labriya Chaturmas Portal**.

---

## 🗺️ High-Level System Diagram

```mermaid
graph TD
    %% Devotee & Admin Actors
    devotee[Devotee Client Browser]
    admin[Admin Client Browser]

    %% Next.js Frontend Framework
    subgraph Frontend [Next.js 15 Application - Client-Side App Router]
        nav[Navigation Bar / Mobile Bottom Nav]
        home[Homepage & Schedules]
        panch[Panchang Calendar]
        evt[Events Registry & ICS Export]
        don[Donation & Receipt Form]
        profSelect[Profile Selection / Member 1 vs 2]
        completeProf[Complete Profile Onboarding]
        dbd[Devotee Dashboard / Sadhana Vows]
        adm[Admin Management Console]
        translation[Client-Side Hindi/English Dictionary]
    end

    %% SDK Singleton
    lib[Supabase SDK Singleton: src/lib/supabase.js]
    dbService[Database Service Adapter: src/services/db.js]
    profileService[Profile Service Adapter: src/services/profileService.js]

    %% Supabase Backend Platform
    subgraph Backend [Supabase Backend Platform]
        auth[GoTrue Auth Service - Google Sign-In]
        postgrest[PostgREST Database API Gateway]
        storage[Storage Buckets - Public Image CDN]
    end

    %% Database Engine
    subgraph Database [PostgreSQL Database Engine]
        tables[(Relational Tables)]
        rls[Row-Level Security Policies]
        triggers[PL/pgSQL Trigger Engine]
    end

    %% Connections
    devotee --> nav
    admin --> nav
    nav --> home
    nav --> panch
    nav --> evt
    nav --> don
    nav --> profSelect
    nav --> completeProf
    nav --> dbd
    nav --> adm

    home & panch & evt & don & dbd & adm --> translation
    home & panch & evt & don & dbd & adm & profSelect & completeProf --> dbService
    profSelect & completeProf & dbd --> profileService
    dbService & profileService --> lib
    lib --> auth
    lib --> postgrest

    auth --> tables
    postgrest --> rls
    rls --> tables
    storage --> tables
    tables --> triggers
```

---

## 🏛️ System Core Components

### 1. Frontend Architecture
The portal utilizes **Next.js 15 App Router** for static rendering and client-side page hydration:
- **Routing**: Static paths are pre-rendered on the server to optimize loading speeds. Redirection checks intercept route changes inside `/dashboard` and `/admin` to enforce authentication and active profile resolution.
- **Client Hydration**: Dynamic components (like countdown timers and panchang pickers) are protected against hydration mismatches using state hooks.
- **Localization**: Localized translations are stored client-side in [translations.js](file:///src/services/translations.js) and synced via global event listeners.
- **Micro-Animations**: Framer Motion handles transition and layout animations. In the profile selector, card slots utilize spring layouts to transform smoothly into registration forms inline without layout flashes or route changes.

### 2. Backend Architecture
The backend is serverless, relying on the **Supabase platform** to expose CRUD database operations:
- **Client Wrapper**: A single instantiated Supabase SDK client ([supabase.js](file:///src/lib/supabase.js)) manages network sessions.
- **API Gateway**: PostgREST maps all database schemas directly to HTTP query routes, removing the need for intermediary API controllers.
- **Authentication**: Managed via Google Sign-In OAuth. Phone SMS OTP authentication is completely removed.

### 3. Database Engine
The database is a managed **PostgreSQL** instance:
- **Relational Integrity**: Foreign key constraints enforce data consistency between tables. Vow logs, events, and announcements reference profile UUIDs in the `profiles` table.
- **Security Control**: Row-Level Security (RLS) is enabled globally. Policies restrict users from accessing or modifying profiles owned by other user accounts.
- **Triggers & Functions**: Server-side calculations run on database triggers for automatic points tallying, gaps-and-islands streak counters, and profile badge allocations.

---

## 🔄 Core Data Flows

### 1. Devotee Login & Profile Selection Flow
```mermaid
sequenceDiagram
    participant D as Devotee Client
    participant Auth as Supabase Auth (Google)
    participant PS as Profile Service Layer
    participant DB as Profiles Table

    D->>Auth: Initiate Google Sign-In
    Auth->>D: Return Auth Session
    D->>PS: getUserProfiles(userId)
    PS->>DB: Query profiles where user_id = auth_uid
    DB->>PS: Return list of 1 or 2 profiles
    alt Redirect from Layout (No profile selected yet)
        alt 1 Profile Exists
            PS->>D: Automatically select profile, write to localStorage & redirect to Dashboard
        else 2 Profiles Exist
            PS->>D: Redirect to /profile-select
            D->>PS: User selects profile 1 or 2
            PS->>D: Save choice to localStorage & redirect to Dashboard
        end
    else Direct Navigation (Switching profiles)
        PS->>D: Render selection view (Primary Profile + Switch or Add secondary)
    end
```

### 2. Secondary Profile Deletion Flow
```mermaid
sequenceDiagram
    participant D as Devotee Client
    participant Context as AuthContext
    participant PS as Profile Service Layer
    participant DB as Profiles Table

    D->>Context: deleteSecondaryProfile(profileId)
    Context->>PS: deleteSecondaryProfile(profileId)
    PS->>DB: DELETE FROM profiles WHERE id = profileId AND member_number = 2
    DB->>PS: Complete deletion (Cascade user_activities entries)
    PS->>Context: Success callback
    Context->>Context: Fallback active selection to Primary Profile (member_number = 1)
    Context->>D: Refresh profilesList state, update UI selector
```

### 3. Devotee Vow Log Flow
```mermaid
sequenceDiagram
    participant D as Devotee Client
    participant DS as DB Service Layer
    participant S as Supabase DB API
    participant DB as PostgreSQL Table
    participant Trig as Trigger Engine

    D->>DS: submitDailySadhana(profileId, dateStr, activityIds)
    DS->>S: Upsert record to `user_activities`
    S->>DB: Apply RLS Policy Check (auth.uid() = profiles.user_id)
    DB->>Trig: Fire trg_user_activity_change
    Trig->>Trig: calculate_streak() & SUM(points_awarded) where status = Approved
    Trig->>DB: UPDATE profiles SET total_points, current_streak, longest_streak
    Trig->>Trig: Fire trg_profiles_stats_change
    Trig->>DB: INSERT INTO profile_badges on criteria matches
    S->>DS: Return success response
    DS->>D: Dispatch success, reload logs & badges, update stats grid
```

---

## 🚀 Deployment & Scaling Plan

### Deployment Architecture
- **Production Host**: Vercel (CD triggered directly by git push).
- **Environment Isolation**: `.env.production` is mapped directly in the Vercel project environment settings.

### Scalability Strategy
1. **PgBouncer Pooling**: Utilize Supabase's built-in PgBouncer pooler to prevent database connection exhaustion during peak festival events (such as Paryushan).
2. **CDN Cache Routing**: Serve static page assets (images, fonts, stylesheets) directly from Vercel's Edge Network to keep page load latency low.
3. **Database Performance**: Configure PostgreSQL indexes on frequently filtered date fields (`date_str`, `createdAt`) to prevent full table scans.

---

## 📏 Coding Standards & Best Practices

- **Component Focus**: Keep client components focused strictly on presentation. Put all network requests, mutations, and database checks inside the `src/services/` service layer.
- **Hydration Safety**: Use a client-side `mounted` state on any components that rely on local browser APIs (like `localStorage` or `new Date()`) to avoid SSR mismatches.
- **CSS Disciplines**: Use custom Tailwind classes and global CSS variables inside `globals.css` rather than setting inline styling overrides.
- **Error Boundaries**: Wrap all promise-based service queries inside `try/catch` wrappers to prevent crashes if connection issues occur.

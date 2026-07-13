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
        dbd[Devotee Dashboard / Sadhana Vows]
        adm[Admin Management Console]
        translation[Client-Side Hindi/English Dictionary]
    end

    %% SDK Singleton
    lib[Supabase SDK Singleton: src/lib/supabase.js]
    dbService[Database Service Adapter: src/services/db.js]

    %% Supabase Backend Platform
    subgraph Backend [Supabase Backend Platform]
        auth[GoTrue Auth Service - OTP SMS / Bypass Mock]
        postgrest[PostgREST Database API Gateway]
        storage[Storage Buckets - Public Image CDN]
    end

    %% Database Engine
    subgraph Database [PostgreSQL Database Engine]
        tables[(Relational Tables)]
        rls[Row-Level Security Policies]
    end

    %% Connections
    devotee --> nav
    admin --> nav
    nav --> home
    nav --> panch
    nav --> evt
    nav --> don
    nav --> dbd
    nav --> adm

    home & panch & evt & don & dbd & adm --> translation
    home & panch & evt & don & dbd & adm --> dbService
    dbService --> lib
    lib --> auth
    lib --> postgrest

    auth --> tables
    postgrest --> rls
    rls --> tables
    storage --> tables
```

---

## 🏛️ System Core Components

### 1. Frontend Architecture
The portal utilizes **Next.js 15 App Router** for static rendering and client-side page hydration:
- **Routing**: Static path declarations (e.g. `/events`, `/panchang`) are pre-rendered on the server to optimize loading speeds.
- **Client Hydration**: Dynamic components (like the Countdown timers and Panchang calendar pickers) are protected against hydration mismatches using state hooks.
- **Localization**: Localized translations are stored client-side in [translations.js](file:///src/services/translations.js) and synced via global event listeners.
- **Micro-Animations**: Framer Motion handles staggered transitions, with standard CSS style overrides serving as a fallback on slower networks.

### 2. Backend Architecture
The backend is serverless, relying on the **Supabase platform** to expose CRUD database operations:
- **Client Wrapper**: A single instantiated Supabase SDK client ([supabase.js](file:///src/lib/supabase.js)) manages network sessions.
- **API Gateway**: PostgREST maps all database schemas directly to HTTP query routes, removing the need for intermediary API controllers.
- **Authentication**: Managed via GoTrue Auth. For evaluation and mock sessions, it uses simulated SMS delivery with a master bypass code (`123456`).

### 3. Database Engine
The database is a managed **PostgreSQL** instance:
- **Relational Integrity**: Foreign key constraints enforce data consistency between tables (e.g., matching Sadana Logs to Profile IDs).
- **Security Control**: Row-Level Security (RLS) is enabled globally. Policies restrict users from accessing or modifying other devotees' profile records.
- **Query Optimizations**: Indexes are applied to foreign key constraints and date coordinates to maintain fast queries as dataset sizes grow.

---

## 🔄 Core Data Flows

### 1. Devotee Vow Log Flow
```mermaid
sequenceDiagram
    participant D as Devotee Client
    participant DS as DB Service Layer
    participant S as Supabase DB API
    participant DB as PostgreSQL Table

    D->>DS: submitDailySadhana(userId, dateStr, activityIds)
    DS->>S: Upsert record to `sadhana_logs`
    S->>DB: Apply RLS Policy Check (auth.uid() = user_id)
    DB->>S: Write allowed, update devotee profile points
    S->>DS: Return updated log & profile objects
    DS->>D: Dispatch success, trigger confetti & update streak stats
```

### 2. Admin Notice Publishing Flow
```mermaid
sequenceDiagram
    participant A as Admin Console
    participant DS as DB Service Layer
    participant S as Supabase DB API
    participant DB as PostgreSQL Table

    A->>DS: createAnnouncement(announcement)
    DS->>S: Insert record into `announcements`
    S->>DB: Verify administrative user session
    DB->>S: Allow write operation
    S->>DS: Return new announcement record
    DS->>A: Append announcement to client view
```

---

## 🚀 Deployment & Scaling Plan

### Deployment Architecture
- **Production Host**: Vercel (CD triggered directly by git push).
- **Environment Isolation**: `.env.production` is mapped directly in the Vercel project environment settings.

### Scalability Strategy
1. **Connection Pooling**: Utilize Supabase's built-in PgBouncer pooler to prevent client overload during peak festival events (such as Paryushan).
2. **CDN Cache Routing**: Serve static page assets (images, fonts, stylesheets) directly from Vercel's Edge Network to keep page load latency low.
3. **Database Performance**: Configure PostgreSQL indexes on frequently filtered date fields (`date_str`, `createdAt`) to prevent full table scans.

---

## 📏 Coding Standards & Best Practices

- **Component Focus**: Keep client components focused strictly on presentation. Put all network requests, mutations, and database checks inside the `src/services/` service layer.
- **Hydration Safety**: Use a client-side `mounted` state on any components that rely on local browser APIs (like `localStorage` or `new Date()`) to avoid SSR mismatches.
- **CSS Disciplines**: Use custom Tailwind classes and global CSS variables inside `globals.css` rather than setting inline styling overrides.
- **Error Boundaries**: Wrap all promise-based service queries inside `try/catch` wrappers to prevent crashes if connection issues occur.

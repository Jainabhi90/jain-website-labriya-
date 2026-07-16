# API Reference Guide - Labriya Chaturmas Portal

This document defines the REST API layer maps representing CRUD database actions exposed via Supabase PostgREST endpoints.

---

## 🔐 Authentication

### Sign In with Google OAuth
- **Endpoint**: `/auth/v1/authorize?provider=google`
- **Method**: `GET`
- **Authentication Required**: No
- **Response**:
  Redirects the user to the Google Consent screen. Upon authorization, redirects back to the configured landing redirect URL (`/dashboard`) with the session tokens.

### Sign Out User
- **Endpoint**: `/auth/v1/logout`
- **Method**: `POST`
- **Authentication Required**: Yes (Bearer JWT)
- **Response**:
  Clears the session tokens.

---

## 👤 Profiles

### Query User's Family Profiles
- **Endpoint**: `/rest/v1/profiles?user_id=eq.{user_id}&order=member_number.asc`
- **Method**: `GET`
- **Authentication Required**: Yes (Bearer JWT)
- **Response**:
  ```json
  [
    {
      "id": "profile_uuid_1",
      "user_id": "user_uuid",
      "member_number": 1,
      "full_name": "Vardhman Jain",
      "mobile": "+919876543210",
      "city": "Labriya",
      "role": "user",
      "total_points": 125,
      "streak": 7,
      "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      "is_profile_complete": true,
      "last_login_at": "2026-07-16T10:00:00Z"
    }
  ]
  ```

### Create Secondary Family Profile
- **Endpoint**: `/rest/v1/profiles`
- **Method**: `POST`
- **Authentication Required**: Yes (Bearer JWT)
- **Request**:
  ```json
  {
    "user_id": "user_uuid",
    "member_number": 2,
    "full_name": "Pujita Mehta",
    "mobile": "+919999988888",
    "city": "Mumbai",
    "role": "user",
    "total_points": 0,
    "current_streak": 0,
    "is_active": true,
    "is_profile_complete": true
  }
  ```
- **Response**:
  ```json
  {
    "id": "profile_uuid_2",
    "user_id": "user_uuid",
    "member_number": 2,
    "full_name": "Pujita Mehta",
    "mobile": "+919999988888",
    "city": "Mumbai",
    "role": "user",
    "total_points": 0,
    "current_streak": 0,
    "is_active": true,
    "is_profile_complete": true,
    "created_at": "2026-07-16T11:00:00Z"
  }
  ```

### Query Devotee Profile
- **Endpoint**: `/rest/v1/profiles?id=eq.{profile_id}`
- **Method**: `GET`
- **Authentication Required**: Yes (Bearer JWT)
- **Response**:
  ```json
  [
    {
      "id": "profile_uuid",
      "user_id": "user_uuid",
      "member_number": 1,
      "full_name": "Devendra Shah",
      "mobile": "+919876543210",
      "city": "Indore",
      "role": "user",
      "total_points": 125,
      "streak": 7,
      "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      "is_profile_complete": true
    }
  ]
  ```

### Update Devotee Profile
- **Endpoint**: `/rest/v1/profiles?id=eq.{profile_id}`
- **Method**: `PATCH`
- **Authentication Required**: Yes (Bearer JWT)
- **Request**:
  ```json
  {
    "full_name": "Devendra Shah",
    "city": "Dhar",
    "mobile": "+919876543210",
    "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
  }
  ```
- **Response**:
  ```json
  {
    "id": "profile_uuid",
    "full_name": "Devendra Shah",
    "city": "Dhar",
    "mobile": "+919876543210",
    "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    "updated_at": "2026-07-16T11:15:00Z"
  }
  ```

### Delete Secondary Family Profile
- **Endpoint**: `/rest/v1/profiles?id=eq.{profile_id}&member_number=eq.2`
- **Method**: `DELETE`
- **Authentication Required**: Yes (Bearer JWT)
- **Response**:
  `204 No Content` on successful deletion.

---

## 🏆 Activities

### Get Active Sadhana Activities
- **Endpoint**: `/rest/v1/sadhana_activities`
- **Method**: `GET`
- **Authentication Required**: No
- **Response**:
  ```json
  [
    {
      "id": "act_upvas",
      "name": "Upvas",
      "points": 10,
      "category": "Tapas"
    }
  ]
  ```

---

## 📝 User Activities (Logs)

### Submit Vow Logs
- **Endpoint**: `/rest/v1/sadhana_logs`
- **Method**: `POST`
- **Authentication Required**: Yes (Bearer JWT)
- **Request**:
  ```json
  {
    "profile_id": "profile_uuid",
    "date_str": "2026-07-16",
    "activities": ["act_upvas", "act_samayik"],
    "points": 13
  }
  ```
- **Response**:
  ```json
  {
    "id": "log_uuid",
    "profile_id": "profile_uuid",
    "date_str": "2026-07-16",
    "activities": ["act_upvas", "act_samayik"],
    "points": 13
  }
  ```

---

## 📅 Events

### Get Event Schedule
- **Endpoint**: `/rest/v1/events`
- **Method**: `GET`
- **Authentication Required**: No
- **Response**:
  ```json
  [
    {
      "id": "event_uuid",
      "title": "Varshik Mahavir Janma Kalyanak Puja",
      "description": "18-abhishek worship dedicated to Lord Mahavira.",
      "date": "2026-08-15T09:00:00Z",
      "location": "Main Assembly Hall",
      "image_url": "https://images.unsplash.com/photo-1542856391-010fb87dcfed"
    }
  ]
  ```

---

## 📢 Announcements

### Get Latest Notices
- **Endpoint**: `/rest/v1/announcements?active=eq.true`
- **Method**: `GET`
- **Authentication Required**: No
- **Response**:
  ```json
  [
    {
      "id": "ann_uuid",
      "title": "Chaturmas 2026 Pravesh Mahotsav",
      "content": "Grand welcoming festival held on July 25th.",
      "type": "program",
      "active": true,
      "created_at": "2026-07-11T12:00:00Z"
    }
  ]
  ```

---

## 💰 Donations

### File Donation Transaction
- **Endpoint**: `/rest/v1/donations`
- **Method**: `POST`
- **Authentication Required**: No
- **Request**:
  ```json
  {
    "donor_name": "Abhi Jain",
    "phone": "9876543210",
    "amount": 5100,
    "txn_id": "UPI2847194829"
  }
  ```
- **Response**:
  ```json
  {
    "id": "donation_uuid",
    "donor_name": "Abhi Jain",
    "phone": "9876543210",
    "amount": 5100,
    "txn_id": "UPI2847194829",
    "verified": false,
    "created_at": "2026-07-12T12:10:00Z"
  }
  ```

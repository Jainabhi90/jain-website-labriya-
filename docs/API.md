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
      "current_streak": 7,
      "longest_streak": 12,
      "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      "is_profile_complete": true,
      "last_login_at": "2026-07-16T10:00:00Z"
    }
  ]
  ```

---

## 📅 Sadhana Activities

### Query Active Sadhana Activities
- **Endpoint**: `/rest/v1/activities?active=eq.true&order=display_order.asc`
- **Method**: `GET`
- **Authentication Required**: No
- **Response**:
  ```json
  [
    {
      "id": "act_upvas_uuid",
      "name": "Upvas",
      "description": "Complete fasting for 24 hours.",
      "points": 10,
      "category": "Fasting",
      "icon": "utensils-crossed",
      "display_order": 10,
      "difficulty": "Hard",
      "estimated_duration_minutes": 1440,
      "active": true
    }
  ]
  ```

---

## 📝 User Activities (Daily Logs)

### Query Logs for Active Profile
- **Endpoint**: `/rest/v1/user_activities?profile_id=eq.{profile_uuid}&select=id,activity_date,points_awarded,status,activities(id,name,category,points)&order=activity_date.desc`
- **Method**: `GET`
- **Authentication Required**: Yes (Bearer JWT)
- **Response**:
  ```json
  [
    {
      "id": "log_uuid",
      "activity_date": "2026-07-16",
      "points_awarded": 10,
      "status": "Pending",
      "activities": {
        "id": "act_upvas_uuid",
        "name": "Upvas",
        "category": "Fasting",
        "points": 10
      }
    }
  ]
  ```

### Batch Submit Daily Check-In
- **Endpoint**: `/rest/v1/user_activities`
- **Method**: `POST`
- **Authentication Required**: Yes (Bearer JWT)
- **Request**:
  ```json
  [
    {
      "profile_id": "profile_uuid",
      "activity_id": "act_upvas_uuid",
      "activity_date": "2026-07-16",
      "points_awarded": 10,
      "status": "Pending",
      "submission_source": "Website"
    },
    {
      "profile_id": "profile_uuid",
      "activity_id": "act_samayik_uuid",
      "activity_date": "2026-07-16",
      "points_awarded": 3,
      "status": "Pending",
      "submission_source": "Website"
    }
  ]
  ```
- **Response**:
  `201 Created`

### Delete Pending Daily Log
- **Endpoint**: `/rest/v1/user_activities?profile_id=eq.{profile_uuid}&activity_date=eq.2026-07-16`
- **Method**: `DELETE`
- **Authentication Required**: Yes (Bearer JWT) (Guarded by RLS to only allow deleting pending submissions)
- **Response**:
  `204 No Content`

---

## 🏅 Profile Badges (Milestones)

### Query Unlocked Badges for Profile
- **Endpoint**: `/rest/v1/profile_badges?profile_id=eq.{profile_uuid}`
- **Method**: `GET`
- **Authentication Required**: No
- **Response**:
  ```json
  [
    {
      "id": "badge_record_uuid",
      "profile_id": "profile_uuid",
      "badge_id": "badge_first_checkin",
      "unlocked_at": "2026-07-16T12:00:00Z"
    }
  ]
  ```

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

## 👤 Devotee Profiles

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

### Delete Devotee Account (Admin Only)
- **Endpoint**: `/rest/v1/profiles?id=eq.{profile_uuid}`
- **Method**: `DELETE`
- **Authentication Required**: Yes (Admin only)
- **Response**:
  `204 No Content`

---

## 📅 Worship Schedules (Timetables)

### Query Timetables
- **Endpoint**: `/rest/v1/schedules?order=order_num.asc`
- **Method**: `GET`
- **Authentication Required**: No
- **Response**:
  ```json
  [
    {
      "id": "schedule_uuid",
      "time": "06:30 AM",
      "activity": "Mangal Aarti",
      "session": "Morning",
      "order_num": 10
    }
  ]
  ```

### Create Schedule (Admin Only)
- **Endpoint**: `/rest/v1/schedules`
- **Method**: `POST`
- **Authentication Required**: Yes (Admin only)
- **Request**:
  ```json
  {
    "time": "07:30 PM",
    "activity": "Sandhya Aarti",
    "session": "Evening",
    "order_num": 50
  }
  ```
- **Response**:
  `201 Created`

### Delete Schedule (Admin Only)
- **Endpoint**: `/rest/v1/schedules?id=eq.{schedule_uuid}`
- **Method**: `DELETE`
- **Authentication Required**: Yes (Admin only)
- **Response**:
  `204 No Content`

---

## 📝 User Activities (Daily Logs)

### Query Logs for Admin Approvals
- **Endpoint**: `/rest/v1/user_activities?select=id,activity_date,points_awarded,status,created_at,profiles(id,full_name,mobile),activities(id,name,category)&order=created_at.desc`
- **Method**: `GET`
- **Authentication Required**: Yes (Admin only)
- **Response**:
  ```json
  [
    {
      "id": "log_uuid",
      "activity_date": "2026-07-16",
      "points_awarded": 10,
      "status": "Pending",
      "created_at": "2026-07-16T12:00:00Z",
      "profiles": {
        "id": "profile_uuid",
        "full_name": "Devotee Name",
        "mobile": "+919876543210"
      },
      "activities": {
        "id": "act_upvas_uuid",
        "name": "Upvas",
        "category": "Fasting"
      }
    }
  ]
  ```

### Approve Devotee Check-In (Admin Only)
- **Endpoint**: `/rest/v1/user_activities?id=eq.{log_uuid}`
- **Method**: `PATCH`
- **Authentication Required**: Yes (Admin only)
- **Request**:
  ```json
  {
    "status": "Approved"
  }
  ```
- **Response**:
  `200 OK`

---

## ⚙️ Settings (Temple Configurations)

### Query Settings
- **Endpoint**: `/rest/v1/settings?limit=1`
- **Method**: `GET`
- **Authentication Required**: No
- **Response**:
  ```json
  {
    "id": "00000000-0000-0000-0000-000000000000",
    "temple_name": "Shree Labriya Jain Shwetambar Mandir",
    "upi_id": "shreelabriyatrust@okaxis",
    "bank_name": "State Bank of India",
    "account_holder": "Shree Labriya Jain Mandir Trust",
    "account_number": "38472948194",
    "ifsc": "SBIN0030129",
    "contact_number": "+91 98765 43210",
    "temple_address": "Mandir Marg, Labriya, Dhar District, Madhya Pradesh"
  }
  ```

### Update Temple Settings (Admin Only)
- **Endpoint**: `/rest/v1/settings?id=eq.00000000-0000-0000-0000-000000000000`
- **Method**: `PATCH`
- **Authentication Required**: Yes (Admin only)
- **Request**:
  ```json
  {
    "temple_name": "Shree Labriya Jain Shwetambar Mandir (Dhar)",
    "upi_id": "shreelabriyatrust@okaxis"
  }
  ```
- **Response**:
  `200 OK`

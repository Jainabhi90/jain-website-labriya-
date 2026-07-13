# API Reference Guide - Labriya Chaturmas Portal

This document defines the REST API layer maps representing CRUD database actions exposed via Supabase PostgREST endpoints.

---

## 🔐 Authentication

### Request OTP Code
- **Endpoint**: `/auth/v1/otp`
- **Method**: `POST`
- **Authentication Required**: No
- **Request**:
  ```json
  {
    "phone": "+919876543210"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Verification code dispatched."
  }
  ```
- **Errors**:
  - `400 Bad Request`: Invalid phone number structure.

### Verify OTP Code
- **Endpoint**: `/auth/v1/verify`
- **Method**: `POST`
- **Authentication Required**: No
- **Request**:
  ```json
  {
    "phone": "+919876543210",
    "token": "123456",
    "type": "sms"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "jwt_token_string",
    "token_type": "bearer",
    "expires_in": 3600,
    "refresh_token": "refresh_token_string",
    "user": {
      "id": "user_uuid",
      "phone": "+919876543210"
    }
  }
  ```
- **Errors**:
  - `401 Unauthorized`: Invalid or expired OTP verification token.

---

## 👤 Profiles

### Query Devotee Profile
- **Endpoint**: `/rest/v1/profiles?id=eq.{user_id}`
- **Method**: `GET`
- **Authentication Required**: Yes (Bearer JWT)
- **Response**:
  ```json
  [
    {
      "id": "user_uuid",
      "full_name": "Devendra Shah",
      "phone": "9876543210",
      "city": "Indore",
      "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      "total_points": 125,
      "streak": 7,
      "badges": ["badge_first_upvas"],
      "updated_at": "2026-07-11T22:43:00Z"
    }
  ]
  ```

### Update Devotee Profile
- **Endpoint**: `/rest/v1/profiles?id=eq.{user_id}`
- **Method**: `PATCH`
- **Authentication Required**: Yes
- **Request**:
  ```json
  {
    "full_name": "Devendra Shah",
    "city": "Dhar"
  }
  ```
- **Response**:
  ```json
  {
    "id": "user_uuid",
    "full_name": "Devendra Shah",
    "city": "Dhar",
    "updated_at": "2026-07-12T12:00:00Z"
  }
  ```

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
- **Authentication Required**: Yes
- **Request**:
  ```json
  {
    "user_id": "user_uuid",
    "date_str": "2026-07-12",
    "activities": ["act_upvas", "act_samayik"],
    "points": 13
  }
  ```
- **Response**:
  ```json
  {
    "id": "log_uuid",
    "user_id": "user_uuid",
    "date_str": "2026-07-12",
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

---

## ⚙️ Settings

### Get Leaderboard Toggle Status
- **Endpoint**: `/rest/v1/settings?key=eq.temp_leaderboard_toggle`
- **Method**: `GET`
- **Authentication Required**: No
- **Response**:
  ```json
  [
    {
      "key": "temp_leaderboard_toggle",
      "value": "false"
    }
  ]
  ```

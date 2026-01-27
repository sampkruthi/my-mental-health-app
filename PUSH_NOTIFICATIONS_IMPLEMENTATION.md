# Push Notifications Implementation Guide

## Overview
This document explains the complete push notification implementation for the Mental Health App, including backend infrastructure analysis and frontend implementation steps.

---

## PART 1: BACKEND ANALYSIS

### Backend Files Provided:
1. **pushNotifDontCommit.py** - Firebase Cloud Messaging (FCM) service
2. **authDontCommit.py** - Device token registration endpoints
3. **schedulerDontCommit.py** - Background job scheduler for reminders
4. **remindersDontCommit.py** - Reminder API with 12-hour format conversion

### Backend Architecture Flow:

```
User Creates Reminder (Frontend)
    ↓
POST /api/reminders/ (Backend API)
    ↓
Reminder Stored in Database (24-hour format)
    ↓
Scheduler loads all reminders on startup
    ↓
APScheduler creates cron jobs for each reminder
    ↓
At scheduled time, send_reminder_notification() is called
    ↓
Looks up user's device_token from database
    ↓
Firebase Cloud Messaging (FCM) sends push notification
    ↓
Device receives notification (if app has device token registered)
```

### Key Backend Components:

#### 1. **pushNotifDontCommit.py** - Firebase Service
- **initialize_firebase()**: Initializes Firebase using service account credentials from `FIREBASE_SERVICE_ACCOUNT` env var
- **send_push_notification()**: Sends notification to a single device token
- **send_push_to_user()**: Looks up device token by user_id and sends notification
- **Checks**:
  - User exists in database
  - Device token exists for user
  - User has notifications enabled
  - Token is valid (handles UnregisteredError)

#### 2. **authDontCommit.py** - Auth Routes
```python
POST /api/auth/device
Request Body:
{
  "device_token": "string",
  "platform": "ios" | "android" | "web"
}
Response:
{
  "status": "ok",
  "message": "Device registered for notifications"
}
```

Also includes:
```python
POST /api/auth/notifications/toggle
Request Body: enabled: bool
Response: { "status": "ok", "notifications_enabled": bool }
```

#### 3. **schedulerDontCommit.py** - Scheduler Service
- **schedule_job()**: Creates a cron trigger for reminder at specified hour:minute
- **send_reminder_notification()**: Called at scheduled time
  - Sends notification with title and message
  - Includes data: `{"type": "reminder", "reminder_type": "<type>"}`
- **load_all_jobs()**: Loads all user reminders on server startup
- **unschedule_job()**: Removes job when reminder is deleted

#### 4. **remindersDontCommit.py** - Reminder API
- Accepts 12-hour format (1-12 with AM/PM)
- Converts to 24-hour format for storage (0-23)
- Converts back to 12-hour for responses
- When reminder is created, scheduler job is scheduled

---

## PART 2: CURRENT FRONTEND STATE

### ✅ EXISTING FRONTEND INFRASTRUCTURE:
1. **API Service** (`services/api.ts`) - Reminder CRUD operations
2. **Reminder Hooks** (`src/api/hooks.ts`) - React Query hooks for reminders
3. **Storage Utility** (`src/utils/storage.ts`) - Cross-platform storage
4. **Auth Context** - Token and user management
5. **Reminder Screen** - UI for managing reminders

### ❌ MISSING FRONTEND COMPONENTS:
1. ❌ Device token acquisition
2. ❌ Notification permission requests
3. ❌ Device token registration API integration
4. ❌ Notification listeners/handlers
5. ❌ Notification settings screen
6. ❌ Notification libraries in package.json

---

## PART 3: FRONTEND IMPLEMENTATION PLAN

### Step 1: Install Required Libraries
For Expo-based React Native app, use `expo-notifications`:
```bash
npx expo install expo-notifications
```

**Why expo-notifications?**
- Built for Expo, works on iOS, Android, and Web
- Handles both local and push notifications
- Simpler than firebase-messaging setup
- Works with Firebase Cloud Messaging backend

### Step 2: Create Notification Service Module
File: `src/services/notificationService.ts`

**Responsibilities:**
- Request notification permissions
- Get device token from Expo
- Store device token locally
- Send device token to backend API
- Register notification listeners
- Handle notification responses

### Step 3: Update API Service
File: `services/api.ts`

**Add:**
- `registerDeviceToken(token: string, platform: string)` - POST /api/auth/device
- `toggleNotifications(enabled: boolean)` - POST /api/auth/notifications/toggle

### Step 4: Create Notification Hooks
File: `src/api/hooks.ts`

**Add:**
- `useRegisterDeviceToken()` - Mutation hook for registering token
- `useToggleNotifications()` - Mutation hook for notifications toggle

### Step 5: Integrate in App Startup
File: `App.tsx`

**In useEffect on app start:**
- Initialize notification service
- Request permissions
- Get device token
- Register with backend
- Set up notification listeners

### Step 6: Add Notification Settings
Optional: Create notification settings screen or toggle in home/settings

### Step 7: Handle Notification Data
When notification is received with reminder data, can trigger UI update or logging

---

## PART 4: TECHNICAL DETAILS

### Platform Detection:
```typescript
Platform.OS === "ios" | "android" | "web"
```

### Device Token Storage:
- Store in AsyncStorage with key: "expo_push_token"
- Also available in Expo managed workflow

### Notification Permission States:
- DENIED: User denied permission, can't send notifications
- UNDETERMINED: User hasn't been asked yet
- GRANTED: User approved notifications

### Data Flow for Reminders:
```
Frontend creates reminder
  ↓
Backend stores reminder + schedules job
  ↓
User registers device token (frontend → backend)
  ↓
At reminder time, backend sends FCM notification
  ↓
Device receives notification (even if app is closed)
  ↓
If app is open, notification listener handler is triggered
  ↓
If app is closed, notification shown in system tray
```

---

## PART 5: IMPLEMENTATION CHECKLIST

- [ ] Install expo-notifications package
- [ ] Create notificationService.ts with permission handling
- [ ] Add device token registration to API service
- [ ] Create notification hooks
- [ ] Initialize in App.tsx
- [ ] Add notification listener in useEffect
- [ ] Test on Android emulator
- [ ] Test on iOS simulator
- [ ] Test on Web (if supported)
- [ ] Add notification settings screen (optional)

---

## PART 6: CODE REFERENCES

### Backend Device Token Flow:
```python
# Backend stores device token
POST /api/auth/device
Authorization: Bearer {token}
Body: {"device_token": "ExponentPushToken[...]", "platform": "android"}

# Response
{"status": "ok", "message": "Device registered for notifications"}
```

### Backend Notification Flow:
```python
# Scheduler sends notification when reminder time arrives
send_push_to_user(
    user_id=user.user_id,
    title="🧘 Meditation Time",
    body="Time for your meditation reminder!",
    data={"type": "reminder", "reminder_type": "meditation"}
)

# FCM service looks up user's device token and sends notification
# Backend checks: user exists, device token exists, notifications enabled
```

### Frontend Registration Flow:
```typescript
// 1. Request permission
const permission = await getNotificationPermission()

// 2. Get token from Expo
const token = await getExpoNotificationToken()

// 3. Register with backend
POST /api/auth/device
Authorization: Bearer {auth_token}
Body: { "device_token": token, "platform": Platform.OS }

// 4. Set up listeners for incoming notifications
addNotificationReceivedListener((notification) => {
  // Handle notification when app is foreground
})

addNotificationResponseListener((response) => {
  // Handle user tapping notification
})
```

---

## Next Steps:
1. Review this document
2. Follow the implementation steps
3. Test each component as it's built
4. Verify end-to-end: Create reminder → Receive notification

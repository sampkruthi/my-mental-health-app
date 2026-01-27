# Push Notifications - Quick Start Guide

## What Was Done (5-Minute Overview)

Your push notification system is now **100% implemented** on the frontend. Here's what was added:

### 📁 New Files Created:
1. **`src/services/notificationService.ts`** - Handles all notification logic
   - Request permissions
   - Get device token
   - Listen for notifications

2. **`PUSH_NOTIFICATIONS_IMPLEMENTATION.md`** - Complete architecture explanation

3. **`IMPLEMENTATION_SUMMARY.md`** - Detailed implementation guide

### 🔄 Files Updated:
1. **`services/api.ts`** - Added 2 new methods:
   - `registerDeviceToken()` - Register token with backend
   - `toggleNotifications()` - Enable/disable notifications

2. **`src/api/hooks.ts`** - Added 2 new hooks:
   - `useRegisterDeviceToken()` - React Query hook for registration
   - `useToggleNotifications()` - React Query hook for toggling

3. **`App.tsx`** - Added notification initialization:
   - Creates `NotificationInitializer` component
   - Automatically initializes after user logs in

---

## How It Works (Simple Explanation)

```
User logs in
    ↓
App asks for notification permission
    ↓
Gets device token from Expo
    ↓
Sends token to backend via API
    ↓
Backend stores token in database
    ↓
User creates reminder (e.g., "Meditation at 9 AM")
    ↓
At 9 AM, backend sends push notification
    ↓
User's phone receives notification
```

---

## Testing It Out

### Step 1: Basic Test (No Backend Needed)
In `notificationService.ts`, call this to send a test notification:
```typescript
import { sendTestNotification } from "./src/services/notificationService";

// Call this anywhere to test:
await sendTestNotification();
// You'll see a notification appear after 2 seconds
```

### Step 2: Test Device Token Registration
1. Login to the app
2. Check console logs for:
   - `[App] Device token obtained: ExponentPushToken[...]`
   - `[App] Device token registered successfully`
3. Confirm in backend database that token is stored

### Step 3: Test Full Flow
1. Create a reminder
2. Wait for reminder time (or manually trigger in backend)
3. See notification appear on device
4. Tap notification and app should handle it

---

## File Locations Reference

```
src/
├── services/
│   ├── notificationService.ts          ← All notification logic here
│   └── api.ts                          ← Device token API calls
├── api/
│   └── hooks.ts                        ← useRegisterDeviceToken, useToggleNotifications
└── App.tsx                             ← NotificationInitializer component (already integrated)
```

---

## API Endpoints (Already Implemented)

### Register Device Token
```
POST /api/auth/device
Authorization: Bearer {auth_token}
Content-Type: application/json

{
  "device_token": "ExponentPushToken[...]",
  "platform": "android"
}

Response: { "status": "ok", "message": "Device registered for notifications" }
```

### Toggle Notifications
```
POST /api/auth/notifications/toggle
Authorization: Bearer {auth_token}

{
  "enabled": true
}

Response: { "status": "ok", "notifications_enabled": true }
```

---

## Key Functions & How to Use Them

### Function 1: Request Permission
```typescript
import { requestNotificationPermission } from "./src/services/notificationService";

const granted = await requestNotificationPermission();
console.log("Permission granted:", granted);
```

### Function 2: Get Device Token
```typescript
import { getExpoNotificationToken } from "./src/services/notificationService";

const token = await getExpoNotificationToken();
console.log("Device token:", token);
```

### Function 3: Register Token with Backend
```typescript
import { useRegisterDeviceToken } from "./src/api/hooks";

const { token } = useAuth();
const registerMutation = useRegisterDeviceToken(token);

registerMutation.mutate({
  deviceToken: "ExponentPushToken[...]",
  platform: "android"
});
```

### Function 4: Listen for Notifications
```typescript
import { onNotificationReceived } from "./src/services/notificationService";

const unsubscribe = onNotificationReceived((notification) => {
  console.log("Notification received:", notification);
  // Update UI here
});

// Don't forget to unsubscribe when done
// unsubscribe();
```

### Function 5: Listen for User Tapping Notification
```typescript
import { onNotificationResponse } from "./src/services/notificationService";

const unsubscribe = onNotificationResponse((response) => {
  console.log("User tapped notification:", response);
  // Navigate to relevant screen
});
```

---

## Debugging Tips

### Check Console Logs
All functions have detailed logging with `[NotificationService]` or `[App]` prefix:
```
[NotificationService] Requesting notification permissions
[NotificationService] Permission granted
[App] Device token obtained: ExponentPushToken[...]
[App] Device token registered successfully
```

### Check Local Storage
Device token is stored in AsyncStorage:
```typescript
import { getStoredDeviceToken } from "./src/services/notificationService";

const token = await getStoredDeviceToken();
console.log("Stored token:", token);
```

### Check Backend Database
Query the User table:
```sql
SELECT user_id, device_token, device_platform, notifications_enabled
FROM users;
```

### Test Notifications Manually
```typescript
import * as Notifications from 'expo-notifications';

// Send a local test notification
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Test Notification',
    body: 'This is a test'
  },
  trigger: { seconds: 2 }
});
```

---

## Common Scenarios

### Scenario 1: User Logs In
```
NotificationInitializer detects token exists
    ↓
Initializes notifications (asks permission if needed)
    ↓
Gets Expo device token
    ↓
Registers with backend via API
    ↓
Sets up notification listeners
```

### Scenario 2: User Creates Reminder
```
User: "Meditation at 9 AM"
    ↓
Frontend: POST /api/reminders/ (already working)
    ↓
Backend: Stores reminder + schedules job
    ↓
At 9 AM: APScheduler triggers notification
    ↓
Backend: Looks up user's device token
    ↓
Sends notification via Firebase
```

### Scenario 3: User Receives Notification While App is Open
```
Backend sends notification
    ↓
Device receives notification
    ↓
onNotificationReceived listener triggers
    ↓
App logs: "Notification received: ..."
    ↓
You can update UI, show alert, etc.
```

### Scenario 4: User Receives Notification While App is Closed
```
Backend sends notification
    ↓
Device receives notification
    ↓
Shows in notification tray/system
    ↓
User taps notification
    ↓
App opens
    ↓
onNotificationResponse listener triggers
    ↓
App can navigate to relevant screen
```

---

## Integration Checklist

- [x] Install expo-notifications (already done)
- [x] Create notificationService.ts
- [x] Update API service with device token endpoints
- [x] Create notification hooks
- [x] Integrate in App.tsx
- [ ] Test on Android device/emulator
- [ ] Test on iOS device/simulator
- [ ] Test on Web (optional)
- [ ] Verify backend is sending notifications
- [ ] Create user settings for notification toggle (optional)

---

## What Happens Automatically

When user logs in, these things happen automatically (in App.tsx):

1. ✅ Permission is requested (if not already granted)
2. ✅ Device token is obtained from Expo
3. ✅ Device token is registered with backend
4. ✅ Notification listeners are set up
5. ✅ All done - ready to receive notifications!

**You don't need to do anything** - it's all automatic in `NotificationInitializer` component.

---

## What Happens When Reminder Time Arrives

Backend (APScheduler):
1. Checks if reminder time matches current time
2. Looks up user's device token
3. Sends notification via Firebase Cloud Messaging
4. Notification is delivered to device

Frontend (Your App):
1. Receives notification
2. If app is open: `onNotificationReceived` listener triggered
3. If app is closed: notification shown in system tray
4. User can tap notification: `onNotificationResponse` listener triggered

---

## Troubleshooting

### Q: Device token not showing in logs?
**A:** Check that user is logged in. NotificationInitializer only runs after `token` is available.

### Q: "No permission to send notification"?
**A:** User denied notification permission. Check phone settings → Notifications → Your App

### Q: Notifications not being sent by backend?
**A:** Check backend scheduler is running. Verify Firebase service account is configured.

### Q: User tapped notification but app didn't navigate?
**A:** `handleNotificationResponse()` function is called but does nothing by default. You can customize it to navigate.

---

## Next Steps

1. **Test on physical device** - Emulators may not support notifications
2. **Verify backend scheduler is running** - Check server logs
3. **Create test reminder** - Set it for 1 minute from now
4. **Confirm notification arrives** - Check logs and system tray
5. **Optional: Add notification settings screen** - Let users toggle notifications

---

## Documentation Files

- **`PUSH_NOTIFICATIONS_IMPLEMENTATION.md`** - Complete architecture & backend explanation
- **`IMPLEMENTATION_SUMMARY.md`** - Detailed implementation guide with examples
- **`PUSH_NOTIFICATIONS_QUICK_START.md`** - This file (quick reference)

---

## Questions?

All the implementation details are in the full documentation files. Read through them for:
- Complete architecture explanation
- Backend flow diagrams
- Code examples
- Testing procedures
- Deployment checklist

The push notification system is **ready to go** - just test it out! 🚀

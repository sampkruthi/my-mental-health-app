# Timezone Detection Implementation

## Overview

Timezone detection has been fully integrated into the user registration flow. When a user creates an account, their device's timezone is automatically detected and sent to the backend, allowing the backend to:
- Store user timezone preferences
- Schedule reminders in the user's local timezone
- Display times correctly across different regions
- Handle daylight saving time (DST) transitions

---

## What Was Implemented

### 1. **Timezone Utility Module** (`src/utils/timezoneUtils.ts`)
A comprehensive utility module with functions for detecting, validating, and working with timezones.

#### Key Functions:

**`getUserTimezone(): string`**
- Returns user's IANA timezone identifier (e.g., "America/New_York")
- Uses Intl API (most reliable method)
- Fallback to UTC offset if Intl fails

```typescript
const timezone = getUserTimezone();
console.log(timezone); // "America/New_York"
```

**`getTimezoneInfo(): object`**
- Returns comprehensive timezone information
- Includes timezone, UTC offset, formatted offset, and DST status

```typescript
const info = getTimezoneInfo();
// {
//   timezone: "America/New_York",
//   utcOffset: 300,
//   utcOffsetString: "-05:00",
//   isDST: false
// }
```

**`isValidTimezone(timezone: string): boolean`**
- Validates if a timezone string is valid IANA timezone
- Useful for backend validation or input checking

```typescript
isValidTimezone("America/New_York"); // true
isValidTimezone("Invalid/Timezone"); // false
```

**`formatTimezoneForDisplay(timezone: string): string`**
- Formats timezone for user display
- Includes readable name and UTC offset

```typescript
formatTimezoneForDisplay("America/New_York");
// "Eastern Standard Time (UTC-05:00)"
```

**`convertTimezone(date, fromTimezone, toTimezone): Date`**
- Converts a date from one timezone to another
- Useful for displaying times in different regions

**`getCurrentTimeInTimezone(timezone: string): string`**
- Gets current time in a specific timezone
- Returns formatted time string

```typescript
getCurrentTimeInTimezone("Asia/Tokyo");
// "11:30:45 PM"
```

#### Additional Resources:

**`COMMON_TIMEZONES` array**
- List of 30+ common timezones for reference
- Can be used for dropdowns or validation

---

### 2. **Updated RegisterRequest Type** (`src/api/types.ts`)

```typescript
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  timezone?: string; // IANA timezone (e.g., "America/New_York")
}
```

The `timezone` field is optional, allowing for backward compatibility if needed.

---

### 3. **Updated RegisterScreen** (`src/screens/Auth/RegisterScreen.tsx`)

**Changes made:**
- Imported `getUserTimezone` from timezone utilities
- Modified `handleRegister` to detect user's timezone before registration
- Passes timezone to registration mutation

**Code flow:**
```typescript
const handleRegister = async () => {
  // ... validation ...

  try {
    // NEW: Detect user's timezone
    const timezone = getUserTimezone();
    console.log("[RegisterScreen] Detected user timezone:", timezone);

    // Pass timezone to registration
    const res = await registerMutation.mutateAsync({
      name,
      email,
      password,
      timezone,  // NEW: Include timezone
    });

    // ... rest of flow ...
  }
}
```

**Console output:**
```
[RegisterScreen] Detected user timezone: America/New_York
Registration attempt: { name: "John Doe", email: "john@example.com", timezone: "America/New_York" }
```

---

### 4. **Updated API Service** (`services/api.ts`)

**Interface update:**
```typescript
register(name: string, email: string, password: string, timezone?: string):
  Promise<Token & { userId?: string }>;
```

**Implementation update:**
```typescript
async register(name: string, email: string, password: string, timezone?: string) {
  console.log('Registration attempt:', { name, email, timezone });

  const { data } = await apiClient.post("/api/auth/register", {
    username: email,
    password: password,
    name: name,
    timezone: timezone,  // Send timezone to backend
  });

  return {
    ...data,
    userId: email,
  };
}
```

**Backend request body:**
```json
{
  "username": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "timezone": "America/New_York"
}
```

---

## How It Works (Data Flow)

```
User clicks "Register"
    ↓
RegisterScreen.handleRegister() is called
    ↓
Timezone is automatically detected via getUserTimezone()
    ↓
getUserTimezone() uses Intl.DateTimeFormat().resolvedOptions().timeZone
    ↓
Returns IANA timezone identifier (e.g., "America/New_York")
    ↓
Timezone is passed to registration mutation:
  registerMutation.mutateAsync({
    name, email, password, timezone
  })
    ↓
API service register() method receives timezone parameter
    ↓
POST request sent to /api/auth/register with timezone in body:
  {
    "username": "email",
    "password": "...",
    "name": "...",
    "timezone": "America/New_York"
  }
    ↓
Backend receives timezone and stores it in User table
    ↓
Backend can now:
  - Schedule reminders in user's local time
  - Display times correctly
  - Handle DST automatically
```

---

## Timezone Information Reference

### IANA Timezone Format
All timezones use the IANA timezone database format:
- Format: `Continent/City` or `Region/City`
- Examples:
  - `America/New_York` (Eastern Time)
  - `America/Los_Angeles` (Pacific Time)
  - `Europe/London` (Greenwich Mean Time)
  - `Asia/Tokyo` (Japan Standard Time)
  - `Australia/Sydney` (Australian Eastern Time)

### UTC Offset
The offset from UTC is calculated and available:
- Format: `±HH:MM`
- Examples:
  - `-05:00` (EST, 5 hours behind UTC)
  - `+09:00` (JST, 9 hours ahead of UTC)
  - `+00:00` (UTC itself)

### Daylight Saving Time (DST)
The utility automatically detects DST status:
- `isDST: true` when daylight saving time is active
- `isDST: false` when standard time is active
- Offset changes automatically with DST transitions

---

## Backend Integration (Expected)

Your backend should:

1. **Store timezone** in User table/model:
   ```python
   class User:
       timezone: str  # e.g., "America/New_York"
   ```

2. **Use timezone for reminders**:
   ```python
   # When scheduling reminder at "9:00 AM"
   # Convert to user's timezone before scheduling job
   reminder_time = convert_to_user_timezone("09:00", user.timezone)
   schedule_job(reminder_time)
   ```

3. **Use timezone for time display**:
   ```python
   # When returning times to frontend
   return {
     "reminder_time": convert_to_timezone(utc_time, user.timezone)
   }
   ```

4. **Handle DST automatically**:
   - Python's `pytz` or `zoneinfo` modules handle DST transitions
   - No manual DST handling needed

---

## Example Backend Integration (Python)

```python
from zoneinfo import ZoneInfo
from datetime import datetime

# Store timezone from registration
@router.post("/api/auth/register")
def register(req: RegisterRequest):
    user = User(
        name=req.name,
        email=req.email,
        password=hash(req.password),
        timezone=req.timezone  # Store the timezone
    )
    db.add(user)
    db.commit()

# Use timezone when scheduling reminders
def schedule_reminder(reminder, user):
    tz = ZoneInfo(user.timezone)

    # Convert reminder time to user's timezone
    reminder_time = datetime(
        hour=reminder.hour,
        minute=reminder.minute,
        tzinfo=tz
    )

    # Schedule job with user's local time
    scheduler.add_job(
        send_notification,
        CronTrigger(hour=reminder.hour, minute=reminder.minute),
        args=[user.id]
    )

# Display time in user's timezone
def get_reminder(reminder, user):
    tz = ZoneInfo(user.timezone)

    return {
        "id": reminder.id,
        "time": reminder.time.astimezone(tz).isoformat(),
        "message": reminder.message
    }
```

---

## Testing the Implementation

### Test 1: Verify Timezone Detection
```typescript
import { getUserTimezone } from "./src/utils/timezoneUtils";

const timezone = getUserTimezone();
console.log("User timezone:", timezone);
// Expected output: "America/New_York" or similar
```

### Test 2: Verify Registration Includes Timezone
1. Open app
2. Go to Register screen
3. Check console logs during registration:
   ```
   [RegisterScreen] Detected user timezone: America/New_York
   Registration attempt: {..., timezone: "America/New_York"}
   ```

### Test 3: Verify Backend Receives Timezone
1. Check network tab in DevTools
2. Look at POST request to `/api/auth/register`
3. Verify request body includes `timezone` field

### Test 4: Verify Backend Stores Timezone
1. Query database after registration:
   ```sql
   SELECT email, timezone FROM users;
   ```
2. Should show user's timezone stored correctly

### Test 5: Test Different Timezones
- Use browser DevTools to override timezone
- Or test on devices in different timezones
- Verify correct timezone is detected each time

---

## Timezone Utilities Quick Reference

### Most Common Usage
```typescript
// In any component that needs timezone
import { getUserTimezone, getTimezoneInfo } from "../utils/timezoneUtils";

// Get timezone identifier
const tz = getUserTimezone();

// Get detailed timezone info
const info = getTimezoneInfo();
// { timezone, utcOffset, utcOffsetString, isDST }
```

### Available Functions

| Function | Returns | Use Case |
|----------|---------|----------|
| `getUserTimezone()` | string | Get user's timezone ID |
| `getUTCOffset()` | number | Get offset in minutes |
| `getUTCOffsetString()` | string | Get formatted offset (+/-HH:MM) |
| `getTimezoneInfo()` | object | Get complete timezone info |
| `isValidTimezone(tz)` | boolean | Validate timezone string |
| `formatTimezoneForDisplay(tz)` | string | Format for UI display |
| `convertTimezone(date, from, to)` | Date | Convert between timezones |
| `getCurrentTimeInTimezone(tz)` | string | Get current time in timezone |

---

## Files Modified

| File | Changes | Lines |
|------|---------|-------|
| `src/utils/timezoneUtils.ts` | NEW - Timezone utility module | 200+ |
| `src/api/types.ts` | Added `timezone` field to `RegisterRequest` | 27 |
| `src/screens/Auth/RegisterScreen.tsx` | Import `getUserTimezone`, detect and pass timezone | 72-73, 79 |
| `services/api.ts` | Added `timezone` parameter to `register` method | 20, 390-397 |

---

## Backward Compatibility

- The `timezone` field is **optional** in `RegisterRequest`
- If timezone is not provided, backend should default to UTC or user's selected timezone
- Existing API endpoints are not affected
- Can be gradually rolled out without breaking changes

---

## Next Steps

1. **Update backend** to accept and store timezone in registration
2. **Use timezone** for scheduling reminders in user's local time
3. **Display times** correctly across different timezones
4. **(Optional)** Add timezone selection UI for users to override auto-detected timezone
5. **(Optional)** Add timezone display on user profile

---

## Future Enhancements

### 1. Manual Timezone Selection
Allow users to override auto-detected timezone:
```typescript
// In settings screen
const [selectedTimezone, setSelectedTimezone] = useState(getUserTimezone());
const updateUserTimezone = useUpdateUserTimezone();
```

### 2. Timezone Display on Settings
Show user's current timezone:
```typescript
<Text>Your timezone: {formatTimezoneForDisplay(getUserTimezone())}</Text>
<Text>Current time: {getCurrentTimeInTimezone(getUserTimezone())}</Text>
```

### 3. Multiple Timezone Support
For users in different regions:
```typescript
const displayTimes = [
  { timezone: "America/New_York", time: ... },
  { timezone: "Europe/London", time: ... },
  { timezone: "Asia/Tokyo", time: ... },
]
```

### 4. Timezone-Aware Reminder Creation
Ensure reminders respect user's timezone:
```typescript
// When user sets "9:00 AM" reminder
const userTz = getUserTimezone();
const remindAt = convertToUTC("09:00", userTz);
```

---

## Troubleshooting

### Issue: Timezone not detected
**Solution:** Check browser console for errors. Fallback uses UTC offset.

### Issue: Wrong timezone detected
**Solution:** Check device/browser timezone settings. Timezone detection reads device settings.

### Issue: Backend not receiving timezone
**Solution:** Check network tab in DevTools. Verify timezone is in request body.

### Issue: DST not handled
**Solution:** Use backend's timezone library (pytz, zoneinfo) to handle DST automatically.

---

## Support

For timezone-related issues:
1. Check console logs (look for `[TimezoneUtils]` or `[RegisterScreen]` logs)
2. Verify device timezone settings
3. Test with `getUserTimezone()` directly
4. Check backend timezone handling

---

## Summary

Timezone detection is now **fully integrated** into the registration flow:
- ✅ Automatic timezone detection
- ✅ Sent to backend during registration
- ✅ Comprehensive timezone utilities available
- ✅ Ready for backend integration
- ✅ Backward compatible
- ✅ Well documented

Users' timezones will be automatically detected and stored, enabling proper reminder scheduling and time display across different regions! 🌍

# Token Expiration Redirect Implementation

## Overview

When a user's authentication token expires, they are now automatically redirected to the Login screen instead of staying on their current screen with an expired token.

---

## How It Works

### Flow Diagram

```
User makes API call with expired token
    ↓
Backend returns 401 Unauthorized
    ↓
Axios response interceptor catches error
    ↓
Calls handleUnauthorizedError() from authErrorHandler
    ↓
Shows Alert: "Session Expired - Please log in again"
    ↓
When user clicks OK:
  1. AuthContext.signOut() is called
  2. Token and userId are cleared from storage
  3. React Query cache is cleared
  4. Navigation resets to Login screen
  5. User sees Login page
```

---

## Files Created/Modified

### 1. ✅ NEW: `src/utils/authErrorHandler.ts`

**Purpose**: Bridge between API layer and AuthContext to handle auth errors globally

**Key Functions**:
```typescript
// Register error handlers (called from App.tsx on startup)
registerAuthErrorHandlers(onUnauthorized, onNavigateToLogin)

// Handle 401 errors (called from API interceptor)
handleUnauthorizedError(errorMessage?: string)

// Check if error is auth-related
isAuthError(error: any): boolean
```

**Features**:
- Decouples API layer from AuthContext (avoids circular dependencies)
- Stores callbacks to signOut and navigate
- Shows user-friendly alert about session expiration
- Can be extended for other auth errors (403 Forbidden, etc.)

---

### 2. 📝 MODIFIED: `services/api.ts`

**Changes**:
1. **Line 10**: Import auth error handler
   ```typescript
   import { handleUnauthorizedError } from "../src/utils/authErrorHandler";
   ```

2. **Lines 230-233**: Call error handler on 401 status
   ```typescript
   if (error.response?.status === 401) {
     console.warn('401 Unauthorized - Token may be expired');
     // Handle unauthorized error (will trigger logout and redirect)
     handleUnauthorizedError(error.response?.data?.detail || 'Session expired');
   }
   ```

**Result**: Every 401 error from the backend now triggers automatic logout and redirect

---

### 3. 📝 MODIFIED: `App.tsx`

**Changes**:

1. **Lines 2, 25**: Added imports
   ```typescript
   import { useRef } from "react";
   import { NavigationContainerRef } from "@react-navigation/native";
   import { registerAuthErrorHandlers } from "./src/utils/authErrorHandler";
   ```

2. **Line 30**: Create navigation ref
   ```typescript
   const navigationRef = useRef<NavigationContainerRef<any>>(null);
   ```

3. **Lines 125-143**: Register error handlers in AppContent
   ```typescript
   useEffect(() => {
     const onUnauthorized = async () => {
       console.log('[App] Unauthorized error - calling signOut');
       await signOut();
     };

     const onNavigateToLogin = () => {
       console.log('[App] Redirecting to Login screen');
       navigationRef.current?.reset({
         index: 0,
         routes: [{ name: 'Login' }],
       });
     };

     registerAuthErrorHandlers(onUnauthorized, onNavigateToLogin);
   }, [signOut]);
   ```

4. **Line 157**: Attach ref to NavigationContainer
   ```typescript
   <NavigationContainer ref={navigationRef}>
   ```

**Result**: Navigation is now available for auth error handling

---

## What Happens When Token Expires

### Scenario: User is on HomeScreen when token expires

1. **User triggers API call** (e.g., fetching mood data)
   ```
   [App] Making GET /api/mood/history
   ```

2. **Backend returns 401**
   ```
   Status: 401 Unauthorized
   Message: "Token has expired"
   ```

3. **Axios interceptor catches error**
   ```
   [API Error] { status: 401, message: "..." }
   ```

4. **Auth error handler is triggered**
   ```
   [AuthErrorHandler] Handling 401 Unauthorized error
   ```

5. **User sees alert**
   ```
   Alert:
     Title: "Session Expired"
     Message: "Your session has expired. Please log in again."
     Button: "OK"
   ```

6. **When user clicks OK**:
   - `signOut()` is called
   - Token is cleared from storage
   - React Query cache is cleared
   - Navigation resets to Login screen
   - User sees Login screen

**Console output**:
```
[API Error]: status: 401
[AuthErrorHandler] Handling 401 Unauthorized error
[App] Unauthorized error - calling signOut
 Signing out...
[App] Redirecting to Login screen
```

---

## Error Scenarios Handled

### ✅ Token Expired During API Call
- User is mid-session, makes an API call
- Backend detects expired token
- User is logged out and redirected

### ✅ Token Expired While User is Idle
- If user stays on a screen for a long time
- Next time they interact (make API call)
- Session expired handling kicks in

### ✅ Invalid Token
- Token is malformed or invalid
- Same handling as expired token

### ✅ Multiple Simultaneous API Calls
- If multiple calls fail with 401 simultaneously
- Alert shows only once (subsequent errors are queued)
- User is redirected to Login

---

## Console Logs to Look For

When testing token expiration, you should see:

```
// When API call fails with 401
[API Error]: {
  message: "Request failed with status code 401",
  url: "/api/mood/history",
  status: 401,
  data: { detail: "Token has expired" }
}

// Error handler triggers
[AuthErrorHandler] Handling 401 Unauthorized error

// Sign out begins
[App] Unauthorized error - calling signOut
 Signing out...

// Navigation reset
[App] Redirecting to Login screen
```

---

## Testing the Implementation

### Test 1: Manual Token Expiration

1. Open app and log in
2. Open DevTools (if on web)
3. Go to Application → Storage → (SecureStore/AsyncStorage)
4. Find and modify the `auth_token` (make it invalid)
5. Make an API call in the app
6. Expected: Alert shows "Session Expired" → redirects to Login

### Test 2: Backend Token Expiration

1. Log in normally
2. Wait for token to actually expire (set short expiration in backend)
3. Make an API call
4. Expected: Alert shows → redirects to Login

### Test 3: Multiple API Calls

1. Log in
2. Make token invalid
3. Trigger multiple API calls rapidly
4. Expected: All fail with 401 → single alert → redirect once

---

## Files That Did NOT Need Changes

✅ **`src/context/AuthContext.tsx`**: Already had `signOut()` function with proper cleanup
- Clears storage ✓
- Clears React Query cache ✓
- Sets tokens to null ✓

✅ **`src/navigation/AppNavigator.tsx`**: Navigation structure handles the reset properly

---

## Future Enhancements

### Optional: Persist Last Route
```typescript
// Store the route user was on before logout
const lastRoute = getCurrentRouteName();
await storage.setItem('lastRoute', lastRoute);

// After login, return user to that route
const lastRoute = await storage.getItem('lastRoute');
if (lastRoute) navigate(lastRoute);
```

### Optional: Network Status Check
```typescript
// Check if error is due to network vs. actual 401
if (!isNetworkConnected()) {
  showNetworkError();
} else if (is401Error(error)) {
  handleUnauthorizedError();
}
```

### Optional: Refresh Token Logic
```typescript
// Attempt to refresh token before logging out
try {
  const newToken = await refreshToken();
  setToken(newToken);
  // Retry original request
} catch (e) {
  // Token refresh failed, log out
  handleUnauthorizedError();
}
```

---

## Summary

✅ **What Changed**:
1. Created auth error handler to bridge API and Auth layers
2. Updated API interceptor to call error handler on 401
3. Set up navigation ref in App.tsx
4. Registered error handlers on app startup

✅ **User Experience**:
- Session expiration is detected automatically
- User sees friendly alert about session expiration
- User is automatically redirected to Login
- All session data is properly cleared

✅ **Technical Benefits**:
- Centralized auth error handling
- No circular dependencies
- Extensible for other auth errors
- Proper cleanup of storage and cache

🚀 **Status**: Ready to use! Token expiration redirect is now fully functional.

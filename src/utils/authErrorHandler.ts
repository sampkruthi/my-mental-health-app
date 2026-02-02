/**
 * Authentication Error Handler
 * Bridges API layer errors with AuthContext to handle token expiration
 * and other auth-related errors globally
 */

import { Alert } from 'react-native';

// Types for the callbacks
type OnUnauthorizedCallback = () => void;
type OnNavigateToLoginCallback = () => void;

// Store callbacks registered by the app
let onUnauthorizedCallback: OnUnauthorizedCallback | null = null;
let onNavigateToLoginCallback: OnNavigateToLoginCallback | null = null;

/**
 * Register callbacks that will be triggered on auth errors
 * Called from App.tsx after auth context is ready
 */
export function registerAuthErrorHandlers(
  onUnauthorized: OnUnauthorizedCallback,
  onNavigateToLogin: OnNavigateToLoginCallback
) {
  onUnauthorizedCallback = onUnauthorized;
  onNavigateToLoginCallback = onNavigateToLogin;
  console.log('[AuthErrorHandler] Handlers registered');
}

/**
 * Handle 401 Unauthorized errors (token expired, invalid, etc.)
 * This is called from the API response interceptor
 */
export function handleUnauthorizedError(errorMessage?: string) {
  console.warn('[AuthErrorHandler] Handling 401 Unauthorized error');

  // Show alert to user
  Alert.alert(
    'Session Expired',
    'Your session has expired. Please log in again.',
    [
      {
        text: 'OK',
        onPress: () => {
          // Trigger logout and redirect
          if (onUnauthorizedCallback) {
            onUnauthorizedCallback();
          }
          if (onNavigateToLoginCallback) {
            onNavigateToLoginCallback();
          }
        },
      },
    ],
    { cancelable: false }
  );
}

/**
 * Handle other auth errors (forbidden, etc.)
 */
export function handleAuthError(error: any) {
  const status = error.response?.status;
  const message = error.response?.data?.detail || error.message;

  if (status === 401) {
    handleUnauthorizedError(message);
  } else if (status === 403) {
    Alert.alert('Access Denied', 'You do not have permission to access this resource.');
  } else {
    // Generic auth error
    console.error('[AuthErrorHandler] Auth error:', error);
  }
}

/**
 * Check if error is an auth-related error
 */
export function isAuthError(error: any): boolean {
  const status = error?.response?.status;
  return status === 401 || status === 403;
}

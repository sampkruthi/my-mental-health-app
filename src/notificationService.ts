// src/services/notificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import { storage, STORAGE_KEYS } from '../src/utils/storage';

/**
 * Notification Service
 * Handles notification permissions, device token management, and notification listeners
 */

const isNotificationsAvailable = (): boolean => {
  return (
    Notifications &&
    typeof Notifications.addNotificationResponseReceivedListener === 'function'
  );
};

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from user
 * @returns true if permission granted, false otherwise
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    console.log('[NotificationService] Requesting notification permissions');

    const { status } = await Notifications.getPermissionsAsync();
    console.log('[NotificationService] Current permission status:', status);

    if (status === 'granted') {
      console.log('[NotificationService] Notification permission already granted');
      return true;
    }

    if (status === 'denied') {
      console.log('[NotificationService] Notification permission denied by user');
      return false;
    }

    // Request permission if undetermined
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    console.log('[NotificationService] Permission request result:', newStatus);

    return newStatus === 'granted';
  } catch (error) {
    console.error('[NotificationService] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Get Expo Push Token for this device
 * @returns device token string or null if unable to get token
 */
export async function getExpoNotificationToken(): Promise<string | null> {
  try {
    console.log('[NotificationService] Getting Expo notification token');

    const token = await Notifications.getExpoPushTokenAsync();
    console.log('[NotificationService] Expo token obtained:', token.data);

    return token.data;
  } catch (error) {
    console.error('[NotificationService] Error getting token:', error);
    return null;
  }
}

/**
 * Store device token in local storage
 * @param token - The device token to store
 */
export async function storeDeviceToken(token: string): Promise<void> {
  try {
    await storage.setItem('expo_push_token', token);
    console.log('[NotificationService] Device token stored locally');
  } catch (error) {
    console.error('[NotificationService] Error storing device token:', error);
  }
}

/**
 * Retrieve stored device token from local storage
 * @returns stored device token or null
 */
export async function getStoredDeviceToken(): Promise<string | null> {
  try {
    return await storage.getItem('expo_push_token');
  } catch (error) {
    console.error('[NotificationService] Error retrieving device token:', error);
    return null;
  }
}

/**
 * Check if device token has changed and needs to be re-registered
 * @param newToken - The newly acquired token
 * @returns true if token is different from stored token
 */
export async function hasTokenChanged(newToken: string): Promise<boolean> {
  const storedToken = await getStoredDeviceToken();
  return storedToken !== newToken;
}

/**
 * Get platform identifier for backend registration
 * @returns platform string: "ios", "android", or "web"
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'web';
}

/**
 * Register notification listener for when notification is received (app in foreground)
 * @param callback - Function to call when notification is received
 * @returns unsubscribe function
 */
export function onNotificationReceived(
  callback: (notification: Notifications.Notification) => void
): () => void {
  console.log('[NotificationService] Setting up notification received listener');

  if (!isNotificationsAvailable()) {
    console.warn('[NotificationService] Notifications not available');
    return () => {}; // Return empty unsubscribe function
  }

  const subscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[NotificationService] Notification received:', notification);
    callback(notification);
  });

  return () => {
    subscription.remove();
    console.log('[NotificationService] Notification received listener removed');
  };
}

/**
 * Register notification response listener for when user taps notification
 * @param callback - Function to call when user responds to notification
 * @returns unsubscribe function
 */
export function onNotificationResponse(
  callback: (response: Notifications.NotificationResponse) => void
): () => void {
  console.log('[NotificationService] Setting up notification response listener');

  if (!isNotificationsAvailable()) {
    console.warn('[NotificationService] Notifications not available');
    return () => {};
  }

  const subscription = Notifications.addNotificationResponseListener((response) => {
    console.log('[NotificationService] Notification response received:', response);
    callback(response);
  });

  return () => {
    subscription.remove();
    console.log('[NotificationService] Notification response listener removed');
  };
}

/**
 * Complete notification setup process
 * - Request permissions
 * - Get device token
 * - Store token locally
 * - Return token for registration
 */
export async function initializeNotifications(): Promise<string | null> {
  try {
    console.log('[NotificationService] Initializing notifications...');

    if (!isNotificationsAvailable()) {
      console.warn('[NotificationService] Notifications module not available');
      return null;
    }

    // Step 1: Request permission
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      console.warn('[NotificationService] Notification permission not granted');
      return null;
    }

    // Step 2: Get device token
    const token = await getExpoNotificationToken();
    if (!token) {
      console.error('[NotificationService] Failed to get device token');
      return null;
    }

    // Step 3: Store token locally for future reference
    await storeDeviceToken(token);

    console.log('[NotificationService] Notifications initialized successfully');
    return token;
  } catch (error) {
    console.error('[NotificationService] Error initializing notifications:', error);
    return null;
  }
}

/**
 * Handle notification response when user taps notification
 * Useful for navigating to relevant screen based on notification data
 */
export function handleNotificationResponse(response: Notifications.NotificationResponse): void {
  const { notification } = response;
  const { data } = notification.request.content;

  console.log('[NotificationService] Handling notification response with data:', data);

  if (data?.type === 'reminder') {
    const reminderType = data.reminder_type;
    console.log(`[NotificationService] Reminder notification tapped: ${reminderType}`);
    // Could navigate to relevant screen based on reminderType
    // e.g., navigate to RemindersScreen or show a modal
  }
}

/**
 * Test sending a local notification (for development/testing)
 */
export async function sendTestNotification(): Promise<void> {
  try {
    console.log('[NotificationService] Sending test notification');

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧘 Test Notification',
        body: 'This is a test notification from your Mental Health App',
        data: { type: 'test' },
        sound: 'default',
      },
      trigger: { seconds: 2 }, // Send after 2 seconds
    });

    console.log('[NotificationService] Test notification scheduled');
  } catch (error) {
    console.error('[NotificationService] Error sending test notification:', error);
  }
}

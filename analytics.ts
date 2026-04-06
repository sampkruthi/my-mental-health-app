// src/services/analytics.ts
// Centralized analytics service using Mixpanel.
//
// SETUP:
//   1. npm install mixpanel-react-native
//   2. npm install @react-native-async-storage/async-storage  (if not already installed)
//   3. Get your Project Token from mixpanel.com → Project Settings
//   4. Replace 'YOUR_MIXPANEL_PROJECT_TOKEN' below with your token
//
// USAGE:
//   import { analytics } from '../services/analytics';
//   analytics.track('chat_sent', { messageLength: 42 });

import { Mixpanel } from 'mixpanel-react-native';
import { Platform } from 'react-native';

const MIXPANEL_TOKEN = 'ebc3201fabc6c295c8b910d37fff6064'; // ← Replace with your token

// Use JavaScript mode for Expo compatibility
const trackAutomaticEvents = false;
const useNative = false;

const mixpanel = new Mixpanel(MIXPANEL_TOKEN, trackAutomaticEvents, useNative);
mixpanel.init();

// Set platform as a super property (attached to every event automatically)
mixpanel.registerSuperProperties({
  platform: Platform.OS,
});

/**
 * Analytics service — wraps Mixpanel with domain-specific methods.
 * 
 * All methods are fire-and-forget (no awaits needed in calling code).
 * If Mixpanel is down or the token is invalid, events silently fail.
 */
export const analytics = {
  // ──────────────────────────────────────────
  // User Identity
  // ──────────────────────────────────────────

  /** Call after login/register to associate events with a user. */
  identify(userId: string) {
    mixpanel.identify(userId);
  },

  /** Set user profile properties (shown in Mixpanel's Users tab). */
  setUserProfile(props: {
    name?: string;
    email?: string;
    signupMethod?: 'email' | 'google' | 'apple';
    timezone?: string;
  }) {
    const profileProps: Record<string, string> = {};
    if (props.name) profileProps['$name'] = props.name;
    if (props.email) profileProps['$email'] = props.email;
    if (props.signupMethod) profileProps['signup_method'] = props.signupMethod;
    if (props.timezone) profileProps['timezone'] = props.timezone;
    mixpanel.getPeople().set(profileProps);
  },

  /** Call on logout to reset identity. */
  reset() {
    mixpanel.reset();
  },

  // ──────────────────────────────────────────
  // Generic tracking
  // ──────────────────────────────────────────

  track(event: string, properties?: Record<string, any>) {
    mixpanel.track(event, properties);
  },

  // ──────────────────────────────────────────
  // Screen Views
  // ──────────────────────────────────────────

  screenViewed(screenName: string) {
    mixpanel.track('screen_viewed', { screen: screenName });
  },

  // ──────────────────────────────────────────
  // Auth Events
  // ──────────────────────────────────────────

  signupCompleted(method: 'email' | 'google' | 'apple') {
    mixpanel.track('signup_completed', { method });
  },

  loginCompleted(method: 'email' | 'google' | 'apple') {
    mixpanel.track('login_completed', { method });
  },

  logoutCompleted() {
    mixpanel.track('logout_completed');
    mixpanel.reset();
  },

  // ──────────────────────────────────────────
  // Chat Events
  // ──────────────────────────────────────────

  chatMessageSent(messageLength: number) {
    mixpanel.track('chat_message_sent', {
      message_length: messageLength,
    });
  },

  chatResponseReceived(responseLength: number, hasCitations: boolean) {
    mixpanel.track('chat_response_received', {
      response_length: responseLength,
      has_citations: hasCitations,
    });
  },

  chatHistoryCleared() {
    mixpanel.track('chat_history_cleared');
  },

  chatDisclaimerAccepted() {
    mixpanel.track('chat_disclaimer_accepted');
  },

  chatIntroViewed() {
    mixpanel.track('chat_intro_viewed');
  },

  chatIntroDismissed() {
    mixpanel.track('chat_intro_dismissed');
  },

  // ──────────────────────────────────────────
  // Mood Events
  // ──────────────────────────────────────────

  moodLogged(score: number) {
    mixpanel.track('mood_logged', { score });
    // Also increment the total count on the user profile
    mixpanel.getPeople().increment('total_moods_logged', 1);
  },

  // ──────────────────────────────────────────
  // Journal Events
  // ──────────────────────────────────────────

  journalEntryCreated(wordCount: number) {
    mixpanel.track('journal_entry_created', { word_count: wordCount });
    mixpanel.getPeople().increment('total_journal_entries', 1);
  },

  journalEntryViewed() {
    mixpanel.track('journal_entry_viewed');
  },

  // ──────────────────────────────────────────
  // Activity Events
  // ──────────────────────────────────────────

  activityStarted(title: string, type: string) {
    mixpanel.track('activity_started', { title, type });
  },

  activityCompleted(title: string, type: string) {
    mixpanel.track('activity_completed', { title, type });
    mixpanel.getPeople().increment('total_activities_completed', 1);
  },

  activityAudioPlayed(title: string) {
    mixpanel.track('activity_audio_played', { title });
  },

  // ──────────────────────────────────────────
  // Resource Events
  // ──────────────────────────────────────────

  resourceViewed(title: string, contentType: string, relevanceScore?: number) {
    mixpanel.track('resource_viewed', {
      title,
      content_type: contentType,
      relevance_score: relevanceScore,
    });
  },

  resourceLinkOpened( url: string) {
    mixpanel.track('resource_link_opened', { url });
  },

  resourcesIntroViewed() {
    mixpanel.track('resources_intro_viewed');
  },

  resourcesIntroDismissed() {
    mixpanel.track('resources_intro_dismissed');
  },

  // ──────────────────────────────────────────
  // Reminder Events
  // ──────────────────────────────────────────

  reminderCreated(type: string) {
    mixpanel.track('reminder_created', { type });
  },

  reminderDeleted() {
    mixpanel.track('reminder_deleted');
  },

  // ──────────────────────────────────────────
  // Navigation Events
  // ──────────────────────────────────────────

  bottomNavTapped(tab: string) {
    mixpanel.track('bottom_nav_tapped', { tab });
  },

  drawerMenuOpened() {
    mixpanel.track('drawer_menu_opened');
  },

  // ──────────────────────────────────────────
  // Error Events
  // ──────────────────────────────────────────

  errorOccurred(screen: string, error: string) {
    mixpanel.track('error_occurred', { screen, error });
  },

  // ──────────────────────────────────────────
  // Push Notification Events
  // ──────────────────────────────────────────

  pushNotificationReceived(type: string) {
    mixpanel.track('push_notification_received', { type });
  },

  pushNotificationTapped(type: string) {
    mixpanel.track('push_notification_tapped', { type });
  },
};

export default analytics;
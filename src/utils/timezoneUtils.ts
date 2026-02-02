// src/utils/timezoneUtils.ts
/**
 * Timezone Utilities
 * Provides functions to detect and work with user's timezone
 */

/**
 * Get user's timezone identifier (e.g., "America/New_York")
 * Uses the browser/device's local timezone settings
 *
 * @returns Timezone string in IANA format (e.g., "America/Los_Angeles")
 */
export function getUserTimezone(): string {
  try {
    // Method 1: Try to get timezone from Intl API (most reliable)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('[TimezoneUtils] Detected timezone:', timezone);
    return timezone;
  } catch (error) {
    console.warn('[TimezoneUtils] Error detecting timezone:', error);
    // Fallback: return UTC offset if Intl fails
    return getUTCOffsetString();
  }
}

/**
 * Get the UTC offset for the user's timezone
 * @returns UTC offset string (e.g., "-05:00" for EST)
 */
export function getUTCOffset(): number {
  const now = new Date();
  return now.getTimezoneOffset(); // Returns offset in minutes
}

/**
 * Get UTC offset as formatted string
 * @returns Formatted offset string (e.g., "-05:00" or "+09:00")
 */
export function getUTCOffsetString(): string {
  const offsetMinutes = getUTCOffset();
  const offsetHours = Math.abs(offsetMinutes) / 60;
  const sign = offsetMinutes <= 0 ? '+' : '-';
  const hours = String(Math.floor(offsetHours)).padStart(2, '0');
  const minutes = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');
  return `${sign}${hours}:${minutes}`;
}

/**
 * Get timezone info including offset and DST status
 * @returns Object with timezone, offset, and DST info
 */
export function getTimezoneInfo(): {
  timezone: string;
  utcOffset: number;
  utcOffsetString: string;
  isDST: boolean;
} {
  const timezone = getUserTimezone();
  const utcOffset = getUTCOffset();
  const utcOffsetString = getUTCOffsetString();

  // Check if DST is active (compare offset in January vs July)
  const january = new Date(new Date().getFullYear(), 0, 1).getTimezoneOffset();
  const july = new Date(new Date().getFullYear(), 6, 1).getTimezoneOffset();
  const isDST = utcOffset !== january;

  return {
    timezone,
    utcOffset,
    utcOffsetString,
    isDST,
  };
}

/**
 * Get all common timezone names for reference
 * Useful for displaying to user or validation
 */
export const COMMON_TIMEZONES = [
  // Americas
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Toronto',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'America/Buenos_Aires',

  // Europe
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Moscow',
  'Europe/Istanbul',

  // Asia
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Hong_Kong',
  'Asia/Singapore',

  // Oceania
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',

  // Africa
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',

  // UTC
  'UTC',
];

/**
 * Validate if a timezone string is valid IANA timezone
 * @param timezone - Timezone string to validate
 * @returns true if valid, false otherwise
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    console.warn(`[TimezoneUtils] Invalid timezone: ${timezone}`);
    return false;
  }
}

/**
 * Format timezone info for display
 * @param timezone - Timezone string
 * @returns Formatted string (e.g., "Eastern Standard Time (UTC-05:00)")
 */
export function formatTimezoneForDisplay(timezone: string): string {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'long',
    });

    const parts = formatter.formatToParts(date);
    const timezonePart = parts.find((part) => part.type === 'timeZoneName');
    const offsetString = getUTCOffsetString();

    if (timezonePart) {
      return `${timezonePart.value} (UTC${offsetString})`;
    }

    return `${timezone} (UTC${offsetString})`;
  } catch (error) {
    console.warn('[TimezoneUtils] Error formatting timezone:', error);
    return timezone;
  }
}

/**
 * Convert a time in user's timezone to another timezone
 * @param date - Date to convert
 * @param fromTimezone - From timezone (default: user's timezone)
 * @param toTimezone - To timezone
 * @returns Date adjusted for target timezone
 */
export function convertTimezone(
  date: Date,
  fromTimezone: string = getUserTimezone(),
  toTimezone: string
): Date {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: toTimezone,
    });

    const parts = formatter.formatToParts(date);
    const dateParts = {} as Record<string, string>;

    for (const part of parts) {
      dateParts[part.type] = part.value;
    }

    const newDate = new Date(
      `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}Z`
    );

    return newDate;
  } catch (error) {
    console.warn('[TimezoneUtils] Error converting timezone:', error);
    return date;
  }
}

/**
 * Get current time in a specific timezone
 * @param timezone - Timezone string
 * @returns Formatted time string
 */
export function getCurrentTimeInTimezone(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    return formatter.format(now);
  } catch (error) {
    console.warn('[TimezoneUtils] Error getting time in timezone:', error);
    return '';
  }
}

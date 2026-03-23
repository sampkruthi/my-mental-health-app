// src/styles/theme.ts

export const lightTheme = {
  // ── PRIMARY RAMP (teal) ──
  primary: "#1AABBA",
  primaryDark: "#0e918c",
  primaryContainer: "#d4f4f4",
  primaryFixedDim: "#a8e4e0",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#0a5e5c",

  // ── SURFACE RAMP (parchment) ──
  surface: "#fbf9f2",
  surfaceContainerLow: "#f4f4eb",
  surfaceContainerHigh: "#dcdece",
  surfaceContainerHighest: "#e2e3d8",
  surfaceContainerLowest: "#ffffff",

  // ── TEXT & OUTLINES ──
  onSurface: "#31332b",
  onSurfaceVariant: "#5e6057",
  outlineVariant: "#b1b3a8",

  // ── Legacy aliases (keep existing consumers working) ──
  background: "#fbf9f2",
  backgroundGradientStart: "#fbf9f2",
  backgroundGradientEnd: "#f4f4eb",
  cardBackground: "#f4f4eb",

  text: "#31332b",
  textSecondary: "#5e6057",
  textLight: "#b1b3a8",
  subText: "#5e6057",

  secondary: "#A8D5BA",
  accent: "#E8B4A8",

  // Input fields
  inputBackground: "#fbf9f2",
  inputBorder: "rgba(26, 171, 186, 0.2)",
  inputBorderFocused: "#1AABBA",

  // Buttons
  buttonPrimary: "#1AABBA",
  buttonPrimaryDark: "#0e918c",
  buttonText: "#FFFFFF",

  // Header
  headerBackground: "#1AABBA",
  headerText: "#FFFFFF",

  // Icons
  iconPrimary: "#1AABBA",
  iconSecondary: "#8FB5A8",
  iconTertiary: "#E8B4A8",

  // Chat bubbles
  userBubble: "#D4F1E8",
  aiBubble: "#F0EEFA",

  // Other
  logoTint: "#1AABBA",
  fontFamily: "System",
  divider: "rgba(26, 171, 186, 0.15)",

  // Status colors
  success: "#81C995",
  warning: "#F4C8A6",
  error: "#E8A5A5",
  info: "#C5D8E8",

  // Shadow definitions (on-surface instead of pure black)
  shadowSoft: {
    shadowColor: "#31332b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  shadowMedium: {
    shadowColor: "#31332b",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const darkTheme: typeof lightTheme = {
  // ── PRIMARY RAMP (teal – dark mode) ──
  primary: "#7B9AAF",
  primaryDark: "#5B7C99",
  primaryContainer: "#1A3A3A",
  primaryFixedDim: "#3A6A68",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#a8e4e0",

  // ── SURFACE RAMP (dark) ──
  surface: "#1E1E1E",
  surfaceContainerLow: "#2A2A2A",
  surfaceContainerHigh: "#3A3A3A",
  surfaceContainerHighest: "#444444",
  surfaceContainerLowest: "#161616",

  // ── TEXT & OUTLINES ──
  onSurface: "#F0F0F0",
  onSurfaceVariant: "#BBBBBB",
  outlineVariant: "#555555",

  // ── Legacy aliases ──
  background: "#1E1E1E",
  backgroundGradientStart: "#1E1E1E",
  backgroundGradientEnd: "#2A2A2A",
  cardBackground: "#2A2A2A",

  text: "#F0F0F0",
  textSecondary: "#BBBBBB",
  textLight: "#888888",
  subText: "#BBBBBB",

  secondary: "#8FB5A8",
  accent: "#A8C9DD",

  // Input fields
  inputBackground: "#2E2E2E",
  inputBorder: "#555555",
  inputBorderFocused: "#7B9AAF",

  // Buttons
  buttonPrimary: "#7B9AAF",
  buttonPrimaryDark: "#5B7C99",
  buttonText: "#FFFFFF",

  // Header
  headerBackground: "#2E2E2E",
  headerText: "#FFFFFF",

  // Icons
  iconPrimary: "#7B9AAF",
  iconSecondary: "#8FB5A8",
  iconTertiary: "#D4A574",

  // Chat bubbles
  userBubble: "#2E4F3E",
  aiBubble: "#3A3A4A",

  // Other
  logoTint: "#7B9AAF",
  fontFamily: "System",
  divider: "#444444",

  // Status colors
  success: "#8FB5A8",
  warning: "#F4C8A6",
  error: "#E8A5A5",
  info: "#C5D8E8",

  // Shadow definitions
  shadowSoft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
  shadowMedium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
};
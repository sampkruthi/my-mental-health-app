// src/styles/theme.ts

export const lightTheme = {
  
  background: "#fbf9f2",
  backgroundGradientStart: "#fbf9f2",
  backgroundGradientEnd: "#f4f4eb",
  cardBackground:"#FFFFFF",// "#f4f4eb", 
  
  /* Backgrounds Original before reworking activities in Claude
  background: "#FAF8F5",  // Changed from #F5F3EE (warmer cream)
  backgroundGradientStart: "#FAF8F5",
  backgroundGradientEnd: "#F0EDE8",  // Changed from #E8E5DF
  cardBackground: "#FFFFFF",  // Changed from rgba - cleaner white
  
*/

  // Text colors
  text: "#2D3748",  // Slightly richer black
  textSecondary: "#718096",  // Good as is
  textLight: "#A0AEC0",  // Good as is
  subText: "#718096",

  
  // Primary brand colors - warmer teal/sage instead of blue-gray
  primary: "#1aabba",
  primaryDark: "#0d96a8",
  primaryContainer: "#d4f4f4",
  primaryFixedDim: "#a8e4e0",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#0a5e5c",
  //secondary: "#A8D5BA",  // Keep this green
  //accent: "#E8B4A8",  // Changed to coral for warmth
  
  // ── SURFACE RAMP (parchment) ──
  surface: "#fbf9f2",
  surfaceContainerLow: "#FFFFFF",
  surfaceContainerHigh: "#dcdece",
  surfaceContainerHighest: "#e2e3d8",
  surfaceContainerLowest: "#ffffff",
 
  // ── TEXT & OUTLINES ──
  onSurface: "#31332b",
  onSurfaceVariant: "#5e6057",
  outlineVariant: "#b1b3a8",

  // Input fields
  inputBackground: "#FAF8F5",
  inputBorder: "rgba(26, 171, 186, 0.2)",  // Updated to match new primary
  inputBorderFocused: "#1aabba",
  
  // Buttons
  buttonPrimary: "#1aabba",
  buttonPrimaryDark: "#0d96a8",
  buttonText: "#FFFFFF",
  
  // Header
  headerBackground: "#1aabba",  // Updated
  headerText: "#FFFFFF",
  
  // Icons
  iconPrimary: "#1aabba",
  iconSecondary: "#8FB5A8",
  iconTertiary: "#E8B4A8",
  
  // Chat bubbles - MORE VISIBLE
  userBubble: "#D4F1E8",    // Stronger mint green (CHANGED)
  aiBubble: "#F0EEFA",      // Soft lavender
  
  // Other
  logoTint: "#1aabba",
  fontFamily: "System",
  divider: "rgba(26, 171, 186, 0.15)",
  
  // Status colors
  success: "#81C995",
  warning: "#F4C8A6",
  error: "#E8A5A5",
  info: "#C5D8E8",
  
  // Shadow definitions
  shadowSoft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  shadowMedium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const darkTheme = {
  // Backgrounds
  background: "#1E1E1E",
  backgroundGradientStart: "#1E1E1E",
  backgroundGradientEnd: "#2A2A2A",
  cardBackground: "#2A2A2A",

  // Text colors
  text: "#F0F0F0",
  textSecondary: "#BBBBBB",
  textLight: "#888888",
  subText: "#BBBBBB",

  // Primary brand colors
  primary: "#7B9AAF",
  primaryDark: "#5B7C99",
  primaryContainer: "#1A3A3A",
  primaryFixedDim: "#3A6A68",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#a8e4e0",
  //secondary: "#8FB5A8",
  //accent: "#A8C9DD",

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
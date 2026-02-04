// src/styles/theme.ts

export const lightTheme = {
  // Backgrounds
  background: "#FAF8F5",  // Changed from #F5F3EE (warmer cream)
  backgroundGradientStart: "#FAF8F5",
  backgroundGradientEnd: "#F0EDE8",  // Changed from #E8E5DF
  cardBackground: "#FFFFFF",  // Changed from rgba - cleaner white
  
  // Text colors
  text: "#2D3748",  // Slightly richer black
  textSecondary: "#718096",  // Good as is
  textLight: "#A0AEC0",  // Good as is
  subText: "#718096",

  
  // Primary brand colors - warmer teal/sage instead of blue-gray
  primary: "#5B9EB3", //, //#66B6A3", //Using brighter mint // "#7C9BA7",  // Your new sage/teal
  primaryDark:"#4A8FA5",  //"#4A8FA5",// '#52A08E', //"#5A7A87",
  secondary: "#A8D5BA",  // Keep this green
  accent: "#E8B4A8",  // Changed to coral for warmth
  

  // Input fields
  inputBackground: "#FAF8F5",
  inputBorder: "rgba(102, 182, 163, 0.2)",  // Updated to match new primary
  inputBorderFocused: "#66B6A3",
  
  // Buttons
  buttonPrimary: "#66B6A3",
  buttonPrimaryDark: "#52A08E",
  buttonText: "#FFFFFF",
  
  // Header
  headerBackground: "#66B6A3",  // Updated
  headerText: "#FFFFFF",
  
  // Icons
  iconPrimary: "#66B6A3",
  iconSecondary: "#8FB5A8",
  iconTertiary: "#E8B4A8",
  
  // Chat bubbles - MORE VISIBLE
  userBubble: "#D4F1E8",    // Stronger mint green (CHANGED)
  aiBubble: "#F0EEFA",      // Soft lavender
  
  // Other
  logoTint: "#66B6A3",
  fontFamily: "System",
  divider: "rgba(102, 182, 163, 0.15)",
  
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
  /*
  // Input fields
  inputBackground: "#FAF8F5",  // Match background
  inputBorder: "rgba(124, 155, 167, 0.15)",  // Lighter
  inputBorderFocused: "#7C9BA7",
  
  // Buttons
  buttonPrimary: "#7C9BA7",
  buttonPrimaryDark: "#5A7A87",
  buttonText: "#FFFFFF",
  
  // Header - keep simple
  headerBackground: "#7C9BA7",  // Solid color header
  headerText: "#FFFFFF",
  
  // Icons - simplify
  iconPrimary: "#7C9BA7",
  iconSecondary: "#8FB5A8",
  iconTertiary: "#E8B4A8",  // Coral accent
  
  // Chat bubbles - more distinction
  userBubble: "#E8F5F0",  // Soft mint green
  aiBubble: "#F0EEFA",    // Very soft lavender
  
  // Other
  logoTint: "#7C9BA7",
  fontFamily: "System",
  divider: "rgba(124, 155, 167, 0.1)",
  
  // Status colors - keep as is
  success: "#81C995",
  warning: "#F4C8A6",
  error: "#E8A5A5",
  info: "#C5D8E8",
  
  // NEW: Shadow definitions
  shadowSoft: {
    shadowColor: "#7C9BA7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  shadowMedium: {
    shadowColor: "#7C9BA7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
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
  userBubble: "#E8F5E9", // Soft pastel green
  aiBubble: "#E5E5EA", //creamish color
  //aiBubble: "#F5F3EE",
  
  // Other
  logoTint: "#7B9AAF",
  fontFamily: "System",
  divider: "#444444",
  
  // Status colors
  success: "#8FB5A8",
  warning: "#F4C8A6",
  error: "#E8A5A5",
  info: "#C5D8E8",
};
*/
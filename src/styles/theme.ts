// src/theme/styles.ts

// 🎨 Pastel color palette
const pastelColors = {
  coral: "#A8A4FF",
  beige: "#F8F6FF",
  lavender: "#E6E6FA",
  mint: "#98FF98",
  peach: "#FFDAB9",
  sky: "#87CEEB",
};

export const lightTheme = {
  background: pastelColors.beige,
  cardBackground: "#ffffff",
  text: "#2C2C2C",
  subText: "#555",
  primary: pastelColors.coral,
  secondary: pastelColors.lavender,
  accent: pastelColors.mint,
  inputBackground: "#fff",
  inputBorder: "#ddd",
  buttonText: "#fff",
  headerBackground: pastelColors.lavender,
  headerText: "#2C2C2C",
  logoTint: pastelColors.coral,
  fontFamily: "System",
};

export const darkTheme = {
  background: "#1E1E1E",
  cardBackground: "#2A2A2A",
  text: "#F0F0F0",
  subText: "#bbb",
  primary: pastelColors.peach,
  secondary: pastelColors.sky,
  accent: pastelColors.mint,
  inputBackground: "#2E2E2E",
  inputBorder: "#555",
  buttonText: "#000",
  headerBackground: "#2E2E2E",
  headerText: "#fff",
  logoTint: pastelColors.peach,
  fontFamily: "System",
};

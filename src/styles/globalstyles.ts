// src/theme/globalStyles.ts
import { StyleSheet } from "react-native";
import { lightTheme } from "../styles/theme";

export const createGlobalStyles = (colors: typeof lightTheme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    text: {
      color: colors.text,
      fontFamily: colors.fontFamily,
      fontSize: 16,
    },
    header: {
      height: 60,
      backgroundColor: colors.headerBackground,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
    headerText: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.headerText,
      marginLeft: 8,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      marginVertical: 8,
    },
    buttonText: {
      color: colors.buttonText,
      fontWeight: "600",
      fontSize: 16,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      fontSize: 16,
      color: colors.text,
    },
    card: {
      backgroundColor: colors.cardBackground,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
  });

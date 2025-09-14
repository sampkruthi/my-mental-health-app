// src/components/UI/Button.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export type ButtonProps = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
};

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  disabled = false, 
  variant = "primary" 
}) => {
  const { colors } = useTheme();

  // pick button color based on variant
  const backgroundColor =
    variant === "primary"
      ? colors.primary
      : variant === "secondary"
      ? colors.secondary
      : "#A8A4FF"; // default red for danger

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor: disabled ? "#aaa" : backgroundColor },
      ]}
    >
      <Text style={[styles.text, { color: colors.buttonText }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
});

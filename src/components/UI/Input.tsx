// src/UI/Input.tsx
import React from "react";
import { TextInput } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { createGlobalStyles } from "../../styles/globalstyles";

type InputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
};

export default function Input({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
}: InputProps) {
  const { colors } = useTheme();
  const globalStyles = createGlobalStyles(colors);

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.subText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      style={globalStyles.input}
    />
  );
}

// src/components/UI/Card.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet} from "react-native";
import { useTheme } from "../../context/ThemeContext";

export type CardProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  style?: object;
};

export const Card: React.FC<CardProps> = ({ title, subtitle, onPress, style }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.cardBackground }, style]} // <-- apply passed style
    >
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.subText }]}>{subtitle}</Text>}
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 10,
    marginTop: 4,
  },
});

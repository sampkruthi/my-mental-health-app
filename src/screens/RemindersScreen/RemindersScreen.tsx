// src/screens/RemindersScreen/RemindersScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Layout from "../../components/UI/layout";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  useFetchReminders,
  useAddReminder,
  useDeleteReminder,
} from "../../api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from "../../constants/styles";
import type { Reminder1 as Reminder, NewReminder } from "../../api/types";

const { width } = Dimensions.get("window");

const REMINDER_TYPES = [
  { key: "meditation", label: "Meditation", icon: "🧘" },
  { key: "journaling", label: "Journaling", icon: "📝" },
  { key: "hydration", label: "Hydration", icon: "💧" },
  { key: "activity", label: "Activity", icon: "🏃" },
];

const ReminderScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  // Hooks
  const remindersQuery = useFetchReminders(token);
  const addMutation = useAddReminder(token);
  const deleteMutation = useDeleteReminder(token);

  // Form state
  const [type, setType] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [message, setMessage] = useState("");

  const list = remindersQuery.data || [];

  // Add reminder
  const handleAdd = () => {
    if (!type || hour === "" || minute === "") {
      alert("Please fill in reminder type, hour, and minute");
      return;
    }

    const hourNum = parseInt(hour);
    if (hourNum < 1 || hourNum > 12) {
      alert("Hour must be between 1 and 12");
      return;
    }

    const minuteNum = parseInt(minute);
    if (minuteNum < 0 || minuteNum > 59) {
      alert("Minute must be between 0 and 59");
      return;
    }

    const input: NewReminder = {
      type,
      hour: hourNum,
      minute: minuteNum,
      period,
      message,
    };

    addMutation.mutate(input, {
      onSuccess: () => {
        setType("");
        setHour("");
        setMinute("");
        setPeriod("AM");
        setMessage("");
        queryClient.invalidateQueries({ queryKey: ["reminders", "list", token] });
        Alert.alert("Success", "Reminder added successfully");
      },
    });
  };

  // Delete reminder
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id.toString(), {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["reminders", "list", token] });
        Alert.alert("Success", "Reminder deleted successfully");
      },
    });
  };

  // Render reminder card
  const renderCard = ({ item }: { item: Reminder }) => {
    const reminderType = REMINDER_TYPES.find((t) => t.key === item.type);
    const icon = reminderType?.icon || "📌";

    return (
      <View
        style={[
          styles.reminderCard,
          {
            backgroundColor: colors.cardBackground,
            ...SHADOWS.none,
          },
        ]}
      >
        <View style={styles.reminderContent}>
          <View style={styles.reminderHeader}>
            <Text style={styles.reminderIcon}>{icon}</Text>
            <Text style={[styles.reminderTitle, { color: colors.text }]}>
              {item.type} at {item.hour.toString().padStart(2, "0")}:
              {item.minute.toString().padStart(2, "0")} {item.period}
            </Text>
          </View>
          {item.message ? (
            <Text style={[styles.reminderMessage, { color: colors.subText }]}>
              {item.message}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={[styles.deleteBtn]}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (remindersQuery.isLoading) {
    return (
      <Layout title="Reminders" onNavigate={(screen) => navigation.navigate(screen as never)}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading reminders...
          </Text>
        </View>
      </Layout>
    );
  }

  if (remindersQuery.isError) {
    return (
      <Layout title="Reminders" onNavigate={(screen) => navigation.navigate(screen as never)}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Error loading reminders: {remindersQuery.error?.message}
          </Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout title="Reminders" onNavigate={(screen) => navigation.navigate(screen as never)}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: SPACING.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Add Reminder Card */}
        <View
          style={[
            styles.addReminderCard,
            {
              backgroundColor: colors.cardBackground,
              ...SHADOWS.none,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Add a Reminder
          </Text>

          {/* Reminder Type */}
          <Text style={[styles.label, { color: colors.text }]}>Reminder Type</Text>
          <View style={styles.typeButtons}>
            {REMINDER_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.typeButton,
                  type === t.key && [
                    styles.typeButtonActive,
                    { backgroundColor: colors.primary },
                  ],
                  {
                    borderColor: type === t.key ? colors.primary : colors.inputBorder,
                    backgroundColor:
                      type === t.key ? colors.primary : colors.background,
                  },
                ]}
                onPress={() => setType(t.key)}
              >
                <Text style={styles.typeIcon}>{t.icon}</Text>
                <Text
                  style={[
                    styles.typeButtonText,
                    type === t.key && styles.typeButtonTextActive,
                    { color: type === t.key ? "#fff" : colors.text },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Time Input */}
          <Text style={[styles.label, { color: colors.text }]}>Time</Text>
          <View style={styles.timeInputRow}>
            <View style={styles.timeInputsWrapper}>
              <TextInput
                style={[
                  styles.timeInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                placeholder="HH"
                placeholderTextColor={colors.subText}
                value={hour}
                onChangeText={setHour}
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={[styles.timeSeparator, { color: colors.text }]}>:</Text>
              <TextInput
                style={[
                  styles.timeInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                placeholder="MM"
                placeholderTextColor={colors.subText}
                value={minute}
                onChangeText={setMinute}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>

            {/* AM/PM Toggle */}
            <View style={styles.periodContainer}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  period === "AM" && [
                    styles.periodButtonActive,
                    { backgroundColor: colors.primary },
                  ],
                  {
                    borderColor: period === "AM" ? colors.primary : colors.inputBorder,
                    backgroundColor: period === "AM" ? colors.primary : colors.background,
                  },
                ]}
                onPress={() => setPeriod("AM")}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    period === "AM" && styles.periodButtonTextActive,
                    { color: period === "AM" ? "#fff" : colors.text },
                  ]}
                >
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  period === "PM" && [
                    styles.periodButtonActive,
                    { backgroundColor: colors.primary },
                  ],
                  {
                    borderColor: period === "PM" ? colors.primary : colors.inputBorder,
                    backgroundColor: period === "PM" ? colors.primary : colors.background,
                  },
                ]}
                onPress={() => setPeriod("PM")}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    period === "PM" && styles.periodButtonTextActive,
                    { color: period === "PM" ? "#fff" : colors.text },
                  ]}
                >
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Message Input */}
          <TextInput
            style={[
              styles.messageInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder="Message (optional)"
            placeholderTextColor={colors.subText}
            value={message}
            onChangeText={setMessage}
          />

          {/* Add Button */}
          <TouchableOpacity
            onPress={handleAdd}
            disabled={addMutation.isPending}
            style={[
              styles.addButton,
              {
                backgroundColor: colors.primary,
                opacity: addMutation.isPending ? 0.7 : 1,
              },
              SHADOWS.button,
            ]}
          >
            {addMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>Add Reminder</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Reminders List */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Reminders ({list.length})
        </Text>

        {list.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.subText }]}>
              No reminders yet. Create one to get started!
            </Text>
          </View>
        ) : (
          <View style={styles.remindersList}>
            {list.map((item) => (
              <View key={item.id}>{renderCard({ item })}</View>
            ))}
          </View>
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width > 800 ? 900 : "100%",
    alignSelf: "center",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.md,
    marginTop: SPACING.md,
    textAlign: "center",
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: "center",
    marginTop: SPACING.lg,
  },

  // Add Reminder Card
  addReminderCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.lg,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },

  // Type Buttons
  typeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  typeButton: {
    flex: 1,
    minWidth: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    // ADD shadow when not active:
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  typeButtonActive: {
    borderWidth: 0,
    // ADD stronger shadow when active:
    shadowColor: "#5B9EB3",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  typeIcon: {
    fontSize: 20,
    marginRight: SPACING.xs,
  },
  typeButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  typeButtonTextActive: {
    color: "#fff",
  },

  // Time Input
  timeInputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.lg,
    gap: SPACING.lg,
    justifyContent: "space-between",
  },
  timeInputsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    flex: 0,
  },
  timeInput: {
    width: 70,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    fontSize: 18,
    textAlign: "center",
    borderWidth: 2,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  timeSeparator: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginHorizontal: SPACING.xs,
  },

  // AM/PM Period
  periodContainer: {
    flexDirection: "column",
    gap: SPACING.sm,
    width: 65,
  },
  // Period Buttons
  periodButton: {
    height: 56,  // Changed from 50 (match time input)
    borderRadius: 16,  // Changed from BORDER_RADIUS.md
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,  // Changed from 1.5
  },
  
  periodButtonActive: {
    borderWidth: 0,
    // ADD shadow:
    shadowColor: "#5B9EB3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Message Input
  messageInput: {
    height: 56,  // Changed from 52
    borderRadius: 16,  // Changed from BORDER_RADIUS.md
    paddingHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: SPACING.lg,
    borderWidth: 2,  // Changed from 1
  },
  
  // Add Button - make it stand out more
  addButton: {
    paddingVertical: 16,  // Changed from SPACING.md (12)
    borderRadius: 16,  // Changed from BORDER_RADIUS.md
    alignItems: "center",
    justifyContent: "center",
    // ADD shadow (note: SHADOWS.button should work if defined):
    shadowColor: "#5B9EB3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  addButtonText: {
    color: "#fff",
    fontSize: 17,  // Changed from TYPOGRAPHY.sizes.md (16)
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,  // ADD
  },
  
  // Section Title
  sectionTitle: {
    fontSize: 20,  // Changed from TYPOGRAPHY.sizes.lg (18)
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
    marginTop: SPACING.xl,  // Changed from lg
    letterSpacing: -0.3,  // ADD
  },
  
  // Reminder Card - add visual depth
  reminderCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,  // Changed from BORDER_RADIUS.lg
    padding: SPACING.lg,  // Changed from md
    marginBottom: SPACING.sm,  // Changed from xs
    // ADD shadow (replace SHADOWS.none):
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  
  reminderIcon: {
    fontSize: 24,  // Changed from 20
    marginRight: SPACING.sm,
  },
  
  reminderTitle: {
    fontSize: 15,  // Changed from TYPOGRAPHY.sizes.md
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  
  // Delete Button - rounder
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF4B4B",
    paddingHorizontal: 12,  // Changed from SPACING.sm
    paddingVertical: 8,  // Changed from 4
    borderRadius: 12,  // Changed from BORDER_RADIUS.md
    gap: SPACING.xs,
    // ADD shadow:
    shadowColor: '#FF4B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  deleteText: {
    color: "#fff",
    fontSize: 13,  // Changed from TYPOGRAPHY.sizes.xs (12)
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  // Empty State
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: "center",
  },
});

export default ReminderScreen;

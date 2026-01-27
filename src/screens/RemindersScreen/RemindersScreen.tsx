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
      },
    });
  };

  // Delete reminder
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id.toString(), {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["reminders", "list", token] });
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
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.lg,
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
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
  },
  typeButtonActive: {
    borderWidth: 0,
  },
  typeIcon: {
    fontSize: 18,
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
    width: 65,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: "center",
    borderWidth: 1,
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
  periodButton: {
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  periodButtonActive: {
    borderWidth: 0,
  },
  periodButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  periodButtonTextActive: {
    color: "#fff",
  },

  // Message Input
  messageInput: {
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },

  // Add Button
  addButton: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  // Section Title
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },

  // Reminders List
  remindersList: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },

  // Reminder Card
  reminderCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  reminderContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  reminderIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  reminderTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  reminderMessage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.xs,
    marginLeft: 28,
  },

  // Delete Button
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF4B4B",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  deleteText: {
    color: "#fff",
    fontSize: TYPOGRAPHY.sizes.xs,
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

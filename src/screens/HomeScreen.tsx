import React from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useChatStore } from "../stores/chatStore";
import { useFetchMoodCount, useFetchReminderCount } from "../api/hooks";

const HomeScreen = () => {
  const { token, restoreComplete, loading } = useAuth();
  const { messages } = useChatStore();

  // Always call hooks — but they will be disabled if token is missing
  const { data: moodCount = 0, isLoading: moodLoading, error: moodError } = useFetchMoodCount(token);
  const { data: reminderCount = 0, isLoading: reminderLoading, error: reminderError } = useFetchReminderCount(token);

  // Show loading while restoring token
  if (!restoreComplete || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  // Show hook errors
  if (moodError || reminderError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: "red", fontWeight: "bold", marginBottom: 8 }}>Hook Errors:</Text>
        {moodError && <Text>Mood Hook Error: {moodError.message}</Text>}
        {reminderError && <Text>Reminder Hook Error: {reminderError.message}</Text>}
      </View>
    );
  }

  const cards = [
    { key: "chat", title: "Chat", subtitle: `${messages.length} messages` },
    { key: "mood", title: "Mood", subtitle: moodLoading ? "Loading..." : `${moodCount} logs this week` },
    { key: "reminders", title: "Reminders", subtitle: reminderLoading ? "Loading..." : `${reminderCount} upcoming` },
  ];

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ padding: 12, marginBottom: 12, backgroundColor: "#EEE" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.title}</Text>
            <Text>{item.subtitle}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default HomeScreen;

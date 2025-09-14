// src/screens/ReminderScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Switch,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Layout from "../../components/UI/layout";
import { Button } from "../../components/UI/Button";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../context/AuthContext";
import { useReminderStore } from "../../stores/reminderStore";
import {
  useFetchReminders,
  useAddReminder,
  useDeleteReminder,
  useToggleReminder,
} from "../../api/hooks";
import type { Reminder1, NewReminder } from "../../api/types";

const { width } = Dimensions.get("window");

const ReminderScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();

  // Zustand store
  const { list, setList, toggle, remove } = useReminderStore();

  // Hooks
  const remindersQuery = useFetchReminders(token);
  const addMutation = useAddReminder(token);
  const deleteMutation = useDeleteReminder(token);
  const toggleMutation = useToggleReminder(token);

  // Form state
  const [type, setType] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  // Sync API → store
  useEffect(() => {
    if (remindersQuery.data) {
      setList(remindersQuery.data);
    }
  }, [remindersQuery.data, setList]);

  // Add reminder
  const handleAdd = () => {
    if (!type || !time) return;
    const input: NewReminder = { type, time, message, enabled: true };
    addMutation.mutate(input, {
      onSuccess: (newReminder) => {
        setList([...list, newReminder]);
        setType("");
        setTime("");
        setMessage("");
      },
    });
  };

  // Toggle reminder
  const handleToggle = (id: string, enabled: boolean) => {
    toggleMutation.mutate(
      { id, enabled },
      {
        onSuccess: (updated) => {
          toggle(updated.id);
        },
      }
    );
  };

  // Delete reminder
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        remove(id);
      },
    });
  };

  const renderCard = ({ item }: { item: Reminder1 }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>
          {item.type} at {item.time}
        </Text>
        {item.message ? (
          <Text style={styles.cardMessage}>{item.message}</Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Switch
          value={item.enabled}
          onValueChange={(val) => handleToggle(item.id, val)}
        />
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteBtn}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Layout title="Reminders" onNavigate={(screen) => navigation.navigate(screen as never)}>
      <View style={styles.container}>
        <Text style={styles.header}>Add a Reminder</Text>

        <TextInput
          style={styles.input}
          placeholder="Type (e.g. Meditation)"
          value={type}
          onChangeText={setType}
        />
        <TextInput
          style={styles.input}
          placeholder="Time (HH:mm)"
          value={time}
          onChangeText={setTime}
        />
        <TextInput
          style={styles.input}
          placeholder="Message (optional)"
          value={message}
          onChangeText={setMessage}
        />

        <View style={{ marginBottom: 16, width: 160 }}>
          <Button
            title={addMutation.isPending ? "Adding..." : "Add Reminder"}
            onPress={handleAdd}
          />
        </View>

        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width > 800 ? 900 : "100%",
    alignSelf: "center",
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  cardMessage: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteBtn: {
    marginLeft: 8,
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default ReminderScreen;

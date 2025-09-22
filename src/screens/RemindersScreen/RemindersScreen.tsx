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
import { useReminderStore } from "../../stores/reminderStore";
import {
  useFetchReminders,
  useAddReminder,
  useDeleteReminder,
  useToggleReminder,
} from "../../hooks/reminders";
import type { Reminder, NewReminder } from "../../../services/mock_data/reminders";

const { width } = Dimensions.get("window");

const ReminderScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Zustand store
  const { list, setList, toggle, remove } = useReminderStore();

  // Hooks
  const remindersQuery = useFetchReminders();
  const addMutation = useAddReminder();
  const deleteMutation = useDeleteReminder();
  const toggleMutation = useToggleReminder();

  // Form state
  const [type, setType] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [message, setMessage] = useState("");

  // Sync API → store
  useEffect(() => {
    if (remindersQuery.data) setList(remindersQuery.data);
  }, [remindersQuery.data, setList]);

  // Add reminder
  const handleAdd = () => {
    if (!type || hour === "" || minute === "") return;

    const input: NewReminder = {
      type,
      hour: parseInt(hour),
      minute: parseInt(minute),
      message,
      enabled: true,
    };

    addMutation.mutate(input, {
      onSuccess: (newReminder) => {
        setList([...list, newReminder]);
        setType("");
        setHour("");
        setMinute("");
        setMessage("");
      },
    });
  };

  // Toggle reminder
  const handleToggle = (id: string) => {
    toggleMutation.mutate(id, { onSuccess: (updated) => toggle(updated.id) });
  };

  // Delete reminder
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, { onSuccess: () => remove(id) });
  };

  // Render single reminder card
  const renderCard = ({ item }: { item: Reminder }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>
          {item.type} at {item.hour.toString().padStart(2, "0")}:
          {item.minute.toString().padStart(2, "0")}
        </Text>
        {item.message ? <Text style={styles.cardMessage}>{item.message}</Text> : null}
      </View>
      <View style={styles.actions}>
        <Switch value={item.enabled} onValueChange={() => handleToggle(item.id)} />
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
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
        <View style={styles.timeContainer}>
          <TextInput
            style={[styles.input, styles.timeInput]}
            placeholder="HH"
            value={hour}
            onChangeText={setHour}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.colon}>:</Text>
          <TextInput
            style={[styles.input, styles.timeInput]}
            placeholder="MM"
            value={minute}
            onChangeText={setMinute}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Message (optional)"
          value={message}
          onChangeText={setMessage}
        />

        <View style={{ marginBottom: 16, width: "100%", maxWidth: 200 }}>
          <Button title={addMutation.isPending ? "Adding..." : "Add Reminder"} onPress={handleAdd} />
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeInput: {
    flex: 1,
    textAlign: "center",
  },
  colon: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 4,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  cardMessage: {
    fontSize: 14,
    color: "#555",
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

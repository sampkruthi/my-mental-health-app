import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";


import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Layout from "../../components/UI/layout";
import { Button } from "../../components/UI/Button";
import { RootStackParamList } from "../../navigation/AppNavigator";
//import { useReminderStore } from "../../stores/reminderStore";
import { useAuth } from "../../context/AuthContext"; 
import {
  useFetchReminders,
  useAddReminder,
  useDeleteReminder,
} from "../../api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import type { Reminder1 as Reminder, NewReminder } from "../../api/types";

const { width } = Dimensions.get("window");

const ReminderScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token } = useAuth(); 
  const queryClient = useQueryClient();


  // Remiving Zustand to avoid two staye management systems
  // // Zustand store
  //const { list, setList, remove } = useReminderStore();

  // Hooks
  const remindersQuery = useFetchReminders(token);
  const addMutation = useAddReminder(token);
  const deleteMutation = useDeleteReminder(token);

  // Form state
  const [type, setType] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [message, setMessage] = useState("");

  // REMOVE: useEffect that syncs to store
  
  // Sync API → store
  /*useEffect(() => {
    if (remindersQuery.data) {
      setList(remindersQuery.data);
      console.log('✅ Reminders fetched:', remindersQuery.data);  
      }
    }, [remindersQuery.data, setList]); */

  // Get list directly from query
  const list = remindersQuery.data || [];
  

  // Add reminder
  const handleAdd = () => {
    if (!type || hour === "" || minute === "") {
      console.log(' Validation failed:', { type, hour, minute });
      alert('Please fill in type, hour, and minute');
      return; 
    }

    const input: NewReminder = {
      type,
      hour: parseInt(hour),
      minute: parseInt(minute),
      message,
    };
    console.log(' Adding reminder:', input); 
    console.log('Current list before add:', list);

    addMutation.mutate(input, {
      onSuccess: (newReminder) => {
        console.log(' Reminder added:', newReminder); 
        console.log('Current list', list);
        console.log('New list will be:', [...list, newReminder]);
        //setList([...list, newReminder]);
        setType("");
        setHour("");
        setMinute("");
        setMessage("");

        //Trying invalidate to refetch instead of refetch
        // Invalidate to refetch
        queryClient.invalidateQueries({ queryKey: ["reminders", "list", token] });
        // Refetch reminders to ensure sync
        //remindersQuery.refetch();

      },
    });
  };

  // Note: Toggle functionality removed since 'enabled' field doesn't exist in OpenAPI
  // const handleToggle = (id: number) => {
  //   toggleMutation.mutate(id.toString(), { onSuccess: (updated) => toggle(updated.id) });
  // };

  // Delete reminder
  const handleDelete = (id: number) => {
    console.log(' Deleting reminder:', id); 
    deleteMutation.mutate(id.toString(), { 
      onSuccess: () => {
        console.log('Reminder deleted'); // ADD DEBUG LOG
        queryClient.invalidateQueries({ queryKey: ["reminders", "list", token] });

        // Refetch reminders to ensure sync
        //remindersQuery.refetch();
      }
    });
  };

  if (remindersQuery.isLoading) {
    return (
      <Layout title="Reminders" onNavigate={(screen) => navigation.navigate(screen as never)}>
        <View style={styles.container}>
          <Text>Loading reminders...</Text>
        </View>
      </Layout>
    );
  }

  if (remindersQuery.isError) {
    return (
      <Layout title="Reminders" onNavigate={(screen) => navigation.navigate(screen as never)}>
        <View style={styles.container}>
          <Text>Error loading reminders: {remindersQuery.error?.message}</Text>
        </View>
      </Layout>
    );
  }


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
        {/* Switch removed - 'enabled' field doesn't exist in OpenAPI */}
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

        <Text style={styles.label}>Reminder Type</Text>
        <View style={styles.typeButtons}>
          {['meditation', 'journaling', 'hydration', 'activity'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeButton,
                type === t && styles.typeButtonActive
              ]}
              onPress={() => setType(t)}
            >
              <Text style={[
                styles.typeButtonText,
                type === t && styles.typeButtonTextActive
              ]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
       

        <Text style={styles.subHeader}>
          Your Reminders ({list.length})
        </Text>

        <FlatList
          data={list}
          keyExtractor={(item) => item.id.toString()}
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
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    fontSize: 16,
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
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 4,
  },
  typeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  typeButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
});

export default ReminderScreen;

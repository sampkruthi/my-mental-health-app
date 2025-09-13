// src/screens/JournalingScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Layout from "../../components/UI/layout";
import { Button } from "../../components/UI/Button";
import { useFetchJournalHistory, useLogJournal } from "../../api/hooks";
import { useJournalStore } from "../../stores/journalStore";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

const JournalingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { draft, setDraft, clearDraft } = useJournalStore();
  const { token } = useAuth(); // replace with actual token
  const journalHistory = useFetchJournalHistory(token);
  const logMutation = useLogJournal(token);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSave = () => {
    if (!draft.trim()) return;
    logMutation.mutate({ content: draft }, { onSuccess: () => clearDraft() });
  };

  const renderCard = ({ item }: { item: { id?: string; content: string; sentiment?: string | number; timestamp: string } }) => {
    const isExpanded = expandedId === item.id;
    const preview = item.content.split("\n").slice(0, 2).join("\n");

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setExpandedId(isExpanded ? null : item.id ?? null)}

      >
        <Text style={styles.cardDate}>{new Date(item.timestamp).toLocaleString()}</Text>
        <Text style={styles.cardContent}>{isExpanded ? item.content : preview}</Text>
        {isExpanded && item.sentiment && (
          <View style={styles.sentimentBadge}>
            <Text style={styles.sentimentText}>{item.sentiment.toString()}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Layout title="Journaling" onNavigate={(screen) => navigation.navigate(screen as never)}>
      <View style={styles.container}>
        <Text style={styles.header}>How are you feeling today?</Text>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Write your thoughts..."
          value={draft}
          onChangeText={setDraft}
        />
        <Text style={styles.wordCount}>{draft.split(/\s+/).filter(Boolean).length} words</Text>
        <View style={{ marginBottom: 16, width: 120 }}>
          <Button title="Save Entry" onPress={handleSave} />
        </View>

        <FlatList
          data={journalHistory.data || []}
          keyExtractor={(item) => item.id || Math.random().toString()}
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
  textInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    fontSize: 16,
    marginBottom: 4,
  },
  wordCount: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  entry: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  entryDate: {
    fontWeight: "600",
    marginBottom: 4,
  },
  entryContent: {
    fontSize: 14,
    color: "#333",
  },
  card: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardDate: {
    fontWeight: "600",
    marginBottom: 4,
  },
  cardContent: {
    fontSize: 14,
    color: "#333",
  },
  sentimentBadge: {
    marginTop: 8,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#065f46",
  },
});


export default JournalingScreen;

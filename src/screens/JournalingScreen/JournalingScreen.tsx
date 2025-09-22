// src/screens/JournalingScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Layout from "../../components/UI/layout";
import { Button } from "../../components/UI/Button";
import { useFetchJournalHistory, useFetchJournalInsights, useLogJournal } from "../../hooks/journal";
import { useJournalStore } from "../../stores/journalStore";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import type { JournalEntry } from "../../../services/mock_data/journal";

const { width } = Dimensions.get("window");

const JournalingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { draft, setDraft, clearDraft } = useJournalStore();
  const { token } = useAuth();
  const { colors } = useTheme();

  const journalHistory = useFetchJournalHistory(token);
  const journalInsights = useFetchJournalInsights(token);
  const logMutation = useLogJournal(token);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSave = () => {
    if (!draft.trim()) return;
    logMutation.mutate({ content: draft }, { onSuccess: () => clearDraft() });
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "#DCFCE7"; // green
      case "negative":
        return "#FECACA"; // red
      default:
        return "#E5E7EB"; // gray / neutral
    }
  };

  const renderCard = ({ item }: { item: JournalEntry }) => {
    const isExpanded = expandedId === item.id;
    const preview = item.content.split("\n").slice(0, 2).join("\n");

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.cardBackground }]}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
      >
        <Text style={[styles.cardDate, { color: colors.subText }]}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
        <Text style={[styles.cardContent, { color: colors.text }]}>
          {isExpanded ? item.content : preview}
        </Text>
        {isExpanded && item.sentiment && (
          <View style={[styles.sentimentBadge, { backgroundColor: getSentimentColor(item.sentiment) }]}>
            <Text style={styles.sentimentText}>{item.sentiment}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Layout title="Journaling" onNavigate={(screen) => navigation.navigate(screen as never)}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        
        {/* Insights */}
        {journalInsights.data && (
          <View style={styles.insightsContainer}>
            <Text style={[styles.insightText, { color: colors.text }]}>
              Avg Sentiment: {journalInsights.data.averageMoodScore.toFixed(2)}
            </Text>
            <Text style={[styles.insightText, { color: colors.text }]}>
              Total Entries: {journalInsights.data.totalEntries}
            </Text>
            <Text style={[styles.insightText, { color: colors.text }]}>
              Recent Entries: {journalInsights.data.recentEntries.length}
            </Text>
          </View>
        )}

        {/* Draft Input */}
        <Text style={[styles.header, { color: colors.text }]}>How are you feeling today?</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.inputBorder }]}
          multiline
          placeholder="Write your thoughts..."
          placeholderTextColor={colors.subText}
          value={draft}
          onChangeText={setDraft}
        />
        <Text style={[styles.wordCount, { color: colors.subText }]}>
          {draft.split(/\s+/).filter(Boolean).length} words
        </Text>
        <View style={{ marginBottom: 16, width: 120 }}>
          <Button title="Save Entry" onPress={handleSave} />
        </View>

        {/* Journal History */}
        <FlatList
          data={journalHistory.data || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width: width > 800 ? 900 : "100%", alignSelf: "center", padding: 10 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  textInput: { borderRadius: 12, padding: 12, minHeight: 100, fontSize: 16, marginBottom: 4, borderWidth: 1 },
  wordCount: { fontSize: 12, marginBottom: 8 },
  card: { borderRadius: 12, padding: 16, marginBottom: 12 },
  cardDate: { fontWeight: "600", marginBottom: 4 },
  cardContent: { fontSize: 14 },
  sentimentBadge: { marginTop: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: "flex-start" },
  sentimentText: { fontSize: 12, fontWeight: "600", color: "#065f46" },
  insightsContainer: { marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: "#E5E7EB" },
  insightText: { fontSize: 14, fontWeight: "600" },
});

export default JournalingScreen;

// src/screens/JournalingScreen.tsx
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Layout from "../../components/UI/layout";
import { Button } from "../../components/UI/Button";
import {
  useFetchJournalHistory,
  useFetchJournalInsights,
  useLogJournal,
} from "../../api/hooks";
import { useJournalStore } from "../../stores/journalStore";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import type { JournalEntry } from "../../api/types";
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from "../../constants/styles";
import Svg, { Line, Circle, Path } from "react-native-svg";

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

  const getSentimentColor = (sentiment?: number) => {
    if (sentiment === undefined || sentiment === null) return "#E5E7EB"; // gray
    if (sentiment > 0.2) return "#DCFCE7"; // positive - green
    if (sentiment < -0.2) return "#FECACA"; // negative - red
    return "#E5E7EB"; // neutral - gray
  };

  const renderCard = ({ item }: { item: JournalEntry }) => {
    const isExpanded = expandedId === item.id;
    const preview = item.content.split("\n").slice(0, 2).join("\n");

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBackground,
            ...SHADOWS.none,
          },
        ]}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
      >
        <Text style={[styles.cardDate, { color: colors.subText }]}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
        <Text style={[styles.cardContent, { color: colors.text }]}>
          {isExpanded ? item.content : preview}
        </Text>
        {isExpanded && item.sentiment !== undefined && (
          <View
            style={[
              styles.sentimentBadge,
              { backgroundColor: getSentimentColor(item.sentiment) },
            ]}
          >
            <Text style={styles.sentimentText}>
              Sentiment: {item.sentiment.toFixed(2)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Insights footer component
  const renderInsightsFooter = () => {
    if (!journalInsights.data) return null;

    return (
      <View
        style={[
          styles.insightsCard,
          {
            backgroundColor: colors.cardBackground,
            ...SHADOWS.none,
          },
        ]}
      >
        <View style={styles.insightsHeader}>
          <CuteBotAvatar size={32} />
          <Text style={[styles.insightsTitle, { color: colors.text }]}>
            Your Journey
          </Text>
        </View>

        <View style={styles.insightsContent}>
          <View style={styles.insightItem}>
            <Text style={[styles.insightLabel, { color: colors.subText }]}>
              Avg Sentiment
            </Text>
            <Text style={[styles.insightValue, { color: colors.primary }]}>
              {journalInsights.data.avg_sentiment?.toFixed(2) ?? "N/A"}
            </Text>
          </View>

          <View style={styles.insightDivider} />

          <View style={styles.insightItem}>
            <Text style={[styles.insightLabel, { color: colors.subText }]}>
              Total Entries
            </Text>
            <Text style={[styles.insightValue, { color: colors.primary }]}>
              {journalInsights.data.entry_count}
            </Text>
          </View>

          <View style={styles.insightDivider} />

          <View style={styles.insightItem}>
            <Text style={[styles.insightLabel, { color: colors.subText }]}>
              Entries/Day
            </Text>
            <Text style={[styles.insightValue, { color: colors.primary }]}>
              {journalInsights.data.entries_per_day.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Layout
      title="Journaling"
      onNavigate={(screen) => navigation.navigate(screen as never)}
    >
      <ScrollView
        style={[styles.scrollContainer, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: SPACING.lg }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          {/* Draft Input Section with Avatar */}
          <View style={styles.headerWithAvatar}>
            <CuteBotAvatar size={40} />
            <View style={styles.headerTextContainer}>
              <Text style={[styles.header, { color: colors.text }]}>
                How are you feeling today?
              </Text>
              <Text style={[styles.subheader, { color: colors.subText }]}>
                What are you grateful for today, what&apos;s been working well for you recently?
              </Text>
            </View>
          </View>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor: colors.inputBorder,
              },
            ]}
            multiline
            placeholder="What's on your mind"
            placeholderTextColor={colors.subText}
            value={draft}
            onChangeText={setDraft}
          />
          <Text style={[styles.wordCount, { color: colors.subText }]}>
            {draft.split(/\s+/).filter(Boolean).length} words
          </Text>
          <View style={{ marginBottom: SPACING.lg, width: 120 }}>
            <Button title="Save Entry" onPress={handleSave} />
          </View>

          {/* Journal History */}
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, marginTop: SPACING.lg, marginBottom: SPACING.md },
            ]}
          >
            Your Entries
          </Text>

          {journalHistory.data && journalHistory.data.length > 0 ? (
            <View style={{ width: "100%" }}>
              {journalHistory.data.map((item) => (
                <View key={item.id} style={{ marginHorizontal: 0 }}>
                  {renderCard({ item })}
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.subText }]}>
              No entries yet. Start writing to see your journey!
            </Text>
          )}

          {/* Insights Card */}
          {renderInsightsFooter()}
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  contentWrapper: {
    width: width > 800 ? 900 : "100%",
    alignSelf: "center",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  headerWithAvatar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  header: {
    fontSize: TYPOGRAPHY.sizes.xl, //bigger
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.sm, //bigger
    letterSpacing: -0.5, //added for UX
  },
  subheader: {
    fontSize: TYPOGRAPHY.sizes.md, //changed from small
    fontWeight: TYPOGRAPHY.weights.regular,
    lineHeight: 22,
    opacity: 0.8, //added for UX
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: "center",
    marginVertical: SPACING.lg,
  },
  textInput: {
    borderRadius: BORDER_RADIUS.lg, //bigger
    padding: SPACING.lg, //bigger
    minHeight: 120,
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: SPACING.sm, //bigger
    borderWidth: 2, //thicker
    // ADD shadow:
    shadowColor: "#5B9EB3", //added shadow color for UX
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  wordCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    marginHorizontal: 0,
    borderWidth: 0,              // ADD THIS
  borderColor: 'transparent',  // ADD THIS
  // ADD shadow for UX
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 3,
  },
  cardDate: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  cardContent: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 20,
  },
  sentimentBadge: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: "flex-start",
  },
  sentimentText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#065f46",
  },

  // Insights Card Styles
  insightsCard: {
    borderRadius: 20, //changed for rounder BORDER_RADIUS.md,
    padding: SPACING.lg,
    //marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    marginHorizontal: 0,
    borderWidth: 0,           // Remove border
    borderColor: 'transparent', 
    // ADD stronger shadow for emphasis:
    shadowColor: "5B9EB3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  insightsTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginLeft: SPACING.md,
  },
  insightsContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  insightItem: {
    flex: 1,
    alignItems: "center",
  },
  insightLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.sm,
  },
  insightValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: -1,
  },
  insightDivider: {
    width: 1,
    height: 50,
    backgroundColor: "#E0E0E0",
    marginHorizontal: SPACING.lg,
  },

  // Bot Avatar Styles
  botAvatar: {
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E5EA",
  },
});

const CuteBotAvatar = ({ size = 40 }: { size?: number }) => {
  return (
    <View
      style={[
        styles.botAvatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24">
        {/* Antenna */}
        <Line
          x1="12"
          y1="3"
          x2="12"
          y2="7"
          stroke="#5B7C99"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Circle cx="12" cy="2" r="1.5" fill="#5B7C99" />

        {/* Face circle */}
        <Circle
          cx="12"
          cy="14"
          r="9.5"
          fill="#FFFFFF"
          stroke="#5B7C99"
          strokeWidth="1.5"
        />

        {/* Eyes */}
        <Circle cx="10" cy="14" r="1" fill="#5B7C99" />
        <Circle cx="14" cy="14" r="1" fill="#5B7C99" />

        {/* Smile */}
        <Path
          d="M 10 17 Q 12 18.5 14 17"
          stroke="#5B7C99"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

export default JournalingScreen;

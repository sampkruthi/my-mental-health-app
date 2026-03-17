// src/screens/HomeScreen.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  useFetchUserProfile,
  useFetchActivities,
  useFetchMoodHistory,
  useFetchMemorySummary,
  useLogMood,
} from "../api/hooks";
import Layout from "../components/UI/layout";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { storage } from "../utils/storage";
import { useQueryClient } from "@tanstack/react-query";
import type { GuidedActivity, MoodLog } from "../api/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isIPad = Platform.OS === "ios" && SCREEN_WIDTH >= 768;

// --- Helpers ---

const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
};

const getActivityEmoji = (type: string): string => {
  switch (type) {
    case "Breathing":
      return "\uD83C\uDF2C\uFE0F";
    case "Meditation":
      return "\uD83E\uDDD8";
    case "Stretching":
      return "\uD83E\uDD38";
    case "Walking":
      return "\uD83D\uDEB6";
    case "Music":
      return "\uD83C\uDFB5";
    case "Exercise":
      return "\uD83D\uDCAA";
    default:
      return "\u2728";
  }
};

const MOOD_OPTIONS = [
  { score: 1, emoji: "\uD83D\uDE1E" },
  { score: 2, emoji: "\uD83D\uDE15" },
  { score: 3, emoji: "\uD83D\uDE10" },
  { score: 4, emoji: "\uD83D\uDE42" },
  { score: 5, emoji: "\uD83D\uDE04" },
];

const FALLBACK_TOPICS = [
  "Managing anxiety",
  "Better sleep",
  "Stress relief",
  "Mindfulness basics",
  "Burnout recovery",
  "Grief and loss",
];

const QUICK_ACTIONS = [
  { key: "journal" as const, label: "Journal", emoji: "\uD83D\uDCD3", color: "#e8f4f5" },
  { key: "progressdashboard" as const, label: "Progress", emoji: "\uD83D\uDCC8", color: "#f0f5ff" },
  { key: "resources" as const, label: "Resources", emoji: "\uD83D\uDCDA", color: "#fff0e6" },
];

function selectTodayActivity(
  activities: GuidedActivity[],
  moodHistory: MoodLog[] | undefined,
  memoryTags: string[],
  lastCompletedId: string | null
): GuidedActivity | null {
  if (!activities || activities.length === 0) return null;

  const today = new Date().toISOString().split("T")[0];
  const todayMood = moodHistory?.find((m) => m.timestamp.startsWith(today));
  const moodScore = todayMood?.mood_score;
  const hour = new Date().getHours();

  // a) Low mood → calming activity
  if (moodScore !== undefined && moodScore <= 2) {
    const calm = activities.find(
      (a) => a.type === "Breathing" || a.type === "Meditation"
    );
    if (calm) return calm;
  }

  // b) Mood 3 + anxiety/stress keywords
  if (moodScore === 3) {
    const hasAnxiety = memoryTags.some((t) =>
      /anxiety|stress|anxious|worried/i.test(t)
    );
    if (hasAnxiety) {
      const breathing = activities.find((a) => a.type === "Breathing");
      if (breathing) return breathing;
    }
  }

  // c) Morning → mindfulness/meditation
  if (hour >= 6 && hour <= 11) {
    const meditation = activities.find((a) => a.type === "Meditation");
    if (meditation) return meditation;
  }

  // d) Evening → meditation
  if (hour >= 20 && hour <= 23) {
    const meditation = activities.find((a) => a.type === "Meditation");
    if (meditation) return meditation;
  }

  // e) Default: first not matching last completed
  if (lastCompletedId) {
    const different = activities.find((a) => a.id !== lastCompletedId);
    if (different) return different;
  }

  // f) Fallback
  return activities[0];
}

// --- Component ---

const HomeScreen = () => {
  const { token } = useAuth();
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();

  // Data fetching
  const { data: profile } = useFetchUserProfile(token);
  const { data: activities = [], isLoading: activitiesLoading } =
    useFetchActivities(token);
  const { data: moodHistory, isLoading: moodLoading } =
    useFetchMoodHistory(token);
  const { data: memorySummary } = useFetchMemorySummary(token);
  const logMoodMutation = useLogMood(token);

  // Local state
  const [lastCompletedId, setLastCompletedId] = useState<string | null>(null);

  // Load last completed activity ID from storage
  useEffect(() => {
    storage.getItem("lastCompletedActivityId").then((id) => {
      if (id) setLastCompletedId(id);
    });
  }, []);

  // Derived values
  const firstName = profile?.name?.split(" ")[0] || "there";
  const timeOfDay = getTimeOfDay();

  const today = new Date().toISOString().split("T")[0];
  const todaysMood = moodHistory?.find((m) => m.timestamp.startsWith(today));

  const memoryTags = memorySummary?.key_themes || [];

  const todayActivity = useMemo(
    () =>
      selectTodayActivity(activities, moodHistory, memoryTags, lastCompletedId),
    [activities, moodHistory, memoryTags, lastCompletedId]
  );

  const resourcePills = useMemo(() => {
    const tags = memoryTags.slice(0, 2);
    const pills = [...tags];
    for (const fallback of FALLBACK_TOPICS) {
      if (pills.length >= 6) break;
      if (!pills.some((p) => p.toLowerCase() === fallback.toLowerCase())) {
        pills.push(fallback);
      }
    }
    return pills.slice(0, 6);
  }, [memoryTags]);

  // Handlers
  const handleLogMood = async (score: number) => {
    if (todaysMood) return; // Already logged today
    try {
      await logMoodMutation.mutateAsync({ score });
      queryClient.invalidateQueries({ queryKey: ["mood"] });
    } catch (error) {
      console.error("[HomeScreen] Failed to log mood:", error);
    }
  };

  const handleActivityPress = () => {
    if (todayActivity) {
      navigation.navigate("activities", { activityId: todayActivity.id });
    } else {
      navigation.navigate("activities");
    }
  };

  const handlePillPress = (topic: string) => {
    navigation.navigate("resources", { filter: topic });
  };

  return (
    <Layout
      title="Home"
      onNavigate={(screen) => navigation.navigate(screen as never)}
    >
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        {/* 1. GREETING SECTION */}
        <Text style={[styles.dateText, { color: colors.subText }]}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Text style={[styles.greeting, { color: colors.text }]}>
          Good {timeOfDay}, {firstName}
        </Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          How are you feeling today?
        </Text>

        {/* 2. INLINE MOOD LOGGER */}
        <View
          style={[
            styles.moodCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: "#e0e0e0",
            },
          ]}
        >
          {todaysMood ? (
            <View style={styles.moodLoggedRow}>
              <Text style={[styles.moodLoggedText, { color: colors.subText }]}>
                Mood logged today {"\u2713"}
              </Text>
              <Text style={styles.moodLoggedEmoji}>
                {MOOD_OPTIONS.find((m) => m.score === todaysMood.mood_score)
                  ?.emoji || "\uD83D\uDE42"}
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.moodLabel, { color: colors.subText }]}>
                Log your mood
              </Text>
              <View style={styles.moodRow}>
                {MOOD_OPTIONS.map((mood) => (
                  <TouchableOpacity
                    key={mood.score}
                    onPress={() => handleLogMood(mood.score)}
                    style={styles.moodButton}
                    disabled={logMoodMutation.isPending}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* 3. CHAT CTA */}
        <TouchableOpacity
          style={[styles.chatCta, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("chat")}
          activeOpacity={0.8}
        >
          <Text style={styles.chatCtaText}>
            Start a conversation with Bodhira
          </Text>
        </TouchableOpacity>

        {/* 4. TODAY'S ACTIVITY CARD */}
        {activitiesLoading ? (
          <View
            style={[
              styles.activityCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: "#e0e0e0",
              },
            ]}
          >
            <View style={styles.activitySkeleton}>
              <View style={[styles.skeletonIcon, { backgroundColor: "#e8f4f5" }]} />
              <View style={styles.skeletonTextArea}>
                <View
                  style={[
                    styles.skeletonLine,
                    { width: "40%", backgroundColor: "#e8f4f5" },
                  ]}
                />
                <View
                  style={[
                    styles.skeletonLine,
                    { width: "70%", backgroundColor: "#e8f4f5" },
                  ]}
                />
              </View>
            </View>
          </View>
        ) : todayActivity ? (
          <View
            style={[
              styles.activityCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: "#e0e0e0",
              },
            ]}
          >
            <View style={styles.activityIconArea}>
              <Text style={styles.activityEmoji}>
                {getActivityEmoji(todayActivity.type)}
              </Text>
            </View>
            <View style={styles.activityTextArea}>
              <Text style={[styles.activityLabel, { color: colors.subText }]}>
                Today's activity
              </Text>
              <Text
                style={[styles.activityTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {todayActivity.title}
              </Text>
              <Text
                style={[
                  styles.activityDescription,
                  { color: colors.subText },
                ]}
                numberOfLines={1}
              >
                {todayActivity.description}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: colors.primary }]}
              onPress={handleActivityPress}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* 5. QUICK ACTION ROW */}
        <View style={styles.quickActionRow}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: "#e0e0e0",
                },
              ]}
              onPress={() => navigation.navigate(action.key as never)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: action.color },
                ]}
              >
                <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
              </View>
              <Text
                style={[styles.quickActionLabel, { color: colors.text }]}
                numberOfLines={1}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 5b. RESOURCE PILLS STRIP */}
        <Text style={[styles.pillsLabel, { color: colors.subText }]}>
          SAVED FOR YOU
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContainer}
        >
          {resourcePills.map((pill, index) => (
            <TouchableOpacity
              key={`pill-${index}`}
              style={[
                styles.pill,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: "#e0e0e0",
                },
              ]}
              onPress={() => handlePillPress(pill)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, { color: "#333" }]}>{pill}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Layout>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: isIPad ? 32 : 16,
    paddingTop: 12,
  },

  // Greeting
  dateText: {
    fontSize: isIPad ? 14 : 12,
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 4,
  },
  greeting: {
    fontSize: isIPad ? 26 : 22,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: isIPad ? 15 : 13,
    textAlign: "center",
    marginTop: 2,
    marginBottom: 14,
  },

  // Mood card
  moodCard: {
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 12,
  },
  moodLabel: {
    fontSize: 12,
    marginBottom: 10,
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  moodButton: {
    padding: 6,
  },
  moodEmoji: {
    fontSize: isIPad ? 32 : 28,
  },
  moodLoggedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  moodLoggedText: {
    fontSize: 14,
    fontWeight: "500",
  },
  moodLoggedEmoji: {
    fontSize: 22,
  },

  // Chat CTA
  chatCta: {
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  chatCtaText: {
    color: "#FFFFFF",
    fontSize: isIPad ? 16 : 14,
    fontWeight: "600",
  },

  // Activity card
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 12,
    marginBottom: 14,
  },
  activityIconArea: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#e8f4f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  activityEmoji: {
    fontSize: 16,
  },
  activityTextArea: {
    flex: 1,
    marginRight: 8,
  },
  activityLabel: {
    fontSize: 10,
    marginBottom: 1,
  },
  activityTitle: {
    fontSize: isIPad ? 14 : 13,
    fontWeight: "700",
  },
  activityDescription: {
    fontSize: 11,
    marginTop: 1,
  },
  startButton: {
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  // Activity skeleton
  activitySkeleton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  skeletonIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    marginRight: 10,
  },
  skeletonTextArea: {
    flex: 1,
    gap: 6,
  },
  skeletonLine: {
    height: 10,
    borderRadius: 5,
  },

  // Quick actions
  quickActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 14,
  },
  quickActionCard: {
    flex: 1,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 0.5,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  quickActionEmoji: {
    fontSize: 16,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Resource pills
  pillsLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pillsContainer: {
    paddingRight: 16,
    gap: 8,
  },
  pill: {
    borderRadius: 16,
    borderWidth: 0.5,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillText: {
    fontSize: 12,
  },
});

export default HomeScreen;

// src/screens/GuidedActivitiesScreen.tsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { Audio } from "expo-av";
import { useAuth } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";

import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GuidedActivity } from "../../api/types";
import { useFetchActivities } from "../../api/hooks";
import { Button } from "../../components/UI/Button";
import Layout from "../../components/UI/layout";
import { analytics } from '../../../analytics';

const isIPad = Platform.OS === "ios" && Platform.isPad;

// Progress ring constants
const RING_SIZE = 180;
const RING_CENTER = RING_SIZE / 2; // 90
const RING_RADIUS = 84;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ~527.79
const RING_STROKE_WIDTH = 4;


// ── Animated Start Button with press scale ──
const AnimatedStartButton = ({ onPress }: { onPress: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={{ overflow: "hidden", borderRadius: 9999 }}>
          <LinearGradient
            colors={["#1AABBA", "#a8e4e0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>Start</Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Progress Ring Player Component ──
const ProgressRingPlayer = ({
  isPlaying,
  onTogglePlay,
  progress,
  phaseLabel,
  timerText,
  colors,
}: {
  isPlaying: boolean;
  onTogglePlay: () => void;
  progress: number; // 0 to 1
  phaseLabel: string;
  timerText: string;
  colors: any;
}) => {
  const dashoffset = RING_CIRCUMFERENCE - RING_CIRCUMFERENCE * progress;
  const phaseLabelOpacity = useRef(new Animated.Value(1)).current;
  const prevPhaseRef = useRef(phaseLabel);

  // Crossfade phase label
  useEffect(() => {
    if (prevPhaseRef.current !== phaseLabel) {
      prevPhaseRef.current = phaseLabel;
      Animated.sequence([
        Animated.timing(phaseLabelOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(phaseLabelOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [phaseLabel]);

  const playButtonScaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(playButtonScaleAnim, {
      toValue: 0.97,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(playButtonScaleAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.progressRingContainer}>
      {/* Timer Pill */}
      <View style={styles.timerPill}>
        <Text style={[styles.timerPillIcon, { color: colors.primary }]}>⏱</Text>
        <Text style={[styles.timerPillText, { color: colors.onSurface }]}>{timerText}</Text>
      </View>

      {/* Phase Label */}
      <Animated.Text
        style={[
          styles.phaseLabel,
          { color: colors.onSurfaceVariant, opacity: phaseLabelOpacity },
        ]}
      >
        {phaseLabel}
      </Animated.Text>

      {/* Ring + Play/Pause */}
      <View style={styles.ringWrapper}>
        <Svg
          width={RING_SIZE}
          height={RING_SIZE}
          style={{ transform: [{ rotate: "-90deg" }] }}
        >
          <Defs>
            <SvgLinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.primary} />
              <Stop offset="1" stopColor={colors.primaryFixedDim} />
            </SvgLinearGradient>
          </Defs>
          {/* Track */}
          <Circle
            cx={RING_CENTER}
            cy={RING_CENTER}
            r={RING_RADIUS}
            stroke={`${colors.primary}1F`} // 12% opacity
            strokeWidth={RING_STROKE_WIDTH}
            fill="none"
          />
          {/* Active arc */}
          <Circle
            cx={RING_CENTER}
            cy={RING_CENTER}
            r={RING_RADIUS}
            stroke="url(#ringGrad)"
            strokeWidth={RING_STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashoffset}
          />
        </Svg>

        {/* Play/Pause Button centered inside ring */}
        <Animated.View
          style={[
            styles.playPauseButton,
            { transform: [{ scale: playButtonScaleAnim }] },
          ]}
        >
          <TouchableOpacity
            onPress={onTogglePlay}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          >
            <LinearGradient
              colors={["#1AABBA", "#3bbfb2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playPauseGradient}
            >
              {isPlaying ? (
                // Pause icon: two rounded rectangles
                <View style={styles.pauseIconContainer}>
                  <View style={styles.pauseBar} />
                  <View style={styles.pauseBar} />
                </View>
              ) : (
                // Play icon: triangle shifted 2px right for optical centering
                <View style={styles.playIconContainer}>
                  <View style={styles.playTriangle} />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

// ── Main Screen ──
const GuidedActivitiesScreen = () => {
  const { colors } = useTheme();
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: activities = [], isLoading } = useFetchActivities(token);
  const insets = useSafeAreaInsets();

  const [selectedActivity, setSelectedActivity] = useState<GuidedActivity | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Session timer state
  const [sessionActive, setSessionActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDuration = selectedActivity?.audioDurationSeconds || selectedActivity?.duration || 60; // default 5 min

  const progress = totalDuration > 0 ? Math.min(elapsedSeconds / totalDuration, 1) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPhaseLabel = () => {
    if (!sessionActive && elapsedSeconds === 0) return "TAP TO BEGIN";
    if (!isPlaying && sessionActive) return "PAUSED";
    return "";
  };

  // Timer tick
  useEffect(() => {
    if (isPlaying && sessionActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev + 1 >= totalDuration) {
            clearInterval(timerRef.current!);
            setIsPlaying(false);
            setSessionActive(false);
            return totalDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, sessionActive, totalDuration]);

  const handleStart = (activity: GuidedActivity) => {
    analytics.activityStarted(activity.title, activity.type);  
    setSelectedActivity(activity);
    setModalVisible(true);
    setElapsedSeconds(0);
    setSessionActive(false);
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [sound]);

  useEffect(() => {
    analytics.screenViewed('Activities');
  }, []);
  

  const handleTogglePlay = useCallback(async () => {
    if (!sessionActive) {
      // First tap — start session
      setSessionActive(true);
      setIsPlaying(true);

      // Also start audio if available
      if (selectedActivity?.audioUrl && !sound) {
        try {
          setIsLoadingAudio(true);
          const { sound: createdSound } = await Audio.Sound.createAsync(
            { uri: selectedActivity.audioUrl },
            { shouldPlay: true }
          );
          setSound(createdSound);
          setIsLoadingAudio(false);
          analytics.activityAudioPlayed(selectedActivity.title);
        } catch (_error) {
          setIsLoadingAudio(false);
        }
      }
      return;
    }

    // Toggle play/pause
    if (isPlaying) {
      setIsPlaying(false);
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await sound.pauseAsync();
        }
      }
    } else {
      setIsPlaying(true);
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && !status.isPlaying) {
          await sound.playAsync();
        }
      }
    }
  }, [sessionActive, isPlaying, sound, selectedActivity]);

  const handleDone = () => {
    if (sound) {
      sound.stopAsync().catch(() => {});
      sound.unloadAsync().catch(() => {});
      setSound(null);
    }
    analytics.activityCompleted(selectedActivity?.title || '', selectedActivity?.type || '');  
    setIsPlaying(false);
    setSessionActive(false);
    setElapsedSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
    setModalVisible(false);
    setSelectedActivity(null);
  };

  const renderCard = ({ item }: { item: GuidedActivity }) => (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }, colors.shadowSoft]}>
      {item.thumbnail && <Image source={item.thumbnail} style={styles.thumbnail} />}
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{item.title}</Text>
        <Text style={[styles.cardBadge, { backgroundColor: colors.primaryContainer, color: colors.onPrimaryContainer }]}>
          {item.type}
        </Text>
        <Text style={[styles.cardDescription, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
          {item.description}
        </Text>
        {item.audioUrl && (
          <Text style={[styles.audioGuidedLabel, { color: colors.onSurfaceVariant }]}>
            Audio Guided
          </Text>
        )}
        <View style={{ marginTop: 12, width: 80 }}>
          <AnimatedStartButton onPress={() => handleStart(item)} />
        </View>
      </View>
    </View>
  );

  return (
    <Layout title="Guided Activities" onNavigate={(screen) => navigation.navigate(screen as never)}>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.header, { color: colors.text }]}>Recommended Exercises</Text>

        {isLoading ? (
          <Text style={{ color: colors.onSurfaceVariant }}>Loading...</Text>
        ) : (
          <FlatList
            data={activities.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        )}

        <Modal visible={modalVisible} animationType="slide">
          <LinearGradient
            colors={["#ffffff", "#fbf9f2"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              flex: 1,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            }}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalHeaderTitle, { color: colors.onSurfaceVariant }]}
                numberOfLines={1}
              >
                {selectedActivity?.title}
              </Text>
              <TouchableOpacity onPress={handleDone} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: colors.onSurface }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContainer}
              contentContainerStyle={{ paddingBottom: 40, alignItems: "center" }}
            >
              {selectedActivity && (
                <>
                  <Text style={[styles.modalSubtitle, { color: colors.onSurfaceVariant }]}>
                    {selectedActivity.type?.toUpperCase()}
                  </Text>
                  <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
                    {selectedActivity.title}
                  </Text>

                  {/* Progress Ring Player */}
                  <ProgressRingPlayer
                    isPlaying={isPlaying}
                    onTogglePlay={handleTogglePlay}
                    progress={progress}
                    phaseLabel={getPhaseLabel()}
                    timerText={formatTime(totalDuration - elapsedSeconds)}
                    colors={colors}
                  />

                  <View style={{ marginTop: 16, alignSelf: "stretch" }}>
                    <TouchableOpacity onPress={handleDone} activeOpacity={0.8}>
                      <View style={[styles.endSessionButton, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.endSessionButtonText, { color: colors.onPrimary }]}>End Session</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </LinearGradient>
        </Modal>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: isIPad ? 700 : undefined,
    width: "100%",
    alignSelf: "center",
    padding: 10,
  },
  header: {
    fontFamily: "System",
    fontWeight: "700" as const,
    fontSize: 28,
    letterSpacing: -0.04 * 28,
    paddingTop: 18,
    paddingBottom: 14,
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 20,
    alignItems: "center",
    // shadowSoft applied via theme token in renderCard
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: "System",
    fontWeight: "bold",
    fontSize: 18,
  },
  cardBadge: {
    fontFamily: "System",
    fontWeight: "600" as const,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.08 * 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  cardDescription: {
    fontFamily: "System",
    fontSize: 15,
    lineHeight: 15 * 1.6,
    marginTop: 4,
  },
  audioGuidedLabel: {
    fontFamily: "System",
    fontWeight: "400" as const,
    fontSize: 13,
    marginTop: 4,
  },
  startButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  startButtonText: {
    fontFamily: "System",
    fontWeight: "600" as const,
    fontSize: 14,
    color: "#ffffff",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontFamily: "System",
    fontWeight: "700" as const,
    fontSize: 28,
    letterSpacing: -0.04 * 28,
    marginBottom: 24,
    textAlign: "center",
  },
  modalSubtitle: {
    fontFamily: "System",
    fontWeight: "600" as const,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.1 * 12,
    marginBottom: 12,
    textAlign: "center",
  },
  stepContainer: {
    marginBottom: 12,
  },
  stepTitle: {
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  stepText: {
    fontFamily: "System",
    fontWeight: "400" as const,
    fontSize: 15,
    lineHeight: 15 * 1.6,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalHeaderTitle: {
    fontFamily: "System",
    fontWeight: "400" as const,
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    fontFamily: "System",
    fontWeight: "600" as const,
  },
  audioButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  audioButtonText: {
    fontFamily: "System",
    fontWeight: "600" as const,
    fontSize: 14,
  },
  endSessionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  endSessionButtonText: {
    fontFamily: "System",
    fontWeight: "600" as const,
    fontSize: 16,
    color: "#ffffff",
  },

  // ── Progress Ring Player styles ──
  progressRingContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26, 171, 186, 0.08)",
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
  },
  timerPillIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  timerPillText: {
    fontFamily: "System",
    fontWeight: "600" as const,
    fontSize: 22,
  },
  phaseLabel: {
    fontFamily: "System",
    fontWeight: "500" as const,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.05 * 14,
    marginBottom: 16,
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  playPauseButton: {
    position: "absolute",
  },
  playPauseGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  pauseIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  pauseBar: {
    width: 6,
    height: 22,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },
  playIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2, // optical centering shift
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftColor: "#ffffff",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
});

export default GuidedActivitiesScreen;

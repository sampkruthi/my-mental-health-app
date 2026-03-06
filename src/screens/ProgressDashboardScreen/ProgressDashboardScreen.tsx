// src/screens/ProgressDashboardScreen/ProgressDashboardScreen.tsx
import React from 'react';
import { ScrollView, StyleSheet, View, Text, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Layout from '../../components/UI/layout';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFetchProgressDashboard } from '../../api/hooks';

const { width: screenWidth } = Dimensions.get('window');

const isIPad = Platform.OS === 'ios' && Platform.isPad;

export const ProgressDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { token } = useAuth();
  const { data: progress, isLoading, isError } = useFetchProgressDashboard(token);

  console.log('🔍 ProgressDashboardScreen - isLoading:', isLoading);
  console.log('🔍 ProgressDashboardScreen - isError:', isError);
  console.log('🔍 ProgressDashboardScreen - progress:', progress);

  const getTrendEmoji = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#4CAF50';
      case 'declining': return '#F44336';
      default: return '#FFC107';
    }
  };

  return (
    <Layout
      title="Progress Dashboard"
      onNavigate={(screen) => navigation.navigate(screen as never)}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.subText }]}>
              Loading your progress...
            </Text>
          </View>
        ) : isError || !progress ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: 'red' }]}>
              Unable to load progress dashboard
            </Text>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              📊 Your Progress
            </Text>

            <View style={styles.metricsGrid}>
              {/* Mood Trend */}
              <View style={[styles.metric, { backgroundColor: colors.background }]}>
                <Text style={styles.metricEmoji}>{getTrendEmoji(progress.mood_trend)}</Text>
                <Text style={[styles.metricValue, { color: getTrendColor(progress.mood_trend) }]}>
                  {progress.mood_change_percent > 0 ? '+' : ''}{progress.mood_change_percent}%
                </Text>
                <Text style={[styles.metricLabel, { color: colors.subText }]}>
                  Mood Trend
                </Text>
                <Text style={[styles.metricSublabel, { color: colors.subText }]}>
                  {progress.mood_trend}
                </Text>
              </View>

              {/* Current Streak */}
              <View style={[styles.metric, { backgroundColor: colors.background }]}>
                <Text style={styles.metricEmoji}>🔥</Text>
                <Text style={[styles.metricValue, { color: colors.primary }]}>
                  {progress.current_streak}
                </Text>
                <Text style={[styles.metricLabel, { color: colors.subText }]}>
                  Current Streak
                </Text>
                <Text style={[styles.metricSublabel, { color: colors.subText }]}>
                  days
                </Text>
              </View>

              {/* Journal Consistency */}
              <View style={[styles.metric, { backgroundColor: colors.background }]}>
                <Text style={styles.metricEmoji}>📝</Text>
                <Text style={[styles.metricValue, { color: colors.primary }]}>
                  {progress.journal_consistency.toFixed(1)}
                </Text>
                <Text style={[styles.metricLabel, { color: colors.subText }]}>
                  Entries/Week
                </Text>
              </View>

              {/* Longest Streak */}
              <View style={[styles.metric, { backgroundColor: colors.background }]}>
                <Text style={styles.metricEmoji}>🏆</Text>
                <Text style={[styles.metricValue, { color: colors.primary }]}>
                  {progress.longest_streak}
                </Text>
                <Text style={[styles.metricLabel, { color: colors.subText }]}>
                  Longest Streak
                </Text>
                <Text style={[styles.metricSublabel, { color: colors.subText }]}>
                  days
                </Text>
              </View>
            </View>

            {/* Summary */}
            <View style={[styles.summary, { backgroundColor: colors.background, borderColor: colors.inputBorder }]}>
              <Text style={[styles.summaryText, { color: colors.text }]}>
                💪 You've written {progress.total_entries} journal entries
                {progress.avg_sentiment !== null && (
                  <Text style={{ color: progress.avg_sentiment > 0 ? '#4CAF50' : '#F44336' }}>
                    {' '}with an average sentiment of {(progress.avg_sentiment * 100).toFixed(0)}%
                  </Text>
                )}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: isIPad ? 32 : 16,
    maxWidth: isIPad ? 900 : undefined,
    width: '100%',
    alignSelf: 'center',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    marginVertical: 12,
    // ADD shadow:
    shadowColor: "#5B9EB3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  metric: {
    width: isIPad ? '47%' : '48%',
    alignItems: 'center',
    padding: isIPad ? 24 : 16,
    borderRadius: 16,
    // ADD shadow:
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  metricEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  metricLabel: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  metricSublabel: {
    fontSize: 11,
    marginTop: 2,
  },
  summary: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    // ADD shadow:
    shadowColor: "#5B9EB3",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

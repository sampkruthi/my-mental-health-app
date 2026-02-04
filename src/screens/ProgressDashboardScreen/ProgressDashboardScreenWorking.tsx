// src/screens/ProgressDashboardScreen/ProgressDashboardScreen.tsx
import React from 'react';
import { ScrollView, StyleSheet, View, Text, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Layout from '../../components/UI/layout';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFetchProgressDashboard } from '../../api/hooks';

const { width: screenWidth } = Dimensions.get('window');

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
    padding: 16,
    width: screenWidth > 800 ? 900 : '100%',
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
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  metric: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  metricEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  metricSublabel: {
    fontSize: 11,
    marginTop: 2,
  },
  summary: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

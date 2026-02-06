// src/screens/MemorySummaryScreen/MemorySummaryScreen.tsx
import React from 'react';
import { ScrollView, StyleSheet, View, Text, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Layout from '../../components/UI/layout';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFetchMemorySummary } from '../../api/hooks';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const MemorySummaryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { token } = useAuth();
  const { data: memory, isLoading, isError } = useFetchMemorySummary(token);

  console.log('🔍 MemorySummaryScreen - isLoading:', isLoading);
  console.log('🔍 MemorySummaryScreen - isError:', isError);
  console.log('🔍 MemorySummaryScreen - memory:', memory);

  return (
    <Layout
      title="Memory Summary"
      onNavigate={(screen) => navigation.navigate(screen as never)}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.subText }]}>
              Loading your journey...
            </Text>
          </View>
        ) : isError || !memory ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: 'red' }]}>
              Unable to load memory summary
            </Text>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.title, { color: colors.text }]}>
               Your journey so far
            </Text>

            <ScrollView style={styles.summaryContainer} scrollEnabled={true} nestedScrollEnabled={true}>
              <Text style={[styles.summary, { color: colors.text }]}>
                {memory.summary.replace(/\*\*Recent conversation:\*\*\s*/gi, '').trim()}
              </Text>
            </ScrollView>

            {memory.key_themes && memory.key_themes.length > 0 && (
              <View style={styles.themesContainer}>
                <Text style={[styles.themesLabel, { color: colors.subText }]}>
                  Key Themes:
                </Text>
                <View style={styles.themesRow}>
                  {memory.key_themes.map((theme, index) => (
                    <View key={index} style={styles.themeBadge}>
                      <Text style={styles.themeText}>{theme}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {memory.journal_count}
                </Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>
                  Journal Entries
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {memory.mood_count}
                </Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>
                  Mood Logs
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {memory.days_tracked}
                </Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>
                  Days Tracked
                </Text>
              </View>
            </View>

            <Text style={[styles.footer, { color: colors.subText }]}>
              Last updated: {new Date(memory.last_updated).toLocaleDateString()}
            </Text>
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
    width: screenWidth > 800 ? '90%' : '100%',
    maxWidth: screenWidth > 800 ? 1200 : undefined,
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
    shadowColor: "5B9EB3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  summaryContainer: {
    maxHeight: screenWidth > 800 ? 400 : 250,
    marginBottom: 16,
    borderRadius: 8,
    paddingRight: 8,
  },
  summary: {
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  themesContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  themesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  themesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeBadge: {
    backgroundColor: `"E8B4A8"30`,// '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    //Add shadows
    shadowColor: "E8B4A8",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 1,
  },
  themeText: {
    fontSize: 13,
    color: '#5B9EB3',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    fontSize: 11,
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
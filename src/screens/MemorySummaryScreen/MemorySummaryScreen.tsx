// src/screens/MemorySummaryScreen/MemorySummaryScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, ActivityIndicator, Dimensions, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Layout from '../../components/UI/layout';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFetchMemorySummary, useFetchUserProfile, useUpdateUserProfile } from '../../api/hooks';

const { width: screenWidth } = Dimensions.get('window');

export const MemorySummaryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { token } = useAuth();

  const { data: memory, isLoading: isMemoryLoading, isError: isMemoryError } = useFetchMemorySummary(token);

  // Profile state and hooks
  const { data: profile, isLoading: isProfileLoading, isError: isProfileError } = useFetchUserProfile(token);
  const updateProfileMutation = useUpdateUserProfile(token);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Initialize edited name when profile loads
  useEffect(() => {
    if (profile?.name) {
      setEditedName(profile.name);
    }
  }, [profile?.name]);

  const handleEditName = () => {
    setEditedName(profile?.name || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({ name: editedName.trim() });
      setIsEditingName(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update name. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditedName(profile?.name || '');
    setIsEditingName(false);
  };


  console.log('MemorySummaryScreen - isMemoryLoading:', isMemoryLoading);
  console.log('MemorySummaryScreen - isMemoryError:', isMemoryError);
  console.log('MemorySummaryScreen - memory:', memory);
  console.log('MemorySummaryScreen - isProfileLoading:', isProfileLoading);
  console.log('MemorySummaryScreen - profile:', profile);

  const isLoading = isMemoryLoading && isProfileLoading;
  
  const hasError = isProfileError;

  return (
    <Layout
      title="Profile"
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
              Loading your profile...
            </Text>
          </View>
        ) : hasError ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: 'red' }]}>
              Unable to load profile
            </Text>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
              {isProfileLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : isProfileError ? (
                <Text style={[styles.profileErrorText, { color: colors.subText }]}>
                  Unable to load profile
                </Text>
              ) : profile ? (
                <>
                  {isEditingName ? (
                    <View style={styles.editNameContainer}>
                      <TextInput
                        style={[styles.nameInput, { color: colors.text, borderColor: colors.primary }]}
                        value={editedName}
                        onChangeText={setEditedName}
                        placeholder="Enter your name"
                        placeholderTextColor={colors.subText}
                        autoFocus
                      />
                      <View style={styles.editButtonsRow}>
                        <TouchableOpacity
                          style={[styles.saveButton, { backgroundColor: colors.primary }]}
                          onPress={handleSaveName}
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text style={styles.saveButtonText}>Save</Text>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.cancelButton, { borderColor: colors.subText }]}
                          onPress={handleCancelEdit}
                        >
                          <Text style={[styles.cancelButtonText, { color: colors.subText }]}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.profileDisplayContainer}>
                      <Text style={[styles.userName, { color: colors.text }]}>
                        {profile.name || 'No name set'}
                      </Text>
                      <TouchableOpacity onPress={handleEditName} style={styles.editButton}>
                        <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <Text style={[styles.userEmail, { color: colors.subText }]}>
                    {profile.username}
                  </Text>
                </>
              ) : null}
            </View>

            {memory && (
            <>
            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.subText + '30' }]} />

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
          </>
            )}
            {/* ✅ ADD: Show message for new users with no activity yet */}
            {!memory && !isMemoryLoading && (
              <View style={styles.noDataContainer}>
                <Text style={[styles.noDataTitle, { color: colors.text }]}>
                  Welcome to Bodhira! 🌱
                </Text>
                <Text style={[styles.noDataText, { color: colors.subText }]}>
                  Start your wellness journey by:
                </Text>
                <View style={styles.noDataList}>
                  <Text style={[styles.noDataItem, { color: colors.subText }]}>
                    • Tracking your mood
                  </Text>
                  <Text style={[styles.noDataItem, { color: colors.subText }]}>
                    • Writing in your journal
                  </Text>
                  <Text style={[styles.noDataItem, { color: colors.subText }]}>
                    • Chatting with your AI assistant
                  </Text>
                </View>
              </View>
            )}
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
    paddingHorizontal: 20,
    paddingVertical: 32,
    marginVertical: 12,
    // ADD shadow:
    shadowColor: "5B9EB3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  profileSection: {
    marginBottom: 28,
    paddingVertical: 12,
    alignItems: 'center',
  },
  profileDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
  },
  profileErrorText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editNameContainer: {
    width: '100%',
    alignItems: 'center',
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    textAlign: 'center',
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  saveButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 24,
  },
  themesContainer: {
    marginTop: 8,
    marginBottom: 28,
    paddingVertical: 8,
  },
  themesLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  themesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeBadge: {
    backgroundColor: `"E8B4A8"30`,// '#E8F5E9',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    //Add shadows
    shadowColor: "E8B4A8",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 1,
  },
  themeText: {
    fontSize: 14,
    color: '#5B9EB3',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    paddingBottom: 12,
    marginRight: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noDataContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  noDataTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  noDataList: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  noDataItem: {
    fontSize: 15,
    marginVertical: 6,
    lineHeight: 22,
  }
});
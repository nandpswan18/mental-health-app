import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, RefreshControl } from 'react-native';
import { Text, Card, Button, Title, Paragraph, useTheme, Surface, Avatar, IconButton, Divider, Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

import { useAuth } from '../contexts/AuthContext';
import AnimatedCharacter from '../components/AnimatedCharacter';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../styles/DesignSystem';

// Define the navigation param list type
type MainTabParamList = {
  Home: undefined;
  Chat: undefined;
  Profile: undefined;
  Resources: undefined;
  Journal: undefined;
};

type MainTabNavigationProp = StackNavigationProp<MainTabParamList>;

// Daily tips for mental wellbeing
const dailyTips = [
  "Take 5 minutes to practice deep breathing today.",
  "Try to drink at least 8 glasses of water today.",
  "Reach out to someone you care about just to say hello.",
  "Take a short walk outside to get some fresh air and sunlight.",
  "Practice gratitude by writing down three things you're thankful for.",
  "Set a small, achievable goal for today and celebrate when you complete it.",
  "Take a break from social media for a few hours.",
  "Try a 10-minute meditation session to clear your mind.",
  "Get 7-8 hours of sleep tonight to recharge your body and mind.",
  "Spend a few minutes stretching to release physical tension.",
  "Listen to music that makes you feel good.",
  "Try to eat a nutritious meal with plenty of vegetables.",
  "Take a moment to acknowledge your feelings without judgment.",
  "Do something creative today, even if it's just for a few minutes.",
  "Practice saying 'no' to things that drain your energy."
];

// Add type for MaterialCommunityIcons names
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<MainTabNavigationProp>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  
  const [journalCount, setJournalCount] = useState(0);
  const [lastJournalDate, setLastJournalDate] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [dailyTip, setDailyTip] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    // Load journal data
    try {
      const entriesJson = await SecureStore.getItemAsync('journalEntries');
      if (entriesJson) {
        const entries = JSON.parse(entriesJson);
        setJournalCount(entries.length);
        
        if (entries.length > 0) {
          // Sort entries by date (newest first)
          entries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setLastJournalDate(entries[0].date);
        }
      }
      
      // Load streak data
      const streakData = await SecureStore.getItemAsync('journalStreak');
      if (streakData) {
        const { count } = JSON.parse(streakData);
        setStreakCount(count);
      }

      // Load mood data
      const moodData = await SecureStore.getItemAsync('currentMood');
      if (moodData) {
        const { mood } = JSON.parse(moodData);
        setCurrentMood(mood);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    // Set random daily tip
    setDailyTip(dailyTips[Math.floor(Math.random() * dailyTips.length)]);
    
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    // Set a new random tip on refresh
    setDailyTip(dailyTips[Math.floor(Math.random() * dailyTips.length)]);
    setRefreshing(false);
  };

  const timeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Take a moment to breathe and set your intentions for the day.';
    if (hour < 18) return 'Remember to pause and check in with yourself today.';
    return 'It\'s time to unwind and reflect on your day.';
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const handleMoodSelection = async (mood: number) => {
    setCurrentMood(mood);
    // Save mood to storage
    try {
      await SecureStore.setItemAsync('currentMood', JSON.stringify({ mood, date: new Date().toISOString() }));
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };
  
  const getMoodColor = (mood: number) => {
    const colors = [
      COLORS.MOOD_TERRIBLE,
      COLORS.MOOD_BAD,
      COLORS.MOOD_NEUTRAL,
      COLORS.MOOD_GOOD,
      COLORS.MOOD_GREAT
    ];
    return colors[mood - 1] || colors[2];
  };
  
  const getMoodName = (mood: number) => {
    const moods = ['Terrible', 'Bad', 'Neutral', 'Good', 'Great'];
    return moods[mood - 1] || 'Neutral';
  };
  
  const getMoodIcon = (mood: number): MaterialCommunityIconName => {
    const icons: MaterialCommunityIconName[] = [
      'emoticon-dead-outline',
      'emoticon-sad-outline',
      'emoticon-neutral-outline',
      'emoticon-happy-outline',
      'emoticon-excited-outline'
    ];
    return icons[mood - 1] || icons[2];
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.DEEP_CLOUD_GREY }]}>
      <StatusBar style="light" />
      
      {/* Profile Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: COLORS.DEEP_SERENITY_BLUE }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good {timeOfDay()},</Text>
            <Text style={styles.userName}>{user?.name || 'Friend'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Avatar.Text 
              size={50} 
              label={(user?.name?.charAt(0) || 'U') + (user?.name?.split(' ')[1]?.charAt(0) || '')} 
              style={{ backgroundColor: COLORS.DEEP_MINDFUL_MINT }}
              labelStyle={{ color: COLORS.DEEPER_REFLECTION }}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.DEEP_SERENITY_BLUE]}
            tintColor={COLORS.DEEP_SERENITY_BLUE}
          />
        }
      >
        {/* Daily Tip Card */}
        <Card style={styles.tipCard}>
          <Card.Content style={styles.tipContent}>
            <MaterialCommunityIcons name="lightbulb-outline" size={24} color={COLORS.DEEP_GOLDEN_GLOW} />
            <View style={styles.tipTextContainer}>
              <Text style={styles.tipTitle}>Daily Tip</Text>
              <Text style={styles.tipText}>{dailyTip}</Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Current Mood Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="emoticon-outline" size={24} color={COLORS.DEEPER_REFLECTION} />
            <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          </View>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.moodSelector}>
                {[1, 2, 3, 4, 5].map((mood) => (
                  <TouchableOpacity
                    key={mood}
                    style={[
                      styles.moodButton,
                      currentMood === mood && { 
                        backgroundColor: getMoodColor(mood),
                        transform: [{ scale: 1.1 }]
                      }
                    ]}
                    onPress={() => handleMoodSelection(mood)}
                  >
                    <MaterialCommunityIcons 
                      name={getMoodIcon(mood)} 
                      size={28} 
                      color={currentMood === mood ? COLORS.WHITE : COLORS.DEEPER_REFLECTION} 
                    />
                    <Text 
                      style={[
                        styles.moodText, 
                        currentMood === mood && { color: COLORS.WHITE }
                      ]}
                    >
                      {getMoodName(mood)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {currentMood && (
                <View style={styles.moodFeedback}>
                  <Text style={styles.moodFeedbackText}>
                    {currentMood <= 2 
                      ? "It's okay to not feel your best. Consider journaling about your feelings or using a coping strategy." 
                      : "That's great! Keep track of what's working well for you in your journal."}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </View>
        
        {/* Your Journey Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="chart-timeline-variant" size={24} color={COLORS.DEEPER_REFLECTION} />
            <Text style={styles.sectionTitle}>Your Journey</Text>
          </View>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="notebook-outline" size={24} color={COLORS.DEEP_SERENITY_BLUE} />
                  <Text style={styles.statNumber}>{journalCount}</Text>
                  <Text style={styles.statLabel}>Journal Entries</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="fire" size={24} color={COLORS.DEEP_HOPEFUL_CORAL} />
                  <Text style={styles.statNumber}>{streakCount}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="calendar-check" size={24} color={COLORS.DEEP_MINDFUL_MINT} />
                  <Text style={styles.statDate}>{lastJournalDate ? formatDate(lastJournalDate) : 'Never'}</Text>
                  <Text style={styles.statLabel}>Last Entry</Text>
                </View>
              </View>
              
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Journal')}
                style={[styles.journalButton, { backgroundColor: COLORS.DEEP_SERENITY_BLUE }]}
                labelStyle={{ color: COLORS.WHITE }}
                icon="pencil"
              >
                New Journal Entry
              </Button>
            </Card.Content>
          </Card>
        </View>
        
        {/* Quick Actions Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="lightning-bolt" size={24} color={COLORS.DEEPER_REFLECTION} />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Chat')}
            >
              <View style={[styles.iconCircle, { backgroundColor: COLORS.DEEP_SERENITY_BLUE }]}>
                <MaterialCommunityIcons name="chat-processing-outline" size={24} color={COLORS.WHITE} />
              </View>
              <Text style={styles.quickActionText}>Chat Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Resources')}
            >
              <View style={[styles.iconCircle, { backgroundColor: COLORS.DEEP_MINDFUL_MINT }]}>
                <MaterialCommunityIcons name="heart-pulse" size={24} color={COLORS.WHITE} />
              </View>
              <Text style={styles.quickActionText}>Resources</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => {/* Start breathing exercise */}}
            >
              <View style={[styles.iconCircle, { backgroundColor: COLORS.DEEP_HOPEFUL_CORAL }]}>
                <MaterialCommunityIcons name="meditation" size={24} color={COLORS.WHITE} />
              </View>
              <Text style={styles.quickActionText}>Breathing</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={[styles.iconCircle, { backgroundColor: COLORS.DEEP_GOLDEN_GLOW }]}>
                <MaterialCommunityIcons name="account-outline" size={24} color={COLORS.WHITE} />
              </View>
              <Text style={styles.quickActionText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Mindfulness Exercise */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="meditation" size={24} color={COLORS.DEEPER_REFLECTION} />
            <Text style={styles.sectionTitle}>Mindfulness Exercise</Text>
          </View>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.mindfulnessHeader}>
                <Text style={styles.mindfulnessTitle}>2-Minute Breathing Exercise</Text>
                <Badge style={[styles.newBadge, { backgroundColor: COLORS.DEEP_HOPEFUL_CORAL }]}>NEW</Badge>
              </View>
              <Text style={styles.mindfulnessDescription}>
                Take a moment to breathe deeply. Inhale for 4 counts, hold for 4, and exhale for 6. This simple practice can help reduce stress and increase focus.
              </Text>
              <Button 
                mode="contained" 
                onPress={() => {/* Start breathing exercise */}}
                style={[styles.mindfulnessButton, { backgroundColor: COLORS.DEEP_SERENITY_BLUE }]}
                labelStyle={{ color: COLORS.WHITE }}
                icon="play"
              >
                Start Exercise
              </Button>
            </Card.Content>
          </Card>
        </View>
        
        {/* Bottom padding */}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.MEDIUM,
  },
  header: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingBottom: SPACING.LARGE,
    borderBottomLeftRadius: BORDER_RADIUS.LARGE,
    borderBottomRightRadius: BORDER_RADIUS.LARGE,
    ...SHADOWS.MEDIUM,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.MEDIUM,
    marginBottom: SPACING.SMALL,
  },
  greeting: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MEDIUM,
    color: COLORS.WHITE,
    opacity: 0.9,
  },
  userName: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XXLARGE,
    fontWeight: '700',
    color: COLORS.WHITE,
  },
  tipCard: {
    marginTop: -SPACING.LARGE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    ...SHADOWS.MEDIUM,
    backgroundColor: COLORS.WHITE,
    marginBottom: SPACING.MEDIUM,
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipTextContainer: {
    marginLeft: SPACING.SMALL,
    flex: 1,
  },
  tipTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MEDIUM,
    fontWeight: '700',
    color: COLORS.DEEPER_REFLECTION,
    marginBottom: SPACING.TINY,
  },
  tipText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MEDIUM,
    color: COLORS.DEEPER_REFLECTION,
    opacity: 0.8,
  },
  sectionContainer: {
    marginBottom: SPACING.LARGE,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LARGE,
    fontWeight: '700',
    color: COLORS.DEEPER_REFLECTION,
    marginLeft: SPACING.SMALL,
  },
  card: {
    borderRadius: BORDER_RADIUS.MEDIUM,
    ...SHADOWS.SMALL,
    backgroundColor: COLORS.WHITE,
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MEDIUM,
  },
  moodButton: {
    alignItems: 'center',
    padding: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.MEDIUM,
    backgroundColor: COLORS.DEEP_CLOUD_GREY,
    width: '18%',
  },
  moodText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.TINY,
    marginTop: SPACING.TINY,
    color: COLORS.DEEPER_REFLECTION,
  },
  moodFeedback: {
    backgroundColor: COLORS.DEEP_CLOUD_GREY,
    padding: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.SMALL,
  },
  moodFeedbackText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SMALL,
    color: COLORS.DEEPER_REFLECTION,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MEDIUM,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.SMALL,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.DEEP_CLOUD_GREY,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XLARGE,
    fontWeight: '700',
    color: COLORS.DEEPER_REFLECTION,
    marginVertical: SPACING.TINY,
  },
  statDate: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SMALL,
    fontWeight: '600',
    color: COLORS.DEEPER_REFLECTION,
    marginVertical: SPACING.TINY,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SMALL,
    color: COLORS.DEEPER_REFLECTION,
    opacity: 0.7,
  },
  journalButton: {
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
    alignItems: 'center',
    ...SHADOWS.SMALL,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.CIRCLE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MEDIUM,
    color: COLORS.DEEPER_REFLECTION,
    fontWeight: '500',
  },
  mindfulnessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.SMALL,
  },
  mindfulnessTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LARGE,
    fontWeight: '600',
    color: COLORS.DEEPER_REFLECTION,
  },
  newBadge: {
    backgroundColor: COLORS.DEEP_HOPEFUL_CORAL,
  },
  mindfulnessDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MEDIUM,
    color: COLORS.DEEPER_REFLECTION,
    opacity: 0.8,
    marginBottom: SPACING.MEDIUM,
    lineHeight: 22,
  },
  mindfulnessButton: {
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
});

export default HomeScreen; 
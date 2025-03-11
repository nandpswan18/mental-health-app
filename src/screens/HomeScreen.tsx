import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Dimensions, 
  RefreshControl,
  ImageBackground,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { 
  Text, 
  Button, 
  Avatar, 
  IconButton, 
  Divider, 
  Badge,
  Surface,
  ProgressBar
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../contexts/AuthContext';
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
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// Quick action items
const quickActions = [
  {
    id: 'journal',
    title: 'Journal',
    description: 'Record your thoughts and feelings',
    icon: 'book-outline' as IoniconsName,
    color: COLORS.MODERN_PRIMARY,
    route: 'Journal'
  },
  {
    id: 'chat',
    title: 'Chat Support',
    description: 'Talk with your AI companion',
    icon: 'chatbubble-outline' as IoniconsName,
    color: COLORS.MODERN_SECONDARY,
    route: 'Chat'
  },
  {
    id: 'resources',
    title: 'Resources',
    description: 'Explore helpful content',
    icon: 'library-outline' as IoniconsName,
    color: COLORS.MODERN_ACCENT,
    route: 'Resources'
  },
  {
    id: 'breathing',
    title: 'Breathing',
    description: '2-minute breathing exercise',
    icon: 'fitness-outline' as IoniconsName,
    color: COLORS.MODERN_HIGHLIGHT,
    route: 'Breathing'
  }
];

const HomeScreen = () => {
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
  const [wellnessScore, setWellnessScore] = useState(75); // Mock wellness score

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
      COLORS.MODERN_ERROR,
      COLORS.MODERN_WARNING,
      COLORS.MODERN_HIGHLIGHT,
      COLORS.MODERN_SECONDARY,
      COLORS.MODERN_SUCCESS
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
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={[COLORS.MODERN_PRIMARY, COLORS.MODERN_SECONDARY]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + (RNStatusBar.currentHeight || 0) }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good {timeOfDay()}</Text>
            <Text style={styles.userName}>{user?.name || 'Friend'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Avatar.Text 
              size={48} 
              label={(user?.name?.charAt(0) || 'U') + (user?.name?.split(' ')[1]?.charAt(0) || '')} 
              style={styles.avatar}
              labelStyle={{ color: COLORS.MODERN_PRIMARY }}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.MODERN_PRIMARY]}
            tintColor={COLORS.MODERN_PRIMARY}
          />
        }
      >
        {/* Wellness Score Card */}
        <Surface style={styles.wellnessCard}>
          <View style={styles.wellnessHeader}>
            <View>
              <Text style={styles.wellnessTitle}>Wellness Score</Text>
              <Text style={styles.wellnessSubtitle}>Based on your activity and mood</Text>
            </View>
            <View style={styles.wellnessScoreCircle}>
              <Text style={styles.wellnessScoreText}>{wellnessScore}</Text>
            </View>
          </View>
          <ProgressBar 
            progress={wellnessScore / 100} 
            color={COLORS.MODERN_PRIMARY} 
            style={styles.wellnessProgress} 
          />
          <View style={styles.wellnessStats}>
            <View style={styles.wellnessStat}>
              <Ionicons name="journal-outline" size={20} color={COLORS.MODERN_PRIMARY} />
              <Text style={styles.wellnessStatValue}>{journalCount}</Text>
              <Text style={styles.wellnessStatLabel}>Entries</Text>
            </View>
            <View style={styles.wellnessStat}>
              <Ionicons name="flame-outline" size={20} color={COLORS.MODERN_ACCENT} />
              <Text style={styles.wellnessStatValue}>{streakCount}</Text>
              <Text style={styles.wellnessStatLabel}>Streak</Text>
            </View>
            <View style={styles.wellnessStat}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.MODERN_SECONDARY} />
              <Text style={styles.wellnessStatValue}>{lastJournalDate ? formatDate(lastJournalDate).split(',')[0] : 'None'}</Text>
              <Text style={styles.wellnessStatLabel}>Last Entry</Text>
            </View>
          </View>
        </Surface>
        
        {/* Daily Tip Card */}
        <Surface style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={24} color={COLORS.MODERN_HIGHLIGHT} />
            <Text style={styles.tipTitle}>Daily Insight</Text>
          </View>
          <Text style={styles.tipText}>{dailyTip}</Text>
        </Surface>
        
        {/* Quick Actions Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.quickActionsGrid}>
          {quickActions.map(action => (
            <TouchableOpacity 
              key={action.id}
              style={styles.quickActionCard}
              onPress={() => navigation.navigate(action.route as any)}
            >
              <View style={[styles.quickActionIconContainer, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
              <Text style={styles.quickActionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Mood Tracker Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
        </View>
        
        <Surface style={styles.moodCard}>
          <View style={styles.moodSelector}>
            {[1, 2, 3, 4, 5].map((mood) => (
              <TouchableOpacity
                key={mood}
                style={[
                  styles.moodButton,
                  currentMood === mood && { 
                    backgroundColor: getMoodColor(mood) + '30',
                    borderColor: getMoodColor(mood),
                  }
                ]}
                onPress={() => handleMoodSelection(mood)}
              >
                <MaterialCommunityIcons 
                  name={getMoodIcon(mood)} 
                  size={28} 
                  color={getMoodColor(mood)} 
                />
                <Text 
                  style={[
                    styles.moodText, 
                    { color: getMoodColor(mood) }
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
        </Surface>
        
        {/* Featured Exercise */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Exercise</Text>
        </View>
        
        <TouchableOpacity>
          <Surface style={styles.featuredCard}>
            <View style={styles.featuredContent}>
              <View>
                <View style={styles.featuredBadgeContainer}>
                  <Text style={styles.featuredBadge}>NEW</Text>
                </View>
                <Text style={styles.featuredTitle}>2-Minute Breathing</Text>
                <Text style={styles.featuredDescription}>
                  A quick breathing exercise to help you relax and refocus
                </Text>
                <Button 
                  mode="contained" 
                  onPress={() => {/* Start breathing exercise */}}
                  style={styles.featuredButton}
                  labelStyle={styles.featuredButtonLabel}
                  icon="play"
                >
                  Start Now
                </Button>
              </View>
              <View style={styles.featuredImageContainer}>
                <Ionicons name="fitness" size={80} color={COLORS.MODERN_PRIMARY + '50'} />
              </View>
            </View>
          </Surface>
        </TouchableOpacity>
        
        {/* Bottom padding */}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.MODERN_BG_LIGHT,
  },
  header: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingBottom: SPACING.LARGE,
    borderBottomLeftRadius: BORDER_RADIUS.LARGE,
    borderBottomRightRadius: BORDER_RADIUS.LARGE,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.MEDIUM,
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
  avatar: {
    backgroundColor: COLORS.WHITE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.MEDIUM,
  },
  wellnessCard: {
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginTop: -SPACING.XLARGE,
    backgroundColor: COLORS.WHITE,
    ...SHADOWS.MEDIUM,
    elevation: 4,
  },
  wellnessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  wellnessTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LARGE,
    fontWeight: '700',
    color: COLORS.MODERN_TEXT_PRIMARY,
  },
  wellnessSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SMALL,
    color: COLORS.MODERN_TEXT_SECONDARY,
    marginTop: 2,
  },
  wellnessScoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.MODERN_PRIMARY + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wellnessScoreText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XLARGE,
    fontWeight: 'bold',
    color: COLORS.MODERN_PRIMARY,
  },
  wellnessProgress: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.MEDIUM,
    backgroundColor: COLORS.MODERN_PRIMARY + '20',
  },
  wellnessStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wellnessStat: {
    alignItems: 'center',
    flex: 1,
  },
  wellnessStatValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MEDIUM,
    fontWeight: '600',
    color: COLORS.MODERN_TEXT_PRIMARY,
    marginTop: 4,
  },
  wellnessStatLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.TINY,
    color: COLORS.MODERN_TEXT_SECONDARY,
    marginTop: 2,
  },
  tipCard: {
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginTop: SPACING.MEDIUM,
    backgroundColor: COLORS.WHITE,
    ...SHADOWS.SMALL,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  tipTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MEDIUM,
    fontWeight: '600',
    color: COLORS.MODERN_TEXT_PRIMARY,
    marginLeft: SPACING.SMALL,
  },
  tipText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MEDIUM,
    color: COLORS.MODERN_TEXT_SECONDARY,
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LARGE,
    fontWeight: '700',
    color: COLORS.MODERN_TEXT_PRIMARY,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SMALL,
    color: COLORS.MODERN_PRIMARY,
    fontWeight: '600',
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
    ...SHADOWS.SMALL,
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  quickActionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MEDIUM,
    fontWeight: '600',
    color: COLORS.MODERN_TEXT_PRIMARY,
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SMALL,
    color: COLORS.MODERN_TEXT_SECONDARY,
  },
  moodCard: {
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.WHITE,
    ...SHADOWS.SMALL,
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
    backgroundColor: COLORS.MODERN_BG_LIGHT,
    width: '18%',
    borderWidth: 1,
    borderColor: COLORS.MODERN_BORDER_LIGHT,
  },
  moodText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.TINY,
    marginTop: SPACING.TINY,
    fontWeight: '500',
  },
  moodFeedback: {
    backgroundColor: COLORS.MODERN_BG_LIGHT,
    padding: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.SMALL,
  },
  moodFeedbackText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SMALL,
    color: COLORS.MODERN_TEXT_SECONDARY,
    lineHeight: 18,
  },
  featuredCard: {
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.WHITE,
    ...SHADOWS.SMALL,
  },
  featuredContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuredBadgeContainer: {
    backgroundColor: COLORS.MODERN_ACCENT + '20',
    paddingHorizontal: SPACING.SMALL,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.SMALL,
    alignSelf: 'flex-start',
    marginBottom: SPACING.SMALL,
  },
  featuredBadge: {
    fontSize: TYPOGRAPHY.FONT_SIZE.TINY,
    fontWeight: '700',
    color: COLORS.MODERN_ACCENT,
  },
  featuredTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LARGE,
    fontWeight: '700',
    color: COLORS.MODERN_TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  featuredDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MEDIUM,
    color: COLORS.MODERN_TEXT_SECONDARY,
    marginBottom: SPACING.MEDIUM,
    width: '70%',
    lineHeight: 20,
  },
  featuredButton: {
    backgroundColor: COLORS.MODERN_PRIMARY,
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  featuredButtonLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SMALL,
    fontWeight: '600',
  },
  featuredImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen; 
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { Text, Card, Button, Title, Paragraph, useTheme, Surface, Avatar, IconButton, Divider } from 'react-native-paper';
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

  useEffect(() => {
    // Load journal data
    const loadJournalData = async () => {
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
      } catch (error) {
        console.error('Error loading journal data:', error);
      }
    };
    
    // Set random daily tip
    setDailyTip(dailyTips[Math.floor(Math.random() * dailyTips.length)]);
    
    loadJournalData();
  }, []);

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
  
  const handleMoodSelection = (mood: number) => {
    setCurrentMood(mood);
    // Here you would typically save this to storage or your backend
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
    <View style={[styles.container, { backgroundColor: COLORS.SOFT_CLOUD_GREY }]}>
      <StatusBar style="light" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={[styles.header, { paddingTop: insets.top, backgroundColor: COLORS.SERENITY_BLUE }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Good {timeOfDay()},</Text>
              <Text style={styles.userName}>{user?.name || 'Friend'}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Avatar.Text 
                size={50} 
                label={(user?.name?.charAt(0) || 'U') + (user?.name?.split(' ')[1]?.charAt(0) || '')} 
                style={{ backgroundColor: COLORS.MINDFUL_MINT }}
                labelStyle={{ color: COLORS.DEEP_REFLECTION }}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.subGreeting}>{getGreeting()}</Text>
        </View>
        
        {/* Daily Tip Card */}
        <Card style={styles.tipCard}>
          <Card.Content style={styles.tipContent}>
            <MaterialCommunityIcons name="lightbulb-outline" size={24} color={COLORS.GOLDEN_GLOW} />
            <View style={styles.tipTextContainer}>
              <Text style={styles.tipTitle}>Daily Tip</Text>
              <Text style={styles.tipText}>{dailyTip}</Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Journal')}
            >
              <View style={[styles.iconCircle, { backgroundColor: COLORS.SERENITY_BLUE }]}>
                <MaterialCommunityIcons name="notebook-outline" size={24} color={COLORS.WHITE} />
              </View>
              <Text style={styles.quickActionText}>New Journal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Chat')}
            >
              <View style={[styles.iconCircle, { backgroundColor: COLORS.MINDFUL_MINT }]}>
                <MaterialCommunityIcons name="chat-processing-outline" size={24} color={COLORS.WHITE} />
              </View>
              <Text style={styles.quickActionText}>Chat Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Resources')}
            >
              <View style={[styles.iconCircle, { backgroundColor: COLORS.HOPEFUL_CORAL }]}>
                <MaterialCommunityIcons name="heart-pulse" size={24} color={COLORS.WHITE} />
              </View>
              <Text style={styles.quickActionText}>Resources</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Mood Tracker */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          <Card style={styles.moodCard}>
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
                      color={currentMood === mood ? COLORS.WHITE : COLORS.DEEP_REFLECTION} 
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
        
        {/* Journal Stats */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Journey</Text>
          <Card style={styles.journeyCard}>
            <Card.Content>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{journalCount}</Text>
                  <Text style={styles.statLabel}>Journal Entries</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{streakCount}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{lastJournalDate ? formatDate(lastJournalDate) : 'Never'}</Text>
                  <Text style={styles.statLabel}>Last Entry</Text>
                </View>
              </View>
              
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Journal')}
                style={styles.journalButton}
                labelStyle={{ color: COLORS.WHITE }}
              >
                Start New Journal Entry
              </Button>
            </Card.Content>
          </Card>
        </View>
        
        {/* Mindfulness Exercise */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Mindfulness Exercise</Text>
          <Card style={styles.mindfulnessCard}>
            <Card.Content>
              <View style={styles.mindfulnessHeader}>
                <MaterialCommunityIcons name="meditation" size={28} color={COLORS.SERENITY_BLUE} />
                <Text style={styles.mindfulnessTitle}>Breathing Exercise</Text>
              </View>
              <Text style={styles.mindfulnessDescription}>
                Take a moment to breathe deeply. Inhale for 4 counts, hold for 4, and exhale for 6.
              </Text>
              <Button 
                mode="outlined" 
                onPress={() => {/* Start breathing exercise */}}
                style={styles.mindfulnessButton}
                labelStyle={{ color: COLORS.SERENITY_BLUE }}
              >
                Start 2-Minute Exercise
              </Button>
            </Card.Content>
          </Card>
        </View>
        
        {/* Bottom padding */}
        <View style={{ height: 20 }} />
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
  subGreeting: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MEDIUM,
    color: COLORS.WHITE,
    opacity: 0.8,
    marginTop: SPACING.SMALL,
  },
  tipCard: {
    marginTop: -SPACING.LARGE,
    marginHorizontal: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    ...SHADOWS.MEDIUM,
    backgroundColor: COLORS.WHITE,
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
    color: COLORS.DEEP_REFLECTION,
    marginBottom: SPACING.TINY,
  },
  tipText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MEDIUM,
    color: COLORS.DEEP_REFLECTION,
    opacity: 0.8,
  },
  sectionContainer: {
    marginTop: SPACING.LARGE,
    paddingHorizontal: SPACING.MEDIUM,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LARGE,
    fontWeight: '700',
    color: COLORS.DEEP_REFLECTION,
    marginBottom: SPACING.SMALL,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    width: '30%',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.CIRCLE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
    ...SHADOWS.SMALL,
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SMALL,
    color: COLORS.DEEP_REFLECTION,
    textAlign: 'center',
  },
  moodCard: {
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
    backgroundColor: COLORS.SOFT_CLOUD_GREY,
    width: '18%',
  },
  moodText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.TINY,
    marginTop: SPACING.TINY,
    color: COLORS.DEEP_REFLECTION,
  },
  moodFeedback: {
    backgroundColor: COLORS.SOFT_CLOUD_GREY,
    padding: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.SMALL,
  },
  moodFeedbackText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SMALL,
    color: COLORS.DEEP_REFLECTION,
  },
  journeyCard: {
    borderRadius: BORDER_RADIUS.MEDIUM,
    ...SHADOWS.SMALL,
    backgroundColor: COLORS.WHITE,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MEDIUM,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.SOFT_CLOUD_GREY,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.FONT_SIZE.XLARGE,
    fontWeight: '700',
    color: COLORS.SERENITY_BLUE,
    marginBottom: SPACING.TINY,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.SMALL,
    color: COLORS.DEEP_REFLECTION,
    opacity: 0.7,
  },
  journalButton: {
    backgroundColor: COLORS.SERENITY_BLUE,
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  mindfulnessCard: {
    borderRadius: BORDER_RADIUS.MEDIUM,
    ...SHADOWS.SMALL,
    backgroundColor: COLORS.WHITE,
  },
  mindfulnessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  mindfulnessTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LARGE,
    fontWeight: '500',
    color: COLORS.DEEP_REFLECTION,
    marginLeft: SPACING.SMALL,
  },
  mindfulnessDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MEDIUM,
    color: COLORS.DEEP_REFLECTION,
    opacity: 0.8,
    marginBottom: SPACING.MEDIUM,
  },
  mindfulnessButton: {
    borderColor: COLORS.SERENITY_BLUE,
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
});

export default HomeScreen; 
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity,
  Animated,
  Dimensions,
  Image
} from 'react-native';
import { 
  Text, 
  Button, 
  TextInput, 
  Card, 
  Title, 
  Paragraph, 
  Chip, 
  Divider, 
  useTheme, 
  IconButton,
  Surface,
  ProgressBar,
  Checkbox,
  HelperText,
  Portal,
  Dialog,
  Snackbar
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Slider } from '@miblanchard/react-native-slider';
import * as SecureStore from 'expo-secure-store';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import our design system
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, Z_INDEX } from '../styles/DesignSystem';

// Define emotion types - ordered from negative to positive
const emotions = [
  'Depressed', 'Brokenhearted', 'Scared', 'Repulsed', 'Guilty',
  'Anxious', 'Worried', 'Nervous', 'Frustrated', 'Overwhelmed',
  'Confused', 'Judged', 'Envious', 'Humbled', 'Content',
  'Happy', 'Excited', 'Giddy', 'Amazed'
];

// Define pressure types
const pressures = [
  'Work', 'Relationship', 'Child/children', 'Family', 'Money',
  'Stability', 'Health', 'Friendships', 'Control', 'Desire',
  'The Future'
];

// Define final feelings - ordered from negative to positive
const finalFeelings = [
  'Sad', 'Angry', 'Frustrated', 'Ashamed', 'Weak',
  'Tired', 'Bewildered', 'Perplexed', 'Bemused', 'Organised',
  'Prepared', 'Relived', 'Clearer', 'Calm', 'Peaceful',
  'Better', 'Empowered'
];

// Define overall ratings - ordered from negative to positive
const overallRatings = [
  'Terrible', 'Bad', 'Hit & Miss', 'Good', 'Amazing'
];

// Define impact levels - ordered from highest to lowest impact
const impactLevels = ['Most', 'Moderate', 'Mildly', 'None'];

// Define motivational quotes for mental health
const motivationalQuotes = [
  {
    quote: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, or anxious.",
    author: "Lori Deschene"
  },
  {
    quote: "You are not your illness. You have an individual story to tell. You have a name, a history, a personality.",
    author: "Julian Seifter"
  },
  {
    quote: "Mental health problems don't define who you are. They are something you experience.",
    author: "Mental Health Foundation"
  },
  {
    quote: "Recovery is not one and done. It is a lifelong journey that takes place one day, one step at a time.",
    author: "Unknown"
  },
  {
    quote: "Self-care is how you take your power back.",
    author: "Lalah Delia"
  },
  {
    quote: "You are not alone in this. You are seen, you are loved, and you matter.",
    author: "Unknown"
  },
  {
    quote: "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
    author: "Unknown"
  },
  {
    quote: "It's okay to not have it all figured out. It's okay to take it one day at a time.",
    author: "Unknown"
  },
  {
    quote: "The strongest people are those who win battles we know nothing about.",
    author: "Unknown"
  },
  {
    quote: "Healing is not linear. It's okay to have setbacks and it's okay to have good days.",
    author: "Unknown"
  }
];

// Define achievement badges
const achievementBadges = {
  firstEntry: {
    title: "First Step",
    description: "Completed your first journal entry",
    icon: "trophy-outline"
  },
  threeStreak: {
    title: "Momentum Builder",
    description: "Completed 3 days in a row",
    icon: "fire"
  },
  sevenStreak: {
    title: "Consistency Champion",
    description: "Completed 7 days in a row",
    icon: "star-circle"
  },
  fourteenStreak: {
    title: "Transformation Master",
    description: "Completed 14 days in a row",
    icon: "medal"
  },
  thirtyStreak: {
    title: "Mental Health Warrior",
    description: "Completed 30 days in a row",
    icon: "shield-star"
  },
  fullCompletion: {
    title: "Deep Reflector",
    description: "Completed all sections without skipping",
    icon: "lightbulb-on"
  }
};

// Define the journal entry interface
interface JournalEntry {
  id: string;
  date: string;
  emotions: string[];
  hoursSlept: string;
  hoursExercise: string;
  screenTime: string;
  pressures: string[];
  peopleInteractions: {
    person: string;
    feeling: string;
  }[];
  wishSaid: string;
  bestThing: string;
  worstThing: string;
  overallFeeling: string;
  contributingFactors: {
    [key: string]: string[];
  };
  currentFeeling: string[];
  notes: string;
  skippedSections: string[];
}

// Add this type for MaterialCommunityIcons names
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Add this mapping of emotions to icons
const emotionIcons: Record<string, MaterialCommunityIconName> = {
  'Scared': 'emoticon-frown',
  'Content': 'emoticon-happy-outline',
  'Excited': 'emoticon-excited-outline',
  'Frustrated': 'emoticon-angry-outline',
  'Judged': 'eye-outline',
  'Humbled': 'hand-heart',
  'Repulsed': 'emoticon-sick-outline',
  'Depressed': 'emoticon-sad-outline',
  'Worried': 'emoticon-confused-outline',
  'Guilty': 'emoticon-cry-outline',
  'Happy': 'emoticon-happy',
  'Giddy': 'emoticon-outline',
  'Anxious': 'lightning-bolt-outline',
  'Envious': 'eye',
  'Overwhelmed': 'wave',
  'Confused': 'help-circle-outline',
  'Brokenhearted': 'heart-broken',
  'Nervous': 'alert-circle-outline',
  'Amazed': 'star-face'
};

// Add mapping of pressures to icons
const pressureIcons: Record<string, MaterialCommunityIconName> = {
  'Work': 'briefcase-outline',
  'Relationship': 'heart-outline',
  'Child/children': 'human-male-child',
  'Family': 'account-group-outline',
  'Money': 'cash-multiple',
  'Stability': 'home-outline',
  'Health': 'medical-bag',
  'Friendships': 'handshake',
  'Control': 'gesture-tap',
  'Desire': 'star-outline',
  'The Future': 'clock-time-eight-outline'
};

// Add this mapping of emotions to colors
const emotionColors: Record<string, string> = {
  'Scared': '#FFD3B6',
  'Content': '#A8E6CF',
  'Excited': '#FFAAA5',
  'Frustrated': '#FF8B94',
  'Judged': '#DCEDC1',
  'Humbled': '#A2D2FF',
  'Repulsed': '#FFC3A0',
  'Depressed': '#D3D3D3',
  'Worried': '#FFCC80',
  'Guilty': '#B5EAD7',
  'Happy': '#FDFFAB',
  'Giddy': '#FFC6FF',
  'Anxious': '#E0BBE4',
  'Envious': '#C7CEEA',
  'Overwhelmed': '#FF9AA2',
  'Confused': '#B5EAD7',
  'Brokenhearted': '#FF9AA2',
  'Nervous': '#FFDAC1',
  'Amazed': '#FFFFB5'
};

// Add mapping of pressures to colors
const pressureColors: Record<string, string> = {
  'Work': '#BDE0FE',
  'Relationship': '#FFAFCC',
  'Child/children': '#FFC8DD',
  'Family': '#CDB4DB',
  'Money': '#A2D2FF',
  'Stability': '#E2ECE9',
  'Health': '#CCD5AE',
  'Friendships': '#E9EDC9',
  'Control': '#FEFAE0',
  'Desire': '#FAEDCD',
  'The Future': '#D4A373'
};

// Add mapping of overall ratings to icons and colors - ordered from negative to positive
const overallRatingIcons: Record<string, MaterialCommunityIconName> = {
  'Terrible': 'emoticon-dead-outline',
  'Bad': 'emoticon-sad-outline',
  'Hit & Miss': 'emoticon-neutral-outline',
  'Good': 'emoticon-happy-outline',
  'Amazing': 'emoticon-excited-outline'
};

const overallRatingColors: Record<string, string> = {
  'Terrible': COLORS.MOOD_TERRIBLE, // Hopeful Coral - for terrible mood
  'Bad': COLORS.MOOD_BAD, // Lighter coral - for bad mood
  'Hit & Miss': COLORS.MOOD_NEUTRAL, // Golden Glow - for neutral mood
  'Good': COLORS.MOOD_GOOD, // Light green - for good mood
  'Amazing': COLORS.MOOD_GREAT // Mindful Mint - for amazing mood
};

// Add mapping of final feelings to icons and colors
const finalFeelingIcons: Record<string, MaterialCommunityIconName> = {
  'Calm': 'weather-sunny',
  'Tired': 'sleep',
  'Frustrated': 'emoticon-angry-outline',
  'Organised': 'clipboard-check-outline',
  'Angry': 'emoticon-angry',
  'Clearer': 'lightbulb-on-outline',
  'Ashamed': 'emoticon-frown-outline',
  'Peaceful': 'leaf',
  'Bewildered': 'head-question-outline',
  'Weak': 'battery-10',
  'Bemused': 'head-sync-outline',
  'Prepared': 'shield-check-outline',
  'Perplexed': 'help-circle-outline',
  'Relived': 'weather-windy',
  'Empowered': 'arm-flex-outline',
  'Better': 'arrow-up-bold-outline',
  'Sad': 'emoticon-sad-outline'
};

const finalFeelingColors: Record<string, string> = {
  'Calm': '#A8E6CF',
  'Tired': '#D8BFD8',
  'Frustrated': '#FF8B94',
  'Organised': '#AEC6CF',
  'Angry': '#FF6961',
  'Clearer': '#FDFD96',
  'Ashamed': '#CB99C9',
  'Peaceful': '#77DD77',
  'Bewildered': '#FFB347',
  'Weak': '#B39EB5',
  'Bemused': '#FFD1DC',
  'Prepared': '#C3B1E1',
  'Perplexed': '#CFCFC4',
  'Relived': '#B0E0E6',
  'Empowered': '#FFC0CB',
  'Better': '#CAFF70',
  'Sad': '#C5C5C5'
};

// Get screen width for responsive sizing
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const EMOTION_CARD_WIDTH = (SCREEN_WIDTH - 64) / 3; // 3 cards per row with padding

const JournalScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [streakCount, setStreakCount] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<keyof typeof achievementBadges | null>(null);
  const [randomQuote, setRandomQuote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  const [showMotivation, setShowMotivation] = useState(true);
  
  // Animation for achievement popup
  const achievementScale = useRef(new Animated.Value(0)).current;
  const achievementOpacity = useRef(new Animated.Value(0)).current;
  
  // Initialize all animation refs at the component level
  const emotionScaleAnims = useRef(emotions.map(() => new Animated.Value(1))).current;
  const pressureScaleAnims = useRef(pressures.map(() => new Animated.Value(1))).current;
  const feelingScaleAnims = useRef(finalFeelings.map(() => new Animated.Value(1))).current;
  const ratingScaleAnims = useRef(overallRatings.map(() => new Animated.Value(1))).current;
  const factorFadeAnims = useRef(impactLevels.map(() => new Animated.Value(0))).current;

  // Animation effects for each section
  useEffect(() => {
    if (currentStep === 0) { // Emotions section
      Animated.stagger(150, 
        emotionScaleAnims.map(anim => 
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 2) { // Pressures section
      Animated.stagger(150, 
        pressureScaleAnims.map(anim => 
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 6) { // Overall rating section
      Animated.stagger(150, 
        ratingScaleAnims.map(anim => 
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 7) { // Contributing factors section
      Animated.stagger(150, 
        factorFadeAnims.map(anim => 
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 8) { // Current feelings section
      Animated.stagger(150, 
        feelingScaleAnims.map(anim => 
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  }, [currentStep]);

  // Initialize journal entry state
  const [journalEntry, setJournalEntry] = useState<JournalEntry>({
    id: new Date().toISOString(),
    date: format(new Date(), 'yyyy-MM-dd'),
    emotions: [],
    hoursSlept: '',
    hoursExercise: '',
    screenTime: '',
    pressures: [],
    peopleInteractions: [
      { person: '', feeling: '' },
      { person: '', feeling: '' },
      { person: '', feeling: '' },
      { person: '', feeling: '' },
      { person: '', feeling: '' }
    ],
    wishSaid: '',
    bestThing: '',
    worstThing: '',
    overallFeeling: '',
    contributingFactors: {
      'Most': [''],
      'Moderate': [''],
      'Mildly': [''],
      'None': ['']
    },
    currentFeeling: [],
    notes: '',
    skippedSections: []
  });

  // Total number of steps in the journal
  const totalSteps = 10;

  // Load streak count on component mount
  useEffect(() => {
    const loadStreakData = async () => {
      try {
        // Load streak count
        const streakData = await SecureStore.getItemAsync('journalStreak');
        if (streakData) {
          const { count, lastEntryDate } = JSON.parse(streakData);
          
          // Check if the last entry was yesterday or today
          const today = new Date();
          const lastDate = new Date(lastEntryDate);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          const isToday = 
            lastDate.getDate() === today.getDate() &&
            lastDate.getMonth() === today.getMonth() &&
            lastDate.getFullYear() === today.getFullYear();
            
          const isYesterday = 
            lastDate.getDate() === yesterday.getDate() &&
            lastDate.getMonth() === yesterday.getMonth() &&
            lastDate.getFullYear() === yesterday.getFullYear();
          
          if (isToday) {
            // Already journaled today
            setStreakCount(count);
          } else if (isYesterday) {
            // Continuing streak
            setStreakCount(count);
          } else {
            // Streak broken, but don't show 0 to avoid discouragement
            setStreakCount(0);
          }
        }
      } catch (error) {
        console.error('Error loading streak data:', error);
      }
    };
    
    loadStreakData();
  }, []);
  
  // Function to show achievement animation
  const showAchievementAnimation = (achievementKey: keyof typeof achievementBadges) => {
    setCurrentAchievement(achievementKey);
    setShowAchievement(true);
    
    // Reset animation values
    achievementScale.setValue(0);
    achievementOpacity.setValue(0);
    
    // Run animation sequence
    Animated.parallel([
      Animated.spring(achievementScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.timing(achievementOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
    
    // Hide after 5 seconds
    setTimeout(() => {
      Animated.timing(achievementOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      }).start(() => {
        setShowAchievement(false);
      });
    }, 5000);
  };

  // Update journal entry
  const updateJournalEntry = (field: keyof JournalEntry, value: any) => {
    setJournalEntry(prev => ({ ...prev, [field]: value }));
  };

  // Toggle emotion selection with animation
  const toggleEmotion = (emotion: string) => {
    // Animate the scale
    Animated.sequence([
      Animated.timing(emotionScaleAnims[emotions.indexOf(emotion)], {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(emotionScaleAnims[emotions.indexOf(emotion)], {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(emotionScaleAnims[emotions.indexOf(emotion)], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Update the state
    setJournalEntry(prev => {
      const emotionsList = [...prev.emotions];
      const index = emotionsList.indexOf(emotion);
      
      if (index === -1) {
        emotionsList.push(emotion);
      } else {
        emotionsList.splice(index, 1);
      }
      
      return { ...prev, emotions: emotionsList };
    });
  };

  // Toggle pressure selection with animation
  const togglePressure = (pressure: string) => {
    // Animate the scale
    Animated.sequence([
      Animated.timing(pressureScaleAnims[pressures.indexOf(pressure)], {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pressureScaleAnims[pressures.indexOf(pressure)], {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pressureScaleAnims[pressures.indexOf(pressure)], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Update the state
    setJournalEntry(prev => {
      const pressuresList = [...prev.pressures];
      const index = pressuresList.indexOf(pressure);
      
      if (index === -1) {
        pressuresList.push(pressure);
      } else {
        pressuresList.splice(index, 1);
      }
      
      return { ...prev, pressures: pressuresList };
    });
  };

  // Toggle current feeling selection
  const toggleCurrentFeeling = (feeling: string) => {
    setJournalEntry((prev) => {
      const currentFeelings = [...prev.currentFeeling];
      const feelingIndex = currentFeelings.indexOf(feeling);
      
      if (feelingIndex === -1) {
        // Add feeling if not already selected
        return {
          ...prev,
          currentFeeling: [...currentFeelings, feeling],
        };
      } else {
        // Remove feeling if already selected
        currentFeelings.splice(feelingIndex, 1);
        return {
          ...prev,
          currentFeeling: currentFeelings,
        };
      }
    });
  };

  // Update person interaction
  const updatePersonInteraction = (index: number, field: 'person' | 'feeling', value: string) => {
    setJournalEntry(prev => {
      const peopleInteractions = [...prev.peopleInteractions];
      peopleInteractions[index] = { 
        ...peopleInteractions[index], 
        [field]: value 
      };
      
      return { ...prev, peopleInteractions };
    });
  };

  // Update contributing factor
  const updateContributingFactor = (level: string, index: number, value: string) => {
    setJournalEntry(prev => {
      const contributingFactors = { ...prev.contributingFactors };
      contributingFactors[level][index] = value;
      
      return { ...prev, contributingFactors };
    });
  };

  // Skip current section
  const skipSection = () => {
    const sections = [
      'emotions', 'sleep', 'pressures', 'interactions', 
      'wishSaid', 'bestWorst', 'overallFeeling', 
      'contributingFactors', 'currentFeeling', 'notes'
    ];
    
    const currentSection = sections[currentStep];
    
    setJournalEntry(prev => {
      const skippedSections = [...prev.skippedSections];
      if (!skippedSections.includes(currentSection)) {
        skippedSections.push(currentSection);
      }
      return { ...prev, skippedSections };
    });
    
    handleNext();
  };

  // Handle next step
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSaveDialog(true);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Save journal entry
  const saveJournalEntry = async () => {
    try {
      // Get existing entries
      const entriesJson = await SecureStore.getItemAsync('journalEntries');
      let entries = entriesJson ? JSON.parse(entriesJson) : [];
      
      // Add new entry
      entries.push(journalEntry);
      
      // Save updated entries
      await SecureStore.setItemAsync('journalEntries', JSON.stringify(entries));
      
      // Update streak count
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const streakData = await SecureStore.getItemAsync('journalStreak');
      
      let newStreakCount = 1;
      let achievementToShow: keyof typeof achievementBadges | null = null;
      
      if (streakData) {
        const { count, lastEntryDate } = JSON.parse(streakData);
        const lastDate = new Date(lastEntryDate);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const isToday = 
          lastDate.getDate() === today.getDate() &&
          lastDate.getMonth() === today.getMonth() &&
          lastDate.getFullYear() === today.getFullYear();
          
        const isYesterday = 
          lastDate.getDate() === yesterday.getDate() &&
          lastDate.getMonth() === yesterday.getMonth() &&
          lastDate.getFullYear() === yesterday.getFullYear();
        
        if (isToday) {
          // Already journaled today, maintain streak
          newStreakCount = count;
        } else if (isYesterday) {
          // Continuing streak
          newStreakCount = count + 1;
          
          // Check for streak achievements
          if (newStreakCount === 3) {
            achievementToShow = 'threeStreak';
          } else if (newStreakCount === 7) {
            achievementToShow = 'sevenStreak';
          } else if (newStreakCount === 14) {
            achievementToShow = 'fourteenStreak';
          } else if (newStreakCount === 30) {
            achievementToShow = 'thirtyStreak';
          }
        } else {
          // Streak broken, starting new streak
          newStreakCount = 1;
        }
      } else if (entries.length === 1) {
        // First ever entry
        achievementToShow = 'firstEntry';
      }
      
      // Check for full completion achievement
      if (journalEntry.skippedSections.length === 0) {
        // If another achievement is already set to show, we'll prioritize streak achievements
        // but we'll save this achievement for showing next time
        if (!achievementToShow) {
          achievementToShow = 'fullCompletion';
        } else {
          // Save for later
          await SecureStore.setItemAsync('pendingAchievement', 'fullCompletion');
        }
      } else {
        // Check if there's a pending achievement to show
        const pendingAchievement = await SecureStore.getItemAsync('pendingAchievement');
        if (pendingAchievement && !achievementToShow) {
          achievementToShow = pendingAchievement as keyof typeof achievementBadges;
          await SecureStore.deleteItemAsync('pendingAchievement');
        }
      }
      
      // Save updated streak data
      await SecureStore.setItemAsync('journalStreak', JSON.stringify({
        count: newStreakCount,
        lastEntryDate: todayString
      }));
      
      setStreakCount(newStreakCount);
      setShowSaveDialog(false);
      
      // Show achievement if earned
      if (achievementToShow) {
        showAchievementAnimation(achievementToShow);
      }
      
      setSnackbarMessage('Journal entry saved successfully!');
      setShowSnackbar(true);
      
      // Reset form after short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      setSnackbarMessage('Failed to save journal entry. Please try again.');
      setShowSnackbar(true);
    }
  };

  // Render emotions section
  const renderEmotionsSection = () => {
    const screenWidth = Dimensions.get('window').width;
    const cardWidth = (screenWidth - 80) / 3; // 3 cards per row with padding
    
    const renderEmotionCard = (emotion: string) => {
      const isSelected = journalEntry.emotions.includes(emotion);
      const scaleAnim = emotionScaleAnims[emotions.indexOf(emotion)];
      
      const toggleWithAnimation = () => {
        // Animate scale down and up
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start();
        
        // Toggle the emotion
        toggleEmotion(emotion);
      };
      
      // Get icon for the emotion
      const iconName = emotionIcons[emotion] as MaterialCommunityIconName;
      
      // Determine gradient colors based on emotion category
      let gradientColors: [string, string] = ['#FFE5E7', '#FFD0D3']; // Default
      
      if (emotions.indexOf(emotion) < 8) { // Negative emotions
        gradientColors = isSelected ? ['#FF8B94', '#FF5A5F'] : ['#FFE5E7', '#FFD0D3'];
      } else if (emotions.indexOf(emotion) < 14) { // Neutral/Mixed emotions
        gradientColors = isSelected ? ['#FFD3B6', '#FFAA5A'] : ['#FFF0E5', '#FFE8D0'];
      } else { // Positive emotions
        gradientColors = isSelected ? ['#A8E6CF', '#69D2A5'] : ['#E8F8F3', '#D0F0E5'];
      }
      
      return (
        <TouchableOpacity
          key={emotion}
          onPress={toggleWithAnimation}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.emotionCard,
              { width: cardWidth, transform: [{ scale: scaleAnim }] }
            ]}
          >
            <LinearGradient
              colors={gradientColors}
              style={styles.emotionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons
                name={iconName}
                size={28}
                color={isSelected ? '#fff' : '#666'}
              />
              <Text style={[
                styles.emotionText,
                { color: isSelected ? '#fff' : '#333' }
              ]}>
                {emotion}
              </Text>
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      );
    };
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>How are you feeling today?</Title>
          <Paragraph style={styles.cardDescription}>
            Select all emotions that apply to how you're feeling right now.
          </Paragraph>
          <View style={styles.emotionsGrid}>
            {emotions.map((emotion) => renderEmotionCard(emotion))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Render sleep and activity section
  const renderSleepActivitySection = () => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Sleep & Activity</Title>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Hours of sleep:</Text>
            <TextInput
              value={journalEntry.hoursSlept}
              onChangeText={(text) => updateJournalEntry('hoursSlept', text)}
              keyboardType="numeric"
              style={styles.textInput}
              placeholder="e.g. 7.5"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Hours of exercise:</Text>
            <TextInput
              value={journalEntry.hoursExercise}
              onChangeText={(text) => updateJournalEntry('hoursExercise', text)}
              keyboardType="numeric"
              style={styles.textInput}
              placeholder="e.g. 1"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Hours of screen time:</Text>
            <TextInput
              value={journalEntry.screenTime}
              onChangeText={(text) => updateJournalEntry('screenTime', text)}
              keyboardType="numeric"
              style={styles.textInput}
              placeholder="e.g. 5"
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Render pressures section
  const renderPressuresSection = () => {
    const screenWidth = Dimensions.get('window').width;
    const cardWidth = (screenWidth - 80) / 3; // 3 cards per row with padding
    
    const renderPressureCard = (pressure: string) => {
      const isSelected = journalEntry.pressures.includes(pressure);
      const scaleAnim = pressureScaleAnims[pressures.indexOf(pressure)];
      
      const toggleWithAnimation = () => {
        // Animate scale down and up
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start();
        
        // Toggle the pressure
        togglePressure(pressure);
      };
      
      // Get icon for the pressure
      const iconName = pressureIcons[pressure] as MaterialCommunityIconName;
      
      // Determine gradient colors
      const gradientColors: [string, string] = isSelected 
        ? ['#9ED8DB', '#7CABB0'] 
        : ['#E8F8F9', '#D5EAEC'];
      
      return (
        <TouchableOpacity
          key={pressure}
          onPress={toggleWithAnimation}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.emotionCard,
              { width: cardWidth, transform: [{ scale: scaleAnim }] }
            ]}
          >
            <LinearGradient
              colors={gradientColors}
              style={styles.emotionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons
                name={iconName}
                size={28}
                color={isSelected ? '#fff' : '#666'}
              />
              <Text style={[
                styles.emotionText,
                { color: isSelected ? '#fff' : '#333' }
              ]}>
                {pressure}
              </Text>
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      );
    };
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>What pressures are you facing?</Title>
          <Paragraph style={styles.cardDescription}>
            Select all pressures that apply to your current situation.
          </Paragraph>
          <View style={styles.emotionsGrid}>
            {pressures.map((pressure) => renderPressureCard(pressure))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Render people interactions section
  const renderPeopleInteractionsSection = () => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>People You've Engaged With</Title>
          <Paragraph style={styles.cardDescription}>
            List up to 5 people and your associated feelings
          </Paragraph>
          
          {journalEntry.peopleInteractions.map((interaction, index) => (
            <View key={index} style={styles.interactionContainer}>
              <Text style={styles.interactionNumber}>{index + 1}.</Text>
              <View style={styles.interactionFields}>
                <TextInput
                  value={interaction.person}
                  onChangeText={(text) => updatePersonInteraction(index, 'person', text)}
                  style={styles.interactionInput}
                  placeholder="Person's name"
                />
                <TextInput
                  value={interaction.feeling}
                  onChangeText={(text) => updatePersonInteraction(index, 'feeling', text)}
                  style={styles.interactionInput}
                  placeholder="Associated feeling"
                />
              </View>
            </View>
          ))}
          <HelperText type="info">Fill in only what applies to you</HelperText>
        </Card.Content>
      </Card>
    );
  };

  // Render wish said section
  const renderWishSaidSection = () => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>What you wish you said out loud</Title>
          
          <TextInput
            value={journalEntry.wishSaid}
            onChangeText={(text) => updateJournalEntry('wishSaid', text)}
            style={styles.multilineInput}
            multiline
            numberOfLines={4}
            placeholder="Write what you wish you had expressed..."
          />
        </Card.Content>
      </Card>
    );
  };

  // Render best/worst section
  const renderBestWorstSection = () => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Reflection on Today</Title>
          
          <Text style={styles.inputLabel}>Best thing you did for yourself today:</Text>
          <TextInput
            value={journalEntry.bestThing}
            onChangeText={(text) => updateJournalEntry('bestThing', text)}
            style={styles.multilineInput}
            multiline
            numberOfLines={3}
            placeholder="What positive action did you take for yourself?"
          />
          
          <Text style={[styles.inputLabel, { marginTop: 16 }]}>Worst thing you did for yourself today:</Text>
          <TextInput
            value={journalEntry.worstThing}
            onChangeText={(text) => updateJournalEntry('worstThing', text)}
            style={styles.multilineInput}
            multiline
            numberOfLines={3}
            placeholder="What negative action would you like to improve on?"
          />
        </Card.Content>
      </Card>
    );
  };

  // Render overall rating section
  const renderOverallRatingSection = () => {
    const screenWidth = Dimensions.get('window').width;
    const cardWidth = (screenWidth - 80) / 3; // 3 cards per row with padding
    
    const renderRatingCard = (rating: string) => {
      const isSelected = journalEntry.overallFeeling === rating;
      const scaleAnim = ratingScaleAnims[overallRatings.indexOf(rating)];
      
      const selectWithAnimation = () => {
        // Animate scale down and up
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start();
        
        // Update the journal entry
        updateJournalEntry('overallFeeling', rating);
      };
      
      // Get icon for the rating
      const iconName = overallRatingIcons[rating] as MaterialCommunityIconName;
      
      // Get color for the rating
      const ratingColor = overallRatingColors[rating] || '#f0f0f0';
      
      // Determine gradient colors
      const gradientColors: [string, string] = isSelected 
        ? [ratingColor, shadeColor(ratingColor, -15)] 
        : [lightenColor(ratingColor, 15), lightenColor(ratingColor, 5)];
      
      return (
        <TouchableOpacity
          key={rating}
          onPress={selectWithAnimation}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.emotionCard,
              { width: cardWidth, transform: [{ scale: scaleAnim }] }
            ]}
          >
            <LinearGradient
              colors={gradientColors}
              style={styles.emotionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons
                name={iconName}
                size={28}
                color={isSelected ? '#fff' : '#666'}
              />
              <Text style={[
                styles.emotionText,
                { color: isSelected ? '#fff' : '#333' }
              ]}>
                {rating}
              </Text>
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      );
    };
    
    // Helper functions for color manipulation
    const shadeColor = (color: string, percent: number): string => {
      let R = parseInt(color.substring(1, 3), 16);
      let G = parseInt(color.substring(3, 5), 16);
      let B = parseInt(color.substring(5, 7), 16);
      
      R = Math.floor(R * (100 + percent) / 100);
      G = Math.floor(G * (100 + percent) / 100);
      B = Math.floor(B * (100 + percent) / 100);
      
      R = R < 255 ? R : 255;
      G = G < 255 ? G : 255;
      B = B < 255 ? B : 255;
      
      const RR = R.toString(16).length === 1 ? '0' + R.toString(16) : R.toString(16);
      const GG = G.toString(16).length === 1 ? '0' + G.toString(16) : G.toString(16);
      const BB = B.toString(16).length === 1 ? '0' + B.toString(16) : B.toString(16);
      
      return '#' + RR + GG + BB;
    };
    
    const lightenColor = (color: string, percent: number): string => {
      return shadeColor(color, percent);
    };
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Overall Rating</Title>
          <Paragraph style={styles.cardDescription}>
            How would you rate your day overall?
          </Paragraph>
          <View style={styles.emotionsGrid}>
            {overallRatings.map((rating) => renderRatingCard(rating))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Render contributing factors section
  const renderContributingFactorsSection = () => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Contributing Factors</Title>
          <Paragraph style={styles.cardDescription}>
            What single factor had the most impact on your day at each level?
          </Paragraph>
          
          {impactLevels.map((level, index) => (
            <Animated.View 
              key={level} 
              style={[
                styles.factorLevelContainer,
                { 
                  opacity: factorFadeAnims[index],
                  transform: [{ 
                    translateY: factorFadeAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    }) 
                  }]
                }
              ]}
            >
              <View style={styles.factorLevelHeader}>
                <Text style={styles.factorLevelTitle}>{level} Impact</Text>
                <Text style={styles.factorLevelDescription}>
                  {level === 'Most' && 'Had the strongest effect on your day'}
                  {level === 'Moderate' && 'Had a noticeable effect on your day'}
                  {level === 'Mildly' && 'Had a slight effect on your day'}
                  {level === 'None' && 'Had no real effect on your day'}
                </Text>
              </View>
              
              <TextInput
                value={journalEntry.contributingFactors[level][0]}
                onChangeText={(text) => updateContributingFactor(level, 0, text)}
                style={styles.factorInput}
                placeholder={
                  level === 'Most' ? 'e.g., Argument with friend' :
                  level === 'Moderate' ? 'e.g., Busy workday' :
                  level === 'Mildly' ? 'e.g., Good weather' :
                  'e.g., News headline'
                }
              />
            </Animated.View>
          ))}
        </Card.Content>
      </Card>
    );
  };

  // Render current feelings section
  const renderCurrentFeelingsSection = () => {
    const screenWidth = Dimensions.get('window').width;
    const cardWidth = (screenWidth - 80) / 3; // 3 cards per row with padding
    
    const renderFeelingCard = (feeling: string) => {
      const isSelected = journalEntry.currentFeeling.includes(feeling);
      const scaleAnim = feelingScaleAnims[finalFeelings.indexOf(feeling)];
      
      const toggleWithAnimation = () => {
        // Animate scale down and up
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start();
        
        // Toggle the feeling
        toggleCurrentFeeling(feeling);
      };
      
      // Determine gradient colors based on feeling category
      let gradientColors: [string, string] = ['#FFE5E7', '#FFD0D3']; // Default
      
      if (finalFeelings.indexOf(feeling) < 5) { // Negative feelings
        gradientColors = isSelected ? ['#FF8B94', '#FF5A5F'] : ['#FFE5E7', '#FFD0D3'];
      } else if (finalFeelings.indexOf(feeling) < 12) { // Neutral/Mixed feelings
        gradientColors = isSelected ? ['#FFD3B6', '#FFAA5A'] : ['#FFF0E5', '#FFE8D0'];
      } else { // Positive feelings
        gradientColors = isSelected ? ['#A8E6CF', '#69D2A5'] : ['#E8F8F3', '#D0F0E5'];
      }
      
      return (
        <TouchableOpacity
          key={feeling}
          onPress={toggleWithAnimation}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.emotionCard,
              { width: cardWidth, transform: [{ scale: scaleAnim }] }
            ]}
          >
            <LinearGradient
              colors={gradientColors}
              style={styles.emotionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[
                styles.emotionText,
                { color: isSelected ? '#fff' : '#333' }
              ]}>
                {feeling}
              </Text>
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      );
    };
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>How are you feeling now?</Title>
          <Paragraph style={styles.cardDescription}>
            After completing this journal entry, select how you're feeling.
          </Paragraph>
          <View style={styles.emotionsGrid}>
            {finalFeelings.map((feeling) => renderFeelingCard(feeling))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Render notes section
  const renderNotesSection = () => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Additional Notes</Title>
          <Paragraph style={styles.cardDescription}>
            Any other thoughts or reflections you'd like to capture
          </Paragraph>
          
          <TextInput
            value={journalEntry.notes}
            onChangeText={(text) => updateJournalEntry('notes', text)}
            style={styles.multilineInput}
            multiline
            numberOfLines={6}
            placeholder="Write any additional notes here..."
          />
        </Card.Content>
      </Card>
    );
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderEmotionsSection();
      case 1:
        return renderSleepActivitySection();
      case 2:
        return renderPressuresSection();
      case 3:
        return renderPeopleInteractionsSection();
      case 4:
        return renderWishSaidSection();
      case 5:
        return renderBestWorstSection();
      case 6:
        return renderOverallRatingSection();
      case 7:
        return renderContributingFactorsSection();
      case 8:
        return renderCurrentFeelingsSection();
      case 9:
        return renderNotesSection();
      default:
        // Instead of returning null, return an empty card to maintain component structure
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Journal Entry</Title>
              <Paragraph style={styles.cardDescription}>
                Please navigate to a valid step.
              </Paragraph>
            </Card.Content>
          </Card>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor={COLORS.DEEP_REFLECTION}
        />
        <Text style={styles.headerTitle}>Mental State Journal</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={styles.progressContainer}>
        <ProgressBar
          progress={(currentStep + 1) / totalSteps}
          color={COLORS.SERENITY_BLUE}
          style={styles.progressBar}
        />
        <Text style={styles.progressText}>
          {currentStep + 1} of {totalSteps}
        </Text>
      </View>
      
      {/* Always render this container, but conditionally show content */}
      <View style={showMotivation ? styles.motivationContainer : { display: 'none' }}>
        {showMotivation && (
          <>
            <View style={styles.motivationHeader}>
              <TouchableOpacity 
                style={styles.streakBadge}
                onPress={() => {
                  // Show a different quote when tapped
                  const newQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
                  setRandomQuote(newQuote);
                }}
              >
                <MaterialCommunityIcons name="fire" size={20} color="#FF6B6B" />
                <Text style={styles.streakText}>{streakCount} day{streakCount !== 1 ? 's' : ''}</Text>
              </TouchableOpacity>
              
              <IconButton
                icon="close"
                size={20}
                style={styles.closeQuoteButton}
                iconColor={COLORS.DEEP_REFLECTION}
                onPress={() => setShowMotivation(false)}
              />
            </View>
            
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteText}>"{randomQuote.quote}"</Text>
              <Text style={styles.quoteAuthor}>— {randomQuote.author}</Text>
            </View>
          </>
        )}
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderStepContent()}
      </ScrollView>
      
      <View style={styles.buttonsContainer}>
        <Button
          mode="outlined"
          onPress={handlePrevious}
          disabled={currentStep === 0}
          style={[styles.button, styles.backButton]}
        >
          Back
        </Button>
        
        <Button
          mode="text"
          onPress={skipSection}
          style={[styles.button, styles.skipButton]}
        >
          Skip
        </Button>
        
        <Button
          mode="contained"
          onPress={handleNext}
          style={[styles.button, styles.nextButton]}
        >
          {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
        </Button>
      </View>
      
      {/* Always render this container, but conditionally show content */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: showAchievement ? 'flex' : 'none' }}>
        {showAchievement && currentAchievement && (
          <Animated.View 
            style={[
              styles.achievementContainer,
              {
                opacity: achievementOpacity,
                transform: [{ scale: achievementScale }]
              }
            ]}
          >
            <View style={styles.achievementContent}>
              <MaterialCommunityIcons 
                name={achievementBadges[currentAchievement].icon as MaterialCommunityIconName} 
                size={50} 
                color="#FFD700" 
              />
              <Text style={styles.achievementTitle}>{achievementBadges[currentAchievement].title}</Text>
              <Text style={styles.achievementDescription}>{achievementBadges[currentAchievement].description}</Text>
            </View>
          </Animated.View>
        )}
      </View>
      
      <Portal>
        <Dialog visible={showSaveDialog} onDismiss={() => setShowSaveDialog(false)}>
          <Dialog.Title>Save Journal Entry</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Would you like to save your journal entry? You've completed {totalSteps - journalEntry.skippedSections.length} of {totalSteps} sections.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button onPress={saveJournalEntry}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SOFT_CLOUD_GREY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MEDIUM,
    paddingTop: SPACING.XXLARGE,
    paddingBottom: SPACING.MEDIUM,
    backgroundColor: COLORS.WHITE,
    ...SHADOWS.SMALL,
  },
  headerTitle: {
    fontSize: SPACING.LARGE,
    fontWeight: 'bold',
    color: COLORS.DEEP_REFLECTION,
  },
  progressContainer: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.XSMALL,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SOFT_CLOUD_GREY,
  },
  progressBar: {
    height: 6,
    borderRadius: BORDER_RADIUS.SMALL / 2,
  },
  progressText: {
    textAlign: 'center',
    marginTop: SPACING.TINY,
    color: COLORS.DEEP_REFLECTION,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.MEDIUM,
    paddingBottom: SPACING.XLARGE,
  },
  card: {
    marginBottom: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    ...SHADOWS.SMALL,
    backgroundColor: COLORS.WHITE,
  },
  cardTitle: {
    fontSize: SPACING.XLARGE,
    marginBottom: SPACING.XSMALL,
    color: COLORS.DEEP_REFLECTION,
  },
  cardDescription: {
    marginBottom: SPACING.MEDIUM,
    color: COLORS.DEEP_REFLECTION,
    opacity: 0.7,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.SMALL,
  },
  emotionCard: {
    marginBottom: SPACING.SMALL,
    height: 100,
    borderRadius: BORDER_RADIUS.MEDIUM,
    overflow: 'hidden',
    ...SHADOWS.SMALL,
  },
  emotionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.XSMALL,
  },
  emotionText: {
    marginTop: SPACING.XSMALL,
    fontSize: SPACING.MEDIUM,
    fontWeight: '500',
    textAlign: 'center',
    color: COLORS.DEEP_REFLECTION,
  },
  selectedIndicator: {
    position: 'absolute',
    top: SPACING.XSMALL,
    right: SPACING.XSMALL,
  },
  inputContainer: {
    marginBottom: SPACING.MEDIUM,
  },
  inputLabel: {
    fontSize: SPACING.MEDIUM,
    marginBottom: SPACING.XSMALL,
    color: COLORS.DEEP_REFLECTION,
  },
  textInput: {
    backgroundColor: COLORS.SOFT_CLOUD_GREY,
    borderRadius: BORDER_RADIUS.SMALL,
    paddingHorizontal: SPACING.SMALL,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.SERENITY_BLUE,
  },
  multilineInput: {
    backgroundColor: COLORS.SOFT_CLOUD_GREY,
    borderRadius: BORDER_RADIUS.SMALL,
    paddingHorizontal: SPACING.SMALL,
    paddingTop: SPACING.SMALL,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.SERENITY_BLUE,
  },
  pressuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.XSMALL,
  },
  interactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  interactionNumber: {
    width: 24,
    fontSize: SPACING.MEDIUM,
    fontWeight: 'bold',
    color: COLORS.DEEP_REFLECTION,
  },
  interactionFields: {
    flex: 1,
  },
  interactionInput: {
    backgroundColor: COLORS.SOFT_CLOUD_GREY,
    borderRadius: BORDER_RADIUS.SMALL,
    paddingHorizontal: SPACING.SMALL,
    height: 50,
    marginBottom: SPACING.XSMALL,
    borderWidth: 1,
    borderColor: COLORS.SERENITY_BLUE,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  ratingButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  factorLevelContainer: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  factorLevelHeader: {
    marginBottom: 8,
  },
  factorLevelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  factorLevelDescription: {
    fontSize: 14,
    color: '#666',
  },
  factorInput: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.SERENITY_BLUE,
    borderRadius: BORDER_RADIUS.SMALL,
    padding: SPACING.SMALL,
    fontSize: SPACING.MEDIUM,
    color: COLORS.DEEP_REFLECTION,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.SOFT_CLOUD_GREY,
    ...SHADOWS.SMALL,
  },
  button: {
    flex: 1,
    marginHorizontal: SPACING.TINY,
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  backButton: {
    borderColor: COLORS.SERENITY_BLUE,
  },
  skipButton: {
    borderColor: 'transparent',
  },
  nextButton: {
    borderRadius: BORDER_RADIUS.MEDIUM,
    backgroundColor: COLORS.SERENITY_BLUE,
  },
  motivationContainer: {
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.SOFT_CLOUD_GREY,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SERENITY_BLUE,
  },
  motivationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.XSMALL,
    paddingHorizontal: SPACING.SMALL,
    borderWidth: 2,
    borderColor: COLORS.HOPEFUL_CORAL,
    borderRadius: BORDER_RADIUS.CIRCLE,
    backgroundColor: COLORS.WHITE,
  },
  streakText: {
    fontSize: SPACING.MEDIUM,
    fontWeight: 'bold',
    marginLeft: SPACING.XSMALL,
    color: COLORS.HOPEFUL_CORAL,
  },
  quoteContainer: {
    marginTop: SPACING.SMALL,
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    ...SHADOWS.SMALL,
  },
  quoteText: {
    fontSize: SPACING.MEDIUM,
    fontStyle: 'italic',
    lineHeight: 24,
    color: COLORS.DEEP_REFLECTION,
    marginBottom: SPACING.XSMALL,
  },
  quoteAuthor: {
    fontSize: SPACING.MEDIUM,
    color: COLORS.DEEP_REFLECTION,
    opacity: 0.7,
    textAlign: 'right',
  },
  closeQuoteButton: {
    margin: 0,
  },
  achievementContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: Z_INDEX.OVERLAY,
  },
  achievementContent: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.LARGE,
    borderRadius: BORDER_RADIUS.LARGE,
    ...SHADOWS.MEDIUM,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
  },
  achievementTitle: {
    fontSize: SPACING.XXLARGE,
    fontWeight: 'bold',
    marginTop: SPACING.MEDIUM,
    marginBottom: SPACING.XSMALL,
    color: COLORS.DEEP_REFLECTION,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: SPACING.MEDIUM,
    color: COLORS.DEEP_REFLECTION,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default JournalScreen; 
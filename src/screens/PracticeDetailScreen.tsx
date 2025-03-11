import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, KeyboardAvoidingView, Platform, TextInput as RNTextInput, Alert } from 'react-native';
import { Text, Title, Paragraph, IconButton, Surface, Divider, TextInput, Button } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { format } from 'date-fns';

// Import design system
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/DesignSystem';

// Define the route params type
type PracticeDetailRouteParams = {
  PracticeDetail: {
    id: string;
    title: string;
    category: 'self-observation' | 'acceptance' | 'present-moment';
  };
};

type PracticeDetailScreenRouteProp = RouteProp<PracticeDetailRouteParams, 'PracticeDetail'>;

const PracticeDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<PracticeDetailScreenRouteProp>();
  const insets = useSafeAreaInsets();
  
  const { id, title, category } = route.params;
  
  // State for user notes
  const [notes, setNotes] = useState('');
  const [isSaving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  // Load saved notes when the screen opens
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const savedNotes = await AsyncStorage.getItem(`practice_notes_${id}`);
        if (savedNotes) {
          setNotes(savedNotes);
        }
        
        const savedTimestamp = await AsyncStorage.getItem(`practice_notes_timestamp_${id}`);
        if (savedTimestamp) {
          setLastSaved(savedTimestamp);
        }
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    };
    
    loadNotes();
  }, [id]);
  
  // Save notes to AsyncStorage and add to journal
  const saveNotes = async () => {
    try {
      setSaving(true);
      await AsyncStorage.setItem(`practice_notes_${id}`, notes);
      
      const timestamp = new Date().toLocaleString();
      await AsyncStorage.setItem(`practice_notes_timestamp_${id}`, timestamp);
      setLastSaved(timestamp);
      
      // Add to journal
      await addToJournal();
      
      setTimeout(() => {
        setSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving notes:', error);
      setSaving(false);
    }
  };
  
  // Add practice notes to journal
  const addToJournal = async () => {
    try {
      if (!notes.trim()) return; // Don't add empty notes
      
      // Get existing journal entries
      const entriesJson = await SecureStore.getItemAsync('journalEntries');
      let entries = entriesJson ? JSON.parse(entriesJson) : [];
      
      // Create a new journal entry
      const currentDate = new Date();
      const formattedDate = format(currentDate, "yyyy-MM-dd'T'HH:mm:ss");
      
      // Check if we already have an entry for today with this practice
      const existingEntryIndex = entries.findIndex(
        (entry: any) => 
          entry.practiceNotes && 
          entry.practiceNotes.practiceId === id &&
          new Date(entry.date).toDateString() === currentDate.toDateString()
      );
      
      if (existingEntryIndex !== -1) {
        // Update existing entry
        entries[existingEntryIndex].practiceNotes = {
          practiceId: id,
          practiceTitle: title,
          practiceCategory: category,
          notes: notes,
          timestamp: currentDate.toISOString()
        };
      } else {
        // Create a new journal entry specifically for practice notes
        const newEntry = {
          id: `practice_${id}_${Date.now()}`,
          date: formattedDate,
          emotions: [],
          hoursSlept: '',
          hoursExercise: '',
          screenTime: '',
          pressures: [],
          peopleInteractions: [],
          wishSaid: '',
          bestThing: '',
          worstThing: '',
          overallFeeling: '',
          contributingFactors: {},
          currentFeeling: [],
          notes: `Practice: ${title}`,
          skippedSections: ['all'],
          // Add practice-specific data
          practiceNotes: {
            practiceId: id,
            practiceTitle: title,
            practiceCategory: category,
            notes: notes,
            timestamp: currentDate.toISOString()
          }
        };
        
        entries.push(newEntry);
      }
      
      // Save updated entries
      await SecureStore.setItemAsync('journalEntries', JSON.stringify(entries));
      
      // Show confirmation to user
      Alert.alert(
        "Added to Journal",
        "Your practice notes have been added to your journal history.",
        [{ text: "OK" }]
      );
      
    } catch (error) {
      console.error('Error adding to journal:', error);
      Alert.alert(
        "Error",
        "Failed to add notes to journal. Please try again.",
        [{ text: "OK" }]
      );
    }
  };
  
  // Get the practice content based on the ID
  const practiceContent = getPracticeContent(id);
  
  // Get category color
  const getCategoryColor = () => {
    switch (category) {
      case 'self-observation':
        return COLORS.SERENITY_BLUE;
      case 'acceptance':
        return COLORS.HOPEFUL_CORAL;
      case 'present-moment':
        return COLORS.MINDFUL_MINT;
      default:
        return COLORS.SERENITY_BLUE;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={COLORS.WHITE}
            onPress={() => navigation.goBack()}
          />
          <Title style={styles.title}>{title}</Title>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Surface style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]}>
          <Text style={styles.categoryText}>
            {category === 'self-observation' && 'Self-Observation'}
            {category === 'acceptance' && 'Acceptance'}
            {category === 'present-moment' && 'Present Moment'}
          </Text>
        </Surface>
        
        <View style={styles.contentContainer}>
          {practiceContent.map((section, index) => (
            <View key={index} style={styles.section}>
              {section.title && (
                <Text style={styles.sectionTitle}>{section.title}</Text>
              )}
              <Paragraph style={styles.sectionText}>{section.text}</Paragraph>
              {index < practiceContent.length - 1 && <Divider style={styles.divider} />}
            </View>
          ))}
        </View>
        
        {/* Notes Section */}
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>Your Notes</Text>
          <Text style={styles.notesDescription}>
            Record your thoughts and feelings about this practice. How did it help you? What did you notice during the exercise?
          </Text>
          
          <TextInput
            style={styles.notesInput}
            multiline
            mode="outlined"
            placeholder="Write your notes here..."
            value={notes}
            onChangeText={setNotes}
            outlineColor="rgba(255, 255, 255, 0.2)"
            activeOutlineColor={getCategoryColor()}
            textColor="rgba(255, 255, 255, 0.9)"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            theme={{ colors: { background: '#1A2A4A' } }}
          />
          
          <View style={styles.saveContainer}>
            {lastSaved && (
              <Text style={styles.lastSavedText}>Last saved: {lastSaved}</Text>
            )}
            <Button 
              mode="contained" 
              onPress={saveNotes} 
              loading={isSaving}
              disabled={isSaving}
              style={[styles.saveButton, { backgroundColor: getCategoryColor() }]}
            >
              {isSaving ? 'Saving...' : 'Save Notes'}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Function to get practice content based on ID
const getPracticeContent = (id: string) => {
  switch (id) {
    case '1': // Observing Thoughts as an Audience Member
      return [
        {
          text: 'This practice helps you step back and see your thoughts as fleeting mental events rather than factual truths. Recognizing this can free you from believing every thought that arises and create space between you and your thoughts.'
        },
        {
          title: 'Preparation',
          text: 'Find a quiet, comfortable space where you won\'t be disturbed for at least 10 minutes. Sit in a position that allows you to be alert yet relaxed, with your back straight but not rigid.'
        },
        {
          title: 'Step 1: Ground Yourself',
          text: 'Close your eyes gently. Take several slow, deep breaths, feeling your abdomen rise and fall. Allow your body to relax with each exhale, grounding yourself in the present moment.'
        },
        {
          title: 'Step 2: Visualize the Theater',
          text: 'Picture yourself sitting comfortably in an empty theater. The room is dimly lit, peaceful, and you are the only person present. In front of you is a large screen where your thoughts will be displayed like scenes from a movie.'
        },
        {
          title: 'Step 3: Observe Your Thoughts',
          text: 'As thoughts arise in your mind, imagine them appearing on the screen. Watch each thought play out without trying to change it, judge it, or become involved in its story. Simply observe it with curiosity and distance.'
        },
        {
          title: 'Step 4: Label Your Thoughts',
          text: 'When a thought appears, acknowledge it neutrally by mentally noting, "This is a thought about..." For example, "This is a thought about my meeting tomorrow" or "This is a thought about that conversation yesterday."'
        },
        {
          title: 'Step 5: Let Thoughts Fade',
          text: 'Allow each thought to naturally fade from the screen, just as scenes in a movie transition. Don\'t force thoughts away or cling to them. Simply wait patiently for the next thought to appear, maintaining your role as the audience member.'
        },
        {
          title: 'Practice Tips',
          text: '• If you find yourself getting caught up in a thought, gently remind yourself that you are the observer, not the thought itself.\n\n• Practice this exercise regularly, starting with 5 minutes and gradually increasing to 15-20 minutes.\n\n• Remember that the goal is not to have an empty mind, but to change your relationship with your thoughts.'
        },
        {
          title: 'Benefits',
          text: 'With regular practice, you\'ll develop greater awareness of your thought patterns and learn to see thoughts as mental events rather than reality. This creates freedom from automatic reactions and allows you to respond to situations with greater clarity and choice.'
        }
      ];
    case '10': // Visualizing Negative Thoughts as Guests
      return [
        {
          text: 'Think of your negative thoughts as unexpected guests arriving at a gathering you\'re hosting. You are the host, calmly observing each guest as they enter your space. Whenever a negative thought arises, picture it clearly as a guest with its own identity, appearance, and voice.'
        },
        {
          title: 'Example',
          text: 'If the thought "I\'m not good enough" enters your mind, envision it as a shy, hesitant guest named "Self-Doubt," quietly whispering insecurities from the corner of the room.'
        },
        {
          title: 'Practice',
          text: 'As the host, you control the interaction with your guests. Take a moment to calmly engage with this visitor, gently asking:\n\n• What does this guest truly want or need?\n\n• Why does this guest express these negative messages?\n\n• How do you feel when interacting with this guest?'
        },
        {
          title: 'Benefit',
          text: 'By recognising and conversing with your negative thoughts as guests, you empower yourself to understand, manage, and even transform your emotional responses.'
        }
      ];
    case '11': // Practicing Opposite Actions
      return [
        {
          text: 'Opposite action is an effective technique where you intentionally perform the reverse of what your emotions or negative thoughts urge you to do, helping you avoid unhelpful outcomes and break negative patterns of behavior.'
        },
        {
          title: 'Step 1: Identify',
          text: 'Identify a frequent negative thought or emotion you experience, such as anxiety, self-criticism, or frustration. Notice when this thought arises and what it typically makes you want to do.'
        },
        {
          title: 'Step 2: Define the Opposite',
          text: 'Clearly define an action that is directly opposite to what this thought or emotion typically motivates you to do.\n\n• If anxiety makes you want to avoid social situations, the opposite action is to engage socially.\n\n• If self-criticism makes you focus on flaws, the opposite is to list your strengths and achievements.\n\n• If frustration makes you want to give up, the opposite is to break the task into smaller steps and continue.'
        },
        {
          title: 'Step 3: Practice',
          text: 'Whenever the negative thought or emotion emerges, consciously practice the opposite action you\'ve identified. This may feel uncomfortable at first, but this discomfort is part of the growth process.'
        },
        {
          title: 'Step 4: Reflect',
          text: 'After completing the opposite action, reflect on how it affects your emotions and thought processes. Notice any shifts in your mood, perspective, or physical sensations.'
        },
        {
          title: 'Example',
          text: 'If you often think "I am not good enough," your opposite action could be to list three personal achievements or positive attributes about yourself, speak them aloud, and accept a compliment without deflecting it.'
        },
        {
          title: 'Benefit',
          text: 'By practicing opposite actions, you can break the cycle of negative emotions reinforcing negative behaviors. Over time, this technique can help rewire your brain\'s automatic responses and create new, healthier emotional patterns.'
        }
      ];
    default:
      return [{ text: 'Detailed information for this practice is not available.' }];
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B38',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginLeft: SPACING.SMALL,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.MEDIUM,
    paddingBottom: SPACING.XXLARGE,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.XSMALL,
    borderRadius: BORDER_RADIUS.LARGE,
    marginBottom: SPACING.MEDIUM,
  },
  categoryText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: 14,
  },
  contentContainer: {
    backgroundColor: '#1A2A4A',
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    ...SHADOWS.MEDIUM,
  },
  section: {
    marginBottom: SPACING.MEDIUM,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: SPACING.SMALL,
  },
  sectionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: SPACING.MEDIUM,
  },
  notesContainer: {
    backgroundColor: '#1A2A4A',
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    marginTop: SPACING.LARGE,
    ...SHADOWS.MEDIUM,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: SPACING.SMALL,
  },
  notesDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING.MEDIUM,
    lineHeight: 20,
  },
  notesInput: {
    minHeight: 150,
    backgroundColor: '#1A2A4A',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: SPACING.MEDIUM,
  },
  saveContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastSavedText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    flex: 1,
  },
  saveButton: {
    borderRadius: BORDER_RADIUS.SMALL,
  },
});

export default PracticeDetailScreen; 
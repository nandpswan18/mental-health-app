import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  Text, 
  Button, 
  TextInput, 
  Checkbox, 
  ProgressBar, 
  Title, 
  Paragraph, 
  useTheme, 
  Surface,
  Divider,
  IconButton,
  TouchableRipple
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Slider } from '@miblanchard/react-native-slider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AnimatedCharacter from '../components/AnimatedCharacter';
import { useAuth } from '../contexts/AuthContext';
import * as SecureStore from 'expo-secure-store';

// Define the type for Material Community Icons
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Define the type for a question
interface Question {
  id: string;
  title: string;
  description?: string;
  type: 'text' | 'select' | 'multiselect' | 'slider' | 'toggle';
  field: string;
  options?: Array<{
    label: string;
    value: string;
    icon?: IconName;
  }>;
  min?: number;
  max?: number;
}

// Define the type for the user profile data
interface UserProfile {
  // Basic Information
  name: string;
  pronouns: string;
  ageGroup: string;
  culturalPreferences: string;
  
  // Mental & Emotional Well-being
  currentMood: number;
  mentalHealthExperience: string;
  wellbeingAreas: string[];
  
  // Communication & AI Personality Preferences
  interactionStyle: string;
  responseType: string;
  checkInFrequency: string;
  
  // Crisis & Safety Preferences
  calmingExercises: boolean;
  emergencyResources: boolean;
  distressHandling: string;
  
  // User Goals & Progress Tracking
  supportGoals: string[];
  moodTracking: boolean;
  progressUpdates: boolean;
}

// Define the navigation type
type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Main: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileSetupScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const { markProfileSetupComplete } = useAuth();
  
  // Define custom colors for a calming palette
  const colors = {
    primary: '#6A8CAF', // Soft blue
    secondary: '#A7C5BD', // Sage green
    accent: '#E6C79C', // Soft amber
    background: '#F9F7F4', // Cream
    surface: '#FFFFFF', // White
    text: '#3A3A3A', // Dark gray
    placeholder: '#9E9E9E', // Medium gray
    highlight: '#D8E2DC', // Light sage
    error: '#D08B8B', // Soft rose
  };
  
  // Define all questions
  const questions: Question[] = [
    {
      id: 'name',
      title: 'What name would you like me to call you?',
      type: 'text',
      field: 'name'
    },
    {
      id: 'pronouns',
      title: 'What pronouns do you use?',
      description: 'e.g., she/her, he/him, they/them',
      type: 'text',
      field: 'pronouns'
    },
    {
      id: 'ageGroup',
      title: 'What age group do you fall into?',
      type: 'select',
      field: 'ageGroup',
      options: [
        { label: 'Under 18', value: 'Under 18', icon: 'account' },
        { label: '18-24', value: '18-24', icon: 'account' },
        { label: '25-34', value: '25-34', icon: 'account' },
        { label: '35-44', value: '35-44', icon: 'account' },
        { label: '45-54', value: '45-54', icon: 'account' },
        { label: '55+', value: '55+', icon: 'account' }
      ]
    },
    {
      id: 'culturalPreferences',
      title: 'Do you want to share any specific cultural or personal preferences?',
      description: 'This helps us provide more relevant support',
      type: 'text',
      field: 'culturalPreferences'
    },
    {
      id: 'currentMood',
      title: 'How are you feeling today?',
      description: 'On a scale from 1 (low) to 10 (high)',
      type: 'slider',
      field: 'currentMood',
      min: 1,
      max: 10
    },
    {
      id: 'mentalHealthExperience',
      title: 'Have you experienced challenges with mental health before?',
      type: 'select',
      field: 'mentalHealthExperience',
      options: [
        { label: 'Yes', value: 'Yes', icon: 'check' },
        { label: 'No', value: 'No', icon: 'close' },
        { label: 'Prefer not to say', value: 'Prefer not to say', icon: 'shield' }
      ]
    },
    {
      id: 'wellbeingAreas',
      title: 'What areas of your well-being would you like support with?',
      description: 'Select all that apply',
      type: 'multiselect',
      field: 'wellbeingAreas',
      options: [
        { label: 'Anxiety', value: 'Anxiety', icon: 'brain' },
        { label: 'Stress', value: 'Stress', icon: 'lightning-bolt' },
        { label: 'Depression', value: 'Depression', icon: 'weather-cloudy' },
        { label: 'Loneliness', value: 'Loneliness', icon: 'account-off' },
        { label: 'Relationships', value: 'Relationships', icon: 'account-group' },
        { label: 'Self-confidence', value: 'Self-confidence', icon: 'shield-account' },
        { label: 'Motivation', value: 'Motivation', icon: 'rocket-launch' },
        { label: 'Sleep issues', value: 'Sleep issues', icon: 'sleep' },
        { label: 'Other', value: 'Other', icon: 'dots-horizontal' }
      ]
    },
    {
      id: 'interactionStyle',
      title: 'How would you like me to interact with you?',
      type: 'select',
      field: 'interactionStyle',
      options: [
        { label: 'Casual and friendly', value: 'Casual and friendly', icon: 'emoticon-happy-outline' },
        { label: 'Professional and structured', value: 'Professional and structured', icon: 'briefcase-outline' },
        { label: 'A mix of both', value: 'A mix of both', icon: 'sync' }
      ]
    },
    {
      id: 'responseType',
      title: 'How would you like me to respond when you\'re feeling down?',
      type: 'select',
      field: 'responseType',
      options: [
        { label: 'Offer advice and solutions', value: 'Offer advice and solutions', icon: 'lightbulb-on-outline' },
        { label: 'Provide encouragement and validation', value: 'Provide encouragement and validation', icon: 'hand-heart' },
        { label: 'Just listen', value: 'Just listen', icon: 'ear-hearing' }
      ]
    },
    {
      id: 'checkInFrequency',
      title: 'Would you like me to check in on you?',
      type: 'select',
      field: 'checkInFrequency',
      options: [
        { label: 'Daily', value: 'Daily', icon: 'calendar-today' },
        { label: 'Weekly', value: 'Weekly', icon: 'calendar-week' },
        { label: 'Only when I reach out', value: 'Only when I reach out', icon: 'calendar-clock' }
      ]
    },
    {
      id: 'calmingExercises',
      title: 'If you\'re feeling overwhelmed, would you like me to offer calming exercises?',
      type: 'toggle',
      field: 'calmingExercises'
    },
    {
      id: 'emergencyResources',
      title: 'Would you like access to emergency resources if needed?',
      type: 'toggle',
      field: 'emergencyResources'
    },
    {
      id: 'distressHandling',
      title: 'If I notice signs of distress, how should I respond?',
      type: 'select',
      field: 'distressHandling',
      options: [
        { label: 'Gently guide you to calming exercises', value: 'Gently guide you to calming exercises', icon: 'meditation' },
        { label: 'Ask if you\'d like professional resources', value: 'Ask if you\'d like professional resources', icon: 'doctor' },
        { label: 'Respectfully give you space', value: 'Respectfully give you space', icon: 'account-clock' }
      ]
    },
    {
      id: 'supportGoals',
      title: 'What would you like to achieve through our conversations?',
      description: 'Select all that apply',
      type: 'multiselect',
      field: 'supportGoals',
      options: [
        { label: 'Reduce stress', value: 'Reduce stress', icon: 'meditation' },
        { label: 'Build better habits', value: 'Build better habits', icon: 'calendar-check' },
        { label: 'Improve emotional awareness', value: 'Improve emotional awareness', icon: 'emoticon-outline' },
        { label: 'Strengthen relationships', value: 'Strengthen relationships', icon: 'account-group' },
        { label: 'Other', value: 'Other', icon: 'dots-horizontal' }
      ]
    },
    {
      id: 'moodTracking',
      title: 'Would you like me to track your mood over time?',
      type: 'toggle',
      field: 'moodTracking'
    },
    {
      id: 'progressUpdates',
      title: 'Do you want occasional progress updates and reminders?',
      type: 'toggle',
      field: 'progressUpdates'
    }
  ];
  
  // State for current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const totalQuestions = questions.length;
  
  // State for user profile data
  const [profile, setProfile] = useState<UserProfile>({
    // Basic Information
    name: '',
    pronouns: '',
    ageGroup: '',
    culturalPreferences: '',
    
    // Mental & Emotional Well-being
    currentMood: 5,
    mentalHealthExperience: '',
    wellbeingAreas: [],
    
    // Communication & AI Personality Preferences
    interactionStyle: '',
    responseType: '',
    checkInFrequency: '',
    
    // Crisis & Safety Preferences
    calmingExercises: false,
    emergencyResources: false,
    distressHandling: '',
    
    // User Goals & Progress Tracking
    supportGoals: [],
    moodTracking: false,
    progressUpdates: false,
  });
  
  // Helper function to update profile
  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };
  
  // Helper function to toggle array items
  const toggleArrayItem = (field: keyof UserProfile, item: string) => {
    setProfile(prev => {
      const currentArray = prev[field] as string[];
      if (currentArray.includes(item)) {
        return { ...prev, [field]: currentArray.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...currentArray, item] };
      }
    });
  };
  
  // Function to handle next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      // Save profile and navigate to main screen
      handleSaveProfile();
    }
  };
  
  // Function to handle previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };
  
  // Function to save profile
  const handleSaveProfile = async () => {
    console.log('Saving profile:', profile);
    // Save profile data to secure storage
    try {
      await SecureStore.setItemAsync('userProfile', JSON.stringify(profile));
      // Mark profile setup as complete in AuthContext
      await markProfileSetupComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };
  
  // Render progress indicator
  const renderProgressIndicator = () => {
    return (
      <View style={styles.progressIndicator}>
        <ProgressBar 
          progress={(currentQuestionIndex + 1) / totalQuestions} 
          color={colors.primary} 
          style={styles.progressBar} 
        />
        <Text style={[styles.progressText, { color: colors.text }]}>
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </Text>
      </View>
    );
  };
  
  // Render a selection button
  const renderSelectionButton = (
    label: string, 
    isSelected: boolean, 
    onPress: () => void,
    icon?: IconName
  ) => {
    return (
      <TouchableRipple
        onPress={onPress}
        style={[
          styles.selectionButton,
          isSelected ? 
            { backgroundColor: colors.primary + '20', borderColor: colors.primary } : 
            { borderColor: colors.placeholder }
        ]}
      >
        <View style={styles.selectionButtonContent}>
          {icon && (
            <MaterialCommunityIcons 
              name={icon} 
              size={24} 
              color={isSelected ? colors.primary : colors.text} 
              style={styles.selectionButtonIcon}
            />
          )}
          <Text 
            style={[
              styles.selectionButtonText, 
              { color: colors.text },
              isSelected ? { color: colors.primary, fontWeight: '600' } : {}
            ]}
          >
            {label}
          </Text>
          {isSelected && (
            <MaterialCommunityIcons 
              name="check-circle" 
              size={24} 
              color={colors.primary} 
              style={styles.selectionButtonCheck}
            />
          )}
        </View>
      </TouchableRipple>
    );
  };
  
  // Render a toggle button
  const renderToggleButton = (
    label: string, 
    isSelected: boolean, 
    onPress: () => void,
    icon?: IconName
  ) => {
    return (
      <TouchableRipple
        onPress={onPress}
        style={[
          styles.toggleButton,
          isSelected ? 
            { backgroundColor: colors.primary + '20', borderColor: colors.primary } : 
            { borderColor: colors.placeholder }
        ]}
      >
        <View style={styles.toggleButtonContent}>
          {icon && (
            <MaterialCommunityIcons 
              name={icon} 
              size={24} 
              color={isSelected ? colors.primary : colors.text} 
              style={styles.toggleButtonIcon}
            />
          )}
          <Text 
            style={[
              styles.toggleButtonText, 
              { color: colors.text },
              isSelected ? { color: colors.primary, fontWeight: '600' } : {}
            ]}
          >
            {label}
          </Text>
          <View style={styles.toggleButtonCheckContainer}>
            {isSelected ? (
              <MaterialCommunityIcons name="checkbox-marked" size={24} color={colors.primary} />
            ) : (
              <MaterialCommunityIcons name="checkbox-blank-outline" size={24} color={colors.placeholder} />
            )}
          </View>
        </View>
      </TouchableRipple>
    );
  };
  
  // Render current question
  const renderCurrentQuestion = () => {
    const question = questions[currentQuestionIndex];
    
    return (
      <View style={styles.questionContainer}>
        <Title style={[styles.questionTitle, { color: colors.primary }]}>{question.title}</Title>
        
        {question.description && (
          <Paragraph style={[styles.questionDescription, { color: colors.text }]}>
            {question.description}
          </Paragraph>
        )}
        
        <View style={styles.answerContainer}>
          {renderQuestionInput(question)}
        </View>
      </View>
    );
  };
  
  // Render the appropriate input for the question type
  const renderQuestionInput = (question: Question) => {
    const field = question.field as keyof UserProfile;
    
    switch (question.type) {
      case 'text':
        return (
          <TextInput
            mode="outlined"
            value={profile[field] as string}
            onChangeText={(text) => updateProfile(field, text)}
            placeholder={question.description || ''}
            multiline={field === 'culturalPreferences'}
            numberOfLines={field === 'culturalPreferences' ? 3 : 1}
            style={[styles.textInput, { backgroundColor: colors.surface }]}
            outlineColor={colors.placeholder}
            activeOutlineColor={colors.primary}
            theme={{ colors: { primary: colors.primary } }}
          />
        );
        
      case 'select':
        return (
          <View style={styles.optionsContainer}>
            {question.options?.map((option) => (
              <View key={option.value} style={styles.optionItem}>
                {renderSelectionButton(
                  option.label,
                  profile[field] === option.value,
                  () => updateProfile(field, option.value),
                  option.icon
                )}
              </View>
            ))}
          </View>
        );
        
      case 'multiselect':
        return (
          <View style={styles.optionsGrid}>
            {question.options?.map((option) => (
              <View key={option.value} style={styles.optionGridItem}>
                {renderToggleButton(
                  option.label,
                  (profile[field] as string[]).includes(option.value),
                  () => toggleArrayItem(field, option.value),
                  option.icon
                )}
              </View>
            ))}
          </View>
        );
        
      case 'slider':
        return (
          <View style={styles.sliderContainer}>
            <Slider
              value={profile[field] as number}
              onValueChange={(value) => updateProfile(field, Array.isArray(value) ? value[0] : value)}
              minimumValue={question.min || 1}
              maximumValue={question.max || 10}
              step={1}
              minimumTrackTintColor={colors.primary}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={{ color: colors.text }}>{question.min || 1}</Text>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{profile[field] as number}</Text>
              <Text style={{ color: colors.text }}>{question.max || 10}</Text>
            </View>
          </View>
        );
        
      case 'toggle':
        return (
          <View style={styles.toggleContainer}>
            <TouchableRipple
              onPress={() => updateProfile(field, !(profile[field] as boolean))}
              style={[
                styles.toggleCard,
                (profile[field] as boolean) ? 
                  { backgroundColor: colors.primary + '20', borderColor: colors.primary } : 
                  { borderColor: colors.placeholder }
              ]}
            >
              <View style={styles.toggleCardContent}>
                <View style={styles.toggleCardTextContainer}>
                  <Text style={[
                    styles.toggleCardText,
                    { color: (profile[field] as boolean) ? colors.primary : colors.text }
                  ]}>
                    {(profile[field] as boolean) ? 'Yes' : 'No'}
                  </Text>
                </View>
                <View style={styles.toggleCardSwitch}>
                  {(profile[field] as boolean) ? (
                    <MaterialCommunityIcons name="toggle-switch" size={40} color={colors.primary} />
                  ) : (
                    <MaterialCommunityIcons name="toggle-switch-off" size={40} color={colors.placeholder} />
                  )}
                </View>
              </View>
            </TouchableRipple>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  // Render navigation buttons
  const renderNavigationButtons = () => {
    return (
      <View style={styles.navigationButtons}>
        {currentQuestionIndex > 0 && (
          <Button 
            mode="outlined" 
            onPress={handlePrevQuestion}
            style={[styles.navButton, { borderColor: colors.primary }]}
            labelStyle={{ color: colors.primary }}
            icon="arrow-left"
          >
            Back
          </Button>
        )}
        <Button 
          mode="contained" 
          onPress={handleNextQuestion}
          style={[
            styles.navButton, 
            styles.nextButton, 
            { backgroundColor: colors.primary }
          ]}
          contentStyle={{ flexDirection: 'row-reverse' }}
          icon={currentQuestionIndex === totalQuestions - 1 ? "check" : "arrow-right"}
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
        </Button>
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <AnimatedCharacter size={100} style={styles.avatar} />
          <Title style={[styles.headerTitle, { color: colors.primary }]}>Let's Get to Know You</Title>
          <Paragraph style={[styles.headerSubtitle, { color: colors.text }]}>
            This information helps us personalize your experience with Mindful Companion
          </Paragraph>
        </View>
        
        {renderProgressIndicator()}
        <Surface style={[styles.card, { backgroundColor: colors.surface }]}>
          {renderCurrentQuestion()}
        </Surface>
        {renderNavigationButtons()}
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  progressIndicator: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    marginBottom: 16,
  },
  questionContainer: {
    marginBottom: 16,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  questionDescription: {
    marginBottom: 20,
    opacity: 0.8,
    fontSize: 16,
  },
  answerContainer: {
    marginTop: 8,
  },
  textInput: {
    marginBottom: 8,
    fontSize: 16,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionItem: {
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  optionGridItem: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 12,
  },
  selectionButton: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'transparent',
  },
  selectionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionButtonText: {
    flex: 1,
    fontSize: 16,
  },
  selectionButtonIcon: {
    marginRight: 12,
  },
  selectionButtonCheck: {
    marginLeft: 8,
  },
  toggleButton: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'transparent',
  },
  toggleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleButtonText: {
    flex: 1,
    fontSize: 16,
  },
  toggleButtonIcon: {
    marginRight: 12,
  },
  toggleButtonCheckContainer: {
    marginLeft: 8,
  },
  sliderContainer: {
    paddingHorizontal: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  toggleContainer: {
    marginTop: 8,
  },
  toggleCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'transparent',
  },
  toggleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleCardTextContainer: {
    flex: 1,
  },
  toggleCardText: {
    fontSize: 18,
    fontWeight: '600',
  },
  toggleCardSwitch: {
    marginLeft: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 12,
    paddingVertical: 8,
  },
  nextButton: {
    flex: 2,
  },
});

export default ProfileSetupScreen; 
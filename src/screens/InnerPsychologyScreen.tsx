import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Text, Title, Paragraph, IconButton, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';

// Import design system
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/DesignSystem';

// Define navigation type
type RootStackParamList = {
  PracticeDetail: {
    id: string;
    title: string;
    category: 'self-observation' | 'acceptance' | 'present-moment';
  };
};

type InnerPsychologyScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Define psychology resource type
interface PsychologyResource {
  id: string;
  title: string;
  description: string;
  category: 'self-observation' | 'acceptance' | 'present-moment';
}

// Inner Psychology resources
const innerPsychologyResources: PsychologyResource[] = [
  // Self-Observation resources
  {
    id: '1',
    title: 'Observing Thoughts as an Audience Member',
    description: 'Practice viewing your thoughts as scenes on a screen, helping you step back and see them as fleeting mental events rather than factual truths.',
    category: 'self-observation'
  },
  {
    id: '2',
    title: 'Engaging with Critical Thoughts',
    description: 'Open a dialogue with your inner critic to uncover deeper beliefs, fears, and past experiences that influence your mindset and self-perception.',
    category: 'self-observation'
  },
  {
    id: '10',
    title: 'Visualizing Negative Thoughts as Guests',
    description: 'Imagine negative thoughts as guests at a gathering you\'re hosting, observing and engaging with them to understand their purpose and transform your emotional responses.',
    category: 'self-observation'
  },
  {
    id: '11',
    title: 'Practicing Opposite Actions',
    description: 'Intentionally perform the reverse of what your emotions or negative thoughts urge you to do, helping you avoid unhelpful outcomes and transform your emotional responses.',
    category: 'self-observation'
  },
  
  // Acceptance resources
  {
    id: '4',
    title: 'Practicing Loving Detachment',
    description: 'Maintain emotional balance by gently releasing attachments and expectations around situations or relationships through guided visualization.',
    category: 'acceptance'
  },
  {
    id: '5',
    title: 'Embracing Uncertainty: The Uncertainty Box',
    description: 'Learn to accept and coexist with uncertainty through a symbolic exercise of placing uncertain thoughts in a container to find peace and emotional well-being.',
    category: 'acceptance'
  },
  {
    id: '6',
    title: 'Personal Acceptance Goals',
    description: 'Transform your daily life by setting specific acceptance goals, enhancing emotional resilience and psychological flexibility through structured practice.',
    category: 'acceptance'
  },
  
  // Present Moment resources
  {
    id: '12',
    title: '5-4-3-2-1 Technique',
    description: 'A structured grounding exercise that engages all five senses to anchor you in the present moment and reduce anxiety or stress.',
    category: 'present-moment'
  },
  {
    id: '13',
    title: 'Mental Check-In',
    description: 'A simple practice to pause and assess your mental and emotional state, helping you reflect on your feelings and thoughts without judgment.',
    category: 'present-moment'
  },
  {
    id: '14',
    title: 'Gratitude Journaling',
    description: 'A mindfulness practice of regularly recording things you are grateful for, helping shift focus to life\'s positive aspects and improve overall well-being.',
    category: 'present-moment'
  }
];

const InnerPsychologyScreen = () => {
  const navigation = useNavigation<InnerPsychologyScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [activePsychologyCategory, setActivePsychologyCategory] = useState<'self-observation' | 'acceptance' | 'present-moment'>('self-observation');

  // Function to handle resource item press
  const handleResourcePress = (resource: PsychologyResource) => {
    navigation.navigate('PracticeDetail', {
      id: resource.id,
      title: resource.title,
      category: resource.category
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
          <Title style={styles.title}>Inner Psychology</Title>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Paragraph style={styles.intro}>
          Accepting emotions without judgment increases self-awareness and resilience, leading to greater emotional balance. Embracing experiences openly helps manage life's challenges effectively, opening doors to new possibilities. Mindfulness, or non-judgmental focus on the present moment, further enhances this practice.
        </Paragraph>
        
        <View style={styles.categoryTabs}>
          <TouchableOpacity 
            style={[
              styles.categoryTab, 
              activePsychologyCategory === 'self-observation' && styles.activeTab
            ]}
            onPress={() => setActivePsychologyCategory('self-observation')}
          >
            <MaterialCommunityIcons 
              name="eye-outline" 
              size={24} 
              color={activePsychologyCategory === 'self-observation' ? COLORS.WHITE : COLORS.SERENITY_BLUE} 
            />
            <Text style={[
              styles.categoryTabText, 
              activePsychologyCategory === 'self-observation' && styles.activeTabText
            ]}>
              Self-Observation
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.categoryTab, 
              activePsychologyCategory === 'acceptance' && styles.activeTab
            ]}
            onPress={() => setActivePsychologyCategory('acceptance')}
          >
            <MaterialCommunityIcons 
              name="hand-heart" 
              size={24} 
              color={activePsychologyCategory === 'acceptance' ? COLORS.WHITE : COLORS.SERENITY_BLUE} 
            />
            <Text style={[
              styles.categoryTabText, 
              activePsychologyCategory === 'acceptance' && styles.activeTabText
            ]}>
              Acceptance
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.categoryTab, 
              activePsychologyCategory === 'present-moment' && styles.activeTab
            ]}
            onPress={() => setActivePsychologyCategory('present-moment')}
          >
            <MaterialCommunityIcons 
              name="clock-time-four-outline" 
              size={24} 
              color={activePsychologyCategory === 'present-moment' ? COLORS.WHITE : COLORS.SERENITY_BLUE} 
            />
            <Text style={[
              styles.categoryTabText, 
              activePsychologyCategory === 'present-moment' && styles.activeTabText
            ]}>
              Present Moment
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.categoryTitleContainer}>
          <Text style={styles.categoryTitle}>
            {activePsychologyCategory === 'self-observation' && 'Self-Observation Practices'}
            {activePsychologyCategory === 'acceptance' && 'Acceptance Practices'}
            {activePsychologyCategory === 'present-moment' && 'Present Moment Practices'}
          </Text>
        </View>
        
        <View style={styles.resourcesList}>
          {innerPsychologyResources
            .filter(resource => resource.category === activePsychologyCategory)
            .map(resource => (
              <TouchableOpacity 
                key={resource.id} 
                onPress={() => handleResourcePress(resource)}
                activeOpacity={0.7}
              >
                <Surface 
                  style={[
                    styles.resourceItem,
                    resource.category === 'self-observation' && { borderLeftColor: COLORS.SERENITY_BLUE },
                    resource.category === 'acceptance' && { borderLeftColor: COLORS.HOPEFUL_CORAL },
                    resource.category === 'present-moment' && { borderLeftColor: COLORS.MINDFUL_MINT }
                  ]}
                >
                  <View style={styles.resourceItemContent}>
                    <Text style={styles.resourceItemTitle}>{resource.title}</Text>
                    <Text style={styles.resourceItemDescription}>{resource.description}</Text>
                    {(resource.id === '1' || resource.id === '2' || resource.id === '4' || resource.id === '5' || resource.id === '6' || resource.id === '10' || resource.id === '11') && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>NEW</Text>
                      </View>
                    )}
                  </View>
                </Surface>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
    </View>
  );
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
    fontSize: 24,
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
  intro: {
    fontSize: 16,
    color: COLORS.WHITE,
    marginBottom: SPACING.LARGE,
    lineHeight: 24,
  },
  categoryTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.LARGE,
  },
  categoryTab: {
    width: '31%',
    height: 90,
    backgroundColor: '#1A2A4A',
    borderRadius: BORDER_RADIUS.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
  },
  activeTab: {
    backgroundColor: COLORS.SERENITY_BLUE,
  },
  categoryTabText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.SMALL,
  },
  activeTabText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  categoryTitleContainer: {
    marginBottom: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: SPACING.SMALL,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  resourcesList: {
    flex: 1,
  },
  resourceItem: {
    padding: SPACING.MEDIUM,
    backgroundColor: '#1A2A4A',
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginBottom: SPACING.MEDIUM,
    ...SHADOWS.MEDIUM,
    minHeight: 100,
  },
  resourceItemContent: {
    flexDirection: 'column',
    paddingRight: 50,
    width: '100%',
  },
  resourceItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: SPACING.SMALL,
    flexWrap: 'wrap',
    lineHeight: 18,
    width: '90%',
  },
  resourceItemDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  newBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.HOPEFUL_CORAL,
    paddingHorizontal: SPACING.SMALL,
    paddingVertical: SPACING.XSMALL / 2,
    borderRadius: BORDER_RADIUS.SMALL,
    margin: SPACING.SMALL,
  },
  newBadgeText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default InnerPsychologyScreen; 
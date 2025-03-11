import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Text, Title, Paragraph, IconButton, Surface, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
      </ScrollView>
    </View>
  );
};

// Function to get practice content based on ID
const getPracticeContent = (id: string) => {
  switch (id) {
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
  }
});

export default PracticeDetailScreen; 
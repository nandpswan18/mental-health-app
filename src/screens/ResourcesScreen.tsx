import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, FlatList, Dimensions, StatusBar } from 'react-native';
import { Text, Card, Chip, Searchbar, Title, Paragraph, List, useTheme, Divider, Button, Surface, IconButton, Avatar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Import design system
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/DesignSystem';

// Get screen dimensions
const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

// Mock data for resources with calming content
const resourcesData = [
  {
    id: '1',
    title: 'Mindful Breathing Techniques',
    description: 'Simple breathing exercises to help calm your mind and bring awareness to the present moment.',
    category: 'Meditation',
    tags: ['breathing', 'mindfulness', 'beginner'],
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    icon: 'weather-windy',
    benefits: [
      'Reduces stress and anxiety by 63% according to recent studies',
      'Lowers blood pressure and heart rate',
      'Improves focus and concentration by up to 30%',
      'Enhances emotional regulation and resilience'
    ],
    practiceTime: '5-15 minutes',
    difficulty: 'Beginner',
    scienceInfo: 'Research from Harvard Medical School shows that mindful breathing activates the parasympathetic nervous system, reducing cortisol levels and promoting relaxation responses in the body.',
    trackingMetrics: ['Stress levels', 'Focus duration', 'Sleep quality']
  },
  {
    id: '2',
    title: 'Nature Connection Practice',
    description: 'Exercises to help you reconnect with nature and find peace in the natural world around you.',
    category: 'Self-Care',
    tags: ['nature', 'grounding', 'outdoors'],
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    icon: 'pine-tree',
    benefits: [
      'Reduces mental fatigue and restores attention',
      'Lowers stress hormones by up to 16%',
      'Improves mood and vitality',
      'Enhances creativity and problem-solving skills'
    ],
    practiceTime: '20-60 minutes',
    difficulty: 'All levels',
    scienceInfo: 'Studies from the University of Michigan demonstrate that spending time in nature improves cognitive function and memory by up to 20%. The "biophilia hypothesis" suggests humans have an innate bond with nature that affects wellbeing.',
    trackingMetrics: ['Time spent outdoors', 'Mood changes', 'Energy levels']
  },
  {
    id: '3',
    title: 'Gentle Movement Guide',
    description: 'Soft, flowing movements to release tension and bring awareness to your body.',
    category: 'Movement',
    tags: ['yoga', 'gentle', 'body awareness'],
    imageUrl: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    icon: 'human-handsup',
    benefits: [
      'Reduces physical tension and chronic pain',
      'Improves flexibility and joint mobility',
      'Enhances body awareness and proprioception',
      'Promotes mind-body connection and integration'
    ],
    practiceTime: '10-30 minutes',
    difficulty: 'Beginner to Intermediate',
    scienceInfo: 'Research published in the Journal of Physical Therapy Science shows that gentle movement practices increase the production of synovial fluid in joints and activate the body\'s natural pain-relieving compounds.',
    trackingMetrics: ['Physical tension', 'Range of motion', 'Pain levels']
  },
  {
    id: '4',
    title: 'Mindful Sleep Rituals',
    description: 'Create a peaceful bedtime routine to improve your sleep quality and rest more deeply.',
    category: 'Self-Care',
    tags: ['sleep', 'evening', 'relaxation'],
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    icon: 'sleep',
  },
  {
    id: '5',
    title: 'Journaling for Self-Discovery',
    description: 'Prompts and practices to explore your inner landscape through reflective writing.',
    category: 'Reflection',
    tags: ['writing', 'self-discovery', 'awareness'],
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    icon: 'book-open-page-variant',
  },
  {
    id: '6',
    title: 'Cultivating Self-Compassion',
    description: 'Learn to treat yourself with the same kindness you would offer to a good friend.',
    category: 'Meditation',
    tags: ['compassion', 'self-love', 'kindness'],
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    icon: 'heart',
  },
  {
    id: '7',
    title: 'Understanding Domestic Violence',
    description: 'Information about recognizing different forms of domestic violence and understanding its impact on mental health.',
    category: 'Support',
    tags: ['domestic violence', 'education', 'awareness'],
    imageUrl: 'https://images.unsplash.com/photo-1507427100689-2bf8574e32d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    icon: 'information-outline',
  },
  {
    id: '8',
    title: 'Safety Planning Strategies',
    description: 'Practical steps to create a personalized safety plan for those experiencing domestic violence.',
    category: 'Support',
    tags: ['domestic violence', 'safety', 'planning'],
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    icon: 'shield-account',
  },
  {
    id: '9',
    title: 'Coping with Trauma',
    description: 'Techniques for managing trauma responses and building resilience after experiencing domestic violence.',
    category: 'Support',
    tags: ['domestic violence', 'trauma', 'healing'],
    imageUrl: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    icon: 'hand-heart',
  },
];

// Domestic violence hotlines and resources
const emergencyResources = [
  {
    name: 'National Domestic Violence Hotline',
    phone: '1-800-799-7233',
    website: 'https://www.thehotline.org',
    description: 'Available 24/7. Call, chat, or text for support, resources, and safety planning.'
  },
  {
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    website: 'https://www.crisistextline.org',
    description: 'Free 24/7 support via text message. Trained crisis counselors are available.'
  },
  {
    name: 'National Sexual Assault Hotline',
    phone: '1-800-656-HOPE (4673)',
    website: 'https://www.rainn.org',
    description: 'Confidential support for survivors of sexual assault and their loved ones.'
  }
];

// Categories for filtering
const categories = ['All', 'Meditation', 'Movement', 'Self-Care', 'Reflection', 'Support'];

// Define the navigation type
type RootStackParamList = {
  InnerPsychology: undefined;
  // Add other screens as needed
};

type ResourcesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ResourcesScreen = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ResourcesScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [showEmergencyResources, setShowEmergencyResources] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Filter resources based on search query and selected category
  const filteredResources = resourcesData.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Select a resource to view details
  const selectResource = (id: string) => {
    setSelectedResource(id);
    // Scroll to top when viewing resource details
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // Go back to resource grid
  const goBackToGrid = () => {
    setSelectedResource(null);
  };

  // Open phone dialer
  const callPhone = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber.replace(/[^\d]/g, '')}`);
  };

  // Open website
  const openWebsite = (url: string) => {
    Linking.openURL(url);
  };

  // Render domestic violence resource content
  const renderDomesticViolenceContent = (resourceId: string) => {
    if (resourceId === '7') {
      return (
        <View>
          <Text style={styles.contentTitle}>Types of Domestic Violence:</Text>
          <List.Item
            title="Physical Abuse"
            description="Includes hitting, pushing, restraining, or any physical harm."
            left={props => <List.Icon {...props} icon="hand-back-left" color={theme.colors.primary} />}
          />
          <List.Item
            title="Emotional/Psychological Abuse"
            description="Includes threats, intimidation, isolation, and controlling behaviors."
            left={props => <List.Icon {...props} icon="brain" color={theme.colors.primary} />}
          />
          <List.Item
            title="Financial Abuse"
            description="Controlling access to money, preventing employment, creating debt."
            left={props => <List.Icon {...props} icon="currency-usd" color={theme.colors.primary} />}
          />
          <List.Item
            title="Digital Abuse"
            description="Monitoring online activity, controlling digital devices, harassment."
            left={props => <List.Icon {...props} icon="cellphone" color={theme.colors.primary} />}
          />
          <Button 
            mode="contained" 
            onPress={() => setShowEmergencyResources(true)}
            style={[styles.resourceButton, { backgroundColor: theme.colors.primary }]}
          >
            View Emergency Resources
          </Button>
        </View>
      );
    } else if (resourceId === '8') {
      return (
        <View>
          <Text style={styles.contentTitle}>Creating a Safety Plan:</Text>
          <List.Item
            title="Identify Safe Areas"
            description="Know which rooms in your home have exits and avoid rooms with potential weapons."
            left={props => <List.Icon {...props} icon="home-outline" color={theme.colors.primary} />}
          />
          <List.Item
            title="Emergency Contacts"
            description="Memorize or safely store important phone numbers of trusted people."
            left={props => <List.Icon {...props} icon="phone" color={theme.colors.primary} />}
          />
          <List.Item
            title="Emergency Bag"
            description="Prepare a bag with essentials (ID, money, medications) and keep it accessible."
            left={props => <List.Icon {...props} icon="bag-personal" color={theme.colors.primary} />}
          />
          <List.Item
            title="Code Word"
            description="Create a code word with trusted friends/family to signal you need help."
            left={props => <List.Icon {...props} icon="key" color={theme.colors.primary} />}
          />
          <Button 
            mode="contained" 
            onPress={() => setShowEmergencyResources(true)}
            style={[styles.resourceButton, { backgroundColor: theme.colors.primary }]}
          >
            View Emergency Resources
          </Button>
        </View>
      );
    } else if (resourceId === '9') {
      return (
        <View>
          <Text style={styles.contentTitle}>Coping Strategies:</Text>
          <List.Item
            title="Grounding Techniques"
            description="Use the 5-4-3-2-1 method: identify 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, and 1 thing you taste."
            left={props => <List.Icon {...props} icon="tree" color={theme.colors.primary} />}
          />
          <List.Item
            title="Deep Breathing"
            description="Practice slow, deep breaths to calm your nervous system when feeling overwhelmed."
            left={props => <List.Icon {...props} icon="weather-windy" color={theme.colors.primary} />}
          />
          <List.Item
            title="Self-Compassion"
            description="Remind yourself that what happened is not your fault and you deserve kindness."
            left={props => <List.Icon {...props} icon="heart" color={theme.colors.primary} />}
          />
          <List.Item
            title="Professional Support"
            description="Consider connecting with a trauma-informed therapist when you're ready."
            left={props => <List.Icon {...props} icon="account-tie" color={theme.colors.primary} />}
          />
          <Button 
            mode="contained" 
            onPress={() => setShowEmergencyResources(true)}
            style={[styles.resourceButton, { backgroundColor: theme.colors.primary }]}
          >
            View Emergency Resources
          </Button>
        </View>
      );
    }
    
    return null;
  };

  // Render resource details
  const renderResourceDetails = () => {
    if (!selectedResource) return null;
    
    const resource = resourcesData.find(r => r.id === selectedResource);
    if (!resource) return null;
    
    return (
      <View style={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={goBackToGrid}
            style={styles.backButton}
          />
          <Title style={styles.detailsTitle}>{resource.title}</Title>
        </View>
        
        <ScrollView 
          style={styles.detailsScrollView}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.detailsCard}>
            <Card.Cover source={{ uri: resource.imageUrl }} style={styles.detailsImage} />
            <Card.Content style={styles.detailsContent}>
              <View style={styles.categoryContainer}>
                <Chip style={styles.detailsCategoryChip}>{resource.category}</Chip>
                {resource.difficulty && (
                  <Chip style={styles.difficultyChip}>{resource.difficulty}</Chip>
                )}
                {resource.practiceTime && (
                  <Chip style={styles.timeChip} icon="clock-outline">{resource.practiceTime}</Chip>
                )}
              </View>
              
              <Paragraph style={styles.detailsDescription}>
                {resource.description}
              </Paragraph>
              
              {resource.scienceInfo && (
                <View style={styles.scienceContainer}>
                  <View style={styles.sectionTitleRow}>
                    <Avatar.Icon size={24} icon="flask" style={styles.sectionIcon} />
                    <Text style={styles.sectionTitle}>The Science</Text>
                  </View>
                  <Paragraph style={styles.scienceText}>
                    {resource.scienceInfo}
                  </Paragraph>
                </View>
              )}
              
              {resource.benefits && resource.benefits.length > 0 && (
                <View style={styles.benefitsContainer}>
                  <View style={styles.sectionTitleRow}>
                    <Avatar.Icon size={24} icon="chart-line" style={styles.sectionIcon} />
                    <Text style={styles.sectionTitle}>Key Benefits</Text>
                  </View>
                  {resource.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <Divider style={styles.divider} />
              
              {resource.category === 'Support' ? (
                renderDomesticViolenceContent(resource.id)
              ) : (
                <View>
                  <View style={styles.sectionTitleRow}>
                    <Avatar.Icon size={24} icon="book-open-variant" style={styles.sectionIcon} />
                    <Text style={styles.sectionTitle}>Practice Guide</Text>
                  </View>
                  
                  <List.Item
                    title="Begin Here"
                    description="Start with a few minutes of quiet preparation."
                    left={props => <List.Icon {...props} icon="leaf" color="#5B7EB5" />}
                    titleStyle={styles.listItemTitle}
                    descriptionStyle={styles.listItemDescription}
                  />
                  <List.Item
                    title="Core Practice"
                    description="Follow the guided instructions for this mindfulness technique."
                    left={props => <List.Icon {...props} icon="heart-outline" color="#5B7EB5" />}
                    titleStyle={styles.listItemTitle}
                    descriptionStyle={styles.listItemDescription}
                  />
                  <List.Item
                    title="Reflection Questions"
                    description="Take time to consider how this practice affects your state of mind."
                    left={props => <List.Icon {...props} icon="thought-bubble-outline" color="#5B7EB5" />}
                    titleStyle={styles.listItemTitle}
                    descriptionStyle={styles.listItemDescription}
                  />
                  <List.Item
                    title="Daily Integration"
                    description="Find small ways to incorporate this practice into your everyday life."
                    left={props => <List.Icon {...props} icon="calendar-check" color="#5B7EB5" />}
                    titleStyle={styles.listItemTitle}
                    descriptionStyle={styles.listItemDescription}
                  />
                  
                  {resource.trackingMetrics && resource.trackingMetrics.length > 0 && (
                    <View style={styles.trackingContainer}>
                      <View style={styles.sectionTitleRow}>
                        <Avatar.Icon size={24} icon="chart-bar" style={styles.sectionIcon} />
                        <Text style={styles.sectionTitle}>Progress Tracking</Text>
                      </View>
                      <Paragraph style={styles.trackingText}>
                        Track these metrics to measure your progress:
                      </Paragraph>
                      <View style={styles.metricsContainer}>
                        {resource.trackingMetrics.map((metric, index) => (
                          <Chip key={index} style={styles.metricChip} icon="trending-up">
                            {metric}
                          </Chip>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  <Button 
                    mode="contained" 
                    style={[styles.startButton, { backgroundColor: '#5B7EB5' }]}
                    icon="play"
                  >
                    Start Practice
                  </Button>
                </View>
              )}
              
              <View style={styles.tagsContainer}>
                {resource.tags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    style={styles.tag} 
                    textStyle={{ color: '#5B7EB5' }}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    );
  };

  // Render resource grid item
  const renderGridItem = ({ item }: { item: typeof resourcesData[0] }) => (
    <TouchableOpacity 
      style={styles.gridItem} 
      onPress={() => selectResource(item.id)}
      activeOpacity={0.7}
    >
      <Surface style={styles.gridItemSurface}>
        <View style={styles.iconContainer}>
          <Avatar.Icon 
            icon={item.icon} 
            size={40} 
            style={[styles.itemIcon, { backgroundColor: theme.colors.primary }]} 
          />
        </View>
        <Text style={styles.gridItemTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.gridItemCategory}>{item.category}</Text>
      </Surface>
    </TouchableOpacity>
  );

  // Get icon for category
  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'Meditation':
        return 'meditation';
      case 'Movement':
        return 'run';
      case 'Self-Care':
        return 'heart-pulse';
      case 'Reflection':
        return 'thought-bubble';
      case 'Support':
        return 'hand-heart';
      default:
        return 'apps';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#0D1B38' }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Title style={styles.title}>Mindfulness Library</Title>
        <Paragraph style={styles.subtitle}>
          Discover practices for well-being
        </Paragraph>
      </View>
      
      {/* Search and Categories */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search practices..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#5B7EB5"
          inputStyle={{ color: '#FFFFFF' }}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          theme={{ colors: { primary: '#5B7EB5', surface: '#1A2A4A' } }}
        />
      </View>
      
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryButton,
                selectedCategory === category ? styles.categoryButtonSelected : {}
              ]}
            >
              <View style={styles.categoryButtonContent}>
                <Avatar.Icon 
                  size={28} 
                  icon={getCategoryIcon(category)} 
                  style={[
                    styles.categoryIcon,
                    selectedCategory === category ? styles.categoryIconSelected : {}
                  ]} 
                />
                <Text 
                  style={[
                    styles.categoryText,
                    selectedCategory === category ? styles.categoryTextSelected : {}
                  ]}
                >
                  {category}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Inner Psychology Button */}
      <View style={styles.specialResourcesContainer}>
        <TouchableOpacity
          style={styles.specialResourceButton}
          onPress={() => navigation.navigate('InnerPsychology')}
        >
          <MaterialCommunityIcons name="brain" size={24} color="#FFFFFF" />
          <Text style={styles.specialResourceText}>Inner Psychology</Text>
        </TouchableOpacity>
      </View>
      
      {/* Emergency Resources Modal */}
      {showEmergencyResources && (
        <Surface style={styles.emergencyResourcesContainer}>
          <View style={[styles.emergencyHeader, { paddingTop: insets.top + 16 }]}>
            <Title style={styles.emergencyTitle}>Emergency Resources</Title>
            <Button 
              icon="close" 
              onPress={() => setShowEmergencyResources(false)}
              style={styles.closeButton}
            >
              Close
            </Button>
          </View>
          <Divider style={styles.divider} />
          <ScrollView style={styles.emergencyScrollView}>
            <Paragraph style={styles.emergencyNote}>
              If you are in immediate danger, please call 911 or your local emergency number.
            </Paragraph>
            {emergencyResources.map((resource, index) => (
              <Card key={index} style={styles.emergencyCard}>
                <Card.Content>
                  <Title style={styles.resourceName}>{resource.name}</Title>
                  <Paragraph style={styles.resourceDescription}>{resource.description}</Paragraph>
                  <View style={styles.resourceActions}>
                    <Button 
                      mode="contained" 
                      onPress={() => callPhone(resource.phone)}
                      style={[styles.actionButton, { backgroundColor: '#5B7EB5' }]}
                      icon="phone"
                    >
                      {resource.phone}
                    </Button>
                    <Button 
                      mode="outlined" 
                      onPress={() => openWebsite(resource.website)}
                      style={styles.actionButton}
                      icon="web"
                    >
                      Website
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
            <View style={styles.safetyTips}>
              <Title style={styles.safetyTitle}>Internet Safety Tips</Title>
              <Paragraph style={styles.safetyText}>
                • Use private browsing mode when researching resources
              </Paragraph>
              <Paragraph style={styles.safetyText}>
                • Clear your browser history after visiting support websites
              </Paragraph>
              <Paragraph style={styles.safetyText}>
                • Consider using a device your abuser doesn't have access to
              </Paragraph>
              <Paragraph style={styles.safetyText}>
                • Be aware that phone records may show calls to hotlines
              </Paragraph>
            </View>
          </ScrollView>
        </Surface>
      )}
      
      {/* Main Content */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.mainContainer}
        showsVerticalScrollIndicator={false}
      >
        {selectedResource ? (
          renderResourceDetails()
        ) : (
          <>
            {filteredResources.length === 0 ? (
              <Text style={styles.noResults}>No practices found matching your criteria.</Text>
            ) : (
              <FlatList
                data={filteredResources}
                renderItem={renderGridItem}
                keyExtractor={item => item.id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.gridContainer}
              />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  searchBar: {
    borderRadius: 8,
    backgroundColor: '#1A2A4A',
  },
  categoriesContainer: {
    marginTop: 16,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryButton: {
    width: 80,
    height: 80,
    backgroundColor: '#1A2A4A',
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#5B7EB5',
  },
  categoryButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    backgroundColor: 'transparent',
    marginBottom: 6,
  },
  categoryIconSelected: {
    backgroundColor: 'transparent',
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  mainContainer: {
    flex: 1,
  },
  gridContainer: {
    padding: 8,
    paddingBottom: 24,
  },
  gridItem: {
    width: cardWidth,
    padding: 8,
  },
  gridItemSurface: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1A2A4A',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 12,
  },
  itemIcon: {
    backgroundColor: '#5B7EB5',
  },
  gridItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    marginBottom: 4,
  },
  gridItemCategory: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 40,
    color: 'white',
    opacity: 0.6,
  },
  detailsContainer: {
    flex: 1,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 0,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    marginLeft: 8,
  },
  detailsScrollView: {
    flex: 1,
  },
  detailsCard: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A2A4A',
  },
  detailsImage: {
    height: 200,
  },
  detailsContent: {
    padding: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailsCategoryChip: {
    backgroundColor: 'rgba(91, 126, 181, 0.2)',
    marginRight: 8,
    marginBottom: 8,
  },
  difficultyChip: {
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
    marginRight: 8,
    marginBottom: 8,
  },
  timeChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    marginBottom: 8,
  },
  detailsDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: 'white',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  scienceContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 8,
  },
  scienceText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  benefitsContainer: {
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bulletPoint: {
    color: '#5B7EB5',
    fontSize: 16,
    marginRight: 8,
    fontWeight: 'bold',
  },
  benefitText: {
    color: 'white',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  listItemTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  listItemDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  trackingContainer: {
    marginTop: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
  },
  trackingText: {
    color: 'white',
    marginBottom: 12,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    marginRight: 8,
    marginBottom: 8,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    color: 'white',
  },
  startButton: {
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  tag: {
    marginRight: 8,
    marginTop: 8,
    backgroundColor: 'rgba(91, 126, 181, 0.2)',
  },
  divider: {
    marginVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  resourceButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  emergencyResourcesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0D1B38',
    zIndex: 1000,
    elevation: 5,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  emergencyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    margin: 0,
  },
  emergencyScrollView: {
    flex: 1,
    padding: 16,
  },
  emergencyNote: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  emergencyCard: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#1A2A4A',
  },
  resourceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  resourceDescription: {
    marginVertical: 8,
    color: 'white',
  },
  resourceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  safetyTips: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  safetyTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: 'white',
  },
  safetyText: {
    marginBottom: 8,
    color: 'white',
  },
  specialResourcesContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  specialResourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#5B7EB5',
    justifyContent: 'center',
  },
  specialResourceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
});

export default ResourcesScreen; 
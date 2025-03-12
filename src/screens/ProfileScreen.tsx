import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Linking, Platform, Dimensions, Animated } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Avatar, 
  Title, 
  Paragraph, 
  List, 
  Switch, 
  Divider, 
  useTheme,
  IconButton,
  Surface,
  Badge,
  Portal,
  Dialog,
  FAB,
  ProgressBar
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../contexts/AuthContext';
// Import our design system
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/DesignSystem';

// Define the navigation type
type RootStackParamList = {
  ProfileSetup: undefined;
  Journal: undefined;
  JournalHistory: undefined;
  Settings: undefined;
};

// Define emergency contact type
interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

// Define crisis resource type
interface CrisisResource {
  id: string;
  name: string;
  description: string;
  phone: string;
  website?: string;
}

// UK crisis resources
const ukCrisisResources: CrisisResource[] = [
  {
    id: '1',
    name: 'Samaritans',
    description: 'Confidential support for people experiencing feelings of distress or despair',
    phone: '116 123',
    website: 'https://www.samaritans.org'
  },
  {
    id: '2',
    name: 'Mind',
    description: 'Mental health charity offering information and advice',
    phone: '0300 123 3393',
    website: 'https://www.mind.org.uk'
  },
  {
    id: '3',
    name: 'NHS Mental Health Crisis Line',
    description: 'Urgent mental health support',
    phone: '111, option 2',
    website: 'https://www.nhs.uk/mental-health/'
  },
  {
    id: '4',
    name: 'CALM (Campaign Against Living Miserably)',
    description: 'Support for men in the UK who are down or in crisis',
    phone: '0800 58 58 58',
    website: 'https://www.thecalmzone.net'
  },
  {
    id: '5',
    name: 'Shout',
    description: 'UK\'s first 24/7 text service for anyone in crisis',
    phone: 'Text SHOUT to 85258',
    website: 'https://giveusashout.org'
  }
];

type NavigationProp = StackNavigationProp<RootStackParamList, 'ProfileSetup'>;

// Mock data for progress tracking
const moodData = [
  { day: 'Mon', mood: 3 },
  { day: 'Tue', mood: 4 },
  { day: 'Wed', mood: 2 },
  { day: 'Thu', mood: 5 },
  { day: 'Fri', mood: 3 },
  { day: 'Sat', mood: 4 },
  { day: 'Sun', mood: 4 },
];

const ProfileScreen = () => {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [journalEntryCount, setJournalEntryCount] = useState(0);
  const [lastJournalDate, setLastJournalDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'settings'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 80],
    extrapolate: 'clamp',
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });
  
  const contentOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0.7, 1],
    extrapolate: 'clamp',
  });
  
  // Analytics data
  const [weeklyMoodData, setWeeklyMoodData] = useState(moodData);
  const [practiceStats, setPracticeStats] = useState({
    sessions: 12,
    streak: 5,
    practices: 8,
    minutesTotal: 240,
    completionRate: 0.78,
  });
  
  // Emergency contacts state
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelationship, setContactRelationship] = useState('');

  // Add state for collapsible crisis resources
  const [crisisResourcesExpanded, setCrisisResourcesExpanded] = useState(false);

  // Add state for collapsible emergency contacts
  const [emergencyContactsExpanded, setEmergencyContactsExpanded] = useState(true);
  
  // Load journal data
  useEffect(() => {
    const loadJournalData = async () => {
      try {
        const entriesJson = await SecureStore.getItemAsync('journalEntries');
        if (entriesJson) {
          const entries = JSON.parse(entriesJson);
          setJournalEntryCount(entries.length);
          
          if (entries.length > 0) {
            // Sort entries by date (newest first)
            entries.sort((a: any, b: any) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setLastJournalDate(entries[0].date);
          }
        }
      } catch (error) {
        console.error('Error loading journal data:', error);
      }
    };

    loadJournalData();
    loadEmergencyContacts();
  }, []);

  // Load emergency contacts
  const loadEmergencyContacts = async () => {
    try {
      const contactsJson = await SecureStore.getItemAsync('emergencyContacts');
      if (contactsJson) {
        const contacts = JSON.parse(contactsJson);
        setEmergencyContacts(contacts);
      }
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  };

  // Save emergency contacts
  const saveEmergencyContacts = async (contacts: EmergencyContact[]) => {
    try {
      await SecureStore.setItemAsync('emergencyContacts', JSON.stringify(contacts));
    } catch (error) {
      console.error('Error saving emergency contacts:', error);
    }
  };

  // Add or update emergency contact
  const addOrUpdateContact = () => {
    if (!contactName || !contactPhone) {
      Alert.alert('Missing Information', 'Please provide both name and phone number.');
      return;
    }

    let updatedContacts: EmergencyContact[];

    if (editingContact) {
      // Update existing contact
      updatedContacts = emergencyContacts.map(contact => 
        contact.id === editingContact.id 
          ? { ...contact, name: contactName, phone: contactPhone, relationship: contactRelationship }
          : contact
      );
    } else {
      // Add new contact
      const newContact: EmergencyContact = {
        id: Date.now().toString(),
        name: contactName,
        phone: contactPhone,
        relationship: contactRelationship
      };
      updatedContacts = [...emergencyContacts, newContact];
    }

    setEmergencyContacts(updatedContacts);
    saveEmergencyContacts(updatedContacts);
    closeContactDialog();
  };

  // Delete emergency contact
  const deleteContact = (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedContacts = emergencyContacts.filter(contact => contact.id !== id);
            setEmergencyContacts(updatedContacts);
            saveEmergencyContacts(updatedContacts);
          }
        }
      ]
    );
  };

  // Open contact dialog for adding new contact
  const openAddContactDialog = () => {
    setEditingContact(null);
    setContactName('');
    setContactPhone('');
    setContactRelationship('');
    setShowContactDialog(true);
  };

  // Open contact dialog for editing existing contact
  const openEditContactDialog = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactName(contact.name);
    setContactPhone(contact.phone);
    setContactRelationship(contact.relationship);
    setShowContactDialog(true);
  };

  // Close contact dialog
  const closeContactDialog = () => {
    setShowContactDialog(false);
    setEditingContact(null);
    setContactName('');
    setContactPhone('');
    setContactRelationship('');
  };

  // Call emergency contact
  const callContact = (phone: string) => {
    Alert.alert(
      'Call Emergency Contact',
      `Are you sure you want to call ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            const phoneNumber = phone.replace(/[^\d+]/g, ''); // Remove non-numeric characters except +
            const phoneUrl = Platform.OS === 'android' ? `tel:${phoneNumber}` : `telprompt:${phoneNumber}`;
            
            Linking.canOpenURL(phoneUrl)
              .then(supported => {
                if (supported) {
                  return Linking.openURL(phoneUrl);
                } else {
                  Alert.alert('Phone Call Not Supported', 'Your device does not support making phone calls.');
                }
              })
              .catch(error => {
                console.error('Error making phone call:', error);
                Alert.alert('Error', 'Could not make the phone call. Please try again.');
              });
          }
        }
      ]
    );
  };

  // Open website
  const openWebsite = (url?: string) => {
    if (!url) return;
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Cannot Open Website', 'Unable to open the website. Please check the URL.');
        }
      })
      .catch(error => {
        console.error('Error opening website:', error);
        Alert.alert('Error', 'Could not open the website. Please try again.');
      });
  };

  // Function to navigate to profile setup
  const navigateToProfileSetup = () => {
    navigation.navigate('ProfileSetup');
  };

  // Function to navigate to journal
  const navigateToJournal = () => {
    navigation.navigate('Journal');
  };

  // Function to navigate to journal history
  const navigateToJournalHistory = () => {
    navigation.navigate('JournalHistory');
  };

  // Function to render mood graph
  const renderMoodGraph = () => {
    const maxMood = 5;
    
    return (
      <View style={styles.moodGraph}>
        <View style={styles.moodBars}>
          {moodData.map((data, index) => (
            <View key={index} style={styles.moodBarContainer}>
              <View 
                style={[
                  styles.moodBar, 
                  { 
                    height: `${(data.mood / maxMood) * 100}%`,
                    backgroundColor: getMoodColor(data.mood),
                  }
                ]} 
              />
              <Text style={styles.moodDay}>{data.day}</Text>
            </View>
          ))}
        </View>
        <View style={styles.moodLabels}>
          <Text style={styles.moodLabel}>Peaceful</Text>
          <Text style={styles.moodLabel}>Content</Text>
          <Text style={styles.moodLabel}>Neutral</Text>
          <Text style={styles.moodLabel}>Unsettled</Text>
          <Text style={styles.moodLabel}>Distressed</Text>
        </View>
      </View>
    );
  };

  // Function to get color based on mood value
  const getMoodColor = (mood: number) => {
    const colors = [
      '#D08B8B', // Distressed - Soft rose
      '#E6C79C', // Unsettled - Soft amber
      '#B8D8D8', // Neutral - Soft teal
      '#A7C5BD', // Content - Sage
      '#7B9E89', // Peaceful - Deep sage
    ];
    return colors[mood - 1] || colors[2];
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Render crisis resources section
  const renderCrisisResourcesSection = () => {
    return (
      <Card style={[styles.card, styles.crisisCard]}>
        <Card.Content>
          <TouchableOpacity 
            style={styles.cardHeader} 
            onPress={() => setCrisisResourcesExpanded(!crisisResourcesExpanded)}
          >
            <Title style={styles.crisisTitle}>UK Crisis Resources</Title>
            <View style={styles.headerRight}>
              <MaterialCommunityIcons name="lifebuoy" size={24} color={COLORS.HOPEFUL_CORAL} style={{marginRight: 8}} />
              <MaterialCommunityIcons 
                name={crisisResourcesExpanded ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={COLORS.DEEP_REFLECTION} 
              />
            </View>
          </TouchableOpacity>
          
          {crisisResourcesExpanded ? (
            <>
              <Paragraph style={styles.crisisDescription}>
                If you're in crisis or need immediate support:
              </Paragraph>
              
              <View style={styles.resourcesList}>
                {ukCrisisResources.map(resource => (
                  <View key={resource.id} style={styles.resourceItem}>
                    <View style={styles.resourceHeader}>
                      <Text style={styles.resourceName}>{resource.name}</Text>
                      <View style={styles.resourceActions}>
                        {resource.website && (
                          <IconButton 
                            icon="web" 
                            size={18} 
                            iconColor={COLORS.SERENITY_BLUE}
                            onPress={() => openWebsite(resource.website)}
                            style={styles.resourceButton}
                          />
                        )}
                        <IconButton 
                          icon="phone" 
                          size={18} 
                          iconColor={COLORS.MINDFUL_MINT}
                          onPress={() => callContact(resource.phone)}
                          style={styles.resourceButton}
                        />
                      </View>
                    </View>
                    <Text style={styles.resourcePhone}>{resource.phone}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.emergencyNote}>
                <MaterialCommunityIcons name="alert" size={18} color={COLORS.HOPEFUL_CORAL} />
                <Text style={styles.emergencyNoteText}>
                  In case of immediate danger, call 999
                </Text>
              </View>
            </>
          ) : (
            <Paragraph style={styles.crisisDescription}>
              Tap to view crisis helplines and resources
            </Paragraph>
          )}
        </Card.Content>
      </Card>
    );
  };

  // Render emergency contacts section
  const renderEmergencyContactsSection = () => {
    return (
      <Card style={[styles.card, styles.emergencyCard]}>
        <Card.Content>
          <TouchableOpacity 
            style={styles.cardHeader} 
            onPress={() => setEmergencyContactsExpanded(!emergencyContactsExpanded)}
          >
            <Title style={styles.emergencyTitle}>Personal Emergency Contacts</Title>
            <View style={styles.headerRight}>
              <IconButton 
                icon="plus" 
                size={20} 
                onPress={openAddContactDialog}
                iconColor={COLORS.HOPEFUL_CORAL}
                style={styles.resourceButton}
              />
              <MaterialCommunityIcons 
                name={emergencyContactsExpanded ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={COLORS.DEEP_REFLECTION} 
              />
            </View>
          </TouchableOpacity>
          
          {emergencyContactsExpanded && (
            <>
              <Paragraph style={styles.emergencyDescription}>
                Add contacts you can reach out to during a crisis
              </Paragraph>
              
              {emergencyContacts.length === 0 ? (
                <View style={styles.emptyContactsContainer}>
                  <MaterialCommunityIcons name="account-multiple-plus" size={48} color={COLORS.SERENITY_BLUE} />
                  <Text style={styles.emptyContactsText}>No emergency contacts added yet</Text>
                </View>
              ) : (
                <View style={styles.contactsList}>
                  {emergencyContacts.map(contact => (
                    <View key={contact.id} style={styles.contactItem}>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{contact.name}</Text>
                        <Text style={styles.contactDetails}>{contact.relationship} • {contact.phone}</Text>
                      </View>
                      <View style={styles.contactActions}>
                        <IconButton 
                          icon="phone" 
                          size={20} 
                          onPress={() => callContact(contact.phone)}
                          iconColor={COLORS.MINDFUL_MINT}
                          style={styles.resourceButton}
                        />
                        <IconButton 
                          icon="pencil" 
                          size={20} 
                          onPress={() => openEditContactDialog(contact)}
                          iconColor={COLORS.SERENITY_BLUE}
                          style={styles.resourceButton}
                        />
                        <IconButton 
                          icon="delete" 
                          size={20} 
                          onPress={() => deleteContact(contact.id)}
                          iconColor={COLORS.HOPEFUL_CORAL}
                          style={styles.resourceButton}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </Card.Content>
      </Card>
    );
  };

  // Render overview tab content
  const renderOverviewTab = () => {
    return (
      <View style={styles.tabContent}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={navigateToJournal}
          >
            <Surface style={styles.quickActionIcon}>
              <MaterialCommunityIcons name="pencil-plus" size={24} color={COLORS.WHITE} />
            </Surface>
            <Text style={styles.quickActionText}>New Journal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={navigateToJournalHistory}
          >
            <Surface style={styles.quickActionIcon}>
              <MaterialCommunityIcons name="history" size={24} color={COLORS.WHITE} />
              {journalEntryCount > 0 && (
                <Badge style={styles.badge}>{journalEntryCount}</Badge>
              )}
            </Surface>
            <Text style={styles.quickActionText}>Journal History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={navigateToProfileSetup}
          >
            <Surface style={styles.quickActionIcon}>
              <MaterialCommunityIcons name="account-edit" size={24} color={COLORS.WHITE} />
            </Surface>
            <Text style={styles.quickActionText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Contacts Section */}
        {renderEmergencyContactsSection()}

        {/* Journal Status Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Title style={{ color: COLORS.DEEP_REFLECTION }}>Mental State Journal</Title>
              <IconButton 
                icon="arrow-right" 
                size={20} 
                onPress={navigateToJournalHistory}
                iconColor={COLORS.SERENITY_BLUE}
              />
            </View>
            
            <View style={styles.journalStatus}>
              <View style={styles.journalStatusItem}>
                <Text style={[styles.journalStatusLabel, { color: COLORS.DEEP_REFLECTION }]}>Total Entries</Text>
                <Text style={[styles.journalStatusValue, { color: COLORS.SERENITY_BLUE }]}>
                  {journalEntryCount}
                </Text>
              </View>
              
              <View style={styles.journalStatusItem}>
                <Text style={[styles.journalStatusLabel, { color: COLORS.DEEP_REFLECTION }]}>Last Entry</Text>
                <Text style={[styles.journalStatusValue, { color: COLORS.DEEP_REFLECTION }]}>
                  {formatDate(lastJournalDate)}
                </Text>
              </View>
            </View>
            
            <Button 
              mode="contained" 
              onPress={navigateToJournal}
              style={[styles.journalButton, { backgroundColor: COLORS.SERENITY_BLUE }]}
              icon="pencil"
            >
              New Journal Entry
            </Button>
          </Card.Content>
        </Card>

        {/* Crisis Resources Section */}
        {renderCrisisResourcesSection()}
      </View>
    );
  };

  // Render analytics tab content
  const renderAnalyticsTab = () => {
    return (
      <View style={styles.tabContent}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Title style={{ color: COLORS.DEEP_REFLECTION }}>Mindfulness Journey</Title>
              <IconButton 
                icon="information-outline" 
                size={20} 
                onPress={() => {}}
                iconColor={COLORS.SERENITY_BLUE}
              />
            </View>
            <Paragraph style={{ color: COLORS.DEEP_REFLECTION, opacity: 0.7, marginBottom: SPACING.SMALL }}>
              Track your emotional landscape this week
            </Paragraph>
            {renderMoodGraph()}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={{ color: COLORS.DEEP_REFLECTION }}>Practice Insights</Title>
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: COLORS.SERENITY_BLUE }]}>{practiceStats.sessions}</Text>
                <Text style={[styles.statLabel, { color: COLORS.DEEP_REFLECTION }]}>Sessions</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: COLORS.SERENITY_BLUE }]}>{practiceStats.streak}</Text>
                <Text style={[styles.statLabel, { color: COLORS.DEEP_REFLECTION }]}>Day Streak</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: COLORS.SERENITY_BLUE }]}>{practiceStats.practices}</Text>
                <Text style={[styles.statLabel, { color: COLORS.DEEP_REFLECTION }]}>Practices</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={{ color: COLORS.DEEP_REFLECTION }}>Completion Rate</Title>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{Math.round(practiceStats.completionRate * 100)}%</Text>
              <ProgressBar 
                progress={practiceStats.completionRate} 
                color={COLORS.SERENITY_BLUE} 
                style={styles.progressBar} 
              />
              <Text style={styles.progressLabel}>Practice Completion</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={{ color: COLORS.DEEP_REFLECTION }}>Total Mindfulness Time</Title>
            <View style={styles.timeContainer}>
              <Text style={styles.timeValue}>{practiceStats.minutesTotal}</Text>
              <Text style={styles.timeLabel}>minutes</Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  // Render settings tab content
  const renderSettingsTab = () => {
    return (
      <View style={styles.tabContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Preferences</Title>
            <List.Item
              title="Mindfulness Reminders"
              description="Receive gentle daily reminders"
              left={props => <List.Icon {...props} icon="bell-outline" />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  color={theme.colors.primary}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Night Mode"
              description="Use softer colors in the evening"
              left={props => <List.Icon {...props} icon="weather-night" />}
              right={() => (
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  color={theme.colors.primary}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Privacy Settings"
              description="Manage your data and privacy"
              left={props => <List.Icon {...props} icon="shield-account" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
            <Divider />
            <List.Item
              title="About This App"
              description="Learn more about our approach"
              left={props => <List.Icon {...props} icon="information" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
          </Card.Content>
        </Card>

        <Button 
          mode="outlined" 
          onPress={signOut}
          style={[styles.signOutButton, { borderColor: theme.colors.primary }]}
          color={theme.colors.primary}
          icon="logout"
        >
          Sign Out
        </Button>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[
        styles.animatedHeader,
        { 
          height: headerHeight,
          opacity: headerOpacity,
          backgroundColor: COLORS.SERENITY_BLUE 
        }
      ]}>
        <LinearGradient
          colors={[COLORS.SERENITY_BLUE, COLORS.MINDFUL_MINT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Avatar.Text 
            size={80} 
            label={user?.name?.substring(0, 2) || 'U'} 
            style={styles.avatar}
            color={COLORS.DEEP_REFLECTION}
          />
          <Title 
            style={styles.name}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {user?.name || 'User'}
          </Title>
          <Paragraph 
            style={styles.email}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {user?.email || 'user@example.com'}
          </Paragraph>
        </LinearGradient>
      </Animated.View>
      
      {/* Compact Header (appears when scrolling) */}
      <Animated.View style={[
        styles.compactHeader,
        { 
          opacity: contentOpacity,
          backgroundColor: COLORS.SERENITY_BLUE 
        }
      ]}>
        <LinearGradient
          colors={[COLORS.SERENITY_BLUE, COLORS.MINDFUL_MINT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.compactHeaderGradient}
        >
          <View style={styles.compactHeaderContent}>
            <Avatar.Text 
              size={40} 
              label={user?.name?.substring(0, 2) || 'U'} 
              style={styles.compactAvatar}
              color={COLORS.DEEP_REFLECTION}
            />
            <Title 
              style={styles.compactName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user?.name || 'User'}
            </Title>
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]} 
          onPress={() => setActiveTab('overview')}
        >
          <MaterialCommunityIcons 
            name="account" 
            size={24} 
            color={activeTab === 'overview' ? COLORS.SERENITY_BLUE : COLORS.DEEP_REFLECTION} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'overview' && styles.activeTabText
          ]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]} 
          onPress={() => setActiveTab('analytics')}
        >
          <MaterialCommunityIcons 
            name="chart-line" 
            size={24} 
            color={activeTab === 'analytics' ? COLORS.SERENITY_BLUE : COLORS.DEEP_REFLECTION} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'analytics' && styles.activeTabText
          ]}>
            Analytics
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]} 
          onPress={() => setActiveTab('settings')}
        >
          <MaterialCommunityIcons 
            name="cog" 
            size={24} 
            color={activeTab === 'settings' ? COLORS.SERENITY_BLUE : COLORS.DEEP_REFLECTION} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'settings' && styles.activeTabText
          ]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Main Content */}
      <Animated.ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </Animated.ScrollView>
      
      {/* Quick Action FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        color={COLORS.WHITE}
        onPress={navigateToJournal}
      />

      {/* Emergency Contact Dialog */}
      <Portal>
        <Dialog visible={showContactDialog} onDismiss={closeContactDialog}>
          <Dialog.Title>
            {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={contactName}
              onChangeText={setContactName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Relationship (optional)"
              value={contactRelationship}
              onChangeText={setContactRelationship}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeContactDialog}>Cancel</Button>
            <Button onPress={addOrUpdateContact}>
              {editingContact ? 'Update' : 'Add'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SOFT_CLOUD_GREY,
  },
  contentContainer: {
    padding: SPACING.MEDIUM,
    paddingTop: 220, // Space for the header
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerGradient: {
    flex: 1,
    padding: SPACING.LARGE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SERENITY_BLUE,
  },
  avatar: {
    marginBottom: SPACING.MEDIUM,
    backgroundColor: COLORS.MINDFUL_MINT,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    textAlign: 'center',
    paddingHorizontal: SPACING.SMALL,
    width: '100%',
  },
  email: {
    opacity: 0.7,
    color: COLORS.WHITE,
    textAlign: 'center',
    fontSize: 14,
    paddingHorizontal: SPACING.SMALL,
    width: '100%',
  },
  compactHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    height: 80,
  },
  compactHeaderGradient: {
    flex: 1,
    padding: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SERENITY_BLUE,
  },
  compactHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactAvatar: {
    marginRight: SPACING.SMALL,
    backgroundColor: COLORS.MINDFUL_MINT,
  },
  compactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.WHITE,
    paddingVertical: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 80, // Height of compact header
  },
  tab: {
    alignItems: 'center',
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.SERENITY_BLUE,
  },
  tabText: {
    fontSize: SPACING.SMALL,
    textAlign: 'center',
    color: COLORS.DEEP_REFLECTION,
    marginTop: 4,
  },
  activeTabText: {
    fontWeight: 'bold',
    color: COLORS.SERENITY_BLUE,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    paddingBottom: SPACING.XXLARGE,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.LARGE,
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    ...SHADOWS.SMALL,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.XSMALL,
    elevation: 4,
    backgroundColor: COLORS.SERENITY_BLUE,
  },
  quickActionText: {
    fontSize: SPACING.SMALL,
    textAlign: 'center',
    color: COLORS.DEEP_REFLECTION,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.HOPEFUL_CORAL,
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: SPACING.MEDIUM,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.SERENITY_BLUE,
    marginBottom: SPACING.SMALL,
  },
  progressBar: {
    height: 12,
    width: '100%',
    borderRadius: 6,
    marginBottom: SPACING.SMALL,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.DEEP_REFLECTION,
  },
  timeContainer: {
    alignItems: 'center',
    marginTop: SPACING.MEDIUM,
  },
  timeValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.SERENITY_BLUE,
  },
  timeLabel: {
    fontSize: 16,
    color: COLORS.DEEP_REFLECTION,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: COLORS.SERENITY_BLUE,
  },
  card: {
    marginBottom: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    ...SHADOWS.SMALL,
    backgroundColor: COLORS.WHITE,
  },
  emergencyCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.HOPEFUL_CORAL,
  },
  emergencyTitle: {
    color: COLORS.HOPEFUL_CORAL,
  },
  emergencyDescription: {
    marginBottom: SPACING.MEDIUM,
    color: COLORS.DEEP_REFLECTION,
  },
  crisisCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.HOPEFUL_CORAL,
  },
  crisisTitle: {
    color: COLORS.HOPEFUL_CORAL,
  },
  crisisDescription: {
    marginBottom: SPACING.MEDIUM,
    color: COLORS.DEEP_REFLECTION,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.XSMALL,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContactsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.LARGE,
  },
  emptyContactsText: {
    marginTop: SPACING.SMALL,
    color: COLORS.DEEP_REFLECTION,
    opacity: 0.7,
  },
  contactsList: {
    marginTop: SPACING.SMALL,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.SMALL,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SOFT_CLOUD_GREY,
    marginBottom: SPACING.XSMALL,
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.SMALL,
    ...SHADOWS.SMALL,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.DEEP_REFLECTION,
  },
  contactDetails: {
    fontSize: 13,
    color: COLORS.DEEP_REFLECTION,
    opacity: 0.7,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourcesList: {
    marginTop: SPACING.SMALL,
  },
  resourceItem: {
    padding: SPACING.SMALL,
    backgroundColor: COLORS.SOFT_CLOUD_GREY,
    borderRadius: BORDER_RADIUS.SMALL,
    marginBottom: SPACING.XSMALL,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.HOPEFUL_CORAL,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resourceName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.DEEP_REFLECTION,
    flex: 1,
  },
  resourcePhone: {
    fontSize: 13,
    color: COLORS.DEEP_REFLECTION,
    opacity: 0.8,
    marginTop: 2,
    marginLeft: 2,
  },
  resourceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceButton: {
    margin: 0,
    width: 28,
    height: 28,
  },
  emergencyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SOFT_CLOUD_GREY,
    padding: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.SMALL,
    marginTop: SPACING.SMALL,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.HOPEFUL_CORAL,
  },
  emergencyNoteText: {
    fontSize: 13,
    color: COLORS.DEEP_REFLECTION,
    marginLeft: SPACING.XSMALL,
    flex: 1,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  journalStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  journalStatusItem: {
    alignItems: 'center',
  },
  journalStatusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  journalStatusValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  journalButton: {
    borderRadius: 8,
    marginTop: 8,
  },
  moodGraph: {
    height: 200,
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8,
  },
  moodBars: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  moodBarContainer: {
    alignItems: 'center',
    width: 30,
  },
  moodBar: {
    width: 20,
    borderRadius: 10,
  },
  moodDay: {
    marginTop: 4,
    fontSize: 12,
  },
  moodLabels: {
    width: 80,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  moodLabel: {
    fontSize: 10,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  setupButton: {
    marginTop: 16,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  signOutButton: {
    marginBottom: 32,
    borderRadius: 8,
  },
});

export default ProfileScreen; 
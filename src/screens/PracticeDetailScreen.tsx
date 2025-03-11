import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, KeyboardAvoidingView, Platform, TextInput as RNTextInput, Alert } from 'react-native';
import { Text, Title, Paragraph, IconButton, Surface, Divider, TextInput, Button, Card, DataTable } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  
  // State for uncertainty box
  const [uncertaintyText, setUncertaintyText] = useState('');
  const [hasLetGo, setHasLetGo] = useState(false);
  
  // State for acceptance goals table
  const [situation, setSituation] = useState('');
  const [emotionalResponse, setEmotionalResponse] = useState('');
  const [acceptanceGoal, setAcceptanceGoal] = useState('');
  const [observations, setObservations] = useState('');
  const [tableDate, setTableDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
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
      
      // Show confirmation to user
      Alert.alert(
        "Added to Journal",
        "Your practice notes have been added to your journal history.",
        [{ text: "OK" }]
      );
      
      setTimeout(() => {
        setSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving notes:', error);
      setSaving(false);
      
      // Show error message
      Alert.alert(
        "Error",
        "Failed to add notes to journal. Please try again.",
        [{ text: "OK" }]
      );
    }
  };
  
  // Save acceptance goals to journal
  const saveAcceptanceGoals = async () => {
    try {
      if (!situation.trim() || !emotionalResponse.trim() || !acceptanceGoal.trim()) {
        Alert.alert('Incomplete Entry', 'Please fill in at least the Situation, Emotional Response, and Acceptance Goal fields.');
        return;
      }
      
      setSaving(true);
      
      // Format the table data as a structured note
      const formattedNotes = `# Acceptance Journal Entry\n\n` +
        `**Date:** ${tableDate}\n\n` +
        `**Situation or Thought:** ${situation}\n\n` +
        `**Emotional Response:** ${emotionalResponse}\n\n` +
        `**Acceptance Goal:** ${acceptanceGoal}\n\n` +
        `**Notes & Observations:** ${observations || 'None'}\n\n` +
        `---\n\n` +
        `Remember to regularly revisit this journal, noting any shifts in your emotional responses, and adjust your goals accordingly.`;
      
      setNotes(formattedNotes);
      
      // Save to AsyncStorage for reference
      await AsyncStorage.setItem(`acceptance_goals_${id}_${Date.now()}`, JSON.stringify({
        date: tableDate,
        situation,
        emotionalResponse,
        acceptanceGoal,
        observations
      }));
      
      // Add to journal
      await addToJournal(formattedNotes);
      
      // Show success message
      Alert.alert(
        "Saved to Journal",
        "Your acceptance goals have been added to your journal history.",
        [{ text: "OK" }]
      );
      
      // Reset form
      setSituation('');
      setEmotionalResponse('');
      setAcceptanceGoal('');
      setObservations('');
      setTableDate(format(new Date(), 'yyyy-MM-dd'));
      
      setSaving(false);
    } catch (error) {
      console.error('Error saving acceptance goals:', error);
      setSaving(false);
      Alert.alert('Error', 'Failed to save your acceptance goals. Please try again.');
    }
  };
  
  // Modified addToJournal to accept custom notes
  const addToJournal = async (customNotes = '') => {
    try {
      const notesToSave = customNotes || notes;
      if (!notesToSave.trim()) return; // Don't add empty notes
      
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
          notes: notesToSave,
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
            notes: notesToSave,
            timestamp: currentDate.toISOString()
          }
        };
        
        entries.push(newEntry);
      }
      
      // Save updated entries
      await SecureStore.setItemAsync('journalEntries', JSON.stringify(entries));
      
    } catch (error) {
      console.error('Error adding to journal:', error);
      throw error;
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

  // Handle letting go of uncertainty
  const handleLetGo = () => {
    if (uncertaintyText.trim() === '') {
      Alert.alert('Empty Uncertainty', 'Please write down your uncertainty before letting it go.');
      return;
    }
    
    setHasLetGo(true);
    setTimeout(() => {
      setUncertaintyText('');
      setHasLetGo(false);
    }, 3000);
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
        
        {/* Uncertainty Box (only for id '5') */}
        {id === '5' && (
          <Card style={styles.uncertaintyBox}>
            <Card.Content>
              <View style={styles.uncertaintyHeader}>
                <MaterialCommunityIcons name="package-variant-closed" size={24} color={getCategoryColor()} />
                <Text style={styles.uncertaintyTitle}>Your Uncertainty Box</Text>
              </View>
              
              <Divider style={styles.uncertaintyDivider} />
              
              {hasLetGo ? (
                <View style={styles.letGoContainer}>
                  <MaterialCommunityIcons name="check-circle-outline" size={48} color={getCategoryColor()} />
                  <Text style={styles.letGoText}>You've let that go</Text>
                  <Text style={styles.letGoSubtext}>Your uncertainty has been placed in the box</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.uncertaintyPrompt}>
                    Write down an uncertain thought or situation causing you anxiety:
                  </Text>
                  
                  <TextInput
                    style={styles.uncertaintyInput}
                    multiline
                    mode="outlined"
                    placeholder="I'm uncertain about..."
                    value={uncertaintyText}
                    onChangeText={setUncertaintyText}
                    outlineColor="rgba(0, 0, 0, 0.2)"
                    activeOutlineColor={getCategoryColor()}
                    theme={{ colors: { background: '#fff' } }}
                  />
                  
                  <Button 
                    mode="contained" 
                    onPress={handleLetGo} 
                    style={[styles.letGoButton, { backgroundColor: getCategoryColor() }]}
                  >
                    Place in Uncertainty Box
                  </Button>
                </>
              )}
            </Card.Content>
          </Card>
        )}
        
        {/* Acceptance Goals Table (only for id '6') */}
        {id === '6' && (
          <Card style={styles.acceptanceGoalsCard}>
            <Card.Content>
              <View style={styles.acceptanceHeader}>
                <MaterialCommunityIcons name="notebook-outline" size={24} color={getCategoryColor()} />
                <Text style={styles.acceptanceTitle}>Your Acceptance Journal</Text>
              </View>
              
              <Divider style={styles.acceptanceDivider} />
              
              <Text style={styles.acceptancePrompt}>
                Fill in the table below to document your acceptance practice:
              </Text>
              
              <DataTable style={styles.dataTable}>
                <DataTable.Header>
                  <DataTable.Title>Field</DataTable.Title>
                  <DataTable.Title>Your Entry</DataTable.Title>
                </DataTable.Header>
                
                <DataTable.Row>
                  <DataTable.Cell>Date</DataTable.Cell>
                  <DataTable.Cell>
                    <TextInput
                      style={styles.tableInput}
                      mode="outlined"
                      value={tableDate}
                      onChangeText={setTableDate}
                      outlineColor="rgba(0, 0, 0, 0.2)"
                      activeOutlineColor={getCategoryColor()}
                      theme={{ colors: { background: '#fff' } }}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
                
                <DataTable.Row>
                  <DataTable.Cell>Situation or Thought</DataTable.Cell>
                  <DataTable.Cell>
                    <TextInput
                      style={styles.tableInput}
                      mode="outlined"
                      placeholder="Describe the situation..."
                      value={situation}
                      onChangeText={setSituation}
                      outlineColor="rgba(0, 0, 0, 0.2)"
                      activeOutlineColor={getCategoryColor()}
                      theme={{ colors: { background: '#fff' } }}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
                
                <DataTable.Row>
                  <DataTable.Cell>Emotional Response</DataTable.Cell>
                  <DataTable.Cell>
                    <TextInput
                      style={styles.tableInput}
                      mode="outlined"
                      placeholder="How did you feel?"
                      value={emotionalResponse}
                      onChangeText={setEmotionalResponse}
                      outlineColor="rgba(0, 0, 0, 0.2)"
                      activeOutlineColor={getCategoryColor()}
                      theme={{ colors: { background: '#fff' } }}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
                
                <DataTable.Row>
                  <DataTable.Cell>Acceptance Goal</DataTable.Cell>
                  <DataTable.Cell>
                    <TextInput
                      style={styles.tableInput}
                      mode="outlined"
                      placeholder="What's your goal?"
                      value={acceptanceGoal}
                      onChangeText={setAcceptanceGoal}
                      outlineColor="rgba(0, 0, 0, 0.2)"
                      activeOutlineColor={getCategoryColor()}
                      theme={{ colors: { background: '#fff' } }}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
                
                <DataTable.Row>
                  <DataTable.Cell>Notes & Observations</DataTable.Cell>
                  <DataTable.Cell>
                    <TextInput
                      style={[styles.tableInput, styles.observationsInput]}
                      mode="outlined"
                      placeholder="Additional notes..."
                      multiline
                      numberOfLines={3}
                      value={observations}
                      onChangeText={setObservations}
                      outlineColor="rgba(0, 0, 0, 0.2)"
                      activeOutlineColor={getCategoryColor()}
                      theme={{ colors: { background: '#fff' } }}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
              </DataTable>
              
              <Button 
                mode="contained" 
                onPress={saveAcceptanceGoals} 
                loading={isSaving}
                disabled={isSaving}
                style={[styles.saveButton, { backgroundColor: getCategoryColor() }]}
              >
                {isSaving ? 'Saving...' : 'Save to Journal'}
              </Button>
              
              <Text style={styles.acceptanceNote}>
                Regularly revisit your journal entries to track your progress and adjust your goals as needed.
              </Text>
            </Card.Content>
          </Card>
        )}
        
        {/* Notes Section (not for id '5' or '6') */}
        {id !== '5' && id !== '6' && (
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
        )}
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
    case '2': // Engaging with Critical Thoughts
      return [
        {
          text: 'Engaging directly with your inner critic can provide valuable insights into your deeper beliefs, fears, and past experiences that influence your mindset. This exercise helps you open a meaningful dialogue with your critical inner voice, transforming self-criticism into self-understanding.'
        },
        {
          title: 'Preparation',
          text: 'Find a quiet, comfortable space where you won\'t be disturbed. Have a journal or note-taking app ready to record insights that emerge during this practice.'
        },
        {
          title: 'Step 1: Identify a Critical Thought',
          text: 'Think of a recurring critical thought or negative self-perception that you often experience. For example: "I\'m not good enough," "I always mess things up," or "I\'ll never succeed at this." Write this thought down.'
        },
        {
          title: 'Step 2: Acknowledge the Thought',
          text: 'Sit quietly with this thought for a moment. Notice any physical sensations, emotions, or additional thoughts that arise. Acknowledge the thought without judgment, simply observing its presence.'
        },
        {
          title: 'Step 3: Visualize Your Inner Critic',
          text: 'Imagine this critical thought as an entity or character seated across from you. What does it look like? What is its tone of voice? Is it reminiscent of anyone from your past? Give this inner critic a form that feels authentic to you.'
        },
        {
          title: 'Step 4: Begin the Dialogue',
          text: 'Start a gentle conversation with your inner critic, asking questions such as:\n\n• Where did this belief originate?\n\n• Whose voice does this remind me of?\n\n• What experiences have shaped this thought?\n\n• How might this criticism be trying to protect or help me?\n\n• What are you afraid would happen if you stopped criticizing me?'
        },
        {
          title: 'Step 5: Listen Openly',
          text: 'Allow answers to emerge naturally, without censoring your intuitive responses. Write down what comes up, even if it surprises you. Listen with curiosity rather than defensiveness.'
        },
        {
          title: 'Step 6: Identify Patterns',
          text: 'Note any recurring themes or patterns revealed through this dialogue. Look for connections between your current self-criticism and past experiences or relationships.'
        },
        {
          title: 'Example',
          text: 'If you often think, "I am a burden to others," this belief might trace back to childhood experiences of feeling unsupported or rejected. Perhaps you learned to minimize your needs to maintain relationships. Your inner critic might be trying to protect you from rejection by encouraging you to withdraw or avoid asking for help.'
        },
        {
          title: 'Benefits',
          text: 'This practice helps you:\n\n• Develop self-compassion by understanding the origins of your self-criticism\n\n• Recognize that critical thoughts often stem from past experiences, not present reality\n\n• Transform your relationship with your inner critic from adversarial to collaborative\n\n• Create space for new, more supportive self-talk patterns'
        }
      ];
    case '4': // Practicing Loving Detachment
      return [
        {
          text: 'Loving detachment helps you maintain emotional balance by gently releasing attachments and expectations around situations or relationships. This guided visualization practice helps you cultivate a sense of loving detachment, allowing you to care deeply while releasing the need to control outcomes.'
        },
        {
          title: 'Preparation',
          text: 'Find a quiet, comfortable place where you won\'t be disturbed for at least 10-15 minutes. Sit or lie down in a position that allows you to be both relaxed and alert.'
        },
        {
          title: 'Step 1: Ground Yourself',
          text: 'Take a few deep, calming breaths. Inhale slowly through your nose for a count of four, hold briefly, then exhale through your mouth for a count of six. Feel your body becoming more relaxed with each breath.'
        },
        {
          title: 'Step 2: Identify an Attachment',
          text: 'Bring to mind a situation or relationship where you feel overly emotionally attached or where you\'re struggling to let go of control. This could be a relationship, a work situation, a personal goal, or any circumstance where your emotional investment feels heavy or burdensome.'
        },
        {
          title: 'Step 3: Acknowledge Your Feelings',
          text: 'Notice what emotions arise as you think about this situation. Acknowledge and honor these feelings without judgment. You might silently say, "I notice I\'m feeling [emotion], and that\'s okay."'
        },
        {
          title: 'Step 4: Visualize Protective Light',
          text: 'Imagine yourself enveloped in a warm bubble or shield of protective light. This light represents love, compassion, and wisdom. Feel it surrounding you completely, creating a safe space where you can observe your attachments with gentle awareness.'
        },
        {
          title: 'Step 5: Practice an Affirmation',
          text: 'Silently or softly repeat an affirmation that resonates with you, such as:\n\n• "I release control and trust in life\'s unfolding process."\n\n• "I can care deeply without needing to control outcomes."\n\n• "I detach with love, allowing others their own journey."\n\n• "I am separate from this situation, yet connected through compassion."'
        },
        {
          title: 'Step 6: Observe Without Attachment',
          text: 'Mindfully observe your thoughts and emotions about the situation, allowing them to come and go freely without getting caught up in them. Imagine them as clouds passing through the sky of your awareness.'
        },
        {
          title: 'Step 7: Send Loving Energy',
          text: 'Send loving, positive energy toward the situation or person involved. Visualize this energy as a gentle light extending from your heart. As you do this, consciously release your attachment to specific outcomes or expectations.'
        },
        {
          title: 'Step 8: Release and Let Go',
          text: 'Focus on forgiveness, acceptance, and letting go. You might visualize yourself gently opening your hands and releasing the situation, watching it float away while maintaining a sense of love and goodwill.'
        },
        {
          title: 'Step 9: Express Gratitude',
          text: 'End this practice by expressing gratitude for the insights and emotional clarity gained. Acknowledge your own courage in practicing loving detachment.'
        },
        {
          title: 'Benefits',
          text: 'Regular practice of loving detachment can help you:\n\n• Reduce anxiety and emotional suffering\n\n• Improve relationships by respecting others\' autonomy\n\n• Increase your capacity for genuine compassion\n\n• Develop greater emotional resilience\n\n• Find peace amid life\'s uncertainties'
        }
      ];
    case '5': // Embracing Uncertainty: The Uncertainty Box
      return [
        {
          text: 'Uncertainty is inevitable in life, but learning to accept and coexist with it can bring increased peace and emotional well-being. The "Uncertainty Box" exercise helps you practice embracing uncertainty in a constructive way, giving you a symbolic method to acknowledge uncertainties without letting them control your thoughts and emotions.'
        },
        {
          title: 'What You\'ll Need',
          text: 'While this digital exercise provides a virtual uncertainty box, you might consider creating a physical one as well. For a physical practice, find a small box or container with a lid that you can keep in a private space.'
        },
        {
          title: 'Step 1: Create Space',
          text: 'Set aside quiet time free from distractions. Find a comfortable position and take a few deep breaths to center yourself.'
        },
        {
          title: 'Step 2: Identify Uncertainties',
          text: 'Think about an uncertain situation or thought that\'s causing you anxiety or concern. This could be related to your health, relationships, career, or any area of life where the outcome is unknown and causing you distress.'
        },
        {
          title: 'Step 3: Write It Down',
          text: 'In the digital uncertainty box below (or on a small piece of paper for the physical practice), write down this uncertain thought. Be specific about what you\'re uncertain about and how it makes you feel.'
        },
        {
          title: 'Step 4: Place It in the Box',
          text: 'Click the button to symbolically place your uncertainty in the box (or fold the paper and place it in your physical box). As you do this, take a deep breath and remind yourself that uncertainty is a natural part of life that everyone experiences.'
        },
        {
          title: 'Step 5: Seal the Box',
          text: 'Mentally seal the box, entrusting your uncertainty to it. This represents acknowledging that the uncertainty exists while choosing not to let it dominate your thoughts and emotions.'
        },
        {
          title: 'Step 6: Practice Redirection',
          text: 'Whenever you begin worrying about this uncertainty again, remind yourself it is safely stored in the box. Instead of ruminating, redirect your attention to what you can control in the present moment, and trust in your ability to handle whatever outcome eventually unfolds.'
        },
        {
          title: 'Step 7: Continue the Practice',
          text: 'Return to this exercise whenever new uncertainties arise that cause you distress. Over time, you\'ll build a greater capacity to live peacefully alongside the unknowns in your life.'
        },
        {
          title: 'Benefits',
          text: 'This practice helps you:\n\n• Acknowledge uncertainties without being consumed by them\n\n• Reduce anxiety about the unknown\n\n• Develop greater emotional resilience\n\n• Focus your energy on what you can control\n\n• Build trust in your ability to adapt to whatever happens'
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
    case '6': // Personal Acceptance Goals
      return [
        {
          text: 'Setting personal goals around acceptance can transform your daily life, enhancing emotional resilience and psychological flexibility. This practice helps you integrate acceptance into your routine through structured goal-setting and reflection.'
        },
        {
          title: 'Why Set Acceptance Goals?',
          text: 'Acceptance is not passive resignation but an active choice to acknowledge reality without judgment. By setting specific goals around acceptance, you create a framework for growth that can help you navigate difficult emotions, challenging situations, and uncertain outcomes with greater ease.'
        },
        {
          title: 'Step 1: Identify Areas for Growth',
          text: 'Begin by identifying areas in your life where you struggle with acceptance. These might include:\n\n• Accepting certain aspects of yourself\n\n• Accepting others\' behaviors or choices\n\n• Accepting circumstances beyond your control\n\n• Accepting past events or mistakes\n\n• Accepting uncertainty about the future'
        },
        {
          title: 'Step 2: Define Clear Goals',
          text: 'For each area you\'ve identified, define a clear, achievable goal. Effective acceptance goals are:\n\n• Specific: "I will practice accepting my body as it is today" rather than "I will accept myself"\n\n• Measurable: Include ways to track your progress\n\n• Attainable: Start with small steps that feel manageable\n\n• Relevant: Address areas that matter most to you\n\n• Time-bound: Set a timeframe for practice and review'
        },
        {
          title: 'Step 3: Develop a Practice Plan',
          text: 'Create a concrete plan detailing how you\'ll practice acceptance regularly. This might include:\n\n• Daily mindfulness practices\n\n• Specific affirmations or mantras\n\n• Journaling prompts\n\n• Visualization exercises\n\n• Conversations with a trusted friend or therapist'
        },
        {
          title: 'Step 4: Document Your Journey',
          text: 'Use the acceptance journal table below to document your experiences. For each entry, record:\n\n• The situation or thought you\'re working to accept\n\n• Your emotional response\n\n• Your specific acceptance goal\n\n• Observations about your experience practicing acceptance'
        },
        {
          title: 'Step 5: Review and Adjust',
          text: 'Regularly revisit your journal entries to notice patterns, track progress, and adjust your goals as needed. Look for:\n\n• Shifts in your emotional responses over time\n\n• Situations that consistently challenge your acceptance practice\n\n• Strategies that seem particularly helpful\n\n• Areas where you might need additional support'
        },
        {
          title: 'Benefits',
          text: 'Consistent practice with acceptance goals can help you:\n\n• Reduce emotional suffering\n\n• Increase psychological flexibility\n\n• Improve relationships\n\n• Enhance your ability to focus on what you can control\n\n• Develop greater self-compassion'
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
  uncertaintyBox: {
    marginTop: SPACING.LARGE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    ...SHADOWS.MEDIUM,
  },
  uncertaintyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  uncertaintyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: SPACING.SMALL,
    color: '#333',
  },
  uncertaintyDivider: {
    marginBottom: SPACING.MEDIUM,
  },
  uncertaintyPrompt: {
    fontSize: 16,
    marginBottom: SPACING.MEDIUM,
    color: '#333',
  },
  uncertaintyInput: {
    minHeight: 120,
    marginBottom: SPACING.MEDIUM,
    backgroundColor: '#fff',
  },
  letGoButton: {
    marginTop: SPACING.SMALL,
    marginBottom: SPACING.SMALL,
  },
  letGoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.LARGE,
  },
  letGoText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: SPACING.MEDIUM,
    color: '#333',
  },
  letGoSubtext: {
    fontSize: 14,
    marginTop: SPACING.SMALL,
    color: '#666',
    textAlign: 'center',
  },
  acceptanceGoalsCard: {
    marginTop: SPACING.LARGE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    ...SHADOWS.MEDIUM,
  },
  acceptanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  acceptanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: SPACING.SMALL,
    color: '#333',
  },
  acceptanceDivider: {
    marginBottom: SPACING.MEDIUM,
  },
  acceptancePrompt: {
    fontSize: 16,
    marginBottom: SPACING.MEDIUM,
    color: '#333',
  },
  dataTable: {
    marginBottom: SPACING.MEDIUM,
  },
  tableInput: {
    backgroundColor: '#fff',
    fontSize: 14,
    height: 40,
    width: '100%',
  },
  observationsInput: {
    minHeight: 80,
  },
  acceptanceNote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginTop: SPACING.MEDIUM,
    textAlign: 'center',
  },
});

export default PracticeDetailScreen; 
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  IconButton, 
  useTheme,
  Divider,
  ActivityIndicator,
  Portal,
  Dialog,
  Chip,
  FAB
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { format, parseISO } from 'date-fns';

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

const JournalHistoryScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showEntryDialog, setShowEntryDialog] = useState(false);

  // Load journal entries
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const entriesJson = await SecureStore.getItemAsync('journalEntries');
        if (entriesJson) {
          const entries = JSON.parse(entriesJson);
          // Sort entries by date (newest first)
          entries.sort((a: JournalEntry, b: JournalEntry) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setJournalEntries(entries);
        }
      } catch (error) {
        console.error('Error loading journal entries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'EEEE, MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Handle entry selection
  const handleEntryPress = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowEntryDialog(true);
  };

  // Navigate to new journal entry
  const handleNewEntry = () => {
    navigation.navigate('Journal' as never);
  };

  // Render entry card
  const renderEntryCard = ({ item }: { item: JournalEntry }) => {
    // Get primary emotion (first in the list)
    const primaryEmotion = item.emotions.length > 0 ? item.emotions[0] : 'No emotion recorded';
    
    // Get overall feeling
    const overallFeeling = item.overallFeeling || 'Not recorded';
    
    return (
      <TouchableOpacity onPress={() => handleEntryPress(item)}>
        <Card style={styles.entryCard}>
          <Card.Content>
            <Title style={styles.entryDate}>{formatDate(item.date)}</Title>
            
            <View style={styles.entryPreview}>
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Feeling:</Text>
                <Text style={styles.previewValue}>{primaryEmotion}</Text>
              </View>
              
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Overall:</Text>
                <Text 
                  style={[
                    styles.previewValue, 
                    { color: getOverallFeelingColor(overallFeeling) }
                  ]}
                >
                  {overallFeeling}
                </Text>
              </View>
            </View>
            
            {item.emotions.length > 0 && (
              <View style={styles.emotionsPreview}>
                {item.emotions.slice(0, 3).map((emotion, index) => (
                  <Chip 
                    key={index} 
                    style={styles.emotionChip}
                    textStyle={styles.emotionChipText}
                  >
                    {emotion}
                  </Chip>
                ))}
                {item.emotions.length > 3 && (
                  <Text style={styles.moreEmotions}>+{item.emotions.length - 3} more</Text>
                )}
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  // Get color based on overall feeling
  const getOverallFeelingColor = (feeling: string) => {
    switch (feeling) {
      case 'Amazing':
        return '#4CAF50'; // Green
      case 'Good':
        return '#8BC34A'; // Light Green
      case 'Hit & Miss':
        return '#FFC107'; // Amber
      case 'Bad':
        return '#FF9800'; // Orange
      case 'Terrible':
        return '#F44336'; // Red
      default:
        return theme.colors.text;
    }
  };

  // Render entry detail dialog
  const renderEntryDetailDialog = () => {
    if (!selectedEntry) return null;
    
    return (
      <Portal>
        <Dialog
          visible={showEntryDialog}
          onDismiss={() => setShowEntryDialog(false)}
          style={styles.detailDialog}
        >
          <Dialog.Title>{formatDate(selectedEntry.date)}</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <View style={styles.dialogContent}>
              {/* Emotions */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Emotions</Text>
                <View style={styles.emotionsContainer}>
                  {selectedEntry.emotions.length > 0 ? (
                    selectedEntry.emotions.map((emotion, index) => (
                      <Chip 
                        key={index} 
                        style={styles.detailChip}
                        textStyle={styles.detailChipText}
                      >
                        {emotion}
                      </Chip>
                    ))
                  ) : (
                    <Text style={styles.noDataText}>No emotions recorded</Text>
                  )}
                </View>
              </View>
              
              <Divider style={styles.divider} />
              
              {/* Sleep & Activity */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Sleep & Activity</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Hours of sleep:</Text>
                  <Text style={styles.detailValue}>{selectedEntry.hoursSlept || 'Not recorded'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Hours of exercise:</Text>
                  <Text style={styles.detailValue}>{selectedEntry.hoursExercise || 'Not recorded'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Hours of screen time:</Text>
                  <Text style={styles.detailValue}>{selectedEntry.screenTime || 'Not recorded'}</Text>
                </View>
              </View>
              
              <Divider style={styles.divider} />
              
              {/* Pressures */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Main Pressures or Concerns</Text>
                <View style={styles.emotionsContainer}>
                  {selectedEntry.pressures.length > 0 ? (
                    selectedEntry.pressures.map((pressure, index) => (
                      <Chip 
                        key={index} 
                        style={styles.detailChip}
                        textStyle={styles.detailChipText}
                      >
                        {pressure}
                      </Chip>
                    ))
                  ) : (
                    <Text style={styles.noDataText}>No pressures recorded</Text>
                  )}
                </View>
              </View>
              
              <Divider style={styles.divider} />
              
              {/* People Interactions */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>People You've Engaged With</Text>
                {selectedEntry.peopleInteractions.some(i => i.person || i.feeling) ? (
                  selectedEntry.peopleInteractions
                    .filter(i => i.person || i.feeling)
                    .map((interaction, index) => (
                      <View key={index} style={styles.interactionItem}>
                        <Text style={styles.interactionPerson}>{interaction.person || 'Someone'}</Text>
                        <Text style={styles.interactionFeeling}>{interaction.feeling || 'No feeling recorded'}</Text>
                      </View>
                    ))
                ) : (
                  <Text style={styles.noDataText}>No interactions recorded</Text>
                )}
              </View>
              
              <Divider style={styles.divider} />
              
              {/* Wish Said */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>What you wish you said out loud</Text>
                <Text style={styles.detailText}>
                  {selectedEntry.wishSaid || 'Nothing recorded'}
                </Text>
              </View>
              
              <Divider style={styles.divider} />
              
              {/* Best/Worst */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Reflection on Today</Text>
                <Text style={styles.detailSubtitle}>Best thing you did for yourself:</Text>
                <Text style={styles.detailText}>
                  {selectedEntry.bestThing || 'Nothing recorded'}
                </Text>
                
                <Text style={[styles.detailSubtitle, { marginTop: 12 }]}>Worst thing you did for yourself:</Text>
                <Text style={styles.detailText}>
                  {selectedEntry.worstThing || 'Nothing recorded'}
                </Text>
              </View>
              
              <Divider style={styles.divider} />
              
              {/* Overall Feeling */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Overall Feelings</Text>
                <Text 
                  style={[
                    styles.overallFeelingText, 
                    { color: getOverallFeelingColor(selectedEntry.overallFeeling) }
                  ]}
                >
                  {selectedEntry.overallFeeling || 'Not recorded'}
                </Text>
              </View>
              
              <Divider style={styles.divider} />
              
              {/* Contributing Factors */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Contributing Factors</Text>
                {Object.entries(selectedEntry.contributingFactors).map(([level, factors]) => (
                  <View key={level} style={styles.factorLevel}>
                    <Text style={styles.factorLevelTitle}>{level}</Text>
                    {factors.some(f => f) ? (
                      factors
                        .filter(f => f)
                        .map((factor, index) => (
                          <Text key={index} style={styles.factorText}>• {factor}</Text>
                        ))
                    ) : (
                      <Text style={styles.noDataText}>None recorded</Text>
                    )}
                  </View>
                ))}
              </View>
              
              <Divider style={styles.divider} />
              
              {/* Current Feeling */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>How you were feeling after journaling</Text>
                <View style={styles.emotionsContainer}>
                  {selectedEntry.currentFeeling.length > 0 ? (
                    selectedEntry.currentFeeling.map((feeling, index) => (
                      <Chip 
                        key={index} 
                        style={styles.detailChip}
                        textStyle={styles.detailChipText}
                      >
                        {feeling}
                      </Chip>
                    ))
                  ) : (
                    <Text style={styles.noDataText}>No feelings recorded</Text>
                  )}
                </View>
              </View>
              
              {/* Notes */}
              {selectedEntry.notes && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Additional Notes</Text>
                    <Text style={styles.detailText}>{selectedEntry.notes}</Text>
                  </View>
                </>
              )}
            </View>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowEntryDialog(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading journal entries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Journal History</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {journalEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No journal entries yet</Text>
          <Text style={styles.emptySubtext}>
            Start tracking your mental state by creating your first journal entry
          </Text>
          <Button 
            mode="contained" 
            onPress={handleNewEntry}
            style={styles.newEntryButton}
          >
            Create First Entry
          </Button>
        </View>
      ) : (
        <>
          <FlatList
            data={journalEntries}
            renderItem={renderEntryCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
          
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={handleNewEntry}
            label="New Entry"
          />
        </>
      )}
      
      {renderEntryDetailDialog()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  entryCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  entryDate: {
    fontSize: 18,
    marginBottom: 8,
  },
  entryPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  emotionsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  emotionChip: {
    marginRight: 8,
    marginBottom: 8,
    height: 28,
  },
  emotionChipText: {
    fontSize: 12,
  },
  moreEmotions: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  newEntryButton: {
    paddingHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  detailDialog: {
    maxHeight: '80%',
  },
  dialogScrollArea: {
    paddingHorizontal: 0,
  },
  dialogContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  detailSection: {
    marginVertical: 12,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailChip: {
    margin: 4,
  },
  detailChipText: {
    fontSize: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  interactionItem: {
    marginBottom: 12,
  },
  interactionPerson: {
    fontSize: 16,
    fontWeight: '500',
  },
  interactionFeeling: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  detailSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
  },
  overallFeelingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  factorLevel: {
    marginBottom: 12,
  },
  factorLevelTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  factorText: {
    fontSize: 14,
    marginBottom: 2,
  },
  noDataText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
  },
  divider: {
    marginVertical: 8,
  },
});

export default JournalHistoryScreen; 
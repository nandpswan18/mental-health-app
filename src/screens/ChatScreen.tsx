import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Animated, Image } from 'react-native';
import { TextInput, IconButton, Text, Surface, useTheme, Avatar, Appbar, Menu } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the navigation param list type
type MainTabParamList = {
  Home: undefined;
  Chat: undefined;
  Profile: undefined;
  Resources: undefined;
};

type MainTabNavigationProp = StackNavigationProp<MainTabParamList>;

// Message type definition
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatScreen = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MainTabNavigationProp>();
  const [message, setMessage] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello, I\'m Mindful, your AI companion. How are you feeling today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Fade in animation for new messages
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, messages]);

  // Handle back button press
  const handleBackPress = () => {
    navigation.goBack();
  };

  // Toggle menu visibility
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        text: 'Chat history cleared. How can I help you today?',
        sender: 'ai',
        timestamp: new Date(),
      },
    ]);
    setMenuVisible(false);
  };

  // Send message function
  const sendMessage = () => {
    if (message.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setMessage('');

    // Reset fade animation for next message
    fadeAnim.setValue(0);

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(message);
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    }, 1000);
  };

  // Generate AI response (mock function - would be replaced with actual AI service)
  const generateAIResponse = (userMessage: string): Message => {
    // Calming, supportive responses
    const responses = [
      "I hear you. It's important to acknowledge your feelings. Would you like to explore this further?",
      "That's completely valid. Sometimes just expressing our thoughts can help us process them. How does sharing that make you feel?",
      "Thank you for sharing that with me. Would it help to take a few deep breaths together?",
      "I'm here to support you. What would feel most nurturing for you right now?",
      "It takes courage to express your feelings. Is there a small step you could take today toward self-care?",
      "Sometimes our emotions can feel overwhelming. Remember that you don't have to face everything at once.",
      "You're doing well by checking in with yourself. What's one thing you appreciate about today?",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      id: (Date.now() + 1).toString(),
      text: randomResponse,
      sender: 'ai',
      timestamp: new Date(),
    };
  };

  // Render message item
  const renderMessageItem = ({ item, index }: { item: Message, index: number }) => {
    const isUser = item.sender === 'user';
    const isLastMessage = index === messages.length - 1;
    
    return (
      <Animated.View 
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
          isLastMessage && { opacity: fadeAnim }
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainerWrapper}>
            <Surface style={styles.avatarContainer} elevation={2}>
              <Image 
                source={{ uri: 'https://i.imgur.com/qHRpKJb.png' }}
                style={styles.avatarImage}
              />
            </Surface>
          </View>
        )}
        <View style={styles.messageBubbleWrapper}>
          <Surface 
            style={[
              styles.messageBubble,
              isUser 
                ? [styles.userBubble, { backgroundColor: '#5B7EB5' }] 
                : [styles.aiBubble, { backgroundColor: '#1A2A4A' }]
            ]} 
            elevation={1}
          >
            <Text 
              style={
                isUser 
                  ? [styles.userMessageText, { color: '#fff' }] 
                  : [styles.aiMessageText, { color: '#fff' }]
              }
            >
              {item.text}
            </Text>
            <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Surface>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#0D1B38' }]}>
      <Appbar.Header style={styles.header} statusBarHeight={insets.top}>
        <Appbar.BackAction color="white" onPress={handleBackPress} />
        <Appbar.Content title="Mindful" titleStyle={styles.headerTitle} color="white" />
        <Menu
          visible={menuVisible}
          onDismiss={toggleMenu}
          anchor={
            <Appbar.Action icon="dots-vertical" color="white" onPress={toggleMenu} />
          }
        >
          <Menu.Item onPress={clearChat} title="Clear chat" />
          <Menu.Item onPress={() => {
            setMenuVisible(false);
            navigation.navigate('Home');
          }} title="Go to home" />
        </Menu>
      </Appbar.Header>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
        
        <Surface style={styles.inputContainer} elevation={4}>
          <TextInput
            mode="outlined"
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            style={styles.input}
            outlineColor="rgba(255, 255, 255, 0.2)"
            activeOutlineColor="#5B7EB5"
            textColor="#FFFFFF"
            theme={{ colors: { background: '#1A2A4A' } }}
            right={
              <TextInput.Icon 
                icon="send" 
                onPress={sendMessage}
                color="#5B7EB5"
                style={styles.sendButton}
              />
            }
            onSubmitEditing={sendMessage}
          />
        </Surface>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1A2A4A',
    elevation: 0,
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainerWrapper: {
    marginRight: 8,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  messageBubbleWrapper: {
    maxWidth: '80%',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    borderTopRightRadius: 4,
    marginLeft: 'auto',
  },
  aiBubble: {
    borderTopLeftRadius: 4,
    marginRight: 'auto',
  },
  userMessageText: {
    fontSize: 16,
  },
  aiMessageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  aiTimestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  inputContainer: {
    padding: 8,
    backgroundColor: '#1A2A4A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    backgroundColor: '#1A2A4A',
    color: '#FFFFFF',
  },
  sendButton: {
    alignSelf: 'center',
  },
});

export default ChatScreen; 
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from 'react-native-paper';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import JournalScreen from '../screens/JournalScreen';
import JournalHistoryScreen from '../screens/JournalHistoryScreen';
import InnerPsychologyScreen from '../screens/InnerPsychologyScreen';
import PracticeDetailScreen from '../screens/PracticeDetailScreen';

// Import auth context
import { useAuth } from '../contexts/AuthContext';

// Define navigation types
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type MainTabParamList = {
  Home: undefined;
  Chat: undefined;
  Profile: undefined;
  Resources: undefined;
};

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProfileSetup: undefined;
  Journal: undefined;
  JournalHistory: undefined;
  InnerPsychology: undefined;
  PracticeDetail: {
    id: string;
    title: string;
    category: 'self-observation' | 'acceptance' | 'present-moment';
  };
};

// Create navigators
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createStackNavigator<RootStackParamList>();

// Auth navigator component
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// Main tab navigator component
const MainNavigator = () => {
  const theme = useTheme();
  
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'help-circle';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Resources') {
            iconName = focused ? 'book' : 'book-outline';
          }

          // You can return any component here
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <MainTab.Screen name="Home" component={HomeScreen} />
      <MainTab.Screen name="Chat" component={ChatScreen} />
      <MainTab.Screen name="Profile" component={ProfileScreen} />
      <MainTab.Screen name="Resources" component={ResourcesScreen} />
    </MainTab.Navigator>
  );
};

// Root navigator component
const AppNavigator = () => {
  const { user, isLoading, isProfileSetupComplete } = useAuth();
  
  if (isLoading) {
    // You could return a loading screen here
    return null;
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        !isProfileSetupComplete ? (
          <RootStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainNavigator} />
            <RootStack.Screen name="Journal" component={JournalScreen} />
            <RootStack.Screen name="JournalHistory" component={JournalHistoryScreen} />
            <RootStack.Screen name="InnerPsychology" component={InnerPsychologyScreen} />
            <RootStack.Screen name="PracticeDetail" component={PracticeDetailScreen} />
          </>
        )
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
};

export default AppNavigator; 
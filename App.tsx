import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, DefaultTheme, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import AppNavigator from './src/navigation/AppNavigator';
import AuthProvider from './src/contexts/AuthContext';
import { COLORS } from './src/styles/DesignSystem';

// Define a custom theme with the new color palette
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primary Colors
    primary: COLORS.SERENITY_BLUE, // Serenity Blue - Calming, trustworthy, reassuring
    primaryContainer: COLORS.MINDFUL_MINT, // Mindful Mint - Refreshing, healing, gentle
    
    // Accent Colors
    secondary: COLORS.HOPEFUL_CORAL, // Hopeful Coral - Warmth, optimism, emotional uplift
    secondaryContainer: COLORS.GOLDEN_GLOW, // Golden Glow - Happiness, positivity, creativity
    
    // Neutral Base
    background: COLORS.SOFT_CLOUD_GREY, // Soft Cloud Grey - Clean, uncluttered, easy on the eyes
    surface: COLORS.SOFT_CLOUD_GREY,
    onSurface: COLORS.DEEP_REFLECTION, // Deep Reflection - Professional, grounding, dependable
    
    // Other UI colors
    error: COLORS.HOPEFUL_CORAL, // Using Hopeful Coral for errors to maintain warmth
    onPrimary: COLORS.WHITE,
    onSecondary: COLORS.DEEP_REFLECTION, // Deep Reflection for text on secondary colors
    onBackground: COLORS.DEEP_REFLECTION, // Deep Reflection for text on background
    outline: COLORS.SERENITY_BLUE, // Serenity Blue for outlines
    text: COLORS.DEEP_REFLECTION, // Deep Reflection for text
  },
  roundness: 16, // Increased roundness for more organic, friendly feel
  fonts: {
    ...MD3LightTheme.fonts,
    // Using default fonts but could be customized to Poppins if available
  }
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <PaperProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
} 
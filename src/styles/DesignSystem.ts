/**
 * Design System for Mental Health App
 * 
 * This file contains the design system constants that define the visual language
 * of the application, including colors, typography, spacing, and shape styles.
 */

// Color Palette
export const COLORS = {
  // Primary Colors
  SERENITY_BLUE: '#89ABE3', // Calming, trustworthy, reassuring
  MINDFUL_MINT: '#A7D7C5', // Refreshing, healing, gentle
  
  // Accent Colors
  HOPEFUL_CORAL: '#FF8A80', // Warmth, optimism, emotional uplift
  GOLDEN_GLOW: '#FFD180', // Happiness, positivity, creativity
  
  // Neutral Base
  SOFT_CLOUD_GREY: '#F3F6FA', // Clean, uncluttered, easy on the eyes
  DEEP_REFLECTION: '#415A77', // Professional, grounding, dependable
  
  // Additional UI Colors
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  TRANSPARENT: 'transparent',
  
  // Mood Colors (for mood tracking and visualization)
  MOOD_TERRIBLE: '#FF8A80', // Hopeful Coral (repurposed)
  MOOD_BAD: '#FFAB91', // Lighter coral
  MOOD_NEUTRAL: '#FFD180', // Golden Glow
  MOOD_GOOD: '#C5E1A5', // Light green
  MOOD_GREAT: '#A7D7C5', // Mindful Mint
  
  // Darker, Calming Colors
  DEEP_SERENITY_BLUE: '#5D87C1', // Darker version of Serenity Blue
  DEEP_MINDFUL_MINT: '#7FB9A2', // Darker version of Mindful Mint
  DEEP_HOPEFUL_CORAL: '#E06C62', // Darker version of Hopeful Coral
  DEEP_GOLDEN_GLOW: '#E0B05C', // Darker version of Golden Glow
  DEEP_CLOUD_GREY: '#E1E9F5', // Slightly darker version of Soft Cloud Grey
  DEEPER_REFLECTION: '#2C3E50', // Darker, more calming version of Deep Reflection
  NIGHT_MODE_BG: '#1A2639', // Very dark blue for night mode backgrounds
  NIGHT_MODE_CARD: '#2C3E50', // Dark blue for cards in night mode
  
  // New Modern Color Palette
  MODERN_PRIMARY: '#6C63FF', // Modern purple - primary color
  MODERN_SECONDARY: '#4ECDC4', // Teal - secondary color
  MODERN_ACCENT: '#FF6B6B', // Coral red - accent color
  MODERN_HIGHLIGHT: '#FFE66D', // Soft yellow - highlight color
  MODERN_SUCCESS: '#2EC4B6', // Turquoise - success color
  MODERN_WARNING: '#FF9F1C', // Orange - warning color
  MODERN_ERROR: '#FF5252', // Red - error color
  
  // Modern Neutrals
  MODERN_BG_LIGHT: '#F7F9FC', // Very light blue-gray - background light
  MODERN_BG_DARK: '#1A1B25', // Very dark blue-gray - background dark
  MODERN_CARD_LIGHT: '#FFFFFF', // White - card light
  MODERN_CARD_DARK: '#252A34', // Dark blue-gray - card dark
  MODERN_TEXT_PRIMARY: '#2D3748', // Dark gray-blue - primary text
  MODERN_TEXT_SECONDARY: '#718096', // Medium gray-blue - secondary text
  MODERN_BORDER_LIGHT: '#E2E8F0', // Light gray - border light
  MODERN_BORDER_DARK: '#4A5568', // Dark gray - border dark
  
  // Modern Gradients (as string values for linear gradients)
  MODERN_GRADIENT_PRIMARY: 'linear-gradient(135deg, #6C63FF 0%, #4ECDC4 100%)',
  MODERN_GRADIENT_ACCENT: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
  MODERN_GRADIENT_DARK: 'linear-gradient(135deg, #252A34 0%, #1A1B25 100%)',
};

// Typography
export const TYPOGRAPHY = {
  FONT_FAMILY: {
    PRIMARY: 'System', // Default system font (would be replaced with Poppins when available)
    SECONDARY: 'System', // Would be replaced with Playfair Display when available
  },
  FONT_SIZE: {
    TINY: 10,
    SMALL: 12,
    MEDIUM: 14,
    REGULAR: 16,
    LARGE: 18,
    XLARGE: 20,
    XXLARGE: 24,
    HUGE: 32,
  },
  FONT_WEIGHT: {
    LIGHT: '300',
    REGULAR: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
  },
  LINE_HEIGHT: {
    TIGHT: 1.2,
    NORMAL: 1.5,
    LOOSE: 1.8,
  },
};

// Spacing
export const SPACING = {
  TINY: 4,
  XSMALL: 8,
  SMALL: 12,
  MEDIUM: 16,
  LARGE: 24,
  XLARGE: 32,
  XXLARGE: 48,
  HUGE: 64,
};

// Border Radius
export const BORDER_RADIUS = {
  SMALL: 8,
  MEDIUM: 16,
  LARGE: 24,
  CIRCLE: 999,
};

// Shadows
export const SHADOWS = {
  SMALL: {
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  MEDIUM: {
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  LARGE: {
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Animation Timing
export const ANIMATION = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN_OUT: 'ease-in-out',
    EASE_OUT: 'ease-out',
    EASE_IN: 'ease-in',
  },
};

// Shape Styles
export const SHAPES = {
  ROUNDED_BUTTON: {
    borderRadius: BORDER_RADIUS.CIRCLE,
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
  },
  CARD: {
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    ...SHADOWS.SMALL,
  },
  INPUT: {
    borderRadius: BORDER_RADIUS.SMALL,
    borderWidth: 1,
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
  },
};

// Z-Index
export const Z_INDEX = {
  BACKGROUND: 0,
  BASE: 1,
  ABOVE: 2,
  MODAL: 10,
  TOOLTIP: 15,
  OVERLAY: 20,
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
  SHAPES,
  Z_INDEX,
}; 
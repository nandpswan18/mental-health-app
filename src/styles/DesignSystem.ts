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
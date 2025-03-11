import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Image, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedCharacterProps {
  style?: object;
  size?: number;
}

const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({ style, size = 300 }) => {
  // Animation values
  const floatAnimation = useRef(new Animated.Value(0)).current;
  const handAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Setup floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnimation, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnimation, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Setup subtle hand movement animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(handAnimation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(handAnimation, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      // Cleanup animations
      floatAnimation.stopAnimation();
      handAnimation.stopAnimation();
    };
  }, []);

  // Calculate animations
  const translateY = floatAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  // Scale based on size prop
  const scale = size / 300;

  return (
    <View style={[styles.container, style, { width: size, height: size * 1.2 }]}>
      {/* Background gradient like Elomia */}
      <LinearGradient
        colors={['#1A2A4A', '#0D1B38']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Avatar container with floating animation */}
      <Animated.View 
        style={[
          styles.avatarContainer,
          {
            transform: [
              { translateY },
              { scale }
            ]
          }
        ]}
      >
        {/* Professional avatar image like Elomia */}
        <Image
          source={{ uri: 'https://i.imgur.com/qHRpKJb.png' }}
          style={styles.avatarImage}
          resizeMode="contain"
        />
      </Animated.View>
      
      {/* "Meet Mindful" text */}
      <View style={styles.textContainer}>
        <Text style={styles.nameText}>Mindful</Text>
        <Text style={styles.subtitleText}>Your AI Companion</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarContainer: {
    width: 300,
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: 300,
    height: 360,
  },
  textContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});

export default AnimatedCharacter; 
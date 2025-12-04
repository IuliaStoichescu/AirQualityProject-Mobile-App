// app/authLogic/_layout.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Text, Dimensions } from 'react-native';
import { Slot, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Background gradient cycles
const gradients = [
  ['#cbdbf8ff', '#ffe6e6ff'] as const,
  ['#e0f7ff', '#ffffff'] as const,
  ['#f5f3ff', '#ffffff'] as const,
  ['#fde0ecff', '#fdf0e1ff'] as const,
] as const;

// Floating words to animate
const WORDS = ['CO₂', 'HUMIDITY', 'AIR QUALITY', 'TEMPERATURE', 'SENSORS', 'DATA', 'MONITORING', 'ENVIRONMENT','ANALYTICS','IOT', 'CLOUD', 'REAL-TIME', 'INSIGHTS','°C', '%', 'ppm','🍃','🌡️','🏠'];
const FLOATING_WORDS = WORDS.flatMap((word) =>
  Array.from({ length: 1 }, () => word)
);
function FloatingWord({ text }: { text: string }) {
  const x = useRef(new Animated.Value(Math.random() * width)).current;
  const y = useRef(new Animated.Value(Math.random() * height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const randomPosition = () => ({
    x: Math.random() * (width - 100),
    y: Math.random() * (height - 200),
  });

  const animate = () => {
    const pos = randomPosition();

    Animated.parallel([
      Animated.timing(x, {
        toValue: pos.x,
        duration: 8000,
        useNativeDriver: true,
      }),
      Animated.timing(y, {
        toValue: pos.y,
        duration: 8000,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 3000, useNativeDriver: true }),
      ]),
    ]).start(() => animate());
  };

  useEffect(() => {
    animate();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.floatingText,
        {
          opacity,
          transform: [{ translateX: x }, { translateY: y }],
        },
      ]}
    >
      {text}
    </Animated.Text>
  );
}

export default function AuthLayout() {
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fade, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start();

      setIndex((prev) => (prev + 1) % gradients.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [fade]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.root}>
      {/* Gradient background */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
        <LinearGradient
          colors={gradients[index]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Floating animated words */}
      {FLOATING_WORDS.map((w, i) => (
  <FloatingWord key={i} text={w} />
))}


      {/* Auth pages */}
      <Slot />
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  floatingText: {
    position: 'absolute',
    fontSize: 26,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.25)',
    letterSpacing: 1,
  },
});

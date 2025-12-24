/**
 * ゲームオーバー画面コンポーネント
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

interface GameOverScreenProps {
  score: number;
  stage: number;
  linesCleared: number;
  onRetry: () => void;
  onTitle: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  stage,
  linesCleared,
  onRetry,
  onTitle,
}) => {
  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRetry();
  };

  const handleTitle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTitle();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.container}
    >
      <View style={styles.overlay} />
      <Animated.View
        entering={SlideInDown.delay(200).springify()}
        style={styles.content}
      >
        <ThemedText style={styles.title}>GAME OVER</ThemedText>
        
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <ThemedText style={styles.statLabel}>SCORE</ThemedText>
            <ThemedText style={styles.statValue}>{score.toLocaleString()}</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText style={styles.statLabel}>STAGE</ThemedText>
            <ThemedText style={styles.statValue}>{stage}</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText style={styles.statLabel}>LINES</ThemedText>
            <ThemedText style={styles.statValue}>{linesCleared}</ThemedText>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <Pressable
            onPress={handleRetry}
            style={({ pressed }) => [
              styles.button,
              styles.retryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText style={styles.buttonText}>RETRY</ThemedText>
          </Pressable>
          
          <Pressable
            onPress={handleTitle}
            style={({ pressed }) => [
              styles.button,
              styles.titleButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText style={styles.buttonText}>TITLE</ThemedText>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  content: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.5)',
    width: '85%',
    maxWidth: 320,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF4444',
    marginBottom: 24,
    textShadowColor: 'rgba(255, 68, 68, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  statsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statLabel: {
    fontSize: 14,
    color: '#A0A0A0',
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButton: {
    backgroundColor: Colors.dark.primary,
  },
  titleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

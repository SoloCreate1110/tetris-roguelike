/**
 * タイトル画面コンポーネント
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  useSharedValue,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { Colors, TetrominoColors } from '@/constants/theme';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.5, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onStart();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={styles.container}
    >
      {/* 背景のテトリミノ装飾 */}
      <View style={styles.backgroundDecoration}>
        <View style={[styles.decorBlock, { backgroundColor: TetrominoColors.I, top: '10%', left: '5%', transform: [{ rotate: '15deg' }] }]} />
        <View style={[styles.decorBlock, { backgroundColor: TetrominoColors.T, top: '20%', right: '10%', transform: [{ rotate: '-20deg' }] }]} />
        <View style={[styles.decorBlock, { backgroundColor: TetrominoColors.S, bottom: '30%', left: '15%', transform: [{ rotate: '45deg' }] }]} />
        <View style={[styles.decorBlock, { backgroundColor: TetrominoColors.Z, bottom: '20%', right: '5%', transform: [{ rotate: '-10deg' }] }]} />
        <View style={[styles.decorBlock, { backgroundColor: TetrominoColors.L, top: '40%', left: '80%', transform: [{ rotate: '30deg' }] }]} />
        <View style={[styles.decorBlock, { backgroundColor: TetrominoColors.J, bottom: '40%', right: '80%', transform: [{ rotate: '-35deg' }] }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.titleMain}>TETRIS</ThemedText>
          <ThemedText style={styles.titleSub}>ROGUELIKE</ThemedText>
        </View>

        <ThemedText style={styles.tagline}>
          敵を倒し、パワーアップを集め、{'\n'}最強のテトリスマスターを目指せ！
        </ThemedText>

        <Animated.View style={[styles.startButtonContainer, buttonAnimatedStyle]}>
          <Animated.View style={[styles.buttonGlow, glowAnimatedStyle]} />
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.startButtonPressed,
            ]}
          >
            <ThemedText style={styles.startButtonText}>START</ThemedText>
          </Pressable>
        </Animated.View>

        <View style={styles.instructionsContainer}>
          <ThemedText style={styles.instructionsTitle}>操作方法</ThemedText>
          <View style={styles.instructionRow}>
            <ThemedText style={styles.instructionKey}>◀ ▶</ThemedText>
            <ThemedText style={styles.instructionText}>移動</ThemedText>
          </View>
          <View style={styles.instructionRow}>
            <ThemedText style={styles.instructionKey}>↻</ThemedText>
            <ThemedText style={styles.instructionText}>回転</ThemedText>
          </View>
          <View style={styles.instructionRow}>
            <ThemedText style={styles.instructionKey}>▼</ThemedText>
            <ThemedText style={styles.instructionText}>ソフトドロップ</ThemedText>
          </View>
          <View style={styles.instructionRow}>
            <ThemedText style={styles.instructionKey}>⬇</ThemedText>
            <ThemedText style={styles.instructionText}>ハードドロップ</ThemedText>
          </View>
          <View style={styles.instructionRow}>
            <ThemedText style={styles.instructionKey}>H</ThemedText>
            <ThemedText style={styles.instructionText}>ホールド</ThemedText>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  backgroundDecoration: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  decorBlock: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleMain: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: Colors.dark.primary,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  titleSub: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.primary,
    letterSpacing: 8,
    marginTop: -4,
  },
  tagline: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  startButtonContainer: {
    marginBottom: 40,
  },
  buttonGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: Colors.dark.primary,
    borderRadius: 24,
    opacity: 0.5,
  },
  startButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  startButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  startButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  instructionsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 280,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionKey: {
    fontSize: 16,
    color: '#FFFFFF',
    width: 50,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#A0A0A0',
    marginLeft: 12,
  },
});

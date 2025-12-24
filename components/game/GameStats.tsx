/**
 * ゲームステータス表示コンポーネント
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { GameColors } from '@/constants/theme';

interface GameStatsProps {
  score: number;
  stage: number;
  combo: number;
  linesCleared: number;
}

export const GameStats: React.FC<GameStatsProps> = ({
  score,
  stage,
  combo,
  linesCleared,
}) => {
  const comboScale = useSharedValue(1);

  // コンボが変わったときにアニメーション
  React.useEffect(() => {
    if (combo > 0) {
      comboScale.value = withSpring(1.3, { damping: 10 }, () => {
        comboScale.value = withSpring(1);
      });
    }
  }, [combo]);

  const comboAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: comboScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.statRow}>
        <ThemedText style={styles.label}>STAGE</ThemedText>
        <ThemedText style={styles.value}>{stage}</ThemedText>
      </View>

      <View style={styles.statRow}>
        <ThemedText style={styles.label}>SCORE</ThemedText>
        <ThemedText style={styles.scoreValue}>{score.toLocaleString()}</ThemedText>
      </View>

      <View style={styles.statRow}>
        <ThemedText style={styles.label}>LINES</ThemedText>
        <ThemedText style={styles.value}>{linesCleared}</ThemedText>
      </View>

      {combo > 0 && (
        <Animated.View style={[styles.comboContainer, comboAnimatedStyle]}>
          <ThemedText style={styles.comboText}>{combo} COMBO!</ThemedText>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    gap: 8,
  },
  statRow: {
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    color: '#A0A0A0',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scoreValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  comboContainer: {
    marginTop: 8,
    padding: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 4,
    alignItems: 'center',
  },
  comboText: {
    fontSize: 14,
    color: GameColors.combo,
    fontWeight: 'bold',
  },
});

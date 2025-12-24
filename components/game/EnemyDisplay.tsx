/**
 * 敵キャラクター表示コンポーネント
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { EnemyState } from '@/hooks/use-game-state';
import { GameColors } from '@/constants/theme';

interface EnemyDisplayProps {
  enemy: EnemyState | null;
}

// 敵のスプライト（絵文字で表現）
const ENEMY_SPRITES: Record<string, string> = {
  slime: '🟢',
  goblin: '👺',
  golem: '🗿',
};

export const EnemyDisplay: React.FC<EnemyDisplayProps> = ({ enemy }) => {
  const translateY = useSharedValue(0);

  // 浮遊アニメーション
  React.useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1000 }),
        withTiming(5, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!enemy) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.noEnemy}>敵なし</ThemedText>
      </View>
    );
  }

  const hpPercentage = (enemy.currentHp / enemy.type.maxHp) * 100;

  return (
    <View style={styles.container}>
      <ThemedText style={styles.enemyName}>{enemy.type.name}</ThemedText>
      
      <Animated.View style={[styles.spriteContainer, animatedStyle]}>
        <ThemedText style={styles.sprite}>
          {ENEMY_SPRITES[enemy.type.id] || '👾'}
        </ThemedText>
      </Animated.View>

      <View style={styles.hpContainer}>
        <View style={styles.hpBarBackground}>
          <View
            style={[
              styles.hpBarFill,
              { width: `${hpPercentage}%` },
            ]}
          />
        </View>
        <ThemedText style={styles.hpText}>
          {enemy.currentHp} / {enemy.type.maxHp}
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    minWidth: 80,
  },
  noEnemy: {
    fontSize: 12,
    color: '#606060',
  },
  enemyName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  spriteContainer: {
    marginVertical: 8,
  },
  sprite: {
    fontSize: 40,
  },
  hpContainer: {
    width: '100%',
    alignItems: 'center',
  },
  hpBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: GameColors.enemyHpBackground,
    borderRadius: 4,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    backgroundColor: GameColors.enemyHp,
    borderRadius: 4,
  },
  hpText: {
    fontSize: 10,
    color: '#A0A0A0',
    marginTop: 2,
  },
});

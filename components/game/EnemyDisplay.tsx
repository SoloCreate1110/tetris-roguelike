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
  attackTimer?: number; // 0-1の値（攻撃までの進行度）
  isFrozen?: boolean;
}

// 敵のスプライト（絵文字で表現）
const ENEMY_SPRITES: Record<string, string> = {
  slime: '🟢',
  goblin: '👺',
  golem: '🗿',
  dragon: '🐉',
  demon: '👿',
};

export const EnemyDisplay: React.FC<EnemyDisplayProps> = ({ 
  enemy, 
  attackTimer = 0,
  isFrozen = false,
}) => {
  const translateY = useSharedValue(0);
  const shakeX = useSharedValue(0);

  // 浮遊アニメーション
  React.useEffect(() => {
    if (!isFrozen) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 1000 }),
          withTiming(5, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [isFrozen]);

  // 攻撃間近の警告アニメーション
  React.useEffect(() => {
    if (attackTimer > 0.8 && !isFrozen) {
      shakeX.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 50 }),
          withTiming(3, { duration: 50 }),
          withTiming(0, { duration: 50 })
        ),
        -1,
        false
      );
    } else {
      shakeX.value = withTiming(0, { duration: 100 });
    }
  }, [attackTimer > 0.8, isFrozen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: shakeX.value },
    ],
  }));

  if (!enemy) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.noEnemy}>敵なし</ThemedText>
      </View>
    );
  }

  const hpPercentage = (enemy.currentHp / enemy.type.maxHp) * 100;
  const attackPercentage = attackTimer * 100;

  // 攻撃タイマーの色（進行度に応じて変化）
  const getAttackTimerColor = () => {
    if (isFrozen) return '#00BFFF';
    if (attackTimer > 0.8) return '#FF4444';
    if (attackTimer > 0.5) return '#FFA500';
    return '#FFD700';
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.enemyName}>{enemy.type.name}</ThemedText>
      
      <Animated.View style={[styles.spriteContainer, animatedStyle]}>
        <ThemedText style={[styles.sprite, isFrozen && styles.frozenSprite]}>
          {ENEMY_SPRITES[enemy.type.id] || '👾'}
        </ThemedText>
        {isFrozen && (
          <View style={styles.frozenOverlay}>
            <ThemedText style={styles.frozenText}>❄️</ThemedText>
          </View>
        )}
      </Animated.View>

      {/* HPバー */}
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

      {/* 攻撃タイマーメーター */}
      <View style={styles.attackTimerContainer}>
        <ThemedText style={styles.attackLabel}>⚔️ 攻撃</ThemedText>
        <View style={styles.attackBarBackground}>
          <View
            style={[
              styles.attackBarFill,
              { 
                width: `${attackPercentage}%`,
                backgroundColor: getAttackTimerColor(),
              },
            ]}
          />
        </View>
        {attackTimer > 0.8 && !isFrozen && (
          <ThemedText style={styles.warningText}>⚠️</ThemedText>
        )}
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
    position: 'relative',
  },
  sprite: {
    fontSize: 40,
  },
  frozenSprite: {
    opacity: 0.7,
  },
  frozenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frozenText: {
    fontSize: 24,
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
  attackTimerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  attackLabel: {
    fontSize: 10,
    color: '#FFD700',
    marginBottom: 2,
  },
  attackBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  attackBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  warningText: {
    fontSize: 12,
    marginTop: 2,
  },
});

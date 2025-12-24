/**
 * パワーアップ選択画面コンポーネント
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { POWER_UPS, PowerUp, SPECIAL_TETROMINOS } from '@/constants/game';
import { Colors } from '@/constants/theme';

interface PowerUpSelectionProps {
  onSelect: (powerUp: PowerUp) => void;
  currentPowerUps: PowerUp[];
}

// パワーアップのアイコンマッピング
const getIconForPowerUp = (powerUp: PowerUp): string => {
  const iconMap: Record<string, string> = {
    damage_boost: '⚔️',
    slow_drop: '🐢',
    combo_master: '🔥',
    armor: '🛡️',
    extra_preview: '👁️',
    unlock_fire: '🔥',
    unlock_ice: '❄️',
    unlock_sand: '⏳',
    unlock_bomb: '💣',
    unlock_lightning: '⚡',
  };
  return iconMap[powerUp.id] || '✨';
};

// レアリティに応じた色を取得
const getRarityColor = (powerUp: PowerUp): string => {
  if (powerUp.type === 'tetromino') {
    const minoType = powerUp.effect.unlockTetromino as string;
    const specialMino = SPECIAL_TETROMINOS.find(s => s.id === minoType);
    if (specialMino) {
      switch (specialMino.rarity) {
        case 'common': return '#A0A0A0';
        case 'uncommon': return '#4CAF50';
        case 'rare': return '#2196F3';
        case 'epic': return '#9C27B0';
      }
    }
  }
  return '#FFD700';
};

// レアリティラベルを取得
const getRarityLabel = (powerUp: PowerUp): string | null => {
  if (powerUp.type === 'tetromino') {
    const minoType = powerUp.effect.unlockTetromino as string;
    const specialMino = SPECIAL_TETROMINOS.find(s => s.id === minoType);
    if (specialMino) {
      switch (specialMino.rarity) {
        case 'common': return 'コモン';
        case 'uncommon': return 'アンコモン';
        case 'rare': return 'レア';
        case 'epic': return 'エピック';
      }
    }
  }
  return null;
};

const PowerUpCard: React.FC<{
  powerUp: PowerUp;
  onSelect: () => void;
  index: number;
}> = ({ powerUp, onSelect, index }) => {
  const handlePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSelect();
  };

  const rarityColor = getRarityColor(powerUp);
  const rarityLabel = getRarityLabel(powerUp);
  const isTetrominoPowerUp = powerUp.type === 'tetromino';

  return (
    <Animated.View
      entering={SlideInUp.delay(index * 100).springify()}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          isTetrominoPowerUp && { borderColor: rarityColor },
          pressed && styles.cardPressed,
        ]}
      >
        {rarityLabel && (
          <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
            <ThemedText style={styles.rarityText}>{rarityLabel}</ThemedText>
          </View>
        )}
        <ThemedText style={styles.cardIcon}>
          {getIconForPowerUp(powerUp)}
        </ThemedText>
        <ThemedText style={[
          styles.cardTitle,
          isTetrominoPowerUp && { color: rarityColor }
        ]}>
          {powerUp.name}
        </ThemedText>
        <ThemedText style={styles.cardDescription}>{powerUp.description}</ThemedText>
        {isTetrominoPowerUp && (
          <View style={styles.tetrominoTag}>
            <ThemedText style={styles.tetrominoTagText}>新ミノ解放</ThemedText>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export const PowerUpSelection: React.FC<PowerUpSelectionProps> = ({
  onSelect,
  currentPowerUps,
}) => {
  // ランダムに3つのパワーアップを選択（重複なし）
  const availablePowerUps = useMemo(() => {
    const currentIds = currentPowerUps.map((p) => p.id);
    const available = POWER_UPS.filter((p) => !currentIds.includes(p.id));
    
    // パッシブと特殊ミノ解放を分ける
    const passives = available.filter(p => p.type === 'passive');
    const tetrominos = available.filter(p => p.type === 'tetromino');
    
    // 選択肢を構築（パッシブ1-2個、特殊ミノ1-2個）
    const shuffledPassives = [...passives].sort(() => Math.random() - 0.5);
    const shuffledTetrominos = [...tetrominos].sort(() => Math.random() - 0.5);
    
    const selected: PowerUp[] = [];
    
    // パッシブを1-2個追加
    const passiveCount = Math.min(shuffledPassives.length, Math.random() > 0.5 ? 2 : 1);
    selected.push(...shuffledPassives.slice(0, passiveCount));
    
    // 残りを特殊ミノで埋める
    const remainingSlots = 3 - selected.length;
    selected.push(...shuffledTetrominos.slice(0, remainingSlots));
    
    // 足りない場合はパッシブで補う
    if (selected.length < 3) {
      const morePassives = shuffledPassives.slice(passiveCount, passiveCount + (3 - selected.length));
      selected.push(...morePassives);
    }
    
    // シャッフルして返す
    return selected.sort(() => Math.random() - 0.5);
  }, [currentPowerUps]);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.container}
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <ThemedText style={styles.title}>STAGE CLEAR!</ThemedText>
        <ThemedText style={styles.subtitle}>パワーアップを選択</ThemedText>
        
        <View style={styles.cardsContainer}>
          {availablePowerUps.map((powerUp, index) => (
            <PowerUpCard
              key={powerUp.id}
              powerUp={powerUp}
              onSelect={() => onSelect(powerUp)}
              index={index}
            />
          ))}
        </View>
      </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  content: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  cardsContainer: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardPressed: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
    transform: [{ scale: 0.98 }],
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
  },
  rarityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tetrominoTag: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  tetrominoTagText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: 'bold',
  },
});

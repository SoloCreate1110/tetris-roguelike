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
import { POWER_UPS, PowerUp } from '@/constants/game';
import { Colors } from '@/constants/theme';

interface PowerUpSelectionProps {
  onSelect: (powerUp: PowerUp) => void;
  currentPowerUps: PowerUp[];
}

const PowerUpCard: React.FC<{
  powerUp: PowerUp;
  onSelect: () => void;
  index: number;
}> = ({ powerUp, onSelect, index }) => {
  const handlePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSelect();
  };

  const iconMap: Record<string, string> = {
    damage_boost: '⚔️',
    slow_drop: '🐢',
    combo_master: '🔥',
    armor: '🛡️',
    extra_preview: '👁️',
  };

  return (
    <Animated.View
      entering={SlideInUp.delay(index * 100).springify()}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        <ThemedText style={styles.cardIcon}>
          {iconMap[powerUp.id] || '✨'}
        </ThemedText>
        <ThemedText style={styles.cardTitle}>{powerUp.name}</ThemedText>
        <ThemedText style={styles.cardDescription}>{powerUp.description}</ThemedText>
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
    
    // シャッフルして3つ選択
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
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
});

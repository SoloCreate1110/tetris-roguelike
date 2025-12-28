/**
 * パワーアップ選択画面コンポーネント
 * 属性と形をランダムに表示し、ユーザーが選択できる
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { 
  POWER_UPS, 
  PowerUp, 
  SPECIAL_TETROMINOS, 
  ALL_MINO_SHAPES, 
  AllMinoShapeType,
  TETROMINO_SHAPES, 
  CUSTOM_TETROMINO_SHAPES 
} from '@/constants/game';
import { Colors } from '@/constants/theme';

interface PowerUpSelectionProps {
  onSelect: (powerUp: PowerUp) => void;
  currentPowerUps: PowerUp[];
}

// ミノ形状のプレビューを描画
const MinoPreview: React.FC<{ shape: AllMinoShapeType; size?: number; color?: string }> = ({ 
  shape, 
  size = 40,
  color = '#00BFFF'
}) => {
  const getShape = () => {
    if (['I', 'O', 'T', 'S', 'Z', 'J', 'L'].includes(shape as string)) {
      return TETROMINO_SHAPES[shape as keyof typeof TETROMINO_SHAPES][0];
    } else {
      return CUSTOM_TETROMINO_SHAPES[shape as keyof typeof CUSTOM_TETROMINO_SHAPES][0];
    }
  };

  const shapeData = getShape();
  const cellSize = size / Math.max(shapeData.length, shapeData[0]?.length || 1);

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {shapeData.map((row: number[], rowIdx: number) => (
        <View key={rowIdx} style={{ flexDirection: 'row' }}>
          {row.map((cell: number, colIdx: number) => (
            <View
              key={`${rowIdx}-${colIdx}`}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: cell ? color : 'transparent',
                borderWidth: cell ? 1 : 0,
                borderColor: color,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

// パワーアップカード（属性と形の組み合わせ）
const PowerUpCard: React.FC<{
  attribute: typeof SPECIAL_TETROMINOS[0];
  shape: AllMinoShapeType;
  onSelect: () => void;
  index: number;
}> = ({ attribute, shape, onSelect, index }) => {
  const handlePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSelect();
  };

  return (
    <Animated.View
      entering={SlideInUp.delay(index * 100)}
      style={styles.cardContainer}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: attribute.color },
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardContent}>
          <MinoPreview shape={shape} size={50} color="#FFFFFF" />
          <View style={styles.cardText}>
            <ThemedText style={styles.cardName}>
              {attribute.name}
            </ThemedText>
            <ThemedText style={styles.cardShape}>
              形: {shape}
            </ThemedText>
            <ThemedText style={styles.cardDesc}>
              {attribute.description}
            </ThemedText>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// 通常パワーアップカード
const RegularPowerUpCard: React.FC<{
  powerUp: PowerUp;
  onSelect: () => void;
  index: number;
}> = ({ powerUp, onSelect, index }) => {
  const handlePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSelect();
  };

  return (
    <Animated.View
      entering={SlideInUp.delay(index * 100)}
      style={styles.cardContainer}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.regularCard,
          pressed && styles.cardPressed,
        ]}
      >
        <ThemedText style={styles.regularCardName}>
          {powerUp.name}
        </ThemedText>
        <ThemedText style={styles.regularCardDesc}>
          {powerUp.description}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
};

export const PowerUpSelection: React.FC<PowerUpSelectionProps> = ({
  onSelect,
  currentPowerUps,
}) => {
  // ランダムなパワーアップオプションを生成
  const powerUpOptions = useMemo(() => {
    const options: (PowerUp | { type: 'special'; attribute: typeof SPECIAL_TETROMINOS[0]; shape: AllMinoShapeType })[] = [];

    // 通常パワーアップ2つ
    const shuffledPowerUps = [...POWER_UPS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 2 && i < shuffledPowerUps.length; i++) {
      options.push(shuffledPowerUps[i]);
    }

    // 特殊ミノ3つ（属性と形をランダム組み合わせ）
    for (let i = 0; i < 3; i++) {
      const randomAttribute = SPECIAL_TETROMINOS[Math.floor(Math.random() * SPECIAL_TETROMINOS.length)];
      const randomShape = ALL_MINO_SHAPES[Math.floor(Math.random() * ALL_MINO_SHAPES.length)];
      options.push({
        type: 'special',
        attribute: randomAttribute,
        shape: randomShape,
      });
    }

    return options;
  }, []);

  const handleSelectSpecial = (attribute: typeof SPECIAL_TETROMINOS[0], shape: AllMinoShapeType) => {
    const newPowerUp: PowerUp = {
      id: `${attribute.id}_${shape}_${Date.now()}` as any,
      name: `${attribute.name} (${shape})`,
      description: `${shape}形の${attribute.name}`,
      type: 'tetromino',
      effect: {
        unlockTetromino: attribute.id,
        shape: shape,
      },
    };
    onSelect(newPowerUp);
  };

  const handleSelectRegular = (powerUp: PowerUp) => {
    onSelect(powerUp);
  };

  return (
    <View style={styles.overlay}>
      <Animated.View entering={FadeIn} style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          パワーアップを選ぼう！
        </ThemedText>

        <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
          {powerUpOptions.map((option, index) => {
            if ('type' in option && option.type === 'special') {
              return (
                <PowerUpCard
                  key={`special-${index}`}
                  attribute={option.attribute}
                  shape={option.shape}
                  onSelect={() => handleSelectSpecial(option.attribute, option.shape)}
                  index={index}
                />
              );
            } else {
              return (
                <RegularPowerUpCard
                  key={`regular-${index}`}
                  powerUp={option as PowerUp}
                  onSelect={() => handleSelectRegular(option as PowerUp)}
                  index={index}
                />
              );
            }
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: Colors.dark.background,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  optionsList: {
    flex: 1,
  },
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardText: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardShape: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '500',
  },
  cardDesc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  regularCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  regularCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  regularCardDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

/**
 * パワーアップ選択画面コンポーネント
 * ミノ形状と属性を選択できる新バージョン
 */

import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { POWER_UPS, PowerUp, SPECIAL_TETROMINOS, ALL_MINO_SHAPES, AllMinoShapeType, TETROMINO_SHAPES, CUSTOM_TETROMINO_SHAPES } from '@/constants/game';
import { Colors } from '@/constants/theme';

interface PowerUpSelectionProps {
  onSelect: (powerUp: PowerUp) => void;
  currentPowerUps: PowerUp[];
}

// ミノ形状のプレビューを描画
const MinoPreview: React.FC<{ shape: AllMinoShapeType; size?: number }> = ({ shape, size = 40 }) => {
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
                backgroundColor: cell ? '#00BFFF' : 'transparent',
                borderWidth: cell ? 1 : 0,
                borderColor: '#00BFFF',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

// ステップ1: ミノ形状選択
const ShapeSelectionStep: React.FC<{
  onSelect: (shape: AllMinoShapeType) => void;
}> = ({ onSelect }) => {
  return (
    <Animated.View entering={FadeIn} style={styles.stepContainer}>
      <ThemedText type="title" style={styles.stepTitle}>
        ミノの形を選ぼう！
      </ThemedText>
      <ScrollView style={styles.shapeGrid} showsVerticalScrollIndicator={false}>
        <View style={styles.shapeGridContent}>
          {ALL_MINO_SHAPES.map((shape) => (
            <Pressable
              key={shape}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onSelect(shape);
              }}
              style={({ pressed }) => [
                styles.shapeCard,
                pressed && styles.shapeCardPressed,
              ]}
            >
              <MinoPreview shape={shape} size={50} />
              <ThemedText style={styles.shapeLabel}>{shape}</ThemedText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

// ステップ2: 属性選択
const AttributeSelectionStep: React.FC<{
  selectedShape: AllMinoShapeType;
  onSelect: (attribute: string) => void;
  onBack: () => void;
}> = ({ selectedShape, onSelect, onBack }) => {
  return (
    <Animated.View entering={SlideInUp} style={styles.stepContainer}>
      <ThemedText type="title" style={styles.stepTitle}>
        属性を選ぼう！
      </ThemedText>
      
      <View style={styles.selectedShapePreview}>
        <MinoPreview shape={selectedShape} size={60} />
        <ThemedText style={styles.previewLabel}>{selectedShape}</ThemedText>
      </View>

      <ScrollView style={styles.attributeList} showsVerticalScrollIndicator={false}>
        {SPECIAL_TETROMINOS.map((mino) => (
          <Pressable
            key={mino.id}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onSelect(mino.id);
            }}
            style={({ pressed }) => [
              styles.attributeCard,
              { backgroundColor: mino.color },
              pressed && styles.attributeCardPressed,
            ]}
          >
            <ThemedText style={styles.attributeName}>{mino.name}</ThemedText>
            <ThemedText style={styles.attributeDesc}>{mino.description}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onBack();
        }}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backButtonPressed,
        ]}
      >
        <ThemedText style={styles.backButtonText}>戻る</ThemedText>
      </Pressable>
    </Animated.View>
  );
};

export const PowerUpSelection: React.FC<PowerUpSelectionProps> = ({
  onSelect,
  currentPowerUps,
}) => {
  const [step, setStep] = useState<'shape' | 'attribute'>('shape');
  const [selectedShape, setSelectedShape] = useState<AllMinoShapeType | null>(null);

  const handleShapeSelect = (shape: AllMinoShapeType) => {
    setSelectedShape(shape);
    setStep('attribute');
  };

  const handleAttributeSelect = (attributeId: string) => {
    // 新しいパワーアップを作成
    const newPowerUp: PowerUp = {
      id: `${attributeId}_${selectedShape || 'unknown'}` as any,
      name: `${attributeId} ${selectedShape}`,
      type: 'tetromino',
      description: `${selectedShape}形の${attributeId}属性ミノ`,
      effect: {
        unlockTetromino: attributeId,
        shape: selectedShape,
      },
    };
    onSelect(newPowerUp);
  };

  const handleBack = () => {
    setSelectedShape(null);
    setStep('shape');
  };

  return (
    <View style={styles.overlay}>
      <Animated.View
        entering={FadeIn}
        style={styles.container}
      >
        {step === 'shape' && (
          <ShapeSelectionStep onSelect={handleShapeSelect} />
        )}
        {step === 'attribute' && selectedShape && (
          <AttributeSelectionStep
            selectedShape={selectedShape}
            onSelect={handleAttributeSelect}
            onBack={handleBack}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  shapeGrid: {
    flex: 1,
    marginBottom: 16,
  },
  shapeGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  shapeCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
  },
  shapeCardPressed: {
    backgroundColor: 'rgba(0, 191, 255, 0.3)',
    borderColor: '#00BFFF',
    transform: [{ scale: 0.95 }],
  },
  shapeLabel: {
    fontSize: 10,
    marginTop: 4,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  selectedShapePreview: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  previewLabel: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 12,
  },
  attributeList: {
    flex: 1,
    marginBottom: 16,
  },
  attributeCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  attributeCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  attributeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  attributeDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    alignItems: 'center',
  },
  backButtonPressed: {
    backgroundColor: 'rgba(255, 59, 48, 0.5)',
  },
  backButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
});

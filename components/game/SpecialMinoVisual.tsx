import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SpecialTetrominoType } from '@/constants/game';

interface SpecialMinoVisualProps {
  type?: SpecialTetrominoType;
  size: number;
}

/**
 * 特殊ミノのビジュアル表現
 * 各ミノに異なるパターンやアイコンを表示
 */
export function SpecialMinoVisual({ type, size }: SpecialMinoVisualProps) {
  if (!type) return null;

  const styles = getStylesForType(type, size);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {type === 'FIRE' && <FirePattern size={size} />}
      {type === 'ICE' && <IcePattern size={size} />}
      {type === 'SAND' && <SandPattern size={size} />}
      {type === 'BOMB' && <BombPattern size={size} />}
      {type === 'LIGHTNING' && <LightningPattern size={size} />}
    </View>
  );
}

// 炎パターン
function FirePattern({ size }: { size: number }) {
  const fontSize = Math.max(8, size * 0.6);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize, color: '#FFD700', fontWeight: 'bold' }}>🔥</Text>
    </View>
  );
}

// 氷パターン
function IcePattern({ size }: { size: number }) {
  const fontSize = Math.max(8, size * 0.6);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize, color: '#E0FFFF', fontWeight: 'bold' }}>❄️</Text>
    </View>
  );
}

// 砂パターン
function SandPattern({ size }: { size: number }) {
  const dotSize = Math.max(2, size * 0.15);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
      {[...Array(9)].map((_, i) => (
        <View
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: '#F5DEB3',
            borderRadius: dotSize / 2,
          }}
        />
      ))}
    </View>
  );
}

// 爆弾パターン
function BombPattern({ size }: { size: number }) {
  const fontSize = Math.max(8, size * 0.6);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize, color: '#FF6347', fontWeight: 'bold' }}>💣</Text>
    </View>
  );
}

// 雷パターン
function LightningPattern({ size }: { size: number }) {
  const fontSize = Math.max(8, size * 0.6);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize, color: '#FFFF00', fontWeight: 'bold' }}>⚡</Text>
    </View>
  );
}

function getStylesForType(type: SpecialTetrominoType, size: number) {
  const baseStyle = {
    container: {
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      borderRadius: 2,
    },
  };

  switch (type) {
    case 'FIRE':
      return {
        ...baseStyle,
        container: {
          ...baseStyle.container,
          backgroundColor: '#FF4500',
          borderWidth: 1,
          borderColor: '#FFD700',
        },
      };
    case 'ICE':
      return {
        ...baseStyle,
        container: {
          ...baseStyle.container,
          backgroundColor: '#00BFFF',
          borderWidth: 1,
          borderColor: '#87CEEB',
        },
      };
    case 'SAND':
      return {
        ...baseStyle,
        container: {
          ...baseStyle.container,
          backgroundColor: '#DEB887',
          borderWidth: 1,
          borderColor: '#CD853F',
        },
      };
    case 'BOMB':
      return {
        ...baseStyle,
        container: {
          ...baseStyle.container,
          backgroundColor: '#2F2F2F',
          borderWidth: 1,
          borderColor: '#FF6347',
        },
      };
    case 'LIGHTNING':
      return {
        ...baseStyle,
        container: {
          ...baseStyle.container,
          backgroundColor: '#FFD700',
          borderWidth: 1,
          borderColor: '#FFA500',
        },
      };
    default:
      return baseStyle;
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

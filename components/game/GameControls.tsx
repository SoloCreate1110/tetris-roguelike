/**
 * ゲームコントロールコンポーネント
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

interface GameControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onHold: () => void;
}

const ControlButton: React.FC<{
  onPress: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  label: string;
  style?: object;
  size?: 'small' | 'medium' | 'large';
}> = ({ onPress, onPressIn, onPressOut, label, style, size = 'medium' }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const buttonSize = {
    small: 44,
    medium: 56,
    large: 70,
  }[size];

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => [
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
        style,
      ]}
    >
      <ThemedText style={styles.buttonText}>{label}</ThemedText>
    </Pressable>
  );
};

export const GameControls: React.FC<GameControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
  onHold,
}) => {
  const moveIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startMoving = (direction: 'left' | 'right') => {
    const moveFunc = direction === 'left' ? onMoveLeft : onMoveRight;
    moveFunc();
    moveIntervalRef.current = setInterval(moveFunc, 100);
  };

  const stopMoving = () => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftControls}>
        <ControlButton
          onPress={onMoveLeft}
          onPressIn={() => startMoving('left')}
          onPressOut={stopMoving}
          label="◀"
          size="large"
        />
        <ControlButton
          onPress={onMoveRight}
          onPressIn={() => startMoving('right')}
          onPressOut={stopMoving}
          label="▶"
          size="large"
        />
      </View>

      <View style={styles.centerControls}>
        <ControlButton
          onPress={onSoftDrop}
          label="▼"
          size="medium"
        />
        <ControlButton
          onPress={onHardDrop}
          label="⬇"
          size="large"
          style={styles.hardDropButton}
        />
      </View>

      <View style={styles.rightControls}>
        <ControlButton
          onPress={onRotate}
          label="↻"
          size="large"
        />
        <ControlButton
          onPress={onHold}
          label="H"
          size="medium"
          style={styles.holdButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leftControls: {
    flexDirection: 'row',
    gap: 8,
  },
  centerControls: {
    alignItems: 'center',
    gap: 8,
  },
  rightControls: {
    alignItems: 'center',
    gap: 8,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  hardDropButton: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  holdButton: {
    backgroundColor: 'rgba(100, 100, 255, 0.3)',
    borderColor: 'rgba(100, 100, 255, 0.5)',
  },
});

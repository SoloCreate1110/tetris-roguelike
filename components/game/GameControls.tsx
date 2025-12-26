/**
 * ゲームコントロールコンポーネント
 * ワンタップで1マス移動、長押しで連続移動
 */

import React, { useRef, useCallback } from 'react';
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

interface ControlButtonProps {
  onPress: () => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
  label: string;
  style?: object;
  size?: 'small' | 'medium' | 'large';
}

const ControlButton: React.FC<ControlButtonProps> = ({ 
  onPress, 
  onLongPressStart, 
  onLongPressEnd, 
  label, 
  style, 
  size = 'medium' 
}) => {
  const isLongPressRef = useRef(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buttonSize = {
    small: 44,
    medium: 56,
    large: 70,
  }[size];

  const handlePressIn = useCallback(() => {
    isLongPressRef.current = false;
    
    // 長押し検出タイマー（100ms後に長押しと判定）
    if (onLongPressStart) {
      longPressTimerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPressStart();
      }, 100);
    }
  }, [onLongPressStart]);

  const handlePressOut = useCallback(() => {
    // タイマーをクリア
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // 長押し終了
    if (isLongPressRef.current && onLongPressEnd) {
      onLongPressEnd();
    }
    
    // 短いタップの場合のみ1回移動
    if (!isLongPressRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
    
    isLongPressRef.current = false;
  }, [onPress, onLongPressEnd]);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
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

// シンプルなボタン（長押し不要なもの用）
const SimpleButton: React.FC<{
  onPress: () => void;
  label: string;
  style?: object;
  size?: 'small' | 'medium' | 'large';
}> = ({ onPress, label, style, size = 'medium' }) => {
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
  const moveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startMovingLeft = useCallback(() => {
    // 長押し開始時に連続移動（より速く）
    moveIntervalRef.current = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onMoveLeft();
    }, 50);
  }, [onMoveLeft]);

  const startMovingRight = useCallback(() => {
    // 長押し開始時に連続移動（より速く）
    moveIntervalRef.current = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onMoveRight();
    }, 50);
  }, [onMoveRight]);

  const stopMoving = useCallback(() => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.leftControls}>
        <ControlButton
          onPress={onMoveLeft}
          onLongPressStart={startMovingLeft}
          onLongPressEnd={stopMoving}
          label="◀"
          size="large"
        />
        <ControlButton
          onPress={onMoveRight}
          onLongPressStart={startMovingRight}
          onLongPressEnd={stopMoving}
          label="▶"
          size="large"
        />
      </View>

      <View style={styles.centerControls}>
        <SimpleButton
          onPress={onSoftDrop}
          label="▼"
          size="medium"
        />
        <SimpleButton
          onPress={onHardDrop}
          label="⬇"
          size="large"
          style={styles.hardDropButton}
        />
      </View>

      <View style={styles.rightControls}>
        <SimpleButton
          onPress={onRotate}
          label="↻"
          size="large"
        />
        <SimpleButton
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

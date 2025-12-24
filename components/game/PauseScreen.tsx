import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GameColors } from '@/constants/theme';

interface PauseScreenProps {
  visible: boolean;
  onResume: () => void;
  onRetry: () => void;
  onGoToTitle: () => void;
}

export const PauseScreen: React.FC<PauseScreenProps> = ({
  visible,
  onResume,
  onRetry,
  onGoToTitle,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onResume}
    >
      <View style={styles.overlay}>
        <ThemedView
          style={[
            styles.container,
            {
              paddingTop: Math.max(insets.top, 20),
              paddingBottom: Math.max(insets.bottom, 20),
              paddingLeft: Math.max(insets.left, 20),
              paddingRight: Math.max(insets.right, 20),
            },
          ]}
        >
          <ThemedText type="title" style={styles.title}>
            一時停止
          </ThemedText>

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.resumeButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onResume}
            >
              <ThemedText style={styles.buttonText}>ゲームに戻る</ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.retryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onRetry}
            >
              <ThemedText style={styles.buttonText}>リトライ</ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.titleButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onGoToTitle}
            >
              <ThemedText style={styles.buttonText}>タイトルに戻る</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  title: {
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  resumeButton: {
    backgroundColor: '#007AFF',
  },
  retryButton: {
    backgroundColor: '#FF9500',
  },
  titleButton: {
    backgroundColor: '#FF3B30',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

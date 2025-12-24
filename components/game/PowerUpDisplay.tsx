import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PowerUp } from '@/constants/game';

interface PowerUpDisplayProps {
  powerUps: PowerUp[];
  maxDisplay?: number;
}

export const PowerUpDisplay: React.FC<PowerUpDisplayProps> = ({
  powerUps,
  maxDisplay = 5,
}) => {
  const displayPowerUps = powerUps.slice(-maxDisplay);

  if (displayPowerUps.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>取得能力</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {displayPowerUps.map((powerUp, index) => (
          <View key={index} style={styles.iconContainer}>
            <View style={[styles.icon, getIconStyle(powerUp.type)]}>
              <Text style={styles.iconText}>{getIconEmoji(powerUp.type)}</Text>
            </View>
            <Text style={styles.tooltip}>{powerUp.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

function getIconStyle(type: string) {
  switch (type) {
    case 'passive':
      return { backgroundColor: '#4CAF50' };
    case 'tetromino':
      return { backgroundColor: '#2196F3' };
    case 'active':
      return { backgroundColor: '#FF9800' };
    default:
      return { backgroundColor: '#9C27B0' };
  }
}

function getIconEmoji(type: string) {
  switch (type) {
    case 'passive':
      return '⭐';
    case 'tetromino':
      return '🧩';
    case 'active':
      return '✨';
    default:
      return '🎁';
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  scrollView: {
    maxHeight: 60,
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  iconText: {
    fontSize: 24,
  },
  tooltip: {
    color: '#FFFFFF',
    fontSize: 10,
    textAlign: 'center',
    maxWidth: 44,
  },
});

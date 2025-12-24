/**
 * ホールドピース表示コンポーネント
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { TETROMINO_SHAPES, TetrominoType } from '@/constants/game';
import { TetrominoColors, GameColors } from '@/constants/theme';

interface HoldPieceProps {
  piece: TetrominoType | null;
  canHold: boolean;
  cellSize?: number;
}

export const HoldPiece: React.FC<HoldPieceProps> = ({ piece, canHold, cellSize = 10 }) => {
  return (
    <View style={[styles.container, !canHold && styles.disabled]}>
      <ThemedText style={styles.label}>HOLD</ThemedText>
      <View style={styles.pieceWrapper}>
        {piece ? (
          <View style={styles.miniPieceContainer}>
            {TETROMINO_SHAPES[piece][0].map((row, rowIndex) => (
              <View key={rowIndex} style={styles.miniRow}>
                {row.map((cell, colIndex) => (
                  <View
                    key={`${rowIndex}-${colIndex}`}
                    style={[
                      styles.miniCell,
                      {
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: cell ? TetrominoColors[piece] : 'transparent',
                        borderWidth: cell ? 1 : 0,
                        borderColor: cell ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                        opacity: canHold ? 1 : 0.5,
                      },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptySlot, { width: cellSize * 4, height: cellSize * 4 }]} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: GameColors.gridBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#A0A0A0',
    marginBottom: 8,
  },
  pieceWrapper: {
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    minWidth: 50,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPieceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniRow: {
    flexDirection: 'row',
  },
  miniCell: {
    borderRadius: 1,
  },
  emptySlot: {
    backgroundColor: 'transparent',
  },
});

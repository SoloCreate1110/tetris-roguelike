/**
 * ネクストピース表示コンポーネント
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { TETROMINO_SHAPES, TetrominoType } from '@/constants/game';
import { TetrominoColors, GameColors } from '@/constants/theme';

interface NextPiecesProps {
  pieces: TetrominoType[];
  cellSize?: number;
}

const MiniPiece: React.FC<{ type: TetrominoType; cellSize: number }> = ({ type, cellSize }) => {
  const shape = TETROMINO_SHAPES[type][0];
  const color = TetrominoColors[type];

  return (
    <View style={styles.miniPieceContainer}>
      {shape.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.miniRow}>
          {row.map((cell, colIndex) => (
            <View
              key={`${rowIndex}-${colIndex}`}
              style={[
                styles.miniCell,
                {
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: cell ? color : 'transparent',
                  borderWidth: cell ? 1 : 0,
                  borderColor: cell ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

export const NextPieces: React.FC<NextPiecesProps> = ({ pieces, cellSize = 10 }) => {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>NEXT</ThemedText>
      <View style={styles.piecesContainer}>
        {pieces.slice(0, 3).map((piece, index) => (
          <View key={index} style={styles.pieceWrapper}>
            <MiniPiece type={piece} cellSize={cellSize} />
          </View>
        ))}
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
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#A0A0A0',
    marginBottom: 8,
  },
  piecesContainer: {
    gap: 8,
  },
  pieceWrapper: {
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
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
});

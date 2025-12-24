/**
 * テトリスのプレイフィールドコンポーネント
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { GRID_WIDTH, GRID_HEIGHT, TETROMINO_SHAPES, TetrominoType } from '@/constants/game';
import { TetrominoColors, GameColors } from '@/constants/theme';
import { CellState, CurrentPiece } from '@/hooks/use-game-state';

interface TetrisGridProps {
  grid: CellState[][];
  currentPiece: CurrentPiece | null;
  ghostY: number;
  cellSize: number;
}

export const TetrisGrid: React.FC<TetrisGridProps> = ({
  grid,
  currentPiece,
  ghostY,
  cellSize,
}) => {
  // 現在のピースとゴーストを含むグリッドを計算
  const displayGrid = useMemo(() => {
    const result = grid.map((row) => row.map((cell) => ({ ...cell })));

    if (currentPiece) {
      const shape = TETROMINO_SHAPES[currentPiece.type][currentPiece.rotation];
      const color = TetrominoColors[currentPiece.type];

      // ゴーストピースを描画
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            const gridY = ghostY + row;
            const gridX = currentPiece.x + col;
            if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
              if (!result[gridY][gridX].filled) {
                result[gridY][gridX] = {
                  filled: true,
                  color: TetrominoColors.GHOST,
                  isGarbage: false,
                };
              }
            }
          }
        }
      }

      // 現在のピースを描画
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            const gridY = currentPiece.y + row;
            const gridX = currentPiece.x + col;
            if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
              result[gridY][gridX] = {
                filled: true,
                color,
                isGarbage: false,
              };
            }
          }
        }
      }
    }

    return result;
  }, [grid, currentPiece, ghostY]);

  return (
    <View
      style={[
        styles.container,
        {
          width: GRID_WIDTH * cellSize,
          height: GRID_HEIGHT * cellSize,
        },
      ]}
    >
      {displayGrid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => (
            <View
              key={`${rowIndex}-${colIndex}`}
              style={[
                styles.cell,
                {
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: cell.filled ? cell.color : 'transparent',
                  borderWidth: cell.filled ? 1 : 0.5,
                  borderColor: cell.filled
                    ? 'rgba(255, 255, 255, 0.3)'
                    : GameColors.gridLine,
                },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: GameColors.gridBackground,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderRadius: 2,
  },
});

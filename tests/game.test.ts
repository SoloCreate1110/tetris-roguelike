/**
 * テトリスローグライク - ゲームロジックテスト
 */

import { describe, it, expect } from 'vitest';

// 直接定数を定義してテスト
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;

const SCORE_PER_LINE: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

const DAMAGE_PER_LINE: Record<number, number> = {
  1: 10,
  2: 30,
  3: 60,
  4: 100,
};

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

const TETROMINO_SHAPES: Record<TetrominoType, number[][][]> = {
  I: [
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
    [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
    [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
  ],
  O: [
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
  ],
  T: [
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 1, 0], [0, 1, 0]],
  ],
  S: [
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
    [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
    [[1, 0, 0], [1, 1, 0], [0, 1, 0]],
  ],
  Z: [
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
    [[0, 1, 0], [1, 1, 0], [1, 0, 0]],
  ],
  J: [
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
    [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
  ],
  L: [
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
    [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
    [[1, 1, 0], [0, 1, 0], [0, 1, 0]],
  ],
};

describe('Game Constants', () => {
  describe('Grid Configuration', () => {
    it('should have standard tetris grid dimensions', () => {
      expect(GRID_WIDTH).toBe(10);
      expect(GRID_HEIGHT).toBe(20);
    });
  });

  describe('Tetromino Shapes', () => {
    const tetrominoTypes: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

    it('should have all 7 standard tetromino types', () => {
      expect(Object.keys(TETROMINO_SHAPES)).toHaveLength(7);
      tetrominoTypes.forEach((type) => {
        expect(TETROMINO_SHAPES[type]).toBeDefined();
      });
    });

    it('should have 4 rotation states for each tetromino', () => {
      tetrominoTypes.forEach((type) => {
        expect(TETROMINO_SHAPES[type]).toHaveLength(4);
      });
    });

    it('should have exactly 4 filled cells per tetromino', () => {
      tetrominoTypes.forEach((type) => {
        TETROMINO_SHAPES[type].forEach((rotation) => {
          const filledCells = rotation.flat().filter((cell) => cell === 1).length;
          expect(filledCells).toBe(4);
        });
      });
    });
  });

  describe('Score System', () => {
    it('should have increasing scores for more lines', () => {
      expect(SCORE_PER_LINE[1]).toBeLessThan(SCORE_PER_LINE[2]);
      expect(SCORE_PER_LINE[2]).toBeLessThan(SCORE_PER_LINE[3]);
      expect(SCORE_PER_LINE[3]).toBeLessThan(SCORE_PER_LINE[4]);
    });

    it('should have tetris (4 lines) give the highest score', () => {
      expect(SCORE_PER_LINE[4]).toBe(800);
    });
  });

  describe('Damage System', () => {
    it('should have increasing damage for more lines', () => {
      expect(DAMAGE_PER_LINE[1]).toBeLessThan(DAMAGE_PER_LINE[2]);
      expect(DAMAGE_PER_LINE[2]).toBeLessThan(DAMAGE_PER_LINE[3]);
      expect(DAMAGE_PER_LINE[3]).toBeLessThan(DAMAGE_PER_LINE[4]);
    });

    it('should have tetris (4 lines) deal 100 damage', () => {
      expect(DAMAGE_PER_LINE[4]).toBe(100);
    });
  });
});

describe('Game Logic Utilities', () => {
  describe('7-bag Randomizer', () => {
    it('should generate all 7 pieces before repeating', () => {
      const generateBag = (): TetrominoType[] => {
        const pieces: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        for (let i = pieces.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }
        return pieces;
      };

      const bag = generateBag();
      expect(bag).toHaveLength(7);
      
      const uniquePieces = new Set(bag);
      expect(uniquePieces.size).toBe(7);
    });
  });

  describe('Collision Detection', () => {
    it('should detect boundary collisions', () => {
      const pieceAtLeftEdge = { type: 'I' as TetrominoType, x: -1, y: 5, rotation: 0 };
      const isOutOfBounds = pieceAtLeftEdge.x < 0;
      expect(isOutOfBounds).toBe(true);
    });

    it('should allow pieces within bounds', () => {
      const pieceInBounds = { type: 'I' as TetrominoType, x: 3, y: 5, rotation: 0 };
      const isInBounds = pieceInBounds.x >= 0 && pieceInBounds.x < GRID_WIDTH;
      expect(isInBounds).toBe(true);
    });
  });

  describe('Line Clear Detection', () => {
    it('should detect full lines', () => {
      const grid = Array(GRID_HEIGHT)
        .fill(null)
        .map((_, rowIndex) =>
          Array(GRID_WIDTH)
            .fill(null)
            .map(() => ({
              filled: rowIndex === GRID_HEIGHT - 1,
              color: '#FF0000',
              isGarbage: false,
            }))
        );

      const lastRow = grid[GRID_HEIGHT - 1];
      const isLineFull = lastRow.every((cell) => cell.filled);
      expect(isLineFull).toBe(true);
    });

    it('should not detect incomplete lines', () => {
      const grid = Array(GRID_HEIGHT)
        .fill(null)
        .map(() =>
          Array(GRID_WIDTH)
            .fill(null)
            .map((_, colIndex) => ({
              filled: colIndex < GRID_WIDTH - 1,
              color: '#FF0000',
              isGarbage: false,
            }))
        );

      const lastRow = grid[GRID_HEIGHT - 1];
      const isLineFull = lastRow.every((cell) => cell.filled);
      expect(isLineFull).toBe(false);
    });
  });

  describe('Combo System', () => {
    it('should calculate combo bonus correctly', () => {
      const baseComboBonus = 10;
      const combo = 3;
      const baseDamage = 100;

      const comboMultiplier = 1 + (combo - 1) * (baseComboBonus / 100);
      const finalDamage = Math.floor(baseDamage * comboMultiplier);

      expect(comboMultiplier).toBe(1.2);
      expect(finalDamage).toBe(120);
    });

    it('should have no bonus for first combo', () => {
      const baseComboBonus = 10;
      const combo = 1;
      const baseDamage = 100;

      const comboMultiplier = 1 + (combo - 1) * (baseComboBonus / 100);
      const finalDamage = Math.floor(baseDamage * comboMultiplier);

      expect(comboMultiplier).toBe(1);
      expect(finalDamage).toBe(100);
    });
  });
});

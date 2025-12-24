/**
 * 特殊ミノの効果処理ユーティリティ
 */

import {
  GRID_WIDTH,
  GRID_HEIGHT,
  SpecialTetrominoType,
} from '@/constants/game';
import { CellState, EnemyState } from '@/hooks/use-game-state';

export interface SpecialEffectResult {
  grid: CellState[][];
  enemy: EnemyState | null;
  bonusDamage: number;
  freezeTime: number; // ミリ秒
}

/**
 * 炎ミノの効果：火が広がり、火のついたブロックを消すと1.2倍ダメージ
 */
export const applyFireEffect = (
  grid: CellState[][],
  clearedRows: number[],
  enemy: EnemyState | null,
  bonusDamage: number
): SpecialEffectResult => {
  let newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  let totalDamage = bonusDamage;

  // 消去された行の周囲に火を広げる
  const fireSpreadCells: Array<{ row: number; col: number }> = [];

  clearedRows.forEach(row => {
    for (let col = 0; col < GRID_WIDTH; col++) {
      // 上下左右に火を広げる
      const adjacentCells = [
        { r: row - 1, c: col },
        { r: row + 1, c: col },
        { r: row, c: col - 1 },
        { r: row, c: col + 1 },
      ];

      adjacentCells.forEach(({ r, c }) => {
        if (r >= 0 && r < GRID_HEIGHT && c >= 0 && c < GRID_WIDTH) {
          if (newGrid[r][c].filled && !newGrid[r][c].isGarbage) {
            // 火のマークを追加
            fireSpreadCells.push({ row: r, col: c });
          }
        }
      });
    }
  });

  // 火のついたセルをマーク（色を変更して表現）
  fireSpreadCells.forEach(({ row, col }) => {
    if (newGrid[row][col].filled) {
      newGrid[row][col] = {
        ...newGrid[row][col],
        color: '#FF6B35', // 火色
      };
    }
  });

  // 火のついたブロックを消すと1.2倍ダメージ
  totalDamage = Math.floor(bonusDamage * 1.2);

  return {
    grid: newGrid,
    enemy,
    bonusDamage: totalDamage,
    freezeTime: 0,
  };
};

/**
 * 氷ミノの効果：消したブロック数×0.5秒、敵の攻撃ゲージを停止
 */
export const applyIceEffect = (
  grid: CellState[][],
  clearedRows: number[],
  enemy: EnemyState | null,
  blockCount: number
): SpecialEffectResult => {
  let newEnemy = enemy ? { ...enemy } : null;

  // ブロック数×0.5秒（500ms）敵の攻撃を停止
  const freezeTime = blockCount * 500;

  if (newEnemy) {
    newEnemy.isFrozen = true;
    newEnemy.frozenUntil = Date.now() + freezeTime;
  }

  return {
    grid,
    enemy: newEnemy,
    bonusDamage: 0,
    freezeTime,
  };
};

/**
 * 爆弾ミノの効果：消去時に周囲1マスのブロックも消去
 */
export const applyBombEffect = (
  grid: CellState[][],
  clearedRows: number[]
): CellState[][] => {
  let newGrid = grid.map(row => row.map(cell => ({ ...cell })));

  // 消去された行の周囲を爆発範囲に
  const explosionCells = new Set<string>();

  clearedRows.forEach(row => {
    for (let col = 0; col < GRID_WIDTH; col++) {
      // 上下左右と斜めに爆発
      const adjacentCells = [
        { r: row - 1, c: col },
        { r: row + 1, c: col },
        { r: row, c: col - 1 },
        { r: row, c: col + 1 },
        { r: row - 1, c: col - 1 },
        { r: row - 1, c: col + 1 },
        { r: row + 1, c: col - 1 },
        { r: row + 1, c: col + 1 },
      ];

      adjacentCells.forEach(({ r, c }) => {
        if (r >= 0 && r < GRID_HEIGHT && c >= 0 && c < GRID_WIDTH) {
          explosionCells.add(`${r},${c}`);
        }
      });
    }
  });

  // 爆発範囲のブロックを消去
  explosionCells.forEach(key => {
    const [r, c] = key.split(',').map(Number);
    if (!clearedRows.includes(r)) {
      newGrid[r][c] = { filled: false, color: '', isGarbage: false };
    }
  });

  return newGrid;
};

/**
 * 雷ミノの効果：消去時に同じ列のブロックを全て消去
 */
export const applyLightningEffect = (
  grid: CellState[][],
  clearedRows: number[]
): CellState[][] => {
  let newGrid = grid.map(row => row.map(cell => ({ ...cell })));

  // 消去された行の列を全て消去
  const columnsToDestroy = new Set<number>();

  clearedRows.forEach(row => {
    for (let col = 0; col < GRID_WIDTH; col++) {
      columnsToDestroy.add(col);
    }
  });

  // 該当列の全ブロックを消去
  columnsToDestroy.forEach(col => {
    for (let row = 0; row < GRID_HEIGHT; row++) {
      if (!clearedRows.includes(row)) {
        newGrid[row][col] = { filled: false, color: '', isGarbage: false };
      }
    }
  });

  return newGrid;
};

/**
 * 砂ミノの効果：配置時に下の隙間を埋める
 * （既にuse-game-state.tsで実装済み）
 */

/**
 * 特殊ミノの効果を適用
 */
export const applySpecialMinoEffect = (
  specialType: SpecialTetrominoType,
  grid: CellState[][],
  clearedRows: number[],
  enemy: EnemyState | null,
  blockCount: number
): SpecialEffectResult => {
  switch (specialType) {
    case 'FIRE':
      return applyFireEffect(grid, clearedRows, enemy, blockCount * 50);

    case 'ICE':
      return applyIceEffect(grid, clearedRows, enemy, blockCount);

    case 'BOMB':
      return {
        grid: applyBombEffect(grid, clearedRows),
        enemy,
        bonusDamage: blockCount * 30,
        freezeTime: 0,
      };

    case 'LIGHTNING':
      return {
        grid: applyLightningEffect(grid, clearedRows),
        enemy,
        bonusDamage: blockCount * 100,
        freezeTime: 0,
      };

    case 'SAND':
      // 砂ミノはlockPiece時に処理済み
      return {
        grid,
        enemy,
        bonusDamage: 0,
        freezeTime: 0,
      };

    default:
      return {
        grid,
        enemy,
        bonusDamage: 0,
        freezeTime: 0,
      };
  }
};

/**
 * テトリスローグライク - ゲーム定数
 */

// グリッドサイズ
export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 20;
export const CELL_SIZE = 16; // ピクセル

// ゲーム速度（ミリ秒）
export const INITIAL_DROP_INTERVAL = 1000;
export const SOFT_DROP_INTERVAL = 50;
export const LOCK_DELAY = 500;

// スコア
export const SCORE_PER_LINE = {
  1: 100,
  2: 300,
  3: 500,
  4: 800, // テトリス
};

// ダメージ
export const DAMAGE_PER_LINE = {
  1: 10,
  2: 30,
  3: 60,
  4: 100, // テトリス
};

// コンボボーナス（%）
export const COMBO_BONUS_PERCENT = 10;

// テトリミノの形状定義
// 各テトリミノは4つの回転状態を持つ
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export const TETROMINO_SHAPES: Record<TetrominoType, number[][][]> = {
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

// SRS（Super Rotation System）のウォールキックデータ
export const WALL_KICK_DATA = {
  JLSTZ: [
    // 0->1
    [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    // 1->2
    [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    // 2->3
    [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    // 3->0
    [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  ],
  I: [
    // 0->1
    [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    // 1->2
    [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    // 2->3
    [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    // 3->0
    [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  ],
};

// 敵の定義
export interface EnemyType {
  id: string;
  name: string;
  maxHp: number;
  attackInterval: number; // ミリ秒
  attackPattern: 'random' | 'targeted' | 'column';
  garbageSize: { width: number; height: number };
}

export const ENEMIES: Record<string, EnemyType> = {
  slime: {
    id: 'slime',
    name: 'スライム',
    maxHp: 100,
    attackInterval: 5000,
    attackPattern: 'random',
    garbageSize: { width: 1, height: 1 },
  },
  goblin: {
    id: 'goblin',
    name: 'ゴブリン',
    maxHp: 200,
    attackInterval: 4000,
    attackPattern: 'targeted',
    garbageSize: { width: 2, height: 2 },
  },
  golem: {
    id: 'golem',
    name: 'ゴーレム',
    maxHp: 400,
    attackInterval: 6000,
    attackPattern: 'column',
    garbageSize: { width: 1, height: 3 },
  },
};

// パワーアップの定義
export interface PowerUp {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'tetromino' | 'active';
  effect: Record<string, number | string>;
}

export const POWER_UPS: PowerUp[] = [
  {
    id: 'damage_boost',
    name: 'ダメージブースト',
    description: 'ライン消去時のダメージが20%増加',
    type: 'passive',
    effect: { damageMultiplier: 1.2 },
  },
  {
    id: 'slow_drop',
    name: 'スローフォール',
    description: 'テトリミノの落下速度が20%低下',
    type: 'passive',
    effect: { dropSpeedMultiplier: 0.8 },
  },
  {
    id: 'combo_master',
    name: 'コンボマスター',
    description: 'コンボボーナスが2倍になる',
    type: 'passive',
    effect: { comboBonusMultiplier: 2 },
  },
  {
    id: 'armor',
    name: 'アーマー',
    description: '敵の攻撃頻度が25%減少',
    type: 'passive',
    effect: { enemyAttackMultiplier: 0.75 },
  },
  {
    id: 'extra_preview',
    name: 'プレビュー拡張',
    description: 'ネクスト表示が5つに増加',
    type: 'passive',
    effect: { previewCount: 5 },
  },
];

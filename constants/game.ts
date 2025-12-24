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
export const SCORE_PER_LINE: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800, // テトリス
};

// ダメージ
export const DAMAGE_PER_LINE: Record<number, number> = {
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

// 特殊テトリミノタイプ
export type SpecialTetrominoType = 'FIRE' | 'ICE' | 'SAND' | 'BOMB' | 'LIGHTNING';

// 全テトリミノタイプ（通常 + 特殊）
export type AllTetrominoType = TetrominoType | SpecialTetrominoType;

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

// 特殊ミノの形状（Tミノベース）
export const SPECIAL_TETROMINO_SHAPES: number[][][] = [
  [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
  [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
  [[0, 1, 0], [1, 1, 0], [0, 1, 0]],
];

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

// 敵のバランス調整版（攻撃頻度を下げ、HPを調整）
export const ENEMIES: Record<string, EnemyType> = {
  slime: {
    id: 'slime',
    name: 'スライム',
    maxHp: 80,
    attackInterval: 8000, // 5000 -> 8000
    attackPattern: 'random',
    garbageSize: { width: 1, height: 1 },
  },
  goblin: {
    id: 'goblin',
    name: 'ゴブリン',
    maxHp: 150, // 200 -> 150
    attackInterval: 7000, // 4000 -> 7000
    attackPattern: 'targeted',
    garbageSize: { width: 2, height: 1 }, // height: 2 -> 1
  },
  golem: {
    id: 'golem',
    name: 'ゴーレム',
    maxHp: 250, // 400 -> 250
    attackInterval: 10000, // 6000 -> 10000
    attackPattern: 'column',
    garbageSize: { width: 1, height: 2 }, // height: 3 -> 2
  },
  dragon: {
    id: 'dragon',
    name: 'ドラゴン',
    maxHp: 400,
    attackInterval: 9000,
    attackPattern: 'random',
    garbageSize: { width: 3, height: 1 },
  },
  demon: {
    id: 'demon',
    name: 'デーモン',
    maxHp: 500,
    attackInterval: 8000,
    attackPattern: 'targeted',
    garbageSize: { width: 2, height: 2 },
  },
};

// ステージごとの敵リスト
export const STAGE_ENEMIES = ['slime', 'goblin', 'golem', 'dragon', 'demon'];

// 特殊ミノの定義
export interface SpecialTetromino {
  id: SpecialTetrominoType;
  name: string;
  description: string;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  spawnWeight: number; // 出現確率の重み（低いほどレア）
  effect: {
    type: 'damage' | 'freeze' | 'gravity' | 'explosion' | 'chain';
    chance: number; // 発動確率（0-1）
    value: number; // 効果値
  };
}

export const SPECIAL_TETROMINOS: SpecialTetromino[] = [
  {
    id: 'FIRE',
    name: '炎ミノ',
    description: '消去時30%で追加ダメージ+50',
    color: '#FF4500',
    rarity: 'uncommon',
    spawnWeight: 15,
    effect: { type: 'damage', chance: 0.3, value: 50 },
  },
  {
    id: 'ICE',
    name: '氷ミノ',
    description: '消去時25%で敵を2秒凍結',
    color: '#00BFFF',
    rarity: 'uncommon',
    spawnWeight: 15,
    effect: { type: 'freeze', chance: 0.25, value: 2000 },
  },
  {
    id: 'SAND',
    name: '砂ミノ',
    description: '配置時に下の隙間を埋める',
    color: '#DEB887',
    rarity: 'common',
    spawnWeight: 20,
    effect: { type: 'gravity', chance: 1, value: 0 },
  },
  {
    id: 'BOMB',
    name: '爆弾ミノ',
    description: '消去時20%で周囲1マスも消去',
    color: '#2F2F2F',
    rarity: 'rare',
    spawnWeight: 8,
    effect: { type: 'explosion', chance: 0.2, value: 1 },
  },
  {
    id: 'LIGHTNING',
    name: '雷ミノ',
    description: '消去時15%で縦1列を消去',
    color: '#FFD700',
    rarity: 'epic',
    spawnWeight: 5,
    effect: { type: 'chain', chance: 0.15, value: 1 },
  },
];

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
  // 特殊ミノ解放パワーアップ
  {
    id: 'unlock_fire',
    name: '炎の力',
    description: '炎ミノが出現するようになる',
    type: 'tetromino',
    effect: { unlockTetromino: 'FIRE' },
  },
  {
    id: 'unlock_ice',
    name: '氷の力',
    description: '氷ミノが出現するようになる',
    type: 'tetromino',
    effect: { unlockTetromino: 'ICE' },
  },
  {
    id: 'unlock_sand',
    name: '砂の力',
    description: '砂ミノが出現するようになる',
    type: 'tetromino',
    effect: { unlockTetromino: 'SAND' },
  },
  {
    id: 'unlock_bomb',
    name: '爆発の力',
    description: '爆弾ミノが出現するようになる',
    type: 'tetromino',
    effect: { unlockTetromino: 'BOMB' },
  },
  {
    id: 'unlock_lightning',
    name: '雷の力',
    description: '雷ミノが出現するようになる',
    type: 'tetromino',
    effect: { unlockTetromino: 'LIGHTNING' },
  },
];

/**
 * テトリスローグライク - ゲーム状態管理フック
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  TETROMINO_SHAPES,
  SPECIAL_TETROMINO_SHAPES,
  TetrominoType,
  SpecialTetrominoType,
  AllTetrominoType,
  WALL_KICK_DATA,
  INITIAL_DROP_INTERVAL,
  LOCK_DELAY,
  SCORE_PER_LINE,
  DAMAGE_PER_LINE,
  LINE_CLEAR_BONUS,
  COMBO_BONUS_PERCENT,
  ENEMIES,
  STAGE_ENEMIES,
  EnemyType,
  PowerUp,
  SPECIAL_TETROMINOS,
  SpecialTetromino,
} from '@/constants/game';
import { TetrominoColors } from '@/constants/theme';
import { applySpecialMinoEffect } from '@/lib/special-mino-effects';

// セルの状態
export type CellState = {
  filled: boolean;
  color: string;
  isGarbage: boolean;
  specialType?: SpecialTetrominoType;
};

// 現在のテトリミノの状態
export type CurrentPiece = {
  type: AllTetrominoType;
  x: number;
  y: number;
  rotation: number;
  isSpecial: boolean;
  specialData?: SpecialTetromino;
  shape?: string; // 特殊ミノの形状（CROSS, RECT_2x3など）
};

// 敵の状態
export type EnemyState = {
  type: EnemyType;
  currentHp: number;
  attackTimer: number;
  isFrozen: boolean;
  frozenUntil: number;
};

// ゲームの状態
export type GameState = 'title' | 'playing' | 'paused' | 'powerup' | 'gameover';

// ゲーム全体の状態
export interface GameData {
  grid: CellState[][];
  currentPiece: CurrentPiece | null;
  nextPieces: AllTetrominoType[];
  holdPiece: AllTetrominoType | null;
  canHold: boolean;
  score: number;
  level: number;
  linesCleared: number;
  combo: number;
  enemy: EnemyState | null;
  gameState: GameState;
  powerUps: PowerUp[];
  stage: number;
  unlockedSpecialMinos: SpecialTetrominoType[];
  attackTimerProgress: number; // 0-1の値
}

// 通常テトリミノの種類
const NORMAL_TETROMINOS: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// 7-bag方式でテトリミノを生成（特殊ミノも含む）
const generateBag = (unlockedSpecialMinos: SpecialTetrominoType[]): AllTetrominoType[] => {
  const pieces: AllTetrominoType[] = [...NORMAL_TETROMINOS];
  
  // 解放された特殊ミノを確率で追加
  unlockedSpecialMinos.forEach(specialType => {
    const specialMino = SPECIAL_TETROMINOS.find(s => s.id === specialType);
    if (specialMino) {
      // 出現確率に基づいて追加（100分のspawnWeight%の確率）
      if (Math.random() * 100 < specialMino.spawnWeight) {
        pieces.push(specialType);
      }
    }
  });
  
  // Fisher-Yatesシャッフル
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  return pieces;
};

// 空のグリッドを生成
const createEmptyGrid = (): CellState[][] => {
  return Array(GRID_HEIGHT)
    .fill(null)
    .map(() =>
      Array(GRID_WIDTH)
        .fill(null)
        .map(() => ({ filled: false, color: '', isGarbage: false }))
    );
};

// テトリミノの形状を取得
const getShape = (type: AllTetrominoType, rotation: number, customShape?: string): number[][] => {
  if (NORMAL_TETROMINOS.includes(type as TetrominoType)) {
    return TETROMINO_SHAPES[type as TetrominoType][rotation];
  }
  // 特殊ミノの場合、カスタム形状を使用
  if (customShape) {
    const { CUSTOM_TETROMINO_SHAPES } = require('@/constants/game');
    if (CUSTOM_TETROMINO_SHAPES[customShape as any]) {
      return CUSTOM_TETROMINO_SHAPES[customShape as any][rotation];
    }
  }
  // デフォルトはTミノの形状を使用
  return SPECIAL_TETROMINO_SHAPES[rotation];
};

// テトリミノの色を取得
const getColor = (type: AllTetrominoType): string => {
  if (NORMAL_TETROMINOS.includes(type as TetrominoType)) {
    return TetrominoColors[type as TetrominoType];
  }
  const specialMino = SPECIAL_TETROMINOS.find(s => s.id === type);
  return specialMino?.color || '#FFFFFF';
};

// 衝突判定
const checkCollision = (
  grid: CellState[][],
  piece: CurrentPiece,
  offsetX: number = 0,
  offsetY: number = 0,
  newRotation?: number
): boolean => {
  const shape = getShape(piece.type, newRotation ?? piece.rotation, piece.shape);
  const newX = piece.x + offsetX;
  const newY = piece.y + offsetY;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const gridX = newX + col;
        const gridY = newY + row;

        // 境界チェック
        if (gridX < 0 || gridX >= GRID_WIDTH || gridY >= GRID_HEIGHT) {
          return true;
        }

        // 他のブロックとの衝突チェック（上部は許可）
        if (gridY >= 0 && grid[gridY][gridX].filled) {
          return true;
        }
      }
    }
  }
  return false;
};

export const useGameState = () => {
  const [gameData, setGameData] = useState<GameData>({
    grid: createEmptyGrid(),
    currentPiece: null,
    nextPieces: [],
    holdPiece: null,
    canHold: true,
    score: 0,
    level: 1,
    linesCleared: 0,
    combo: 0,
    enemy: null,
    gameState: 'title',
    powerUps: [],
    stage: 1,
    unlockedSpecialMinos: [],
    attackTimerProgress: 0,
  });

  const bagRef = useRef<AllTetrominoType[]>([]);
  const dropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enemyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attackProgressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastClearTimeRef = useRef<number>(0);
  const enemyAttackStartRef = useRef<number>(0);

  // 次のテトリミノを取得
  const getNextPiece = useCallback((unlockedSpecialMinos: SpecialTetrominoType[]): AllTetrominoType => {
    if (bagRef.current.length === 0) {
      bagRef.current = generateBag(unlockedSpecialMinos);
    }
    return bagRef.current.shift()!;
  }, []);

  // 新しいテトリミノを生成
  const spawnPiece = useCallback((nextPieces: AllTetrominoType[], unlockedSpecialMinos: SpecialTetrominoType[]): { piece: CurrentPiece; newNextPieces: AllTetrominoType[] } => {
    const type = nextPieces[0];
    const newNextPieces = [...nextPieces.slice(1)];
    
    // 次のピースを補充
    while (newNextPieces.length < 3) {
      newNextPieces.push(getNextPiece(unlockedSpecialMinos));
    }

    const shape = getShape(type, 0);
    const isSpecial = !NORMAL_TETROMINOS.includes(type as TetrominoType);
    const specialData = isSpecial ? SPECIAL_TETROMINOS.find(s => s.id === type) : undefined;
    
    const piece: CurrentPiece = {
      type,
      x: Math.floor((GRID_WIDTH - shape[0].length) / 2),
      y: -1,
      rotation: 0,
      isSpecial,
      specialData,
    };

    return { piece, newNextPieces };
  }, [getNextPiece]);

  // ゲーム開始
  const startGame = useCallback(() => {
    // 初期のネクストピースを生成
    bagRef.current = generateBag([]);
    const initialNextPieces: AllTetrominoType[] = [];
    for (let i = 0; i < 4; i++) {
      initialNextPieces.push(getNextPiece([]));
    }

    const { piece, newNextPieces } = spawnPiece(initialNextPieces, []);
    
    // 敵を生成
    const enemyType = ENEMIES.slime;
    const enemy: EnemyState = {
      type: enemyType,
      currentHp: enemyType.maxHp,
      attackTimer: enemyType.attackInterval,
      isFrozen: false,
      frozenUntil: 0,
    };

    enemyAttackStartRef.current = Date.now();

    setGameData({
      grid: createEmptyGrid(),
      currentPiece: piece,
      nextPieces: newNextPieces,
      holdPiece: null,
      canHold: true,
      score: 0,
      level: 1,
      linesCleared: 0,
      combo: 0,
      enemy,
      gameState: 'playing',
      powerUps: [],
      stage: 1,
      unlockedSpecialMinos: [],
      attackTimerProgress: 0,
    });
  }, [getNextPiece, spawnPiece]);

  // 特殊ミノの効果を処理
  const processSpecialEffect = useCallback((
    specialType: SpecialTetrominoType,
    grid: CellState[][],
    enemy: EnemyState | null,
    clearedRows: number[],
    blockCount: number
  ): { grid: CellState[][]; enemy: EnemyState | null; bonusDamage: number; freezeTime: number } => {
    const result = applySpecialMinoEffect(specialType, grid, clearedRows, enemy, blockCount);
    return result;
  }, []);

  // 砂ミノの重力効果
  const applySandGravity = useCallback((grid: CellState[][], piece: CurrentPiece): CellState[][] => {
    if (piece.type !== 'SAND') return grid;

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const shape = getShape(piece.type, piece.rotation, piece.shape);
    const color = getColor(piece.type);

    // 砂ミノの各ブロックを下に落とす
    for (let col = 0; col < shape[0].length; col++) {
      for (let row = shape.length - 1; row >= 0; row--) {
        if (shape[row][col]) {
          const gridX = piece.x + col;
          let gridY = piece.y + row;

          // 下に落ちれるところまで落とす
          while (gridY + 1 < GRID_HEIGHT && !newGrid[gridY + 1][gridX].filled) {
            gridY++;
          }

          if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
            newGrid[gridY][gridX] = { filled: true, color, isGarbage: false, specialType: 'SAND' };
          }
        }
      }
    }

    return newGrid;
  }, []);

  // テトリミノを固定
  const lockPiece = useCallback(() => {
    setGameData((prev) => {
      if (!prev.currentPiece || prev.gameState !== 'playing') return prev;

      let newGrid = prev.grid.map((row) => row.map((cell) => ({ ...cell })));
      const shape = getShape(prev.currentPiece.type, prev.currentPiece.rotation, prev.currentPiece.shape);
      const color = getColor(prev.currentPiece.type);

      // 砂ミノの場合は重力効果を適用
      if (prev.currentPiece.type === 'SAND') {
        newGrid = applySandGravity(newGrid, prev.currentPiece);
      } else {
        // 通常のテトリミノをグリッドに固定
        for (let row = 0; row < shape.length; row++) {
          for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
              const gridY = prev.currentPiece.y + row;
              const gridX = prev.currentPiece.x + col;
              if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
                newGrid[gridY][gridX] = { 
                  filled: true, 
                  color, 
                  isGarbage: false,
                  specialType: prev.currentPiece.isSpecial ? prev.currentPiece.type as SpecialTetrominoType : undefined,
                };
              }
            }
          }
        }
      }

      // ライン消去チェック
      const linesToClear: number[] = [];
      const specialTypesInClearedLines: SpecialTetrominoType[] = [];
      
      for (let row = 0; row < GRID_HEIGHT; row++) {
        if (newGrid[row].every((cell) => cell.filled)) {
          linesToClear.push(row);
          // 消去する行に含まれる特殊ミノをチェック
          newGrid[row].forEach(cell => {
            if (cell.specialType) {
              specialTypesInClearedLines.push(cell.specialType);
            }
          });
        }
      }

      // ラインを消去
      let clearedGrid = newGrid;
      if (linesToClear.length > 0) {
        clearedGrid = newGrid.filter((_, index) => !linesToClear.includes(index));
        // 上に空の行を追加
        for (let i = 0; i < linesToClear.length; i++) {
          clearedGrid.unshift(
            Array(GRID_WIDTH)
              .fill(null)
              .map(() => ({ filled: false, color: '', isGarbage: false }))
          );
        }
      }

      // 特殊ミノの効果を処理
      let bonusDamage = 0;
      let processedEnemy = prev.enemy;
      let totalFreezeTime = 0;
      
      // 消去されたブロック数をカウント
      const totalBlocksCleared = linesToClear.length * GRID_WIDTH;
      
      specialTypesInClearedLines.forEach(specialType => {
        const result = processSpecialEffect(specialType, clearedGrid, processedEnemy, linesToClear, totalBlocksCleared);
        clearedGrid = result.grid;
        processedEnemy = result.enemy;
        bonusDamage += result.bonusDamage;
        totalFreezeTime += result.freezeTime;
      });
      
      // 凍結時間を敵に反映
      if (totalFreezeTime > 0 && processedEnemy) {
        processedEnemy.isFrozen = true;
        processedEnemy.frozenUntil = Date.now() + totalFreezeTime;
      }

      // コンボ計算
      const now = Date.now();
      const timeSinceLastClear = now - lastClearTimeRef.current;
      let newCombo = prev.combo;
      if (linesToClear.length > 0) {
        if (timeSinceLastClear < 3000) {
          newCombo = prev.combo + 1;
        } else {
          newCombo = 1;
        }
        lastClearTimeRef.current = now;
      } else {
        newCombo = 0;
      }

      // スコアとダメージ計算
      const lineCount = linesToClear.length as 1 | 2 | 3 | 4;
      let scoreGain = 0;
      let damage = 0;
      if (lineCount > 0) {
        scoreGain = SCORE_PER_LINE[lineCount] || 0;
        damage = DAMAGE_PER_LINE[lineCount] || 0;
        
        // 複数ライン消去時のボーナス
        const lineBonus = LINE_CLEAR_BONUS[lineCount] || 1.0;
        damage = Math.floor(damage * lineBonus);
        
        // コンボボーナス
        const comboMultiplier = 1 + (newCombo - 1) * (COMBO_BONUS_PERCENT / 100);
        damage = Math.floor(damage * comboMultiplier);
        
        // パワーアップによるダメージ増加
        const damageBoost = prev.powerUps.filter(p => p.id === 'damage_boost').length;
        damage = Math.floor(damage * (1 + damageBoost * 0.2));
        
        // 特殊ミノボーナスダメージを追加
        damage += bonusDamage;
      }

      // 敵にダメージを与える
      let newEnemy = processedEnemy;
      let newGameState: GameState = prev.gameState;
      let newStage = prev.stage;

      if (newEnemy && damage > 0) {
        newEnemy.currentHp -= damage;
        
        // 攻撃ゲージを減らす
        const blocksClearedCount = linesToClear.length * GRID_WIDTH;
        const gaugeReduction = blocksClearedCount * 50;
        newEnemy.attackTimer = Math.max(0, newEnemy.attackTimer - gaugeReduction);
        
        // 敵が倒された
        if (newEnemy.currentHp <= 0) {
          newGameState = 'powerup';
          newStage = prev.stage + 1;
        }
      }

      // 次のピースを生成
      const { piece: nextPiece, newNextPieces } = spawnPiece(prev.nextPieces, prev.unlockedSpecialMinos);

      // ゲームオーバーチェック
      if (checkCollision(clearedGrid, nextPiece)) {
        newGameState = 'gameover';
      }

      return {
        ...prev,
        grid: clearedGrid,
        currentPiece: nextPiece,
        nextPieces: newNextPieces,
        canHold: true,
        score: prev.score + scoreGain,
        linesCleared: prev.linesCleared + linesToClear.length,
        combo: newCombo,
        enemy: newEnemy,
        gameState: newGameState,
        stage: newStage,
      };
    });
  }, [spawnPiece, applySandGravity, processSpecialEffect]);

  // テトリミノを移動
  const movePiece = useCallback((dx: number, dy: number) => {
    setGameData((prev) => {
      if (!prev.currentPiece || prev.gameState !== 'playing') return prev;

      if (!checkCollision(prev.grid, prev.currentPiece, dx, dy)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            x: prev.currentPiece.x + dx,
            y: prev.currentPiece.y + dy,
          },
        };
      }
      return prev;
    });
  }, []);

  // テトリミノを回転
  const rotatePiece = useCallback((direction: 1 | -1 = 1) => {
    setGameData((prev) => {
      if (!prev.currentPiece || prev.gameState !== 'playing') return prev;

      const newRotation = (prev.currentPiece.rotation + direction + 4) % 4;
      const pieceType = prev.currentPiece.type;
      
      // ウォールキックデータを取得
      const kickData = pieceType === 'I' 
        ? WALL_KICK_DATA.I 
        : WALL_KICK_DATA.JLSTZ;
      
      const kickIndex = direction === 1 
        ? prev.currentPiece.rotation 
        : (prev.currentPiece.rotation + 3) % 4;

      // ウォールキックを試行
      for (const [dx, dy] of kickData[kickIndex]) {
        if (!checkCollision(prev.grid, prev.currentPiece, dx, -dy, newRotation)) {
          return {
            ...prev,
            currentPiece: {
              ...prev.currentPiece,
              x: prev.currentPiece.x + dx,
              y: prev.currentPiece.y - dy,
              rotation: newRotation,
            },
          };
        }
      }

      return prev;
    });
  }, []);

  // ハードドロップ
  const hardDrop = useCallback(() => {
    setGameData((prev) => {
      if (!prev.currentPiece || prev.gameState !== 'playing') return prev;

      let newY = prev.currentPiece.y;
      while (!checkCollision(prev.grid, prev.currentPiece, 0, newY - prev.currentPiece.y + 1)) {
        newY++;
      }

      return {
        ...prev,
        currentPiece: {
          ...prev.currentPiece,
          y: newY,
        },
      };
    });

    // 即座にロック
    setTimeout(() => {
      lockPiece();
    }, 0);
  }, [lockPiece]);

  // ホールド
  const holdPiece = useCallback(() => {
    setGameData((prev) => {
      if (!prev.currentPiece || !prev.canHold || prev.gameState !== 'playing') return prev;

      const currentType = prev.currentPiece.type;
      
      if (prev.holdPiece) {
        // ホールドと交換
        const shape = getShape(prev.holdPiece, 0);
        const isSpecial = !NORMAL_TETROMINOS.includes(prev.holdPiece as TetrominoType);
        const specialData = isSpecial ? SPECIAL_TETROMINOS.find(s => s.id === prev.holdPiece) : undefined;
        
        return {
          ...prev,
          currentPiece: {
            type: prev.holdPiece,
            x: Math.floor((GRID_WIDTH - shape[0].length) / 2),
            y: 0,
            rotation: 0,
            isSpecial,
            specialData,
          },
          holdPiece: currentType,
          canHold: false,
        };
      } else {
        // 新しくホールド
        const { piece, newNextPieces } = spawnPiece(prev.nextPieces, prev.unlockedSpecialMinos);
        return {
          ...prev,
          currentPiece: piece,
          nextPieces: newNextPieces,
          holdPiece: currentType,
          canHold: false,
        };
      }
    });
  }, [spawnPiece]);

  // ゴースト位置を計算
  const getGhostY = useCallback((grid: CellState[][], piece: CurrentPiece | null): number => {
    if (!piece) return 0;
    
    let ghostY = piece.y;
    while (!checkCollision(grid, piece, 0, ghostY - piece.y + 1)) {
      ghostY++;
    }
    return ghostY;
  }, []);

  // 敵の攻撃
  const enemyAttack = useCallback(() => {
    setGameData((prev) => {
      if (!prev.enemy || prev.gameState !== 'playing') return prev;

      // 凍結中は攻撃しない
      if (prev.enemy.isFrozen && Date.now() < prev.enemy.frozenUntil) {
        return prev;
      }

      // 凍結解除
      const newEnemy = {
        ...prev.enemy,
        isFrozen: false,
        frozenUntil: 0,
      };

      const newGrid = prev.grid.map((row) => row.map((cell) => ({ ...cell })));
      const { width, height } = prev.enemy.type.garbageSize;
      const pattern = prev.enemy.type.attackPattern;

      // 攻撃パターンに応じておじゃまブロックを配置
      if (pattern === 'random') {
        // ランダムな位置に配置（複数列にランダムに分散）
        const positions = new Set<number>();
        while (positions.size < Math.min(width, GRID_WIDTH)) {
          positions.add(Math.floor(Math.random() * GRID_WIDTH));
        }
        
        positions.forEach(x => {
          for (let dy = 0; dy < height; dy++) {
            let targetY = GRID_HEIGHT - 1;
            for (let y = 0; y < GRID_HEIGHT; y++) {
              if (newGrid[y][x].filled) {
                targetY = y - 1;
                break;
              }
            }
            
            if (targetY - dy >= 0) {
              newGrid[targetY - dy][x] = {
                filled: true,
                color: TetrominoColors.GARBAGE,
                isGarbage: true,
              };
            }
          }
        });
      } else if (pattern === 'targeted') {
        // 現在のピースの位置を狙う
        const targetX = prev.currentPiece ? prev.currentPiece.x : Math.floor(GRID_WIDTH / 2);
        for (let dx = 0; dx < width; dx++) {
          const x = Math.min(GRID_WIDTH - 1, Math.max(0, targetX + dx));
          for (let dy = 0; dy < height; dy++) {
            let targetY = GRID_HEIGHT - 1;
            for (let y = 0; y < GRID_HEIGHT; y++) {
              if (newGrid[y][x].filled) {
                targetY = y - 1;
                break;
              }
            }
            
            if (targetY - dy >= 0) {
              newGrid[targetY - dy][x] = {
                filled: true,
                color: TetrominoColors.GARBAGE,
                isGarbage: true,
              };
            }
          }
        }
      } else if (pattern === 'column') {
        // 同じ列に積み上げる
        const x = Math.floor(Math.random() * GRID_WIDTH);
        for (let dy = 0; dy < height; dy++) {
          let targetY = GRID_HEIGHT - 1;
          for (let y = 0; y < GRID_HEIGHT; y++) {
            if (newGrid[y][x].filled) {
              targetY = y - 1;
              break;
            }
          }
          
          if (targetY - dy >= 0) {
            newGrid[targetY - dy][x] = {
              filled: true,
              color: TetrominoColors.GARBAGE,
              isGarbage: true,
            };
          }
        }
      }

      // 攻撃タイマーをリセット
      enemyAttackStartRef.current = Date.now();

      return {
        ...prev,
        grid: newGrid,
        enemy: newEnemy,
        attackTimerProgress: 0,
      };
    });
  }, []);

  // パワーアップを選択
  const selectPowerUp = useCallback((powerUp: PowerUp) => {
    setGameData((prev) => {
      // 特殊ミノ解放の処理
      let newUnlockedSpecialMinos = [...prev.unlockedSpecialMinos];
      let selectedShape: string | undefined = undefined;
      
      if (powerUp.type === 'tetromino' && powerUp.effect.unlockTetromino) {
        const minoType = powerUp.effect.unlockTetromino as SpecialTetrominoType;
        if (!newUnlockedSpecialMinos.includes(minoType)) {
          newUnlockedSpecialMinos.push(minoType);
        }
        // 形状情報を保存
        selectedShape = powerUp.effect.shape as string;
      }

      // 次の敵を生成
      const enemyIndex = Math.min(prev.stage - 1, STAGE_ENEMIES.length - 1);
      const enemyId = STAGE_ENEMIES[enemyIndex];
      const enemyType = ENEMIES[enemyId];
      
      const newEnemy: EnemyState = {
        type: enemyType,
        currentHp: enemyType.maxHp,
        attackTimer: enemyType.attackInterval,
        isFrozen: false,
        frozenUntil: 0,
      };

      enemyAttackStartRef.current = Date.now();

      // 新しいピースを生成
      bagRef.current = generateBag(newUnlockedSpecialMinos);
      const initialNextPieces: AllTetrominoType[] = [];
      for (let i = 0; i < 4; i++) {
        if (bagRef.current.length === 0) {
          bagRef.current = generateBag(newUnlockedSpecialMinos);
        }
        initialNextPieces.push(bagRef.current.shift()!);
      }
      const { piece, newNextPieces } = spawnPiece(initialNextPieces, newUnlockedSpecialMinos);
      
      // 形状情報を反映
      if (selectedShape && piece) {
        piece.shape = selectedShape;
      }

      return {
        ...prev,
        currentPiece: piece,
        nextPieces: newNextPieces,
        enemy: newEnemy,
        gameState: 'playing',
        powerUps: [...prev.powerUps, powerUp],
        grid: prev.grid,
        unlockedSpecialMinos: newUnlockedSpecialMinos,
        attackTimerProgress: 0,
      };
    });
  }, [spawnPiece]);

  // タイトルに戻る
  const goToTitle = useCallback(() => {
    setGameData((prev) => ({
      ...prev,
      gameState: 'title',
    }));
  }, []);

  // 自動落下
  useEffect(() => {
    if (gameData.gameState !== 'playing' || !gameData.currentPiece) {
      if (dropTimerRef.current) {
        clearTimeout(dropTimerRef.current);
        dropTimerRef.current = null;
      }
      return;
    }

    const dropInterval = INITIAL_DROP_INTERVAL;
    
    const drop = () => {
      setGameData((prev) => {
        if (!prev.currentPiece || prev.gameState !== 'playing') return prev;

        if (!checkCollision(prev.grid, prev.currentPiece, 0, 1)) {
          return {
            ...prev,
            currentPiece: {
              ...prev.currentPiece,
              y: prev.currentPiece.y + 1,
            },
          };
        } else {
          // 着地したらロックタイマーを開始
          if (!lockTimerRef.current) {
            lockTimerRef.current = setTimeout(() => {
              lockPiece();
              lockTimerRef.current = null;
            }, LOCK_DELAY);
          }
          return prev;
        }
      });
    };

    dropTimerRef.current = setTimeout(drop, dropInterval);

    return () => {
      if (dropTimerRef.current) {
        clearTimeout(dropTimerRef.current);
      }
    };
  }, [gameData.gameState, gameData.currentPiece?.y, lockPiece]);

  // 敵の攻撃タイマー
  useEffect(() => {
    if (gameData.gameState !== 'playing' || !gameData.enemy) {
      if (enemyTimerRef.current) {
        clearInterval(enemyTimerRef.current);
        enemyTimerRef.current = null;
      }
      if (attackProgressTimerRef.current) {
        clearInterval(attackProgressTimerRef.current);
        attackProgressTimerRef.current = null;
      }
      return;
    }

    const attackInterval = gameData.enemy.type.attackInterval;
    
    enemyTimerRef.current = setInterval(() => {
      enemyAttack();
    }, attackInterval);

    // 攻撃タイマーの進行度を更新
    attackProgressTimerRef.current = setInterval(() => {
      setGameData((prev) => {
        if (!prev.enemy || prev.gameState !== 'playing') return prev;
        
        // 凍結中は進行しない
        if (prev.enemy.isFrozen && Date.now() < prev.enemy.frozenUntil) {
          return prev;
        }

        const elapsed = Date.now() - enemyAttackStartRef.current;
        const progress = Math.min(1, elapsed / prev.enemy.type.attackInterval);
        
        return {
          ...prev,
          attackTimerProgress: progress,
        };
      });
    }, 100);

    return () => {
      if (enemyTimerRef.current) {
        clearInterval(enemyTimerRef.current);
      }
      if (attackProgressTimerRef.current) {
        clearInterval(attackProgressTimerRef.current);
      }
    };
  }, [gameData.gameState, gameData.enemy?.type.id, enemyAttack]);

  return {
    gameData,
    startGame,
    movePiece,
    rotatePiece,
    hardDrop,
    holdPiece,
    getGhostY,
    selectPowerUp,
    goToTitle,
  };
};

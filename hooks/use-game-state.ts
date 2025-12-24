/**
 * テトリスローグライク - ゲーム状態管理フック
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  TETROMINO_SHAPES,
  TetrominoType,
  WALL_KICK_DATA,
  INITIAL_DROP_INTERVAL,
  SOFT_DROP_INTERVAL,
  LOCK_DELAY,
  SCORE_PER_LINE,
  DAMAGE_PER_LINE,
  COMBO_BONUS_PERCENT,
  ENEMIES,
  EnemyType,
  PowerUp,
} from '@/constants/game';
import { TetrominoColors } from '@/constants/theme';

// セルの状態
export type CellState = {
  filled: boolean;
  color: string;
  isGarbage: boolean;
};

// 現在のテトリミノの状態
export type CurrentPiece = {
  type: TetrominoType;
  x: number;
  y: number;
  rotation: number;
};

// 敵の状態
export type EnemyState = {
  type: EnemyType;
  currentHp: number;
  attackTimer: number;
};

// ゲームの状態
export type GameState = 'title' | 'playing' | 'paused' | 'powerup' | 'gameover';

// ゲーム全体の状態
export interface GameData {
  grid: CellState[][];
  currentPiece: CurrentPiece | null;
  nextPieces: TetrominoType[];
  holdPiece: TetrominoType | null;
  canHold: boolean;
  score: number;
  level: number;
  linesCleared: number;
  combo: number;
  enemy: EnemyState | null;
  gameState: GameState;
  powerUps: PowerUp[];
  stage: number;
}

// 7-bag方式でテトリミノを生成
const generateBag = (): TetrominoType[] => {
  const pieces: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
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
const getShape = (type: TetrominoType, rotation: number): number[][] => {
  return TETROMINO_SHAPES[type][rotation];
};

// 衝突判定
const checkCollision = (
  grid: CellState[][],
  piece: CurrentPiece,
  offsetX: number = 0,
  offsetY: number = 0,
  newRotation?: number
): boolean => {
  const shape = getShape(piece.type, newRotation ?? piece.rotation);
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
  });

  const bagRef = useRef<TetrominoType[]>([]);
  const dropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enemyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastClearTimeRef = useRef<number>(0);

  // 次のテトリミノを取得
  const getNextPiece = useCallback((): TetrominoType => {
    if (bagRef.current.length === 0) {
      bagRef.current = generateBag();
    }
    return bagRef.current.shift()!;
  }, []);

  // 新しいテトリミノを生成
  const spawnPiece = useCallback((nextPieces: TetrominoType[]): { piece: CurrentPiece; newNextPieces: TetrominoType[] } => {
    const type = nextPieces[0];
    const newNextPieces = [...nextPieces.slice(1)];
    
    // 次のピースを補充
    while (newNextPieces.length < 3) {
      newNextPieces.push(getNextPiece());
    }

    const shape = getShape(type, 0);
    const piece: CurrentPiece = {
      type,
      x: Math.floor((GRID_WIDTH - shape[0].length) / 2),
      y: -1,
      rotation: 0,
    };

    return { piece, newNextPieces };
  }, [getNextPiece]);

  // ゲーム開始
  const startGame = useCallback(() => {
    // 初期のネクストピースを生成
    bagRef.current = generateBag();
    const initialNextPieces: TetrominoType[] = [];
    for (let i = 0; i < 4; i++) {
      initialNextPieces.push(getNextPiece());
    }

    const { piece, newNextPieces } = spawnPiece(initialNextPieces);
    
    // 敵を生成
    const enemyType = ENEMIES.slime;
    const enemy: EnemyState = {
      type: enemyType,
      currentHp: enemyType.maxHp,
      attackTimer: enemyType.attackInterval,
    };

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
    });
  }, [getNextPiece, spawnPiece]);

  // テトリミノを固定
  const lockPiece = useCallback(() => {
    setGameData((prev) => {
      if (!prev.currentPiece || prev.gameState !== 'playing') return prev;

      const newGrid = prev.grid.map((row) => row.map((cell) => ({ ...cell })));
      const shape = getShape(prev.currentPiece.type, prev.currentPiece.rotation);
      const color = TetrominoColors[prev.currentPiece.type];

      // テトリミノをグリッドに固定
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            const gridY = prev.currentPiece.y + row;
            const gridX = prev.currentPiece.x + col;
            if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
              newGrid[gridY][gridX] = { filled: true, color, isGarbage: false };
            }
          }
        }
      }

      // ライン消去チェック
      const linesToClear: number[] = [];
      for (let row = 0; row < GRID_HEIGHT; row++) {
        if (newGrid[row].every((cell) => cell.filled)) {
          linesToClear.push(row);
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
        
        // コンボボーナス
        const comboMultiplier = 1 + (newCombo - 1) * (COMBO_BONUS_PERCENT / 100);
        damage = Math.floor(damage * comboMultiplier);
        
        // パワーアップによるダメージ増加
        const damageBoost = prev.powerUps.find(p => p.id === 'damage_boost');
        if (damageBoost) {
          damage = Math.floor(damage * (damageBoost.effect.damageMultiplier as number));
        }
      }

      // 敵にダメージを与える
      let newEnemy = prev.enemy;
      let newGameState: GameState = prev.gameState;
      let newStage = prev.stage;
      if (newEnemy && damage > 0) {
        newEnemy = {
          ...newEnemy,
          currentHp: Math.max(0, newEnemy.currentHp - damage),
        };
        
        // 敵を倒した場合
        if (newEnemy.currentHp <= 0) {
          newGameState = 'powerup';
          newStage = prev.stage + 1;
        }
      }

      // 新しいテトリミノを生成
      const { piece: newPiece, newNextPieces } = spawnPiece(prev.nextPieces);

      // ゲームオーバーチェック
      if (checkCollision(clearedGrid, newPiece)) {
        return {
          ...prev,
          grid: clearedGrid,
          currentPiece: null,
          gameState: 'gameover',
          score: prev.score + scoreGain,
          linesCleared: prev.linesCleared + linesToClear.length,
          combo: newCombo,
          enemy: newEnemy,
        };
      }

      return {
        ...prev,
        grid: clearedGrid,
        currentPiece: newPiece,
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
  }, [spawnPiece]);

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
      const kickData = prev.currentPiece.type === 'I' ? WALL_KICK_DATA.I : WALL_KICK_DATA.JLSTZ;
      const kickIndex = direction === 1 ? prev.currentPiece.rotation : (prev.currentPiece.rotation + 3) % 4;

      // ウォールキックを試行
      for (const [kickX, kickY] of kickData[kickIndex]) {
        if (!checkCollision(prev.grid, prev.currentPiece, kickX, -kickY, newRotation)) {
          return {
            ...prev,
            currentPiece: {
              ...prev.currentPiece,
              x: prev.currentPiece.x + kickX,
              y: prev.currentPiece.y - kickY,
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

      let dropDistance = 0;
      while (!checkCollision(prev.grid, prev.currentPiece, 0, dropDistance + 1)) {
        dropDistance++;
      }

      return {
        ...prev,
        currentPiece: {
          ...prev.currentPiece,
          y: prev.currentPiece.y + dropDistance,
        },
        score: prev.score + dropDistance * 2,
      };
    });
    
    // 即座に固定
    setTimeout(lockPiece, 0);
  }, [lockPiece]);

  // ホールド
  const holdPiece = useCallback(() => {
    setGameData((prev) => {
      if (!prev.currentPiece || !prev.canHold || prev.gameState !== 'playing') return prev;

      const currentType = prev.currentPiece.type;
      
      if (prev.holdPiece) {
        // ホールドと交換
        const shape = getShape(prev.holdPiece, 0);
        const newPiece: CurrentPiece = {
          type: prev.holdPiece,
          x: Math.floor((GRID_WIDTH - shape[0].length) / 2),
          y: -1,
          rotation: 0,
        };
        
        return {
          ...prev,
          currentPiece: newPiece,
          holdPiece: currentType,
          canHold: false,
        };
      } else {
        // 新しいピースを生成
        const { piece: newPiece, newNextPieces } = spawnPiece(prev.nextPieces);
        
        return {
          ...prev,
          currentPiece: newPiece,
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

  // 敵の攻撃（おじゃまブロック配置）
  const enemyAttack = useCallback(() => {
    setGameData((prev) => {
      if (!prev.enemy || prev.gameState !== 'playing') return prev;

      const newGrid = prev.grid.map((row) => row.map((cell) => ({ ...cell })));
      const { garbageSize, attackPattern } = prev.enemy.type;

      // 攻撃パターンに応じた位置を決定
      let startX: number;
      if (attackPattern === 'random') {
        startX = Math.floor(Math.random() * (GRID_WIDTH - garbageSize.width));
      } else if (attackPattern === 'targeted') {
        // プレイヤーの積み上げが高い場所を狙う
        let maxHeight = 0;
        let targetX = 0;
        for (let x = 0; x < GRID_WIDTH; x++) {
          for (let y = 0; y < GRID_HEIGHT; y++) {
            if (newGrid[y][x].filled) {
              const height = GRID_HEIGHT - y;
              if (height > maxHeight) {
                maxHeight = height;
                targetX = x;
              }
              break;
            }
          }
        }
        startX = Math.max(0, Math.min(targetX, GRID_WIDTH - garbageSize.width));
      } else {
        // column: ランダムな列に縦長のブロック
        startX = Math.floor(Math.random() * GRID_WIDTH);
      }

      // おじゃまブロックを配置（上から落とす）
      for (let dx = 0; dx < garbageSize.width; dx++) {
        for (let dy = 0; dy < garbageSize.height; dy++) {
          const x = startX + dx;
          if (x >= 0 && x < GRID_WIDTH) {
            // 空いている一番下の位置を探す
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
      }

      return {
        ...prev,
        grid: newGrid,
      };
    });
  }, []);

  // パワーアップを選択
  const selectPowerUp = useCallback((powerUp: PowerUp) => {
    setGameData((prev) => {
      // 次の敵を生成
      const enemyKeys = Object.keys(ENEMIES);
      const enemyIndex = Math.min(prev.stage - 1, enemyKeys.length - 1);
      const enemyType = ENEMIES[enemyKeys[enemyIndex]];
      
      const newEnemy: EnemyState = {
        type: enemyType,
        currentHp: enemyType.maxHp,
        attackTimer: enemyType.attackInterval,
      };

      // 新しいピースを生成
      const { piece, newNextPieces } = spawnPiece(prev.nextPieces);

      return {
        ...prev,
        currentPiece: piece,
        nextPieces: newNextPieces,
        enemy: newEnemy,
        gameState: 'playing',
        powerUps: [...prev.powerUps, powerUp],
        grid: createEmptyGrid(),
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
      return;
    }

    const attackInterval = gameData.enemy.type.attackInterval;
    
    enemyTimerRef.current = setInterval(() => {
      enemyAttack();
    }, attackInterval);

    return () => {
      if (enemyTimerRef.current) {
        clearInterval(enemyTimerRef.current);
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

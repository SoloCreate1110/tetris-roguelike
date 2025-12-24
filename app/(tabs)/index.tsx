/**
 * テトリスローグライク - メインゲーム画面
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemedView } from '@/components/themed-view';
import { TetrisGrid } from '@/components/game/TetrisGrid';
import { NextPieces } from '@/components/game/NextPieces';
import { HoldPiece } from '@/components/game/HoldPiece';
import { EnemyDisplay } from '@/components/game/EnemyDisplay';
import { GameStats } from '@/components/game/GameStats';
import { GameControls } from '@/components/game/GameControls';
import { TitleScreen } from '@/components/game/TitleScreen';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { PowerUpSelection } from '@/components/game/PowerUpSelection';
import { PauseScreen } from '@/components/game/PauseScreen';
import { PowerUpDisplay } from '@/components/game/PowerUpDisplay';
import { useGameState } from '@/hooks/use-game-state';
import { useSound, SoundType } from '@/hooks/use-sound';
import { GRID_WIDTH, GRID_HEIGHT } from '@/constants/game';
import { Colors } from '@/constants/theme';

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { playSound } = useSound();
  const [isPaused, setPaused] = React.useState(false);
  
  const {
    gameData,
    startGame,
    movePiece,
    rotatePiece,
    hardDrop,
    holdPiece,
    getGhostY,
    selectPowerUp,
    goToTitle,
  } = useGameState();

  // 前回の状態を追跡
  const prevLinesRef = useRef(gameData.linesCleared);
  const prevComboRef = useRef(gameData.combo);
  const prevEnemyHpRef = useRef(gameData.enemy?.currentHp ?? 0);
  const prevStageRef = useRef(gameData.stage);

  // 効果音を再生
  useEffect(() => {
    // ライン消去音
    if (gameData.linesCleared > prevLinesRef.current) {
      const linesCleared = gameData.linesCleared - prevLinesRef.current;
      if (linesCleared >= 4) {
        playSound('tetris');
      } else {
        playSound('lineClear');
      }
    }
    prevLinesRef.current = gameData.linesCleared;
  }, [gameData.linesCleared, playSound]);

  useEffect(() => {
    // コンボ音
    if (gameData.combo > prevComboRef.current && gameData.combo > 1) {
      playSound('combo');
    }
    prevComboRef.current = gameData.combo;
  }, [gameData.combo, playSound]);

  useEffect(() => {
    // 敵へのダメージ音
    if (gameData.enemy && gameData.enemy.currentHp < prevEnemyHpRef.current) {
      if (gameData.enemy.currentHp <= 0) {
        playSound('enemyDefeat');
      } else {
        playSound('enemyDamage');
      }
    }
    prevEnemyHpRef.current = gameData.enemy?.currentHp ?? 0;
  }, [gameData.enemy?.currentHp, playSound]);

  useEffect(() => {
    // ステージ開始音
    if (gameData.stage > prevStageRef.current) {
      playSound('stageStart');
    }
    prevStageRef.current = gameData.stage;
  }, [gameData.stage, playSound]);

  useEffect(() => {
    // ゲームオーバー音
    if (gameData.gameState === 'gameover') {
      playSound('gameOver');
    }
  }, [gameData.gameState, playSound]);

  // セルサイズを画面サイズに基づいて計算
  const cellSize = useMemo(() => {
    const availableHeight = screenHeight - insets.top - insets.bottom - 200; // コントロール用のスペース
    const availableWidth = screenWidth * 0.6; // グリッドは画面幅の60%
    
    const maxCellByHeight = Math.floor(availableHeight / GRID_HEIGHT);
    const maxCellByWidth = Math.floor(availableWidth / GRID_WIDTH);
    
    return Math.min(maxCellByHeight, maxCellByWidth, 20);
  }, [screenWidth, screenHeight, insets]);

  // ゴースト位置を計算
  const ghostY = useMemo(() => {
    return getGhostY(gameData.grid, gameData.currentPiece);
  }, [gameData.grid, gameData.currentPiece, getGhostY]);

  // ジェスチャーハンドラー
  const swipeGesture = Gesture.Pan()
    .minDistance(20)
    .onEnd((event) => {
      if (gameData.gameState !== 'playing' || isPaused) return;
      
      const { translationX, translationY, velocityY } = event;
      
      // 下方向への高速スワイプ = ハードドロップ
      if (velocityY > 1000 && Math.abs(translationY) > Math.abs(translationX)) {
        playSound('hardDrop');
        hardDrop();
        return;
      }
      
      // 横方向のスワイプ
      if (Math.abs(translationX) > Math.abs(translationY)) {
        if (translationX > 30) {
          playSound('move');
          movePiece(1, 0);
        } else if (translationX < -30) {
          playSound('move');
          movePiece(-1, 0);
        }
      }
      // 下方向のスワイプ = ソフトドロップ
      else if (translationY > 30) {
        playSound('drop');
        movePiece(0, 1);
      }
      // 上方向のスワイプ = ホールド
      else if (translationY < -30) {
        playSound('hold');
        holdPiece();
      }
    });

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (gameData.gameState !== 'playing' || isPaused) return;
      playSound('rotate');
      rotatePiece(1);
    });

  const combinedGesture = Gesture.Race(swipeGesture, tapGesture);

  // コントロールハンドラー（ワンタップで1マス移動）
  const handleMoveLeft = useCallback(() => {
    playSound('move');
    movePiece(-1, 0);
  }, [movePiece, playSound]);
  
  const handleMoveRight = useCallback(() => {
    playSound('move');
    movePiece(1, 0);
  }, [movePiece, playSound]);
  
  const handleRotate = useCallback(() => {
    playSound('rotate');
    rotatePiece(1);
  }, [rotatePiece, playSound]);
  
  const handleSoftDrop = useCallback(() => {
    playSound('drop');
    movePiece(0, 1);
  }, [movePiece, playSound]);
  
  const handleHardDrop = useCallback(() => {
    playSound('hardDrop');
    hardDrop();
  }, [hardDrop, playSound]);
  
  const handleHold = useCallback(() => {
    playSound('hold');
    holdPiece();
  }, [holdPiece, playSound]);

  const handlePause = useCallback(() => {
    setPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setPaused(false);
  }, []);

  const handleRetry = useCallback(() => {
    setPaused(false);
    startGame();
  }, [startGame]);

  const handleGoToTitle = useCallback(() => {
    setPaused(false);
    goToTitle();
  }, [goToTitle]);

  // パワーアップ選択時
  const handleSelectPowerUp = useCallback((powerUp: any) => {
    playSound('powerUp');
    selectPowerUp(powerUp);
  }, [selectPowerUp, playSound]);

  // タイトル画面
  if (gameData.gameState === 'title') {
    return <TitleScreen onStart={startGame} />;
  }

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <ThemedView
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <GestureDetector gesture={combinedGesture}>
          <View style={styles.gameArea}>
            {/* 左側: 敵とホールド */}
            <View style={styles.leftPanel}>
              <EnemyDisplay 
                enemy={gameData.enemy} 
                attackTimer={gameData.attackTimerProgress}
                isFrozen={gameData.enemy?.isFrozen ?? false}
              />
              <HoldPiece
                piece={gameData.holdPiece}
                canHold={gameData.canHold}
                cellSize={8}
              />
            </View>

            {/* 中央: テトリスグリッド */}
            <View style={styles.centerPanel}>
              <TetrisGrid
                grid={gameData.grid}
                currentPiece={gameData.currentPiece}
                ghostY={ghostY}
                cellSize={cellSize}
              />
              {/* ポーズボタン */}
              {gameData.gameState === 'playing' && (
                <Pressable
                  style={({ pressed }) => [
                    styles.pauseButton,
                    pressed && styles.pauseButtonPressed,
                  ]}
                  onPress={handlePause}
                >
                  <Text style={styles.pauseButtonText}>⏸</Text>
                </Pressable>
              )}
            </View>

            {/* 右側: ネクストとステータス */}
            <View style={styles.rightPanel}>
              <NextPieces pieces={gameData.nextPieces} cellSize={8} />
              <GameStats
                score={gameData.score}
                stage={gameData.stage}
                combo={gameData.combo}
                linesCleared={gameData.linesCleared}
              />
            </View>
          </View>
        </GestureDetector>

        {/* 能力表示 */}
        {gameData.powerUps.length > 0 && (
          <PowerUpDisplay powerUps={gameData.powerUps} maxDisplay={5} />
        )}

        {/* コントロール */}
        <View style={styles.controlsArea}>
          <GameControls
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
            onRotate={handleRotate}
            onSoftDrop={handleSoftDrop}
            onHardDrop={handleHardDrop}
            onHold={handleHold}
          />
        </View>

        {/* パワーアップ選択画面 */}
        {gameData.gameState === 'powerup' && (
          <PowerUpSelection
            onSelect={handleSelectPowerUp}
            currentPowerUps={gameData.powerUps}
          />
        )}

        {/* ゲームオーバー画面 */}
        {gameData.gameState === 'gameover' && (
          <GameOverScreen
            score={gameData.score}
            stage={gameData.stage}
            linesCleared={gameData.linesCleared}
            onRetry={startGame}
            onTitle={goToTitle}
          />
        )}

        {/* ポーズ画面 */}
        <PauseScreen
          visible={isPaused}
          onResume={handleResume}
          onRetry={handleRetry}
          onGoToTitle={handleGoToTitle}
        />
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  gameArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  leftPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    maxWidth: 90,
  },
  centerPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    position: 'relative',
  },
  rightPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    maxWidth: 90,
  },
  controlsArea: {
    paddingVertical: 8,
  },
  pauseButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pauseButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  pauseButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
});

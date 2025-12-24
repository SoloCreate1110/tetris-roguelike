/**
 * テトリスローグライク - メインゲーム画面
 */

import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
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
import { useGameState } from '@/hooks/use-game-state';
import { GRID_WIDTH, GRID_HEIGHT } from '@/constants/game';
import { Colors } from '@/constants/theme';

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
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
      if (gameData.gameState !== 'playing') return;
      
      const { translationX, translationY, velocityY } = event;
      
      // 下方向への高速スワイプ = ハードドロップ
      if (velocityY > 1000 && Math.abs(translationY) > Math.abs(translationX)) {
        hardDrop();
        return;
      }
      
      // 横方向のスワイプ
      if (Math.abs(translationX) > Math.abs(translationY)) {
        if (translationX > 30) {
          movePiece(1, 0);
        } else if (translationX < -30) {
          movePiece(-1, 0);
        }
      }
      // 下方向のスワイプ = ソフトドロップ
      else if (translationY > 30) {
        movePiece(0, 1);
      }
      // 上方向のスワイプ = ホールド
      else if (translationY < -30) {
        holdPiece();
      }
    });

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (gameData.gameState !== 'playing') return;
      rotatePiece(1);
    });

  const combinedGesture = Gesture.Race(swipeGesture, tapGesture);

  // コントロールハンドラー
  const handleMoveLeft = useCallback(() => movePiece(-1, 0), [movePiece]);
  const handleMoveRight = useCallback(() => movePiece(1, 0), [movePiece]);
  const handleRotate = useCallback(() => rotatePiece(1), [rotatePiece]);
  const handleSoftDrop = useCallback(() => movePiece(0, 1), [movePiece]);
  const handleHardDrop = useCallback(() => hardDrop(), [hardDrop]);
  const handleHold = useCallback(() => holdPiece(), [holdPiece]);

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
              <EnemyDisplay enemy={gameData.enemy} />
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
            onSelect={selectPowerUp}
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
});

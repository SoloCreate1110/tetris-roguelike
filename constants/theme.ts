/**
 * テトリスローグライク - カラーテーマ
 */

import { Platform } from "react-native";

// ゲームのメインカラー
const primaryColor = "#FF6B35"; // オレンジ - アクセント
const darkBackground = "#1A1A2E"; // ダークネイビー - 背景
const surfaceColor = "#16213E"; // ダークブルー - カード背景

export const Colors = {
  light: {
    text: "#FFFFFF",
    background: darkBackground,
    tint: primaryColor,
    icon: "#A0A0A0",
    tabIconDefault: "#A0A0A0",
    tabIconSelected: primaryColor,
    surface: surfaceColor,
    primary: primaryColor,
  },
  dark: {
    text: "#FFFFFF",
    background: darkBackground,
    tint: primaryColor,
    icon: "#A0A0A0",
    tabIconDefault: "#A0A0A0",
    tabIconSelected: primaryColor,
    surface: surfaceColor,
    primary: primaryColor,
  },
};

// テトリミノの色
export const TetrominoColors = {
  I: "#00F0F0", // シアン
  O: "#F0F000", // イエロー
  T: "#A000F0", // パープル
  S: "#00F000", // グリーン
  Z: "#F00000", // レッド
  J: "#0000F0", // ブルー
  L: "#F0A000", // オレンジ
  GARBAGE: "#808080", // おじゃまブロック
  GHOST: "rgba(255, 255, 255, 0.3)", // ゴーストピース
};

// ゲームUI用の色
export const GameColors = {
  enemyHp: "#FF4444",
  enemyHpBackground: "#440000",
  combo: "#FFD700",
  score: "#FFFFFF",
  gridLine: "rgba(255, 255, 255, 0.1)",
  gridBackground: "rgba(0, 0, 0, 0.5)",
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

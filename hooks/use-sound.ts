/**
 * 効果音フック
 */

import { useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// 効果音の種類
export type SoundType = 
  | 'move'
  | 'rotate'
  | 'drop'
  | 'hardDrop'
  | 'lineClear'
  | 'tetris'
  | 'combo'
  | 'hold'
  | 'enemyAttack'
  | 'enemyDamage'
  | 'enemyDefeat'
  | 'powerUp'
  | 'gameOver'
  | 'stageStart'
  | 'specialFire'
  | 'specialIce'
  | 'specialBomb'
  | 'specialLightning';

// Web Audio APIを使用した簡易効果音生成
const createWebSound = (type: SoundType): (() => void) => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return () => {};
  }

  return () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 効果音の種類に応じて音を設定
      switch (type) {
        case 'move':
          oscillator.frequency.value = 200;
          oscillator.type = 'square';
          gainNode.gain.value = 0.05;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.05);
          break;

        case 'rotate':
          oscillator.frequency.value = 300;
          oscillator.type = 'square';
          gainNode.gain.value = 0.05;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.08);
          break;

        case 'drop':
          oscillator.frequency.value = 150;
          oscillator.type = 'triangle';
          gainNode.gain.value = 0.08;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
          break;

        case 'hardDrop':
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.15);
          oscillator.type = 'sawtooth';
          gainNode.gain.value = 0.1;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.15);
          break;

        case 'lineClear':
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
          oscillator.type = 'sine';
          gainNode.gain.value = 0.1;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.2);
          break;

        case 'tetris':
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
          oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.3);
          oscillator.type = 'sine';
          gainNode.gain.value = 0.12;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.4);
          break;

        case 'combo':
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.15);
          oscillator.type = 'sine';
          gainNode.gain.value = 0.08;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.15);
          break;

        case 'hold':
          oscillator.frequency.value = 350;
          oscillator.type = 'sine';
          gainNode.gain.value = 0.06;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
          break;

        case 'enemyAttack':
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.2);
          oscillator.type = 'sawtooth';
          gainNode.gain.value = 0.1;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.2);
          break;

        case 'enemyDamage':
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.1);
          oscillator.type = 'square';
          gainNode.gain.value = 0.08;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
          break;

        case 'enemyDefeat':
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.3);
          oscillator.type = 'sine';
          gainNode.gain.value = 0.12;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.4);
          break;

        case 'powerUp':
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
          oscillator.type = 'sine';
          gainNode.gain.value = 0.1;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;

        case 'gameOver':
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
          oscillator.type = 'sawtooth';
          gainNode.gain.value = 0.1;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.5);
          break;

        case 'stageStart':
          oscillator.frequency.setValueAtTime(262, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(330, audioContext.currentTime + 0.15);
          oscillator.frequency.setValueAtTime(392, audioContext.currentTime + 0.3);
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime + 0.45);
          oscillator.type = 'sine';
          gainNode.gain.value = 0.1;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.6);
          break;

        case 'specialFire':
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
          oscillator.type = 'sawtooth';
          gainNode.gain.value = 0.1;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.25);
          break;

        case 'specialIce':
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.2);
          oscillator.type = 'sine';
          gainNode.gain.value = 0.08;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.25);
          break;

        case 'specialBomb':
          oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
          oscillator.type = 'sawtooth';
          gainNode.gain.value = 0.15;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;

        case 'specialLightning':
          oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
          oscillator.type = 'square';
          gainNode.gain.value = 0.1;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.15);
          break;

        default:
          oscillator.frequency.value = 440;
          oscillator.type = 'sine';
          gainNode.gain.value = 0.05;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
      }

      // クリーンアップ
      setTimeout(() => {
        audioContext.close();
      }, 1000);
    } catch (e) {
      // Audio API not available
    }
  };
};

export const useSound = () => {
  const soundEnabled = useRef(true);
  const soundFunctions = useRef<Map<SoundType, () => void>>(new Map());

  // 初期化時に全効果音を準備
  useEffect(() => {
    const soundTypes: SoundType[] = [
      'move', 'rotate', 'drop', 'hardDrop', 'lineClear', 'tetris',
      'combo', 'hold', 'enemyAttack', 'enemyDamage', 'enemyDefeat',
      'powerUp', 'gameOver', 'stageStart', 'specialFire', 'specialIce',
      'specialBomb', 'specialLightning'
    ];

    soundTypes.forEach(type => {
      soundFunctions.current.set(type, createWebSound(type));
    });

    // オーディオモードを設定
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    }).catch(() => {});
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (!soundEnabled.current) return;
    
    const soundFn = soundFunctions.current.get(type);
    if (soundFn) {
      soundFn();
    }
  }, []);

  const toggleSound = useCallback(() => {
    soundEnabled.current = !soundEnabled.current;
    return soundEnabled.current;
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    soundEnabled.current = enabled;
  }, []);

  return {
    playSound,
    toggleSound,
    setSoundEnabled,
    isSoundEnabled: () => soundEnabled.current,
  };
};

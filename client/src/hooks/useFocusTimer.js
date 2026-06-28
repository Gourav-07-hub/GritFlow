/**
 * useFocusTimer.js — Custom React hook for Pomodoro timer state and logic
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSettings, createSession } from '../services/focusService';

const DEFAULT_SETTINGS = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
};

/**
 * Play a pleasant synthesized notification chime using the Web Audio API.
 * This avoids external asset loading issues and runs offline safely.
 */
const playChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sine';
    // Play a dual tone chime (E5 -> A5)
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
    osc.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.8);
  } catch (err) {
    console.warn('Audio chime playback failed:', err);
  }
};

/**
 * Helper to get timer duration in minutes based on mode
 */
const getDurationForMode = (mode, settingsObj) => {
  switch (mode) {
    case 'focus':
      return settingsObj.focusDuration;
    case 'short_break':
      return settingsObj.shortBreakDuration;
    case 'long_break':
      return settingsObj.longBreakDuration;
    default:
      return 25;
  }
};

export default function useFocusTimer(onSessionCompleted) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [timerMode, setTimerMode] = useState('focus'); // 'focus' | 'short_break' | 'long_break'
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [currentLabel, setCurrentLabel] = useState('');

  // Use refs to access current states inside the ticking callback without re-binding
  const stateRef = useRef({
    timerMode,
    timeLeft,
    isRunning,
    sessionCount,
    currentLabel,
    settings,
  });

  useEffect(() => {
    stateRef.current = {
      timerMode,
      timeLeft,
      isRunning,
      sessionCount,
      currentLabel,
      settings,
    };
  }, [timerMode, timeLeft, isRunning, sessionCount, currentLabel, settings]);

  // Load settings from API
  const loadSettings = useCallback(async () => {
    try {
      const data = await getSettings();
      setSettings(data);
      // Update timeLeft if timer has not been started yet
      if (!isRunning && !isPaused) {
        const mins = getDurationForMode(timerMode, data);
        setTimeLeft(mins * 60);
      }
    } catch (err) {
      console.error('Failed to load focus settings:', err);
    }
  }, [isRunning, isPaused, timerMode]);

  // Actions
  const startTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    const mins = getDurationForMode(timerMode, settings);
    setTimeLeft(mins * 60);
  }, [timerMode, settings]);

  const switchMode = useCallback((newMode) => {
    setTimerMode(newMode);
    setIsRunning(false);
    setIsPaused(false);
    const mins = getDurationForMode(newMode, settings);
    setTimeLeft(mins * 60);
  }, [settings]);

  const skipSession = useCallback(() => {
    const { timerMode: currentMode, sessionCount: currentSessCount, settings: currentSet } = stateRef.current;
    let nextMode = 'focus';
    let nextSessCount = currentSessCount;

    if (currentMode === 'focus') {
      nextSessCount = currentSessCount + 1;
      setSessionCount(nextSessCount);
      if (nextSessCount > 0 && nextSessCount % currentSet.sessionsBeforeLongBreak === 0) {
        nextMode = 'long_break';
      } else {
        nextMode = 'short_break';
      }
    } else {
      nextMode = 'focus';
    }

    setTimerMode(nextMode);
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(getDurationForMode(nextMode, currentSet) * 60);
  }, []);

  // Timer Tick implementation
  useEffect(() => {
    let intervalId = null;

    if (isRunning) {
      intervalId = setInterval(async () => {
        const { timeLeft: currentSecs, timerMode: mode, currentLabel: label, settings: activeSettings, sessionCount: activeSessCount } = stateRef.current;

        if (currentSecs > 1) {
          setTimeLeft((prev) => prev - 1);
        } else {
          // Time hit 0!
          setTimeLeft(0);
          setIsRunning(false);
          setIsPaused(false);
          clearInterval(intervalId);

          // Play audio alert
          playChime();

          let nextMode = 'focus';
          let nextSessCount = activeSessCount;

          if (mode === 'focus') {
            nextSessCount = activeSessCount + 1;
            setSessionCount(nextSessCount);

            // Log session on the backend
            try {
              await createSession({
                type: 'focus',
                duration: activeSettings.focusDuration,
                label: label || '',
                isCompleted: true,
              });
              window.dispatchEvent(new CustomEvent('check-achievements'));
              if (onSessionCompleted) {
                onSessionCompleted();
              }
            } catch (err) {
              console.error('Failed to log focus session:', err);
            }

            // Decide break type
            if (nextSessCount > 0 && nextSessCount % activeSettings.sessionsBeforeLongBreak === 0) {
              nextMode = 'long_break';
            } else {
              nextMode = 'short_break';
            }
          } else {
            // Finished a break, transition back to focus mode
            nextMode = 'focus';
          }

          setTimerMode(nextMode);
          const nextMins = getDurationForMode(nextMode, activeSettings);
          setTimeLeft(nextMins * 60);

          // Handle automatic start triggers
          if (mode === 'focus') {
            // Next is break
            if (activeSettings.autoStartBreaks) {
              setIsRunning(true);
            }
          } else {
            // Next is focus
            if (activeSettings.autoStartFocus) {
              setIsRunning(true);
            }
          }
        }
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, onSessionCompleted]);

  // Load settings on initial mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    timerMode,
    timeLeft,
    isRunning,
    isPaused,
    sessionCount,
    currentLabel,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    switchMode,
    setCurrentLabel,
    loadSettings,
  };
}

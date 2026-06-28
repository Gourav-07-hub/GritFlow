/**
 * FocusPage.jsx — Pomodoro Focus Timer with integrated logs, stats, and settings
 */

import React, { useState, useEffect } from 'react';
import useFocusTimer from '../hooks/useFocusTimer';
import useFocusStats from '../hooks/useFocusStats';
import TimerDisplay from '../components/focus/TimerDisplay';
import TimerControls from '../components/focus/TimerControls';
import SessionList from '../components/focus/SessionList';
import FocusStats from '../components/focus/FocusStats';
import FocusSettings from '../components/focus/FocusSettings';
import { updateSettings } from '../services/focusService';

export default function FocusPage() {
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    document.title = 'Focus Timer | GritFlow';
  }, []);

  // Hook for stats and session logs
  const {
    stats,
    sessions,
    loading: statsLoading,
    fetchStats,
    fetchSessions,
    removeSession,
  } = useFocusStats();

  // Callback to refresh statistics and today's logs on completed session
  const handleSessionCompleted = () => {
    fetchStats();
    fetchSessions();
  };

  // Hook for timer countdown and configuration states
  const {
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
  } = useFocusTimer(handleSessionCompleted);

  // Calculate total seconds for the current mode's target duration
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

  const totalTime = getDurationForMode(timerMode, settings) * 60;

  // Handle settings update
  const handleSaveSettings = async (settingsData) => {
    try {
      await updateSettings(settingsData);
      await loadSettings();
      setShowSettings(false);
    } catch (err) {
      console.error('Error saving focus settings:', err);
    }
  };

  return (
    <div className="focus-page-container">
      {/* Header section with heading, subheading, and settings button */}
      <div className="focus-header-row">
        <div>
          <h1 className="focus-page-title">Focus Timer</h1>
          <p className="focus-page-subtitle">Stay focused, get things done</p>
        </div>
        <button
          className="focus-settings-btn"
          onClick={() => setShowSettings(true)}
          title="Open Focus Settings"
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Main interactive timer workspace */}
      <div className="focus-timer-section">
        <TimerDisplay
          timeLeft={timeLeft}
          totalTime={totalTime}
          mode={timerMode}
          sessionCount={sessionCount}
          sessionsBeforeLongBreak={settings.sessionsBeforeLongBreak}
          label={currentLabel}
          onLabelChange={setCurrentLabel}
        />
        
        <TimerControls
          isRunning={isRunning}
          isPaused={isPaused}
          onStart={startTimer}
          onPause={pauseTimer}
          onReset={resetTimer}
          onSkip={skipSession}
          onSwitchMode={switchMode}
          currentMode={timerMode}
        />
      </div>

      {/* Grid containing logs history (left) and stats panel (right) */}
      <div className="focus-dashboard-grid">
        <div className="grid-column-left">
          <SessionList
            sessions={sessions}
            onDelete={removeSession}
            loading={statsLoading}
          />
        </div>
        <div className="grid-column-right">
          <FocusStats stats={stats} loading={statsLoading} />
        </div>
      </div>

      {/* Settings Modal overlay */}
      {showSettings && (
        <FocusSettings
          settings={settings}
          onSave={handleSaveSettings}
          onCancel={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

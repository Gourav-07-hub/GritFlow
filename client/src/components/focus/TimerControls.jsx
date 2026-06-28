/**
 * TimerControls.jsx — Switcher tabs and playback control buttons for Focus Timer
 */

import React from 'react';

export default function TimerControls({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onReset,
  onSkip,
  onSwitchMode,
  currentMode,
}) {
  return (
    <div className="timer-controls-container">
      {/* Mode Switcher Tabs */}
      <div className="timer-mode-tabs">
        <button
          className={`mode-tab ${currentMode === 'focus' ? 'active focus-active' : ''}`}
          onClick={() => onSwitchMode('focus')}
        >
          🎯 Focus
        </button>
        <button
          className={`mode-tab ${currentMode === 'short_break' ? 'active short-break-active' : ''}`}
          onClick={() => onSwitchMode('short_break')}
        >
          ☕ Short Break
        </button>
        <button
          className={`mode-tab ${currentMode === 'long_break' ? 'active long-break-active' : ''}`}
          onClick={() => onSwitchMode('long_break')}
        >
          🌿 Long Break
        </button>
      </div>

      {/* Primary Control Buttons */}
      <div className="timer-buttons-row">
        {/* Reset Button */}
        <button className="control-btn btn-reset" onClick={onReset} title="Reset Mode">
          🔄 Reset
        </button>

        {/* Start / Pause Toggle */}
        {isRunning ? (
          <button className="control-btn btn-play-pause btn-pause" onClick={onPause}>
            ⏸️ Pause
          </button>
        ) : (
          <button className="control-btn btn-play-pause btn-start" onClick={onStart}>
            ▶️ Start
          </button>
        )}

        {/* Skip Button */}
        <button className="control-btn btn-skip" onClick={onSkip} title="Skip Session">
          ⏭️ Skip
        </button>
      </div>
    </div>
  );
}

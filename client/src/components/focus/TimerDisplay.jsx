/**
 * TimerDisplay.jsx — Circular timer progress display with inline-editable label
 */

import React, { useState, useEffect } from 'react';

export default function TimerDisplay({
  timeLeft,
  totalTime,
  mode,
  sessionCount,
  sessionsBeforeLongBreak,
  label,
  onLabelChange,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(label || '');

  useEffect(() => {
    setTempLabel(label || '');
  }, [label]);

  const handleBlur = () => {
    setIsEditing(false);
    onLabelChange(tempLabel);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onLabelChange(tempLabel);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTempLabel(label || '');
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Circular progress calculations
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = totalTime > 0 ? circumference - (timeLeft / totalTime) * circumference : 0;

  // Determine mode details
  const getModeDetails = () => {
    switch (mode) {
      case 'focus':
        return {
          title: 'Focus Time',
          colorClass: 'mode-focus',
          strokeColor: 'var(--color-primary, #a78bfa)',
        };
      case 'short_break':
        return {
          title: 'Short Break',
          colorClass: 'mode-short-break',
          strokeColor: 'var(--color-success, #4ade80)',
        };
      case 'long_break':
        return {
          title: 'Long Break',
          colorClass: 'mode-long-break',
          strokeColor: '#f97316', // Orange
        };
      default:
        return {
          title: 'Focus Time',
          colorClass: 'mode-focus',
          strokeColor: 'var(--color-primary, #a78bfa)',
        };
    }
  };

  const modeDetails = getModeDetails();

  // Session display e.g. "Session 2 of 4"
  const currentSessionNumber = (sessionCount % sessionsBeforeLongBreak) + 1;

  return (
    <div className={`timer-display-container ${modeDetails.colorClass}`}>
      <div className="timer-svg-wrapper">
        <svg className="timer-svg" width="260" height="260" viewBox="0 0 260 260">
          {/* Background Ring */}
          <circle
            className="timer-ring-bg"
            cx="130"
            cy="130"
            r={radius}
            strokeWidth="10"
          />
          {/* Active Progress Ring */}
          <circle
            className="timer-ring-active"
            cx="130"
            cy="130"
            r={radius}
            strokeWidth="10"
            stroke={modeDetails.strokeColor}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: timeLeft === totalTime ? 'none' : 'stroke-dashoffset 1s linear',
            }}
          />
        </svg>

        {/* Center Contents */}
        <div className="timer-center-content">
          <div className="timer-time-digits">{formatTime(timeLeft)}</div>
          <div className="timer-mode-title">{modeDetails.title}</div>
          <div className="timer-session-info">
            Session {currentSessionNumber} of {sessionsBeforeLongBreak}
          </div>
        </div>
      </div>

      {/* Task Label Inline Editor */}
      <div className="timer-label-editor">
        {isEditing ? (
          <input
            type="text"
            className="timer-label-input"
            value={tempLabel}
            onChange={(e) => setTempLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="What are you focusing on?"
            autoFocus
            maxLength={60}
          />
        ) : (
          <div
            className={`timer-label-text ${!label ? 'placeholder-label' : ''}`}
            onClick={() => setIsEditing(true)}
          >
            {label || '🎯 Click to set focus task label'}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * FocusSettings.jsx — Settings dialog/modal for configuring Pomodoro durations and options
 */

import React, { useState, useEffect } from 'react';

export default function FocusSettings({ settings, onSave, onCancel }) {
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(4);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [autoStartFocus, setAutoStartFocus] = useState(false);

  useEffect(() => {
    if (settings) {
      setFocusDuration(settings.focusDuration ?? 25);
      setShortBreakDuration(settings.shortBreakDuration ?? 5);
      setLongBreakDuration(settings.longBreakDuration ?? 15);
      setSessionsBeforeLongBreak(settings.sessionsBeforeLongBreak ?? 4);
      setAutoStartBreaks(settings.autoStartBreaks ?? false);
      setAutoStartFocus(settings.autoStartFocus ?? false);
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      focusDuration: Number(focusDuration),
      shortBreakDuration: Number(shortBreakDuration),
      longBreakDuration: Number(longBreakDuration),
      sessionsBeforeLongBreak: Number(sessionsBeforeLongBreak),
      autoStartBreaks,
      autoStartFocus,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Focus Settings</h2>
          <button className="modal-close-x" onClick={onCancel} title="Close settings">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-fields-grid">
            {/* Focus Duration */}
            <div className="form-field">
              <label htmlFor="focusDuration" className="field-label">
                Focus Duration (minutes)
              </label>
              <input
                id="focusDuration"
                type="number"
                min="1"
                max="60"
                className="number-input"
                value={focusDuration}
                onChange={(e) => setFocusDuration(e.target.value)}
                required
              />
            </div>

            {/* Short Break Duration */}
            <div className="form-field">
              <label htmlFor="shortBreakDuration" className="field-label">
                Short Break (minutes)
              </label>
              <input
                id="shortBreakDuration"
                type="number"
                min="1"
                max="30"
                className="number-input"
                value={shortBreakDuration}
                onChange={(e) => setShortBreakDuration(e.target.value)}
                required
              />
            </div>

            {/* Long Break Duration */}
            <div className="form-field">
              <label htmlFor="longBreakDuration" className="field-label">
                Long Break (minutes)
              </label>
              <input
                id="longBreakDuration"
                type="number"
                min="1"
                max="60"
                className="number-input"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(e.target.value)}
                required
              />
            </div>

            {/* Sessions before long break */}
            <div className="form-field">
              <label htmlFor="sessionsBeforeLongBreak" className="field-label">
                Sessions Before Long Break
              </label>
              <input
                id="sessionsBeforeLongBreak"
                type="number"
                min="1"
                max="10"
                className="number-input"
                value={sessionsBeforeLongBreak}
                onChange={(e) => setSessionsBeforeLongBreak(e.target.value)}
                required
              />
            </div>
          </div>

          <hr className="form-separator" />

          {/* Toggle Switches */}
          <div className="toggle-switches-group">
            <div className="toggle-row">
              <div className="toggle-label-wrap">
                <span className="toggle-title">Auto Start Breaks</span>
                <span className="toggle-desc">Automatically trigger break timer after a focus session</span>
              </div>
              <label className="switch-control">
                <input
                  type="checkbox"
                  checked={autoStartBreaks}
                  onChange={(e) => setAutoStartBreaks(e.target.checked)}
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            <div className="toggle-row">
              <div className="toggle-label-wrap">
                <span className="toggle-title">Auto Start Focus</span>
                <span className="toggle-desc">Automatically trigger focus timer after a break session</span>
              </div>
              <label className="switch-control">
                <input
                  type="checkbox"
                  checked={autoStartFocus}
                  onChange={(e) => setAutoStartFocus(e.target.checked)}
                />
                <span className="switch-slider"></span>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-gradient">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

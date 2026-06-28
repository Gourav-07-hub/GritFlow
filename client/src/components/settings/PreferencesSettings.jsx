import React, { useState, useEffect } from 'react';

// Custom toggle switch subcomponent
function ToggleSwitch({ checked, onChange, id }) {
  return (
    <label className="settings-toggle-switch" htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="settings-toggle-input"
      />
      <span className="settings-toggle-slider" />
    </label>
  );
}

export default function PreferencesSettings({ preferences, onSave, loading, error, success }) {
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    reminderTime: '09:00',
    habitReminders: true,
    goalDeadlines: true,
    weeklyReport: true,
  });
  const [dashboard, setDashboard] = useState({
    defaultView: 'overview',
    showStreaks: true,
    showMotivational: true,
  });
  const [privacy, setPrivacy] = useState({
    shareStats: false,
    publicProfile: false,
  });
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('sound_enabled') !== 'false');

  const handleSoundToggle = (val) => {
    setSoundEnabled(val);
    localStorage.setItem('sound_enabled', val ? 'true' : 'false');
  };

  // Pre-fill preferences on load
  useEffect(() => {
    if (preferences) {
      if (preferences.theme) setTheme(preferences.theme);
      if (preferences.language) setLanguage(preferences.language);
      if (preferences.timezone) setTimezone(preferences.timezone);
      if (preferences.notifications) {
        setNotifications((prev) => ({ ...prev, ...preferences.notifications }));
      }
      if (preferences.dashboard) {
        setDashboard((prev) => ({ ...prev, ...preferences.dashboard }));
      }
      if (preferences.privacy) {
        setPrivacy((prev) => ({ ...prev, ...preferences.privacy }));
      }
    }
  }, [preferences]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      theme,
      language,
      timezone,
      notifications,
      dashboard,
      privacy,
    });
  };

  const handleNotificationChange = (key, value) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDashboardChange = (key, value) => {
    setDashboard((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacy((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="settings-section-card">
      <div className="settings-section-header">
        <h2 className="settings-section-title">User Preferences</h2>
        <p className="settings-section-subtitle">Customize your dashboard experience, themes, notifications and privacy settings.</p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {/* Appearance Section */}
        <div className="settings-subsection">
          <h3 className="settings-subsection-title">🎨 Appearance</h3>
          
          <div className="settings-form-group">
            <label className="settings-label">Theme</label>
            <div className="theme-toggle-group">
              {['light', 'dark', 'system'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`theme-toggle-btn ${theme === t ? 'active' : ''}`}
                  onClick={() => setTheme(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label htmlFor="languageSelect" className="settings-label">Language</label>
              <select
                id="languageSelect"
                className="settings-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English (US)</option>
              </select>
            </div>

            <div className="settings-form-group">
              <label htmlFor="timezoneInput" className="settings-label">Timezone</label>
              <input
                type="text"
                id="timezoneInput"
                className="settings-input"
                placeholder="e.g. UTC, America/New_York"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="settings-subsection">
          <h3 className="settings-subsection-title">🔔 Notifications</h3>
          
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-label">Daily Reminder</span>
              <span className="preference-description">Get daily reminders to check in.</span>
            </div>
            <div className="preference-controls">
              {notifications.dailyReminder && (
                <input
                  type="time"
                  className="settings-time-input"
                  value={notifications.reminderTime || '09:00'}
                  onChange={(e) => handleNotificationChange('reminderTime', e.target.value)}
                />
              )}
              <ToggleSwitch
                id="dailyReminder"
                checked={notifications.dailyReminder}
                onChange={(val) => handleNotificationChange('dailyReminder', val)}
              />
            </div>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-label">Habit Reminders</span>
              <span className="preference-description">Receive alerts for habits that need completion.</span>
            </div>
            <ToggleSwitch
              id="habitReminders"
              checked={notifications.habitReminders}
              onChange={(val) => handleNotificationChange('habitReminders', val)}
            />
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-label">Goal Deadlines</span>
              <span className="preference-description">Remind me when goals are approaching deadlines.</span>
            </div>
            <ToggleSwitch
              id="goalDeadlines"
              checked={notifications.goalDeadlines}
              onChange={(val) => handleNotificationChange('goalDeadlines', val)}
            />
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-label">Weekly Report</span>
              <span className="preference-description">Email weekly aggregate statistics and progress summary.</span>
            </div>
            <ToggleSwitch
              id="weeklyReport"
              checked={notifications.weeklyReport}
              onChange={(val) => handleNotificationChange('weeklyReport', val)}
            />
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-label">Notification Sounds</span>
              <span className="preference-description">Play audio alerts when notifications are received.</span>
            </div>
            <ToggleSwitch
              id="soundEnabled"
              checked={soundEnabled}
              onChange={handleSoundToggle}
            />
          </div>
        </div>

        {/* Dashboard Section */}
        <div className="settings-subsection">
          <h3 className="settings-subsection-title">📊 Dashboard</h3>
          
          <div className="settings-form-group">
            <label htmlFor="defaultViewSelect" className="settings-label">Default View</label>
            <select
              id="defaultViewSelect"
              className="settings-select"
              value={dashboard.defaultView}
              onChange={(e) => handleDashboardChange('defaultView', e.target.value)}
            >
              <option value="overview">Overview</option>
              <option value="habits">Habits</option>
              <option value="goals">Goals</option>
              <option value="reflection">Reflection</option>
              <option value="focus">Focus</option>
              <option value="gratitude">Gratitude</option>
            </select>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-label">Show Streaks</span>
              <span className="preference-description">Display streak metrics on the dashboard header.</span>
            </div>
            <ToggleSwitch
              id="showStreaks"
              checked={dashboard.showStreaks}
              onChange={(val) => handleDashboardChange('showStreaks', val)}
            />
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-label">Show Motivational Messages</span>
              <span className="preference-description">Show inspiring affirmations and quotes on top.</span>
            </div>
            <ToggleSwitch
              id="showMotivational"
              checked={dashboard.showMotivational}
              onChange={(val) => handleDashboardChange('showMotivational', val)}
            />
          </div>
        </div>

        {/* Privacy Section */}
        <div className="settings-subsection">
          <h3 className="settings-subsection-title">🔒 Privacy</h3>

          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-label">Share Stats</span>
              <span className="preference-description">Allow sharing your completion statistics on the global leaderboard.</span>
            </div>
            <ToggleSwitch
              id="shareStats"
              checked={privacy.shareStats}
              onChange={(val) => handlePrivacyChange('shareStats', val)}
            />
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-label">Public Profile</span>
              <span className="preference-description">Make your profile details public to other community members.</span>
            </div>
            <ToggleSwitch
              id="publicProfile"
              checked={privacy.publicProfile}
              onChange={(val) => handlePrivacyChange('publicProfile', val)}
            />
          </div>
        </div>

        {error && (
          <div className="settings-alert settings-alert-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="settings-alert settings-alert-success" role="alert">
            {success}
          </div>
        )}

        <div className="settings-actions">
          <button
            type="submit"
            className="settings-btn settings-btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving Preferences...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}

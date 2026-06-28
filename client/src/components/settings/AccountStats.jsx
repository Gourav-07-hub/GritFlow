import React from 'react';

export default function AccountStats({ accountStats, loading }) {
  if (loading) {
    return (
      <div className="settings-section-card stats-loading-container">
        <div className="settings-spinner"></div>
        <p>Loading your journey statistics...</p>
      </div>
    );
  }

  const {
    memberSince,
    totalHabits = 0,
    totalGoals = 0,
    totalReflections = 0,
    totalFocusSessions = 0,
    totalGratitude = 0,
    totalFocusMinutes = 0,
  } = accountStats || {};

  const formatJoinDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatFocusDuration = (minutes) => {
    const total = minutes || 0;
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
    }
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  };

  const statsItems = [
    {
      label: 'Member Since',
      value: formatJoinDate(memberSince),
      emoji: '📅',
      color: 'blue',
    },
    {
      label: 'Total Habits',
      value: `${totalHabits} habit${totalHabits !== 1 ? 's' : ''} active`,
      emoji: '🔁',
      color: 'green',
    },
    {
      label: 'Total Goals',
      value: `${totalGoals} goal${totalGoals !== 1 ? 's' : ''} set`,
      emoji: '🎯',
      color: 'purple',
    },
    {
      label: 'Total Reflections',
      value: `${totalReflections} journal entr${totalReflections !== 1 ? 'ies' : 'y'}`,
      emoji: '📓',
      color: 'yellow',
    },
    {
      label: 'Focus Sessions',
      value: `${totalFocusSessions} session${totalFocusSessions !== 1 ? 's' : ''} completed`,
      emoji: '⏱️',
      color: 'cyan',
    },
    {
      label: 'Total Focus Time',
      value: formatFocusDuration(totalFocusMinutes),
      emoji: '🔥',
      color: 'orange',
    },
    {
      label: 'Gratitude Entries',
      value: `${totalGratitude} entr${totalGratitude !== 1 ? 'ies' : 'y'} written`,
      emoji: '💖',
      color: 'pink',
    },
  ];

  return (
    <div className="settings-section-card">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Account Stats</h2>
        <p className="settings-section-subtitle">A summary of your productivity and mindfulness metrics across the dashboard.</p>
      </div>

      <div className="settings-stats-grid">
        {statsItems.map((item, index) => (
          <div key={index} className={`settings-stat-card border-accent-${item.color}`}>
            <div className="stat-card-icon">{item.emoji}</div>
            <div className="stat-card-content">
              <span className="stat-card-label">{item.label}</span>
              <span className="stat-card-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * FocusStats.jsx — Focus Timer statistics panel with CSS bar chart
 */

import React from 'react';

export default function FocusStats({ stats, loading }) {
  if (loading) {
    return <div className="stats-card-loading">Loading stats...</div>;
  }

  // Fallback defaults if stats not yet loaded or empty
  const todayMinutes = stats?.todayMinutes || 0;
  const weekMinutes = stats?.weekMinutes || 0;
  const monthMinutes = stats?.monthMinutes || 0;
  const totalSessions = stats?.totalSessions || 0;
  const totalMinutes = stats?.totalMinutes || 0;
  const averageSessionLength = stats?.averageSessionLength || 0;
  const currentStreak = stats?.currentStreak || 0;
  const longestStreak = stats?.longestStreak || 0;
  const dailyBreakdown = stats?.dailyBreakdown || [];

  // Get Day of Week label from YYYY-MM-DD
  const getDayLabel = (dateStr) => {
    try {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      // Parse local time to avoid timezone offset shifts
      const [year, month, day] = dateStr.split('-');
      const d = new Date(year, month - 1, day);
      return days[d.getDay()];
    } catch (e) {
      return '';
    }
  };

  // Find max minutes to scale chart heights proportionally
  const maxMinutes = dailyBreakdown.reduce((max, d) => Math.max(max, d.minutes), 0);

  return (
    <div className="stats-card">
      <h3 className="stats-card-title">Focus Statistics</h3>

      {/* Grid of Key Aggregate Stats */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-value">{todayMinutes}m</div>
          <div className="stat-label">Today's Focus</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{weekMinutes}m</div>
          <div className="stat-label">This Week</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{monthMinutes}m</div>
          <div className="stat-label">This Month</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{totalSessions}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-box highlight-streak">
          <div className="stat-value">{currentStreak} 🔥</div>
          <div className="stat-label">Current Streak</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{longestStreak}d</div>
          <div className="stat-label">Longest Streak</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{averageSessionLength}m</div>
          <div className="stat-label">Avg Session</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{totalMinutes}m</div>
          <div className="stat-label">Total Focused</div>
        </div>
      </div>

      {/* CSS-based Bar Chart */}
      <div className="chart-wrapper">
        <h4 className="chart-title">Last 7 Days (Minutes)</h4>
        <div className="bar-chart">
          {dailyBreakdown.map((day) => {
            const barHeight = maxMinutes > 0 ? (day.minutes / maxMinutes) * 100 : 0;
            return (
              <div key={day.date} className="chart-bar-column">
                <div className="chart-bar-container">
                  <div
                    className="chart-bar-fill"
                    style={{ height: `${Math.max(barHeight, day.minutes > 0 ? 8 : 0)}%` }}
                    title={`${day.minutes} minutes`}
                  >
                    {day.minutes > 0 && <span className="bar-tooltip">{day.minutes}m</span>}
                  </div>
                </div>
                <div className="chart-bar-label">{getDayLabel(day.date)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

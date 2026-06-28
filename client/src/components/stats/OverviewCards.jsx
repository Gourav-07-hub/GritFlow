/**
 * OverviewCards.jsx — Grid of feature cards showcasing summary metrics
 */

import React from 'react';

const getMoodEmoji = (score) => {
  const rounded = Math.round(score);
  if (rounded === 5) return '🤩';
  if (rounded === 4) return '😊';
  if (rounded === 3) return '😐';
  if (rounded === 2) return '😕';
  if (rounded === 1) return '😢';
  return '😐';
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Never';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return '';
  }
};

export default function OverviewCards({ overview, loading }) {
  if (loading || !overview) {
    return (
      <div className="overview-loading-grid">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="overview-card-skeleton" />
        ))}
      </div>
    );
  }

  const { habits, goals, focus, reflections, gratitude } = overview;

  return (
    <div className="overview-cards-grid">
      {/* 1. Habits Summary Card */}
      <div className="overview-card accent-blue">
        <div className="card-top-row">
          <span className="card-icon">✅</span>
          <h3 className="card-title">Habits</h3>
        </div>
        <div className="card-metrics-grid">
          <div className="metric-col">
            <span className="metric-val">{habits.totalHabits}</span>
            <span className="metric-lbl">Total Active</span>
          </div>
          <div className="metric-col">
            <span className="metric-val">{habits.completedToday}</span>
            <span className="metric-lbl">Done Today</span>
          </div>
        </div>
        <div className="card-progress-bar-group">
          <div className="progress-lbl-row">
            <span>Today's Progress</span>
            <span>{habits.completionRate}%</span>
          </div>
          <div className="progress-track-bg">
            <div className="progress-fill-bar" style={{ width: `${habits.completionRate}%` }} />
          </div>
        </div>
        <div className="card-footer-streak">
          <span>Best Streak:</span>
          <strong>{habits.bestStreak} days 🔥</strong>
        </div>
      </div>

      {/* 2. Goals Summary Card */}
      <div className="overview-card accent-purple">
        <div className="card-top-row">
          <span className="card-icon">🎯</span>
          <h3 className="card-title">Goals</h3>
        </div>
        <div className="card-metrics-grid">
          <div className="metric-col">
            <span className="metric-val">{goals.totalGoals}</span>
            <span className="metric-lbl">Active Goals</span>
          </div>
          <div className="metric-col">
            <span className="metric-val">{goals.completedGoals}</span>
            <span className="metric-lbl">Completed</span>
          </div>
        </div>
        <div className="card-progress-bar-group">
          <div className="progress-lbl-row">
            <span>Average Progress</span>
            <span>{goals.averageProgress}%</span>
          </div>
          <div className="progress-track-bg">
            <div className="progress-fill-bar" style={{ width: `${goals.averageProgress}%` }} />
          </div>
        </div>
        <div className="card-footer-overdue">
          <span>Overdue:</span>
          <strong className={goals.overdueGoals > 0 ? 'overdue-alert' : ''}>
            {goals.overdueGoals} goals
          </strong>
        </div>
      </div>

      {/* 3. Focus Timer Summary Card */}
      <div className="overview-card accent-orange">
        <div className="card-top-row">
          <span className="card-icon">⏱️</span>
          <h3 className="card-title">Focus Timer</h3>
        </div>
        <div className="card-metrics-grid font-size-tweak">
          <div className="metric-col">
            <span className="metric-val">{focus.todayMinutes}m</span>
            <span className="metric-lbl">Today's Focus</span>
          </div>
          <div className="metric-col">
            <span className="metric-val">{focus.weekMinutes}m</span>
            <span className="metric-lbl">This Week</span>
          </div>
          <div className="metric-col">
            <span className="metric-val">{focus.totalSessions}</span>
            <span className="metric-lbl">Total Sessions</span>
          </div>
        </div>
        <div className="card-footer-streak margined-top">
          <span>Focus Streak:</span>
          <strong>{focus.currentStreak} days 🔥</strong>
        </div>
      </div>

      {/* 4. Reflection Journal Summary Card */}
      <div className="overview-card accent-teal">
        <div className="card-top-row">
          <span className="card-icon">📓</span>
          <h3 className="card-title">Reflection</h3>
        </div>
        <div className="card-metrics-grid">
          <div className="metric-col">
            <span className="metric-val">{reflections.totalEntries}</span>
            <span className="metric-lbl">Total Entries</span>
          </div>
          <div className="metric-col">
            <span className="metric-val">{reflections.currentStreak}</span>
            <span className="metric-lbl">Active Streak</span>
          </div>
        </div>
        <div className="card-footer-mood">
          <span>Average Mood:</span>
          <strong>
            {getMoodEmoji(reflections.averageMood)} {reflections.averageMood} / 5
          </strong>
        </div>
        <div className="card-footer-date">
          <span>Last Reflection:</span>
          <strong>{formatDate(reflections.lastEntryDate)}</strong>
        </div>
      </div>

      {/* 5. Gratitude Journal Summary Card */}
      <div className="overview-card accent-pink">
        <div className="card-top-row">
          <span className="card-icon">🙏</span>
          <h3 className="card-title">Gratitude</h3>
        </div>
        <div className="card-metrics-grid">
          <div className="metric-col">
            <span className="metric-val">{gratitude.totalEntries}</span>
            <span className="metric-lbl">Total Entries</span>
          </div>
          <div className="metric-col">
            <span className="metric-val">{gratitude.totalItems}</span>
            <span className="metric-lbl">Things Logged</span>
          </div>
        </div>
        <div className="card-footer-streak">
          <span>Gratitude Streak:</span>
          <strong>{gratitude.currentStreak} days 🔥</strong>
        </div>
        <div className="card-footer-date">
          <span>Last Gratitude:</span>
          <strong>{formatDate(gratitude.lastEntryDate)}</strong>
        </div>
      </div>
    </div>
  );
}

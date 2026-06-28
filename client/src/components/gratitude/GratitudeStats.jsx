/**
 * GratitudeStats.jsx — Displays gratitude journal statistics and category breakdowns
 */

import React from 'react';

const CATEGORY_LABELS = {
  people: { label: 'People', icon: '👥', color: '#60a5fa' },
  health: { label: 'Health', icon: '💪', color: '#34d399' },
  work: { label: 'Work', icon: '💼', color: '#fbbf24' },
  nature: { label: 'Nature', icon: '🌿', color: '#2dd4bf' },
  personal: { label: 'Personal', icon: '💡', color: '#a78bfa' },
  other: { label: 'Other', icon: '✨', color: '#f43f5e' },
};

export default function GratitudeStats({ stats, loading }) {
  if (loading) {
    return <div className="stats-card-loading">Loading gratitude stats...</div>;
  }

  const totalEntries = stats?.totalEntries || 0;
  const totalItems = stats?.totalItems || 0;
  const currentStreak = stats?.currentStreak || 0;
  const longestStreak = stats?.longestStreak || 0;
  const averageMood = stats?.averageMood || 0;
  const favoriteCount = stats?.favoriteCount || 0;
  const categoryBreakdown = stats?.categoryBreakdown || {};
  const mostGratefulDay = stats?.mostGratefulDay || 'None';

  // Format category list sorted by count descending
  const sortedCategories = Object.entries(CATEGORY_LABELS).map(([key, info]) => {
    const count = categoryBreakdown[key] || 0;
    const percent = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
    return {
      key,
      count,
      percent,
      ...info,
    };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="stats-card gratitude-stats-card">
      <h3 className="stats-card-title">Gratitude Insights</h3>

      {/* Aggregate Stats Grid */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-value">{totalEntries}</div>
          <div className="stat-label">Total Entries</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{totalItems}</div>
          <div className="stat-label">Things Recorded</div>
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
          <div className="stat-value">{averageMood} / 5</div>
          <div className="stat-label">Average Mood</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{favoriteCount} ⭐</div>
          <div className="stat-label">Favorites</div>
        </div>
      </div>

      {/* Category Breakdown Progress Bars */}
      <div className="stats-category-section">
        <h4 className="section-subtitle">Category Breakdown</h4>
        <div className="category-bars-list">
          {sortedCategories.map((cat) => (
            <div key={cat.key} className="category-bar-row">
              <div className="category-bar-label-row">
                <span className="category-label-name">
                  {cat.icon} {cat.label}
                </span>
                <span className="category-label-percentage">
                  {cat.count} items ({cat.percent}%)
                </span>
              </div>
              <div className="category-bar-track">
                <div
                  className="category-bar-fill"
                  style={{
                    width: `${cat.percent}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Highlight of Most Grateful Day */}
      <div className="grateful-day-highlight-box">
        <span className="highlight-icon">📅</span>
        <div className="highlight-text-wrapper">
          <span className="highlight-label">Most Grateful Day</span>
          <span className="highlight-value">{mostGratefulDay}</span>
        </div>
      </div>
    </div>
  );
}

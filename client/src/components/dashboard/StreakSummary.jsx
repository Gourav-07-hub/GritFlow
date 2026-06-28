import React from 'react';

/**
 * StreakSummary widget showing habits streaks, top streak gold gradients, and pulsing animations.
 */
export default function StreakSummary({ overview, habits = [] }) {
  const activeHabits = habits.filter((h) => h.isActive);
  const sortedHabits = [...activeHabits].sort((a, b) => (b.streak || 0) - (a.streak || 0));

  return (
    <div className="streak-summary-card-widget">
      <h3 className="dashboard-card-title">
        <span className="widget-title-icon">🔥</span> Streak Summary
      </h3>
      <div className="streak-summary-content">
        {sortedHabits.length === 0 ? (
          <div className="streak-summary-empty">
            <span className="empty-state-illustration">🔥</span>
            <p className="empty-state-text">No active streaks yet.</p>
          </div>
        ) : (
          <div className="streak-summary-list">
            {sortedHabits.slice(0, 4).map((h, idx) => {
              const isTop = idx === 0 && (h.streak || 0) > 0;
              return (
                <div
                  key={h._id}
                  className={`streak-summary-row ${isTop ? 'top-streak' : ''}`}
                >
                  <div className="streak-summary-habit-info">
                    <span className="streak-habit-icon">{h.icon || '📝'}</span>
                    <span className="streak-habit-name">{h.name}</span>
                  </div>
                  <div className="streak-count-wrapper">
                    <span className="streak-fire-icon pulse-glow-orange">🔥</span>
                    <span className="streak-count-value">{h.streak || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

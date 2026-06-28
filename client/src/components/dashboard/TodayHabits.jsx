import React from 'react';

function isToday(dateVal) {
  const d = new Date(dateVal);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

/**
 * Today's Habits widget displaying progress bar, custom checkboxes, streak badges, and animations.
 */
export default function TodayHabits({ habits }) {
  const active = (habits || []).filter((h) => h.isActive !== false);
  const completedToday = active.filter((h) =>
    (h.completedDates || []).some((d) => isToday(d))
  ).length;

  const totalCount = active.length;
  const progressPercent = totalCount > 0 ? (completedToday / totalCount) * 100 : 0;
  const allDone = totalCount > 0 && completedToday === totalCount;

  return (
    <div className={`widget-card widget-habits-card fade-in-up delay-1 ${allDone ? 'all-habits-completed-glow' : ''}`}>
      <div className="widget-header-row">
        <h3 className="widget-section-title">
          <span className="widget-title-icon green">✅</span> Today&apos;s Habits
        </h3>
        {allDone && <span className="bounce-emoji celebration-bounce-emoji">🎉</span>}
      </div>

      <div className="widget-progress-section">
        <div className="widget-progress-info">
          <span className="widget-progress-text">{completedToday} / {totalCount} completed</span>
          <span className="widget-progress-percentage">{Math.round(progressPercent)}%</span>
        </div>
        <div className="widget-progress-track">
          <div 
            className="widget-progress-fill-green" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="widget-empty-state">
          <span className="empty-state-illustration">📝</span>
          <p className="widget-empty-text">No active habits today.</p>
        </div>
      ) : (
        <ul className="widget-habits-list">
          {active.slice(0, 5).map((h) => {
            const done = (h.completedDates || []).some((d) => isToday(d));
            return (
              <li key={h._id} className={`widget-habit-item ${done ? 'done' : ''}`}>
                <div className="widget-habit-info-side">
                  <span className="widget-habit-icon-pill">{h.icon || '📝'}</span>
                  <span className="widget-habit-name">{h.name}</span>
                </div>
                
                <div className="widget-habit-actions-side">
                  {h.streak > 0 && (
                    <span className="widget-habit-streak-badge">
                      🔥 {h.streak}
                    </span>
                  )}
                  <span className={`widget-habit-checkbox-circle ${done ? 'checked' : ''}`}>
                    {done ? '✓' : ''}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

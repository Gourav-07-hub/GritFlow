import React from 'react';

/**
 * Upcoming Goals widget with priority/category badges, gradient progress bars, and colored days-left indicators.
 */
export default function UpcomingGoals({ goals }) {
  const active = (goals || []).filter((g) => g.status === 'active').sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  const getDaysLeft = (deadline) => {
    if (!deadline) return { text: 'No deadline', colorClass: 'days-muted' };
    const diffTime = new Date(deadline) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Overdue ⚠️', colorClass: 'days-red' };
    }
    if (diffDays === 0) {
      return { text: 'Due today ⏱️', colorClass: 'days-orange' };
    }
    if (diffDays <= 7) {
      return { text: `${diffDays}d left`, colorClass: 'days-orange' };
    }
    return { text: `${diffDays}d left`, colorClass: 'days-green' };
  };

  const getCategoryClass = (cat) => {
    const category = String(cat || '').toLowerCase();
    if (category === 'high' || category === 'work' || category === 'career') return 'badge-purple';
    if (category === 'medium' || category === 'health' || category === 'fitness') return 'badge-green';
    return 'badge-orange';
  };

  return (
    <div className="widget-card widget-goals-card fade-in-up delay-2">
      <h3 className="widget-section-title">
        <span className="widget-title-icon purple">🎯</span> Upcoming Goals
      </h3>

      {active.length === 0 ? (
        <div className="widget-empty-state">
          <span className="empty-state-illustration">🎯</span>
          <p className="widget-empty-text">No active goals set yet.</p>
        </div>
      ) : (
        <ul className="widget-goals-list">
          {active.slice(0, 4).map((g) => {
            const daysLeft = getDaysLeft(g.deadline);
            const category = g.category || g.priority || 'Goal';
            
            return (
              <li key={g._id} className="widget-goal-item">
                <div className="widget-goal-header-row">
                  <span className="widget-goal-title">{g.title}</span>
                  <span className={`widget-goal-category-badge ${getCategoryClass(category)}`}>
                    {category}
                  </span>
                </div>

                <div className="widget-goal-progress-section">
                  <div className="widget-goal-progress-bar-track">
                    <div 
                      className="widget-goal-progress-bar-fill" 
                      style={{ width: `${g.progress || 0}%` }}
                    />
                  </div>
                  <div className="widget-goal-meta-row">
                    <span className="widget-goal-percentage">{g.progress || 0}% completed</span>
                    <span className={`widget-goal-days-left ${daysLeft.colorClass}`}>
                      {daysLeft.text}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import React from 'react';

/**
 * AchievementCard — Displays individual achievement status (unlocked or locked)
 */
export default function AchievementCard({ achievement, isUnlocked }) {
  const { title, description, icon, category, unlockedAt } = achievement;

  const formatDate = (dateStr) => {
    if (!dateStr) return '???';
    try {
      const date = new Date(dateStr);
      return `Unlocked on ${date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })}`;
    } catch {
      return '???';
    }
  };

  return (
    <div className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
      <span className={`achievement-card-badge badge-${category}`}>
        {category}
      </span>
      <div className="achievement-card-icon" aria-hidden="true">
        {isUnlocked ? icon : '🔒'}
      </div>
      <h3 className="achievement-card-title">{title}</h3>
      <p className="achievement-card-desc">
        {isUnlocked ? description : 'Achievement details are locked'}
      </p>
      <span className="achievement-card-date">
        {isUnlocked ? formatDate(unlockedAt) : '???'}
      </span>
    </div>
  );
}

import React from 'react';
import styles from './FriendsComponents.module.css';

/**
 * Display card for a friend's streak statistics in a particular category.
 * @param {{ label: string, icon: string, currentStreak: number, longestStreak: number }} props
 */
const FriendStreakCard = ({ label, icon, currentStreak, longestStreak }) => {
  const isZero = currentStreak === 0;

  // Generate 7 days visualization.
  // Fill the last `currentStreak` days (from right to left, i.e., index 6 is today, 5 is yesterday, etc.).
  const days = Array(7).fill(false);
  if (currentStreak > 0) {
    for (let i = 0; i < Math.min(currentStreak, 7); i++) {
      days[6 - i] = true;
    }
  }

  // Helper labels for the last 7 days dots (e.g. M, T, W...)
  const getDayLabel = (offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - offset));
    return date.toLocaleDateString('en-US', { weekday: 'narrow' });
  };

  return (
    <div className={`${styles.streakCard} ${isZero ? styles.streakZero : ''}`}>
      <div className={styles.streakCardHeader}>
        <span className={styles.streakIcon} role="img" aria-label={label}>
          {icon}
        </span>
        <span className={styles.streakLabel}>{label}</span>
      </div>

      <div className={styles.streakValueContainer}>
        {isZero ? (
          <div className={styles.streakZeroText}>No active streak</div>
        ) : (
          <div className={styles.streakCurrent}>
            <span className={styles.streakNumber}>{currentStreak}</span>
            <span className={styles.streakDaysLabel}>days</span>
            <span className={styles.streakFire}>🔥</span>
          </div>
        )}
        <div className={styles.streakBest}>
          Best: {longestStreak} day{longestStreak === 1 ? '' : 's'}
        </div>
      </div>

      {/* 7 Days visual dot bar */}
      <div className={styles.streakVisualBar}>
        {days.map((isActive, index) => (
          <div key={index} className={styles.streakDotWrapper}>
            <span className={styles.streakDotDay}>{getDayLabel(index)}</span>
            <div
              className={`${styles.streakDot} ${
                isActive ? styles.streakDotActive : styles.streakDotMissed
              }`}
              title={isActive ? 'Completed' : 'Missed'}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendStreakCard;

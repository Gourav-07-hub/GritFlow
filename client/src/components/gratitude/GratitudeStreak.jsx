/**
 * GratitudeStreak.jsx — Renders a visual streak banner, motivational text, and a 7-day tracker grid
 */

import React from 'react';

export default function GratitudeStreak({ currentStreak, longestStreak, recentDates = [] }) {
  // Generate list of last 7 calendar days ending today
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const getDayLetter = (date) => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return days[date.getDay()];
  };

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const hasEntryOnDay = (day) => {
    return recentDates.some((entry) => {
      const entryDate = new Date(entry.date);
      return isSameDay(entryDate, day);
    });
  };

  // Determine motivational message based on streak count
  const getMotivationalMessage = (streak) => {
    if (streak === 0) return 'Start your gratitude journey today! 🌱';
    if (streak >= 1 && streak <= 6) return 'Great start! Keep it going! 💪';
    if (streak >= 7 && streak <= 13) return "One week strong! You're building a habit! 🔥";
    if (streak >= 14 && streak <= 29) return 'Two weeks of gratitude! Amazing! ⭐';
    return 'Gratitude master! Incredible dedication! 🏆';
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="stats-card gratitude-streak-card">
      <div className="streak-main-display">
        {/* Large streak number */}
        <div className="streak-number-wrapper">
          <span className="streak-emoji">🔥</span>
          <span className="streak-number">{currentStreak}</span>
        </div>
        <div className="streak-labels">
          <span className="streak-count-label">Day Streak</span>
          <span className="longest-streak-label">Longest: {longestStreak} days</span>
        </div>
      </div>

      <hr className="form-separator" />

      {/* Last 7 Days Track Grid */}
      <div className="streak-tracker-section">
        <span className="streak-section-title">Last 7 Days Tracker</span>
        <div className="streak-dots-row">
          {last7Days.map((day, idx) => {
            const hasEntry = hasEntryOnDay(day);
            const isToday = isSameDay(day, today);
            return (
              <div key={idx} className="streak-dot-column">
                <div
                  className={`streak-dot ${hasEntry ? 'filled-dot' : 'empty-dot'} ${
                    isToday ? 'today-dot' : ''
                  }`}
                  title={`${day.toLocaleDateString()}: ${hasEntry ? 'Completed' : 'Missed'}`}
                >
                  {hasEntry ? '✓' : ''}
                </div>
                <span className={`streak-dot-label ${isToday ? 'today-label' : ''}`}>
                  {getDayLetter(day)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational message */}
      <div className="streak-motivational-msg">
        <p>{getMotivationalMessage(currentStreak)}</p>
      </div>
    </div>
  );
}

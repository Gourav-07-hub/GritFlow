import React, { useState, useEffect } from 'react';

/**
 * Subcomponent to animate number counting from 0 to target on mount.
 */
function CountUpNumber({ textValue }) {
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    const match = String(textValue).match(/^(\d+)(.*)$/);
    if (!match) {
      setDisplayValue(textValue);
      return;
    }

    const targetNum = parseInt(match[1], 10);
    const suffix = match[2];

    let start = 0;
    const duration = 1500; // 1.5s
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress); // Ease-out quad
      const currentVal = Math.round(start + easeProgress * targetNum);

      setDisplayValue(`${currentVal}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(textValue);
      }
    };

    requestAnimationFrame(animate);
  }, [textValue]);

  return <span>{displayValue}</span>;
}

/**
 * Quick stats row component featuring cards with top gradient borders, hover glows, and numbers count up.
 */
export default function QuickStats({ overview }) {
  const habitsStreak = overview?.habits?.bestStreak ?? 0;
  const activeGoalsCount = overview?.goals?.totalGoals ?? 0;
  const focusToday = overview?.focus?.todayMinutes ?? 0;
  const gratitudeEntries = overview?.gratitude?.totalEntries ?? 0;

  const stats = [
    { title: 'Habits Streak', value: `${habitsStreak} days`, icon: '🔥', class: 'stat-streak' },
    { title: 'Active Goals', value: `${activeGoalsCount} goals`, icon: '🎯', class: 'stat-goals' },
    { title: 'Focus Today', value: `${focusToday} mins`, icon: '⏱️', class: 'stat-focus' },
    { title: 'Gratitude', value: `${gratitudeEntries} entries`, icon: '🙏', class: 'stat-gratitude' },
  ];

  return (
    <div className="quick-stats-grid">
      {stats.map((item, idx) => (
        <div 
          key={item.title} 
          className={`quick-stat-card ${item.class} fade-in-up delay-${idx + 1}`}
        >
          <div className="quick-stat-header">
            <span className="quick-stat-label">{item.title}</span>
            <div className="quick-stat-icon-wrapper">
              <span className="quick-stat-icon">{item.icon}</span>
            </div>
          </div>
          <div className="quick-stat-value">
            <CountUpNumber textValue={item.value} />
          </div>
        </div>
      ))}
    </div>
  );
}

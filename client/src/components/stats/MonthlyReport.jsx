/**
 * MonthlyReport.jsx — Monthly summary panel with month pagination, colored categories badges, and CSS mood sparkline
 */

import React from 'react';

const CATEGORY_MAP = {
  people: { label: 'People', icon: '👥', colorClass: 'badge-blue' },
  health: { label: 'Health', icon: '💪', colorClass: 'badge-green' },
  work: { label: 'Work', icon: '💼', colorClass: 'badge-yellow' },
  nature: { label: 'Nature', icon: '🌿', colorClass: 'badge-teal' },
  personal: { label: 'Personal', icon: '💡', colorClass: 'badge-indigo' },
  other: { label: 'Other', icon: '✨', colorClass: 'badge-pink' },
};

const getMonthName = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};

export default function MonthlyReport({ monthlyReport, loading, selectedMonth, onMonthChange }) {
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    date.setMonth(date.getMonth() - 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${newYear}-${newMonth}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    date.setMonth(date.getMonth() + 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${newYear}-${newMonth}`);
  };

  if (loading) {
    return <div className="stats-card-loading">Loading monthly report...</div>;
  }

  if (!monthlyReport) {
    return <div className="weekly-report-empty">No monthly report data available.</div>;
  }

  const { habits, focus, reflections, gratitude, goals } = monthlyReport;

  // Filter mood trend only for positive mood days to render sparkline tooltips
  const moodTrend = reflections?.moodTrend || [];

  return (
    <div className="stats-card monthly-report-card">
      {/* Month Navigation Header */}
      <div className="monthly-navigator-header">
        <button className="nav-arrow-btn" onClick={handlePrevMonth} title="Previous Month">
          ◀
        </button>
        <h3 className="navigator-month-title">{getMonthName(selectedMonth)}</h3>
        <button className="nav-arrow-btn" onClick={handleNextMonth} title="Next Month">
          ▶
        </button>
      </div>

      {/* Grid of Monthly summary cards */}
      <div className="monthly-sections-grid">
        {/* 1. Habits */}
        <div className="monthly-section-card border-blue">
          <div className="section-card-header">
            <span className="section-icon">✅</span>
            <span className="section-title">Habit Tracker</span>
          </div>
          <div className="section-body">
            <div className="monthly-metric-row">
              <span>Total Completions:</span>
              <strong>{habits?.totalCompletions || 0} times</strong>
            </div>
            <div className="monthly-metric-row">
              <span>Completion Rate:</span>
              <strong>{habits?.completionRate || 0}%</strong>
            </div>
            <div className="monthly-metric-row">
              <span>Best Habit:</span>
              <strong className="best-habit-highlight" title={habits?.bestHabit}>
                {habits?.bestHabit || 'None'}
              </strong>
            </div>
          </div>
        </div>

        {/* 2. Focus Timer */}
        <div className="monthly-section-card border-orange">
          <div className="section-card-header">
            <span className="section-icon">⏱️</span>
            <span className="section-title">Focus Timer</span>
          </div>
          <div className="section-body">
            <div className="monthly-metric-row">
              <span>Total Focus Time:</span>
              <strong>{focus?.totalMinutes || 0} mins</strong>
            </div>
            <div className="monthly-metric-row">
              <span>Sessions Logged:</span>
              <strong>{focus?.totalSessions || 0}</strong>
            </div>
            <div className="monthly-metric-row">
              <span>Daily Average:</span>
              <strong>{focus?.averageDailyMinutes || 0} mins/day</strong>
            </div>
          </div>
        </div>

        {/* 3. Reflection Journal */}
        <div className="monthly-section-card border-teal">
          <div className="section-card-header">
            <span className="section-icon">📓</span>
            <span className="section-title">Reflection Journal</span>
          </div>
          <div className="section-body">
            <div className="monthly-metric-row">
              <span>Total Reflections:</span>
              <strong>{reflections?.totalEntries || 0} entries</strong>
            </div>
            <div className="monthly-metric-row">
              <span>Average Mood:</span>
              <strong>{reflections?.averageMood || 0} / 5</strong>
            </div>

            {/* Sparkline Mood Trend */}
            <div className="monthly-sparkline-group">
              <span className="sparkline-title">Mood Trend Sparkline</span>
              {moodTrend.length === 0 ? (
                <div className="sparkline-empty">No entries this month</div>
              ) : (
                <div className="sparkline-chart">
                  {moodTrend.map((day, idx) => {
                    const moodVal = day.mood || 0;
                    const heightPercent = (moodVal / 5) * 100;
                    let sparkColor = 'rgba(255,255,255,0.1)'; // default gray

                    if (moodVal >= 4) sparkColor = 'var(--color-success, #4ade80)';
                    else if (moodVal === 3) sparkColor = '#fbbf24'; // Yellow
                    else if (moodVal > 0) sparkColor = '#f87171'; // Red

                    return (
                      <div
                        key={idx}
                        className="sparkline-bar"
                        style={{
                          height: moodVal > 0 ? `${heightPercent}%` : '4px',
                          backgroundColor: sparkColor,
                        }}
                        title={moodVal > 0 ? `${day.date}: Mood ${moodVal}/5` : `${day.date}: No entry`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Gratitude Journal */}
        <div className="monthly-section-card border-pink">
          <div className="section-card-header">
            <span className="section-icon">🙏</span>
            <span className="section-title">Gratitude Journal</span>
          </div>
          <div className="section-body">
            <div className="monthly-metric-row">
              <span>Total Entries:</span>
              <strong>{gratitude?.totalEntries || 0} entries</strong>
            </div>
            <div className="monthly-metric-row">
              <span>Things Recorded:</span>
              <strong>{gratitude?.totalItems || 0} items</strong>
            </div>
            <div className="monthly-categories-row">
              <span className="categories-lbl">Top Categories:</span>
              <div className="categories-badges-wrap">
                {gratitude?.topCategories && gratitude.topCategories.length > 0 ? (
                  gratitude.topCategories.map((catKey) => {
                    const catObj = CATEGORY_MAP[catKey] || { label: catKey, icon: '✨', colorClass: 'badge-pink' };
                    return (
                      <span key={catKey} className={`cat-badge ${catObj.colorClass}`}>
                        {catObj.icon} {catObj.label}
                      </span>
                    );
                  })
                ) : (
                  <span className="no-categories-badge">None</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Goals Tracker */}
        <div className="monthly-section-card border-purple">
          <div className="section-card-header">
            <span className="section-icon">🎯</span>
            <span className="section-title">Goals Tracker</span>
          </div>
          <div className="section-body">
            <div className="monthly-goals-stats-row">
              <div className="goal-monthly-box">
                <span className="goal-num text-blue">{goals?.created || 0}</span>
                <span className="goal-lbl">Created</span>
              </div>
              <div className="goal-monthly-box">
                <span className="goal-num text-success">{goals?.completed || 0}</span>
                <span className="goal-lbl">Completed</span>
              </div>
              <div className="goal-monthly-box">
                <span className="goal-num text-red">{goals?.abandoned || 0}</span>
                <span className="goal-lbl">Abandoned</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * WeeklyReport.jsx — Displays weekly summary, CSS bar charts, mood averages, and goals progress
 */

import React from 'react';

const formatWeekRange = (start, end) => {
  if (!start || !end) return '';
  try {
    const s = new Date(start);
    const e = new Date(end);
    const sMonth = s.toLocaleDateString(undefined, { month: 'short' });
    const sDay = s.getDate();
    const eMonth = e.toLocaleDateString(undefined, { month: 'short' });
    const eDay = e.getDate();
    const eYear = e.getFullYear();

    // Check if months are the same
    if (sMonth === eMonth) {
      return `${sMonth} ${sDay} – ${eDay}, ${eYear}`;
    }
    return `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${eYear}`;
  } catch (err) {
    return '';
  }
};

export default function WeeklyReport({ weeklyReport, loading }) {
  if (loading) {
    return <div className="stats-card-loading">Loading weekly report...</div>;
  }

  if (!weeklyReport) {
    return <div className="weekly-report-empty">No weekly report data available.</div>;
  }

  const { weekRange, habits, focus, reflections, gratitude, goals } = weeklyReport;
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Scale calculations for habits completions bar chart
  const completionsPerDay = habits?.completionsPerDay || [0, 0, 0, 0, 0, 0, 0];
  const maxCompletions = Math.max(...completionsPerDay, 0);

  // Scale calculations for focus minutes bar chart
  const minutesPerDay = focus?.minutesPerDay || [0, 0, 0, 0, 0, 0, 0];
  const maxMinutes = Math.max(...minutesPerDay, 0);

  return (
    <div className="stats-card weekly-report-card">
      <div className="weekly-header-row">
        <h3 className="stats-card-title">Weekly Summary Report</h3>
        <span className="week-range-badge">
          📅 {formatWeekRange(weekRange?.startDate, weekRange?.endDate)}
        </span>
      </div>

      <div className="weekly-sections-stack">
        {/* 1. Habits Section */}
        <div className="weekly-section-block">
          <h4 className="weekly-section-title">Habits Completion</h4>
          <div className="weekly-chart-card">
            <div className="weekly-bar-chart">
              {completionsPerDay.map((count, idx) => {
                const height = maxCompletions > 0 ? (count / maxCompletions) * 100 : 0;
                return (
                  <div key={idx} className="chart-bar-column">
                    <div className="chart-bar-container">
                      <div
                        className="chart-bar-fill habit-color"
                        style={{ height: `${Math.max(height, count > 0 ? 8 : 0)}%` }}
                      >
                        {count > 0 && <span className="bar-tooltip">{count} done</span>}
                      </div>
                    </div>
                    <span className="chart-bar-label">{daysOfWeek[idx]}</span>
                  </div>
                );
              })}
            </div>
            <div className="weekly-text-metric">
              <span>Most Consistent:</span>
              <strong>{habits?.mostConsistentHabit || 'None'}</strong>
            </div>
          </div>
        </div>

        {/* 2. Focus Section */}
        <div className="weekly-section-block">
          <h4 className="weekly-section-title">Focus Duration (Minutes)</h4>
          <div className="weekly-chart-card">
            <div className="weekly-bar-chart">
              {minutesPerDay.map((mins, idx) => {
                const height = maxMinutes > 0 ? (mins / maxMinutes) * 100 : 0;
                return (
                  <div key={idx} className="chart-bar-column">
                    <div className="chart-bar-container">
                      <div
                        className="chart-bar-fill focus-color"
                        style={{ height: `${Math.max(height, mins > 0 ? 8 : 0)}%` }}
                      >
                        {mins > 0 && <span className="bar-tooltip">{mins} mins</span>}
                      </div>
                    </div>
                    <span className="chart-bar-label">{daysOfWeek[idx]}</span>
                  </div>
                );
              })}
            </div>
            <div className="weekly-metrics-row">
              <div className="weekly-text-metric">
                <span>Total Focus Time:</span>
                <strong>{focus?.totalWeekMinutes || 0} mins</strong>
              </div>
              <div className="weekly-text-metric">
                <span>Best Focus Day:</span>
                <strong>{focus?.bestFocusDay || 'None'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Reflections & Gratitude Section */}
        <div className="weekly-section-block">
          <h4 className="weekly-section-title">Journaling & Mindfulness</h4>
          <div className="weekly-journal-grid">
            <div className="weekly-journal-box">
              <span className="journal-icon">📓</span>
              <div className="journal-vals">
                <span className="journal-num">{reflections?.entriesThisWeek || 0}</span>
                <span className="journal-lbl">Reflections logged</span>
              </div>
              <div className="journal-subtext">
                Avg Mood: <strong>{reflections?.averageMoodThisWeek || 0} / 5</strong>
              </div>
            </div>
            <div className="weekly-journal-box">
              <span className="journal-icon">🙏</span>
              <div className="journal-vals">
                <span className="journal-num">{gratitude?.entriesThisWeek || 0}</span>
                <span className="journal-lbl">Gratitude logs</span>
              </div>
              <div className="journal-subtext">
                Items: <strong>{gratitude?.totalItemsThisWeek || 0} things</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Goals Section */}
        <div className="weekly-section-block">
          <h4 className="weekly-section-title">Goals & Milestones Progress</h4>
          <div className="weekly-goals-grid">
            <div className="weekly-goal-val-box">
              <span className="goal-num text-purple">{goals?.goalsCompletedThisWeek || 0}</span>
              <span className="goal-lbl">Goals Completed</span>
            </div>
            <div className="weekly-goal-val-box">
              <span className="goal-num text-pink">{goals?.milestonesCompletedThisWeek || 0}</span>
              <span className="goal-lbl">Milestones Met</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

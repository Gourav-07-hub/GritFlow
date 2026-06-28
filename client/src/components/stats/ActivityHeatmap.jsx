/**
 * ActivityHeatmap.jsx — GitHub-style 365-day activity heatmap
 */

import React from 'react';

const getMonthLabel = (dateStr) => {
  if (!dateStr) return '';
  const [, month] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[parseInt(month) - 1];
};

const formatTooltipDate = (dateStr) => {
  try {
    const [year, month, day] = dateStr.split('-');
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

export default function ActivityHeatmap({ heatmap = [], loading }) {
  if (loading) {
    return <div className="heatmap-loading-container">Loading activity heatmap...</div>;
  }

  // 1. Map Sunday-Saturday to row slots
  const getDayIndex = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay();
    // Monday is 0, Tuesday is 1, ..., Sunday is 6
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  };

  // 2. Chunk 365 days into 53 weeks (columns)
  const columns = [];
  let currentColumn = [];

  // Pad the first column if the first data element doesn't start on a Monday
  if (heatmap.length > 0) {
    const firstDayIndex = getDayIndex(heatmap[0].date);
    for (let i = 0; i < firstDayIndex; i++) {
      currentColumn.push(null);
    }
  }

  heatmap.forEach((day) => {
    currentColumn.push(day);
    if (currentColumn.length === 7) {
      columns.push(currentColumn);
      currentColumn = [];
    }
  });

  if (currentColumn.length > 0) {
    while (currentColumn.length < 7) {
      currentColumn.push(null);
    }
    columns.push(currentColumn);
  }

  // 3. Find when months change to place month labels at the top
  let lastMonth = '';
  const monthHeaders = columns.map((col, idx) => {
    const activeDay = col.find((d) => d !== null);
    if (!activeDay) return null;
    const m = getMonthLabel(activeDay.date);
    if (m !== lastMonth) {
      lastMonth = m;
      return { label: m, colIndex: idx };
    }
    return null;
  });

  return (
    <div className="stats-card heatmap-card">
      <h3 className="stats-card-title">Activity Overview — Last 365 Days</h3>

      <div className="heatmap-scroll-outer">
        <div className="heatmap-grid-layout">
          {/* Day Names Row (left labels) */}
          <div className="heatmap-day-labels">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          <div className="heatmap-main-grid-wrapper">
            {/* Months Header Row */}
            <div className="heatmap-months-row">
              {columns.map((col, idx) => {
                const header = monthHeaders[idx];
                return (
                  <div key={idx} className="heatmap-month-header-cell">
                    {header ? header.label : ''}
                  </div>
                );
              })}
            </div>

            {/* Heatmap Blocks Grid */}
            <div className="heatmap-columns-row">
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="heatmap-week-column">
                  {col.map((day, dayIdx) => {
                    if (!day) {
                      return <div key={dayIdx} className="heatmap-square empty-pad" />;
                    }

                    return (
                      <div
                        key={dayIdx}
                        className={`heatmap-square level-${day.level}`}
                      >
                        {/* Hover CSS Tooltip */}
                        <div className="heatmap-tooltip">
                          <div className="tooltip-date">{formatTooltipDate(day.date)}</div>
                          <div className="tooltip-score">
                            <strong>{day.score} / 4</strong> activities done
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="heatmap-legend-footer">
        <span>Less</span>
        <div className="legend-squares-row">
          <div className="heatmap-square level-0" title="0 activities" />
          <div className="heatmap-square level-1" title="1 activity" />
          <div className="heatmap-square level-2" title="2 activities" />
          <div className="heatmap-square level-3" title="3 activities" />
          <div className="heatmap-square level-4" title="4 activities" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

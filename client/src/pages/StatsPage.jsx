/**
 * StatsPage.jsx — Unified statistics dashboard displaying overview grid, 365 days heatmap, weekly/monthly summary reports, and streak leaderboard
 */

import React, { useEffect } from 'react';
import useStats from '../hooks/useStats';
import OverviewCards from '../components/stats/OverviewCards';
import ActivityHeatmap from '../components/stats/ActivityHeatmap';
import WeeklyReport from '../components/stats/WeeklyReport';
import StreakLeaderboard from '../components/stats/StreakLeaderboard';
import MonthlyReport from '../components/stats/MonthlyReport';

export default function StatsPage() {
  useEffect(() => {
    document.title = 'Statistics | GritFlow';
  }, []);
  const {
    overview,
    heatmap,
    weeklyReport,
    monthlyReport,
    streaks,
    loading,
    error,
    selectedMonth,
    setSelectedMonth,
  } = useStats();

  return (
    <div className="stats-page-container">
      {/* Dashboard Page Header */}
      <div className="stats-header-row">
        <div>
          <h1 className="stats-page-title">Statistics Dashboard</h1>
          <p className="stats-page-subtitle">Track your progress, celebrate your growth</p>
        </div>
      </div>

      {/* Global Error Notice */}
      {error && (
        <div className="page-error-banner">
          ⚠️ {typeof error === 'string' ? error : 'Failed to connect to the Statistics aggregation service.'}
        </div>
      )}

      {/* Section 1: Overview Summary Cards (full width) */}
      <div className="dashboard-section">
        <OverviewCards overview={overview} loading={loading.overview} />
      </div>

      {/* Section 2: Activity Heatmap (full width) */}
      <div className="dashboard-section">
        <ActivityHeatmap heatmap={heatmap} loading={loading.heatmap} />
      </div>

      {/* Section 3: Two-Column Layout (Weekly Report on Left, Leaderboard on Right) */}
      <div className="dashboard-columns-grid">
        <div className="grid-column-left">
          <WeeklyReport weeklyReport={weeklyReport} loading={loading.weekly} />
        </div>
        <div className="grid-column-right">
          <StreakLeaderboard streaks={streaks} loading={loading.streaks} />
        </div>
      </div>

      {/* Section 4: Monthly Report (full width) */}
      <div className="dashboard-section">
        <MonthlyReport
          monthlyReport={monthlyReport}
          loading={loading.monthly}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </div>
    </div>
  );
}

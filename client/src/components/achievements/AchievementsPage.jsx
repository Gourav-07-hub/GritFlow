import React, { useState, useMemo } from 'react';
import useAchievements from '../../hooks/useAchievements';
import AchievementCard from './AchievementCard';

// Full list of possible achievements to show locked/unlocked states
const ACHIEVEMENT_DEFINITIONS = [
  // Habits
  { key: 'first_habit', title: 'First Step', description: 'Created your first habit', icon: '🏃', category: 'habits' },
  { key: 'habit_7_streak', title: 'Week Warrior', description: 'Maintained a 7-day habit streak', icon: '🔥', category: 'habits' },
  { key: 'habit_30_streak', title: 'Monthly Master', description: 'Maintained a 30-day habit streak', icon: '💪', category: 'habits' },
  { key: 'habit_100_streak', title: 'Century Club', description: 'Maintained a 100-day habit streak', icon: '🏆', category: 'habits' },
  { key: 'five_habits', title: 'Habit Builder', description: 'Created 5 or more habits', icon: '✅', category: 'habits' },
  { key: 'perfect_week', title: 'Perfect Week', description: 'Completed all habits for 7 days straight', icon: '⭐', category: 'habits' },
  
  // Goals
  { key: 'first_goal', title: 'Goal Setter', description: 'Set your first goal', icon: '🎯', category: 'goals' },
  { key: 'first_goal_done', title: 'Goal Crusher', description: 'Completed your first goal', icon: '🏅', category: 'goals' },
  { key: 'five_goals_done', title: 'Achiever', description: 'Completed 5 goals', icon: '🎖️', category: 'goals' },
  { key: 'milestone_master', title: 'Milestone Master', description: 'Completed 20 milestones across all goals', icon: '📍', category: 'goals' },
  
  // Reflection
  { key: 'first_reflection', title: 'Self Aware', description: 'Wrote your first reflection', icon: '📓', category: 'reflection' },
  { key: 'reflect_7_streak', title: 'Growing Mind', description: 'Reflected for 7 days in a row', icon: '🌱', category: 'reflection' },
  { key: 'reflect_30_streak', title: 'Deep Thinker', description: 'Reflected for 30 days in a row', icon: '🧠', category: 'reflection' },
  { key: 'reflect_100_days', title: 'Journal Legend', description: 'Written 100 reflection entries', icon: '📚', category: 'reflection' },
  
  // Focus
  { key: 'first_focus', title: 'First Focus', description: 'Completed your first focus session', icon: '⏱️', category: 'focus' },
  { key: 'focus_10_hours', title: 'Focus Apprentice', description: 'Accumulated 10 hours of focus time', icon: '🎯', category: 'focus' },
  { key: 'focus_50_hours', title: 'Focus Expert', description: 'Accumulated 50 hours of focus time', icon: '💡', category: 'focus' },
  { key: 'focus_100_hours', title: 'Focus Master', description: 'Accumulated 100 hours of focus time', icon: '🔬', category: 'focus' },
  { key: 'focus_7_streak', title: 'Consistent Focuser', description: 'Focused for 7 consecutive days', icon: '📅', category: 'focus' },
  
  // Gratitude
  { key: 'first_gratitude', title: 'Grateful Heart', description: 'Wrote your first gratitude entry', icon: '🙏', category: 'gratitude' },
  { key: 'grateful_7_streak', title: 'Gratitude Habit', description: 'Practiced gratitude for 7 days in a row', icon: '🌸', category: 'gratitude' },
  { key: 'grateful_30_streak', title: 'Gratitude Master', description: 'Practiced gratitude for 30 days in a row', icon: '🌺', category: 'gratitude' },
  { key: 'hundred_items', title: 'Gratitude Collector', description: 'Recorded 100 things to be grateful for', icon: '💎', category: 'gratitude' },
  
  // General
  { key: 'all_features', title: 'GritFlow Pro', description: 'Used all 5 features at least once', icon: '🌟', category: 'general' },
  { key: 'seven_day_active', title: 'Week Streak', description: 'Active on the dashboard for 7 days in a row', icon: '🗓️', category: 'general' },
  { key: 'thirty_day_active', title: 'Monthly Champion', description: 'Active on the dashboard for 30 days in a row', icon: '📆', category: 'general' },
];

import { useEffect } from 'react';

export default function AchievementsPage() {
  const { achievements, stats, loading } = useAchievements();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    document.title = 'Achievements | GritFlow';
  }, []);

  // Map category codes to formatted tabs
  const tabs = [
    { id: 'all', label: '🏆 All' },
    { id: 'habits', label: '🏃 Habits' },
    { id: 'goals', label: '🎯 Goals' },
    { id: 'reflection', label: '📓 Reflection' },
    { id: 'focus', label: '⏱️ Focus' },
    { id: 'gratitude', label: '🙏 Gratitude' },
    { id: 'general', label: '🌟 General' },
  ];

  // Dynamic calculations for stat cards
  const statsSummary = useMemo(() => {
    if (!achievements) return { total: 0, thisMonth: 0, bestCategory: 'None' };

    const total = achievements.length;

    // Unlocked in current calendar month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const thisMonth = achievements.filter((ach) => {
      const uDate = new Date(ach.unlockedAt);
      return uDate.getFullYear() === currentYear && uDate.getMonth() === currentMonth;
    }).length;

    // Find category with most achievements
    let bestCat = 'None';
    if (stats?.byCategory) {
      let maxCount = -1;
      Object.entries(stats.byCategory).forEach(([cat, val]) => {
        if (val > maxCount) {
          maxCount = val;
          bestCat = cat.charAt(0).toUpperCase() + cat.slice(1);
        }
      });
      if (maxCount === 0) bestCat = 'None';
    }

    return { total, thisMonth, bestCategory: bestCat };
  }, [achievements, stats]);

  // Combine unlocked details with definitions
  const processedAchievements = useMemo(() => {
    const unlockedMap = new Map(achievements.map((a) => [a.key, a]));

    return ACHIEVEMENT_DEFINITIONS.map((def) => {
      const unlockedRecord = unlockedMap.get(def.key);
      return {
        ...def,
        isUnlocked: !!unlockedRecord,
        unlockedAt: unlockedRecord ? unlockedRecord.unlockedAt : null,
      };
    });
  }, [achievements]);

  // Filter and sort achievements: Unlocked first, then Locked
  const filteredAchievements = useMemo(() => {
    const list = processedAchievements.filter(
      (ach) => activeTab === 'all' || ach.category === activeTab
    );

    return list.sort((a, b) => {
      if (a.isUnlocked && !b.isUnlocked) return -1;
      if (!a.isUnlocked && b.isUnlocked) return 1;
      
      // Sort unlocked achievements by unlock date (newest first)
      if (a.isUnlocked && b.isUnlocked) {
        return new Date(b.unlockedAt) - new Date(a.unlockedAt);
      }
      
      // Keep alphabetical/original order for locked ones
      return 0;
    });
  }, [processedAchievements, activeTab]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading achievements...</p>
      </div>
    );
  }

  const possibleCount = stats?.possible || ACHIEVEMENT_DEFINITIONS.length;
  const unlockedCount = stats?.total || 0;
  const progressPercent = stats?.percentage || 0;

  return (
    <div className="achievements-page-container">
      <header className="page-header">
        <h1 className="page-title">Achievements 🏆</h1>
        <p className="page-subtitle">Unlock rewards for staying consistent across all your goals and habits.</p>
      </header>

      {/* Progress Card */}
      <div className="achievements-progress-card">
        <div className="achievements-progress-header">
          <span className="achievements-progress-text">
            {unlockedCount} of {possibleCount} achievements unlocked
          </span>
          <span className="achievements-progress-percentage">
            {progressPercent}%
          </span>
        </div>
        <div className="achievements-progress-bar-bg" aria-hidden="true">
          <div
            className="achievements-progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="achievements-stats-row">
        <div className="achievements-stat-card">
          <div className="achievements-stat-val">{statsSummary.total}</div>
          <div className="achievements-stat-label">Total Unlocked</div>
        </div>
        <div className="achievements-stat-card">
          <div className="achievements-stat-val">{statsSummary.thisMonth}</div>
          <div className="achievements-stat-label">Unlocked This Month</div>
        </div>
        <div className="achievements-stat-card">
          <div className="achievements-stat-val">{statsSummary.bestCategory}</div>
          <div className="achievements-stat-label">Best Category</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="achievements-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`achievements-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      {filteredAchievements.length === 0 ? (
        <div className="dashboard-empty-state">
          <p>No achievements found for this category.</p>
        </div>
      ) : (
        <div className="achievement-grid">
          {filteredAchievements.map((ach) => (
            <AchievementCard
              key={ach.key}
              achievement={ach}
              isUnlocked={ach.isUnlocked}
            />
          ))}
        </div>
      )}
    </div>
  );
}

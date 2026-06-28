/**
 * StreakLeaderboard.jsx — Rank all habit and journal streaks, with medal accents for top 3
 */

import React from 'react';

const getMedalEmoji = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return rank;
};

const getRankClass = (rank) => {
  if (rank === 1) return 'rank-gold';
  if (rank === 2) return 'rank-silver';
  if (rank === 3) return 'rank-bronze';
  return '';
};

export default function StreakLeaderboard({ streaks = [], loading }) {
  if (loading) {
    return <div className="stats-card-loading">Loading streaks leaderboard...</div>;
  }

  // Filter out any streak items where currentStreak is 0 (or show all? Leaderboard showing active streaks, so showing items with currentStreak > 0 or all streaks sorted. The prompt says "leaderboard showing all active streaks: Rank | Icon | Feature / Habit Name | Current Streak | Longest Streak". So let's show all streaks sorted, but if there are no streaks, show the empty state).
  // Wait, if no streaks are active at all, we show the empty message:
  const activeStreaks = streaks.filter(s => s.currentStreak > 0);

  return (
    <div className="stats-card leaderboard-card">
      <h3 className="stats-card-title">Streak Leaderboard</h3>

      {activeStreaks.length === 0 ? (
        <div className="leaderboard-empty-state">
          No active streaks yet. Start building your habits! 🚀
        </div>
      ) : (
        <div className="leaderboard-table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="th-rank">Rank</th>
                <th className="th-icon">Icon</th>
                <th className="th-name">Feature / Habit</th>
                <th className="th-current">Current</th>
                <th className="th-longest">Longest</th>
              </tr>
            </thead>
            <tbody>
              {activeStreaks.map((item, index) => {
                const rank = index + 1;
                const rankClass = getRankClass(rank);
                return (
                  <tr key={index} className={`leaderboard-row ${rankClass}`}>
                    <td className="td-rank">
                      <span className={`rank-badge ${rank <= 3 ? 'rank-medal' : ''}`}>
                        {getMedalEmoji(rank)}
                      </span>
                    </td>
                    <td className="td-icon">
                      <span className="leaderboard-item-icon">{item.icon}</span>
                    </td>
                    <td className="td-name">
                      <div className="leaderboard-item-name-wrap">
                        <span className="item-main-name">{item.name}</span>
                        <span className="item-sub-feature">{item.feature}</span>
                      </div>
                    </td>
                    <td className="td-current font-weight-bold">
                      {item.currentStreak} days 🔥
                    </td>
                    <td className="td-longest">
                      {item.longestStreak} days
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

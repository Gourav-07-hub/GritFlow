import React from 'react';
import styles from './FriendsComponents.module.css';

/**
 * Display a side-by-side stats comparison card with a friend.
 * @param {{ comparison: object, friendName: string, loading: boolean }} props
 */
const FriendStatsComparison = ({ comparison, friendName, loading }) => {
  if (loading) {
    return (
      <div className={styles.comparisonContainer}>
        <h3 className={styles.comparisonHeading}>Head to Head ⚔️</h3>
        <div className={styles.comparisonSkeleton} aria-hidden="true">
          <div className={styles.skeletonComparisonLine}></div>
          <div className={styles.skeletonComparisonLine}></div>
          <div className={styles.skeletonComparisonLine}></div>
          <div className={styles.skeletonComparisonLine}></div>
          <div className={styles.skeletonComparisonLine}></div>
        </div>
      </div>
    );
  }

  if (!comparison) return null;

  const rows = [
    {
      label: 'Best Habit Streak',
      myVal: `${comparison.habits.myBestStreak} days`,
      theirVal: `${comparison.habits.theirBestStreak} days`,
      winner: comparison.habits.winner,
    },
    {
      label: 'Focus Minutes',
      myVal: `${comparison.focus.myTotalMinutes} mins`,
      theirVal: `${comparison.focus.theirTotalMinutes} mins`,
      winner: comparison.focus.winner,
    },
    {
      label: 'Reflection Streak',
      myVal: `${comparison.reflection.myStreak} days`,
      theirVal: `${comparison.reflection.theirStreak} days`,
      winner: comparison.reflection.winner,
    },
    {
      label: 'Gratitude Streak',
      myVal: `${comparison.gratitude.myStreak} days`,
      theirVal: `${comparison.gratitude.theirStreak} days`,
      winner: comparison.gratitude.winner,
    },
    {
      label: 'Achievements',
      myVal: comparison.achievements.myCount,
      theirVal: comparison.achievements.theirCount,
      winner: comparison.achievements.winner,
    },
  ];

  // Helper to resolve CSS classes for column text highlights
  const getColStyles = (side, winner) => {
    if (winner === 'tie') return styles.comparisonTie;
    if (winner === side) return styles.comparisonWinner;
    return styles.comparisonLoser;
  };

  return (
    <div className={styles.comparisonContainer}>
      <h3 className={styles.comparisonHeading}>Head to Head ⚔️</h3>

      <div className={styles.comparisonTable}>
        {/* Table Header */}
        <div className={styles.tableHeaderRow}>
          <div className={styles.headerColLeft}>You</div>
          <div className={styles.headerColCenter}>Category</div>
          <div className={styles.headerColRight}>{friendName}</div>
        </div>

        {/* Table Rows */}
        <div className={styles.tableBody}>
          {rows.map((row, idx) => (
            <div key={idx} className={styles.tableBodyRow}>
              <div className={`${styles.valColLeft} ${getColStyles('me', row.winner)}`}>
                {row.myVal}
              </div>
              <div className={styles.labelColCenter}>{row.label}</div>
              <div className={`${styles.valColRight} ${getColStyles('them', row.winner)}`}>
                {row.theirVal}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Winner Banner */}
      <div className={styles.comparisonBannerWrapper}>
        {comparison.overallWinner === 'me' && (
          <div className={`${styles.comparisonBanner} ${styles.bannerMe}`}>
            🏆 You're winning! Keep it up!
          </div>
        )}
        {comparison.overallWinner === 'them' && (
          <div className={`${styles.comparisonBanner} ${styles.bannerThem}`}>
            😤 {friendName} is ahead! Time to grind!
          </div>
        )}
        {comparison.overallWinner === 'tie' && (
          <div className={`${styles.comparisonBanner} ${styles.bannerTie}`}>
            🤝 You're perfectly matched!
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendStatsComparison;

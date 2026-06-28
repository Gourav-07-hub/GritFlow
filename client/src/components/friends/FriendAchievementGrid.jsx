import React, { useState } from 'react';
import styles from './FriendsComponents.module.css';

/**
 * Display friend's unlocked achievements with filters and golden styling.
 * @param {{ achievements: array, totalUnlocked: number, totalPossible: number }} props
 */
const FriendAchievementGrid = ({ achievements = [], totalUnlocked = 0, totalPossible = 23 }) => {
  const [activeTab, setActiveTab] = useState('All');

  const filterTabs = ['All', 'Habits', 'Goals', 'Reflection', 'Focus', 'Gratitude', 'General'];

  // Filter achievements based on selected category (case-insensitive)
  const filteredAchievements = activeTab === 'All'
    ? achievements
    : achievements.filter(a => a.category?.toLowerCase() === activeTab.toLowerCase());

  const percentage = Math.min(100, Math.round((totalUnlocked / totalPossible) * 100));

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.achievementsContainer}>
      <h3 className={styles.achievementsHeading}>Achievements 🏆</h3>
      
      {/* Golden Progress Bar */}
      <div className={styles.achievementsProgressWrapper}>
        <div className={styles.progressText}>
          {totalUnlocked} of {totalPossible} achievements unlocked
        </div>
        <div className={styles.progressBarBg}>
          <div 
            className={styles.progressBarFill} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterTabsRow}>
        {filterTabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.filterTabBtn} ${activeTab === tab ? styles.filterTabBtnActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      {filteredAchievements.length === 0 ? (
        <div className={styles.noAchievements}>
          No achievements unlocked yet
        </div>
      ) : (
        <div className={styles.achievementsGrid}>
          {filteredAchievements.map((ach) => (
            <div key={ach.key} className={styles.achievementCardGold}>
              <div className={styles.achievementIcon} aria-hidden="true">{ach.icon || '🏆'}</div>
              <div className={styles.achievementDetails}>
                <h4 className={styles.achievementTitle}>{ach.title}</h4>
                <p className={styles.achievementDesc}>{ach.description}</p>
                <div className={styles.achievementMeta}>
                  <span className={styles.achievementCategoryBadge}>{ach.category}</span>
                  <span className={styles.achievementUnlockDate}>Unlocked {formatDate(ach.unlockedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendAchievementGrid;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as friendService from '../services/friendService';
import PageLoader from '../components/ui/PageLoader';
import FriendProfileHeader from '../components/friends/FriendProfileHeader';
import FriendStreakCard from '../components/friends/FriendStreakCard';
import FriendStatsComparison from '../components/friends/FriendStatsComparison';
import FriendAchievementGrid from '../components/friends/FriendAchievementGrid';
import styles from './FriendsPage.module.css';

const FriendProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setErrorStatus(null);
    setErrorMessage('');
    try {
      const [profile, comparison] = await Promise.all([
        friendService.getFriendProfile(userId),
        friendService.getStreakComparison(userId),
      ]);
      setProfileData(profile);
      setComparisonData(comparison);
    } catch (err) {
      const status = err.response?.status || 500;
      setErrorStatus(status);
      setErrorMessage(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Friend Profile | GritFlow';
  }, []);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleRemoveFriend = async () => {
    if (!profileData || !profileData.friendshipId) return;
    try {
      await friendService.removeFriend(profileData.friendshipId);
      // Dispatch sync event so sidebar count updates
      window.dispatchEvent(new CustomEvent('friend-request-changed'));
      navigate('/dashboard/friends');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to remove friend');
    }
  };

  const handleMessage = () => {
    navigate(`/dashboard/chat/${userId}`);
  };

  if (loading) {
    return <PageLoader message="Loading friend profile..." />;
  }

  // Graceful handling of unauthorized view profile access (403)
  if (errorStatus === 403) {
    return (
      <div className={styles.emptyTabState} style={{ margin: '2rem 0' }}>
        <span className={styles.emptyStateIcon} role="img" aria-label="Locked">🔒</span>
        <h3 className={styles.emptyText} style={{ margin: '1rem 0' }}>
          You are not friends with this user 🔒
        </h3>
        <button 
          className={styles.cancelBtn} 
          onClick={() => navigate('/dashboard/friends')}
          style={{ marginTop: '1rem' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // Graceful handling of target user not found (404)
  if (errorStatus === 404) {
    return (
      <div className={styles.emptyTabState} style={{ margin: '2rem 0' }}>
        <span className={styles.emptyStateIcon} role="img" aria-label="Not Found">😕</span>
        <h3 className={styles.emptyText} style={{ margin: '1rem 0' }}>
          User not found 😕
        </h3>
        <button 
          className={styles.cancelBtn} 
          onClick={() => navigate('/dashboard/friends')}
          style={{ marginTop: '1rem' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // Fallback for other errors
  if (errorStatus) {
    return (
      <div className={styles.emptyTabState} style={{ margin: '2rem 0' }}>
        <span className={styles.emptyStateIcon} role="img" aria-label="Error">⚠️</span>
        <h3 className={styles.emptyText} style={{ margin: '1rem 0' }}>
          Error: {errorMessage}
        </h3>
        <button 
          className={styles.cancelBtn} 
          onClick={() => navigate('/dashboard/friends')}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!profileData) return null;

  const { profile, streaks, achievements, totalUnlocked, totalPossible, joinedDaysAgo } = profileData;

  // Resolve best active habit streak values (both current and longest)
  const bestHabitStreak = streaks.habits.length > 0
    ? Math.max(...streaks.habits.map((h) => h.currentStreak || 0))
    : 0;
  const bestHabitLongestStreak = streaks.habits.length > 0
    ? Math.max(...streaks.habits.map((h) => h.longestStreak || 0))
    : 0;

  return (
    <div className={styles.container}>
      {/* Profile Header */}
      <FriendProfileHeader
        profile={profile}
        joinedDaysAgo={joinedDaysAgo}
        totalUnlocked={totalUnlocked}
        onRemove={handleRemoveFriend}
        onMessage={handleMessage}
      />

      {/* Active Streaks Section */}
      <div className={styles.streaksSection}>
        <h3 className={styles.streaksHeading}>{profile.name}'s Active Streaks</h3>
        <div className={styles.streaksGrid}>
          <FriendStreakCard
            label="Habits"
            icon="✅"
            currentStreak={bestHabitStreak}
            longestStreak={bestHabitLongestStreak}
          />
          <FriendStreakCard
            label="Focus Timer"
            icon="⏱️"
            currentStreak={streaks.focus.currentStreak}
            longestStreak={streaks.focus.longestStreak}
          />
          <FriendStreakCard
            label="Reflection Journal"
            icon="📓"
            currentStreak={streaks.reflection.currentStreak}
            longestStreak={streaks.reflection.longestStreak}
          />
          <FriendStreakCard
            label="Gratitude Journal"
            icon="🙏"
            currentStreak={streaks.gratitude.currentStreak}
            longestStreak={streaks.gratitude.longestStreak}
          />
        </div>
      </div>

      {/* Head to Head Comparison */}
      <FriendStatsComparison
        comparison={comparisonData}
        friendName={profile.name}
        loading={loading}
      />

      {/* Unlocked Achievements Grid */}
      <FriendAchievementGrid
        achievements={achievements}
        totalUnlocked={totalUnlocked}
        totalPossible={totalPossible}
      />
    </div>
  );
};

export default FriendProfilePage;

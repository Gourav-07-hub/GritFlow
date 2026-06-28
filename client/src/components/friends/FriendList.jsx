import React from 'react';
import FriendCard from './FriendCard';
import styles from './FriendsComponents.module.css';

/**
 * Display list/grid of friends.
 * @param {{ friends: array, loading: boolean, error: string, onRemove: (friendshipId: string) => void }} props
 */
const FriendList = ({ friends, loading, error, onRemove }) => {
  if (loading) {
    return (
      <div className={styles.friendListGrid}>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={styles.skeletonCard} aria-hidden="true">
            <div className={styles.skeletonAvatar}></div>
            <div className={styles.skeletonTextLine}></div>
            <div className={styles.skeletonTextLineSub}></div>
            <div className={styles.skeletonButtons}></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorMessage}>Error: {error}</div>;
  }

  if (!friends || friends.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className="empty-state-illustration" role="img" aria-label="No friends">👥</span>
        <p className={styles.emptyStateText}>No friends yet. Search for people to connect with!</p>
      </div>
    );
  }

  return (
    <div className={styles.friendListGrid}>
      {friends.map((friend) => (
        <FriendCard
          key={friend._id}
          friend={friend}
          onRemove={() => onRemove(friend.friendshipId)}
        />
      ))}
    </div>
  );
};

export default FriendList;

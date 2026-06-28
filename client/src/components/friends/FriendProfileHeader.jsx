import React from 'react';
import styles from './FriendsComponents.module.css';

/**
 * Display friend's profile header card with avatar, name, badges and action triggers.
 * @param {{ profile: object, joinedDaysAgo: number, totalUnlocked: number, onRemove: () => void, onMessage: () => void }} props
 */
const FriendProfileHeader = ({ profile, joinedDaysAgo, totalUnlocked, onRemove, onMessage }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRemove = () => {
    const confirmRemove = window.confirm(`Are you sure you want to remove ${profile.name}?`);
    if (confirmRemove) {
      onRemove();
    }
  };

  return (
    <div className={styles.profileHeader}>
      <div className={styles.profileHeaderMain}>
        {profile.avatar ? (
          <img src={profile.avatar} alt={profile.name} className={styles.avatarXl} />
        ) : (
          <div className={styles.avatarXlPlaceholder}>{getInitials(profile.name)}</div>
        )}
        <div className={styles.profileInfoDetails}>
          <h2 className={styles.profileNameTitle}>{profile.name}</h2>
          <div className={styles.profileUsernameSubtitle}>@{profile.username}</div>
          <div className={styles.profileBadgesRow}>
            <span className={styles.badgeItem}>Joined {joinedDaysAgo}d ago</span>
            <span className={`${styles.badgeItem} ${styles.badgeGold}`}>🏆 {totalUnlocked} / 23 Achievements</span>
          </div>
        </div>
      </div>

      <div className={styles.profileHeaderControls}>
        <button className={styles.profileMessageBtn} onClick={onMessage}>
          Message
        </button>
        <button className={styles.profileRemoveBtnOutline} onClick={handleRemove}>
          Remove Friend
        </button>
      </div>
    </div>
  );
};

export default FriendProfileHeader;

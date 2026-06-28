import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FriendsComponents.module.css';
import useSocket from '../../hooks/useSocket.js';

/**
 * Display card for an accepted friend.
 * @param {{ friend: object, onRemove: () => void }} props
 */
const FriendCard = ({ friend, onRemove }) => {
  const navigate = useNavigate();
  const { isUserOnline } = useSocket();
  const isOnline = isUserOnline(friend._id);

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
    const confirmRemove = window.confirm(`Are you sure you want to remove ${friend.name}?`);
    if (confirmRemove) {
      onRemove();
    }
  };

  return (
    <div className={styles.friendCard}>
      <div className={styles.friendCardHeader}>
        <div className="friend-card-avatar-container">
          {friend.avatar ? (
            <img src={friend.avatar} alt={friend.name} className={styles.avatarLg} />
          ) : (
            <div className={styles.avatarLgPlaceholder}>{getInitials(friend.name)}</div>
          )}
          <span className={`status-dot-indicator ${isOnline ? 'online' : 'offline'}`} />
        </div>
        <div className={styles.friendName}>{friend.name}</div>
        <div className={styles.friendUsername}>@{friend.username}</div>
        <div className={`friend-online-status-text ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? 'Online now' : 'Offline'}
        </div>
      </div>

      <div className={styles.friendActions}>
        <button 
          className={styles.actionBtnOutline} 
          onClick={() => navigate(`/dashboard/friends/${friend._id}`)}
          type="button"
        >
          View Profile
        </button>
        <button 
          className={styles.actionBtnOutline} 
          onClick={() => navigate(`/dashboard/chat/${friend._id}`)}
          type="button"
        >
          Message
        </button>
      </div>

      <div className={styles.removeFriendWrapper}>
        <button className={styles.removeFriendBtn} onClick={handleRemove} type="button">
          Remove Friend
        </button>
      </div>
    </div>
  );
};

export default FriendCard;

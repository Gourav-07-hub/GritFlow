import React, { useState } from 'react';
import styles from './FriendsComponents.module.css';

/**
 * Display card for a user matching the search query.
 * @param {{ user: object, onSendRequest: (id: string) => Promise<void>, onRespond: (id: string, action: string) => Promise<void> }} props
 */
const UserSearchCard = ({ user, onSendRequest, onRespond }) => {
  const [showRespondActions, setShowRespondActions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper to generate initials avatar if no avatar URL is provided
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSend = async () => {
    setLoading(true);
    try {
      await onSendRequest(user._id);
    } catch (err) {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    setLoading(true);
    try {
      await onRespond(user._id, action);
      setShowRespondActions(false);
    } catch (err) {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardInfo}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className={styles.avatar} />
        ) : (
          <div className={styles.avatarPlaceholder}>{getInitials(user.name)}</div>
        )}
        <div className={styles.userDetails}>
          <div className={styles.name}>{user.name}</div>
          <div className={styles.username}>@{user.username}</div>
        </div>
      </div>

      <div className={styles.cardActions}>
        {user.friendshipStatus === 'not_friends' && (
          <button 
            className={styles.primaryBtn} 
            onClick={handleSend} 
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Friend'}
          </button>
        )}

        {user.friendshipStatus === 'pending_sent' && (
          <button className={styles.disabledBtn} disabled>
            Request Sent
          </button>
        )}

        {user.friendshipStatus === 'pending_received' && (
          <>
            {!showRespondActions ? (
              <button 
                className={styles.warningBtn} 
                onClick={() => setShowRespondActions(true)}
                disabled={loading}
              >
                Respond
              </button>
            ) : (
              <div className={styles.inlineActions}>
                <button 
                  className={styles.acceptBtn} 
                  onClick={() => handleAction('accept')}
                  disabled={loading}
                  title="Accept Friend Request"
                >
                  ✓
                </button>
                <button 
                  className={styles.rejectBtn} 
                  onClick={() => handleAction('reject')}
                  disabled={loading}
                  title="Reject Friend Request"
                >
                  ✕
                </button>
              </div>
            )}
          </>
        )}

        {user.friendshipStatus === 'accepted' && (
          <button className={styles.successBtn} disabled>
            Friends ✅
          </button>
        )}
      </div>
    </div>
  );
};

export default UserSearchCard;

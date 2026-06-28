import React, { useState } from 'react';
import styles from './FriendsComponents.module.css';

/**
 * Display card for a received pending friend request.
 * @param {{ request: object, onAccept: (id: string) => Promise<void>, onReject: (id: string) => Promise<void> }} props
 */
const PendingRequestCard = ({ request, onAccept, onReject }) => {
  const [loading, setLoading] = useState(false);
  const requester = request.requester;

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAction = async (action) => {
    setLoading(true);
    try {
      if (action === 'accept') {
        await onAccept(request._id);
      } else {
        await onReject(request._id);
      }
    } catch (err) {
      // Error handled by parent/toast
    } finally {
      setLoading(false);
    }
  };

  // Human readable time ago helper
  const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!requester) return null;

  return (
    <div className={styles.requestCard}>
      <div className={styles.requestCardInfo}>
        {requester.avatar ? (
          <img src={requester.avatar} alt={requester.name} className={styles.avatar} />
        ) : (
          <div className={styles.avatarPlaceholder}>{getInitials(requester.name)}</div>
        )}
        <div className={styles.requestDetails}>
          <div className={styles.requestUserText}>
            <span className={styles.boldName}>{requester.name}</span>
            <span className={styles.usernameMuted}> @{requester.username}</span>
          </div>
          <div className={styles.requestSubtext}>sent you a friend request</div>
          <div className={styles.timeAgo}>{timeAgo(request.requestedAt)}</div>
        </div>
      </div>

      <div className={styles.requestCardActions}>
        <button
          className={styles.acceptBtnFull}
          onClick={() => handleAction('accept')}
          disabled={loading}
        >
          {loading ? '...' : 'Accept'}
        </button>
        <button
          className={styles.rejectBtnOutline}
          onClick={() => handleAction('reject')}
          disabled={loading}
        >
          {loading ? '...' : 'Reject'}
        </button>
      </div>
    </div>
  );
};

export default PendingRequestCard;

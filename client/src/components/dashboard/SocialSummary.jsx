import React from 'react';
import { useNavigate } from 'react-router-dom';
import useFriends from '../../hooks/useFriends';
import useSocket from '../../hooks/useSocket';
import useChat from '../../hooks/useChat';

/**
 * Social Summary widget showing real-time friends activity, online status, and pending/unread counts.
 */
export default function SocialSummary() {
  const navigate = useNavigate();
  const { friends, pendingRequests } = useFriends();
  const { isUserOnline } = useSocket();
  const { unreadCount } = useChat();

  const onlineFriends = friends.filter((f) => isUserOnline(f._id));
  const totalFriendsCount = friends.length;
  const onlineFriendsCount = onlineFriends.length;
  const pendingCount = pendingRequests.length;

  const renderAvatars = () => {
    const displayFriends = onlineFriends.slice(0, 5);
    return (
      <div className="social-summary-avatars-row">
        {displayFriends.map((f) => {
          const initials = f.name
            ? f.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
            : 'U';
          return (
            <div key={f._id} className="social-summary-avatar-item stacked-avatar" title={f.name}>
              {f.avatar ? (
                <img src={f.avatar} alt={f.name} className="social-summary-avatar-img" />
              ) : (
                <div className="social-summary-avatar-placeholder">{initials}</div>
              )}
              <span className="social-summary-avatar-online-dot" />
            </div>
          );
        })}
        {onlineFriendsCount > 5 && (
          <div className="social-summary-avatar-more">+{onlineFriendsCount - 5}</div>
        )}
      </div>
    );
  };

  return (
    <div className="widget-card widget-social-card fade-in-up delay-6">
      <h3 className="widget-section-title">
        <span className="widget-title-icon blue">👥</span> Friends Activity
      </h3>

      {totalFriendsCount === 0 ? (
        <div className="social-summary-empty">
          <p className="social-summary-empty-text">
            Connect with friends to see their activity! 👥
          </p>
          <button
            className="social-summary-btn"
            onClick={() => navigate('/dashboard/friends')}
            type="button"
          >
            Find Friends
          </button>
        </div>
      ) : (
        <div className="social-summary-content">
          <div className="social-summary-stats-grid">
            <div className="social-summary-stat-box">
              <span className="stat-label">Total Friends</span>
              <span className="stat-value">{totalFriendsCount}</span>
            </div>
            <div className="social-summary-stat-box">
              <span className="stat-label">Online Now</span>
              <span className="stat-value">{onlineFriendsCount}</span>
            </div>
          </div>

          {onlineFriendsCount > 0 && (
            <div className="social-summary-online-section">
              <span className="online-section-label">Online friends:</span>
              {renderAvatars()}
            </div>
          )}

          <div className="social-summary-links">
            <div className="social-summary-link-row">
              <span>
                Pending Friend Requests: <strong>{pendingCount}</strong>
              </span>
              {pendingCount > 0 && (
                <button
                  className="social-summary-link-btn"
                  onClick={() => navigate('/dashboard/friends')}
                  type="button"
                >
                  View
                </button>
              )}
            </div>
            <div className="social-summary-link-row">
              <span>
                Unread Messages: <strong>{unreadCount}</strong>
              </span>
              <button
                className="social-summary-link-btn"
                onClick={() => navigate('/dashboard/chat')}
                type="button"
              >
                Open Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

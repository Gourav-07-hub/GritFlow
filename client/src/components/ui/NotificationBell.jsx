import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../../hooks/useNotifications';
import { respondToRequest } from '../../services/friendService';

/**
 * Helper to convert ISO dates into human-readable "time ago" format
 */
function formatTimeAgo(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    readNotification,
    readAll,
    removeNotification,
    clearAll,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => {
      if (!prev) {
        fetchNotifications(false);
      }
      return !prev;
    });
  };

  const getFriendshipId = (notification) => {
    if (notification.friendshipId) return notification.friendshipId;
    if (notification.link && notification.link.includes('friendshipId=')) {
      const match = notification.link.match(/friendshipId=([^&]+)/);
      return match ? match[1] : null;
    }
    return null;
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await readNotification(notification._id);
      }
      setIsOpen(false);

      if (notification.type === 'new_message') {
        if (notification.conversationId) {
          navigate(`/dashboard/chat/${notification.from?._id || ''}`);
        } else {
          navigate('/dashboard/chat');
        }
      } else if (notification.type === 'achievement') {
        navigate('/dashboard/achievements');
      } else if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  };

  const handleDeleteClick = async (e, id) => {
    e.stopPropagation();
    try {
      await removeNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleFriendRequestAction = async (notification, action) => {
    const friendshipId = getFriendshipId(notification);
    if (!friendshipId) {
      console.error('No friendship ID found for friend request notification.');
      return;
    }
    try {
      await respondToRequest(friendshipId, action);
      await readNotification(notification._id);
      
      window.dispatchEvent(new CustomEvent('friend-request-changed'));
      fetchNotifications(false);
    } catch (err) {
      console.error('Failed to respond to friend request from notification:', err);
    }
  };

  const renderNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request':
        return '👥';
      case 'friend_accepted':
        return '🤝';
      case 'new_message':
        return '💬';
      case 'achievement':
        return '🏆';
      case 'reminder':
        return '🔔';
      case 'goal_deadline':
        return '🎯';
      case 'streak_alert':
        return '🔥';
      case 'milestone':
        return '📍';
      default:
        return '🔔';
    }
  };

  const getIconContainerClass = (type) => {
    switch (type) {
      case 'friend_request':
        return 'notif-icon-blue';
      case 'friend_accepted':
        return 'notif-icon-green';
      case 'new_message':
        return 'notif-icon-purple';
      case 'achievement':
        return 'notif-icon-yellow';
      default:
        return 'notif-icon-gray';
    }
  };

  // Filter notifications by active tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Social') {
      return ['friend_request', 'friend_accepted', 'new_message'].includes(n.type);
    }
    if (activeTab === 'Awards') {
      return n.type === 'achievement';
    }
    if (activeTab === 'Alerts') {
      return ['reminder', 'goal_deadline', 'streak_alert', 'milestone'].includes(n.type);
    }
    return true;
  });

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="icon-btn"
        onClick={toggleDropdown}
        aria-label="Notifications"
        aria-expanded={isOpen}
        title="View Notifications"
        type="button"
      >
        <span style={{ fontSize: '1.25rem' }}>🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <div className="notif-header-actions">
                <button
                  type="button"
                  onClick={readAll}
                >
                  Mark all read
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="notif-tabs">
            {['All', 'Social', 'Awards', 'Alerts'].map(tab => (
              <button
                key={tab}
                className={`notif-tab ${activeTab === tab ? 'notif-tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="notif-list">
            {filteredNotifications.length === 0 ? (
              <div className="notif-empty">
                <span style={{ fontSize: '1.5rem' }}>🔔</span>
                <span>No notifications in this category</span>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notif-item ${!notification.isRead ? 'notif-item--unread' : ''} ${notification.type}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <span className={`notif-item__icon ${getIconContainerClass(notification.type)}`}>
                    {renderNotificationIcon(notification.type)}
                  </span>
                  <div className="notif-item__content">
                    <h4 className="notif-item__title">
                      {notification.title}
                    </h4>
                    <p className="notif-item__message">
                      {notification.message}
                    </p>
                    {notification.type === 'friend_request' && !notification.isRead && (
                      <div className="notification-item-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="notif-action-accept-btn"
                          onClick={() => handleFriendRequestAction(notification, 'accept')}
                          type="button"
                        >
                          Accept
                        </button>
                        <button
                          className="notif-action-decline-btn"
                          onClick={() => handleFriendRequestAction(notification, 'reject')}
                          type="button"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    <span className="notif-item__time">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="notification-item-delete-btn"
                    onClick={(e) => handleDeleteClick(e, notification._id)}
                    title="Delete Notification"
                    aria-label="Delete Notification"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

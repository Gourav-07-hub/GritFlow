import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Single Conversation Item for the left panel conversation list.
 * Class mapping corresponds to global.css redesign classes:
 * - conversation-item-container (.active, .unread)
 * - conv-item-avatar-wrapper, conv-item-avatar, conv-avatar-initials
 * - status-dot-indicator (.online, .offline)
 * - conv-item-content, conv-item-header, conv-item-name, conv-item-time
 * - conv-item-footer, conv-item-preview, conv-unread-badge
 */
export default function ConversationItem({ conversation, isActive, isOnline, onClick }) {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;

  // Find the other participant in the conversation
  const friend = conversation.participants.find(
    (p) => p._id.toString() !== currentUserId?.toString()
  ) || { name: 'User', username: 'user', avatar: '' };

  const initials = friend.name
    ? friend.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderLastMessagePreview = () => {
    const msg = conversation.lastMessage;
    if (!msg) return <span className="conv-preview-empty">No messages yet</span>;

    if (msg.isDeleted) {
      return <span className="conv-preview-deleted">Message deleted</span>;
    }

    const senderId = (msg.sender?._id || msg.sender || '').toString();
    const isFromMe = senderId === currentUserId?.toString();
    const prefix = isFromMe ? 'You: ' : '';
    const content = msg.content || '';

    const fullText = `${prefix}${content}`;
    if (fullText.length > 40) {
      return `${fullText.substring(0, 37)}...`;
    }
    return fullText;
  };

  const hasUnread = conversation.unreadCount > 0;

  return (
    <div
      className={`conversation-item-container ${isActive ? 'active' : ''} ${hasUnread ? 'unread' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <div className="conv-item-avatar-wrapper">
        {friend.avatar ? (
          <img src={friend.avatar} alt={friend.name} className="conv-item-avatar" />
        ) : (
          <div className="conv-item-avatar conv-avatar-initials">{initials}</div>
        )}
        <span className={`status-dot-indicator ${isOnline ? 'online' : 'offline'}`} />
      </div>

      <div className="conv-item-content">
        <div className="conv-item-header">
          <span className={`conv-item-name ${hasUnread ? 'bold' : ''}`}>{friend.name}</span>
          <span className="conv-item-time">{formatTimeAgo(conversation.lastActivity)}</span>
        </div>

        <div className="conv-item-footer">
          <span className="conv-item-preview">{renderLastMessagePreview()}</span>
          {hasUnread && (
            <span className="conv-unread-badge" aria-label={`${conversation.unreadCount} unread messages`}>
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import EmojiReactionPicker from './EmojiReactionPicker.jsx';


/**
 * Single Message Bubble component displaying text, times, read receipts, reactions, and context options.
 */
export default function MessageBubble({ message, isOwn, onReact, onDelete, isConsecutive, showTime }) {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;

  if (!message) return null;

  const timeString = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Group reactions: emoji -> { count, users: [] }
  const groupedReactions = (message.reactions || []).reduce((acc, curr) => {
    const emoji = curr.emoji;
    const userId = (curr.user?._id || curr.user || '').toString();
    if (!acc[emoji]) {
      acc[emoji] = {
        emoji,
        count: 0,
        users: []
      };
    }
    acc[emoji].count += 1;
    acc[emoji].users.push(userId);
    return acc;
  }, {});

  const reactionPills = Object.values(groupedReactions);

  const handleReactionPillClick = (emoji) => {
    onReact(message._id, emoji);
  };

  return (
    <div
      className={`message-bubble-wrapper ${isOwn ? 'own-message' : 'friend-message'} ${
        isConsecutive ? 'consecutive' : ''
      }`}
    >
      <div className="message-bubble-content-wrapper">
        {/* Hover Actions: Reaction picker + delete button */}
        {!message.isDeleted && (
          <div className="message-hover-actions">
            <EmojiReactionPicker
              messageId={message._id}
              onReact={onReact}
            />
            {isOwn && (
              <button
                className="message-hover-delete-btn"
                onClick={() => onDelete(message._id)}
                type="button"
                title="Delete message"
              >
                <span className="material-symbols-outlined" style={{fontSize: '14px'}}>Delete</span>
              </button>
            )}
          </div>
        )}

        {/* The Message Bubble */}
        <div className={`message-bubble ${message.isDeleted ? 'deleted' : ''}`}>
          {message.isDeleted ? (
            <span className="deleted-message-text">This message was deleted</span>
          ) : (
            <div className="message-text">{message.content}</div>
          )}
        </div>

        {/* Reaction Pills below bubble */}
        {!message.isDeleted && reactionPills.length > 0 && (
          <div className="message-reactions-container">
            {reactionPills.map((pill) => {
              const myReaction = pill.users.includes(currentUserId?.toString());
              return (
                <button
                  key={pill.emoji}
                  className={`reaction-pill ${myReaction ? 'active' : ''}`}
                  onClick={() => handleReactionPillClick(pill.emoji)}
                  type="button"
                >
                  <span>{pill.emoji}</span>
                  <span className="reaction-count">{pill.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Time and Read Receipts */}
        {showTime && (
          <div className="message-meta">
            <span className="message-time">{timeString}</span>
            {isOwn && !message.isDeleted && (
              <span className={`message-status ${message.isRead ? 'read' : 'sent'}`} title={message.isRead ? 'Read' : 'Sent'}>
                {message.isRead ? (
                  <span className="read-receipt-ticks read">✓✓</span>
                ) : (
                  <span className="read-receipt-ticks">✓</span>
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

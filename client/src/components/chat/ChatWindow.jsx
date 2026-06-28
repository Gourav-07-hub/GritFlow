import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import ChatHeader from './ChatHeader.jsx';
import MessageBubble from './MessageBubble.jsx';
import MessageInput from './MessageInput.jsx';
import TypingIndicator from './TypingIndicator.jsx';

/**
 * Chat Window container showing the messages, headers, typing states, and inputs.
 * Styled using redesigned classes:
 * - chat-window-container
 * - chat-messages-area (scroller with custom styling)
 * - chat-messages-loading-state, chat-messages-spinner
 * - chat-window-empty-state, empty-avatar-container, empty-chat-avatar, empty-chat-text
 * - chat-messages-list, chat-load-more-btn
 */
export default function ChatWindow({
  conversation,
  messages,
  isTyping,
  hasMore,
  onSend,
  onLoadMore,
  onReact,
  onDelete,
  onTyping,
  onStopTyping,
  isOnline,
  onBack,
  loading
}) {
  const { user } = useAuth();
  const currentUserId = (user?._id || user?.id || '').toString();

  const scrollRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Find the friend participant details
  const friend = conversation?.participants.find(
    (p) => p._id.toString() !== currentUserId
  ) || { name: 'User', avatar: '' };

  const initials = friend.name
    ? friend.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  // Handle scroll events to detect if user has scrolled up
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    // Within 150px of the bottom is considered "near the bottom"
    const threshold = 150;
    const scrollPosition = container.scrollHeight - container.scrollTop - container.clientHeight;
    setIsNearBottom(scrollPosition < threshold);
  };

  const scrollToBottom = () => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  // Scroll to bottom on conversation change
  useEffect(() => {
    scrollToBottom();
    setIsNearBottom(true);
  }, [conversation?._id]);

  // Smart auto-scroll when new messages arrive
  useEffect(() => {
    if (isNearBottom) {
      // Small timeout to ensure browser has rendered DOM additions
      const timer = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isNearBottom]);

  const renderMessagesWithDateSeparators = () => {
    const elements = [];
    let lastDateString = '';

    // The messages in state are newest-first (prepended).
    // We reverse the array to display chronologically (oldest at top).
    const chronologicalMessages = [...messages].reverse();

    chronologicalMessages.forEach((msg, idx) => {
      const msgDate = new Date(msg.createdAt);
      const dateString = msgDate.toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (dateString !== lastDateString) {
        let label = dateString;
        const todayStr = new Date().toLocaleDateString([], {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString([], {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        if (dateString === todayStr) {
          label = 'Today';
        } else if (dateString === yesterdayStr) {
          label = 'Yesterday';
        }

        elements.push(
          <div key={`date-${msg._id || idx}`} className="chat-date-separator">
            <span className="chat-date-separator-label">{label}</span>
          </div>
        );
        lastDateString = dateString;
      }

      // Check if the previous message was from the same sender
      const isConsecutive =
        idx > 0 &&
        chronologicalMessages[idx - 1].sender._id.toString() === msg.sender._id.toString();

      // Show time on the last message in a consecutive group (or if the sender changes)
      const showTime =
        idx === chronologicalMessages.length - 1 ||
        chronologicalMessages[idx + 1].sender._id.toString() !== msg.sender._id.toString();

      elements.push(
        <MessageBubble
          key={msg._id}
          message={msg}
          isOwn={msg.sender._id.toString() === currentUserId}
          onReact={onReact}
          onDelete={onDelete}
          isConsecutive={isConsecutive}
          showTime={showTime}
        />
      );
    });

    return elements;
  };

  return (
    <div className="chat-window-container">
      <ChatHeader
        friend={friend}
        isOnline={isOnline}
        onBack={onBack}
      />

      <div
        className="chat-messages-area"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {loading.messages ? (
          <div className="chat-messages-loading-state">
            <div className="chat-messages-spinner" />
            <span>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-window-empty-state">
            <div className="empty-avatar-container">
              {friend.avatar ? (
                <img src={friend.avatar} alt={friend.name} className="empty-chat-avatar" />
              ) : (
                <div className="empty-chat-avatar chat-avatar-initials">{initials}</div>
              )}
              <span className={`status-dot-indicator large ${isOnline ? 'online' : 'offline'}`} />
            </div>
            <div className="empty-chat-text">Start a conversation with {friend.name}! 👋</div>
          </div>
        ) : (
          <div className="chat-messages-list">
            {hasMore && (
              <button className="chat-load-more-btn" onClick={onLoadMore} type="button">
                Load previous messages
              </button>
            )}
            {renderMessagesWithDateSeparators()}
          </div>
        )}

        {/* Typing indicator stays pinned at the bottom of the list */}
        <TypingIndicator friendName={friend.name} isTyping={isTyping} />
      </div>

      <MessageInput
        onSend={onSend}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
        loading={loading.messages}
      />
    </div>
  );
}

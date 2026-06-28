import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConversationItem from './ConversationItem.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Search, Users } from 'lucide-react';

/**
 * Left panel component showing a search bar and the list of user conversations.
 */
export default function ConversationList({ conversations, activeId, onlineUsers, onSelect, loading }) {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Extract other user's name for filtering
  const getFriendName = (conversation) => {
    const friend = conversation.participants.find(
      (p) => p._id.toString() !== currentUserId?.toString()
    );
    return friend ? friend.name.toLowerCase() : '';
  };

  const filteredConversations = conversations.filter((c) =>
    getFriendName(c).includes(searchQuery.toLowerCase())
  );

  return (
    <div className="conversation-list-container">
      <div className="conversation-search-wrapper">
        <Search size={16} className="search-input-icon" />
        <input
          type="text"
          className="conversation-search-input"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="conversation-list-scrollable">
        {loading ? (
          // Skeleton loading states
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="conversation-skeleton-item">
              <div className="skeleton-avatar" />
              <div className="skeleton-text-group">
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-body" />
              </div>
            </div>
          ))
        ) : filteredConversations.length === 0 ? (
          <div className="conversation-list-empty-state">
            <Users size={40} className="empty-state-icon" />
            <div className="empty-title">No conversations yet</div>
            <div className="empty-subtitle">Go to Friends to start chatting!</div>
            <button
              onClick={() => navigate('/dashboard/friends')}
              className="find-friends-btn"
              type="button"
            >
              Find Friends →
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const friend = conv.participants.find(
              (p) => p._id.toString() !== currentUserId?.toString()
            );
            const isOnline = friend ? onlineUsers.has(friend._id.toString()) : false;
            return (
              <ConversationItem
                key={conv._id}
                conversation={conv}
                isActive={conv._id === activeId}
                isOnline={isOnline}
                onClick={() => onSelect(conv)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

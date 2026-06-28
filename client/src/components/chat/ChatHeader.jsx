import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Header component for the active Chat window.
 */
export default function ChatHeader({ friend, isOnline, onBack, onViewProfile }) {
  const navigate = useNavigate();

  if (!friend) return null;

  const initials = friend.name
    ? friend.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(friend._id);
    } else {
      navigate(`/dashboard/friends/${friend._id}`);
    }
  };

  return (
    <div className="chat-header-container">
      <div className="chat-header-left">
        <button className="chat-back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>

        <div className="chat-header-avatar-wrapper">
          {friend.avatar ? (
            <img src={friend.avatar} alt={friend.name} className="chat-header-avatar" />
          ) : (
            <div className="chat-header-avatar chat-avatar-initials">{initials}</div>
          )}
          <span className={`status-dot-indicator ${isOnline ? 'online' : 'offline'}`} />
        </div>

        <div className="chat-header-info">
          <div className="chat-header-name">{friend.name}</div>
          <div className={`chat-header-status-text ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>

      <button className="chat-view-profile-btn" onClick={handleViewProfile} type="button">
        View Profile
      </button>
    </div>
  );
}

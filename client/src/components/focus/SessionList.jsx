/**
 * SessionList.jsx — Today's focus sessions history list with type filtering
 */

import React, { useState } from 'react';

export default function SessionList({ sessions, onDelete, loading }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'focus' | 'breaks'

  const getSessionIcon = (type) => {
    switch (type) {
      case 'focus':
        return '🎯';
      case 'short_break':
        return '☕';
      case 'long_break':
        return '🌿';
      default:
        return '⏱️';
    }
  };

  const getSessionTypeLabel = (type) => {
    switch (type) {
      case 'focus':
        return 'Focus Session';
      case 'short_break':
        return 'Short Break';
      case 'long_break':
        return 'Long Break';
      default:
        return 'Session';
    }
  };

  const formatCompletedTime = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    if (filter === 'focus') return s.type === 'focus';
    if (filter === 'breaks') return s.type === 'short_break' || s.type === 'long_break';
    return true; // 'all'
  });

  return (
    <div className="sessions-card">
      <div className="sessions-card-header">
        <h3 className="sessions-card-title">Today's Focus Log</h3>
        
        {/* Filter Controls */}
        <div className="sessions-filter-tabs">
          <button
            className={`filter-tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-tab-btn ${filter === 'focus' ? 'active' : ''}`}
            onClick={() => setFilter('focus')}
          >
            Focus
          </button>
          <button
            className={`filter-tab-btn ${filter === 'breaks' ? 'active' : ''}`}
            onClick={() => setFilter('breaks')}
          >
            Breaks
          </button>
        </div>
      </div>

      {loading ? (
        <div className="sessions-loading">Loading logged sessions...</div>
      ) : filteredSessions.length === 0 ? (
        <div className="sessions-empty-state">
          No sessions yet today. Start your first focus session! 🎯
        </div>
      ) : (
        <div className="sessions-scroll-wrapper">
          <ul className="sessions-list">
            {filteredSessions.map((session) => (
              <li key={session._id} className={`session-item type-${session.type}`}>
                <div className="session-icon-wrap">
                  <span className="session-icon">{getSessionIcon(session.type)}</span>
                </div>
                <div className="session-main-info">
                  <div className="session-meta-row">
                    <span className="session-type-text">{getSessionTypeLabel(session.type)}</span>
                    <span className="session-duration-text">{session.duration} min</span>
                  </div>
                  {session.label && (
                    <div className="session-task-label" title={session.label}>
                      {session.label}
                    </div>
                  )}
                </div>
                <div className="session-actions-wrap">
                  <span className="session-time-text">{formatCompletedTime(session.completedAt)}</span>
                  <button
                    className="session-delete-btn"
                    onClick={() => onDelete(session._id)}
                    title="Delete record"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

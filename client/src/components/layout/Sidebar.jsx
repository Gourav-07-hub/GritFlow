/**
 * Sidebar.jsx — Minimal Icon Rail with hover expand and Daily Log popup submenu
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useFriends from '../../hooks/useFriends';
import useChat from '../../hooks/useChat';
import socket from '../../socket/socketClient.js';

const icons = {
  overview:   'LayoutDashboard',
  daily:      'ClipboardList',
  habits:     'CheckSquare',
  goals:      'Target',
  reflection: 'BookOpen',
  timer:      'Timer',
  gratitude:  'Heart',
  friends:    'Users',
  messages:   'MessageSquare',
  stats:      'BarChart3',
  achievements:'Trophy',
  settings:   'Settings',
};

function LucideIcon({ name, size = 20 }) {
  const ref = useRef(null);
  const [Icon, setIcon] = useState(null);
  useEffect(() => {
    import('lucide-react').then(mod => {
      setIcon(() => mod[name]);
    });
  }, [name]);
  if (!Icon) return <span style={{ width: size, height: size, display: 'inline-block' }} />;
  return <Icon size={size} />;
}

function Sidebar({ isOpen, toggleSidebar, isMobile }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pendingRequests, fetchPendingRequests } = useFriends();
  const { unreadCount } = useChat();

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTop, setPopupTop] = useState(0);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  const dailyRef = useRef(null);
  const popupRef = useRef(null);

  const showPopup = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => {
      if (dailyRef.current) {
        const rect = dailyRef.current.getBoundingClientRect();
        setPopupTop(rect.top);
      }
      setPopupVisible(true);
    }, 5);
  }, []);

  const hidePopup = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => {
      setPopupVisible(false);
    }, 200);
  }, []);

  useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPendingRequests();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchPendingRequests]);

  useEffect(() => {
    const handleSync = () => {
      fetchPendingRequests();
    };
    socket.on('friend_request_received', handleSync);
    socket.on('friend_request_accepted', handleSync);
    return () => {
      socket.off('friend_request_received', handleSync);
      socket.off('friend_request_accepted', handleSync);
    };
  }, [fetchPendingRequests]);

  const nav = [
    { key: 'overview',    name: 'Overview',      path: '/dashboard',         icon: icons.overview },
    { key: 'daily',       name: 'Daily Log',     path: '/dashboard/daily',   icon: icons.daily, hasPopup: true },
    { key: 'habits',      name: 'Habit Tracker', path: '/dashboard/habits',  icon: icons.habits },
    { key: 'goals',       name: 'Goals',         path: '/dashboard/goals',   icon: icons.goals },
    { key: 'reflection',  name: 'Reflection',    path: '/dashboard/reflection', icon: icons.reflection },
    { key: 'timer',       name: 'Focus Timer',   path: '/dashboard/focus',   icon: icons.timer },
    { key: 'gratitude',   name: 'Gratitude',     path: '/dashboard/gratitude', icon: icons.gratitude },
    { key: 'friends',     name: 'Friends',       path: '/dashboard/friends', icon: icons.friends },
    { key: 'messages',    name: 'Messages',      path: '/dashboard/chat',    icon: icons.messages },
    { key: 'stats',       name: 'Statistics',    path: '/dashboard/stats',   icon: icons.stats },
    { key: 'achievements',name: 'Achievements',  path: '/dashboard/achievements', icon: icons.achievements },
    { key: 'settings',    name: 'Settings',      path: '/dashboard/settings', icon: icons.settings },
  ];

  const dailyPopupItems = [
    { name: 'Habit Tracker', path: '/dashboard/habits',  icon: icons.habits },
    { name: 'Reflection',    path: '/dashboard/reflection', icon: icons.reflection },
    { name: 'Goals',         path: '/dashboard/goals',   icon: icons.goals },
  ];

  const renderBadge = (item) => {
    if (item.key === 'friends' && pendingRequests.length > 0) {
      return (
        <span key={`friends-${pendingRequests.length}`} className="sidebar-badge">
          {pendingRequests.length > 99 ? '99+' : pendingRequests.length}
        </span>
      );
    }
    if (item.key === 'messages' && unreadCount > 0) {
      return (
        <span key={`messages-${unreadCount}`} className="sidebar-badge sidebar-unread-messages-badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      );
    }
    return null;
  };

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div className="sidebar-mobile-overlay" onClick={toggleSidebar} />
        )}
        <aside className={`sidebar-mobile-drawer ${isOpen ? '' : 'closed'}`}
          style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
        >
          <div className="sidebar-mobile-header">
            <div className="gritflow-logo">✨ GritFlow</div>
            <button className="sidebar-mobile-close" onClick={toggleSidebar} aria-label="Close menu">✕</button>
          </div>
          <nav className="sidebar-mobile-nav">
            {nav.map(item => (
              <NavLink
                key={item.key}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) => `sidebar-mobile-item ${isActive ? 'active' : ''}`}
                onClick={toggleSidebar}
              >
                <span className="sidebar-nav-icon"><LucideIcon name={item.icon} /></span>
                <span className="sidebar-nav-label">{item.name}</span>
                {renderBadge(item)}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-mobile-footer">
            <button className="sidebar-mobile-logout" onClick={handleLogout}>
              <LucideIcon name="LogOut" size={20} />
              Logout
            </button>
          </div>
        </aside>
      </>
    );
  }

  return (
    <div className="sidebar-container">
      <aside className="sidebar-rail">
        <div className="sidebar-logo-area">
          <span className="sidebar-logo-icon">✨</span>
        </div>

        <nav className="sidebar-nav">
          {nav.map(item => {
            const inner = (
              <>
                <span className="sidebar-nav-icon"><LucideIcon name={item.icon} /></span>
                <span className="sidebar-nav-label expand-label">{item.name}</span>
                {renderBadge(item)}
              </>
            );

            return (
              <div key={item.key}
                ref={item.hasPopup ? dailyRef : null}
                onMouseEnter={item.hasPopup ? showPopup : undefined}
                onMouseLeave={item.hasPopup ? hidePopup : undefined}
              >
                <NavLink
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                >
                  {inner}
                </NavLink>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <span className="sidebar-nav-icon"><LucideIcon name="LogOut" size={20} /></span>
            <span className="expand-label">Logout</span>
          </button>
        </div>
      </aside>

      {popupVisible && (
        <div
          className="sidebar-hover-popup"
          style={{ top: `${popupTop}px` }}
          ref={popupRef}
          onMouseEnter={showPopup}
          onMouseLeave={hidePopup}
        >
          {dailyPopupItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-popup-item ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-nav-icon"><LucideIcon name={item.icon} size={18} /></span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default Sidebar;

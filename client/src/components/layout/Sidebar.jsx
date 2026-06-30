/**
 * Sidebar.jsx — Minimal Icon Rail with hover expand and Daily Log popup submenu
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useFriends from '../../hooks/useFriends';
import useChat from '../../hooks/useChat';
import socket from '../../socket/socketClient.js';

const icons = {
  overview:   'LayoutDashboard',
  daily:      'ClipboardList',
  timer:      'Timer',
  gratitude:  'Heart',
  friends:    'Users',
  messages:   'MessageCircle',
  achievements:'Trophy',
  settings:   'Settings',
};

function LucideIcon({ name, size = 20 }) {
  const [Icon, setIcon] = useState(null);
  useEffect(() => {
    import('lucide-react').then(mod => {
      setIcon(() => mod[name]);
    });
  }, [name]);
  if (!Icon) return <span style={{ width: size, height: size, display: 'inline-block' }} />;
  return <Icon size={size} />;
}

const dailyLogRoutes = [
  '/dashboard/daily',
  '/dashboard/habits',
  '/dashboard/reflection',
  '/dashboard/goals',
];

function Sidebar({ isOpen, toggleSidebar, isMobile }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingRequests, fetchPendingRequests } = useFriends();
  const { unreadCount } = useChat();

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTop, setPopupTop] = useState(0);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  const dailyRef = useRef(null);
  const popupRef = useRef(null);

  const isDailyActive = dailyLogRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  const showPopup = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => {
      if (dailyRef.current) {
        const rect = dailyRef.current.getBoundingClientRect();
        let top = rect.top;
        const popupHeight = 300;
        if (top + popupHeight > window.innerHeight) {
          top = window.innerHeight - popupHeight - 16;
        }
        setPopupTop(top);
      }
      setPopupVisible(true);
    }, 100);
  }, []);

  const hidePopup = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => {
      setPopupVisible(false);
    }, 150);
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
    { key: 'timer',       name: 'Focus Timer',   path: '/dashboard/focus',   icon: icons.timer },
    { key: 'gratitude',   name: 'Gratitude',     path: '/dashboard/gratitude', icon: icons.gratitude },
    { key: 'friends',     name: 'Friends',       path: '/dashboard/friends', icon: icons.friends },
    { key: 'messages',    name: 'Messages',      path: '/dashboard/chat',    icon: icons.messages },
    { key: 'achievements',name: 'Achievements',  path: '/dashboard/achievements', icon: icons.achievements },
    { key: 'settings',    name: 'Settings',      path: '/dashboard/settings', icon: icons.settings },
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

  const handleNavClick = () => {
    if (isMobile) toggleSidebar();
  };

  return (
    <>
      <aside className={`sidebar${isMobile && isOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-logo" onClick={() => { navigate('/dashboard'); if (isMobile) toggleSidebar(); }}>
          <div className="sidebar-logo-icon">
            <Zap size={18} color="white" fill="white" />
          </div>
          <span className="sidebar-logo-text">GritFlow</span>
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
                ref={item.hasPopup && !isMobile ? dailyRef : null}
                onMouseEnter={item.hasPopup && !isMobile ? showPopup : undefined}
                onMouseLeave={item.hasPopup && !isMobile ? hidePopup : undefined}
              >
                <NavLink
                  to={item.path}
                  end={item.path === '/dashboard'}
                  onClick={handleNavClick}
                  className={({ isActive }) => {
                    const active = item.hasPopup ? isActive || isDailyActive : isActive;
                    return `sidebar-nav-item ${active ? 'active' : ''}`;
                  }}
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

      {!isMobile && popupVisible && (
        <div
          className="dailylog-popup"
          style={{ top: `${popupTop}px` }}
          ref={popupRef}
          onMouseEnter={showPopup}
          onMouseLeave={hidePopup}
        >
          <div className="dailylog-popup-header">DAILY LOG</div>

          <NavLink to="/dashboard/daily" className={({ isActive }) => `dailylog-popup-item ${isActive ? 'active' : ''}`}>
            <span className="dailylog-popup-icon daily-checkin">📋</span>
            <div className="dailylog-popup-text">
              <span className="dailylog-popup-title">Daily Check-in</span>
              <span className="dailylog-popup-desc">Complete today's check-in</span>
            </div>
          </NavLink>

          <div className="dailylog-popup-divider" />

          <NavLink to="/dashboard/habits" className={({ isActive }) => `dailylog-popup-item ${isActive ? 'active' : ''}`}>
            <span className="dailylog-popup-icon habits">✅</span>
            <div className="dailylog-popup-text">
              <span className="dailylog-popup-title">Habit Tracker</span>
              <span className="dailylog-popup-desc">Track your daily habits</span>
            </div>
          </NavLink>

          <NavLink to="/dashboard/reflection" className={({ isActive }) => `dailylog-popup-item ${isActive ? 'active' : ''}`}>
            <span className="dailylog-popup-icon reflection">📓</span>
            <div className="dailylog-popup-text">
              <span className="dailylog-popup-title">Reflection</span>
              <span className="dailylog-popup-desc">Journal your thoughts</span>
            </div>
          </NavLink>

          <NavLink to="/dashboard/goals" className={({ isActive }) => `dailylog-popup-item ${isActive ? 'active' : ''}`}>
            <span className="dailylog-popup-icon goals">🎯</span>
            <div className="dailylog-popup-text">
              <span className="dailylog-popup-title">Goals</span>
              <span className="dailylog-popup-desc">Track your progress</span>
            </div>
          </NavLink>
        </div>
      )}
    </>
  );
}

export default Sidebar;

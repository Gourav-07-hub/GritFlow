/**
 * Sidebar.jsx — Collapsible left navigation sidebar
 */

import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';
import useFriends from '../../hooks/useFriends';
import useChat from '../../hooks/useChat';
import socket from '../../socket/socketClient.js';

/**
 * Sidebar component
 * @param {{ isOpen: boolean, toggleSidebar: () => void, isMobile: boolean }} props
 */
function Sidebar({ isOpen, toggleSidebar, isMobile }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pendingRequests, fetchPendingRequests } = useFriends();
  const { unreadCount } = useChat();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Poll pending requests every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPendingRequests();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchPendingRequests]);

  // Listen to socket events for real-time requests updates
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

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Daily Log', path: '/dashboard/daily', icon: '📝' },
    { name: 'Focus Timer', path: '/dashboard/focus', icon: '⏱️' },
    { name: 'Gratitude', path: '/dashboard/gratitude', icon: '🙏' },
    { name: 'Friends', path: '/dashboard/friends', icon: '👥' },
    { name: 'Messages', path: '/dashboard/chat', icon: '💬' },
    { name: 'Achievements', path: '/dashboard/achievements', icon: '🏆' },
    { name: 'Settings', path: '/dashboard/settings', icon: '⚙️' },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.header}>
        <div className="gritflow-logo">
          ✨ GritFlow
        </div>
        {isMobile && (
          <button
            className={styles.closeButton}
            onClick={toggleSidebar}
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            onClick={isMobile ? toggleSidebar : undefined}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="nav-name">{item.name}</span>
            {item.name === 'Friends' && pendingRequests.length > 0 && (
              <span key={`friends-${pendingRequests.length}`} className={`${styles.badge} sidebar-badge-animation`}>
                {pendingRequests.length > 99 ? '99+' : pendingRequests.length}
              </span>
            )}
            {item.name === 'Messages' && unreadCount > 0 && (
              <span key={`messages-${unreadCount}`} className={`${styles.badge} sidebar-unread-messages-badge sidebar-badge-animation`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

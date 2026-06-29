import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationBell from '../ui/NotificationBell';
import styles from './Navbar.module.css';
import { getUnreadMessageCount } from '../../services/chatService.js';

function Navbar({ toggleSidebar, sidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await getUnreadMessageCount();
        setUnreadCount(data.count);
      } catch (err) {
        console.error('Error in navbar unread count polling:', err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/dashboard/chat')) {
      return 'Messages';
    }
    if (pathname.startsWith('/dashboard/daily')) {
      return 'Daily Entry';
    }
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/dashboard/focus':
        return 'Focus Timer';
      case '/dashboard/gratitude':
        return 'Gratitude';
      case '/dashboard/achievements':
        return 'Achievements';
      case '/dashboard/settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <button
          className={styles.menuButton}
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          ☰
        </button>
        <h1 className={styles.pageTitle}>{getPageTitle(location.pathname)}</h1>
      </div>

      <div className={styles.right}>
        <button
          className={styles.iconBtn}
          onClick={() => navigate('/dashboard/chat')}
          title="Messages"
          aria-label="Messages"
          type="button"
        >
          💬
          {unreadCount > 0 && (
            <span className="navbar-chat-badge">{unreadCount}</span>
          )}
        </button>
        <NotificationBell />
        <ThemeToggle />
        
        {/* ===== PROFILE BUTTON ===== */}
        <div
          ref={profileRef}
          style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
        >
          <button
            onClick={() => setProfileOpen(prev => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px 4px 4px',
              borderRadius: '999px',
              border: '1px solid rgba(99,102,241,0.3)',
              background: '#1a1f2e',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.border = '1px solid rgba(99,102,241,0.8)'
              e.currentTarget.style.boxShadow = '0 0 12px rgba(99,102,241,0.25)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = '1px solid rgba(99,102,241,0.3)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '28px',
              height: '28px',
              minWidth: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              fontSize: '0.72rem',
              fontWeight: '800',
              color: 'white',
              letterSpacing: '0.3px',
              boxShadow: '0 2px 8px rgba(99,102,241,0.5)'
            }}>
              {user?.avatar && user.avatar.startsWith('http') ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <span>
                  {user?.name
                    ? user.name.trim().split(' ').length > 1
                      ? user.name.trim().split(' ')[0][0].toUpperCase() +
                        user.name.trim().split(' ').slice(-1)[0][0].toUpperCase()
                      : user.name.trim()[0].toUpperCase()
                    : 'U'
                  }
                </span>
              )}
            </div>

            {/* First name */}
            <span style={{
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#f0f4ff',
              whiteSpace: 'nowrap',
              maxWidth: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1
            }}>
              {user?.name?.trim().split(' ')[0] || 'User'}
            </span>

            {/* Chevron */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8892a4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: 'transform 0.2s ease',
                transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                flexShrink: 0
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* ===== PROFILE DROPDOWN ===== */}
          {profileOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: '0',
              minWidth: '220px',
              background: '#111827',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '16px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              zIndex: 999999,
              overflow: 'hidden',
              padding: '6px'
            }}>

              {/* User info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                marginBottom: '6px'
              }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  minWidth: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  color: 'white',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.4)'
                }}>
                  {user?.avatar && user.avatar.startsWith('http') ? (
                    <img src={user.avatar} alt="avatar"
                      style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  ) : (
                    <span>
                      {user?.name
                        ? user.name.trim().split(' ').length > 1
                          ? user.name.trim().split(' ')[0][0].toUpperCase() +
                            user.name.trim().split(' ').slice(-1)[0][0].toUpperCase()
                          : user.name.trim()[0].toUpperCase()
                        : 'U'
                      }
                    </span>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: '#f0f4ff',
                    whiteSpace: 'nowrap'
                  }}>
                    {user?.name}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '0.73rem',
                    color: '#4a5568',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '155px'
                  }}>
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* My Profile */}
              <button
                onClick={() => {
                  navigate('/dashboard/settings')
                  setProfileOpen(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#8892a4',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#1a2235'
                  e.currentTarget.style.color = '#f0f4ff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#8892a4'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(99,102,241,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <span>My Profile</span>
              </button>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;

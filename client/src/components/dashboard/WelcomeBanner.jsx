import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Premium Welcome Banner with animated cosmic background gradient, motivational quotes, and quick-action pill buttons.
 */
export default function WelcomeBanner({ user }) {
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const quotes = [
    "The only way to do great work is to love what you do. — Steve Jobs",
    "Believe you can and you're halfway there. — Theodore Roosevelt",
    "Make each day your masterpiece. — John Wooden",
    "Productivity is being able to do things that you were never able to do before. — Franz Kafka",
    "Focus on being productive instead of busy. — Tim Ferriss"
  ];
  const quote = quotes[new Date().getDate() % quotes.length];

  const actions = [
    { label: 'Start Focus', icon: '⏱️', path: '/dashboard/focus', class: 'btn-focus' },
    { label: 'Track Habit', icon: '✅', path: '/dashboard/habits', class: 'btn-habit' },
    { label: 'New Goal', icon: '🎯', path: '/dashboard/goals', class: 'btn-goal' },
    { label: 'Reflect', icon: '📓', path: '/dashboard/reflection', class: 'btn-reflect' },
  ];

  return (
    <div className="welcome-banner-card fade-in-up">
      <div className="welcome-banner-stars" />
      <div className="welcome-banner-main">
        <div className="welcome-banner-header">
          <div>
            <h2 className="welcome-banner-title">
              <span className="welcome-banner-greeting">{getGreeting()}</span>,{' '}
              <span className="welcome-banner-name">{user?.name || 'User'}</span>!
            </h2>
            <p className="welcome-banner-subheading" style={{ margin: '6px 0 0 0', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Here is your GritFlow overview for today
            </p>
          </div>
          <div className="welcome-banner-date">
            <span className="calendar-icon">📅</span> {getFormattedDate()}
          </div>
        </div>
        
        <div className="welcome-banner-quote">
          <p>{quote}</p>
        </div>

        <div className="welcome-banner-actions">
          {actions.map((act) => (
            <button
              key={act.label}
              className={`welcome-action-pill ${act.class}`}
              onClick={() => navigate(act.path)}
              type="button"
            >
              <span className="action-pill-icon">{act.icon}</span> {act.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

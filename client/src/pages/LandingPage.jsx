import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/landing.css';

function useScrollAnimation() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function AnimatedSection({ children, className = '', style = {} }) {
  const ref = useScrollAnimation();
  return (
    <div ref={ref} className={`animate-on-scroll ${className}`} style={style}>
      {children}
    </div>
  );
}

function StatValue({ target, suffix = '' }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 1200;
          const steps = 30;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="landing-stat-value">
      {count}{suffix}
    </span>
  );
}

const features = [
  {
    icon: '✅', title: 'Habit Tracker',
    desc: 'Build powerful daily habits with streak tracking and completion analytics',
    accent: '#3b82f6',
  },
  {
    icon: '🎯', title: 'Goal Setting',
    desc: 'Set ambitious goals, break them into milestones and track your progress visually',
    accent: '#8b5cf6',
  },
  {
    icon: '⏱️', title: 'Focus Timer',
    desc: 'Pomodoro-powered focus sessions that log your productivity automatically',
    accent: '#f97316',
  },
  {
    icon: '📓', title: 'Daily Reflection',
    desc: 'Journal your thoughts, track your mood and build self awareness',
    accent: '#14b8a6',
  },
  {
    icon: '🙏', title: 'Gratitude Journal',
    desc: 'Practice daily gratitude and shift your mindset with streak motivation',
    accent: '#ec4899',
  },
  {
    icon: '👥', title: 'Friends & Chat',
    desc: 'Connect with friends, compare streaks and chat in real time',
    accent: '#22c55e',
  },
];

const achievements = [
  { icon: '🏃', label: 'First Step' },
  { icon: '🔥', label: 'Week Warrior' },
  { icon: '🎯', label: 'Goal Crusher' },
  { icon: '📓', label: 'Self Aware' },
  { icon: '🏆', label: 'Life Dashboard Pro' },
  { icon: '💎', label: 'Gratitude Collector' },
];

const socialItems = [
  'Track every habit effortlessly',
  'Set goals that actually get done',
  'Reflect and grow every single day',
  'Stay accountable with friends',
  'Celebrate every achievement',
  'See your progress in real time',
];

function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (user) return null;

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing">

      {/* ─── Navbar ─── */}
      <nav className="landing-nav">
        <span className="landing-nav-logo">⚡ GritFlow</span>
        <div className="landing-nav-right">
          <Link to="/login" className="landing-btn-ghost">Sign In</Link>
          <Link to="/register" className="landing-btn-filled">Get Started</Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="landing-hero">
        <div className="landing-hero-bg" />
        <div className="landing-hero-grid" />
        <div className="landing-hero-content">
          <span className="landing-badge">⚡ Your Self Improvement OS</span>
          <h1>
            Level Up<br />
            <span className="gradient-text">Your Life.</span>
          </h1>
          <p className="landing-hero-sub">
            Track habits. Crush goals. Reflect daily.<br />
            Compete with friends. Become unstoppable.
          </p>
          <div className="landing-hero-buttons">
            <Link to="/register" className="landing-hero-btn-primary">
              Start for Free →
            </Link>
            <button onClick={scrollToFeatures} className="landing-hero-btn-secondary">
              See How It Works
            </button>
          </div>
        </div>
        <div className="landing-scroll-indicator">⌄</div>
      </section>

      {/* ─── Stats ─── */}
      <section className="landing-stats">
        <div className="landing-stats-inner">
          <div className="landing-stat">
            <StatValue target={5} suffix="+" />
            <div className="landing-stat-label">Core Features</div>
          </div>
          <div className="landing-stat">
            <StatValue target={23} />
            <div className="landing-stat-label">Achievements to Unlock</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-value">Real-time</div>
            <div className="landing-stat-label">Friend Chat</div>
          </div>
          <div className="landing-stat">
            <StatValue target={100} suffix="%" />
            <div className="landing-stat-label">Free to Use</div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="landing-features">
        <AnimatedSection>
          <div className="landing-features-label">EVERYTHING YOU NEED</div>
        </AnimatedSection>
        <AnimatedSection>
          <h2>One app.<br />Endless growth.</h2>
        </AnimatedSection>
        <div className="landing-features-grid">
          {features.map((f, i) => (
            <AnimatedSection key={f.title} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="landing-feature-card" style={{ borderTopColor: f.accent }}>
                <span className="landing-feature-card-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ─── Social Proof ─── */}
      <section className="landing-social">
        <div className="landing-social-inner">
          <AnimatedSection className="landing-social-left">
            <h2>
              Built for people who<br />
              refuse to stay the same.
            </h2>
          </AnimatedSection>
          <AnimatedSection className="landing-social-right" style={{ transitionDelay: '0.2s' }}>
            {socialItems.map((item) => (
              <div key={item} className="landing-social-item">
                <span className="landing-social-check">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Achievements ─── */}
      <section className="landing-achievements">
        <AnimatedSection>
          <div className="landing-achievements-label">ACHIEVEMENTS SYSTEM</div>
        </AnimatedSection>
        <AnimatedSection>
          <h2>Unlock rewards as you grow.</h2>
        </AnimatedSection>
        <AnimatedSection>
          <p className="landing-achievements-sub">23 achievements waiting to be unlocked</p>
        </AnimatedSection>
        <div className="landing-achievements-row">
          {achievements.map((a, i) => (
            <AnimatedSection key={a.label} style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="landing-ach-badge">
                <div className="landing-ach-icon">{a.icon}</div>
                <span className="landing-ach-label">{a.label}</span>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="landing-cta">
        <div className="landing-cta-bg" />
        <div className="landing-cta-content">
          <AnimatedSection>
            <h2>Ready to level up?</h2>
          </AnimatedSection>
          <AnimatedSection style={{ transitionDelay: '0.15s' }}>
            <p>Join GritFlow and start building the life you want.</p>
          </AnimatedSection>
          <AnimatedSection style={{ transitionDelay: '0.3s' }}>
            <Link to="/register" className="landing-cta-btn">
              Get Started Free →
            </Link>
            <p className="landing-cta-footnote">Free forever • No credit card required</p>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-left">
            <div className="landing-footer-brand">⚡ GritFlow</div>
            <p>Level up your life, one day at a time.</p>
          </div>
          <div className="landing-footer-right">
            <Link to="/login" className="landing-footer-link">Sign In</Link>
            <Link to="/register" className="landing-footer-link">Get Started</Link>
          </div>
        </div>
        <div className="landing-footer-bottom">
          © 2026 GritFlow. Built with ❤️
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
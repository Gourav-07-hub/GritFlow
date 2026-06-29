import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/axiosConfig';
import { getActivityHeatmap } from '../services/statsService';
import ActivityHeatmap from '../components/stats/ActivityHeatmap';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import QuickStats from '../components/dashboard/QuickStats';
import TodayHabits from '../components/dashboard/TodayHabits';
import UpcomingGoals from '../components/dashboard/UpcomingGoals';
import styles from './DashboardPage.module.css';

function isToday(date) {
  const d = new Date(date);
  const now = new Date();
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate();
}

function isTodayCompleted(habit) {
  if (!habit.completedDates || habit.completedDates.length === 0) return false;
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return habit.completedDates.some((d) => {
    const date = new Date(d);
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    return dateStart === todayStart;
  });
}

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [heatmapLoading, setHeatmapLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard | GritFlow';
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [overviewRes, habitsRes, goalsRes, reflRes] = await Promise.all([
          api.get('/stats/overview'),
          api.get('/habits'),
          api.get('/goals'),
          api.get('/reflections'),
        ]);
        setOverview(overviewRes.data);
        setHabits(habitsRes.data);
        setGoals(goalsRes.data);
        setReflections(reflRes.data);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      }
    };

    const fetchHeatmap = async () => {
      try {
        const data = await getActivityHeatmap();
        setHeatmap(data || []);
      } catch (err) {
        console.error('Heatmap fetch error:', err);
      } finally {
        setHeatmapLoading(false);
      }
    };

    fetchAll();
    fetchHeatmap();
  }, []);

  const todayReflection = reflections?.[0] && isToday(reflections[0].date) ? reflections[0] : null;
  const todayHabitsDone = habits.filter((h) => isTodayCompleted(h)).length;
  const checkInDone = !!todayReflection;
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  return (
    <div className={styles.container}>
      <WelcomeBanner user={user} />
      <QuickStats overview={overview} />

      <div className={styles.heatmapSection}>
        <ActivityHeatmap heatmap={heatmap} loading={heatmapLoading} />
      </div>

      <div style={{
        background: checkInDone
          ? 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.05))'
          : 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))',
        borderRadius: '16px', border: checkInDone
          ? '1px solid rgba(34,197,94,0.25)'
          : '1px solid rgba(99,102,241,0.2)',
        padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '1rem',
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f0f4ff' }}>
            {checkInDone ? 'Daily check-in complete! 🎉' : 'Complete your daily check-in ✅'}
          </h3>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#8892a4' }}>
            {checkInDone
              ? `Mood: ${todayReflection.moodLabel || todayReflection.mood + '/5'} · Habits: ${todayHabitsDone} done`
              : 'Takes only 2 minutes'
            }
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/daily')}
          style={{
            padding: '10px 24px', borderRadius: '10px', border: 'none', whiteSpace: 'nowrap',
            background: checkInDone
              ? 'rgba(34,197,94,0.2)'
              : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: checkInDone ? '#4ade80' : '#fff',
            fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {checkInDone ? 'View Details' : 'Start Check-in'}
        </button>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <span className={styles.summaryCardTitle}>Today&apos;s Habits</span>
            <button className={styles.summaryCardAction} onClick={() => navigate('/dashboard/daily')}>
              Log
            </button>
          </div>
          <TodayHabits habits={habits} />
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <span className={styles.summaryCardTitle}>Active Goals</span>
            <button className={styles.summaryCardAction} onClick={() => navigate('/dashboard/daily')}>
              Update
            </button>
          </div>
          <UpcomingGoals goals={goals} />
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <span className={styles.summaryCardTitle}>Latest Reflection</span>
            <button className={styles.summaryCardAction} onClick={() => navigate('/dashboard/daily')}>
              Journal
            </button>
          </div>
          {todayReflection ? (
            <div style={{ color: '#8892a4', fontSize: '0.875rem', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span>Mood: {todayReflection.mood}/5</span>
                <span style={{ color: '#4a5568' }}>|</span>
                <span style={{ color: '#4a5568', fontSize: '0.8rem' }}>
                  {new Date(todayReflection.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ margin: 0 }}>
                {(todayReflection.learned || todayReflection.content || '').length > 120
                  ? (todayReflection.learned || todayReflection.content || '').slice(0, 120) + '...'
                  : (todayReflection.learned || todayReflection.content || '')}
              </p>
            </div>
          ) : (
            <p style={{ color: '#4a5568', fontSize: '0.875rem' }}>
              No reflection logged today. Take a moment to reflect.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

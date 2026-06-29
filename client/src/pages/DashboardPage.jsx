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

  const todayReflection = reflections?.[0];
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
                {todayReflection.content?.length > 120
                  ? todayReflection.content.slice(0, 120) + '...'
                  : todayReflection.content}
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

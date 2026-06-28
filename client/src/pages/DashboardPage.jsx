import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/axiosConfig';
import TodayHabits from '../components/dashboard/TodayHabits';
import TodayFocus from '../components/dashboard/TodayFocus';
import UpcomingGoals from '../components/dashboard/UpcomingGoals';
import RecentReflection from '../components/dashboard/RecentReflection';
import SocialSummary from '../components/dashboard/SocialSummary';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import QuickStats from '../components/dashboard/QuickStats';
import StreakSummary from '../components/dashboard/StreakSummary';
import styles from './DashboardPage.module.css';

function DashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [focusStats, setFocusStats] = useState(null);
  useEffect(() => {
    document.title = 'Overview | GritFlow';
  }, []);
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [overviewRes, habitsRes, goalsRes, reflRes, focusRes] = await Promise.all([
          api.get('/stats/overview'),
          api.get('/habits'),
          api.get('/goals'),
          api.get('/reflections'),
          api.get('/focus/stats'),
        ]);
        setOverview(overviewRes.data);
        setHabits(habitsRes.data);
        setGoals(goalsRes.data);
        setReflections(reflRes.data);
        setFocusStats(focusRes.data);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className={styles.container}>
      <WelcomeBanner user={user} />
      <QuickStats overview={overview} />

      <div className={styles.widgetGrid}>
        <TodayHabits habits={habits} />
        <TodayFocus focusStats={focusStats} />
        <UpcomingGoals goals={goals} />
        <RecentReflection reflections={reflections} />
        <StreakSummary overview={overview} habits={habits} />
        <SocialSummary />
      </div>
    </div>
  );
}

export default DashboardPage;

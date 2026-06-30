import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PageLoader from './components/ui/PageLoader';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DailyEntryPage = lazy(() => import('./pages/DailyEntryPage'));
const HabitsPage = lazy(() => import('./pages/HabitsPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const ReflectionPage = lazy(() => import('./pages/ReflectionPage'));
const FocusPage = lazy(() => import('./pages/FocusPage'));
const GratitudePage = lazy(() => import('./pages/GratitudePage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AchievementsPage = lazy(() => import('./components/achievements/AchievementsPage'));
const FriendsPage = lazy(() => import('./pages/FriendsPage'));
const FriendProfilePage = lazy(() => import('./pages/FriendProfilePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));

import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import useAchievements from './hooks/useAchievements';
import AchievementToast from './components/ui/AchievementToast';

function AppContent() {
  const { newlyUnlocked, clearNewlyUnlocked, triggerCheck } = useAchievements();

  // Listen to custom check-achievements events triggered after API actions
  useEffect(() => {
    const handleCheck = () => {
      triggerCheck();
    };
    window.addEventListener('check-achievements', handleCheck);
    return () => {
      window.removeEventListener('check-achievements', handleCheck);
    };
  }, [triggerCheck]);

  return (
    <>
      {/* Global Achievement Toast Notifications */}
      <AchievementToast
        achievements={newlyUnlocked}
        onDismiss={clearNewlyUnlocked}
      />

      <Router>
        <Suspense fallback={<PageLoader message="Loading page..." />}>
          <Routes>
            {/* Landing page at root */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/daily" element={<DailyEntryPage />} />
                <Route path="/dashboard/habits" element={<HabitsPage />} />
                <Route path="/dashboard/goals" element={<GoalsPage />} />
                <Route path="/dashboard/reflection" element={<ReflectionPage />} />
                <Route path="/dashboard/focus" element={<FocusPage />} />
                <Route path="/dashboard/gratitude" element={<GratitudePage />} />
                <Route path="/dashboard/stats" element={<StatsPage />} />
                <Route path="/dashboard/achievements" element={<AchievementsPage />} />
                <Route path="/dashboard/settings" element={<SettingsPage />} />
                <Route path="/dashboard/friends" element={<FriendsPage />} />
                <Route path="/dashboard/friends/:userId" element={<FriendProfilePage />} />
                <Route path="/dashboard/chat" element={<ErrorBoundary><ChatPage /></ErrorBoundary>} />
                <Route path="/dashboard/chat/:userId" element={<ErrorBoundary><ChatPage /></ErrorBoundary>} />
              </Route>
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

function App() {
  return <AppContent />;
}

export default App;

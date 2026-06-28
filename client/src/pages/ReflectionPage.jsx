/**
 * ReflectionPage.jsx — Daily Reflection Journal dashboard
 */

import { useState, useEffect } from 'react';
import useReflections from '../hooks/useReflections';
import ReflectionCalendar from '../components/reflection/ReflectionCalendar';
import ReflectionCard from '../components/reflection/ReflectionCard';
import ReflectionForm from '../components/reflection/ReflectionForm';
import styles from './ReflectionPage.module.css';

function ReflectionPage() {
  useEffect(() => {
    document.title = 'Reflection | GritFlow';
  }, []);
  const {
    reflections,
    stats,
    loading,
    error,
    selectedDate,
    fetchReflections,
    addReflection,
    editReflection,
    removeReflection,
    setSelectedDate,
  } = useReflections();

  const [showForm, setShowForm] = useState(false);
  const [editingReflection, setEditingReflection] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const handleMonthChange = (newMonth) => {
    setCurrentMonth(newMonth);
    const monthStr = newMonth.toISOString().slice(0, 7); // YYYY-MM
    fetchReflections(monthStr);
  };

  const handleDayClick = (reflection, date) => {
    setSelectedDate(date);
    if (reflection) {
      setEditingReflection(reflection);
    } else {
      setEditingReflection(null);
    }
    setShowForm(true);
  };

  const handleAddTodayClick = () => {
    setEditingReflection(null);
    setSelectedDate(new Date());
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingReflection(null);
  };

  const handleFormSubmit = async (formData) => {
    if (editingReflection) {
      await editReflection(editingReflection._id, formData);
    } else {
      await addReflection(formData);
    }
    setShowForm(false);
    setEditingReflection(null);
    
    // Refresh reflections list for the currently viewed calendar month
    const monthStr = currentMonth.toISOString().slice(0, 7);
    fetchReflections(monthStr);
  };

  const handleDeleteReflection = async (id) => {
    await removeReflection(id);
    // Refresh reflections list for the currently viewed calendar month
    const monthStr = currentMonth.toISOString().slice(0, 7);
    fetchReflections(monthStr);
  };

  // Compute stat values safely
  const totalEntries = stats?.totalEntries || 0;
  const averageMood = stats?.averageMood !== undefined ? stats.averageMood : 0;
  const currentStreak = stats?.currentStreak || 0;
  const longestStreak = stats?.longestStreak || 0;

  return (
    <div className={styles.container}>
      <header className={styles.headerArea}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>Reflection Journal</h2>
          <p className={styles.subheading}>Track your growth, one day at a time</p>
        </div>
        <button className={styles.addBtn} onClick={handleAddTodayClick}>
          <span>✍️</span> Log Today's Reflection
        </button>
      </header>

      {/* Statistics Summary Bar */}
      <section className={styles.statsBar} aria-label="Journal Statistics Summary">
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total Entries</span>
          <span className={styles.statValue}>{totalEntries}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Average Mood</span>
          <span className={styles.statValue}>{averageMood} / 5</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Current Streak</span>
          <span className={styles.statValue}>🔥 {currentStreak} days</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Longest Streak</span>
          <span className={styles.statValue}>🏆 {longestStreak} days</span>
        </div>
      </section>

      {/* View Mode controls row */}
      <div className={styles.viewControlsRow}>
        <div className={styles.toggleGroup} role="tablist" aria-label="View selection">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'calendar'}
            className={`${styles.toggleBtn} ${
              viewMode === 'calendar' ? styles.toggleBtnActive : ''
            }`}
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'list'}
            className={`${styles.toggleBtn} ${
              viewMode === 'list' ? styles.toggleBtnActive : ''
            }`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
        </div>
      </div>

      {/* Page Content depending on View Mode */}
      {loading && reflections.length === 0 ? (
        <div>Loading journal entries...</div>
      ) : error ? (
        <div className={styles.errorState} role="alert">
          <p>⚠️ Error: {error}</p>
        </div>
      ) : viewMode === 'calendar' ? (
        <ReflectionCalendar
          reflections={reflections}
          onDayClick={handleDayClick}
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
        />
      ) : reflections.length === 0 ? (
        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>No journal entries yet</h3>
          <p>Toggle to Calendar View or click add above to start reflecting 📝</p>
        </div>
      ) : (
        <div className={styles.listContainer}>
          {reflections.map((reflection) => (
            <ReflectionCard
              key={reflection._id}
              reflection={reflection}
              onEdit={handleDayClick}
              onDelete={handleDeleteReflection}
            />
          ))}
        </div>
      )}

      {/* Reflection modal form */}
      {showForm && (
        <ReflectionForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingReflection}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}

export default ReflectionPage;

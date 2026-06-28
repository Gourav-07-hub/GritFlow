/**
 * GratitudePage.jsx — Main Gratitude Journal user dashboard page
 */

import React, { useState, useEffect } from 'react';
import useGratitude from '../hooks/useGratitude';
import GratitudeStreak from '../components/gratitude/GratitudeStreak';
import GratitudeStats from '../components/gratitude/GratitudeStats';
import GratitudeCard from '../components/gratitude/GratitudeCard';
import GratitudeForm from '../components/gratitude/GratitudeForm';

export default function GratitudePage() {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    document.title = 'Gratitude | GritFlow';
  }, []);
  const [editingEntry, setEditingEntry] = useState(null);

  const {
    entries,
    stats,
    loading,
    error,
    filterFavorite,
    selectedMonth,
    addEntry,
    editEntry,
    removeEntry,
    toggleFavorite,
    setFilterFavorite,
    setSelectedMonth,
  } = useGratitude();

  // Determine if today's entry already exists in the logs
  const todayYYYYMMDD = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(
    (entry) => entry.date.split('T')[0] === todayYYYYMMDD
  );

  // Form submission handler
  const handleFormSubmit = async (formData) => {
    try {
      if (editingEntry) {
        await editEntry(editingEntry._id, formData);
      } else {
        await addEntry(formData);
      }
      setShowForm(false);
      setEditingEntry(null);
    } catch (err) {
      console.error('Error submitting gratitude form:', err);
      throw err; // propagates error to display on form
    }
  };

  const handleEditClick = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleAddTodayClick = () => {
    if (todayEntry) {
      setEditingEntry(todayEntry);
    } else {
      setEditingEntry(null);
    }
    setShowForm(true);
  };

  return (
    <div className="gratitude-page-container">
      {/* Header title */}
      <div className="gratitude-header-row">
        <div>
          <h1 className="gratitude-page-title">Gratitude Journal</h1>
          <p className="gratitude-page-subtitle">Count your blessings, shift your mindset</p>
        </div>
      </div>

      {/* API Errors Banner */}
      {error && (
        <div className="page-error-banner">
          ⚠️ {typeof error === 'string' ? error : 'Failed to connect to the Gratitude Journal service.'}
        </div>
      )}

      {/* Top dashboard summary section: Streak & Stats */}
      <div className="gratitude-dashboard-top">
        <GratitudeStreak
          currentStreak={stats?.currentStreak || 0}
          longestStreak={stats?.longestStreak || 0}
          recentDates={entries}
        />
        <GratitudeStats stats={stats} loading={loading && !stats} />
      </div>

      {/* Filters and Actions Toolbar */}
      <div className="gratitude-toolbar-card">
        <div className="toolbar-left">
          {/* Favorite filter toggle */}
          <div className="favorite-filter-group">
            <button
              className={`filter-btn-flat ${!filterFavorite ? 'active' : ''}`}
              onClick={() => setFilterFavorite(false)}
            >
              All Entries
            </button>
            <button
              className={`filter-btn-flat ${filterFavorite ? 'active' : ''}`}
              onClick={() => setFilterFavorite(true)}
            >
              ⭐ Favorites Only
            </button>
          </div>

          {/* Month Navigator */}
          <div className="month-picker-wrapper">
            <label htmlFor="toolbar-month" className="month-picker-label">
              Month:
            </label>
            <input
              id="toolbar-month"
              type="month"
              className="number-input month-input-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>

        {/* Add/Edit today action */}
        <button className="btn-primary-gradient add-today-btn" onClick={handleAddTodayClick}>
          {todayEntry ? '✏️ Edit Today\'s Gratitude' : '💖 Add Today\'s Gratitude'}
        </button>
      </div>

      {/* Entries List Area */}
      <div className="gratitude-entries-section">
        {loading ? (
          <div className="entries-loading-box">Loading gratitude entries...</div>
        ) : entries.length === 0 ? (
          <div className="entries-empty-box">
            <span className="empty-emoji">📝</span>
            <h3>No entries found</h3>
            <p>
              {filterFavorite
                ? "You haven't favorited any gratitude items in this month yet."
                : "No gratitude entries logged for this month. Start writing down the good things! ✨"}
            </p>
          </div>
        ) : (
          <div className="gratitude-cards-list">
            {entries.map((entry) => (
              <GratitudeCard
                key={entry._id}
                entry={entry}
                onEdit={handleEditClick}
                onDelete={removeEntry}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {/* Logging form Modal */}
      {showForm && (
        <GratitudeForm
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingEntry(null);
          }}
          initialData={editingEntry}
          selectedDate={!editingEntry ? todayYYYYMMDD : undefined}
        />
      )}
    </div>
  );
}

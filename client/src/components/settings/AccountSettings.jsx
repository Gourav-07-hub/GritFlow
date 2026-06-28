import React, { useState } from 'react';

export default function AccountSettings({ onDelete, loading, error }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    try {
      await onDelete(password);
      // On success, hook will log out and redirect automatically
    } catch (err) {
      // Error is stored in hook and passed as prop
    }
  };

  const openModal = () => {
    setPassword('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPassword('');
  };

  return (
    <div className="settings-section-card account-danger-zone">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Account Administration</h2>
        <p className="settings-section-subtitle">Manage high-security settings and account deletion operations.</p>
      </div>

      <div className="danger-zone-banner">
        <span className="danger-zone-icon">⚠️</span>
        <div className="danger-zone-text">
          <strong>Danger Zone</strong> — These actions are irreversible!
        </div>
      </div>

      <div className="danger-zone-action-box">
        <div className="danger-action-info">
          <h4 className="danger-action-title">Delete Account</h4>
          <p className="danger-action-description">
            Permanently delete your account and all your data. This action cannot be undone.
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="settings-btn settings-btn-danger"
        >
          Delete My Account
        </button>
      </div>

      {isModalOpen && (
        <div className="settings-modal-backdrop" onClick={closeModal}>
          <div
            className="settings-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="settings-modal-header">
              <h3 className="settings-modal-title">Are you sure?</h3>
              <button type="button" className="settings-modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>
            
            <form onSubmit={handleDeleteSubmit} className="settings-form">
              <div className="settings-modal-body">
                <p className="settings-modal-warning-text">
                  This will permanently delete all your habits, goals, reflections, focus sessions, and gratitude entries. This cannot be undone.
                </p>
                
                <div className="settings-form-group">
                  <label htmlFor="confirmDeletePassword" className="settings-label">
                    Enter your password to confirm
                  </label>
                  <input
                    type="password"
                    id="confirmDeletePassword"
                    className="settings-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <div className="settings-alert settings-alert-error" role="alert">
                    {error}
                  </div>
                )}
              </div>

              <div className="settings-modal-footer">
                <button
                  type="button"
                  className="settings-btn settings-btn-secondary"
                  onClick={closeModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="settings-btn settings-btn-danger"
                  disabled={loading || !password}
                >
                  {loading ? 'Deleting Forever...' : 'Delete Forever'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

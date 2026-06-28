import React, { useState } from 'react';

export default function PasswordSettings({ onSave, loading, error, success }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  // States to toggle password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // Client-side validations
    if (!currentPassword) {
      setLocalError('Current password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setLocalError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Confirm password must match new password.');
      return;
    }

    try {
      await onSave({ currentPassword, newPassword });
      // Reset inputs on successful save
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      // API error handled by parent props
    }
  };

  const displayError = localError || error;

  return (
    <div className="settings-section-card">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Change Password</h2>
        <p className="settings-section-subtitle">Update your password to keep your account secure.</p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-form-group">
          <label htmlFor="currentPassword" className="settings-label">Current Password</label>
          <div className="password-input-wrapper">
            <input
              type={showCurrent ? 'text' : 'password'}
              id="currentPassword"
              className="settings-input"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowCurrent(!showCurrent)}
              tabIndex="-1"
            >
              {showCurrent ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className="settings-form-group">
          <label htmlFor="newPassword" className="settings-label">New Password</label>
          <div className="password-input-wrapper">
            <input
              type={showNew ? 'text' : 'password'}
              id="newPassword"
              className="settings-input"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowNew(!showNew)}
              tabIndex="-1"
            >
              {showNew ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className="settings-form-group">
          <label htmlFor="confirmPassword" className="settings-label">Confirm Password</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirm ? 'text' : 'password'}
              id="confirmPassword"
              className="settings-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex="-1"
            >
              {showConfirm ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {displayError && (
          <div className="settings-alert settings-alert-error" role="alert">
            {displayError}
          </div>
        )}

        {success && (
          <div className="settings-alert settings-alert-success" role="alert">
            {success}
          </div>
        )}

        <div className="settings-actions">
          <button
            type="submit"
            className="settings-btn settings-btn-primary"
            disabled={loading}
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

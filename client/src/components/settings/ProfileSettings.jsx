import React, { useState, useEffect, useRef } from 'react';
import useToast from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/axiosConfig';

export default function ProfileSettings({ profile, onSave, loading, error, success }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  const { showSuccess, showError } = useToast();
  const { setUser } = useAuth();

  // Pre-fill profile data on load or when profile changes
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setAvatar(profile.avatar || '');
    }
  }, [profile]);

  const getInitials = (userName) => {
    if (!userName) return '?';
    const parts = userName.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      showError('Image size must be under 10MB');
      return;
    }

    // Validate allowed formats
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showError('Only jpg, jpeg, png and webp images are allowed');
      return;
    }

    // 1. Instantly show local preview
    const previewUrl = URL.createObjectURL(file);
    setAvatar(previewUrl);

    // 2. Prepare FormData
    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    setUploadProgress(0);

    try {
      // 3. POST upload request with progress tracking
      // NOTE: Do NOT set Content-Type manually — axios must set it
      // automatically with the correct boundary for multipart/form-data
      const response = await api.post('/settings/avatar', formData, {
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || file.size;
          const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
          setUploadProgress(percentCompleted);
        },
      });

      const newAvatarUrl = response.data.avatar;
      setAvatar(newAvatarUrl);

      // Update LocalStorage user details
      const localUser = localStorage.getItem('user');
      if (localUser) {
        const parsed = JSON.parse(localUser);
        localStorage.setItem(
          'user',
          JSON.stringify({ ...parsed, avatar: newAvatarUrl })
        );
      }

      // Update AuthContext to sync instantly across all page views
      if (setUser) {
        setUser((prev) => prev ? { ...prev, avatar: newAvatarUrl } : null);
      }

      showSuccess('Profile picture updated! ✅');
    } catch (err) {
      // Revert preview on failure
      if (profile) {
        setAvatar(profile.avatar || '');
      }
      showError(err.response?.data?.message || err.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSave({ name, email, avatar });
  };

  return (
    <div className="settings-section-card">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Profile Information</h2>
        <p className="settings-section-subtitle">Manage your personal information, profile photo and contact details.</p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="avatar-upload-section">
          <div 
            className="avatar-click-zone" 
            onClick={handleAvatarClick}
            role="button"
            tabIndex={0}
            aria-label="Click to upload profile picture"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAvatarClick(); }}
          >
            <div className="avatar-preview-container-lg">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile Avatar"
                  className="avatar-preview-img-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                  }}
                />
              ) : (
                <div className="avatar-preview-initials-lg">
                  {getInitials(name)}
                </div>
              )}
              <div className="avatar-hover-overlay">
                <span className="camera-icon">📷</span>
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg, image/jpg, image/png, image/webp"
              onChange={handleFileChange}
              className="hidden-file-input"
            />
          </div>

          <div className="avatar-upload-info">
            <span className="avatar-click-hint">Click to change photo</span>
            <span className="avatar-format-hint">JPG, PNG or WebP • Max 10MB</span>
            
            {uploading && (
              <div className="upload-progress-container">
                <div className="upload-progress-wrapper-bar">
                  <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="upload-progress-text">Uploading: {uploadProgress}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="settings-form-grid">
          <div className="settings-form-group">
            <label htmlFor="fullName" className="settings-label">Full Name <span className="required">*</span></label>
            <input
              type="text"
              id="fullName"
              className="settings-input"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="settings-form-group">
            <label htmlFor="emailAddress" className="settings-label">Email Address <span className="required">*</span></label>
            <input
              type="email"
              id="emailAddress"
              className="settings-input"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <div className="settings-alert settings-alert-error" role="alert">
            {error}
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
            {loading ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

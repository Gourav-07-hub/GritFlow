import React, { useState, useEffect } from 'react';
import useSettings from '../hooks/useSettings';
import ProfileSettings from '../components/settings/ProfileSettings';
import PasswordSettings from '../components/settings/PasswordSettings';
import PreferencesSettings from '../components/settings/PreferencesSettings';
import AccountStats from '../components/settings/AccountStats';
import AccountSettings from '../components/settings/AccountSettings';

export default function SettingsPage() {
  const {
    profile,
    preferences,
    accountStats,
    loading,
    error,
    success,
    saveProfile,
    updatePassword,
    savePreferences,
    removeAccount,
  } = useSettings();

  const [activeTab, setActiveTab] = useState('Profile');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    document.title = 'Settings | GritFlow';
  }, []);

  // Tab details definition
  const tabs = [
    { id: 'Profile', label: 'Profile', icon: '👤', title: 'Profile Settings', description: 'Manage your personal information' },
    { id: 'Password', label: 'Password', icon: '🔒', title: 'Password Settings', description: 'Keep your account secure' },
    { id: 'Preferences', label: 'Preferences', icon: '🎨', title: 'Preferences Settings', description: 'Customize your experience' },
    { id: 'Account Stats', label: 'Account Stats', icon: '📊', title: 'Account Statistics', description: 'Your GritFlow journey so far' },
    { id: 'Account', label: 'Account', icon: '⚠️', title: 'Account Settings', description: 'Manage your account' },
  ];

  const activeTabDetails = tabs.find((t) => t.id === activeTab) || tabs[0];

  const handlePasswordSave = async (data) => {
    setPasswordLoading(true);
    try {
      await updatePassword(data);
    } catch (err) {
      // Handled by hook error state
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (password) => {
    setDeleteLoading(true);
    try {
      await removeAccount(password);
    } catch (err) {
      // Handled by hook error state
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile':
        return (
          <ProfileSettings
            profile={profile}
            onSave={saveProfile}
            loading={loading.profile}
            error={error}
            success={success}
          />
        );
      case 'Password':
        return (
          <PasswordSettings
            onSave={handlePasswordSave}
            loading={passwordLoading}
            error={error}
            success={success}
          />
        );
      case 'Preferences':
        return (
          <PreferencesSettings
            preferences={preferences}
            onSave={savePreferences}
            loading={loading.preferences}
            error={error}
            success={success}
          />
        );
      case 'Account Stats':
        return <AccountStats accountStats={accountStats} loading={loading.stats} />;
      case 'Account':
        return (
          <AccountSettings
            onDelete={handleDeleteAccount}
            loading={deleteLoading}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-page-container">
      {/* Global Toast / Alert Notifications */}
      {(success || error) && (
        <div className={`settings-global-alert-toast ${success ? 'toast-success' : 'toast-error'}`} role="alert">
          <span className="toast-icon">{success ? '✅' : '❌'}</span>
          <span className="toast-message">{success || error}</span>
        </div>
      )}

      <header className="settings-page-header">
        <h1 className="settings-page-title">User Settings</h1>
        <p className="settings-page-subtitle">Configure your profile, preferences, and security options.</p>
      </header>

      <div className="settings-page-layout">
        {/* Left Tab Navigation Sidebar */}
        <aside className="settings-sidebar">
          <nav className="settings-nav-tabs" aria-label="Settings tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`settings-nav-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  aria-selected={isActive}
                  role="tab"
                >
                  <span className="settings-tab-icon">{tab.icon}</span>
                  <span className="settings-tab-label">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="settings-content-area">
          <div className="settings-content-header-card">
            <h2 className="settings-content-title">
              <span className="settings-title-icon">{activeTabDetails.icon}</span>{' '}
              {activeTabDetails.title}
            </h2>
            <p className="settings-content-description">{activeTabDetails.description}</p>
          </div>
          <div className="settings-tab-component-wrapper">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import useFriends from '../hooks/useFriends';
import UserSearchBar from '../components/friends/UserSearchBar';
import UserSearchCard from '../components/friends/UserSearchCard';
import PendingRequestCard from '../components/friends/PendingRequestCard';
import FriendList from '../components/friends/FriendList';
import styles from './FriendsPage.module.css';

const FriendsPage = () => {
  useEffect(() => {
    document.title = 'Friends | GritFlow';
  }, []);

  const {
    friends,
    pendingRequests,
    sentRequests,
    searchResults,
    searchQuery,
    loading,
    error,
    searchUsers,
    sendRequest,
    respondRequest,
    deleteFriend,
  } = useFriends();

  const [activeTab, setActiveTab] = useState('friends');

  // Handle Respond action from search card
  const handleRespondFromSearch = async (userId, action) => {
    const request = pendingRequests.find((r) => r.requester?._id === userId);
    if (request) {
      await respondRequest(request._id, action);
    }
  };

  // Helper to generate initials avatar for sent cards
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Friends</h1>
        <p className={styles.subtitle}>Connect and compete with your friends</p>
      </div>

      {/* Search Section */}
      <div className={styles.searchSection}>
        <UserSearchBar
          onSearch={searchUsers}
          loading={loading.search}
          resultCount={searchResults.length}
          value={searchQuery}
        />

        {searchQuery && searchQuery.trim() && (
          <div className={styles.searchResultsGrid}>
            {searchResults.map((user) => (
              <UserSearchCard
                key={user._id}
                user={user}
                onSendRequest={sendRequest}
                onRespond={handleRespondFromSearch}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'friends' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Friends ({friends.length})
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
          {pendingRequests.length > 0 && (
            <span className={styles.tabBadge}>{pendingRequests.length}</span>
          )}
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'sent' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          Sent ({sentRequests.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'friends' && (
          <>
            <div className={styles.friendsSummary}>
              {friends.length} friend{friends.length === 1 ? '' : 's'}
            </div>
            <FriendList
              friends={friends}
              loading={loading.friends}
              error={error}
              onRemove={deleteFriend}
            />
          </>
        )}

        {activeTab === 'pending' && (
          <>
            {pendingRequests.length === 0 ? (
              <div className={styles.emptyTabState}>
                <span className="empty-state-illustration">🎉</span>
                <p className={styles.emptyText}>All caught up! No pending friend requests.</p>
              </div>
            ) : (
              <div className={styles.sentList}>
                {pendingRequests.map((request) => (
                  <PendingRequestCard
                    key={request._id}
                    request={request}
                    onAccept={(id) => respondRequest(id, 'accept')}
                    onReject={(id) => respondRequest(id, 'reject')}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'sent' && (
          <>
            {sentRequests.length === 0 ? (
              <div className={styles.emptyTabState}>
                <span className="empty-state-illustration">✉️</span>
                <p className={styles.emptyText}>No outgoing requests sent yet.</p>
              </div>
            ) : (
              <div className={styles.sentList}>
                {sentRequests.map((request) => {
                  const recipient = request.recipient;
                  if (!recipient) return null;
                  return (
                    <div key={request._id} className={styles.sentCard}>
                      <div className={styles.sentCardInfo}>
                        {recipient.avatar ? (
                          <img
                            src={recipient.avatar}
                            alt={recipient.name}
                            className={styles.sentAvatar}
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1px solid var(--color-border)',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '600',
                              fontSize: '1rem',
                              border: '1px solid rgba(167, 139, 250, 0.3)',
                            }}
                          >
                            {getInitials(recipient.name)}
                          </div>
                        )}
                        <div className={styles.sentDetails}>
                          <span className={styles.sentName}>{recipient.name}</span>
                          <span className={styles.sentUsername}>@{recipient.username}</span>
                        </div>
                      </div>

                      <div className={styles.sentCardActions}>
                        <span className={styles.pendingLabel}>Request Pending...</span>
                        <button
                          className={styles.cancelBtn}
                          onClick={() => deleteFriend(request._id)}
                        >
                          Cancel Request
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;

import { useState, useEffect, useCallback, useRef } from 'react';
import * as friendService from '../services/friendService';

/**
 * Custom hook to manage all friends-related state and actions
 */
const useFriends = () => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState({
    friends: false,
    pending: false,
    search: false,
  });
  const [error, setError] = useState(null);

  const searchTimeoutRef = useRef(null);

  // Fetch accepted friends
  const fetchFriends = useCallback(async () => {
    setLoading((prev) => ({ ...prev, friends: true }));
    setError(null);
    try {
      const data = await friendService.getFriends();
      setFriends(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading((prev) => ({ ...prev, friends: false }));
    }
  }, []);

  // Fetch pending (received) requests
  const fetchPendingRequests = useCallback(async () => {
    setLoading((prev) => ({ ...prev, pending: true }));
    setError(null);
    try {
      const data = await friendService.getPendingRequests();
      setPendingRequests(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading((prev) => ({ ...prev, pending: false }));
    }
  }, []);

  // Fetch sent requests
  const fetchSentRequests = useCallback(async () => {
    setError(null);
    try {
      const data = await friendService.getSentRequests();
      setSentRequests(data);
    } catch (err) {
      setError(err);
    }
  }, []);

  // Helper to refresh all friends and request lists
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchFriends(),
      fetchPendingRequests(),
      fetchSentRequests(),
    ]);
  }, [fetchFriends, fetchPendingRequests, fetchSentRequests]);

  // Helper to trigger a global sync event
  const triggerSync = useCallback(() => {
    window.dispatchEvent(new CustomEvent('friend-request-changed'));
  }, []);

  // Helper to refresh the active search result list
  const refreshSearch = async (query) => {
    if (query && query.trim()) {
      try {
        const results = await friendService.searchUsers(query);
        setSearchResults(results);
      } catch (err) {
        // Silent catch for search background refreshes
      }
    }
  };

  // Debounced search users function
  const searchUsers = useCallback((query) => {
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setSearchResults([]);
      setLoading((prev) => ({ ...prev, search: false }));
      return;
    }

    setLoading((prev) => ({ ...prev, search: true }));
    setError(null);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await friendService.searchUsers(query);
        setSearchResults(results);
      } catch (err) {
        setError(err);
      } finally {
        setLoading((prev) => ({ ...prev, search: false }));
      }
    }, 500);
  }, []);

  // Clear active search state
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setLoading((prev) => ({ ...prev, search: false }));
  }, []);

  // Send friend request
  const sendRequest = async (recipientId) => {
    setError(null);
    try {
      await friendService.sendFriendRequest(recipientId);
      // Optimistically update the UI status for this user
      setSearchResults((prev) =>
        prev.map((user) =>
          user._id === recipientId ? { ...user, friendshipStatus: 'pending_sent' } : user
        )
      );
      await refreshAll();
      triggerSync();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Respond to friend request (accept/reject)
  const respondRequest = async (friendshipId, action) => {
    setError(null);
    try {
      await friendService.respondToRequest(friendshipId, action);
      await refreshAll();
      triggerSync();
      if (searchQuery) {
        await refreshSearch(searchQuery);
      }
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Delete friend
  const deleteFriend = async (friendshipId) => {
    setError(null);
    try {
      await friendService.removeFriend(friendshipId);
      await refreshAll();
      triggerSync();
      if (searchQuery) {
        await refreshSearch(searchQuery);
      }
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Run on mount
  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
    fetchSentRequests();
    
    const handleSync = () => {
      // Fetch without setting full loading states to avoid visual flashes
      friendService.getFriends().then(setFriends).catch(() => {});
      friendService.getPendingRequests().then(setPendingRequests).catch(() => {});
      friendService.getSentRequests().then(setSentRequests).catch(() => {});
    };

    window.addEventListener('friend-request-changed', handleSync);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      window.removeEventListener('friend-request-changed', handleSync);
    };
  }, [fetchFriends, fetchPendingRequests, fetchSentRequests]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    searchResults,
    searchQuery,
    loading,
    error,
    fetchFriends,
    fetchPendingRequests,
    fetchSentRequests,
    searchUsers,
    sendRequest,
    respondRequest,
    deleteFriend,
    clearSearch,
  };
};

export default useFriends;

import React, { useState, useEffect, useCallback } from 'react';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../services/notificationService';
import useToast from './useToast';
import { useNavigate } from 'react-router-dom';
import socket from '../socket/socketClient.js';

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  const fetchNotifications = useCallback(async (showLoading = true) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [list, countData] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      setNotifications(list);
      setUnreadCount(countData.count);
    } catch (err) {
      setError(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const readNotification = useCallback(async (id) => {
    try {
      const updated = await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? updated : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const readAll = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const removeNotification = useCallback(async (id) => {
    try {
      const target = notifications.find((n) => n._id === id);
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [notifications]);

  const clearAll = useCallback(async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling for notifications (keeps both list and unread count in sync)
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchNotifications(false);
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const playNotificationSound = useCallback(() => {
    const soundsEnabled = localStorage.getItem('sound_enabled') !== 'false';
    if (!soundsEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.4);
    } catch (err) {
      console.warn('Web Audio API not supported:', err);
    }
  }, []);

  useEffect(() => {
    const handleFriendRequestReceived = (payload) => {
      const { from, friendshipId } = payload;
      const path = window.location.pathname;

      const newNotif = {
        _id: Math.random().toString(36).substr(2, 9),
        title: 'Friend Request',
        message: `${from.name} sent you a friend request!`,
        type: 'friend_request',
        icon: '👥',
        isRead: false,
        createdAt: new Date(),
        link: '/dashboard/friends',
        friendshipId
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      window.dispatchEvent(new CustomEvent('friend-request-changed'));

      if (path === '/dashboard/friends') {
        return;
      }

      showToast(`${from.name} sent you a friend request! 👥`, 'info');
      playNotificationSound();
    };

    const handleFriendRequestAccepted = (payload) => {
      const { from } = payload;
      const path = window.location.pathname;

      const newNotif = {
        _id: Math.random().toString(36).substr(2, 9),
        title: 'Friend Request Accepted',
        message: `${from.name} accepted your friend request!`,
        type: 'friend_accepted',
        icon: '🤝',
        isRead: false,
        createdAt: new Date(),
        link: '/dashboard/friends'
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      window.dispatchEvent(new CustomEvent('friend-request-changed'));

      if (path === '/dashboard/friends') {
        return;
      }

      showToast(`${from.name} accepted your friend request! 🤝`, 'success');
    };

    const handleNewMessageNotification = (payload) => {
      const { from, conversationId } = payload;
      const path = window.location.pathname;

      const newNotif = {
        _id: Math.random().toString(36).substr(2, 9),
        title: 'New Message',
        message: `New message from ${from.name}`,
        type: 'new_message',
        icon: '💬',
        isRead: false,
        createdAt: new Date(),
        link: `/dashboard/chat/${from._id}`,
        conversationId
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      if (path === `/dashboard/chat/${from._id}`) {
        return;
      }

      const toastElement = React.createElement(
        'div',
        {
          onClick: () => navigate(`/dashboard/chat/${from._id}`),
          style: { cursor: 'pointer', width: '100%' }
        },
        `New message from ${from.name} 💬`
      );

      showToast(toastElement, 'info');
    };

    socket.on('friend_request_received', handleFriendRequestReceived);
    socket.on('friend_request_accepted', handleFriendRequestAccepted);
    socket.on('new_message_notification', handleNewMessageNotification);

    return () => {
      socket.off('friend_request_received', handleFriendRequestReceived);
      socket.off('friend_request_accepted', handleFriendRequestAccepted);
      socket.off('new_message_notification', handleNewMessageNotification);
    };
  }, [showToast, playNotificationSound, navigate]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    readNotification,
    readAll,
    removeNotification,
    clearAll,
  };
}

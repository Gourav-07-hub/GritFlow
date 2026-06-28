import { useState, useEffect, useCallback } from 'react';
import socket, { connectSocket, disconnectSocket } from '../socket/socketClient.js';

/**
 * Custom hook to manage the global Socket.io connection state and friend online statuses.
 */
export default function useSocket() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const isUserOnline = useCallback((userId) => {
    if (!userId) return false;
    return onlineUsers.has(userId.toString());
  }, [onlineUsers]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !socket.connected) {
      connectSocket(token);
    }

    setIsConnected(socket.connected);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onFriendOnline = ({ userId }) => {
      if (userId) {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.add(userId.toString());
          return next;
        });
      }
    };

    const onFriendOffline = ({ userId }) => {
      if (userId) {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId.toString());
          return next;
        });
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('friend_online', onFriendOnline);
    socket.on('friend_offline', onFriendOffline);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('friend_online', onFriendOnline);
      socket.off('friend_offline', onFriendOffline);
    };
  }, []);

  return {
    isConnected,
    onlineUsers,
    isUserOnline
  };
}

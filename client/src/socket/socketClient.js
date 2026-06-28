import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const getTokenFromLocalStorage = () => {
  return localStorage.getItem('token') || '';
};

// Create the Socket.io client instance with autoConnect: false
const socket = io(socketUrl, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  auth: {
    token: getTokenFromLocalStorage()
  }
});

// Flag to prevent multiple simultaneous connection handshakes
let isConnectingOrConnected = false;

socket.on('connect', () => {
  isConnectingOrConnected = true;
});

socket.on('disconnect', () => {
  isConnectingOrConnected = false;
});

socket.on('connect_error', () => {
  isConnectingOrConnected = false;
});

/**
 * Connect socket manually, optionally with a fresh token
 * @param {string} [token]
 */
export const connectSocket = (token) => {
  if (socket.connected || isConnectingOrConnected) {
    return;
  }

  const finalToken = token || getTokenFromLocalStorage();
  if (finalToken) {
    socket.auth = { token: finalToken };
  }
  
  isConnectingOrConnected = true;
  socket.connect();
};

/**
 * Disconnect socket and clean up
 */
export const disconnectSocket = () => {
  isConnectingOrConnected = false;
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;

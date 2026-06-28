import React, { useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useChat from '../hooks/useChat.js';
import useSocket from '../hooks/useSocket.js';
import ConversationList from '../components/chat/ConversationList.jsx';
import ChatWindow from '../components/chat/ChatWindow.jsx';
import PageLoader from '../components/ui/PageLoader.jsx';

/**
 * Main Chat page supporting responsive list/chat views and URL-param direct chatting.
 */
export default function ChatPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Messages | GritFlow';
  }, []);

  const {
    conversations,
    activeConversation,
    messages,
    isTyping,
    loading,
    error,
    hasMore,
    openConversation,
    closeConversation,
    sendMessage,
    loadMoreMessages,
    startTyping,
    stopTyping,
    reactToMessage,
    removeMessage,
    fetchConversations
  } = useChat();

  const { onlineUsers, isUserOnline } = useSocket();

  // If a userId is in the URL, open that conversation automatically on mount
  useEffect(() => {
    if (userId) {
      openConversation(userId);
    } else {
      closeConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSelectConversation = useCallback((conv) => {
    // Find the other participant's ID
    const friend = conv.participants.find((p) => {
      // Return friend ID based on current logged in user
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const loggedUser = JSON.parse(savedUser);
        return p._id.toString() !== (loggedUser._id || loggedUser.id).toString();
      }
      return true;
    });

    if (friend) {
      navigate(`/dashboard/chat/${friend._id}`);
    }
  }, [navigate]);

  const handleBack = useCallback(() => {
    closeConversation();
    navigate('/dashboard/chat');
  }, [closeConversation, navigate]);

  // Find the other participant from the active conversation
  const friendId = useMemo(() => {
    if (!activeConversation) return null;
    const participant = activeConversation.participants.find((p) => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const loggedUser = JSON.parse(savedUser);
        return p._id.toString() !== (loggedUser._id || loggedUser.id).toString();
      }
      return true;
    });
    return participant?._id;
  }, [activeConversation]);

  const isOnline = useMemo(() => {
    return isUserOnline(friendId);
  }, [isUserOnline, friendId]);

  const hasActive = !!activeConversation;

  // Safety Guards
  if (error) {
    return (
      <div className="chat-error-state" style={{ padding: '40px 24px', textAlign: 'center', color: '#ef4444' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Something went wrong.</h2>
        <p style={{ color: '#94a3b8', marginBottom: '16px' }}>{error}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={fetchConversations}
            className="btn btn-primary"
            style={{
              background: '#6d28d9',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-outline"
            style={{
              background: 'transparent',
              color: '#cbd5e1',
              border: '1px solid #334155',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (loading.conversations) {
    return <PageLoader message="Loading messages..." />;
  }

  return (
    <div className={`chat-page-container ${hasActive ? 'has-active-chat' : ''}`}>
      {/* Left panel (Conversation list) */}
      <div className="chat-sidebar-panel">
        <div className="chat-sidebar-header">
          <h1 className="chat-sidebar-title">Messages 💬</h1>
        </div>
        <ConversationList
          conversations={conversations}
          activeId={activeConversation?._id}
          onlineUsers={onlineUsers}
          onSelect={handleSelectConversation}
          loading={loading.conversations}
        />
      </div>

      {/* Right panel (Chat Window or Empty State) */}
      <div className="chat-main-panel">
        {!activeConversation ? (
          <div className="chat-empty-panel-state">
            <div className="chat-empty-panel-icon" style={{ fontSize: '4rem' }}>
              💬
            </div>
            <h2>Select a conversation</h2>
            <p>Choose from your conversations on the left</p>
          </div>
        ) : (
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            isTyping={isTyping}
            hasMore={hasMore}
            onSend={sendMessage}
            onLoadMore={loadMoreMessages}
            onReact={reactToMessage}
            onDelete={removeMessage}
            onTyping={startTyping}
            onStopTyping={stopTyping}
            isOnline={isOnline}
            onBack={handleBack}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}


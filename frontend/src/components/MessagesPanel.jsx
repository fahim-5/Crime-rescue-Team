import React, { useState, useEffect, useRef } from 'react';
import styles from './MessagesPanel.module.css';

const MessagesPanel = ({
  currentUser = { id: 'user1', name: 'You', role: 'User' },
  recipient = { id: 'user2', name: 'Support Agent', role: 'Support' },
  initialMessages = [],
  onSendMessage = () => {},
  showInstructions = true
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].senderId === currentUser.id) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      senderId: currentUser.id,
      text: newMessage,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    onSendMessage(newMsg);
  };

  const formatTime = date => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = date => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today.setDate(today.getDate() - 1));
    return date.toDateString() === yesterday.toDateString() ? 'Yesterday' : date.toLocaleDateString();
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const dateKey = formatDate(msg.timestamp);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.container}>
      {showInstructions && (
        <div className={styles.instructions}>
          <h2 className={styles.instructionsHeader}>Reporting Guide</h2>
          {[1, 2, 3, 4, 5].map(step => (
            <div key={step} className={styles.step}>
              <div className={styles.stepNumber}>{step}</div>
              <h3>Step {step} Title</h3>
              <p>Step {step} description with detailed instructions for the user.</p>
            </div>
          ))}
          <div className={styles.step}>
            <div className={styles.stepNumber}>!</div>
            <h3>Emergency Notice</h3>
            <p>In case of immediate danger, please contact local authorities first.</p>
          </div>
        </div>
      )}

      <div className={styles.chatContainer}>
        <header className={styles.header}>
          <div className={styles.recipientInfo}>
            <h2>{recipient.name}</h2>
            <div className={styles.typingIndicator}>
              {isTyping && (
                <>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  Typing...
                </>
              )}
            </div>
          </div>
        </header>

        <main className={styles.messagesBody}>
          {Object.entries(groupedMessages).map(([date, messages]) => (
            <div key={date} className={styles.messageGroup}>
              <div className={styles.dateDivider}>{date}</div>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`${styles.messageBubble} ${
                    msg.senderId === currentUser.id ? styles.sent : styles.received
                  }`}
                >
                  <p>{msg.text}</p>
                  <div className={styles.messageMeta}>
                    <span>{formatTime(msg.timestamp)}</span>
                    {msg.senderId === currentUser.id && (
                      <span>{msg.status === 'sent' ? '✓' : '✓✓'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        <div className={styles.inputContainer}>
          <input
            type="text"
            className={styles.messageInput}
            placeholder="Type your message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button
            className={styles.sendButton}
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            aria-label="Send message"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesPanel;
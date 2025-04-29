import React, { useState, useEffect, useRef } from "react";
import "./MessagesPanel.css";

const MessagesPanel = ({
  currentUser = { id: "user1", name: "You", role: "user" },
  recipient = { id: "user2", name: "Recipient", role: "recipient" },
  initialMessages = [],
  onSendMessage = () => {},
  showHeader = true,
  showUserRoles = true,
  allowAttachments = false,
  showCrimeGuide = false
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Simulate recipient typing (for demo purposes)
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].senderId === currentUser.id) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newMsg = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: newMessage,
      timestamp: new Date(),
      status: "sent"
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
    
    // Callback for parent component
    onSendMessage(newMsg);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((acc, message) => {
    const dateKey = formatDate(message.timestamp);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(message);
    return acc;
  }, {});

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`app-container ${showCrimeGuide ? 'with-guide' : ''}`}>
      {showCrimeGuide && (
        <div className="instructions-container">
          <h2 className="instructions-header">Crime Reporting Guide</h2>
          
          <div className="instruction-step">
            <span className="step-number">1</span>
            <h3 className="step-title">Start a Report</h3>
            <p className="step-content">Click 'New Report' to begin documenting a crime incident. Our system will connect you with local law enforcement.</p>
          </div>
          
          <div className="instruction-step">
            <span className="step-number">2</span>
            <h3 className="step-title">Provide Details</h3>
            <p className="step-content">Describe the incident clearly including time, location, and any suspect information. Be as specific as possible.</p>
          </div>
          
          <div className="instruction-step">
            <span className="step-number">3</span>
            <h3 className="step-title">Share Evidence</h3>
            <p className="step-content">Upload photos, videos, or documents using the attachment button. All files are securely encrypted.</p>
          </div>
          
          <div className="instruction-step">
            <span className="step-number">4</span>
            <h3 className="step-title">Location Sharing</h3>
            <p className="step-content">Enable location services to help officers respond accurately. Your exact location is only visible to authorities.</p>
          </div>
          
          <div className="instruction-step">
            <span className="step-number">5</span>
            <h3 className="step-title">Real-time Updates</h3>
            <p className="step-content">Officers will message you with follow-up questions and status updates. Check back regularly.</p>
          </div>
          
          <div className="emergency-notice">
            <h3 className="emergency-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Emergency Notice
            </h3>
            <p>For immediate danger, call 911 first before using this system. This platform is for non-emergency reporting and follow-up communication.</p>
          </div>
        </div>
      )}
      
      <div className="messages-container">
        {showHeader && (
          <div className="messages-header">
            <div className="header-content">
              <div className="recipient-info">
                <span className="recipient-name">{recipient.name}</span>
                {showUserRoles && (
                  <span className="recipient-role">{recipient.role}</span>
                )}
              </div>
              {isTyping && (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="messages-body">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="date-group">
              <div className="date-divider">
                <span>{date}</span>
              </div>
              {dateMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.senderId === currentUser.id ? "sent" : "received"}`}
                >
                  {showUserRoles && msg.senderId !== currentUser.id && (
                    <span className="message-sender">{msg.senderName}</span>
                  )}
                  <div className="message-content">
                    <p>{msg.text}</p>
                    <div className="message-meta">
                      <span className="message-time">{formatTime(msg.timestamp)}</span>
                      {msg.senderId === currentUser.id && (
                        <span className={`message-status ${msg.status}`}>
                          {msg.status === "sent" ? "✓" : "✓✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="message-input-section">
          {allowAttachments && (
            <button className="attachment-button">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
              </svg>
            </button>
          )}
          <input
            type="text"
            placeholder={`Message ${recipient.name}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="send-button"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesPanel;
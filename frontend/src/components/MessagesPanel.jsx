import React, { useState, useEffect, useRef } from 'react';
import styles from './MessagesPanel.module.css';

const dummyPolice = [
  {
    id: 'police1',
    name: 'Officer Zunaid',
    role: 'Police',
    lastMessage: 'Please share the photo of the item.',
    lastActivity: new Date(),
    unread: 1,
    messages: [
      {
        id: 1,
        senderId: 'police1',
        senderName: 'Officer Zunaid',
        text: 'Hello! We found a phone matching your description.',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 2,
        senderId: 'admin1',
        senderName: 'Admin',
        text: 'That’s great! Can you send a picture?',
        timestamp: new Date(Date.now() - 1800000)
      },
      {
        id: 3,
        senderId: 'police1',
        senderName: 'Officer Zunaid',
        text: 'Please share the photo of the item.',
        timestamp: new Date(Date.now() - 600000)
      }
    ]
  }
];

const dummyPublic = [
  {
    id: 'public1',
    name: 'Faysal Ahmed',
    role: 'Public',
    lastMessage: 'Thank you so much!',
    lastActivity: new Date(),
    unread: 0,
    messages: [
      {
        id: 1,
        senderId: 'public1',
        senderName: 'Faysal Ahmed',
        text: 'Hi, I lost my student ID card.',
        timestamp: new Date(Date.now() - 7200000)
      },
      {
        id: 2,
        senderId: 'admin1',
        senderName: 'Admin',
        text: 'Do you remember where you last used it?',
        timestamp: new Date(Date.now() - 7100000)
      },
      {
        id: 3,
        senderId: 'public1',
        senderName: 'Faysal Ahmed',
        text: 'Yes, I think it was in the library.',
        timestamp: new Date(Date.now() - 7000000)
      },
      {
        id: 4,
        senderId: 'admin1',
        senderName: 'Admin',
        text: 'Alright, I’ll notify the library desk.',
        timestamp: new Date(Date.now() - 6500000)
      },
      {
        id: 5,
        senderId: 'public1',
        senderName: 'Faysal Ahmed',
        text: 'Thank you so much!',
        timestamp: new Date(Date.now() - 6000000)
      }
    ]
  }
];

const MessagesPanel = () => {
  const currentUser = { id: 'admin1', name: 'Admin' };

  const [policeConvs, setPoliceConvs] = useState(dummyPolice);
  const [publicConvs, setPublicConvs] = useState(dummyPublic);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const updatedConvs = (convs, setConvs) => {
      const updated = convs.map(conv =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              messages: [
                ...conv.messages,
                {
                  id: Date.now(),
                  senderId: currentUser.id,
                  senderName: currentUser.name,
                  text: newMessage,
                  timestamp: new Date()
                }
              ],
              lastMessage: newMessage,
              lastActivity: new Date(),
              unread: 0
            }
          : conv
      );
      setConvs(updated);
    };

    selectedConversation.role === 'Police'
      ? updatedConvs(policeConvs, setPoliceConvs)
      : updatedConvs(publicConvs, setPublicConvs);

    setNewMessage('');
  };

  const formatTime = date =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = date => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  const ConversationList = ({ title, conversations }) => (
    <div className={styles.conversationGroup}>
      <h3 className={styles.groupTitle}>{title}</h3>
      {conversations.map(conv => (
        <div
          key={conv.id}
          className={`${styles.conversationItem} ${selectedConversation?.id === conv.id ? styles.active : ''}`}
          onClick={() => setSelectedConversation(conv)}
        >
          <div className={styles.conversationInfo}>
            <div className={styles.header}>
              <h4>{conv.name}</h4>
              <span className={styles.time}>{formatTime(conv.lastActivity)}</span>
            </div>
            <p className={styles.lastMessage}>{conv.lastMessage}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.contactsPanel}>
        <ConversationList title="Police" conversations={policeConvs} />
      </div>

      <div className={styles.chatContainer}>
        {selectedConversation ? (
          <>
            <header className={styles.chatHeader}>
              <h2>Chat with {selectedConversation.name}</h2>
            </header>

            <main className={styles.messagesBody}>
              {Object.entries(
                selectedConversation.messages.reduce((acc, msg) => {
                  const dateKey = formatDate(msg.timestamp);
                  acc[dateKey] = acc[dateKey] || [];
                  acc[dateKey].push(msg);
                  return acc;
                }, {})
              ).map(([date, messages]) => (
                <div key={date} className={styles.messageGroup}>
                  <div className={styles.dateDivider}>{date}</div>
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`${styles.messageBubble} ${
                        msg.senderId === currentUser.id ? styles.sent : styles.received
                      }`}
                    >
                      <div className={styles.messageHeader}>
                        <span className={styles.senderName}>{msg.senderId === currentUser.id ? 'You' : msg.senderName}</span>
                        <span className={styles.timestamp}>{formatTime(msg.timestamp)}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </main>

            <div className={styles.inputContainer}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} disabled={!newMessage.trim()}>
                ➤
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <h2>Select a conversation</h2>
            <p>Pick a chat from the list</p>
          </div>
        )}
      </div>

      <div className={styles.contactsPanel}>
        <ConversationList title="Public" conversations={publicConvs} />
      </div>
    </div>
  );
};

export default MessagesPanel;

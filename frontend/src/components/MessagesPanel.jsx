import React, { useState, useEffect, useRef } from 'react';
import styles from './MessagesPanel.module.css';

// Icons (you can replace these with actual icon components from a library like react-icons)
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const AttachmentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
  </svg>
);

const MoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="19" cy="12" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
  </svg>
);

const BlockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// Dummy data for conversations
const dummyConversations = [
  {
    id: 'conv1',
    name: 'Ahmed Khan',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'I found your wallet!',
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
    unread: 2,
    isOnline: true,
    isBlocked: false,
    role: 'Public',
    messages: [
      {
        id: 'm1',
        senderId: 'user2',
        text: 'Hello, I think I found your wallet at the bus station',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'm2',
        senderId: 'currentUser',
        text: "Oh really? That's great! Does it have my ID card inside?",
        timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'm3',
        senderId: 'user2',
        text: "Yes, it does. Here's a photo of it:",
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'm4',
        senderId: 'user2',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1556103255-4443dbae8e5a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8d2FsbGV0fGVufDB8fDB8fA%3D%3D&w=1000&q=80',
        text: 'Image of wallet',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'm5',
        senderId: 'currentUser',
        text: "That's mine! Where can we meet?",
        timestamp: new Date(Date.now() - 1.2 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'm6',
        senderId: 'user2',
        text: 'I could meet you at the Central Mall around 4pm?',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'm7',
        senderId: 'user2',
        text: 'I found your wallet!',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'delivered'
      }
    ]
  },
  {
    id: 'conv2',
    name: 'Zahra Mirza',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Can you send me photos of the lost item?',
    lastMessageTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    unread: 0,
    isOnline: false,
    isBlocked: false,
    role: 'Public',
    messages: [
      {
        id: 'm1',
        senderId: 'currentUser',
        text: 'Hi, I lost my laptop in the university library',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'm2',
        senderId: 'user3',
        text: 'Sorry to hear that. Could you describe it?',
        timestamp: new Date(Date.now() - 4.8 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'm3',
        senderId: 'currentUser',
        text: "It's a silver MacBook Pro with a blue case",
        timestamp: new Date(Date.now() - 4.5 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'm4',
        senderId: 'user3',
        text: 'Can you send me photos of the lost item?',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        status: 'read'
      }
    ]
  },
  {
    id: 'conv3',
    name: 'Officer Zunaid',
    avatar: 'https://i.pravatar.cc/150?img=8',
    lastMessage: "We'll check our database for your phone",
    lastMessageTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    unread: 0,
    isOnline: true,
    isBlocked: false,
    role: 'Police',
    messages: [
      {
        id: 'm1',
        senderId: 'currentUser',
        text: 'Hello Officer, I lost my phone yesterday at City Park',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'm2',
        senderId: 'user4',
        text: 'Could you describe the phone and when exactly you lost it?',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'm3',
        senderId: 'currentUser',
        text: "It's a black iPhone 13 with a red case. I lost it around 6pm near the fountain.",
        timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'm4',
        senderId: 'currentUser',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1603898037225-1bea09c550c0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGlwaG9uZSUyMDEzfGVufDB8fDB8fA%3D%3D&w=1000&q=80',
        text: 'Image of the phone',
        timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'm5',
        senderId: 'user4',
        text: "We'll check our database for your phone",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'read'
      }
    ]
  },
  {
    id: 'conv4',
    name: 'Monika Singh',
    avatar: 'https://i.pravatar.cc/150?img=9',
    lastMessage: "Sorry, I haven't seen any backpack there",
    lastMessageTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    unread: 0,
    isOnline: false,
    isBlocked: true,
    role: 'Public',
    messages: [
      {
        id: 'm1',
        senderId: 'currentUser',
        text: 'Hi, did anyone turn in a blue backpack at the café today?',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 'm2',
        senderId: 'user5',
        text: "Sorry, I haven't seen any backpack there",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        status: 'read'
      }
    ]
  }
];

const currentUser = {
  id: 'currentUser',
  name: 'Fahim Faysal',
  avatar: 'https://i.pravatar.cc/150?img=12',
  role: 'Admin'
};

const MessagesPanel = () => {
  const [conversations, setConversations] = useState(dummyConversations);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation?.messages]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectConversation = (conversation) => {
    // Mark conversation as read when selected
    const updatedConversations = conversations.map(conv => 
      conv.id === conversation.id ? { ...conv, unread: 0 } : conv
    );
    
    setConversations(updatedConversations);
    setSelectedConversation(conversation);
    setShowActionsMenu(false);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const updatedConversations = conversations.map(conv => 
      conv.id === selectedConversation.id 
        ? {
            ...conv,
            messages: [
              ...conv.messages,
              {
                id: `m${Date.now()}`,
                senderId: currentUser.id,
                text: newMessage,
                timestamp: new Date(),
                status: 'sent'
              }
            ],
            lastMessage: newMessage,
            lastMessageTime: new Date(),
            unread: 0
          }
        : conv
    );
    
    setConversations(updatedConversations);
    setSelectedConversation(updatedConversations.find(c => c.id === selectedConversation.id));
    setNewMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleAttachment = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (!e.target.files.length) return;
    
    const file = e.target.files[0];
    const fileType = file.type.startsWith('image/') ? 'image' : 'file';
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const updatedConversations = conversations.map(conv => 
        conv.id === selectedConversation.id 
          ? {
              ...conv,
              messages: [
                ...conv.messages,
                {
                  id: `m${Date.now()}`,
                  senderId: currentUser.id,
                  type: fileType,
                  mediaUrl: event.target.result,
                  text: file.name,
                  timestamp: new Date(),
                  status: 'sent'
                }
              ],
              lastMessage: fileType === 'image' ? 'Sent an image' : `Sent a file: ${file.name}`,
              lastMessageTime: new Date(),
              unread: 0
            }
          : conv
      );
      
      setConversations(updatedConversations);
      setSelectedConversation(updatedConversations.find(c => c.id === selectedConversation.id));
    };
    
    reader.readAsDataURL(file);
    e.target.value = null; // Reset the input
  };

  const handleShowMedia = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
    setShowMediaGallery(true);
  };

  const handleBlockUser = () => {
    const updatedConversations = conversations.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, isBlocked: !conv.isBlocked }
        : conv
    );
    
    setConversations(updatedConversations);
    setSelectedConversation({ ...selectedConversation, isBlocked: !selectedConversation.isBlocked });
    setShowActionsMenu(false);
  };

  const getMediaGallery = () => {
    if (!selectedConversation) return [];
    
    return selectedConversation.messages
      .filter(msg => msg.type === 'image')
      .map(msg => msg.mediaUrl);
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const grouped = {};
    
    messages.forEach(message => {
      const dateKey = formatDate(message.timestamp);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(message);
    });
    
    return Object.entries(grouped);
  };

  return (
    <div className={styles.container}>
      {/* Left panel - Conversations list */}
      <div className={styles.leftPanel}>
        <div className={styles.searchContainer}>
          <input 
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.conversationsList}>
          {filteredConversations.length === 0 ? (
            <div className={styles.noResults}>No conversations found</div>
          ) : (
            filteredConversations.map(conversation => (
              <div 
                key={conversation.id}
                className={`${styles.conversationItem} ${selectedConversation?.id === conversation.id ? styles.active : ''} ${conversation.isBlocked ? styles.blocked : ''}`}
                onClick={() => handleSelectConversation(conversation)}
              >
                <div className={styles.avatar}>
                  <img src={conversation.avatar} alt={conversation.name} />
                  {conversation.isOnline && <span className={styles.onlineIndicator}></span>}
                </div>
                
                <div className={styles.conversationInfo}>
                  <div className={styles.conversationHeader}>
                    <h4 className={styles.conversationName}>
                      {conversation.name}
                      {conversation.role === 'Police' && (
                        <span className={styles.smallRoleBadge}>Police</span>
                      )}
                    </h4>
                    <span className={styles.conversationTime}>
                      {formatDate(conversation.lastMessageTime) === 'Today' 
                        ? formatTime(conversation.lastMessageTime) 
                        : formatDate(conversation.lastMessageTime)}
                    </span>
                  </div>
                  
                  <div className={styles.conversationPreview}>
                    <p className={styles.previewMessage}>
                      {conversation.isBlocked ? '[Blocked]' : conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <span className={styles.unreadBadge}>{conversation.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Main panel - Messages */}
      <div className={styles.mainPanel}>
        {selectedConversation ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.headerUserInfo}>
                <div className={styles.avatar}>
                  <img src={selectedConversation.avatar} alt={selectedConversation.name} />
                  {selectedConversation.isOnline && <span className={styles.onlineIndicator}></span>}
                </div>
                <div>
                  <h3>{selectedConversation.name}</h3>
                  <span className={styles.statusText}>
                    {selectedConversation.isBlocked 
                      ? 'Blocked' 
                      : selectedConversation.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              
              <div className={styles.headerActions}>
                <button 
                  className={styles.actionButton}
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                >
                  <MoreIcon />
                </button>
                
                {showActionsMenu && (
                  <div className={styles.actionsMenu}>
                    <button className={styles.actionMenuItem} onClick={handleBlockUser}>
                      <BlockIcon />
                      {selectedConversation.isBlocked ? 'Unblock User' : 'Block User'}
                    </button>
                    <button 
                      className={styles.actionMenuItem}
                      onClick={() => setShowMediaGallery(true)}
                    >
                      <AttachmentIcon />
                      View Media
                    </button>
                    <button 
                      className={styles.actionMenuItem}
                      onClick={() => window.alert(`Viewing ${selectedConversation.name}'s profile`)}
                    >
                      <UserIcon />
                      View Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.messagesContainer}>
              {selectedConversation.isBlocked && (
                <div className={styles.blockedBanner}>
                  This user is blocked. Unblock to send messages.
                </div>
              )}
              
              <div className={styles.messagesList}>
                {groupMessagesByDate(selectedConversation.messages).map(([date, messages]) => (
                  <div key={date} className={styles.messageGroup}>
                    <div className={styles.dateDivider}>
                      <span>{date}</span>
                    </div>
                    
                    {messages.map(message => (
                      <div 
                        key={message.id}
                        className={`${styles.messageItem} ${message.senderId === currentUser.id ? styles.outgoing : styles.incoming}`}
                      >
                        {message.type === 'image' ? (
                          <div 
                            className={styles.imageMessage}
                            onClick={() => handleShowMedia(message.mediaUrl)}
                          >
                            <img src={message.mediaUrl} alt={message.text} />
                          </div>
                        ) : (
                          <div className={styles.textMessage}>
                            {message.text}
                          </div>
                        )}
                        
                        <div className={styles.messageFooter}>
                          <span className={styles.messageTime}>{formatTime(message.timestamp)}</span>
                          {message.senderId === currentUser.id && (
                            <span className={styles.messageStatus}>
                              {message.status === 'sent' ? '✓' : message.status === 'delivered' ? '✓✓' : '✓✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {!selectedConversation.isBlocked && (
              <div className={styles.inputContainer}>
                <button 
                  className={styles.attachButton}
                  onClick={handleAttachment}
                >
                  <AttachmentIcon />
                </button>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                />
                
                <textarea
                  className={styles.messageInput}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                
                <button 
                  className={styles.sendButton}
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  <SendIcon />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateContent}>
              <h2>Select a conversation</h2>
              <p>Choose a chat from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Right panel - Media/Details */}
      <div className={styles.rightPanel}>
        {selectedConversation && (
          <div className={styles.detailsContainer}>
            <div className={styles.profileSection}>
              <div className={styles.profileImage}>
                <img src={selectedConversation.avatar} alt={selectedConversation.name} />
              </div>
              <h3>{selectedConversation.name}</h3>
              <div className={`${styles.roleIndicator} ${
                selectedConversation.role === 'Admin' ? styles.adminRole :
                selectedConversation.role === 'Police' ? styles.policeRole :
                styles.publicRole
              }`}>
                {selectedConversation.role}
              </div>
              <p className={styles.statusText}>
                {selectedConversation.isBlocked 
                  ? 'Blocked' 
                  : selectedConversation.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
            
            <div className={styles.mediaSection}>
              <h4>Shared Media</h4>
              <div className={styles.mediaGrid}>
                {getMediaGallery().length > 0 ? (
                  getMediaGallery().map((mediaUrl, index) => (
                    <div 
                      key={index} 
                      className={styles.mediaThumbnail}
                      onClick={() => handleShowMedia(mediaUrl)}
                    >
                      <img src={mediaUrl} alt={`Media ${index + 1}`} />
                    </div>
                  ))
                ) : (
                  <p className={styles.noMedia}>No media shared yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Media Gallery Modal */}
      {showMediaGallery && (
        <div className={styles.mediaModal}>
          <div className={styles.mediaModalContent}>
            <button 
              className={styles.closeButton}
              onClick={() => {
                setShowMediaGallery(false);
                setSelectedMedia(null);
              }}
            >
              <CloseIcon />
            </button>
            
            <div className={styles.mediaViewer}>
              {selectedMedia ? (
                <img src={selectedMedia} alt="Full size media" />
              ) : (
                <div className={styles.mediaGalleryGrid}>
                  {getMediaGallery().map((mediaUrl, index) => (
                    <div 
                      key={index}
                      className={styles.galleryItem}
                      onClick={() => setSelectedMedia(mediaUrl)}
                    >
                      <img src={mediaUrl} alt={`Gallery item ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPanel;

import React, { useState } from 'react';
import styles from './Instructions.module.css';
import { useNavigate } from 'react-router-dom';

const Instructions = () => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, isUser: true }]);
      setMessage("");
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "Thank you for your message. Our support team will respond shortly.", 
          isUser: false 
        }]);
      }, 1000);
    }
  };

  return (
    <div className={styles.instructionsContainer}>
      {isChatOpen && (
        <div className={styles.chatModal}>
          <div className={styles.chatContent}>
            <div className={styles.chatHeader}>
              <h3>Admin Panel</h3>
              <button
                className={styles.closeButton}
                onClick={() => setIsChatOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className={styles.messagesContainer}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${styles.messageBubble} ${
                    msg.isUser ? styles.userMessage : ""
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className={styles.inputContainer}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button className={styles.sendButton} onClick={handleSendMessage}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <header className={styles.pageHeader}>
        <h1 className={styles.mainTitle}>Welcome to Stop Crime</h1>
        <p className={styles.subtitle}>Your complete guide to getting started with our crime reporting platform</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Getting Started</h2>
        <div className={styles.instructionCard}>
          <h3 className={styles.cardTitle}>Platform Overview</h3>
          <p className={styles.cardIntro}>
            Our platform provides three distinct access levels tailored to different user needs:
          </p>
          <ul className={styles.instructionList}>
            <li className={styles.listItem}>
              <span className={styles.checkIcon}>✓</span>
              <strong>Public:</strong> Community members can report crimes, view safety alerts, and access prevention resources.
            </li>
            <li className={styles.listItem}>
              <span className={styles.checkIcon}>✓</span>
              <strong>Police:</strong> Verified law enforcement personnel gain access to real-time reports and case management tools.
            </li>
            <li className={styles.listItem}>
              <span className={styles.checkIcon}>✓</span>
              <strong>Admin:</strong> System administrators oversee user verification and platform configuration.
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Account Creation</h2>
        <div className={styles.instructionGrid}>
          <div className={styles.instructionCard}>
            <h3 className={styles.cardTitle}>Public User Registration</h3>
            <ul className={styles.instructionList}>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Select "Public" as your role during registration
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Complete all required fields
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Verify your email address
              </li>
            </ul>
          </div>

          <div className={styles.instructionCard}>
            <h3 className={styles.cardTitle}>Police Officer Registration</h3>
            <ul className={styles.instructionList}>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Choose "Police" as your role
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Provide official badge number
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Submit verification documents
              </li>
            </ul>
          </div>

          <div className={styles.instructionCard}>
            <h3 className={styles.cardTitle}>Administrator Registration</h3>
            <ul className={styles.instructionList}>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Select "Admin" as your role
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Enter existing administrator's email
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Set up security questions
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Login Instructions</h2>
        <div className={styles.instructionCard}>
          <ul className={styles.instructionList}>
            <li className={styles.listItem}>
              <span className={styles.checkIcon}>✓</span>
              Enter registered email address
            </li>
            <li className={styles.listItem}>
              <span className={styles.checkIcon}>✓</span>
              Provide secure password
            </li>
            <li className={styles.listItem}>
              <span className={styles.checkIcon}>✓</span>
              Choose appropriate role
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Need Help?</h2>
        <div className={styles.helpCard}>
          <p>
            Contact us at <a href="mailto:support@stopcrime.com" className={styles.contactLink}>support@stopcrime.com</a> or 
            call <span className={styles.contactLink}>111-222-555</span>.
          </p>
          <button onClick={() => navigate('/faq')} className={styles.contactButton}>FAQ</button>
          <button className={styles.chatButton} onClick={() => setIsChatOpen(true)}>
            Start Chat
          </button>
        </div>
      </section>
    </div>
  );
};

export default Instructions;
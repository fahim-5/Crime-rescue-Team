import React, { useState } from "react";
import styles from "./FAQ.module.css";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, isUser: true }]);
      setMessage("");
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "Thank you for your message. Our support team will respond shortly.",
            isUser: false,
          },
        ]);
      }, 1000);
    }
  };

  const faqData = [
    {
      category: "General Information",
      icon: "ℹ️",
      questions: [
        {
          question: "What is Stop Crime Platform?",
          answer:
            "Stop Crime is a community-driven platform enabling citizens to report crimes, receive safety alerts, and collaborate with law enforcement to create safer neighborhoods through technology and collective action.",
        },
        {
          question: "Who can use this platform?",
          answer:
            "Available to all community members, verified law enforcement personnel, and system administrators with differentiated access levels for appropriate functionality.",
        },
        {
          question: "Is there an age requirement?",
          answer:
            "Users must be at least 13 years old to create an account. Minors under 18 require parental consent for full feature access.",
        },
      ],
    },
    {
      category: "Crime Reporting",
      icon: "📢",
      questions: [
        {
          question: "Can I report anonymously?",
          answer:
            "Yes, public users can submit anonymous reports, though this may limit follow-up capabilities. We never share reporter information without consent.",
        },
        {
          question: "How long until police see my report?",
          answer:
            "Reports appear in real-time on police dashboards. For emergencies, always contact official channels first.",
        },
        {
          question: "What types of crimes can I report?",
          answer:
            "You can report all non-emergency crimes including theft, vandalism, suspicious activities. For emergencies, call 911 immediately.",
        },
      ],
    },
    {
      category: "Account Security",
      icon: "🔒",
      questions: [
        {
          question: "How is my data protected?",
          answer:
            "We use AES-256 encryption, regular security audits, and comply with GDPR standards. Two-factor authentication is available for all accounts.",
        },
        {
          question: "Can I delete my account?",
          answer:
            "Yes, account deletion is available in profile settings. Note: Crime reports will remain anonymous in the system.",
        },
        {
          question: "What login methods are available?",
          answer:
            "Email/password, Google OAuth, and police badge verification for law enforcement personnel.",
        },
      ],
    },
    {
      category: "Technical Support",
      icon: "🛠️",
      questions: [
        {
          question: "Supported browsers?",
          answer:
            "Chrome 85+, Firefox 80+, Safari 14+, Edge 88+. Enable JavaScript and cookies for optimal performance.",
        },
        {
          question: "Mobile app availability?",
          answer:
            "Progressive Web App works on all modern smartphones. Add to home screen for app-like experience.",
        },
        {
          question: "Report submission failed?",
          answer:
            "Check internet connection, ensure all required fields are completed, and try again. Contact support if issues persist.",
        },
      ],
    },
  ];

  // Filter questions by searchTerm
  const filteredFaqData = faqData.map((category) => ({
    ...category,
    questions: category.questions.filter((q) =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  return (
    <div className={styles.faqContainer}>
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
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button className={styles.sendButton} onClick={handleSendMessage}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Stop Crime FAQ Center</h1>
          <p className={styles.heroSubtitle}>
            Your Comprehensive Guide to Safer Communities
          </p>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className={styles.searchButton}>Search</button>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        {filteredFaqData.length > 0 ? (
          filteredFaqData.map((category, catIndex) => (
            <section key={catIndex} className={styles.categorySection}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryIcon}>{category.icon}</span>
                <h2 className={styles.categoryTitle}>{category.category}</h2>
              </div>

              <div className={styles.accordion}>
                {category.questions.map((item, index) => {
                  const uniqueIndex = catIndex * 10 + index;
                  return (
                    <div
                      key={uniqueIndex}
                      className={`${styles.accordionItem} ${
                        activeIndex === uniqueIndex ? styles.active : ""
                      }`}
                    >
                      <button
                        className={styles.accordionButton}
                        onClick={() => toggleAccordion(uniqueIndex)}
                      >
                        <span className={styles.questionMark}>?</span>
                        <h3 className={styles.questionText}>{item.question}</h3>
                        <span className={styles.accordionArrow}></span>
                      </button>
                      <div className={styles.accordionContent}>
                        <p className={styles.answerText}>{item.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        ) : (
            <p className={styles.noResultsText}>No questions matched your search.</p>
        )}
      </main>

      <section className={styles.contactSection}>
        <div className={styles.contactCard}>
          <h2 className={styles.contactTitle}>Need Further Assistance?</h2>
          <p className={styles.contactSubtitle}>
            Our support team is available 24/7
          </p>
          <div className={styles.contactGrid}>
            <div className={styles.contactMethod}>
              <div className={styles.methodIcon}>📧</div>
              <h3>Email Support</h3>
              <a href="mailto:support@stopcrime.com">support@stopcrime.com</a>
              <p>Average response time: 2 hours</p>
            </div>
            <div className={styles.contactMethod}>
              <div className={styles.methodIcon}>📞</div>
              <h3>Emergency Hotline</h3>
              <a href="tel:111-222-555">111-222-555</a>
              <p>24/7 crisis support line</p>
            </div>
            <div className={styles.contactMethod}>
              <div className={styles.methodIcon}>💬</div>
              <h3>Live Chat</h3>
              <button
                className={styles.chatButton}
                onClick={() => setIsChatOpen(true)}
              >
                Start Chat
              </button>
              <p>Available Mon-Fri 8AM-8PM EST</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;

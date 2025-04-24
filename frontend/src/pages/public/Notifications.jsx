import React from "react";
import styles from "./Notifications.module.css";
import { 
    FiAlertTriangle, 
    FiInfo, 
    FiCheckCircle, 
    FiClock, 
    FiAlertCircle,
    FiBell,
    FiEye,
    FiArchive
} from "react-icons/fi";

const Notifications = () => {
    const notifications = [
        {
            id: 1,
            type: "alert",
            title: "Crime Alert",
            message: "Armed robbery reported near Main Street and 7th Avenue. Suspect is described as wearing a red hoodie. Avoid the area and report any suspicious activity immediately.",
            timestamp: "10 minutes ago",
            read: false
        },
        {
            id: 2,
            type: "success",
            title: "Case Resolved",
            message: "The suspect in the downtown mugging case has been apprehended. Thanks to community members who provided tips leading to this arrest.",
            timestamp: "30 minutes ago",
            read: true
        },
        {
            id: 3,
            type: "warning",
            title: "Unverified Report",
            message: "Vandalism reported near City Park playground. This report requires additional verification from other users before being escalated to authorities.",
            timestamp: "1 hour ago",
            read: true
        },
        {
            id: 4,
            type: "info",
            title: "Safety Update",
            message: "New safety cameras have been installed in the downtown area as part of our community safety initiative. These will be operational starting next week.",
            timestamp: "2 hours ago",
            read: false
        }
    ];

    const getNotificationIcon = (type) => {
        switch(type) {
            case "alert":
                return <FiAlertCircle className={styles.notificationIcon} />;
            case "warning":
                return <FiAlertTriangle className={styles.notificationIcon} />;
            case "info":
                return <FiInfo className={styles.notificationIcon} />;
            case "success":
                return <FiCheckCircle className={styles.notificationIcon} />;
            default:
                return <FiBell className={styles.notificationIcon} />;
        }
    };

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Notifications Center</h1>
                <p className={styles.subtitle}>Important alerts and community updates</p>
            </header>
            
            {notifications.length > 0 ? (
                <div className={styles.list}>
                    {notifications.map((notification) => (
                        <article 
                            key={notification.id} 
                            className={`${styles.notification} ${styles[notification.type]}`}
                        >
                            <div className={styles.content}>
                                <h3 className={styles.notificationTitle}>
                                    {getNotificationIcon(notification.type)}
                                    {notification.title}
                                </h3>
                                <p className={styles.message}>{notification.message}</p>
                            </div>
                            
                            <div className={styles.meta}>
                                <span className={styles.timestamp}>
                                    <FiClock />
                                    {notification.timestamp}
                                </span>
                                {!notification.read && (
                                    <span className={styles.unreadBadge}>New</span>
                                )}
                            </div>
                            
                            <div className={styles.actions}>
                                <button className={`${styles.actionButton} ${styles.primary}`}>
                                    <FiEye /> View Details
                                </button>
                                <button className={`${styles.actionButton} ${styles.secondary}`}>
                                    <FiArchive /> Archive
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <FiBell className={styles.emptyIcon} />
                    <h3 className={styles.emptyTitle}>No notifications</h3>
                    <p className={styles.emptyMessage}>
                        You're all caught up! When new alerts or updates arrive, they'll appear here.
                    </p>
                </div>
            )}
        </main>
    );
};

export default Notifications;
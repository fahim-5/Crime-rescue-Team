import React from 'react';
import PropTypes from 'prop-types';
import styles from './PendingCases.module.css';

const dummyCases = [
  {
    id: 'PC-2023-001',
    title: 'Armed Robbery at City Bank',
    reportedDate: '2023-10-15T08:30:00',
    location: 'Dhaka-Motijheel',
    status: 'Under Investigation',
    priority: 'High',
    assignedTo: 'Detective Rahman',
    progress: 65
  },
  {
    id: 'PC-2023-002',
    title: 'Hit and Run Accident',
    reportedDate: '2023-10-16T14:20:00',
    location: 'Dhaka-Gulshan Avenue',
    status: 'Evidence Collection',
    priority: 'Medium',
    assignedTo: 'Officer Khan',
    progress: 40
  },
  {
    id: 'PC-2023-003',
    title: 'Shop Burglary Report',
    reportedDate: '2023-10-17T22:45:00',
    location: 'Dhaka-Dhanmondi Rd 8',
    status: 'Initial Review',
    priority: 'Medium',
    assignedTo: 'Sergeant Akter',
    progress: 20
  },
  {
    id: 'PC-2023-004',
    title: 'Cyber Crime Complaint',
    reportedDate: '2023-10-18T11:15:00',
    location: 'Online',
    status: 'Digital Forensics',
    priority: 'High',
    assignedTo: 'Tech Specialist Hossain',
    progress: 35
  },
  {
    id: 'PC-2023-005',
    title: 'Domestic Violence Case',
    reportedDate: '2023-10-19T09:30:00',
    location: 'Dhaka-Mirpur Sec 12',
    status: 'Witness Interviews',
    priority: 'Urgent',
    assignedTo: 'Inspector Chowdhury',
    progress: 80
  }
];

const PendingCases = ({ cases = dummyCases }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Pending Cases</h2>
          <p className={styles.subtitle}>Active investigations requiring attention</p>
        </div>
        <div className={styles.caseCount}>
          <span className={styles.countNumber}>{cases.length}</span>
          <span className={styles.countLabel}>Active Cases</span>
        </div>
      </div>
      
      <div className={styles.caseGrid}>
        {cases.length > 0 ? (
          cases.map((caseItem) => (
            <div key={caseItem.id} className={`${styles.caseCard} ${styles[caseItem.priority.toLowerCase()]}`}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.caseTitle}>{caseItem.title}</h3>
                  <span className={styles.caseId}>{caseItem.id}</span>
                </div>
                <span className={styles.priorityBadge}>
                  {caseItem.priority}
                </span>
              </div>
              
              <div className={styles.caseDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Reported:</span>
                  <span className={styles.detailValue}>
                    {new Date(caseItem.reportedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Location:</span>
                  <span className={styles.detailValue}>{caseItem.location}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Assigned To:</span>
                  <span className={styles.detailValue}>{caseItem.assignedTo}</span>
                </div>
                
                <div className={styles.progressContainer}>
                  <div className={styles.progressLabels}>
                    <span>Progress</span>
                    <span>{caseItem.progress}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${caseItem.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className={styles.statusContainer}>
                  <span className={styles.statusLabel}>Status:</span>
                  <span className={styles.statusValue}>{caseItem.status}</span>
                </div>
              </div>
              
              <div className={styles.cardFooter}>
                <button className={`${styles.actionButton} ${styles.viewButton}`}>
                  <i className="fas fa-search"></i> Investigate
                </button>
                <button className={`${styles.actionButton} ${styles.resolveButton}`}>
                  <i className="fas fa-check"></i> Resolve
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <i className="fas fa-check-circle"></i>
            <h3>No Pending Cases</h3>
            <p>All cases have been resolved</p>
          </div>
        )}
      </div>
    </div>
  );
};

PendingCases.propTypes = {
  cases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      reportedDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      location: PropTypes.string,
      status: PropTypes.string,
      priority: PropTypes.oneOf(['Low', 'Medium', 'High', 'Urgent']),
      assignedTo: PropTypes.string,
      progress: PropTypes.number
    })
  )
};

export default PendingCases;
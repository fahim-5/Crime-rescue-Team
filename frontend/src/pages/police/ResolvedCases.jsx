import React from 'react';
import PropTypes from 'prop-types';
import styles from './ResolvedCases.module.css';

const dummyCases = [
  {
    id: 'RC-1001',
    title: 'Burglary at Central Market',
    resolvedDate: '2023-05-15T10:30:00',
    location: 'Dhaka-Mirpur',
    status: 'Closed',
    officer: 'Inspector Rahman',
    method: 'Arrest & Conviction'
  },
  {
    id: 'RC-1002',
    title: 'Vehicle Theft Case',
    resolvedDate: '2023-06-22T14:45:00',
    location: 'Dhaka-Gulshan',
    status: 'Closed',
    officer: 'Sergeant Khan',
    method: 'Recovery & Settlement'
  },
  {
    id: 'RC-1003',
    title: 'Cyber Fraud Investigation',
    resolvedDate: '2023-07-10T09:15:00',
    location: 'Dhaka-Dhanmondi',
    status: 'Closed',
    officer: 'Detective Akter',
    method: 'Digital Evidence'
  },
  {
    id: 'RC-1004',
    title: 'Public Disturbance Complaint',
    resolvedDate: '2023-08-05T16:20:00',
    location: 'Dhaka-Uttara',
    status: 'Closed',
    officer: 'Officer Hossain',
    method: 'Mediation'
  }
];

const ResolvedCases = ({ cases = dummyCases }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Resolved Cases</h2>
        <div className={styles.stats}>
          <span className={styles.statItem}>
            <i className="fas fa-check-circle"></i> {cases.length} Closed Cases
          </span>
          <span className={styles.statItem}>
            <i className="fas fa-trophy"></i> 92% Success Rate
          </span>
        </div>
      </div>
      
      <div className={styles.caseGrid}>
        {cases.length > 0 ? (
          cases.map((caseItem) => (
            <div key={caseItem.id} className={styles.caseCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.caseTitle}>{caseItem.title}</h3>
                <span className={styles.statusBadge}>
                  <i className="fas fa-check"></i> {caseItem.status}
                </span>
              </div>
              
              <div className={styles.caseDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Case ID:</span>
                  <span className={styles.detailValue}>{caseItem.id}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Resolved:</span>
                  <span className={styles.detailValue}>
                    {new Date(caseItem.resolvedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Location:</span>
                  <span className={styles.detailValue}>{caseItem.location}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Handled By:</span>
                  <span className={styles.detailValue}>{caseItem.officer}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Resolution:</span>
                  <span className={styles.detailValue}>{caseItem.method}</span>
                </div>
              </div>
              
              <div className={styles.cardFooter}>
                <button className={`${styles.actionButton} ${styles.viewButton}`}>
                  <i className="fas fa-file-alt"></i> Full Details
                </button>
                <button className={`${styles.actionButton} ${styles.reopenButton}`}>
                  <i className="fas fa-undo"></i> Reopen
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <i className="fas fa-check-circle"></i>
            <h3>No Resolved Cases</h3>
            <p>All cases are currently pending investigation</p>
          </div>
        )}
      </div>
    </div>
  );
};

ResolvedCases.propTypes = {
  cases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      resolvedDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      location: PropTypes.string,
      status: PropTypes.string,
      officer: PropTypes.string,
      method: PropTypes.string
    })
  )
};

export default ResolvedCases;
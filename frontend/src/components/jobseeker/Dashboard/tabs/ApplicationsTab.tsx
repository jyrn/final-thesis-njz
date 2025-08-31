import React, { useState, useEffect } from 'react';
import { auth } from '../../../../config/firebase';
import styles from '../../../../pages/jobseeker/Dashboard.module.css';
import { FiFileText, FiClock, FiCheck, FiX, FiEye } from 'react-icons/fi';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  updatedAt: string;
}

const ApplicationsTab: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch('http://localhost:3001/api/applications/jobseeker', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      if (data.success) {
        setApplications(data.data);
      } else {
        setError(data.error || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock className={styles.statusIconPending} />;
      case 'approved':
        return <FiCheck className={styles.statusIconApproved} />;
      case 'rejected':
        return <FiX className={styles.statusIconRejected} />;
      default:
        return <FiClock className={styles.statusIconPending} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>My Applications</h1>
          <p className={styles.pageSubtitle}>Track your job application progress</p>
        </div>
        <div className={styles.loadingState}>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>My Applications</h1>
          <p className={styles.pageSubtitle}>Track your job application progress</p>
        </div>
        <div className={styles.errorState}>
          <p>Error: {error}</p>
          <button onClick={fetchApplications} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>My Applications</h1>
        <p className={styles.pageSubtitle}>Track your job application progress</p>
      </div>
      
      {applications.length === 0 ? (
        <div className={styles.emptyState}>
          <FiFileText size={48} className={styles.emptyIcon} />
          <h3>No applications yet</h3>
          <p>Your job applications will appear here</p>
        </div>
      ) : (
        <div className={styles.applicationsGrid}>
          {applications.map((application) => (
            <div key={application.id} className={styles.applicationCard}>
              <div className={styles.applicationHeader}>
                <h3 className={styles.jobTitle}>{application.jobTitle}</h3>
                <div className={styles.statusBadge}>
                  {getStatusIcon(application.status)}
                  <span className={`${styles.statusText} ${styles[`status${application.status.charAt(0).toUpperCase() + application.status.slice(1)}`]}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className={styles.applicationDetails}>
                <p className={styles.company}>{application.company}</p>
                <p className={styles.location}>{application.location}</p>
                <p className={styles.salary}>{application.salary}</p>
                <p className={styles.type}>{application.type}</p>
              </div>
              
              <div className={styles.applicationFooter}>
                <span className={styles.appliedDate}>
                  Applied: {formatDate(application.appliedDate)}
                </span>
                <button className={styles.viewButton}>
                  <FiEye size={16} />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsTab;

import React, { useState } from 'react';
import { JobPosting } from '@/types/dashboard';
import { FiX, FiMapPin, FiClock, FiUsers, FiCalendar, FiBriefcase, FiTag, FiEdit3, FiSave, FiEdit2, FiTrash2 } from 'react-icons/fi';
import styles from './JobDetailsModal.module.css';

interface JobDetailsModalProps {
  job: JobPosting;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (job: JobPosting) => void;
  onDelete: (job: JobPosting) => void;
  onUpdateJob?: (jobData: Partial<JobPosting>) => void;
  onViewApplicants?: (job: JobPosting) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = (props) => {
  
  const {
    job,
    isOpen,
    onClose,
    onEdit,
    onDelete,
    onUpdateJob,
    onViewApplicants
  } = props;
  
  // Create a stable reference to the onViewApplicants function
  const handleViewApplicantsClick = React.useCallback((e: React.MouseEvent, job: JobPosting) => {
    e.stopPropagation();
    
    if (onViewApplicants) {
      onViewApplicants(job);
      onClose(); // Close the modal after navigating to applicants
    }
  }, [onViewApplicants, onClose]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  
  // Update edited description when job changes
  React.useEffect(() => {
    if (job?.description) {
      setEditedDescription(job.description);
    }
  }, [job]);
  
  if (!isOpen || !job) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'paused':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'closed':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.jobInfo}>
            <div className={styles.jobIcon}>
              <FiBriefcase size={36} />
            </div>
            <div className={styles.jobDetails}>
              <h2 className={styles.jobTitle}>{job.title}</h2>
              <p className={styles.jobLocation}>{job.location}</p>
              <div className={styles.jobMeta}>
                <span className={styles.location}>
                  <FiMapPin size={14} />
                  {job.type}
                </span>
                <span 
                  className={styles.statusBadge} 
                  style={getStatusColor(job.status)}
                >
                  {job.status}
                </span>
              </div>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className={styles.metaSection}>
          <div className={styles.metaItem}>
            <FiBriefcase className={styles.metaIcon} />
            <span>{job.department || 'Engineering'}</span>
          </div>
          <div className={styles.metaItem}>
            <FiClock className={styles.metaIcon} />
            <span>{job.type}</span>
          </div>
          <div className={styles.metaItem}>
            <FiTag className={styles.metaIcon} />
            <span>{job.salary}</span>
          </div>
          <div className={styles.metaItem}>
            <FiCalendar className={styles.metaIcon} />
            <span>Posted {formatDate(job.postedDate || job.posted)}</span>
          </div>
          <div 
            className={`${styles.metaItem} ${styles.clickable}`}
            onClick={(e) => handleViewApplicantsClick(e, job)}
          >
            <FiUsers className={styles.metaIcon} />
            <span>{job.applicants} applicants</span>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Job Description</h3>
          <div className={styles.description}>
            <div className={styles.descriptionContent}>
              <p>{job.description || 'No description available.'}</p>
            </div>
          </div>
        </div>

        {job.requirements && job.requirements.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Requirements</h3>
            <div className={styles.requirements}>
              {job.requirements.map((req, index) => (
                <span key={index} className={styles.requirementTag}>
                  {req}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.responsibilities && job.responsibilities.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Key Responsibilities</h3>
            <ul className={styles.responsibilities}>
              {job.responsibilities.map((resp, index) => (
                <li key={index}>{resp}</li>
              ))}
            </ul>
          </div>
        )}

        {job.benefits && job.benefits.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>What We Offer</h3>
            <ul className={styles.benefits}>
              {job.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.modalActions}>
          <button 
            className={styles.editButton}
            onClick={() => onEdit(job)}
          >
            <FiEdit3 />
            Edit Job
          </button>
          <button 
            className={styles.deleteButton}
            onClick={() => onDelete(job)}
          >
            <FiTrash2 />
            Delete Job
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  FiX, 
  FiMapPin, 
  FiClock, 
  FiBriefcase, 
  FiUsers, 
  FiDollarSign,
  FiCalendar,
  FiEdit2,
  FiTrash2
} from 'react-icons/fi';
import { JobPosting } from '@/types/dashboard';
import styles from './JobDetailsModal.module.css';

interface JobDetailsModalProps {
  job: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (job: JobPosting) => void;
  onDelete: (job: JobPosting) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
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
          <div className={styles.headerLeft}>
            <h2 className={styles.jobTitle}>{job.title}</h2>
            <span 
              className={styles.statusBadge} 
              style={getStatusColor(job.status)}
            >
              {job.status}
            </span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.jobMeta}>
          <div className={styles.metaItem}>
            <FiMapPin className={styles.metaIcon} />
            <span>{job.location}</span>
          </div>
          <div className={styles.metaItem}>
            <FiBriefcase className={styles.metaIcon} />
            <span>{job.type}</span>
          </div>
          <div className={styles.metaItem}>
            <FiDollarSign className={styles.metaIcon} />
            <span>₱{job.salary}</span>
          </div>
          <div className={styles.metaItem}>
            <FiCalendar className={styles.metaIcon} />
            <span>Posted {formatDate(job.posted)}</span>
          </div>
          <div className={styles.metaItem}>
            <FiUsers className={styles.metaIcon} />
            <span>{job.applicants} applicants</span>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Job Description</h3>
          <div className={styles.description}>
            <p>
              We are looking for a talented {job.title} to join our dynamic team. 
              This is an excellent opportunity to work on exciting projects and grow your career 
              in a collaborative environment.
            </p>
            <p>
              The successful candidate will be responsible for developing and maintaining 
              high-quality software solutions, collaborating with cross-functional teams, 
              and contributing to our innovative products.
            </p>
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

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Key Responsibilities</h3>
          <ul className={styles.responsibilities}>
            <li>Develop and maintain software applications using modern technologies</li>
            <li>Collaborate with designers and product managers to implement features</li>
            <li>Write clean, maintainable, and well-documented code</li>
            <li>Participate in code reviews and contribute to team knowledge sharing</li>
            <li>Stay updated with industry trends and best practices</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>What We Offer</h3>
          <ul className={styles.benefits}>
            <li>Competitive salary package</li>
            <li>Health and wellness benefits</li>
            <li>Flexible working arrangements</li>
            <li>Professional development opportunities</li>
            <li>Collaborative and inclusive work environment</li>
          </ul>
        </div>

        <div className={styles.modalActions}>
          <button 
            className={styles.editButton}
            onClick={() => onEdit(job)}
          >
            <FiEdit2 />
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

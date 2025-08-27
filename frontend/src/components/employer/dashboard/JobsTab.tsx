import React from 'react';
import { JobCard } from './JobCard';
import { FiPlus, FiBriefcase } from 'react-icons/fi';
import { JobPosting } from '@/types/dashboard';
import styles from './JobsTab.module.css';

interface JobsTabProps {
  jobs: JobPosting[];
  searchTerm: string;
  filters: {
    status: string;
    department: string;
    location: string;
  };
  onSearchChange: (term: string) => void;
  onFilterChange: (filterType: string, value: string) => void;
  onViewJob: (job: JobPosting) => void;
  onEditJob: (job: JobPosting) => void;
  onDeleteJob: (jobId: number) => void;
  onCreateJob?: () => void;
  isLoading?: boolean;
}

export const JobsTab: React.FC<JobsTabProps> = ({
  jobs,
  searchTerm,
  filters,
  onSearchChange,
  onFilterChange,
  onViewJob,
  onEditJob,
  onDeleteJob,
  onCreateJob,
  isLoading = false,
}) => {
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filters.status || filters.status === 'all' || job.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <FiBriefcase className={styles.emptyStateIcon} />
      <h3 className={styles.emptyStateTitle}>
        {searchTerm || filters.status ? 'No jobs found' : 'No job postings yet'}
      </h3>
      <p className={styles.emptyStateDescription}>
        {searchTerm || filters.status 
          ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
          : 'Start building your team by creating your first job posting. Attract top talent with detailed job descriptions and competitive offers.'
        }
      </p>
      {(!searchTerm && !filters.status) && (
        <button className={styles.emptyStateButton} onClick={onCreateJob}>
          <FiPlus />
          Create Your First Job
        </button>
      )}
    </div>
  );

  const renderLoadingState = () => (
    <div className={styles.loadingState}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Loading job postings...</p>
    </div>
  );

  return (
    <div className={styles.jobsTab}>
      <div className={styles.header}>
        <h1 className={styles.title}>All Job Posts</h1>
        <div className={styles.headerControls}>
          <select 
            className={styles.filterSelect}
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="all">All Jobs</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
          <button className={styles.createJobButton} onClick={onCreateJob}>
            <FiPlus />
            Post New Job
          </button>
        </div>
      </div>

      {isLoading ? (
        renderLoadingState()
      ) : filteredJobs.length > 0 ? (
        <div className={styles.jobsGrid}>
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onView={onViewJob}
              onEdit={onEditJob}
              onDelete={onDeleteJob}
            />
          ))}
        </div>
      ) : (
        renderEmptyState()
      )}
    </div>
  );
};
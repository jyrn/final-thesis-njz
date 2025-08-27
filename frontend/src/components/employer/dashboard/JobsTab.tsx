import React, { useState } from 'react';
import { JobCard } from './JobCard';
import { JobDetailsModal } from './JobDetailsModal';
import { DeleteJobModal } from './DeleteJobModal';
import { JobFormModal } from './JobFormModal';
import { FiPlus, FiBriefcase } from 'react-icons/fi';
import { JobPosting, Applicant } from '@/types/dashboard';
import styles from './JobsTab.module.css';

interface JobsTabProps {
  jobs: JobPosting[];
  applicants: Applicant[];
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
  onDeleteJob: (jobId: number, hiredApplicantIds?: number[]) => void;
  onCreateJob: (jobData: Partial<JobPosting>) => void;
  onUpdateJob: (jobData: Partial<JobPosting>) => void;
  isLoading?: boolean;
}

export const JobsTab: React.FC<JobsTabProps> = ({
  jobs,
  applicants,
  searchTerm,
  filters,
  onSearchChange,
  onFilterChange,
  onViewJob,
  onEditJob,
  onDeleteJob,
  onCreateJob,
  onUpdateJob,
  isLoading = false,
}) => {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<JobPosting | null>(null);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filters.status || filters.status === 'all' || job.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  const handleJobCardClick = (job: JobPosting) => {
    setSelectedJob(job);
    setIsDetailsModalOpen(true);
  };

  const handleEditJob = (job: JobPosting) => {
    setJobToEdit(job);
    setIsDetailsModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleDeleteJob = (job: JobPosting) => {
    setJobToDelete(job);
    setIsDetailsModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (jobId: number, hiredApplicantIds: number[]) => {
    onDeleteJob(jobId, hiredApplicantIds);
    setIsDeleteModalOpen(false);
    setJobToDelete(null);
  };

  const handleCreateJob = () => {
    setJobToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleSaveJob = (jobData: Partial<JobPosting>) => {
    if (jobToEdit) {
      onUpdateJob(jobData);
    } else {
      onCreateJob(jobData);
    }
    setIsFormModalOpen(false);
    setJobToEdit(null);
  };

  const closeModals = () => {
    setIsDetailsModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsFormModalOpen(false);
    setSelectedJob(null);
    setJobToDelete(null);
    setJobToEdit(null);
  };

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
          <button 
            className={styles.createButton}
            onClick={handleCreateJob}
          >    
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
              onClick={handleJobCardClick}
              onView={onViewJob}
              onEdit={onEditJob}
              onDelete={(jobId) => {
                const job = jobs.find(j => j.id === jobId);
                if (job) handleDeleteJob(job);
              }}
            />
          ))}
        </div>
      ) : (
        renderEmptyState()
      )}
      
      <JobDetailsModal
        job={selectedJob}
        isOpen={isDetailsModalOpen}
        onClose={closeModals}
        onEdit={handleEditJob}
        onDelete={handleDeleteJob}
      />
      
      <DeleteJobModal
        job={jobToDelete}
        applicants={applicants}
        isOpen={isDeleteModalOpen}
        onClose={closeModals}
        onConfirmDelete={handleConfirmDelete}
      />
      
      <JobFormModal
        job={jobToEdit}
        isOpen={isFormModalOpen}
        onClose={closeModals}
        onSave={handleSaveJob}
        isEditing={!!jobToEdit}
      />
    </div>
  );
};
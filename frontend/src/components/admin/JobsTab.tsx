import React from 'react';
import { Job } from '../../types/admin';
import JobCard from './JobCard';

interface JobsTabProps {
  jobs: Job[];
  onJobStatusChange?: (jobId: string, status: string) => void;
}

const JobsTab: React.FC<JobsTabProps> = ({ jobs, onJobStatusChange }) => {
  return (
    <div className="admin-content">
      <div className="section-header">
        <h2>Job Management</h2>
        <p>Monitor and manage job postings</p>
      </div>

      <div className="jobs-list">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            onStatusChange={onJobStatusChange}
          />
        ))}
      </div>
    </div>
  );
};

export default JobsTab;

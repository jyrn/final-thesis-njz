import React from 'react';
import { Job } from '../../types/admin';

interface JobCardProps {
  job: Job;
  onStatusChange?: (jobId: string, status: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onStatusChange }) => {
  return (
    <div className="job-card">
      <div className="job-info">
        <h4>{job.title}</h4>
        <p>{job.employerUid?.companyName}</p>
        <span className={`job-status ${job.status}`}>
          {job.status}
        </span>
      </div>
      <div className="job-meta">
        <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default JobCard;

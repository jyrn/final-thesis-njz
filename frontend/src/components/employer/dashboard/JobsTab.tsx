import React from 'react';
import { JobCard } from './JobCard';
import { SearchAndFilter } from './SearchAndFilter';
import Button from '../ui/Button';
import { FiPlus } from 'react-icons/fi';
import { JobPosting } from '@/types/dashboard';

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
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Job Postings</h2>
        <Button onClick={onCreateJob}>
          <FiPlus className="mr-2 h-4 w-4" />
          Post New Job
        </Button>
      </div>

      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
        filters={filters}
      />

      <div className="space-y-4">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onView={onViewJob}
              onEdit={onEditJob}
              onDelete={onDeleteJob}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No jobs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
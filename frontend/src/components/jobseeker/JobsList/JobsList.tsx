import React, { useState } from 'react'
import JobCard from '../JobCard/JobCard'
import FilterModal from '../FilterModal/FilterModal'
import { FiFilter } from 'react-icons/fi'
import styles from './JobsList.module.css'
import { Job } from '../../../types/Job'

interface JobsListProps {
  jobs: Job[]
  title?: string
  onSaveJob?: (jobId: number) => void
  onApplyJob?: (jobId: number) => void
  onJobClick?: (job: Job) => void
  savedJobs?: Set<number>
}

const JobsList: React.FC<JobsListProps> = ({
  jobs,
  title = "Recommended Jobs",
  onSaveJob,
  onApplyJob,
  onJobClick,
  savedJobs = new Set()
}) => {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    lastUpdate: 'Any time',
    workplaceType: 'On-site',
    jobType: ['Full-time'],
    positionLevel: ['Senior'],
    location: {
      withinKm: 10,
      nearMe: true,
      withinCountry: false,
      international: false,
      remote: false
    },
    salary: {
      min: 15000,
      max: 25000
    }
  })
  return (
    <div className={styles.jobsSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <button 
          className={styles.filterButton}
          onClick={() => setShowFilters(true)}
          aria-label="Filter jobs"
        >
          <FiFilter className={styles.filterIcon} />
          <span>Filters</span>
        </button>
      </div>
      
      <FilterModal 
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          // Here you would typically filter the jobs based on the new filters
          // For example: filterJobs(newFilters);
        }}
      />
      
      <div className={styles.jobsList}>
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onSave={onSaveJob}
            onApply={onApplyJob}
            onJobClick={onJobClick}
            isSaved={savedJobs.has(job.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default JobsList

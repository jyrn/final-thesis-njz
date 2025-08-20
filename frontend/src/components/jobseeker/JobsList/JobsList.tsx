import React from 'react'
import JobCard from '../JobCard/JobCard'
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
  return (
    <div className={styles.jobsSection}>
      <h3 className={styles.sectionTitle}>{title}</h3>
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

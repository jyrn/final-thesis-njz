import React from 'react';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const recommendedJobs = [
    {
      id: 1,
      title: 'Front-End Developer',
      company: 'TechWorks Inc.',
      location: 'Lipa City',
      salary: '₱25,000/mo',
      match: 95,
    },
    {
      id: 2,
      title: 'Graphic Designer',
      company: 'Creative Hub',
      location: 'Batangas City',
      salary: '₱20,000/mo',
      match: 88,
    },
  ];

  const savedJobs = [
    {
      id: 3,
      title: 'IT Support Staff',
      company: 'Helpdesk Pro',
    },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>Job Seeker Dashboard</h2>

      {/* Recommended Jobs */}
      <section>
        <h3 className={styles.sectionTitle}>Recommended Jobs</h3>
        <div className={styles.cardGrid}>
          {recommendedJobs.map((job) => (
            <div key={job.id} className={styles.card}>
              <div>
                <h4 className={styles.jobTitle}>{job.title}</h4>
                <p className={styles.company}>{job.company}</p>
                <p className={styles.meta}>{job.location}</p>
                <p className={styles.meta}>Salary: {job.salary}</p>
                <p className={styles.match}>{job.match}% Match</p>
              </div>
              <button className={styles.applyButton}>Apply</button>
            </div>
          ))}
        </div>
      </section>

      {/* Saved Jobs */}
      <section>
        <h3 className={styles.sectionTitle}>Saved Jobs</h3>
        <div className={styles.savedGrid}>
          {savedJobs.length > 0 ? (
            savedJobs.map((job) => (
              <div key={job.id} className={styles.savedCard}>
                <div>
                  <h4 className={styles.jobTitle}>{job.title}</h4>
                  <p className={styles.company}>{job.company}</p>
                </div>
                <button className={styles.viewButton}>View</button>
              </div>
            ))
          ) : (
            <p className={styles.meta}>No saved jobs yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

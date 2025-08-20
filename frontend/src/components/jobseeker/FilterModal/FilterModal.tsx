import React from 'react'
import { FiX, FiMapPin } from 'react-icons/fi'
import styles from './FilterModal.module.css'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterOptions) => void
}

interface FilterOptions {
  lastUpdate: string
  workplaceType: string
  jobType: string[]
  positionLevel: string[]
  location: {
    withinKm: number
    nearMe: boolean
    withinCountry: boolean
    international: boolean
    remote: boolean
  }
  salary: {
    min: number
    max: number
  }
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply }) => {
  const [filters, setFilters] = React.useState<FilterOptions>({
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

  if (!isOpen) return null

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  const handleReset = () => {
    setFilters({
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
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={onClose}>
            <FiX />
          </button>
          <h2 className={styles.title}>Filter</h2>
          <div></div>
        </div>

        <div className={styles.content}>
          {/* Last Update */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>Last update</h3>
            <div className={styles.radioGroup}>
              {['Recent', 'Last week', 'Last month', 'Any time'].map((option) => (
                <label key={option} className={styles.radioOption}>
                  <input
                    type="radio"
                    name="lastUpdate"
                    value={option}
                    checked={filters.lastUpdate === option}
                    onChange={(e) => setFilters({...filters, lastUpdate: e.target.value})}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Type of workplace */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>Type of workplace</h3>
            <div className={styles.radioGroup}>
              {['On-site', 'Hybrid', 'Remote'].map((option) => (
                <label key={option} className={styles.radioOption}>
                  <input
                    type="radio"
                    name="workplaceType"
                    value={option}
                    checked={filters.workplaceType === option}
                    onChange={(e) => setFilters({...filters, workplaceType: e.target.value})}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Job type */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>Job type</h3>
            <div className={styles.chipGroup}>
              {['Apprenticeship', 'Part-time', 'Full-time', 'Contract', 'Project-based'].map((option) => (
                <button
                  key={option}
                  className={`${styles.chip} ${filters.jobType.includes(option) ? styles.chipActive : ''}`}
                  onClick={() => {
                    const newJobTypes = filters.jobType.includes(option)
                      ? filters.jobType.filter(t => t !== option)
                      : [...filters.jobType, option]
                    setFilters({...filters, jobType: newJobTypes})
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Position level */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>Position level</h3>
            <div className={styles.chipGroup}>
              {['Junior', 'Senior', 'Leader', 'Manager'].map((option) => (
                <button
                  key={option}
                  className={`${styles.chip} ${filters.positionLevel.includes(option) ? styles.chipActive : ''}`}
                  onClick={() => {
                    const newLevels = filters.positionLevel.includes(option)
                      ? filters.positionLevel.filter(l => l !== option)
                      : [...filters.positionLevel, option]
                    setFilters({...filters, positionLevel: newLevels})
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>Location</h3>
            <div className={styles.locationOptions}>
              <label className={styles.checkboxOption}>
                <input
                  type="checkbox"
                  checked={filters.location.nearMe}
                  onChange={(e) => setFilters({
                    ...filters, 
                    location: {...filters.location, nearMe: e.target.checked}
                  })}
                />
                <span>Near Me</span>
              </label>
              
              <div className={styles.rangeContainer}>
                <div className={styles.rangeLabels}>
                  <span>5km</span>
                  <span>20km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={filters.location.withinKm}
                  onChange={(e) => setFilters({
                    ...filters,
                    location: {...filters.location, withinKm: parseInt(e.target.value)}
                  })}
                  className={styles.rangeSlider}
                />
              </div>

              {['Within the Country', 'International / Global', 'Remote / Work from Home'].map((option, index) => {
                const key = ['withinCountry', 'international', 'remote'][index] as keyof typeof filters.location
                return (
                  <label key={option} className={styles.checkboxOption}>
                    <input
                      type="checkbox"
                      checked={filters.location[key] as boolean}
                      onChange={(e) => setFilters({
                        ...filters,
                        location: {...filters.location, [key]: e.target.checked}
                      })}
                    />
                    <span>{option}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Salary */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>Salary</h3>
            <div className={styles.rangeContainer}>
              <div className={styles.rangeLabels}>
                <span>$15k</span>
                <span>$25k</span>
              </div>
              <div className={styles.dualRangeSlider}>
                <input
                  type="range"
                  min="15000"
                  max="25000"
                  value={filters.salary.min}
                  onChange={(e) => setFilters({
                    ...filters,
                    salary: {...filters.salary, min: parseInt(e.target.value)}
                  })}
                  className={styles.rangeSlider}
                />
                <input
                  type="range"
                  min="15000"
                  max="25000"
                  value={filters.salary.max}
                  onChange={(e) => setFilters({
                    ...filters,
                    salary: {...filters.salary, max: parseInt(e.target.value)}
                  })}
                  className={styles.rangeSlider}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.resetButton} onClick={handleReset}>
            Reset
          </button>
          <button className={styles.applyButton} onClick={handleApply}>
            APPLY NOW
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterModal

import React, { useState } from 'react';
import { HiCheckCircle, HiDocumentText, HiUsers, HiX, HiFilter, HiSearch } from 'react-icons/hi';
import { PendingEmployer } from '../../types/admin';
import EmployerCard from './EmployerCard';
import DocumentViewer from './DocumentViewer';
import './EmployersTab.css';

interface EmployersTabProps {
  pendingEmployers: PendingEmployer[];
  onEmployerAction: (employerId: string, action: 'approve' | 'reject', reason?: string) => void;
  loading?: boolean;
}

const EmployersTab: React.FC<EmployersTabProps> = ({
  pendingEmployers,
  onEmployerAction,
  loading = false
}) => {
  const [expandedEmployer, setExpandedEmployer] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleToggleEmployer = (employerId: string) => {
    setExpandedEmployer(expandedEmployer === employerId ? null : employerId);
  };

  // Filter employers based on status and search term
  const filteredEmployers = pendingEmployers.filter(employer => {
    // Status filter
    const statusMatch = statusFilter === 'all' || employer.accountStatus === statusFilter;
    
    // Search filter
    const searchMatch = searchTerm === '' || 
      employer.userId?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  // Get counts for each status
  const statusCounts = {
    all: pendingEmployers.length,
    pending: pendingEmployers.filter(e => e.accountStatus === 'pending').length,
    verified: pendingEmployers.filter(e => e.accountStatus === 'verified').length,
    rejected: pendingEmployers.filter(e => e.accountStatus === 'rejected').length
  };


  return (
    <div className="admin-content">
      <div className="section-header">
        <div className="header-content">
          <div>
            <h2>Employer Verification</h2>
            <p>Click on employer cards to view documents and make approval decisions</p>
          </div>
        </div>
        
        <div className="employers-stats">
          <span className="stat-item">
            <HiUsers /> {filteredEmployers.length} of {pendingEmployers.length} Employers
          </span>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-container">
        <div className="search-filter-wrapper">
          {/* Search Bar */}
          <div className="search-section">
            <div className="search-bar">
              <HiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by company name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  <HiX />
                </button>
              )}
            </div>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-header">
              <HiFilter className="filter-icon" />
              <span>Status Filter</span>
            </div>
            <div className="filter-buttons">
              <button
                className={`filter-btn all ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All <span className="count">({statusCounts.all})</span>
              </button>
              <button
                className={`filter-btn pending ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                Pending <span className="count">({statusCounts.pending})</span>
              </button>
              <button
                className={`filter-btn verified ${statusFilter === 'verified' ? 'active' : ''}`}
                onClick={() => setStatusFilter('verified')}
              >
                Approved <span className="count">({statusCounts.verified})</span>
              </button>
              <button
                className={`filter-btn rejected ${statusFilter === 'rejected' ? 'active' : ''}`}
                onClick={() => setStatusFilter('rejected')}
              >
                Rejected <span className="count">({statusCounts.rejected})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="employers-list">
        {(() => {
          console.log('EmployersTab - pendingEmployers:', pendingEmployers);
          return null;
        })()}
        {filteredEmployers.length === 0 ? (
          <div className="empty-state">
            <HiCheckCircle />
            <h3>No {statusFilter === 'all' ? '' : statusFilter} employers found</h3>
            <p>{statusFilter === 'all' ? 'No employer applications to display' : `No ${statusFilter} employers at this time`}</p>
          </div>
        ) : (
          filteredEmployers
            .filter((employer) => employer.documents && employer.documents.length > 0)
            .map((employer) => {
              const isExpanded = expandedEmployer === employer._id;
              return (
                <div key={employer._id} className={`employer-item ${isExpanded ? 'expanded' : ''}`}>
                  <div 
                    className="employer-card-wrapper"
                    onClick={() => handleToggleEmployer(employer._id)}
                  >
                    <EmployerCard
                      employer={employer}
                      onApprove={() => {}} // Disabled - will use bottom buttons
                      onReject={() => {}} // Disabled - will use bottom buttons
                      loading={loading}
                      showActions={false} // Hide actions from card
                    />
                    
                    <div className="employer-summary">
                      <button className="expand-btn">
                        <HiDocumentText />
                        {isExpanded ? 'Hide' : 'View'} Documents ({employer.documents?.length || 0})
                        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
                      </button>
                      
                      <div className="company-status">
                        <span className={`company-status-badge ${employer.accountStatus}`}>
                          {employer.accountStatus.toUpperCase()}
                        </span>
                        {employer.documents && employer.documents.length > 0 && (
                          <span className="document-count">
                            {employer.documents.length} Documents
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="expanded-content">
                      <div className="documents-section">
                        <h4>Review Documents</h4>
                        <DocumentViewer
                          documents={employer.documents || []}
                          loading={loading}
                        />
                      </div>
                      
                      <div className="employer-decision">
                        <div className="decision-info">
                          <h4>Company Verification Decision</h4>
                          <p>After reviewing all documents, approve or reject this company's verification status.</p>
                          <div className="current-status">
                            <strong>Current Status:</strong> 
                            <span className={`status-indicator ${employer.accountStatus}`}>
                              {employer.accountStatus.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        {employer.accountStatus === 'pending' && (
                          <div className="decision-actions">
                            <button 
                              className="decision-btn reject"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('🔴 Reject button clicked for employer:', employer._id);
                                console.log('🔍 Employer data:', employer);
                                onEmployerAction(employer._id, 'reject');
                              }}
                              disabled={loading}
                            >
                              <HiX /> Reject Company
                            </button>
                            <button 
                              className="decision-btn approve"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('🟢 Approve button clicked for employer:', employer._id);
                                console.log('🔍 Employer data:', employer);
                                onEmployerAction(employer._id, 'approve');
                              }}
                              disabled={loading}
                            >
                              <HiCheckCircle /> Approve Company
                            </button>
                          </div>
                        )}
                        {employer.accountStatus !== 'pending' && (
                          <div className="status-message">
                            <p>This company has already been {employer.accountStatus}.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default EmployersTab;

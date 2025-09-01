import React from 'react';
import { HiCheckCircle } from 'react-icons/hi';
import { PendingEmployer } from '../../types/admin';
import EmployerCard from './EmployerCard';

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
  return (
    <div className="admin-content">
      <div className="section-header">
        <h2>Employer Verification</h2>
        <p>Review and approve employer registrations</p>
      </div>

      <div className="employers-list">
        {pendingEmployers.length === 0 ? (
          <div className="empty-state">
            <HiCheckCircle />
            <h3>No pending verifications</h3>
            <p>All employer applications have been processed</p>
          </div>
        ) : (
          pendingEmployers.map((employer) => (
            <EmployerCard
              key={employer._id}
              employer={employer}
              onApprove={(id) => onEmployerAction(id, 'approve')}
              onReject={(id) => onEmployerAction(id, 'reject')}
              loading={loading}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default EmployersTab;

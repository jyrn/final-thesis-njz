import React from 'react';
import { FiEye, FiCheck, FiX } from 'react-icons/fi';
import { PendingEmployer } from '../../types/admin';

interface EmployerCardProps {
  employer: PendingEmployer;
  onApprove: (employerId: string) => void;
  onReject: (employerId: string) => void;
  loading?: boolean;
}

const EmployerCard: React.FC<EmployerCardProps> = ({
  employer,
  onApprove,
  onReject,
  loading = false
}) => {
  return (
    <div className="employer-card">
      <div className="employer-info">
        <h4>{employer.userId.companyName}</h4>
        <p>{employer.userId.email}</p>
        <span className="registration-date">
          Registered: {new Date(employer.userId.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="employer-documents">
        {employer.businessPermitUrl && (
          <a 
            href={employer.businessPermitUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="document-link"
          >
            <FiEye /> Business Permit
          </a>
        )}
        {employer.dtiRegistrationUrl && (
          <a 
            href={employer.dtiRegistrationUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="document-link"
          >
            <FiEye /> DTI Registration
          </a>
        )}
      </div>

      <div className="employer-actions">
        <button
          className="approve-btn"
          onClick={() => onApprove(employer._id)}
          disabled={loading}
        >
          <FiCheck /> Approve
        </button>
        <button
          className="reject-btn"
          onClick={() => onReject(employer._id)}
          disabled={loading}
        >
          <FiX /> Reject
        </button>
      </div>
    </div>
  );
};

export default EmployerCard;

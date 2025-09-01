import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUserCheck } from 'react-icons/fi';
import { AdminUser } from '../../types/admin';

interface AdminManagementTabProps {
  adminUsers: AdminUser[];
  onCreateAdmin: (adminData: any) => void;
  onEditAdmin: (adminId: string, adminData: any) => void;
  onDeleteAdmin: (adminId: string) => void;
}

const AdminManagementTab: React.FC<AdminManagementTabProps> = ({
  adminUsers,
  onCreateAdmin,
  onEditAdmin,
  onDeleteAdmin
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="admin-content">
      <div className="section-header">
        <h2>Admin Management</h2>
        <p>Manage admin users and permissions</p>
        <button 
          className="btn primary"
          onClick={() => setShowCreateForm(true)}
        >
          <FiPlus /> Add Admin
        </button>
      </div>

      <div className="admin-users-list">
        {adminUsers.map((admin) => (
          <div key={admin.uid} className="admin-user-card">
            <div className="admin-user-info">
              <h4>{admin.adminName}</h4>
              <p>{admin.email}</p>
              <span className={`role-badge ${admin.role}`}>
                <FiUserCheck /> {admin.role}
              </span>
              <p className="department">{admin.department}</p>
            </div>
            <div className="admin-user-actions">
              <button 
                className="btn secondary"
                onClick={() => onEditAdmin(admin.uid, admin)}
              >
                <FiEdit2 /> Edit
              </button>
              <button 
                className="btn danger"
                onClick={() => onDeleteAdmin(admin.uid)}
              >
                <FiTrash2 /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminManagementTab;

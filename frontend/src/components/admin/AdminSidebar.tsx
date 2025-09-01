import React from 'react';
import { 
  FiUsers, 
  FiBriefcase, 
  FiFileText, 
  FiTrendingUp, 
  FiLogOut,
  FiSettings,
  FiUserCheck
} from 'react-icons/fi';
import { AdminUser, AdminTab } from '../../types/admin';

interface AdminSidebarProps {
  adminUser: AdminUser;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  adminUser,
  activeTab,
  onTabChange,
  onLogout
}) => {
  const navItems = [
    { id: 'overview' as AdminTab, icon: FiTrendingUp, label: 'Overview' },
    { id: 'employers' as AdminTab, icon: FiBriefcase, label: 'Employer Verification' },
    { id: 'jobs' as AdminTab, icon: FiFileText, label: 'Job Management' },
    { id: 'users' as AdminTab, icon: FiUsers, label: 'User Analytics' },
    ...(adminUser.role === 'superadmin' ? [
      { id: 'admins' as AdminTab, icon: FiUserCheck, label: 'Admin Management' },
      { id: 'settings' as AdminTab, icon: FiSettings, label: 'System Settings' }
    ] : [])
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2>PESO Admin</h2>
        <div className="admin-info">
          <p>{adminUser.adminName}</p>
          <span className="admin-role">{adminUser.role}</span>
        </div>
      </div>

      <nav className="admin-nav">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <IconComponent />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <FiLogOut />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';

interface UsersTabProps {
  // Future: Add analytics data props
}

const UsersTab: React.FC<UsersTabProps> = () => {
  return (
    <div className="admin-content">
      <div className="section-header">
        <h2>User Analytics</h2>
        <p>User registration and activity insights</p>
      </div>

      <div className="analytics-placeholder">
        <FiTrendingUp size={48} />
        <h3>Analytics Dashboard</h3>
        <p>Detailed user analytics and reports will be displayed here</p>
      </div>
    </div>
  );
};

export default UsersTab;

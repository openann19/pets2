import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <p>Administrative controls</p>
      <div style={{ marginTop: '20px' }}>
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '10px' }}>
          User Management
        </div>
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '10px' }}>
          Analytics
        </div>
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '10px' }}>
          Moderation Tools
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

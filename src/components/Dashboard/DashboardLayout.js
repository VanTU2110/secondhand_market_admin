import React from 'react';
import Sidebar from '../Sidebar/Sidebar'; // Chỉnh sửa đường dẫn đúng với cấu trúc của bạn


const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="content">
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;

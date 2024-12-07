import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import { FaHome, FaBox, FaTags, FaClipboardList, FaUser,FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Shops</h2>
      </div>
      <ul>
        <li>
          <Link to="/dashboard"><FaHome /> Dashboard</Link>
        </li>
        <li>
        <Link to="/static"><FaHome /> Thống kê</Link>
        </li>
        <li>
          <Link to="/product"><FaBox /> Sản phẩm</Link>
        </li>
        <li>
          <Link to="/category"><FaTags /> Loại sản phẩm</Link>
        </li>
        <li>
          <Link to="/order"><FaClipboardList /> Đơn hàng</Link>
        </li>
        <li>
          <Link to="/chat"><FaUser /> Chat</Link>
        </li>
        <li>
          <Link to="/login" className="logout-link"><FaSignOutAlt /> Đăng xuất</Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;

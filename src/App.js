import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Đảm bảo import CSS
import RegisterPage from './pages/RegisterPage/RegisterPage';
import LoginPage from './pages/LoginPage/LoginPage';
import CreateShopPage from './pages/CreateShopPage/CreateShopPage';
import SellerUpgradePage from './pages/SellerUpgradePage/SellerUpgradePage';
import DashboardPage from './components/Dashboard/DashboardLayout'; 
import ProductPage from './pages/ProductManagementPage/ProductManagementPage';
import CategoryPage from './pages/CategoryManagementPage/CategoryManagementPage';
import OrderManagementPage from './pages/OrderManagementPage/OrderManagementPage';
const PrivateRoute = ({ element: Component }) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Kiểm tra nếu có token trong localStorage
  return isAuthenticated ? <Component /> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Đặt trang đăng nhập làm trang mặc định */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/seller-upgrade" element={<SellerUpgradePage />} />
        <Route path="/create-shop" element={<CreateShopPage />} />
        
        {/* Các route yêu cầu đăng nhập */}
        <Route path="/dashboard" element={<PrivateRoute element={DashboardPage} />} />
        <Route path="/product" element={<PrivateRoute element={ProductPage} />} />
        <Route path="/category" element={<PrivateRoute element={CategoryPage} />} />
        <Route path="/order" element={<PrivateRoute element={OrderManagementPage} />} />
      </Routes>
      
      {/* ToastContainer dùng để hiển thị toast notifications */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;

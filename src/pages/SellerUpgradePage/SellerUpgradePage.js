import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './SellerUpgradePage.css';

function SellerUpgradePage() {
  const [isSeller, setIsSeller] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkSellerStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login'); // Redirect nếu không có token
          return;
        }
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsSeller(response.data.role === 'seller');
      } catch (error) {
        console.log('Error fetching user profile', error);
        setErrorMessage('Không thể lấy thông tin người dùng.');
      }
    };

    checkSellerStatus();
  }, [navigate]);

  const upgradeToSeller = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login'); // Redirect nếu không có token
        return;
      }
      
      // Giải mã token để lấy id người dùng
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id; // Lấy id từ token

      const response = await axios.put(`http://localhost:5000/api/users/upgrade-to-seller/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage('Tài khoản của bạn đã được nâng cấp thành seller!');
      setIsSeller(true); // Cập nhật trạng thái seller
      setTimeout(() => {
        navigate('/create-shop'); // Chuyển hướng tới trang tạo shop sau 2 giây
      }, 2000);
    } catch (error) {
      console.log('Error upgrading to seller', error);
      setErrorMessage('Có lỗi xảy ra trong quá trình nâng cấp.');
    }
  };

  return (
    <div className="seller-upgrade-container">
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {isSeller ? (
        <p>Bạn đã là seller</p>
      ) : (
        <>
          <h2>Bạn chưa phải là seller</h2>
          <button onClick={upgradeToSeller}>Xác nhận bán hàng</button>
        </>
      )}
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
}

export default SellerUpgradePage;

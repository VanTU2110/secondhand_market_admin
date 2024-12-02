import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Đảm bảo đã cài đặt jwt-decode
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      const token = response.data.token;
  
      await localStorage.setItem('token', response.data.token);
      console.log(token);
      // Giải mã token 
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role; 
      const userId = decodedToken.id; 
  
      if (userRole === 'seller') {
        // Kiểm tra xem người dùng đã có shop chưa
        try {
          const shopResponse = await axios.get(`http://localhost:5000/api/shop/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(shopResponse.data);
          navigate('/dashboard');
        } catch (shopError) {
          // Kiểm tra lỗi 404 nếu shop chưa tồn tại
          if (shopError.response && shopError.response.status === 404) {
            navigate('/create-shop'); // Chuyển tới trang tạo shop
          } else {
            throw shopError; // Nếu là lỗi khác thì ném lỗi ra để xử lý
          }
        }
      } else {
        navigate('/seller-upgrade'); // Chuyển đến trang nâng cấp seller nếu là buyer
      }
    } catch (error) {
      console.log(error);
      setErrorMessage('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-image">
        <p className="image-text">Chợ Tốt, chợ cho người Việt</p>
        </div>
        <div className="login-form">
          <h2>Đăng nhập</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit">Đăng nhập</button>
          </form>
          <div className="register-link">
            <p>Bạn chưa có tài khoản?</p>
            <Link to="/register">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default LoginPage;

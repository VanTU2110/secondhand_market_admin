import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './RegisterPage.css';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { email, password, username, phone, address });
      console.log('Response data', response.data);
      setSuccessMessage('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
      setErrorMessage('');
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.message || 'Đã xảy ra lỗi');
      setSuccessMessage('');
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-image">
          <p className="image-text">Chợ Tốt, chợ cho người Việt</p>
        </div>
        <div className="register-form">
          <h2>Đăng ký</h2>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Tên người dùng"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
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
            <input
              type="text"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Địa chỉ"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
            <button type="submit">Đăng ký</button>
          </form>
          <div className="login-link">
            <p>Đã có tài khoản?</p>
            <Link to="/login">Đăng nhập ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

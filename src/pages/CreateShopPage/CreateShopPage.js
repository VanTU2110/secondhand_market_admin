import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './CreateShopPage.css';

function CreateShopPage() {
  const [shopData, setShopData] = useState({
    shop_name: '',
    shop_address: '',
    user_id: '',
  });
  const [successMessage, setSuccessMessage] = useState(''); // Thêm state để hiển thị thông báo

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setShopData((prevData) => ({
        ...prevData,
        user_id: decoded.id,
      }));
    }
  }, []);

  const handleChange = (e) => {
    setShopData({
      ...shopData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/shop/createShop', shopData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage('Tạo shop thành công!');
    } catch (error) {
      console.log('Error creating shop', error);
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <div className="create-shop-container">
      <h2>Tạo Shop Mới</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="shop_name"
          placeholder="Tên shop"
          value={shopData.shop_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="shop_address"
          placeholder="Địa chỉ shop"
          value={shopData.shop_address}
          onChange={handleChange}
          required
        />
        <button type="submit">Tạo Shop</button>
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>} {/* Hiển thị thông báo */}
    </div>
  );
}

export default CreateShopPage;

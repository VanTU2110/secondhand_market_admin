import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode chính xác
import './OrderManagementPage.css'; // Import file CSS
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [shopId, setShopId] = useState('');

  // Lấy token từ local storage
  const token = localStorage.getItem('token');

  // Lấy shop_id từ user_id sau khi giải mã token
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token); // Giải mã token để lấy user_id
        console.log('Decoded token:', decoded); // Kiểm tra thông tin giải mã

        // Gọi API để lấy shop_id theo user_id
        axios.get(`http://localhost:5000/api/shop/user/${decoded.id}`)
          .then(response => {
            console.log('Shop ID:', response.data._id); // Kiểm tra shop_id trả về
            setShopId(response.data._id); // Lưu shop_id
          })
          .catch(error => {
            console.error('Error fetching shop_id:', error);
          });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, [token]);

  // Gọi API lấy danh sách đơn hàng theo shop_id
  const fetchOrders = async () => {
    if (!shopId) return;

    try {
      const response = await axios.get(`http://localhost:5000/api/orders/shop/${shopId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Thêm token vào header
        },
      });
      console.log('Orders data:', response.data); // Kiểm tra dữ liệu trả về
      setOrders(response.data); // Giả sử API trả về mảng orders trong data
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // useEffect để gọi API lấy đơn hàng khi có shop_id
  useEffect(() => {
    if (shopId) {
      fetchOrders();
    }
  }, [shopId]);

  // Hàm cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/complete-order/${orderId}/status`, 
        { status: newStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Sau khi cập nhật trạng thái, gọi lại API để cập nhật danh sách đơn hàng
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="order-management-page">
        <div className="order-management-content">
          <h1>Quản Lý Đơn Hàng</h1>
          <table className="order-table">
            <thead>
              <tr>
                <th>Mã Đơn Hàng</th>
                <th>Ngày Đặt</th>
                <th>Sản Phẩm</th>
                <th>Tổng Giá</th>
                <th>Trạng Thái</th>
                <th>Cập Nhật Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
                {Array.isArray(orders) && orders.length > 0 ? (
                    orders.map((order) => (
                    <tr key={order._id}>
                        <td>{order._id}</td>
                        <td>{new Date(order.order_date).toLocaleDateString()}</td>
                        <td>
                        {Array.isArray(order.cart) && order.cart.length > 0 ? (
                            order.cart.map((item) => (
                            <div key={item._id}>
                                <img src={item.img_url[0]} alt={item.title} className="product-image" />
                                <span>{item.title} x {item.quantity}</span>
                            </div>
                            ))
                        ) : (
                            <span>Không có sản phẩm</span>
                        )}
                        </td>
                        <td>{order.total_price.toLocaleString()} VND</td>
                        <td>{order.status}</td>
                        <td>
                        {order.status === 'pending' && (
                            <button 
                            className="update-button" 
                            onClick={() => updateOrderStatus(order._id, 'processing')}
                            >
                            Xử Lý
                            </button>
                        )}
                        {order.status === 'processing' && (
                            <button 
                            className="update-button" 
                            onClick={() => updateOrderStatus(order._id, 'shipped')}
                            >
                            Gửi Hàng
                            </button>
                        )}
                        {order.status === 'shipped' && (
                            <button 
                            className="update-button" 
                            onClick={() => updateOrderStatus(order._id, 'paid')}
                            >
                            Thanh Toán
                            </button>
                        )}
                        {order.status === 'paid' && <span>Hoàn Thành</span>}
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="6">Không có đơn hàng nào.</td>
                    </tr>
                )}
                </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderManagementPage;

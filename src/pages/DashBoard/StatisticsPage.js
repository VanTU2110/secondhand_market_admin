import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bar, Pie, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { Box, Card, CardContent, CircularProgress, Typography, TextField, Button } from '@mui/material';
import './StatisticsPage.css';
import { InputAdornment } from '@mui/material';


const StatisticsPage = () => {
  const [shopId, setShopId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [orderStatusStats, setOrderStatusStats] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderTimeline, setOrderTimeline] = useState([]);
  const [reviewedRatio, setReviewedRatio] = useState({ reviewedCount: 0, totalCount: 0, reviewedRatio: 0 });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchShopId = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const response = await axios.get(`http://localhost:5000/api/shop/user/${decoded.id}`);
        setShopId(response.data._id);
      } catch (error) {
        console.error('Error fetching shop ID:', error);
      }
    }
  };

  const fetchData = async () => {
    if (!shopId) return;

    try {
      const revenueData = await axios.get(`http://localhost:5000/api/orders/revenue/${shopId}`, {
        params: { startDate, endDate }
      });
      setRevenue(revenueData.data.totalRevenue);

      const orderStatusData = await axios.get(`http://localhost:5000/api/orders/order-status/${shopId}`);
      setOrderStatusStats(orderStatusData.data);

      const topProductsData = await axios.get(`http://localhost:5000/api/orders/top-products/${shopId}`);
      setTopProducts(topProductsData.data);

      const orderTimelineData = await axios.get(`http://localhost:5000/api/orders/order-timeline/${shopId}?interval=month`, {
        params: { startDate, endDate }
      });
      setOrderTimeline(orderTimelineData.data);

      const reviewedRatioData = await axios.get(`http://localhost:5000/api/orders/reviewed-ratio/${shopId}`);
      setReviewedRatio(reviewedRatioData.data);
    } catch (error) {
      console.error('Error fetching statistics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopId();
  }, []);

  useEffect(() => {
    if (shopId) fetchData();
  }, [shopId, startDate, endDate]);

  const handleDateChange = () => {
    setLoading(true);
    fetchData();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DashboardLayout>
      <Box className="dashboard-management">
        <Box sx={{ width: '100%', padding: 2 }}>
          <Typography variant="h4" className="dashboard-header">Thống kê cửa hàng</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
            <TextField
              label="Ngày bắt đầu"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"></InputAdornment>,
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Ngày kết thúc"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"></InputAdornment>,
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Button variant="contained" color="primary" onClick={handleDateChange}>Lọc</Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
            {/* Card Doanh thu */}
            <Card>
              <CardContent>
                <Typography variant="h6">Doanh thu</Typography>
                <Typography variant="h4">{revenue.toLocaleString()} VND</Typography>
              </CardContent>
            </Card>

            {/* Card Trạng thái đơn hàng */}
            <Card>
              <CardContent>
                <Typography variant="h6">Trạng thái đơn hàng</Typography>
                <div className="chart-container pie-chart">
                  <Pie
                    data={{
                      labels: orderStatusStats.map((stat) => stat._id),
                      datasets: [
                        {
                          data: orderStatusStats.map((stat) => stat.count),
                          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                        },
                      ],
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card Sản phẩm bán chạy */}
            <Card>
              <CardContent>
                <Typography variant="h6">Sản phẩm bán chạy</Typography>
                <div className="chart-container bar-chart">
                  <Bar
                    data={{
                      labels: topProducts.map((product) => product.name),
                      datasets: [
                        {
                          label: 'Số lượng bán',
                          data: topProducts.map((product) => product.quantitySold),
                          backgroundColor: '#36A2EB',
                        },
                      ],
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card Tỷ lệ đánh giá */}
            <Card>
              <CardContent>
                <Typography variant="h6">Tỷ lệ đánh giá</Typography>
                <Typography variant="h4">{(reviewedRatio.reviewedRatio * 100).toFixed(2)}%</Typography>
                <Typography variant="body2">
                  {reviewedRatio.reviewedCount} / {reviewedRatio.totalCount} sản phẩm đã được đánh giá
                </Typography>
              </CardContent>
            </Card>

            {/* Card Timeline đơn hàng */}
            <Card>
              <CardContent>
                <Typography variant="h6">Timeline đơn hàng</Typography>
                <div className="chart-container line-chart">
                  <Line
                    data={{
                      labels: orderTimeline.map((item) => item.date),
                      datasets: [
                        {
                          label: 'Số đơn hàng',
                          data: orderTimeline.map((item) => item.orderCount),
                          borderColor: '#FF6384',
                          fill: false,
                        },
                      ],
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </Box>
        </Box>
        <ToastContainer />
      </Box>
    </DashboardLayout>
  );
};

export default StatisticsPage;

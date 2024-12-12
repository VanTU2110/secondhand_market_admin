import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaBox,
  FaTags,
  FaClipboardList,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import "./Sidebar.css";

const Sidebar = ({ onMenuClick }) => {
  const location = useLocation();
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded = jwtDecode(token); // Giải mã token để lấy user_id
      const userId = decoded.id;

      // Gọi API để lấy shop thông qua user_id
      axios
        .get(`http://localhost:5000/api/shop/user/${userId}`)
        .then((response) => {
          if (response.data && response.data.shop_name) {
            setShopName(response.data.shop_name); // Lưu tên shop vào state
          }
        })
        .catch((error) => {
          console.error("Lỗi khi lấy tên shop:", error);
        });
    }
  }, []);

  const items = [
    { text: "Thống kê", icon: <FaHome />, link: "/static" },
    { text: "Sản phẩm", icon: <FaBox />, link: "/product" },
    { text: "Loại sản phẩm", icon: <FaTags />, link: "/category" },
    { text: "Đơn hàng", icon: <FaClipboardList />, link: "/order" },
    { text: "Đăng xuất", icon: <FaSignOutAlt />, link: "/login" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
  };

  return (
    <Drawer classes={{ paper: "sidebar-container" }} variant="permanent">
      <div className="sidebar-header">
        <h2>{shopName || "Shop của bạn"}</h2>
      </div>
      <List className="sidebar">
        {items.map((item, index) => (
          <ListItem
            button
            component={Link}
            to={item.link}
            key={index}
            className={`sidebar-item ${
              location.pathname === item.link ? "active" : ""
            }`}
            onClick={() => {
              // Gọi hàm onMenuClick nếu có
              if (onMenuClick) onMenuClick(item.text);

              // Nếu là "Đăng xuất", gọi handleLogout
              if (item.text === "Đăng xuất") {
                handleLogout();
              }
            }}
          >
            <ListItemIcon
              className={`sidebar-icon ${
                location.pathname === item.link ? "active" : ""
              }`}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;

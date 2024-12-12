import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import './ProductManagementPage.css';

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shopId, setShopId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    title: '',
    minPrice: '',
    maxPrice: '',
  });
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    quantity: '',
    condition: 'new',
    category_id: '',
    img_url: []
  });
  const [editingProduct, setEditingProduct] = useState(null);

  // Hàm gọi API để lấy shop_id theo user_id
  const fetchShopId = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/shop/user/${userId}`);
      return response.data._id;
    } catch (error) {
      console.error("Không thể lấy shop_id", error);
      throw error;
    }
  };

  // Hàm gọi API để lấy danh sách sản phẩm theo shop_id
  const fetchProductsByShop = async (shopId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/shop/${shopId}`);
      return response.data;
    } catch (error) {
      console.error("Không thể lấy danh sách sản phẩm", error);
      throw error;
    }
  };

  // Hàm gọi API để lấy danh sách danh mục sản phẩm
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories/getAll'); // Thay đổi URL cho API danh mục
      return response.data;
    } catch (error) {
      console.error("Không thể lấy danh sách danh mục", error);
      throw error;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const decoded = jwtDecode(token); // Giải mã token để lấy user_id

      (async () => {
        try {
          const shopId = await fetchShopId(decoded.id);
          setShopId(shopId);

          const products = await fetchProductsByShop(shopId);
          setProducts(products);

          const categories = await fetchCategories();
          setCategories(categories);
        } catch (error) {
          toast.error("Đã xảy ra lỗi khi lấy dữ liệu");
        }
      })();
    } else {
      console.error('Token không tồn tại');
    }
  }, []);

  const renderProduct = (product, categories, editingProduct, newProduct, startEditing, deleteProduct) => {
    // Tìm kiếm danh mục cho sản phẩm
    const category = product.category_id && product.category_id._id
      ? categories.find(cat => cat._id === product.category_id._id)
      : null;

    return (
      <li key={product._id} className="product-item">
        <div className="product-info">
          <h3>{product.title}</h3>
          <p>Mô tả: {product.description}</p>
          <p>Giá: {product.price} đ</p>
          <p>Số lượng: {product.quantity}</p>
          <p>Tình trạng: {product.condition === 'new' ? 'Mới' : 'Cũ'}</p>
          <p>Danh mục: {category ? category.category_name : 'Không xác định'}</p>
        </div>
        <div className="product-images">
          {editingProduct && editingProduct._id === product._id && newProduct.oldImages.length > 0 ? (
            newProduct.oldImages.map((url, index) => (
              <img key={index} src={url} alt={`Old Product ${index}`} className="product-img" />
            ))
          ) : product.img_url && product.img_url.length > 0 ? (
            product.img_url.map((url, index) => (
              <img key={index} src={url} alt={`Product ${index}`} className="product-img" />
            ))
          ) : (
            <p>Không có hình ảnh</p>
          )}
        </div>

        <div className="product-actions">
          <button onClick={() => startEditing(product)}>Sửa</button>
          <button onClick={() => deleteProduct(product._id)}>Xóa</button>
        </div>
      </li>
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setNewProduct(prev => ({ ...prev, img_url: files, previewUrls: imageUrls }));
  };
  const handleSearchChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      // Xử lý cho checkbox, thay đổi giá trị của minPrice hoặc maxPrice
      setSearchQuery((prev) => ({
        ...prev,
        [name]: checked ? value : 0, // Nếu chọn checkbox thì gán giá trị, nếu bỏ chọn thì gán 0
      }));
    } else {
      setSearchQuery((prev) => ({
        ...prev,
        [name]: value, // Cập nhật giá trị input cho title
      }));
    }
  };
  const searchProducts = () => {
    setLoading(true);
    const { priceRange, title } = searchQuery;

    let minPrice = "";
    let maxPrice = "";
    if (priceRange) {
      const [min, max] = priceRange.split("-");
      minPrice = min;
      maxPrice = max || ""; // Nếu không có max, nghĩa là giá trị là "Trên 1,000,000 đ"
    }

    axios
      .get("http://localhost:5000/api/products/search", {
        params: { title, minPrice, maxPrice },
      })
      .then((response) => {
        setProducts(response.data);
        toast.success("Tìm kiếm sản phẩm thành công!");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Tìm kiếm sản phẩm thất bại!");
      })
      .finally(() => setLoading(false));
  };


  const addProduct = async () => {
    setLoading(true);

    const formData = new FormData();
    newProduct.img_url.forEach(file => {
      formData.append('images', file);
    });
    formData.append('shop_id', shopId); // Gán shop_id vào formData
    formData.append('category_id', newProduct.category_id);
    formData.append('title', newProduct.title);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('quantity', newProduct.quantity);
    formData.append('condition', newProduct.condition);

    try {
      // Upload images first
      const imageUploadPromises = newProduct.img_url.map(file => {
        const imageData = new FormData();
        imageData.append('image', file); // Gửi từng hình ảnh lên server
        return axios.post('http://localhost:5000/api/images/upload', imageData);
      });

      const imageResponses = await Promise.all(imageUploadPromises);
      const imageUrls = imageResponses.map(response => response.data.imageUrl); // Lấy imageUrl từ phản hồi

      // Gửi thông tin sản phẩm cùng với imageUrls
      const productData = {
        shop_id: shopId, // Dùng shop_id thay vì user_id
        category_id: newProduct.category_id,
        title: newProduct.title,
        description: newProduct.description,
        price: newProduct.price,
        quantity: newProduct.quantity,
        condition: newProduct.condition,
        img_url: imageUrls // Lưu đường dẫn hình ảnh vào db
      };


      const response = await axios.post('http://localhost:5000/api/products/createProduct', productData);
      setProducts(prev => [...prev, response.data]);
      toast.success("Thêm sản phẩm thành công!");
      setNewProduct({ title: '', description: '', price: '', quantity: '', condition: 'new', category_id: '', img_url: [] });
    } catch (error) {
      console.error(error);
      toast.error("Thêm sản phẩm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (product) => {
    window.scrollTo(0, 0);
    setEditingProduct(product);
    setNewProduct({
      title: product.title,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      condition: product.condition,
      category_id: product.category_id,
      img_url: [],
      oldImages: product.img_url
    });
  };

  const updateProduct = async () => {
    setLoading(true);

    const imageUrls = newProduct.img_url.length > 0 ? await uploadNewImages() : newProduct.oldImages;

    const productData = {
      title: newProduct.title,
      description: newProduct.description,
      price: newProduct.price,
      quantity: newProduct.quantity,
      condition: newProduct.condition,
      img_url: imageUrls, // Sử dụng hình ảnh mới hoặc cũ
      category_id: newProduct.category_id // Cập nhật category_id
    };
    console.log("Product Data: ", productData);

    try {
      const response = await axios.put(`http://localhost:5000/api/products/updateProductbyId/${editingProduct._id}`, productData);
      setProducts(products.map(prod => (prod._id === editingProduct._id ? response.data : prod)));
      console.log("Product Data: ", productData);
      toast.success("Cập nhật sản phẩm thành công!");
      setEditingProduct(null);
      setNewProduct({ title: '', description: '', price: '', quantity: '', condition: 'new', category_id: '', img_url: [], oldImages: [] }); // Reset form
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật sản phẩm thất bại!");
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  // Hàm tải lên hình ảnh mới
  const uploadNewImages = async () => {
    const imageUploadPromises = newProduct.img_url.map(file => {
      const imageData = new FormData();
      imageData.append('image', file);
      return axios.post('http://localhost:5000/api/images/upload', imageData);
    });

    const imageResponses = await Promise.all(imageUploadPromises);
    return imageResponses.map(response => response.data.imageUrl);
  };

  const deleteProduct = (id) => {
    axios.delete(`http://localhost:5000/api/products/deletebyId/${id}`)
      .then(() => {
        setProducts(products.filter(prod => prod._id !== id));
        toast.success("Xóa sản phẩm thành công!");
      })
      .catch(error => {
        console.error(error);
        toast.error("Xóa sản phẩm thất bại!");
      });
  };

  return (
    <DashboardLayout>
      <div className="product-management">
        <h2>Quản lý sản phẩm</h2>

        {loading && <div className="loading">Đang tải...</div>}
        <div className="product-management-container">
          <div className="add-product">
            <h2>Thêm Sản Phẩm</h2>
            <form className="add-product-form">
              <div className="form-group">
                <label htmlFor="title">Tên sản phẩm</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Tên sản phẩm"
                  value={newProduct.title}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  name="description"
                  placeholder="Mô tả sản phẩm"
                  value={newProduct.description}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Giá</label>
                <input
                  type="number"
                  name="price"
                  placeholder="Giá sản phẩm"
                  value={newProduct.price}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Số lượng</label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="Số lượng"
                  value={newProduct.quantity}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="condition">Tình trạng</label>
                <select
                  name="condition"
                  value={newProduct.condition}
                  onChange={handleChange}
                >
                  <option value="new">Mới</option>
                  <option value="used">Cũ</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="category_id">Danh mục</label>
                <select
                  name="category_id"
                  value={newProduct.category_id}
                  onChange={handleChange}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="images">Hình ảnh</label>
                <input type="file" multiple onChange={handleFileChange} />
              </div>
              <div className="image-preview-container">
                {newProduct.previewUrls &&
                  newProduct.previewUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index}`}
                      className="product-img-preview"
                    />
                  ))}
              </div>
              <button
                type="button"
                className="submit-btn"
                onClick={editingProduct ? updateProduct : addProduct}
              >
                {editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
              </button>
            </form>
          </div>

          <div className="search-product">
            <h2>Tìm Kiếm Sản Phẩm</h2>
            <form className="search-form">
              <div className="form-group">
                <label htmlFor="title">Tên sản phẩm</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Tên sản phẩm"
                  value={searchQuery.title}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="form-group">
                <label>Khoảng giá</label>
                <div className="price-range">
                  <label>
                    <input
                      type="checkbox"
                      name="priceRange"
                      value="0-100000"
                      checked={searchQuery.priceRange === "0-100000"}
                      onChange={handleSearchChange}
                    />
                    0 - 100,000 đ
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="priceRange"
                      value="100001-500000"
                      checked={searchQuery.priceRange === "100001-500000"}
                      onChange={handleSearchChange}
                    />
                    100,001 - 500,000 đ
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="priceRange"
                      value="500001-1000000"
                      checked={searchQuery.priceRange === "500001-1000000"}
                      onChange={handleSearchChange}
                    />
                    500,001 - 1,000,000 đ
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="priceRange"
                      value="1000001-50000000"
                      checked={searchQuery.priceRange === "1000001-50000000"}
                      onChange={handleSearchChange}
                    />
                    1,000,000 - 5,000,000 đ
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="priceRange"
                      value="5000001"
                      checked={searchQuery.priceRange === "5000001"}
                      onChange={handleSearchChange}
                    />
                    Trên 5,000,000 đ
                  </label>
                </div>
              </div>
              <button type="button" className="search-btn" onClick={searchProducts}>
                Tìm kiếm
              </button>
            </form>
          </div>
        </div>

        <ul className="product-list">
          {products.length === 0 ? (
            <li>Không có sản phẩm nào trong shop này</li>
          ) : (
            products.map(product =>
              renderProduct(product, categories, editingProduct, newProduct, startEditing, deleteProduct)
            )
          )}
        </ul>
      </div>
    </DashboardLayout>
  );
};

export default ProductManagementPage;

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

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const decoded = jwtDecode(token); // Giải mã token để lấy user_id

      // Gọi API để lấy shop_id theo user_id
      axios.get(`http://localhost:5000/api/shop/user/${decoded.id}`)
        .then(response => {
          setShopId(response.data._id);

          // Gọi API để lấy sản phẩm theo shop_id
          return axios.get(`http://localhost:5000/api/products/shop/${response.data._id}`);
        })
        .then(response => setProducts(response.data))
        .catch(error => {
          console.error(error);
          toast.error("Không thể lấy danh sách sản phẩm");
        });

      // Gọi API để lấy danh mục sản phẩm
      axios.get('http://localhost:5000/api/categories/getAll') // Thay đổi URL cho API danh mục
        .then(response => {
          console.log("Dữ liệu API trả về:", response.data); // In ra dữ liệu trả về từ API
          setCategories(response.data);
        })
        .catch(error => {
          console.error(error);
          toast.error("Không thể lấy danh sách danh mục");
        });
    } else {
      console.error('Token không tồn tại');
    }
  }, []);


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
    const { name, value } = e.target;
    setSearchQuery((prev) => ({ ...prev, [name]: value }));
  };

  const searchProducts = () => {
    setLoading(true);
    const { title, minPrice, maxPrice } = searchQuery;
    axios
      .get('http://localhost:5000/api/products/search', {
        params: { title, minPrice, maxPrice },
      })
      .then((response) => {
        setProducts(response.data);
        toast.success('Tìm kiếm sản phẩm thành công!');
      })
      .catch((error) => {
        console.error(error);
        toast.error('Tìm kiếm sản phẩm thất bại!');
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


    try {
      const response = await axios.put(`http://localhost:5000/api/products/updateProductbyId/${editingProduct._id}`, productData);
      setProducts(products.map(prod => (prod._id === editingProduct._id ? response.data : prod)));
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
        <ToastContainer />
        {loading && <div className="loading">Đang tải...</div>}
        <div className="add-product">
          <input
            type="text"
            name="title"
            placeholder="Tên sản phẩm"
            value={newProduct.title}
            onChange={handleChange}
          />
          <input
            type="text"
            name="description"
            placeholder="Mô tả"
            value={newProduct.description}
            onChange={handleChange}
          />
          <input
            type="number"
            name="price"
            placeholder="Giá"
            value={newProduct.price}
            onChange={handleChange}
          />
          <input
            type="number"
            name="quantity"
            placeholder="Số lượng"
            value={newProduct.quantity}
            onChange={handleChange}
          />
          <select
            name="condition"
            value={newProduct.condition}
            onChange={handleChange}
          >
            <option value="new">Mới</option>
            <option value="used">Cũ</option>
          </select>
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
          <input type="file" multiple onChange={handleFileChange} />
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

          {editingProduct ? (
            <button onClick={updateProduct}>Cập nhật sản phẩm</button>
          ) : (
            <button onClick={addProduct}>Thêm sản phẩm</button>
          )}
        </div>
        <div className="search-product">
          <h3>Tìm kiếm sản phẩm</h3>
          <input
            type="text"
            name="title"
            placeholder="Tên sản phẩm"
            value={searchQuery.title}
            onChange={handleSearchChange}
          />
          <input
            type="number"
            name="minPrice"
            placeholder="Giá tối thiểu"
            value={searchQuery.minPrice}
            onChange={handleSearchChange}
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Giá tối đa"
            value={searchQuery.maxPrice}
            onChange={handleSearchChange}
          />
          <button onClick={searchProducts}>Tìm kiếm</button>
        </div>

        <ul className="product-list">
          {products.length === 0 ? (
            <li>Không có sản phẩm nào trong shop này</li>
          ) : (
            products.map(product => {
              // console.log("category của sản phẩm:", product.category_id);
              const category = product.category_id && product.category_id._id
                ? categories.find(cat => cat._id === product.category_id._id)
                : null;
              // console.log("category_id của sản phẩm:", product.category_id._id); // In ra category_id của sản phẩm
              // console.log("category tìm được:", category); // In ra category (object tìm được theo category_id)

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
            })
          )}
        </ul>
      </div>
    </DashboardLayout>
  );
};

export default ProductManagementPage;

import React, { useState, useEffect } from 'react';
import './CategoryManagementPage.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Hàm để fetch categories từ backend
  const fetchCategories = () => {
    axios.get('http://localhost:5000/api/categories/getall')
      .then(response => {
        if (response.data && response.data.length > 0) {
          setCategories(response.data);
          toast.success('Fetched categories successfully!');
        } else {
          toast.info('No categories found.');
        }
      })
      .catch(error => {
        console.error(error);
        toast.error('Failed to fetch categories!');
      });
  };

  useEffect(() => {
    fetchCategories(); // Gọi hàm fetch khi component được mount
  }, []);

  const addCategory = () => {
    if (!newCategory.trim()) {
      toast.warning("Category name cannot be empty!");
      return;
    }

    axios.post('http://localhost:5000/api/categories/createCategory', { category_name: newCategory })
      .then(response => {
        toast.success("Category added successfully!");
        setNewCategory(''); // Reset input
        fetchCategories(); // Gọi lại API để cập nhật danh sách
      })
      .catch(error => {
        console.error(error);
        toast.error("Failed to add category!");
      });
  };

  const deleteCategory = (id) => {
    axios.delete(`http://localhost:5000/api/categories/deletebyid/${id}`)
      .then(() => {
        toast.success("Category deleted successfully!");
        fetchCategories(); // Gọi lại API để cập nhật danh sách
      })
      .catch(error => {
        console.error(error);
        toast.error("Failed to delete category!");
      });
  };

  const startEditing = (category) => {
    setEditingCategory(category);
    setEditingCategoryName(category.category_name);
  };

  const updateCategory = () => {
    if (!editingCategoryName.trim()) {
      toast.warning("Category name cannot be empty!");
      return;
    }

    axios.put(`http://localhost:5000/api/categories/updatebyid/${editingCategory._id}`, { category_name: editingCategoryName })
      .then(response => {
        toast.success("Category updated successfully!");
        setEditingCategory(null);
        setEditingCategoryName('');
        fetchCategories(); // Gọi lại API để cập nhật danh sách
      })
      .catch(error => {
        console.error(error);
        toast.error("Failed to update category!");
      });
  };

  return (
    <DashboardLayout>
      <div className="category-management">
        <h2>Quản lí danh mục</h2>
        
        <div className="add-category">
          <input
            type="text"
            placeholder="New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button onClick={addCategory}>Add Category</button>
        </div>

        {editingCategory ? (
          <div className="edit-category">
            <input
              type="text"
              value={editingCategoryName}
              onChange={(e) => setEditingCategoryName(e.target.value)}
            />
            <button onClick={updateCategory}>Update Category</button>
            <button onClick={() => setEditingCategory(null)}>Cancel</button>
          </div>
        ) : null}

<ul className="category-list">
  {categories.length > 0 ? (
    categories.map((category) => (
      <li key={category._id}>
        <span className="category-name">{category.category_name}</span>
        <div className="actions">
          <button onClick={() => startEditing(category)}>Edit</button>
          <button onClick={() => deleteCategory(category._id)}>Delete</button>
        </div>
      </li>
    ))
  ) : (
    <p>No categories available.</p>
  )}
</ul>
      </div>
    </DashboardLayout>
  );
};

export default CategoryManagementPage;

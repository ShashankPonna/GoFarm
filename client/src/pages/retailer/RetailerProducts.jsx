import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const RetailerProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="retailer-products">
      <h1>Available Products</h1>
      <div className="products-grid">
        {products.map(p => (
          <div key={p._id} className="product-card">
            <h3>{p.name}</h3>
            <p>₹{p.price}/{p.unit}</p>
            <button className="btn">Order</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RetailerProducts;

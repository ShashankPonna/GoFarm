import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const CropManagement = () => {
  const [crops, setCrops] = useState([]);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const response = await api.get('/crops');
      setCrops(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="crop-management">
      <h1>Crop Management</h1>
      <div className="crops-grid">
        {crops.map(crop => (
          <div key={crop._id} className="crop-card">
            <h3>{crop.name}</h3>
            <p>Status: {crop.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CropManagement;

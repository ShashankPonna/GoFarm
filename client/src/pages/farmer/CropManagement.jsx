import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import BackButton from '../../components/BackButton';

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
    <div className="crop-management p-6">
      <BackButton bgColor="bg-green-100" color="text-green-800" className="mb-4" />
      <h1 className="text-3xl font-bold mb-6">Crop Management</h1>
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

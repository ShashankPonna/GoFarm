import React from 'react';
import BackButton from '../../components/BackButton';

const RetailerInventory = () => {
  return (
    <div className="inventory p-6">
      <BackButton className="mb-4" />
      <h1 className="text-2xl font-bold mb-2">Inventory Management</h1>
      <p className="text-gray-600">Track your inventory</p>
    </div>
  );
};

export default RetailerInventory;

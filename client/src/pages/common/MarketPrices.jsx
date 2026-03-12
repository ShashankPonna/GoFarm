import React from 'react';

const MarketPrices = () => {
  const prices = [
    { crop: 'Wheat', price: 2500, unit: 'quintal' },
    { crop: 'Rice', price: 3000, unit: 'quintal' },
    { crop: 'Tomato', price: 30, unit: 'kg' }
  ];

  return (
    <div className="market-prices">
      <h1>Market Prices</h1>
      <table>
        <thead>
          <tr>
            <th>Crop</th>
            <th>Price</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((item, idx) => (
            <tr key={idx}>
              <td>{item.crop}</td>
              <td>₹{item.price}</td>
              <td>{item.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarketPrices;

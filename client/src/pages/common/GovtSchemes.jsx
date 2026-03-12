import React from 'react';
import BackButton from '../../components/BackButton';

const GovtSchemes = () => {
  const schemes = [
    { name: 'PM-KISAN', description: 'Direct income support to farmers' },
    { name: 'Crop Insurance', description: 'Insurance coverage for crops' }
  ];

  return (
    <div className="govt-schemes p-6">
      <BackButton className="mb-4" />
      <h1 className="text-2xl font-bold mb-4">Government Schemes</h1>
      <div className="schemes-list">
        {schemes.map((scheme, idx) => (
          <div key={idx} className="scheme-card">
            <h3>{scheme.name}</h3>
            <p>{scheme.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GovtSchemes;

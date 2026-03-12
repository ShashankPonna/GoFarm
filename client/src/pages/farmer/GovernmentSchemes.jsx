import React, { useState } from 'react';

const GovernmentSchemes = () => {
  const [selectedState, setSelectedState] = useState('all');

  const schemes = {
    maharashtra: [
      { name: 'PM Kisan Yojana', description: 'Income support for farmers with direct benefit transfer', link: 'https://pmkisan.gov.in/', icon: 'fa-hand-holding-dollar' },
      { name: 'Soil Health Card Scheme', description: 'Soil testing and nutrient recommendations for improved yields', link: 'https://www.soilhealth.dac.gov.in/', icon: 'fa-seedling' },
      { name: 'Drip Irrigation Subsidy', description: 'Financial assistance for water-efficient irrigation systems', link: 'https://www.mahaagri.gov.in/', icon: 'fa-faucet-drip' }
    ],
    gujarat: [
      { name: 'Mukhyamantri Kisan Yojana', description: 'State-level financial assistance for farmers', link: 'https://ikhedut.gujarat.gov.in/', icon: 'fa-indian-rupee-sign' },
      { name: 'Krishi Input Subsidy', description: 'Subsidies on agricultural inputs like seeds and fertilizers', link: 'https://ikhedut.gujarat.gov.in/', icon: 'fa-wheat-awn' },
      { name: 'Organic Farming Subsidy', description: 'Support for transition to organic farming methods', link: 'https://ikhedut.gujarat.gov.in/', icon: 'fa-leaf' }
    ],
    punjab: [
      { name: 'Punjab Pani Bachao', description: 'Water conservation initiative with incentives', link: 'https://agripb.gov.in/', icon: 'fa-droplet' },
      { name: 'Crop Insurance Scheme', description: 'Risk management and financial protection for farmers', link: 'https://pmfby.gov.in/', icon: 'fa-shield' },
      { name: 'Agri Export Promotion', description: 'Support for farmers to export their produce globally', link: 'https://agriexport.gov.in/', icon: 'fa-ship' }
    ],
    tamilnadu: [
      { name: 'Tamil Nadu Agri Insurance', description: 'State-specific crop insurance plans', link: 'https://www.tnagrisnet.tn.gov.in/', icon: 'fa-umbrella' },
      { name: 'Drip Irrigation Scheme', description: 'Water conservation technology subsidies', link: 'https://www.tnagrisnet.tn.gov.in/', icon: 'fa-faucet' },
      { name: 'Soil Health Card', description: 'Soil testing and nutrient recommendations', link: 'https://www.soilhealth.dac.gov.in/', icon: 'fa-microscope' }
    ]
  };

  const getFilteredSchemes = () => {
    if (selectedState === 'all') {
      return Object.entries(schemes).flatMap(([state, stateSchemes]) => 
        stateSchemes.map(scheme => ({ ...scheme, state }))
      );
    }
    return schemes[selectedState]?.map(scheme => ({ ...scheme, state: selectedState })) || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <button onClick={() => window.history.back()} className="mr-4">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold">Government Schemes</h1>
            <p className="text-sm text-green-200">Agricultural advancement resources</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-10 px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            Government Schemes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover government schemes and resources for agricultural advancement across India
          </p>
        </header>

        <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-lg p-8 mb-12">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-green-600 flex items-center">
              <i className="fas fa-landmark mr-3"></i> Available Schemes
            </h2>
            <select 
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-4 py-2 border-2 border-green-500 rounded-lg bg-gradient-to-r from-green-50 to-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All States</option>
              <option value="maharashtra">Maharashtra</option>
              <option value="gujarat">Gujarat</option>
              <option value="punjab">Punjab</option>
              <option value="tamilnadu">Tamil Nadu</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredSchemes().map((scheme, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-l-4 border-green-500"
              >
                <div className="flex items-start mb-4">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <i className={`fas ${scheme.icon} text-green-600 text-xl`}></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{scheme.name}</h3>
                    <p className="text-gray-600 mt-1 text-sm">{scheme.description}</p>
                  </div>
                </div>
                <a 
                  href={scheme.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-4 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-600 transition-all shadow-md"
                >
                  <span>Apply Now</span>
                  <i className="fas fa-arrow-right ml-2"></i>
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all">
            <i className="fas fa-chart-line text-4xl text-green-600 mb-3"></i>
            <div className="text-3xl font-bold text-green-600">105M</div>
            <div className="text-gray-600 text-sm">Wheat Production (Tonnes)</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all">
            <i className="fas fa-seedling text-4xl text-green-600 mb-3"></i>
            <div className="text-3xl font-bold text-green-600">120M</div>
            <div className="text-gray-600 text-sm">Rice Production (Tonnes)</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all">
            <i className="fas fa-tint text-4xl text-blue-600 mb-3"></i>
            <div className="text-3xl font-bold text-blue-600">30%</div>
            <div className="text-gray-600 text-sm">Canal Irrigation</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all">
            <i className="fas fa-users text-4xl text-purple-600 mb-3"></i>
            <div className="text-3xl font-bold text-purple-600">50M+</div>
            <div className="text-gray-600 text-sm">Farmers Benefited</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernmentSchemes;

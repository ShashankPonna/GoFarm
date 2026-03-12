import React, { useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RetailerContact = () => {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/retailers`);
        const data = await res.json();
        setRetailers(data.retailers || []);
      } catch (err) {
        console.error('Failed to fetch retailers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRetailers();
  }, []);

  const filtered = retailers.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.city?.toLowerCase().includes(search.toLowerCase()) ||
    r.address?.toLowerCase().includes(search.toLowerCase())
  );

  const getPhone = (r) => r.phone || r.mobile || '';

  const callRetailer = (phone) => {
    if (phone) window.open(`tel:${phone}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">

      {/* Header */}
      <header className="bg-gradient-to-r from-green-800 to-green-600 text-white py-4 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3 justify-between items-center">
          <div className="flex items-center space-x-3">
            <button onClick={() => window.history.back()} className="mr-1 hover:opacity-80">
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <i className="fas fa-store text-2xl text-green-200"></i>
            <h1 className="text-2xl font-bold">Retailer Contacts</h1>
          </div>
          <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2">
            <i className="fas fa-search text-green-100"></i>
            <input
              type="text"
              placeholder="Search retailers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent placeholder-green-100 text-white border-none outline-none w-52"
            />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="w-full bg-gradient-to-b from-green-600 to-transparent py-14 text-center text-white px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Find Retailers to Sell To</h1>
        <p className="text-xl opacity-90">Browse registered retailers looking to buy farm produce — contact them directly</p>
      </section>

      {/* Cards */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-24 text-green-700 text-lg">
            <i className="fas fa-spinner fa-spin text-4xl mb-4 block"></i>
            Loading retailers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            <i className="fas fa-store-slash text-5xl mb-4 text-gray-300 block"></i>
            {search ? (
              <>
                No retailers match "<strong>{search}</strong>".
                <button onClick={() => setSearch('')} className="mt-3 block mx-auto text-green-600 underline text-sm">
                  Clear search
                </button>
              </>
            ) : (
              'No retailers registered yet.'
            )}
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6">
              {filtered.length} retailer{filtered.length !== 1 ? 's' : ''} available
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((retailer, idx) => {
                const phone = getPhone(retailer);
                const location = [retailer.city, retailer.state, retailer.address].filter(Boolean).join(', ');
                const initials = retailer.name
                  ? retailer.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                  : 'R';

                return (
                  <div
                    key={retailer._id || idx}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden flex flex-col"
                  >
                    {/* Top accent */}
                    <div className="h-2 bg-gradient-to-r from-orange-400 to-amber-500"></div>

                    <div className="p-6 flex flex-col flex-grow">
                      {/* Avatar + Name */}
                      <div className="flex items-center gap-4 mb-4">
                        {retailer.profileImage ? (
                          <img
                            src={retailer.profileImage}
                            alt={retailer.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-orange-200"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-800 text-lg truncate">{retailer.name || 'Retailer'}</h3>
                          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            <i className="fas fa-store text-xs"></i> Retailer
                          </span>
                        </div>
                      </div>

                      {/* Contact Details */}
                      <div className="space-y-2 mb-4 flex-grow">
                        {phone && (
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <i className="fas fa-phone text-green-600 w-4"></i>
                            <span className="font-medium">{phone}</span>
                          </div>
                        )}
                        {retailer.email && (
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <i className="fas fa-envelope text-blue-500 w-4"></i>
                            <span className="truncate">{retailer.email}</span>
                          </div>
                        )}
                        {location && (
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <i className="fas fa-map-marker-alt text-red-400 w-4"></i>
                            <span className="line-clamp-1">{location}</span>
                          </div>
                        )}
                        {!phone && !retailer.email && !location && (
                          <p className="text-gray-400 text-sm italic">No contact details available</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-2">
                        {phone ? (
                          <>
                            <button
                              onClick={() => callRetailer(phone)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                              <i className="fas fa-phone"></i> Call
                            </button>
                            <a
                              href={`https://wa.me/91${phone}?text=Hi ${retailer.name || ''}, I am a farmer on GOFaRm and would like to sell you fresh produce.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                              <i className="fab fa-whatsapp"></i> WhatsApp
                            </a>
                          </>
                        ) : retailer.email ? (
                          <a
                            href={`mailto:${retailer.email}?subject=Farm Produce Inquiry - GOFaRm`}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            <i className="fas fa-envelope"></i> Email
                          </a>
                        ) : (
                          <div className="flex-1 text-center text-xs text-gray-400 py-2 italic">
                            No contact available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default RetailerContact;

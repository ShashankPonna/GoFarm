import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { exchangeAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';

// Equipment rates: kg of produce per hour of equipment use
const EQUIPMENT_RATES = {
    'Tractor': { ratePerHour: 11, unit: 'kg/hour', icon: '🚜' },
    'Rotavator': { ratePerHour: 8, unit: 'kg/hour', icon: '⚙️' },
    'Plough': { ratePerHour: 5, unit: 'kg/hour', icon: '🔧' },
    'Seed Drill': { ratePerHour: 6, unit: 'kg/hour', icon: '🌱' },
    'Sprayer': { ratePerHour: 4, unit: 'kg/hour', icon: '💧' },
    'Harvester': { ratePerHour: 15, unit: 'kg/hour', icon: '🌾' },
    'Thresher': { ratePerHour: 10, unit: 'kg/hour', icon: '🏭' },
    'Water Pump': { ratePerHour: 3, unit: 'kg/hour', icon: '🔌' },
    'Cultivator': { ratePerHour: 7, unit: 'kg/hour', icon: '🛠️' },
    'Trolley': { ratePerHour: 6, unit: 'kg/hour', icon: '🛒' },
};

const ExchangeRequestForm = () => {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);

    const [exchangeType, setExchangeType] = useState('crop'); // 'crop' or 'equipment'
    const [formData, setFormData] = useState({
        receiverCustomID: '',
        offeredItem: '',
        offeredQuantity: '',
        requestedItem: '',
        requestedQuantity: ''
    });
    const [selectedEquipment, setSelectedEquipment] = useState('');
    const [calculatedHours, setCalculatedHours] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    // Auto-calculate equipment hours based on offered weight
    const calculateEquipmentHours = (weight, equipment) => {
        if (!weight || !equipment || !EQUIPMENT_RATES[equipment]) return null;
        const rate = EQUIPMENT_RATES[equipment].ratePerHour;
        const hours = parseFloat(weight) / rate;
        return {
            hours: Math.round(hours * 100) / 100,
            rate,
            equipment,
            weight: parseFloat(weight)
        };
    };

    const handleEquipmentChange = (equipmentName) => {
        setSelectedEquipment(equipmentName);
        setFormData({ ...formData, requestedItem: equipmentName, requestedQuantity: '1' });
        if (formData.offeredQuantity) {
            setCalculatedHours(calculateEquipmentHours(formData.offeredQuantity, equipmentName));
        }
    };

    const handleOfferedQuantityChange = (value) => {
        setFormData({ ...formData, offeredQuantity: value });
        if (exchangeType === 'equipment' && selectedEquipment) {
            setCalculatedHours(calculateEquipmentHours(value, selectedEquipment));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);

        const { receiverCustomID, offeredItem, offeredQuantity, requestedItem, requestedQuantity } = formData;
        if (!receiverCustomID || !offeredItem || !offeredQuantity || !requestedItem || !requestedQuantity) {
            setError('All fields are required');
            return;
        }

        setLoading(true);
        try {
            const response = await exchangeAPI.create({
                receiverCustomID: receiverCustomID.toUpperCase(),
                offeredItem,
                offeredQuantity: Number(offeredQuantity),
                requestedItem: exchangeType === 'equipment' ? `${requestedItem} (${calculatedHours?.hours || 0} hrs)` : requestedItem,
                requestedQuantity: Number(requestedQuantity)
            });
            setResult({ ...response.data, calculatedHours });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create exchange request');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors bg-white';
    const btnClass = 'w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors duration-300 disabled:opacity-50';

    // SUCCESS VIEW
    if (result) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center space-y-4">
                    <div className="text-6xl">🎉</div>
                    <h3 className="text-xl font-bold text-green-700">Exchange Request Created!</h3>
                    <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Exchange ID:</p>
                        <p className="text-3xl font-bold text-green-700 font-mono">{result.exchange.exchangeID}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-left space-y-2">
                        <p><strong>You offer:</strong> {result.exchange.offeredQuantity} kg {result.exchange.offeredItem}</p>
                        <p><strong>You want:</strong> {result.exchange.requestedItem}</p>
                        {result.calculatedHours && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                                <p className="text-blue-800 font-bold">⏱️ Equipment Time Calculation:</p>
                                <p className="text-blue-700">{result.calculatedHours.weight} kg → {result.calculatedHours.hours} hours of {result.calculatedHours.equipment}</p>
                                <p className="text-xs text-blue-500">Rate: {result.calculatedHours.rate} kg/hour</p>
                            </div>
                        )}
                        <p><strong>Offered value:</strong> ₹{result.exchange.calculatedOfferedValue}</p>
                        <p><strong>Requested value:</strong> ₹{result.exchange.calculatedRequestedValue}</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { setResult(null); setFormData({ receiverCustomID: '', offeredItem: '', offeredQuantity: '', requestedItem: '', requestedQuantity: '' }); setCalculatedHours(null); setSelectedEquipment(''); }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                            New Exchange
                        </button>
                        <button onClick={() => navigate('/farmer/exchanges/sent')}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg">
                            View Sent
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-6 pb-24">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-green-700 mb-1 text-center">🔄 Exchange</h2>
                <p className="text-gray-500 text-sm text-center mb-4">Barter crops or exchange for equipment hours</p>

                {user && (
                    <p className="text-center text-sm text-gray-600 mb-3">
                        Your ID: <span className="font-mono font-bold text-green-700">{user.customID}</span>
                    </p>
                )}

                {/* Quick links */}
                <div className="flex gap-2 mb-4">
                    <Link to="/farmer/exchanges/sent" className="flex-1 text-center bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100">📤 Sent</Link>
                    <Link to="/farmer/exchanges/received" className="flex-1 text-center bg-orange-50 text-orange-700 py-2 rounded-lg text-sm font-semibold hover:bg-orange-100">📥 Received</Link>
                </div>

                {/* Exchange Type Toggle */}
                <div className="flex mb-5 bg-gray-100 rounded-lg p-1">
                    <button onClick={() => { setExchangeType('crop'); setSelectedEquipment(''); setCalculatedHours(null); setFormData({ ...formData, requestedItem: '', requestedQuantity: '' }); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${exchangeType === 'crop' ? 'bg-green-600 text-white shadow' : 'text-gray-600'}`}>
                        🌾 Crop Exchange
                    </button>
                    <button onClick={() => { setExchangeType('equipment'); setFormData({ ...formData, requestedItem: '', requestedQuantity: '1' }); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${exchangeType === 'equipment' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'}`}>
                        🚜 Equipment
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Receiver ID */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1 text-sm">Receiver's ID</label>
                        <input type="text" value={formData.receiverCustomID}
                            onChange={(e) => setFormData({ ...formData, receiverCustomID: e.target.value.toUpperCase() })}
                            className={`${inputClass} font-mono`} placeholder="FARM-XXXX or RET-XXXX" required />
                    </div>

                    {/* What you offer */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                        <h4 className="font-bold text-blue-700 text-sm">📦 What you OFFER (Produce)</h4>
                        <div>
                            <label className="block text-gray-700 text-sm mb-1">Crop / Item</label>
                            <input type="text" value={formData.offeredItem}
                                onChange={(e) => setFormData({ ...formData, offeredItem: e.target.value })}
                                className={inputClass} placeholder="e.g. Wheat, Rice, Tomatoes" required />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm mb-1">Quantity (kg)</label>
                            <input type="number" step="0.1" min="0.1" value={formData.offeredQuantity}
                                onChange={(e) => handleOfferedQuantityChange(e.target.value)}
                                className={inputClass} placeholder="e.g. 50" required />
                        </div>
                    </div>

                    {/* CROP EXCHANGE */}
                    {exchangeType === 'crop' && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                            <h4 className="font-bold text-orange-700 text-sm">🎯 What you WANT (Produce)</h4>
                            <div>
                                <label className="block text-gray-700 text-sm mb-1">Crop / Item</label>
                                <input type="text" value={formData.requestedItem}
                                    onChange={(e) => setFormData({ ...formData, requestedItem: e.target.value })}
                                    className={inputClass} placeholder="e.g. Onions, Sugarcane" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm mb-1">Quantity (kg)</label>
                                <input type="number" step="0.1" min="0.1" value={formData.requestedQuantity}
                                    onChange={(e) => setFormData({ ...formData, requestedQuantity: e.target.value })}
                                    className={inputClass} placeholder="e.g. 30" required />
                            </div>
                        </div>
                    )}

                    {/* EQUIPMENT EXCHANGE */}
                    {exchangeType === 'equipment' && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                            <h4 className="font-bold text-purple-700 text-sm">🚜 Select Equipment</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(EQUIPMENT_RATES).map(([name, data]) => (
                                    <button key={name} type="button"
                                        onClick={() => handleEquipmentChange(name)}
                                        className={`p-3 rounded-lg text-left border-2 transition-all text-sm ${selectedEquipment === name
                                            ? 'border-purple-500 bg-purple-100 shadow-md'
                                            : 'border-gray-200 bg-white hover:border-purple-300'
                                            }`}>
                                        <span className="text-lg">{data.icon}</span>
                                        <p className="font-bold text-gray-800">{name}</p>
                                        <p className="text-xs text-gray-500">{data.ratePerHour} kg/hr</p>
                                    </button>
                                ))}
                            </div>

                            {/* Hour Calculation Display */}
                            {calculatedHours && (
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 mt-3">
                                    <p className="text-sm opacity-90">⏱️ Equipment Time Calculation</p>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-2xl font-bold">{calculatedHours.hours} hours</p>
                                        <p className="text-sm opacity-80">
                                            of {calculatedHours.equipment} use
                                        </p>
                                        <div className="border-t border-white/30 pt-2 mt-2 text-xs">
                                            <p>🌾 {calculatedHours.weight} kg produce ÷ {calculatedHours.rate} kg/hr = {calculatedHours.hours} hrs</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button type="submit" className={btnClass} disabled={loading || (exchangeType === 'equipment' && !selectedEquipment)}>
                        {loading ? '⏳ Creating...' : '🔄 Send Exchange Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ExchangeRequestForm;

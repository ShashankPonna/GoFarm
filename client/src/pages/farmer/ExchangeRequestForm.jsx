import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { exchangeAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';

// Default equipment rates (user can override)
const DEFAULT_EQUIPMENT_RATES = {
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
    const [sendToEveryone, setSendToEveryone] = useState(true); // default: broadcast
    const [formData, setFormData] = useState({
        receiverCustomID: '',
        offeredItem: '',
        offeredQuantity: '',
        requestedItem: '',
        requestedQuantity: ''
    });
    const [selectedEquipment, setSelectedEquipment] = useState('');
    const [customRate, setCustomRate] = useState('');
    const [customHours, setCustomHours] = useState('');
    const [useCustomHours, setUseCustomHours] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    // Calculate equipment hours
    const getCalculatedHours = () => {
        if (!formData.offeredQuantity || !selectedEquipment) return null;
        const rate = customRate ? parseFloat(customRate) : DEFAULT_EQUIPMENT_RATES[selectedEquipment]?.ratePerHour || 1;
        if (rate <= 0) return null;

        if (useCustomHours && customHours) {
            return {
                hours: parseFloat(customHours),
                rate,
                equipment: selectedEquipment,
                weight: parseFloat(formData.offeredQuantity),
                isCustom: true
            };
        }

        const hours = parseFloat(formData.offeredQuantity) / rate;
        return {
            hours: Math.round(hours * 100) / 100,
            rate,
            equipment: selectedEquipment,
            weight: parseFloat(formData.offeredQuantity),
            isCustom: false
        };
    };

    const calculatedHours = getCalculatedHours();

    const handleEquipmentChange = (equipmentName) => {
        setSelectedEquipment(equipmentName);
        setCustomRate(DEFAULT_EQUIPMENT_RATES[equipmentName]?.ratePerHour?.toString() || '');
        setCustomHours('');
        setUseCustomHours(false);
        setFormData({ ...formData, requestedItem: equipmentName, requestedQuantity: '1' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);

        const { offeredItem, offeredQuantity, requestedItem, requestedQuantity } = formData;
        if (!offeredItem || !offeredQuantity || !requestedItem || !requestedQuantity) {
            setError('Please fill in all required fields');
            return;
        }

        if (!sendToEveryone && !formData.receiverCustomID) {
            setError('Please enter the receiver\'s ID or toggle "Send to Everyone"');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                offeredItem,
                offeredQuantity: Number(offeredQuantity),
                requestedItem: exchangeType === 'equipment' && calculatedHours
                    ? `${requestedItem} (${calculatedHours.hours} hrs @ ${calculatedHours.rate} kg/hr)`
                    : requestedItem,
                requestedQuantity: Number(requestedQuantity)
            };

            if (!sendToEveryone && formData.receiverCustomID) {
                payload.receiverCustomID = formData.receiverCustomID.toUpperCase();
            }

            const response = await exchangeAPI.create(payload);
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
                    <h3 className="text-xl font-bold text-green-700">
                        {result.exchange?.isOpen !== false && !result.exchange?.receiverCustomID
                            ? 'Open Exchange Posted!'
                            : 'Exchange Request Created!'}
                    </h3>
                    <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Exchange ID:</p>
                        <p className="text-3xl font-bold text-green-700 font-mono">{result.exchange.exchangeID}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-left space-y-2">
                        <p><strong>You offer:</strong> {result.exchange.offeredQuantity} kg {result.exchange.offeredItem}</p>
                        <p><strong>You want:</strong> {result.exchange.requestedItem}</p>
                        {result.exchange.isOpen && (
                            <p className="text-green-600 font-semibold">📢 Visible to everyone — anyone can accept!</p>
                        )}
                        {result.exchange.receiverCustomID && (
                            <p><strong>Sent to:</strong> {result.exchange.receiverCustomID}</p>
                        )}
                        {result.calculatedHours && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                                <p className="text-blue-800 font-bold">⏱️ Equipment Time:</p>
                                <p className="text-blue-700">{result.calculatedHours.weight} kg → {result.calculatedHours.hours} hours of {result.calculatedHours.equipment}</p>
                                <p className="text-xs text-blue-500">Rate: {result.calculatedHours.rate} kg/hour {result.calculatedHours.isCustom ? '(custom)' : ''}</p>
                            </div>
                        )}
                        <p><strong>Offered value:</strong> ₹{result.exchange.calculatedOfferedValue}</p>
                        <p><strong>Requested value:</strong> ₹{result.exchange.calculatedRequestedValue}</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { setResult(null); setFormData({ receiverCustomID: '', offeredItem: '', offeredQuantity: '', requestedItem: '', requestedQuantity: '' }); setSelectedEquipment(''); setCustomRate(''); setCustomHours(''); setUseCustomHours(false); }}
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
                    <button onClick={() => { setExchangeType('crop'); setSelectedEquipment(''); setCustomRate(''); setCustomHours(''); setUseCustomHours(false); setFormData({ ...formData, requestedItem: '', requestedQuantity: '' }); }}
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
                    {/* ===== SEND TO EVERYONE TOGGLE ===== */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-green-700 text-sm">📢 Send to Everyone</h4>
                                <p className="text-xs text-gray-500 mt-1">Anyone can see and accept your offer</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSendToEveryone(!sendToEveryone)}
                                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${sendToEveryone ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${sendToEveryone ? 'translate-x-7' : 'translate-x-0.5'}`}></span>
                            </button>
                        </div>

                        {!sendToEveryone && (
                            <div className="mt-3">
                                <label className="block text-gray-700 font-semibold mb-1 text-sm">Receiver's ID</label>
                                <input type="text" value={formData.receiverCustomID}
                                    onChange={(e) => setFormData({ ...formData, receiverCustomID: e.target.value.toUpperCase() })}
                                    className={`${inputClass} font-mono`} placeholder="FARM-XXXX or RET-XXXX" required />
                            </div>
                        )}
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
                                onChange={(e) => setFormData({ ...formData, offeredQuantity: e.target.value })}
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
                                {Object.entries(DEFAULT_EQUIPMENT_RATES).map(([name, data]) => (
                                    <button key={name} type="button"
                                        onClick={() => handleEquipmentChange(name)}
                                        className={`p-3 rounded-lg text-left border-2 transition-all text-sm ${selectedEquipment === name
                                            ? 'border-purple-500 bg-purple-100 shadow-md'
                                            : 'border-gray-200 bg-white hover:border-purple-300'
                                            }`}>
                                        <span className="text-lg">{data.icon}</span>
                                        <p className="font-bold text-gray-800">{name}</p>
                                        <p className="text-xs text-gray-500">Default: {data.ratePerHour} kg/hr</p>
                                    </button>
                                ))}
                            </div>

                            {/* Custom Rate Controls */}
                            {selectedEquipment && (
                                <div className="bg-white border border-purple-200 rounded-lg p-4 space-y-3">
                                    <h5 className="font-bold text-purple-600 text-sm">⚙️ Customize Exchange Rate</h5>
                                    
                                    <div>
                                        <label className="block text-gray-700 text-sm mb-1">Rate (kg per hour of equipment use)</label>
                                        <input type="number" step="0.1" min="0.1" value={customRate}
                                            onChange={(e) => { setCustomRate(e.target.value); setUseCustomHours(false); }}
                                            className={inputClass} placeholder={`Default: ${DEFAULT_EQUIPMENT_RATES[selectedEquipment]?.ratePerHour}`} />
                                        <p className="text-xs text-gray-400 mt-1">How many kg of produce per 1 hour of {selectedEquipment} use</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="useCustomHours" checked={useCustomHours}
                                            onChange={(e) => setUseCustomHours(e.target.checked)}
                                            className="w-4 h-4 accent-purple-600" />
                                        <label htmlFor="useCustomHours" className="text-sm text-gray-700 font-medium">Set hours directly instead</label>
                                    </div>

                                    {useCustomHours && (
                                        <div>
                                            <label className="block text-gray-700 text-sm mb-1">Hours of equipment use</label>
                                            <input type="number" step="0.5" min="0.5" value={customHours}
                                                onChange={(e) => setCustomHours(e.target.value)}
                                                className={inputClass} placeholder="e.g. 3" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Calculation Display */}
                            {calculatedHours && (
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 mt-3">
                                    <p className="text-sm opacity-90">⏱️ Equipment Time Calculation</p>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-2xl font-bold">{calculatedHours.hours} hours</p>
                                        <p className="text-sm opacity-80">of {calculatedHours.equipment} use</p>
                                        <div className="border-t border-white/30 pt-2 mt-2 text-xs">
                                            {calculatedHours.isCustom ? (
                                                <p>✏️ Custom: {calculatedHours.hours} hrs set manually</p>
                                            ) : (
                                                <p>🌾 {calculatedHours.weight} kg ÷ {calculatedHours.rate} kg/hr = {calculatedHours.hours} hrs</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button type="submit" className={btnClass} disabled={loading || (exchangeType === 'equipment' && !selectedEquipment)}>
                        {loading ? '⏳ Creating...' : (sendToEveryone ? '📢 Post Open Exchange' : '🔄 Send Exchange Request')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ExchangeRequestForm;

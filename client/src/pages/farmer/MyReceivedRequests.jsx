import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { exchangeAPI } from '../../utils/api';

const statusBadge = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Pending' },
    accepted: { bg: 'bg-blue-100', text: 'text-blue-800', label: '✅ Accepted' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', label: '🎉 Completed' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Rejected' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: '🚫 Cancelled' }
};

const MyReceivedRequests = () => {
    const [exchanges, setExchanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');
    const [receipt, setReceipt] = useState(null);
    const receiptRef = useRef(null);

    const fetchExchanges = async () => {
        try {
            const res = await exchangeAPI.getReceived();
            setExchanges(res.data.exchanges);
        } catch (err) {
            console.error('Failed to fetch received exchanges:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchExchanges(); }, []);

    const handleAccept = async (exchangeID) => {
        setActionLoading(exchangeID);
        try {
            await exchangeAPI.accept(exchangeID);
            fetchExchanges();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to accept');
        } finally {
            setActionLoading('');
        }
    };

    const handleReject = async (exchangeID) => {
        if (!window.confirm('Reject this exchange? The requester will lose 2 trust points.')) return;
        setActionLoading(exchangeID);
        try {
            await exchangeAPI.reject(exchangeID);
            fetchExchanges();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to reject');
        } finally {
            setActionLoading('');
        }
    };

    const handleComplete = async (exchangeID) => {
        setActionLoading(exchangeID);
        try {
            const res = await exchangeAPI.complete(exchangeID);
            alert(res.data.message);
            if (res.data.exchange.status === 'completed') {
                const ex = res.data.exchange;
                setReceipt({
                    exchangeID: ex.exchangeID,
                    from: { name: ex.requesterName, id: ex.requesterCustomID, phone: ex.requesterPhone },
                    to: { name: ex.receiverName, id: ex.receiverCustomID, phone: ex.receiverPhone },
                    offeredItem: ex.offeredItem, offeredQuantity: ex.offeredQuantity,
                    requestedItem: ex.requestedItem, requestedQuantity: ex.requestedQuantity,
                    valueDifference: ex.valueDifference, completedAt: ex.completedAt, createdAt: ex.createdAt
                });
            }
            fetchExchanges();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to confirm');
        } finally {
            setActionLoading('');
        }
    };

    const viewReceipt = (ex) => {
        setReceipt({
            exchangeID: ex.exchangeID,
            from: { name: ex.requesterName, id: ex.requesterCustomID, phone: ex.requesterPhone },
            to: { name: ex.receiverName, id: ex.receiverCustomID, phone: ex.receiverPhone },
            offeredItem: ex.offeredItem, offeredQuantity: ex.offeredQuantity,
            requestedItem: ex.requestedItem, requestedQuantity: ex.requestedQuantity,
            valueDifference: ex.valueDifference, completedAt: ex.completedAt, createdAt: ex.createdAt
        });
    };

    const printReceipt = () => {
        if (receiptRef.current) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`<html><head><title>Barter Receipt</title><style>body{font-family:Arial;padding:30px;} .receipt{border:2px solid #333;padding:20px;max-width:400px;margin:auto;} h2{text-align:center;} hr{border:none;border-top:1px dashed #ccc;margin:8px 0;} .row{display:flex;justify-content:space-between;padding:4px 0;} .center{text-align:center;}</style></head><body>${receiptRef.current.innerHTML}</body></html>`);
            printWindow.document.close();
            printWindow.print();
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500 text-lg">Loading...</p></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pb-24">
            <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-6 px-6 shadow-lg">
                <div className="container mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">📥 Incoming Exchanges</h1>
                        <p className="text-green-100 text-sm">{exchanges.length} request(s)</p>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/farmer/disputes" className="bg-red-500/80 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600">⚖️ Disputes</Link>
                        <Link to="/farmer/exchanges/sent" className="bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-white/30">📤 Sent</Link>
                        <Link to="/farmer/exchange/new" className="bg-white text-teal-700 px-3 py-2 rounded-lg font-semibold hover:bg-teal-50">+ New</Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6 max-w-xl">
                {exchanges.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-5xl mb-4">📭</p>
                        <p className="text-gray-500 text-lg">No incoming exchange requests</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {exchanges.map((ex) => {
                            const badge = statusBadge[ex.status] || statusBadge.pending;
                            return (
                                <div key={ex.exchangeID} className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-mono font-bold text-green-700 text-lg">{ex.exchangeID}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>{badge.label}</span>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm">
                                        <p className="font-bold text-gray-700 mb-1">📞 Requester:</p>
                                        <p>{ex.requesterName || 'N/A'} (<span className="font-mono">{ex.requesterCustomID}</span>)</p>
                                        <p>Phone: <a href={`tel:${ex.requesterPhone}`} className="text-blue-600 font-semibold">{ex.requesterPhone || 'N/A'}</a></p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <p className="text-gray-500 text-xs mb-1">They offer you</p>
                                            <p className="font-bold">{ex.offeredQuantity} {ex.offeredItem}</p>
                                            <p className="text-green-600 font-semibold">₹{ex.calculatedOfferedValue}</p>
                                        </div>
                                        <div className="bg-orange-50 rounded-lg p-3">
                                            <p className="text-gray-500 text-xs mb-1">They want from you</p>
                                            <p className="font-bold">{ex.requestedQuantity} {ex.requestedItem}</p>
                                            <p className="text-green-600 font-semibold">₹{ex.calculatedRequestedValue}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                        <span>Diff: <strong className={ex.valueDifference >= 0 ? 'text-green-600' : 'text-red-600'}>₹{ex.valueDifference}</strong></span>
                                        <span>{new Date(ex.createdAt).toLocaleDateString('en-IN')}</span>
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        {ex.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleAccept(ex.exchangeID)} disabled={actionLoading === ex.exchangeID}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                                                    {actionLoading === ex.exchangeID ? '...' : '✅ Accept'}
                                                </button>
                                                <button onClick={() => handleReject(ex.exchangeID)} disabled={actionLoading === ex.exchangeID}
                                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                                                    {actionLoading === ex.exchangeID ? '...' : '❌ Reject'}
                                                </button>
                                            </>
                                        )}
                                        {ex.status === 'accepted' && !ex.receiverConfirmed && (
                                            <button onClick={() => handleComplete(ex.exchangeID)} disabled={actionLoading === ex.exchangeID}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                                                {actionLoading === ex.exchangeID ? '...' : '✅ Confirm Delivery'}
                                            </button>
                                        )}
                                        {ex.status === 'accepted' && ex.receiverConfirmed && !ex.requesterConfirmed && (
                                            <span className="flex-1 text-center text-sm text-blue-600 font-semibold py-2">⏳ Waiting for other party...</span>
                                        )}
                                        {ex.status === 'completed' && (
                                            <button onClick={() => viewReceipt(ex)}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold">
                                                🧾 View Receipt
                                            </button>
                                        )}
                                        {['accepted', 'completed'].includes(ex.status) && (
                                            <Link to="/farmer/disputes"
                                                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-xs font-semibold text-center">
                                                🚨 Raise Complaint
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Barter Receipt Modal */}
            {receipt && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReceipt(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                        <div ref={receiptRef}>
                            <div className="receipt">
                                <h2 className="text-xl font-bold text-center text-green-700 mb-1">🧾 Barter Receipt</h2>
                                <p className="text-center text-sm text-gray-500 mb-4">GoFarm Exchange Platform</p>
                                <hr className="mb-3" />
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Exchange ID:</span><strong className="font-mono">{receipt.exchangeID}</strong></div>
                                    <hr className="border-dashed" />
                                    <p className="font-bold text-gray-700">From (Requester):</p>
                                    <div className="flex justify-between"><span>Name:</span><span>{receipt.from.name}</span></div>
                                    <div className="flex justify-between"><span>ID:</span><span className="font-mono">{receipt.from.id}</span></div>
                                    <div className="flex justify-between"><span>Phone:</span><span>{receipt.from.phone}</span></div>
                                    <hr className="border-dashed" />
                                    <p className="font-bold text-gray-700">To (Receiver):</p>
                                    <div className="flex justify-between"><span>Name:</span><span>{receipt.to.name}</span></div>
                                    <div className="flex justify-between"><span>ID:</span><span className="font-mono">{receipt.to.id}</span></div>
                                    <div className="flex justify-between"><span>Phone:</span><span>{receipt.to.phone}</span></div>
                                    <hr className="border-dashed" />
                                    <p className="font-bold text-gray-700">Exchange Details:</p>
                                    <div className="flex justify-between"><span>Offered:</span><span>{receipt.offeredQuantity} {receipt.offeredItem}</span></div>
                                    <div className="flex justify-between"><span>Received:</span><span>{receipt.requestedQuantity} {receipt.requestedItem}</span></div>
                                    <div className="flex justify-between"><span>Value Diff:</span><strong>₹{receipt.valueDifference}</strong></div>
                                    <hr className="border-dashed" />
                                    <div className="flex justify-between"><span>Status:</span><span className="text-green-600 font-bold">✅ COMPLETED</span></div>
                                    <div className="flex justify-between"><span>Date:</span><span>{new Date(receipt.completedAt || receipt.createdAt).toLocaleString('en-IN')}</span></div>
                                </div>
                                <div className="mt-4 text-center text-xs text-gray-400">Thank you for using GoFarm Exchange!</div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={printReceipt} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold text-sm">🖨️ Print</button>
                            <button onClick={() => setReceipt(null)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-bold text-sm">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyReceivedRequests;

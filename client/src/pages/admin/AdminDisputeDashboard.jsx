import { useState, useEffect } from 'react';
import { disputeAPI } from '../../utils/api';
import { IMAGE_BASE_URL } from '../../utils/api';

const statusBadge = {
    open: { bg: 'bg-red-100', text: 'text-red-700', label: '🔴 Open' },
    under_review: { bg: 'bg-orange-100', text: 'text-orange-700', label: '🟠 Under Review' },
    resolved: { bg: 'bg-green-100', text: 'text-green-700', label: '🟢 Resolved' },
    rejected: { bg: 'bg-gray-100', text: 'text-gray-600', label: '⚫ Rejected' }
};

const reasonLabels = {
    item_not_received: '📦 Item Not Received',
    wrong_item: '❌ Wrong Item',
    quality_issue: '⚠️ Quality Issue',
    quantity_mismatch: '📏 Quantity Mismatch',
    fraud: '🚨 Fraud',
    other: '📋 Other'
};

const AdminDisputeDashboard = () => {
    const [disputes, setDisputes] = useState([]);
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [actionLoading, setActionLoading] = useState('');
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [resolveForm, setResolveForm] = useState({ adminDecision: '', trustPenalty: 2 });

    const fetchDisputes = async () => {
        try {
            const res = await disputeAPI.adminGetAll(filter || null);
            setDisputes(res.data.disputes);
            setCounts(res.data.counts);
        } catch (err) {
            console.error('Failed to fetch disputes:', err);
            alert(err.response?.data?.message || 'Failed to load disputes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDisputes(); }, [filter]); // eslint-disable-line

    const handleReview = async (disputeID) => {
        setActionLoading(disputeID);
        try {
            await disputeAPI.review(disputeID);
            fetchDisputes();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed');
        } finally {
            setActionLoading('');
        }
    };

    const handleResolve = async () => {
        if (!resolveForm.adminDecision.trim()) {
            alert('Please enter your decision');
            return;
        }
        setActionLoading(selectedDispute.disputeID);
        try {
            await disputeAPI.resolve(selectedDispute.disputeID, resolveForm);
            setSelectedDispute(null);
            setResolveForm({ adminDecision: '', trustPenalty: 2 });
            fetchDisputes();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed');
        } finally {
            setActionLoading('');
        }
    };

    const handleReject = async (disputeID) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        setActionLoading(disputeID);
        try {
            await disputeAPI.reject(disputeID, { adminDecision: reason });
            fetchDisputes();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed');
        } finally {
            setActionLoading('');
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500 text-lg">Loading...</p></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-red-50 pb-24">
            {/* Header */}
            <header className="bg-gradient-to-r from-red-700 to-red-800 text-white py-6 px-6 shadow-lg">
                <div className="container mx-auto">
                    <h1 className="text-2xl font-bold">⚖️ Dispute Resolution Dashboard</h1>
                    <p className="text-red-200 text-sm">Manage disputes, review evidence, resolve conflicts</p>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6 max-w-4xl">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    {[
                        { key: '', label: 'All', count: counts.total || 0, color: 'bg-blue-500' },
                        { key: 'open', label: 'Open', count: counts.open || 0, color: 'bg-red-500' },
                        { key: 'under_review', label: 'Reviewing', count: counts.under_review || 0, color: 'bg-orange-500' },
                        { key: 'resolved', label: 'Resolved', count: counts.resolved || 0, color: 'bg-green-500' },
                        { key: 'rejected', label: 'Rejected', count: counts.rejected || 0, color: 'bg-gray-500' },
                    ].map(s => (
                        <button key={s.key} onClick={() => setFilter(s.key)}
                            className={`rounded-xl p-3 text-center transition-all ${filter === s.key ? 'ring-2 ring-offset-2 ring-blue-500 shadow-lg scale-105' : 'shadow-md hover:shadow-lg'} bg-white`}>
                            <p className={`text-2xl font-bold ${s.color.replace('bg-', 'text-')}`}>{s.count}</p>
                            <p className="text-xs text-gray-500">{s.label}</p>
                        </button>
                    ))}
                </div>

                {/* Disputes List */}
                {disputes.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-5xl mb-4">✅</p>
                        <p className="text-gray-500 text-lg">No disputes {filter ? `with status: ${filter}` : ''}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {disputes.map((d) => {
                            const badge = statusBadge[d.status] || statusBadge.open;
                            return (
                                <div key={d.disputeID} className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
                                    {/* Header Row */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <span className="font-mono font-bold text-red-700 text-lg">{d.disputeID}</span>
                                            <span className="text-gray-400 text-sm ml-2">→ {d.exchangeID}</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>{badge.label}</span>
                                    </div>

                                    {/* Parties */}
                                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <p className="text-gray-500 text-xs mb-1">Raised By</p>
                                            <p className="font-bold">{d.raisedByName}</p>
                                            <p className="font-mono text-xs text-gray-600">{d.raisedByCustomID}</p>
                                        </div>
                                        <div className="bg-red-50 rounded-lg p-3">
                                            <p className="text-gray-500 text-xs mb-1">Against</p>
                                            <p className="font-bold">{d.againstName}</p>
                                            <p className="font-mono text-xs text-gray-600">{d.againstCustomID}</p>
                                        </div>
                                    </div>

                                    {/* Reason & Description */}
                                    <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm">
                                        <p className="font-bold text-gray-700 mb-1">{reasonLabels[d.reason] || d.reason}</p>
                                        <p className="text-gray-600">{d.description}</p>
                                    </div>

                                    {/* Evidence */}
                                    {d.evidenceFiles && d.evidenceFiles.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-xs font-bold text-gray-500 mb-2">📎 Evidence ({d.evidenceFiles.length} file{d.evidenceFiles.length > 1 ? 's' : ''})</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {d.evidenceFiles.map((file, i) => (
                                                    <a key={i} href={`${IMAGE_BASE_URL}${file.url}`} target="_blank" rel="noopener noreferrer"
                                                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold">
                                                        {file.fileType?.includes('pdf') ? '📄' : '🖼️'} {file.originalName || `File ${i + 1}`}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Admin Decision (if resolved/rejected) */}
                                    {d.adminDecision && (
                                        <div className={`rounded-lg p-3 mb-3 text-sm ${d.status === 'resolved' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                                            <p className="font-bold text-gray-700 mb-1">⚖️ Admin Decision:</p>
                                            <p>{d.adminDecision}</p>
                                            {d.trustPenalty > 0 && <p className="text-red-600 font-bold mt-1">Trust Penalty: -{d.trustPenalty}</p>}
                                            {d.resolvedAt && <p className="text-xs text-gray-400 mt-1">{new Date(d.resolvedAt).toLocaleString('en-IN')}</p>}
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                        <span>Created: {new Date(d.createdAt).toLocaleString('en-IN')}</span>
                                        {d.resolvedAt && <span>• Resolved: {new Date(d.resolvedAt).toLocaleString('en-IN')}</span>}
                                    </div>

                                    {/* Admin Actions */}
                                    <div className="flex gap-2">
                                        {d.status === 'open' && (
                                            <>
                                                <button onClick={() => handleReview(d.disputeID)} disabled={actionLoading === d.disputeID}
                                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                                                    {actionLoading === d.disputeID ? '...' : '🔍 Start Review'}
                                                </button>
                                                <button onClick={() => handleReject(d.disputeID)} disabled={actionLoading === d.disputeID}
                                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                                                    {actionLoading === d.disputeID ? '...' : '❌ Reject'}
                                                </button>
                                            </>
                                        )}
                                        {d.status === 'under_review' && (
                                            <>
                                                <button onClick={() => { setSelectedDispute(d); setResolveForm({ adminDecision: '', trustPenalty: 2 }); }}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold">
                                                    ✅ Resolve
                                                </button>
                                                <button onClick={() => handleReject(d.disputeID)} disabled={actionLoading === d.disputeID}
                                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                                                    ❌ Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Resolve Modal */}
            {selectedDispute && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDispute(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-green-700 mb-4">⚖️ Resolve Dispute {selectedDispute.disputeID}</h3>

                        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                            <p><strong>Exchange:</strong> {selectedDispute.exchangeID}</p>
                            <p><strong>Raised by:</strong> {selectedDispute.raisedByName} ({selectedDispute.raisedByCustomID})</p>
                            <p><strong>Against:</strong> {selectedDispute.againstName} ({selectedDispute.againstCustomID})</p>
                            <p><strong>Reason:</strong> {reasonLabels[selectedDispute.reason] || selectedDispute.reason}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Admin Decision *</label>
                                <textarea value={resolveForm.adminDecision}
                                    onChange={(e) => setResolveForm({ ...resolveForm, adminDecision: e.target.value })}
                                    className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-green-500 focus:outline-none"
                                    rows="3" placeholder="Enter your decision and action taken..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Trust Penalty (against {selectedDispute.againstCustomID})</label>
                                <div className="flex gap-2">
                                    {[0, 2, 5, 10].map(val => (
                                        <button key={val} type="button"
                                            onClick={() => setResolveForm({ ...resolveForm, trustPenalty: val })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition ${resolveForm.trustPenalty === val
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-gray-200 text-gray-500'}`}>
                                            {val === 0 ? 'None' : `-${val}`}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    {resolveForm.trustPenalty === 0 && 'No penalty'}
                                    {resolveForm.trustPenalty === 2 && 'Minor issue'}
                                    {resolveForm.trustPenalty === 5 && 'Major violation'}
                                    {resolveForm.trustPenalty === 10 && '🚨 Fraud / Severe'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-5">
                            <button onClick={handleResolve} disabled={actionLoading === selectedDispute.disputeID}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold disabled:opacity-50">
                                {actionLoading === selectedDispute.disputeID ? 'Resolving...' : '✅ Confirm Resolve'}
                            </button>
                            <button onClick={() => setSelectedDispute(null)}
                                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDisputeDashboard;

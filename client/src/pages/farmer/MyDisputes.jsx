import { useState, useEffect } from 'react';
import { disputeAPI, IMAGE_BASE_URL } from '../../utils/api';

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

const MyDisputes = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ exchangeID: '', reason: 'quality_issue', description: '' });
    const [evidence, setEvidence] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const fetchDisputes = async () => {
        try {
            const res = await disputeAPI.getMine();
            setDisputes(res.data.disputes);
        } catch (err) {
            console.error('Failed to fetch disputes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDisputes(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.exchangeID || !formData.description) {
            alert('Please fill all fields');
            return;
        }
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('exchangeID', formData.exchangeID.toUpperCase());
            fd.append('reason', formData.reason);
            fd.append('description', formData.description);
            evidence.forEach(file => fd.append('evidence', file));

            await disputeAPI.create(fd);
            alert('Dispute raised successfully!');
            setShowForm(false);
            setFormData({ exchangeID: '', reason: 'quality_issue', description: '' });
            setEvidence([]);
            fetchDisputes();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to raise dispute');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500 text-lg">Loading...</p></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 pb-24">
            <header className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-6 px-6 shadow-lg">
                <div className="container mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">⚖️ My Disputes</h1>
                        <p className="text-red-100 text-sm">{disputes.length} dispute(s)</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)}
                        className="bg-white text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-50">
                        {showForm ? '✕ Close' : '🚨 Raise Complaint'}
                    </button>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6 max-w-xl">
                {/* Raise Complaint Form */}
                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg border-2 border-red-200 p-5 mb-6">
                        <h3 className="text-lg font-bold text-red-700 mb-3">🚨 Raise a Complaint</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Exchange ID *</label>
                                <input type="text" value={formData.exchangeID}
                                    onChange={(e) => setFormData({ ...formData, exchangeID: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none font-mono"
                                    placeholder="EXCH-0001" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Reason *</label>
                                <select value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none">
                                    <option value="item_not_received">📦 Item Not Received</option>
                                    <option value="wrong_item">❌ Wrong Item</option>
                                    <option value="quality_issue">⚠️ Quality Issue</option>
                                    <option value="quantity_mismatch">📏 Quantity Mismatch</option>
                                    <option value="fraud">🚨 Fraud</option>
                                    <option value="other">📋 Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                                <textarea value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                                    rows="3" placeholder="Describe the issue in detail..." required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">📎 Evidence (images/PDF, max 5)</label>
                                <input type="file" accept="image/*,.pdf" multiple
                                    onChange={(e) => setEvidence(Array.from(e.target.files).slice(0, 5))}
                                    className="w-full border-2 border-dashed border-gray-300 p-3 rounded-lg cursor-pointer hover:border-red-400 text-sm" />
                                {evidence.length > 0 && (
                                    <p className="text-xs text-green-600 mt-1">✅ {evidence.length} file(s) selected</p>
                                )}
                            </div>
                            <button type="submit" disabled={submitting}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg disabled:opacity-50">
                                {submitting ? '⏳ Submitting...' : '🚨 Submit Complaint'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Disputes List */}
                {disputes.length === 0 && !showForm ? (
                    <div className="text-center py-16">
                        <p className="text-5xl mb-4">✅</p>
                        <p className="text-gray-500 text-lg">No disputes</p>
                        <p className="text-gray-400 text-sm mt-1">All exchanges are smooth!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {disputes.map((d) => {
                            const badge = statusBadge[d.status] || statusBadge.open;
                            return (
                                <div key={d.disputeID} className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <span className="font-mono font-bold text-red-700 text-lg">{d.disputeID}</span>
                                            <span className="text-gray-400 text-sm ml-2">→ {d.exchangeID}</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>{badge.label}</span>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm">
                                        <p className="font-bold text-gray-700 mb-1">{reasonLabels[d.reason] || d.reason}</p>
                                        <p className="text-gray-600">{d.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                        <div className="bg-blue-50 rounded-lg p-2">
                                            <p className="text-gray-400 text-xs">Raised By</p>
                                            <p className="font-bold">{d.raisedByName} <span className="font-mono text-xs">({d.raisedByCustomID})</span></p>
                                        </div>
                                        <div className="bg-red-50 rounded-lg p-2">
                                            <p className="text-gray-400 text-xs">Against</p>
                                            <p className="font-bold">{d.againstName} <span className="font-mono text-xs">({d.againstCustomID})</span></p>
                                        </div>
                                    </div>

                                    {/* Evidence */}
                                    {d.evidenceFiles && d.evidenceFiles.length > 0 && (
                                        <div className="mb-3 flex gap-2 flex-wrap">
                                            {d.evidenceFiles.map((file, i) => (
                                                <a key={i} href={`${IMAGE_BASE_URL}${file.url}`} target="_blank" rel="noopener noreferrer"
                                                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold">
                                                    {file.fileType?.includes('pdf') ? '📄' : '🖼️'} {file.originalName || `File ${i + 1}`}
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    {/* Admin Decision */}
                                    {d.adminDecision && (
                                        <div className={`rounded-lg p-3 mb-3 text-sm ${d.status === 'resolved' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                                            <p className="font-bold text-gray-700 mb-1">⚖️ Decision:</p>
                                            <p>{d.adminDecision}</p>
                                            {d.trustPenalty > 0 && <p className="text-red-600 font-bold mt-1">Trust Penalty: -{d.trustPenalty}</p>}
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    <div className="flex flex-col gap-1 text-xs text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                            <span>Created: {new Date(d.createdAt).toLocaleString('en-IN')}</span>
                                        </div>
                                        {d.status === 'under_review' && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                                                <span>Under Review</span>
                                            </div>
                                        )}
                                        {d.resolvedAt && (
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${d.status === 'resolved' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                                                <span>{d.status === 'resolved' ? 'Resolved' : 'Rejected'}: {new Date(d.resolvedAt).toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDisputes;

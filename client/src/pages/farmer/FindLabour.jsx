import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { farmWorkAPI, cropsAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const WORK_TYPES = ['Harvesting', 'Sowing', 'Irrigation', 'Weeding', 'Ploughing', 'Spraying', 'Transplanting', 'Threshing', 'Loading/Unloading', 'Other'];

const FindLabour = () => {
    const user = useAuthStore(state => state.user);
    const [activeTab, setActiveTab] = useState('nearby');
    const [nearbyPosts, setNearbyPosts] = useState([]);
    const [myPosts, setMyPosts] = useState([]);
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [appliedIds, setAppliedIds] = useState(new Set());
    const [applyingId, setApplyingId] = useState(null);
    const [justClosedId, setJustClosedId] = useState(null);
    const [expandedApplicants, setExpandedApplicants] = useState(new Set());

    const [formData, setFormData] = useState({
        farmId: '',
        cropName: '',
        farmSize: '',
        workType: '',
        totalWorkDays: '',
        workingHoursPerDay: '',
        paymentType: 'Daily',
        paymentAmount: '',
        labourNeeded: '',
        description: ''
    });

    // --- Data fetching ---
    const fetchNearby = useCallback(async () => {
        setLoading(true);
        try {
            const res = await farmWorkAPI.getNearby();
            const posts = res.data.posts || [];
            setNearbyPosts(posts);
            // Track which posts the logged-in user already applied to
            if (user?._id) {
                const applied = new Set();
                posts.forEach(p => {
                    if (p.applicants?.some(a => a.userId === user._id)) {
                        applied.add(p._id);
                    }
                });
                setAppliedIds(applied);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load nearby posts');
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchMyPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await farmWorkAPI.getMyPosts();
            setMyPosts(res.data.posts || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load your posts');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFarms = useCallback(async () => {
        try {
            const res = await cropsAPI.getAll();
            setFarms(res.data.crops || res.data || []);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        if (activeTab === 'nearby') fetchNearby();
        else if (activeTab === 'myPosts') fetchMyPosts();
        else if (activeTab === 'post') fetchFarms();
    }, [activeTab, fetchNearby, fetchMyPosts, fetchFarms]);

    // --- Handlers ---
    const handleApply = async (postId) => {
        setApplyingId(postId);
        try {
            const res = await farmWorkAPI.apply(postId);
            const updated = res.data.post;
            setAppliedIds(prev => new Set(prev).add(postId));
            toast.success(res.data.message || 'Applied successfully!');

            // Update post in list
            setNearbyPosts(prev => prev.map(p => p._id === postId ? { ...p, ...updated } : p));

            // Trigger close animation
            if (updated?.status === 'Closed') {
                setJustClosedId(postId);
                setTimeout(() => setJustClosedId(null), 3000);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to apply');
        } finally {
            setApplyingId(null);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const { cropName, farmSize, workType, totalWorkDays, workingHoursPerDay, paymentType, paymentAmount, labourNeeded } = formData;
        if (!cropName || !farmSize || !workType || !totalWorkDays || !workingHoursPerDay || !paymentType || !paymentAmount || !labourNeeded) {
            toast.error('Please fill all required fields');
            return;
        }
        setCreating(true);
        try {
            await farmWorkAPI.create({
                ...formData,
                totalWorkDays: Number(totalWorkDays),
                paymentAmount: Number(paymentAmount),
                labourNeeded: Number(labourNeeded),
                farmId: formData.farmId || undefined
            });
            toast.success('Work requirement posted successfully! 🎉');
            setFormData({ farmId: '', cropName: '', farmSize: '', workType: '', totalWorkDays: '', workingHoursPerDay: '', paymentType: 'Daily', paymentAmount: '', labourNeeded: '', description: '' });
            setActiveTab('myPosts');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create post');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Delete this work post?')) return;
        try {
            await farmWorkAPI.delete(postId);
            toast.success('Post deleted');
            setMyPosts(prev => prev.filter(p => p._id !== postId));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        }
    };

    const handleClose = async (postId) => {
        if (!window.confirm('Manually close this post?')) return;
        try {
            await farmWorkAPI.close(postId);
            toast.success('Post closed');
            fetchMyPosts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to close');
        }
    };

    // --- Render helpers ---
    const inputClass = 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all bg-white text-sm';
    const labelClass = 'block text-gray-700 font-semibold mb-1 text-sm';

    const renderWorkCard = (post, showActions = false) => {
        const isClosed = post.status === 'Closed';
        const hasApplied = appliedIds.has(post._id);
        const isApplying = applyingId === post._id;
        const wasjustClosed = justClosedId === post._id;
        const progress = post.labourNeeded > 0 ? Math.min((post.labourApplied / post.labourNeeded) * 100, 100) : 0;
        const isOwner = user?._id === (post.postedBy?._id || post.postedBy);

        return (
            <div key={post._id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-500 ${wasjustClosed ? 'border-green-500 ring-4 ring-green-200 scale-[1.02]' :
                    isClosed ? 'border-gray-200 opacity-80' : 'border-green-100 hover:shadow-xl hover:-translate-y-1'
                    }`}
            >
                {/* Close celebration overlay */}
                {wasjustClosed && (
                    <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center z-10 animate-pulse rounded-2xl">
                        <div className="bg-white px-6 py-4 rounded-xl shadow-2xl text-center">
                            <div className="text-4xl mb-2">🎉</div>
                            <p className="text-green-700 font-bold text-lg">Requirement Fulfilled!</p>
                        </div>
                    </div>
                )}

                {/* Top badge bar */}
                <div className={`px-4 py-2 flex items-center justify-between ${isClosed ? 'bg-gray-100' : 'bg-gradient-to-r from-green-50 to-emerald-50'}`}>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isClosed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isClosed ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></span>
                        {isClosed ? 'Closed' : 'Open'}
                    </span>
                    {!isClosed && !isOwner && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            📍 Nearby Opportunity
                        </span>
                    )}
                </div>

                {/* Card body */}
                <div className="p-4 space-y-3">
                    {/* Title row */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">{post.cropName}</h3>
                            <p className="text-xs text-gray-500">{post.workType} • {post.farmSize}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-green-700">₹{post.paymentAmount}</p>
                            <p className="text-xs text-gray-500">/{post.paymentType === 'Hourly' ? 'hr' : 'day'}</p>
                        </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-blue-600 font-medium">Work Days</p>
                            <p className="text-sm font-bold text-blue-800">{post.totalWorkDays}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-purple-600 font-medium">Hours/Day</p>
                            <p className="text-sm font-bold text-purple-800">{post.workingHoursPerDay}</p>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <span>📍</span>
                        <span>{[post.location?.village, post.location?.taluka, post.location?.district].filter(Boolean).join(', ')}</span>
                    </div>

                    {/* Description */}
                    {post.description && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2 line-clamp-2">{post.description}</p>
                    )}

                    {/* Labour progress */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold text-gray-600">Labour Progress</span>
                            <span className="text-xs font-bold text-gray-800">{post.labourApplied}/{post.labourNeeded}</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${progress >= 100 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                    progress >= 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                        'bg-gradient-to-r from-blue-400 to-blue-600'
                                    }`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Posted by info (for nearby tab) */}
                    {post.postedBy?.name && !isOwner && (
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center font-bold text-xs">
                                    {post.postedBy.name.charAt(0)}
                                </span>
                                <span>Posted by <strong>{post.postedBy.name}</strong></span>
                                {post.postedBy.customID && <span className="font-mono text-gray-400">({post.postedBy.customID})</span>}
                            </div>
                            {post.postedBy.phone && (
                                <a href={`tel:${post.postedBy.phone}`} className="text-green-600 text-xs font-semibold bg-white px-2 py-1 rounded-lg border border-green-200 hover:bg-green-50">
                                    📞 {post.postedBy.phone}
                                </a>
                            )}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-1">
                        {showActions ? (
                            <div className="flex gap-2">
                                {post.status === 'Open' && (
                                    <button onClick={() => handleClose(post._id)}
                                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                                        ⏹️ Close Post
                                    </button>
                                )}
                                <button onClick={() => handleDelete(post._id)}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                                    🗑️ Delete
                                </button>
                            </div>
                        ) : isClosed ? (
                            <div className="bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl text-sm text-center">
                                ✅ Requirement Fulfilled
                            </div>
                        ) : hasApplied ? (
                            <div className="bg-green-100 text-green-700 font-bold py-2.5 rounded-xl text-sm text-center">
                                ✔️ Applied Successfully
                            </div>
                        ) : isOwner ? (
                            <div className="bg-blue-50 text-blue-600 font-bold py-2.5 rounded-xl text-sm text-center">
                                📝 Your Post
                            </div>
                        ) : (
                            <button onClick={() => handleApply(post._id)}
                                disabled={isApplying}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 active:scale-[0.98]">
                                {isApplying ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Applying...
                                    </span>
                                ) : '🙋 Apply Now'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Who's Ready button - shown on ALL posts when there are applicants */}
                {post.applicants?.length > 0 && (
                    <div className="border-t border-gray-100">
                        <button
                            onClick={() => setExpandedApplicants(prev => {
                                const next = new Set(prev);
                                if (next.has(post._id)) next.delete(post._id);
                                else next.add(post._id);
                                return next;
                            })}
                            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            👥 Who's Ready for Work ({post.applicants.length})
                            <span className={`transition-transform duration-200 ${expandedApplicants.has(post._id) ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        {expandedApplicants.has(post._id) && (
                            <div className="px-4 pb-4 space-y-2">
                                {post.applicants.map((applicant, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-7 h-7 bg-green-200 text-green-800 rounded-full flex items-center justify-center font-bold text-xs">
                                                {applicant.name?.charAt(0) || '?'}
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{applicant.name}</p>
                                                <p className="text-xs text-gray-500">{applicant.village || 'N/A'}</p>
                                            </div>
                                        </div>
                                        {applicant.contact && (
                                            <a href={`tel:${applicant.contact}`} className="text-green-600 text-xs font-semibold bg-white px-2 py-1 rounded-lg border border-green-200 hover:bg-green-50">
                                                📞 {applicant.contact}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pb-28">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-green-100">
                <div className="max-w-2xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Link to="/farmer/dashboard" className="text-green-600 hover:text-green-700">
                                <i className="fas fa-arrow-left text-lg"></i>
                            </Link>
                            <h1 className="text-xl font-bold text-gray-800">👷 Find Labour</h1>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                        {[
                            { id: 'nearby', label: '📍 Nearby Posts', count: nearbyPosts.length },
                            { id: 'post', label: '➕ Post Work' },
                            { id: 'myPosts', label: '📋 My Posts', count: myPosts.length }
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-200'
                                    }`}>
                                {tab.label}
                                {tab.count !== undefined && activeTab === tab.id && (
                                    <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{tab.count}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-4">

                {/* ============ NEARBY POSTS TAB ============ */}
                {activeTab === 'nearby' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-gray-600">
                                Showing all open work posts
                            </p>
                            <button onClick={fetchNearby} disabled={loading}
                                className="text-green-600 text-sm font-semibold hover:text-green-700 disabled:opacity-50">
                                <i className="fas fa-sync-alt mr-1"></i> Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                <svg className="animate-spin h-10 w-10 mb-3 text-green-500" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <p className="font-medium">Loading nearby posts...</p>
                            </div>
                        ) : nearbyPosts.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">🌾</div>
                                <h3 className="text-xl font-bold text-gray-700 mb-2">No Nearby Work Posts</h3>
                                <p className="text-gray-500 mb-4">No open work requirements in your district right now.</p>
                                <button onClick={() => setActiveTab('post')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl transition-colors">
                                    ➕ Post a Requirement
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {nearbyPosts.map(post => renderWorkCard(post, false))}
                            </div>
                        )}
                    </div>
                )}

                {/* ============ POST WORK TAB ============ */}
                {activeTab === 'post' && (
                    <div className="bg-white rounded-2xl shadow-lg p-5 border border-green-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-1">📝 Post Work Requirement</h2>
                        <p className="text-xs text-gray-500 mb-4">Fill in details to find labourers in your area</p>

                        <form onSubmit={handleCreate} className="space-y-4">
                            {/* Farm Selection */}
                            {farms.length > 0 && (
                                <div>
                                    <label className={labelClass}>Select Farm (Optional)</label>
                                    <select value={formData.farmId} onChange={(e) => {
                                        const farm = farms.find(f => f._id === e.target.value);
                                        setFormData({
                                            ...formData,
                                            farmId: e.target.value,
                                            cropName: farm?.cropName || formData.cropName,
                                            farmSize: farm ? `${farm.area} ${farm.areaUnit}` : formData.farmSize
                                        });
                                    }} className={inputClass}>
                                        <option value="">-- Choose a farm --</option>
                                        {farms.map(f => (
                                            <option key={f._id} value={f._id}>{f.cropName} - {f.plotName} ({f.area} {f.areaUnit})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Crop Name *</label>
                                    <input type="text" value={formData.cropName}
                                        onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                                        className={inputClass} placeholder="e.g. Cotton" required />
                                </div>
                                <div>
                                    <label className={labelClass}>Farm Size *</label>
                                    <input type="text" value={formData.farmSize}
                                        onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                                        className={inputClass} placeholder="e.g. 5 Acres" required />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Work Type *</label>
                                <select value={formData.workType}
                                    onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                                    className={inputClass} required>
                                    <option value="">-- Select work type --</option>
                                    {WORK_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Total Work Days *</label>
                                    <input type="number" min="1" value={formData.totalWorkDays}
                                        onChange={(e) => setFormData({ ...formData, totalWorkDays: e.target.value })}
                                        className={inputClass} placeholder="e.g. 5" required />
                                </div>
                                <div>
                                    <label className={labelClass}>Hours / Day *</label>
                                    <input type="text" value={formData.workingHoursPerDay}
                                        onChange={(e) => setFormData({ ...formData, workingHoursPerDay: e.target.value })}
                                        className={inputClass} placeholder="e.g. 8 AM - 5 PM" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Payment Type *</label>
                                    <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                                        {['Daily', 'Hourly'].map(type => (
                                            <button key={type} type="button"
                                                onClick={() => setFormData({ ...formData, paymentType: type })}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${formData.paymentType === type
                                                    ? 'bg-green-600 text-white shadow'
                                                    : 'text-gray-600'
                                                    }`}>
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Amount (₹) *</label>
                                    <input type="number" min="0" value={formData.paymentAmount}
                                        onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                                        className={inputClass} placeholder="e.g. 500" required />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Labour Needed *</label>
                                <input type="number" min="1" value={formData.labourNeeded}
                                    onChange={(e) => setFormData({ ...formData, labourNeeded: e.target.value })}
                                    className={inputClass} placeholder="e.g. 10" required />
                            </div>

                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea value={formData.description} rows="3"
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={inputClass} placeholder="Any additional details about the work..." />
                            </div>

                            {/* Summary preview */}
                            {formData.cropName && formData.paymentAmount && formData.labourNeeded && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                                    <h4 className="text-sm font-bold text-green-700 mb-2">📋 Post Summary</h4>
                                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-700">
                                        <p>🌾 <strong>{formData.cropName}</strong> — {formData.workType || '...'}</p>
                                        <p>📐 {formData.farmSize || '...'}</p>
                                        <p>💰 ₹{formData.paymentAmount}/{formData.paymentType === 'Hourly' ? 'hr' : 'day'}</p>
                                        <p>👷 {formData.labourNeeded} workers needed</p>
                                    </div>
                                </div>
                            )}

                            <button type="submit" disabled={creating}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] text-sm">
                                {creating ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Creating Post...
                                    </span>
                                ) : '📢 Post Requirement'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ============ MY POSTS TAB ============ */}
                {activeTab === 'myPosts' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-gray-600">Your posted work requirements</p>
                            <button onClick={fetchMyPosts} disabled={loading}
                                className="text-green-600 text-sm font-semibold hover:text-green-700 disabled:opacity-50">
                                <i className="fas fa-sync-alt mr-1"></i> Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                <svg className="animate-spin h-10 w-10 mb-3 text-green-500" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <p className="font-medium">Loading your posts...</p>
                            </div>
                        ) : myPosts.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">📋</div>
                                <h3 className="text-xl font-bold text-gray-700 mb-2">No Posts Yet</h3>
                                <p className="text-gray-500 mb-4">You haven't posted any work requirements.</p>
                                <button onClick={() => setActiveTab('post')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl transition-colors">
                                    ➕ Create First Post
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myPosts.map(post => renderWorkCard(post, true))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindLabour;

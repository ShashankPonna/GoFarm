import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const LabourTab = () => {
    const [activeSection, setActiveSection] = useState('browse');
    const [jobStatus, setJobStatus] = useState('active');
    const [labourList, setLabourList] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        cropName: '', farmSize: '', labourCount: '', wagePerDay: '',
        workingHours: '', date: '', description: '',
    });

    useEffect(() => {
        fetchLabour();
    }, []);

    const fetchLabour = async () => {
        setLoading(true);
        try {
            const response = await api.get('/farm-work/nearby', { params: { lat: 19.07, lon: 72.87, radius: 50 } });
            setLabourList(response.data.posts || []);
        } catch (err) {
            setLabourList([
                { _id: '1', name: 'Ramesh Patil', experience: '5 years', location: 'Pune', dailyWage: 400, rating: 4.5, skills: 'Harvesting, Ploughing' },
                { _id: '2', name: 'Sunil Jadhav', experience: '3 years', location: 'Nashik', dailyWage: 350, rating: 4.2, skills: 'Sowing, Spraying' },
                { _id: '3', name: 'Ganesh More', experience: '8 years', location: 'Kolhapur', dailyWage: 500, rating: 4.8, skills: 'Tractor, Irrigation' },
                { _id: '4', name: 'Prakash Shinde', experience: '2 years', location: 'Satara', dailyWage: 300, rating: 3.9, skills: 'Weeding, Picking' },
            ]);
        }
        try {
            const res = await api.get('/farm-work/my-posts');
            setMyJobs(res.data.posts || []);
        } catch (err) {
            setMyJobs([
                { _id: 'j1', cropName: 'Sugarcane', labourCount: 5, wagePerDay: 400, status: 'active', applicants: 3 },
                { _id: 'j2', cropName: 'Cotton', labourCount: 3, wagePerDay: 350, status: 'completed', applicants: 3 },
            ]);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/farm-work', { ...form, location: { type: 'Point', coordinates: [72.87, 19.07] } });
            toast.success('Labour requirement posted!');
            setForm({ cropName: '', farmSize: '', labourCount: '', wagePerDay: '', workingHours: '', date: '', description: '' });
            setActiveSection('jobs');
            fetchLabour();
        } catch (err) {
            toast.error('Failed to post requirement');
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i key={i} className={`fas fa-star text-xs ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}></i>
            );
        }
        return <div className="flex gap-0.5">{stars}</div>;
    };

    return (
        <div className="gf-page gf-animate-in">
            {/* Section Navigation */}
            <div className="gf-section">
                <div className="gf-toggle-row">
                    <button className={`gf-toggle-btn ${activeSection === 'post' ? 'active' : ''}`} onClick={() => setActiveSection('post')}>
                        <i className="fas fa-edit mr-1"></i>Post
                    </button>
                    <button className={`gf-toggle-btn ${activeSection === 'browse' ? 'active' : ''}`} onClick={() => setActiveSection('browse')}>
                        <i className="fas fa-search mr-1"></i>Find
                    </button>
                    <button className={`gf-toggle-btn ${activeSection === 'jobs' ? 'active' : ''}`} onClick={() => setActiveSection('jobs')}>
                        <i className="fas fa-briefcase mr-1"></i>My Jobs
                    </button>
                </div>
            </div>

            {/* Section 1: Post Requirement */}
            {activeSection === 'post' && (
                <div className="gf-section">
                    <div className="gf-section-title">
                        <span className="gf-title-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                            <i className="fas fa-clipboard-list"></i>
                        </span>
                        Post Labour Requirement
                    </div>
                    <form onSubmit={handleSubmit} className="gf-card">
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="gf-label">Crop Name</label>
                                <input className="gf-input" placeholder="e.g., Sugarcane" value={form.cropName} onChange={e => setForm({ ...form, cropName: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="gf-label">Farm Size (acres)</label>
                                    <input className="gf-input" type="number" placeholder="e.g., 5" value={form.farmSize} onChange={e => setForm({ ...form, farmSize: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="gf-label">Workers Needed</label>
                                    <input className="gf-input" type="number" placeholder="e.g., 5" value={form.labourCount} onChange={e => setForm({ ...form, labourCount: e.target.value })} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="gf-label">Wage/Day (₹)</label>
                                    <input className="gf-input" type="number" placeholder="e.g., 400" value={form.wagePerDay} onChange={e => setForm({ ...form, wagePerDay: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="gf-label">Working Hours</label>
                                    <input className="gf-input" placeholder="e.g., 8AM-5PM" value={form.workingHours} onChange={e => setForm({ ...form, workingHours: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="gf-label">Date Required</label>
                                <input className="gf-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                            </div>
                            <div>
                                <label className="gf-label">Description</label>
                                <textarea className="gf-input" rows={3} placeholder="Brief about the work..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
                            </div>
                            <button type="submit" className="gf-btn-primary w-full">
                                <i className="fas fa-paper-plane"></i> Post Requirement
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Section 2: Available Labour Nearby */}
            {activeSection === 'browse' && (
                <div className="gf-section">
                    <div className="gf-section-title">
                        <span className="gf-title-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                            <i className="fas fa-users"></i>
                        </span>
                        Available Labour Nearby
                    </div>
                    {loading ? (
                        <div className="flex flex-col gap-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="gf-labour-card">
                                    <div className="gf-skeleton" style={{ width: 48, height: 48, borderRadius: 14 }}></div>
                                    <div className="flex-1">
                                        <div className="gf-skeleton" style={{ width: '60%', height: 14, marginBottom: 6 }}></div>
                                        <div className="gf-skeleton" style={{ width: '40%', height: 12 }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {labourList.map((labour) => (
                                <div key={labour._id} className="gf-labour-card">
                                    <div className="gf-labour-avatar" style={{ background: '#ecfdf5' }}>
                                        👤
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm text-gray-800">{labour.name || labour.farmerName || 'Worker'}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            <i className="fas fa-briefcase mr-1 text-gray-400"></i>
                                            {labour.experience || `${labour.labourCount || 1} workers`}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-gray-500">
                                                <i className="fas fa-map-marker-alt mr-1 text-blue-400"></i>
                                                {labour.location?.name || labour.location || 'Nearby'}
                                            </span>
                                            {labour.rating && renderStars(labour.rating)}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-sm font-bold text-green-700">₹{labour.dailyWage || labour.wagePerDay}/day</div>
                                        <button className="gf-btn-outline text-xs py-1 px-2.5 mt-1.5">
                                            <i className="fas fa-phone"></i> Call
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Section 3: My Posted Jobs */}
            {activeSection === 'jobs' && (
                <div className="gf-section">
                    <div className="gf-section-title">
                        <span className="gf-title-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                            <i className="fas fa-clipboard-check"></i>
                        </span>
                        My Posted Jobs
                    </div>
                    <div className="gf-filter-row mb-4">
                        {['active', 'completed', 'closed'].map(s => (
                            <button key={s} className={`gf-filter-chip ${jobStatus === s ? 'active' : ''}`} onClick={() => setJobStatus(s)}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                    {myJobs.filter(j => j.status === jobStatus).length === 0 ? (
                        <div className="gf-card text-center py-6">
                            <i className="fas fa-inbox text-3xl text-gray-300 mb-2"></i>
                            <p className="text-sm text-gray-500">No {jobStatus} jobs</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {myJobs.filter(j => j.status === jobStatus).map(job => (
                                <div key={job._id} className="gf-card">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-sm text-gray-800">{job.cropName}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {job.labourCount} workers · ₹{job.wagePerDay}/day
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${job.status === 'active' ? 'bg-green-50 text-green-600' :
                                                    job.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                                                        'bg-gray-100 text-gray-500'
                                                }`}>
                                                {job.status}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                <i className="fas fa-user-check mr-0.5"></i>{job.applicants || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LabourTab;

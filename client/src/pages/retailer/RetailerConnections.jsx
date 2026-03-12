import React, { useEffect, useState } from 'react';
import { connectionsAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const RetailerConnections = () => {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchConnections();
    }, []);

    const fetchConnections = async () => {
        try {
            setLoading(true);
            const res = await connectionsAPI.getMyConnections();
            if (res.data.success) {
                // Filter for requests received by this user that are still pending
                setConnections(res.data.connections || []);
            }
        } catch (err) {
            console.error('Failed to fetch connections:', err);
            toast.error('Failed to load connections');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            const res = await connectionsAPI.acceptRequest(id);
            if (res.data.success) {
                toast.success('Connection accepted!');
                fetchConnections();
            }
        } catch (err) {
            console.error('Failed to accept connection:', err);
            toast.error('Failed to accept connection');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this request?')) return;
        try {
            const res = await connectionsAPI.rejectRequest(id);
            if (res.data.success) {
                toast.success('Connection request removed');
                fetchConnections();
            }
        } catch (err) {
            console.error('Failed to reject connection:', err);
            toast.error('Failed to remove request');
        }
    };

    const pendingRequests = connections.filter(c => c.receiver?._id === user?._id && c.status === 'pending');
    const acceptedConnections = connections.filter(c => c.status === 'accepted');

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-gradient-to-r from-green-700 to-green-600 text-white p-6 shadow-lg sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/retailer/dashboard" className="hover:bg-white/20 p-2 rounded-full transition-colors">
                            <i className="fas fa-arrow-left text-xl"></i>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Connections</h1>
                            <p className="text-green-100 text-sm">Manage your farmer network</p>
                        </div>
                    </div>
                    <i className="fas fa-handshake text-3xl opacity-50"></i>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 mt-6">
                {/* Pending Requests Section */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-yellow-500 rounded-full"></span>
                        Pending Invitations ({pendingRequests.length})
                    </h2>

                    {loading ? (
                        <div className="text-center py-10 bg-white rounded-2xl shadow-sm">
                            <i className="fas fa-spinner fa-spin text-3xl text-green-600 mb-2"></i>
                            <p className="text-gray-500">Loading invitations...</p>
                        </div>
                    ) : pendingRequests.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                            <i className="fas fa-user-clock text-4xl text-gray-300 mb-3"></i>
                            <p className="text-gray-500 font-medium">No new invitations</p>
                            <p className="text-gray-400 text-sm mt-1">When farmers invite you to connect, they'll appear here</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {pendingRequests.map(conn => (
                                <div key={conn._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center text-green-700 font-bold text-xl flex-shrink-0">
                                            {conn.sender?.name?.[0] || 'F'}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-800 text-lg truncate">{conn.sender?.name}</h3>
                                            <p className="text-sm text-gray-500">ID: {conn.sender?.customID}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Farmer</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button 
                                            onClick={() => handleAccept(conn._id)}
                                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <i className="fas fa-check"></i> Accept
                                        </button>
                                        <button 
                                            onClick={() => handleReject(conn._id)}
                                            className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <i className="fas fa-times"></i> Ignore
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* My Network Section */}
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-green-600 rounded-full"></span>
                        My Connections ({acceptedConnections.length})
                    </h2>

                    {acceptedConnections.length === 0 && !loading ? (
                        <div className="text-center py-10 bg-gray-100 rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-500 italic">No established connections yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {acceptedConnections.map(conn => {
                                const connectedUser = conn.sender?._id === user?._id ? conn.receiver : conn.sender;
                                return (
                                    <div key={conn._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                            {connectedUser?.name?.[0] || 'U'}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="font-bold text-gray-800 truncate">{connectedUser?.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <i className="fas fa-phone text-green-500"></i>
                                                <span>{connectedUser?.phone || 'No phone'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                            <span className="text-[10px] text-green-600 font-bold uppercase bg-green-50 px-2 py-0.5 rounded">Connected</span>
                                            <button 
                                                onClick={() => handleReject(conn._id)}
                                                className="text-xs text-red-400 hover:text-red-600 transition-colors"
                                                title="Remove Connection"
                                            >
                                                Disconnect
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default RetailerConnections;

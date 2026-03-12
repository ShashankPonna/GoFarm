import React from 'react';
import { Link } from 'react-router-dom';

const MoreTab = () => {
    const menuItems = [
        {
            label: 'Waste Management',
            desc: 'Sustainable waste solutions',
            icon: 'fa-recycle',
            iconBg: '#ecfdf5',
            iconColor: '#059669',
            link: '/farmer/waste',
        },
        {
            label: 'Reports',
            desc: 'Submit & view reports',
            icon: 'fa-file-alt',
            iconBg: '#eff6ff',
            iconColor: '#2563eb',
            link: '/report',
        },
        {
            label: 'Government Schemes',
            desc: 'Subsidies & benefits',
            icon: 'fa-landmark',
            iconBg: '#fffbeb',
            iconColor: '#d97706',
            link: '/farmer/schemes',
        },
        {
            label: 'Community',
            desc: 'Posts & discussions',
            icon: 'fa-users',
            iconBg: '#f5f3ff',
            iconColor: '#7c3aed',
            link: '/farmer/community',
        },
        {
            label: 'Disease Detection',
            desc: 'AI crop health scanner',
            icon: 'fa-microscope',
            iconBg: '#fef2f2',
            iconColor: '#dc2626',
            link: '/farmer/disease-detection',
        },
        {
            label: 'Crop Recommendation',
            desc: 'Best crops for your soil',
            icon: 'fa-seedling',
            iconBg: '#ecfdf5',
            iconColor: '#059669',
            link: '/farmer/crop-recommendation',
        },
        {
            label: 'Settings & Profile',
            desc: 'Account & preferences',
            icon: 'fa-cog',
            iconBg: '#f3f4f6',
            iconColor: '#6b7280',
            link: '/profile',
        },
        {
            label: 'Language',
            desc: 'Change app language',
            icon: 'fa-globe',
            iconBg: '#eff6ff',
            iconColor: '#2563eb',
            link: '/language-selection',
        },
    ];

    return (
        <div className="gf-page gf-animate-in">
            <div className="gf-section">
                <div className="gf-section-title">
                    <span className="gf-title-icon" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                        <i className="fas fa-th-large"></i>
                    </span>
                    More Features
                </div>
                <div className="flex flex-col">
                    {menuItems.map((item, i) => (
                        <Link key={i} to={item.link} className="gf-more-item">
                            <div className="gf-more-icon" style={{ background: item.iconBg, color: item.iconColor }}>
                                <i className={`fas ${item.icon}`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm">{item.label}</div>
                                <div className="text-xs text-gray-500">{item.desc}</div>
                            </div>
                            <i className="fas fa-chevron-right text-gray-300 text-sm"></i>
                        </Link>
                    ))}
                </div>
            </div>

            {/* App Info */}
            <div className="text-center py-6">
                <div className="text-sm font-bold">
                    <span className="text-emerald-700">Go</span>
                    <span className="text-amber-500">Farm</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">v1.0 · Made for Indian Farmers</div>
            </div>
        </div>
    );
};

export default MoreTab;

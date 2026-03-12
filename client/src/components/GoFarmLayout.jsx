import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LanguageSwitcher from './LanguageSwitcher';

const GoFarmLayout = () => {
    const location = useLocation();
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const currentPath = location.pathname;

    const tabs = [
        { path: '/farmer/home', icon: 'fa-home', label: 'Home' },
        { path: '/farmer/products-tab', icon: 'fa-box-open', label: 'Products' },
        { path: '/farmer/exchange-tab', icon: 'fa-exchange-alt', label: 'Exchange' },
        { path: '/farmer/labour-tab', icon: 'fa-hard-hat', label: 'Labour' },
        { path: '/farmer/market-ai', icon: 'fa-chart-line', label: 'Market AI' },
        { path: '/farmer/more', icon: 'fa-ellipsis-h', label: 'More' },
    ];

    const isActive = (path) => currentPath === path;



    return (
        <div className={`gofarm-app`}>
            {/* Top Header — matches screenshot */}
            <header className="gofarm-header">
                <div className="gofarm-header-inner">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-leaf text-xl" style={{ color: '#4E9F3D' }}></i>
                        <h1 className="text-xl font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                            <span style={{ color: '#2F6F3E' }}>Go</span>
                            <span style={{ color: '#D4A017' }}>Farm</span>
                        </h1>
                    </div>

                    <div className="relative flex-1 max-w-xs mx-4">
                        <i className="fas fa-search absolute left-3 top-2.5 text-gray-400 text-sm"></i>
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="gf-input pl-9 py-2 text-sm"
                            style={{ borderRadius: 20 }}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <Link to="/profile" className="gofarm-avatar">
                            <i className="fas fa-user text-xs text-white"></i>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="gofarm-content">
                <Outlet context={{ searchTerm }} />
            </main>

            <nav className="gofarm-bottom-nav">
                <div className="gofarm-nav-inner">
                    {tabs.map((tab) => {
                        const active = isActive(tab.path);
                        return (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={`gofarm-nav-tab ${active ? 'active' : ''}`}
                            >
                                <div className={`gofarm-nav-icon-wrap ${active ? 'active' : ''}`}>
                                    <i className={`fas ${tab.icon}`}></i>
                                </div>
                                <span className="gofarm-nav-label">{tab.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default GoFarmLayout;

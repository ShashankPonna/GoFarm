import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ color = 'text-gray-600', bgColor = 'bg-gray-100', className = '' }) => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            className={`flex items-center justify-center w-10 h-10 ${bgColor} ${color} rounded-xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-95 ${className}`}
        >
            <i className="fas fa-arrow-left"></i>
        </button>
    );
};

export default BackButton;

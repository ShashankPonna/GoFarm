import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ color = 'text-white', bgColor = 'bg-white/20', className = '' }) => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 ${bgColor} ${color} px-4 py-2 rounded-full font-bold text-sm backdrop-blur-md hover:bg-white/30 transition-all active:scale-95 ${className}`}
        >
            <i className="fas fa-arrow-left"></i>
            <span>Back</span>
        </button>
    );
};

export default BackButton;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, CheckCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RiderMobileNavBar() {
    const location = useLocation();
    const { user } = useAuth();
    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#232323] border-t border-gray-700 flex justify-around items-center h-16 md:hidden">
            <Link to="/rider/dashboard" className="flex flex-col items-center justify-center text-xs gap-1 px-2 py-1 focus:outline-none group">
                <ClipboardList size={24} className={isActive('/rider/dashboard', true) ? 'text-[#FFC107]' : 'text-white group-hover:text-[#FFC107]'} />
                <span className={isActive('/rider/dashboard', true) ? 'text-[#FFC107] font-bold' : 'text-white'}>Dashboard</span>
            </Link>
            <Link to="/rider/orders" className="flex flex-col items-center justify-center text-xs gap-1 px-2 py-1 focus:outline-none group">
                <CheckCircle size={24} className={isActive('/rider/orders', true) ? 'text-[#FFC107]' : 'text-white group-hover:text-[#FFC107]'} />
                <span className={isActive('/rider/orders', true) ? 'text-[#FFC107] font-bold' : 'text-white'}>My Orders</span>
            </Link>
            <Link to={user ? `/profile/${user._id}` : '/rider/profile'} className="flex flex-col items-center justify-center text-xs gap-1 px-2 py-1 focus:outline-none group">
                <User size={24} className={isActive('/profile', false) ? 'text-[#FFC107] font-bold' : 'text-white'} />
                <span className={isActive('/profile', false) ? 'text-[#FFC107] font-bold' : 'text-white'}>Profile</span>
            </Link>
        </nav>
    );
} 
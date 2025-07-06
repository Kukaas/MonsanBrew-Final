import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, Bell, User } from 'lucide-react';

export default function MobileNavBar() {
    const location = useLocation();
    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#232323] border-t border-gray-700 flex justify-around items-center h-16 md:hidden">
            <Link to="/" className="flex flex-col items-center justify-center text-xs gap-1 px-2 py-1 focus:outline-none group">
                <Home size={24} className={isActive('/') ? 'text-[#FFC107]' : 'text-white group-hover:text-[#FFC107]'} />
                <span className={isActive('/') ? 'text-[#FFC107] font-bold' : 'text-white'}>Menu</span>
            </Link>
            <Link to="/favorites" className="flex flex-col items-center justify-center text-xs gap-1 px-2 py-1 focus:outline-none group">
                <Heart size={24} className={isActive('/favorites', true) ? 'text-[#FFC107]' : 'text-white group-hover:text-[#FFC107]'} />
                <span className={isActive('/favorites', true) ? 'text-[#FFC107] font-bold' : 'text-white'}>Favorites</span>
            </Link>
            <Link to="/notifications" className="flex flex-col items-center justify-center text-xs gap-1 px-2 py-1 focus:outline-none group">
                <Bell size={24} className={isActive('/notifications', true) ? 'text-[#FFC107]' : 'text-white group-hover:text-[#FFC107]'} />
                <span className={isActive('/notifications', true) ? 'text-[#FFC107] font-bold' : 'text-white'}>Notifications</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center justify-center text-xs gap-1 px-2 py-1 focus:outline-none group">
                <User size={24} className={isActive('/profile', true) ? 'text-[#FFC107]' : 'text-white group-hover:text-[#FFC107]'} />
                <span className={isActive('/profile', true) ? 'text-[#FFC107] font-bold' : 'text-white'}>Me</span>
            </Link>
        </nav>
    );
}

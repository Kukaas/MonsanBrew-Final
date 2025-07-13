import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileNavBar() {
    const location = useLocation();
    const { user } = useAuth();
    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };
    const isFavoritesActive = location.pathname === '/favorites' || /^\/favorites(\/|$)/.test(location.pathname);
    const isOrdersActive = location.pathname.startsWith('/order');

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#232323] border-t border-gray-700 flex justify-around items-center h-16 md:hidden">
            <Link to="/" className="flex flex-col items-center justify-center text-xs gap-1 px-2 py-1 focus:outline-none group">
                <Home size={24} className={isActive('/') && !isOrdersActive && !isFavoritesActive ? 'text-[#FFC107]' : 'text-white group-hover:text-[#FFC107]'} />
                <span className={isActive('/') && !isOrdersActive && !isFavoritesActive ? 'text-[#FFC107] font-bold' : 'text-white'}>Menu</span>
            </Link>
            <Link to={user ? `/favorites/${user._id}` : '/favorites'} className="flex flex-col items-center justify-center text-xs gap-1 px-2 py-1 focus:outline-none group">
                <Heart size={24} className={isFavoritesActive ? 'text-[#FFC107]' : 'text-white group-hover:text-[#FFC107]'} />
                <span className={isFavoritesActive ? 'text-[#FFC107] font-bold' : 'text-white'}>Favorites</span>
            </Link>
            <Link to={user ? `/order/user/${user._id}` : '/order'} className="flex flex-col items-center justify-center text-xs gap-1 px-2 py-1 focus:outline-none group">
                <ShoppingBag size={24} className={isOrdersActive ? 'text-[#FFC107]' : 'text-white group-hover:text-[#FFC107]'} />
                <span className={isOrdersActive ? 'text-[#FFC107] font-bold' : 'text-white'}>My Purchases</span>
            </Link>
            <Link to={user ? `/profile/${user._id}` : '/profile'} className="flex flex-col items-center justify-center text-xs gap-1 px-2 py-1 focus:outline-none group">
                <User size={24} className={isActive('/profile', true) ? 'text-[#FFC107] font-bold' : 'text-white'} />
                <span className={isActive('/profile', true) ? 'text-[#FFC107] font-bold' : 'text-white'}>Me</span>
            </Link>
        </nav>
    );
}

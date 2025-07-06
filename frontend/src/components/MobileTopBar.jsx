import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MobileTopBar() {
    const { user } = useAuth();
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#232323] border-b border-gray-700 flex items-center justify-between px-3 h-14 md:hidden">
            <div className="flex-1 flex items-center">
                <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Search size={20} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search on MonsanBrew"
                        className="w-full pl-10 pr-3 py-2 rounded-full bg-[#181818] text-white placeholder-gray-400 focus:outline-none"
                    />
                </div>
            </div>
            <div className="flex items-center gap-3 ml-3">
                <Link to={user ? `/cart?user=${user._id}` : '/cart'} className="text-[#FFC107] hover:text-[#b38f00]" aria-label="Cart">
                    <ShoppingCart size={24} />
                </Link>
                <Link to="/messages" className="text-[#FFC107] hover:text-[#b38f00]" aria-label="Messages">
                    <MessageCircle size={24} />
                </Link>
            </div>
        </div>
    );
}

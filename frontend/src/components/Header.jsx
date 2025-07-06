import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Bell, User, LogOut } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '../components/ui/dropdown-menu';
import { Separator } from '../components/ui/separator';
import CustomAlertDialog from "./custom/CustomAlertDialog";
import { Button } from "./ui/button";

export default function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [logoutOpen, setLogoutOpen] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            // Optionally show an error toast here
        } finally {
            setLogoutLoading(false);
            setLogoutOpen(false);
        }
    };

    // Helper to check if a path is active
    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <header className="w-full flex items-center justify-between px-8 py-4 bg-[#232323] text-white shadow-md">
            <div className="flex items-center gap-4">
                <span className="font-extrabold text-2xl">Monsan<span className='text-[#FFC107]'>Brew</span></span>
            </div>
            {isAuthenticated ? (
                <nav className="flex items-center gap-8 text-lg font-semibold">
                    <Link to="/" className={isActive('/') && !isActive('/order-status') && !isActive('/favorites') && !isActive('/cart') && !isActive('/notifications') ? 'text-[#FFC107] font-bold' : 'hover:text-[#FFC107]'}>Menu</Link>
                    <Link to="/order-status" className={isActive('/order-status', true) ? 'text-[#FFC107] font-bold' : 'hover:text-[#FFC107]'}>Orders</Link>
                    <Link to="/favorites" className={isActive('/favorites', true) ? 'text-[#FFC107] font-bold' : 'hover:text-[#FFC107]'}>Favorites</Link>
                    <Link to="/cart" className={isActive('/cart', true) ? 'text-[#FFC107]' : 'hover:text-[#FFC107]'} aria-label="Cart">
                        <ShoppingCart size={28} />
                    </Link>
                    <Link to="/notifications" className={isActive('/notifications', true) ? 'text-[#FFC107]' : 'hover:text-[#FFC107]'} aria-label="Notifications">
                        <Bell size={28} />
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="rounded-full bg-yellow-400 w-10 h-10 flex items-center justify-center text-xl font-bold text-black focus:outline-none"
                                aria-label="Account menu"
                            >
                                {user ? user.name?.[0]?.toUpperCase() || 'A' : 'A'}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-[#232323] text-white rounded shadow-lg z-50">
                            <DropdownMenuItem asChild className="hover:bg-[#333]">
                                <Link to="/profile" className="flex items-center gap-2">
                                    <User size={16} /> Profile
                                </Link>
                            </DropdownMenuItem>
                            <Separator className="bg-[#444]" />
                            <DropdownMenuItem onClick={() => setLogoutOpen(true)} className="text-red-400 hover:bg-[#333] flex items-center gap-2">
                                <LogOut size={16} /> Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <CustomAlertDialog
                        open={logoutOpen}
                        onOpenChange={setLogoutOpen}
                        title="Logout"
                        description="Are you sure you want to logout?"
                        actions={
                            <>
                                <Button
                                    type="button"
                                    variant="yellow-outline"
                                    size="lg"
                                    onClick={() => setLogoutOpen(false)}
                                    disabled={logoutLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="yellow"
                                    size="lg"
                                    onClick={handleLogout}
                                    disabled={logoutLoading}
                                    loading={logoutLoading}
                                >
                                    Logout
                                </Button>
                            </>
                        }
                    />
                </nav>
            ) : (
                <div className="flex items-center gap-4">
                    <Link to="/login" className="px-4 py-2 bg-[#FFC107] text-black rounded font-bold hover:bg-[#e6ac06]">Login</Link>
                    <Link to="/register" className="px-4 py-2 border border-[#FFC107] text-[#FFC107] rounded font-bold hover:bg-[#FFC107] hover:text-black">Register</Link>
                </div>
            )}
        </header>
    );
}

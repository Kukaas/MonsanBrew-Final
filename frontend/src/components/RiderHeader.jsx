import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import CustomAlertDialog from "./custom/CustomAlertDialog";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

export default function RiderHeader() {
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
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setLogoutLoading(false);
            setLogoutOpen(false);
        }
    };

    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <header className="w-full flex items-center justify-between px-8 py-4 bg-[#232323] text-white shadow-md">
            <div className="flex items-center gap-4">
                <span className="font-extrabold text-2xl">Monsan<span className='text-[#FFC107]'>Brew</span> Rider</span>
            </div>
            {isAuthenticated ? (
                <nav className="flex items-center gap-8 text-lg font-semibold">
                    <Link to="/rider/dashboard" className={isActive('/rider/dashboard', true) ? 'text-[#FFC107] font-bold' : 'hover:text-[#FFC107]'}>Dashboard</Link>
                    <Link to="/rider/orders" className={isActive('/rider/orders', true) ? 'text-[#FFC107] font-bold' : 'hover:text-[#FFC107]'}>Orders</Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="rounded-full w-10 h-10 flex items-center justify-center focus:outline-none overflow-hidden"
                                aria-label="Account menu"
                            >
                                <Avatar className="w-10 h-10">
                                    {user?.photo ? (
                                        <AvatarImage src={user.photo} alt={user?.name} className="object-cover" />
                                    ) : null}
                                    <AvatarFallback className="bg-[#FFC107] text-black text-xl font-bold">
                                        {user ? user.name?.[0]?.toUpperCase() || 'R' : 'R'}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-[#232323] text-white rounded shadow-lg z-50">
                            <DropdownMenuItem asChild className="hover:bg-[#333]">
                                <Link to={user ? `/profile/${user._id}` : '/profile'} className="flex items-center gap-2">
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
            ) : null}
        </header>
    );
}

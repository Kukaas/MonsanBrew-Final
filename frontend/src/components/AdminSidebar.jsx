import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, BarChart2, Users, Folder, Settings, HelpCircle, Search, Database, FileText, File, LogOut } from "lucide-react";
import { Sidebar, SidebarContent, SidebarSeparator } from "./ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useAuth } from "@/context/AuthContext";
import CustomAlertDialog from "./custom/CustomAlertDialog";
import { Button } from "./ui/button";

const navMain = [
    { title: "Dashboard", icon: <BarChart2 size={20} />, url: "/admin/dashboard" },
    { title: "Products", icon: <Folder size={20} />, url: "/admin/products" },
    { title: "Team", icon: <Users size={20} />, url: "#" },
];
const navDocs = [
    { title: "Data Library", icon: <Database size={18} />, url: "#" },
    { title: "Reports", icon: <FileText size={18} />, url: "#" },
    { title: "Word Assistant", icon: <File size={18} />, url: "#" },
];
const navSecondary = [
    { title: "Settings", icon: <Settings size={18} />, url: "#" },
    { title: "Get Help", icon: <HelpCircle size={18} />, url: "#" },
    { title: "Search", icon: <Search size={18} />, url: "#" },
];

function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function AdminSidebar() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            const res = await logout();
            if (res.status === 200) {
                navigate("/login");
            }
        } catch (err) {
            // Optionally show an error toast here
        } finally {
            setLogoutLoading(false);
        }
    };

    return (
        <Sidebar collapsible="offcanvas">
            <SidebarContent className="flex flex-col h-full bg-[#181818] text-white justify-between">
                <div>
                    <div className="p-4">
                        <div className="mb-8 flex items-center gap-2 px-2">
                            <span className="text-2xl font-extrabold text-white">Monsan<span className="text-[#FFC107]">Brew</span></span>
                        </div>
                        <nav className="mb-6">
                            <div className="mb-2 text-xs font-bold text-[#FFC107] uppercase px-2">Main</div>
                            {navMain.map((item) => (
                                <Link
                                    key={item.title}
                                    to={item.url}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm mb-1 ${location.pathname === item.url ? 'bg-[#232323] text-[#FFC107]' : 'hover:bg-[#232323] hover:text-[#FFC107] text-[#BDBDBD]'}`}
                                >
                                    {item.icon}
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                        <SidebarSeparator />
                        <nav className="mb-6 mt-5">
                            <div className="mb-2 text-xs font-bold text-[#FFC107] uppercase px-2 flex items-center justify-between">
                                Documents
                            </div>
                            {navDocs.map((item) => (
                                <Link
                                    key={item.title}
                                    to={item.url}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm mb-1 hover:bg-[#232323] hover:text-[#FFC107] text-[#BDBDBD]"
                                >
                                    {item.icon}
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
                <div>
                    <nav className="mb-2">
                        <div className="mb-2 text-xs font-bold text-[#FFC107] uppercase px-2">More</div>
                        {navSecondary.map((item) => (
                            <Link
                                key={item.title}
                                to={item.url}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm mb-1 hover:bg-[#232323] hover:text-[#FFC107] text-[#BDBDBD]"
                            >
                                {item.icon}
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-3 px-3 py-3 mt-4">
                        <Avatar className="h-8 w-8 text-black">
                            {user?.avatar ? (
                                <AvatarImage src={user.avatar} alt={user?.name} />
                            ) : null}
                            <AvatarFallback className="rounded-lg">
                                {getInitials(user?.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white leading-tight truncate max-w-[120px]">{user?.name}</div>
                            <div className="text-xs text-[#BDBDBD] truncate max-w-[120px]">{user?.email}</div>
                        </div>
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
                                    >
                                        Logout
                                    </Button>
                                </>
                            }
                        >
                        </CustomAlertDialog>
                        <button className="hover:text-[#FFC107] transition-colors" onClick={() => setLogoutOpen(true)}>
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </SidebarContent>
        </Sidebar>
    );
}

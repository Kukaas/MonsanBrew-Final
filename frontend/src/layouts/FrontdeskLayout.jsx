import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import CustomAlertDialog from "@/components/custom/CustomAlertDialog";
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

function FrontdeskHeader() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            const res = await logout();
            if (res?.status === 200) navigate("/login");
            else navigate("/login");
        } catch {
            navigate("/login");
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-[#1a1a1a]/80 backdrop-blur border-b border-[#232323]">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <h1 className="text-[#FFC107] font-extrabold tracking-widest uppercase">Frontdesk</h1>
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 text-black">
                        {user?.photo ? (
                            <AvatarImage src={user.photo} alt={user?.name} className="object-cover" />
                        ) : null}
                        <AvatarFallback className="rounded-lg bg-[#FFC107] text-black font-bold">
                            {getInitials(user?.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col min-w-0">
                        <div className="font-semibold text-white leading-tight truncate max-w-[140px]">
                            {user?.name || "User"}
                        </div>
                        <div className="text-xs text-[#BDBDBD] truncate max-w-[140px]">
                            {user?.email || ""}
                        </div>
                    </div>
                    <CustomAlertDialog
                        open={open}
                        onOpenChange={setOpen}
                        title="Logout"
                        description="Are you sure you want to logout?"
                        actions={
                            <>
                                <Button
                                    variant="yellow-outline"
                                    size="lg"
                                    onClick={() => setOpen(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="yellow"
                                    size="lg"
                                    onClick={handleLogout}
                                    loading={loading}
                                    disabled={loading}
                                >
                                    Logout
                                </Button>
                            </>
                        }
                        trigger={
                            <button
                                className="hover:text-[#FFC107] transition-colors text-white"
                                onClick={() => setOpen(true)}
                                aria-label="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        }
                    />
                </div>
            </div>
        </header>
    );
}

function FrontdeskLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#232323] flex flex-col">
            <FrontdeskHeader />
            <main className="flex-1 p-6 md:p-10">
                {children}
            </main>
        </div>
    );
}

FrontdeskLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default FrontdeskLayout;



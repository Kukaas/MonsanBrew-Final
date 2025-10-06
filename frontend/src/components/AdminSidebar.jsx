import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  BarChart2,
  Users,
  Database,
  LogOut,
  RotateCcw,
  DollarSign,
  ShoppingCart,
  Plus,
  Package,
  ChefHat,
  Layers,
  Eye,
  Coffee,
} from "lucide-react";
import { Sidebar, SidebarContent, SidebarSeparator } from "./ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useAuth } from "@/context/AuthContext";
import CustomAlertDialog from "./custom/CustomAlertDialog";
import { Button } from "./ui/button";

const navMain = [
  {
    title: "Dashboard",
    icon: <BarChart2 size={20} />,
    url: "/admin/dashboard",
  },
  { title: "Orders", icon: <ShoppingCart size={20} />, url: "/admin/orders" },
  { title: "Refunds", icon: <RotateCcw size={20} />, url: "/admin/refunds" },
  { title: "Expenses", icon: <DollarSign size={18} />, url: "/admin/expenses" },
];
const navMaintenance = [
  {
    title: "Product Category",
    icon: <Database size={18} />,
    url: "/admin/categories",
  },
  { title: "Add ons", icon: <Plus size={18} />, url: "/admin/add-ons" },
  {
    title: "Raw  Materials Inventory",
    icon: <Package size={20} />,
    url: "/admin/raw-materials",
  },
  {
    title: "Ingredients",
    icon: <ChefHat size={20} />,
    url: "/admin/ingredients",
  },
  {
    title: "D&D Ingredients",
    icon: <Layers size={20} />,
    url: "/admin/dnd-ingredients",
  },
  {
    title: "D&D Previews",
    icon: <Eye size={20} />,
    url: "/admin/dnd-previews",
  },
  { title: "Products", icon: <Coffee size={20} />, url: "/admin/products" },
  { title: "User Management", icon: <Users size={18} />, url: "/admin/users" },
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

  const navSecondary = [
    {
      title: "Profile",
      icon: <User size={18} />,
      url: `/profile/${user?._id}`,
    },
  ];

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const res = await logout();
      if (res.status === 200) {
        navigate("/login");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent className="flex flex-col h-full bg-[#181818] text-white">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-4 border-b border-[#232323]">
          <div className="mb-8 flex items-center gap-2 px-2">
            <span className="text-2xl font-extrabold text-white">
              Monsan<span className="text-[#FFC107]">Brew</span>
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4">
            <nav className="mb-6">
              <div className="mb-2 text-xs font-bold text-[#FFC107] uppercase px-2">
                Main
              </div>
              {navMain.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm mb-1 ${location.pathname === item.url
                    ? "bg-[#232323] text-[#FFC107]"
                    : "hover:bg-[#232323] hover:text-[#FFC107] text-[#BDBDBD]"
                    }`}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
            <SidebarSeparator />
            <nav className="mb-6 mt-5">
              <div className="mb-2 text-xs font-bold text-[#FFC107] uppercase px-2 flex items-center justify-between">
                System Maintenance
              </div>
              {navMaintenance.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm mb-1 ${location.pathname === item.url
                    ? "bg-[#232323] text-[#FFC107]"
                    : "hover:bg-[#232323] hover:text-[#FFC107] text-[#BDBDBD]"
                    }`}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 border-t border-[#232323]">
          <nav className="mb-2 p-4">
            <div className="mb-2 text-xs font-bold text-[#FFC107] uppercase px-2">
              More
            </div>
            {navSecondary.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm mb-1 ${item.title === "Profile" &&
                  location.pathname.startsWith("/profile")
                  ? "bg-[#232323] text-[#FFC107]"
                  : "hover:bg-[#232323] hover:text-[#FFC107] text-[#BDBDBD]"
                  }`}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar className="h-8 w-8 text-black">
              {user?.photo ? (
                <AvatarImage
                  src={user.photo}
                  alt={user?.name}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="rounded-lg bg-[#FFC107] text-black font-bold">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white leading-tight truncate max-w-[120px]">
                {user?.name}
              </div>
              <div className="text-xs text-[#BDBDBD] truncate max-w-[120px]">
                {user?.email}
              </div>
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
                    loading={logoutLoading}
                  >
                    Logout
                  </Button>
                </>
              }
            ></CustomAlertDialog>
            <button
              className="hover:text-[#FFC107] transition-colors"
              onClick={() => setLogoutOpen(true)}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

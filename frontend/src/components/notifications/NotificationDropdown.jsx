import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { notificationAPI } from "@/services/api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotificationDropdown({
    triggerClassName = "",
    iconClassName = "",
    iconSize = 22,
    onNotificationClick,
}) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("unread");
    const [open, setOpen] = useState(false);

    if (!user) return null;

    const role = user.role === "rider" ? "rider" : undefined;
    const { data: notificationsData } = useQuery({
        queryKey: ["notifications", user._id, role],
        queryFn: async () => {
            const res = await notificationAPI.get({ userId: user._id, role });
            return res.data || res;
        },
        staleTime: 1000 * 10,
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const notifications = notificationsData?.notifications || [];
    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.isRead).length,
        [notifications]
    );
    const unreadNotifications = useMemo(
        () => notifications.filter((n) => !n.isRead),
        [notifications]
    );
    const readNotifications = useMemo(
        () => notifications.filter((n) => n.isRead),
        [notifications]
    );

    const { mutate: markRead } = useMutation({
        mutationFn: async (id) => notificationAPI.markRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["notifications", user._id, role],
            });
        },
    });

    const { mutate: markAllRead, isLoading: markAllLoading } = useMutation({
        mutationFn: async () =>
            notificationAPI.markAllRead({ userId: user._id, role }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["notifications", user._id, role],
            });
        },
    });

    const handleClickNotification = (notification) => {
        if (!notification) return;
        if (!notification?.isRead && notification?._id) {
            markRead(notification._id);
        }
        setOpen(false);
        if (onNotificationClick) {
            onNotificationClick(notification);
            return;
        }
        if (notification?.orderId) {
            navigate(`/order/${notification.orderId}`);
        }
    };

    const bellClasses = [
        "transition-colors",
        unreadCount > 0 ? "text-[#FFC107]" : "",
        iconClassName,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className={`relative inline-flex items-center justify-center focus:outline-none ${triggerClassName}`}
                    aria-label="Notifications"
                >
                    <Bell size={iconSize} className={bellClasses} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#FFC107] text-black text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-80 bg-[#232323] text-white rounded shadow-lg z-50"
            >
                <div className="px-3 py-2 text-sm font-bold flex items-center justify-between gap-3">
                    <span>Notifications</span>
                    <button
                        type="button"
                        onClick={() => markAllRead()}
                        disabled={markAllLoading || unreadCount === 0}
                        className={`text-xs font-semibold uppercase tracking-wide transition ${markAllLoading || unreadCount === 0
                            ? "text-gray-500 cursor-not-allowed"
                            : "text-[#FFC107] hover:text-white"
                            }`}
                    >
                        {markAllLoading ? "Marking..." : "Mark all read"}
                    </button>
                </div>
                <Separator className="bg-[#444]" />
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-3 pt-3 pb-2">
                        <TabsList className="grid w-full grid-cols-2 bg-[#2a2a2a] text-sm rounded-xl p-1">
                            <TabsTrigger
                                value="unread"
                                className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black rounded-lg py-1 text-white"
                            >
                                Unread ({unreadNotifications.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="read"
                                className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black rounded-lg py-1 text-white"
                            >
                                Read ({readNotifications.length})
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent
                        value="unread"
                        className="max-h-80 overflow-y-auto px-1 custom-scrollbar"
                    >
                        {unreadNotifications.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-gray-300">
                                You&apos;re all caught up!
                            </div>
                        ) : (
                            unreadNotifications.map((n) => (
                                <button
                                    key={n._id}
                                    onClick={() => handleClickNotification(n)}
                                    className="w-full text-left px-3 py-3 hover:bg-[#333] transition flex flex-col gap-1 bg-[#2b2b2b]"
                                >
                                    <span className="text-xs text-gray-400">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </span>
                                    <span className="font-bold text-sm">{n.title}</span>
                                    <span className="text-sm text-gray-200">{n.message}</span>
                                </button>
                            ))
                        )}
                    </TabsContent>
                    <TabsContent
                        value="read"
                        className="max-h-80 overflow-y-auto px-1 custom-scrollbar"
                    >
                        {readNotifications.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-gray-300">
                                No read notifications yet.
                            </div>
                        ) : (
                            readNotifications.map((n) => (
                                <button
                                    key={n._id}
                                    onClick={() => handleClickNotification(n)}
                                    className="w-full text-left px-3 py-3 hover:bg-[#333] transition flex flex-col gap-1"
                                >
                                    <span className="text-xs text-gray-500">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </span>
                                    <span className="font-bold text-sm text-gray-100">
                                        {n.title}
                                    </span>
                                    <span className="text-sm text-gray-300">{n.message}</span>
                                </button>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}



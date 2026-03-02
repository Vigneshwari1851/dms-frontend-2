import { useState, useEffect } from "react";
import {
    fetchNotifications,
    markNotificationsRead,
    markNotificationsUnread,
    deleteNotifications
} from "../../api/notification.api";
import { Trash2, Clock, CheckCircle2, AlertCircle, TrendingDown, Info, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationCard from "../../components/common/Notification";

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ open: false, ids: [] });
    const navigate = useNavigate();

    const tabs = [
        { id: "all", label: "All" },
        { id: "new", label: "New" },
        { id: "unread", label: "Unread" },
        { id: "read", label: "Read" },
    ];

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetchNotifications(activeTab);
            if (res.success) {
                setNotifications(res.data);
            }
        } catch (error) {
            console.error("Error loading notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, [activeTab]);

    const handleMarkAllRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;
        try {
            await markNotificationsRead(unreadIds);
            // Dispatch event for other components (like Header)
            window.dispatchEvent(new Event('notificationsUpdated'));
            // Force reload as requested
            window.location.reload();
        } catch (error) {
            console.error("Error marking all read", error);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationsRead([id]);
            loadNotifications();
        } catch (error) {
            console.error("Error marking read", error);
        }
    };

    const handleDeleteClick = (id) => {
        setConfirmModal({
            open: true,
            ids: [id],
            actionType: "remove",
            title: "Delete Notification",
            message: "Are you sure you want to delete this notification?",
            confirmText: "Delete",
            cancelText: "Cancel",
        });
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteNotifications(confirmModal.ids);
            loadNotifications();
        } catch (error) {
            console.error("Error deleting notification", error);
        } finally {
            setConfirmModal({ open: false, ids: [] });
        }
    };

    const navigateToAlert = async (n) => {
        if (!n.is_read) {
            await handleMarkRead(n.id);
        }
        if (n.alert_type === "RECONCILIATION") {
            window.location.href = `/reconciliation/details/${n.reference_id}`;
        } else if (n.alert_type === "PENDING_DEAL") {
            window.location.href = `/deals/edit-deal/${n.reference_id}`;
        }
    };

    const getTimeDisplay = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000);

        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

        return d.toLocaleDateString('en-GB');
    };

    const getIcon = (type, isRead) => {
        const baseClass = "p-2.5 rounded-lg";
        if (type === "RECONCILIATION") {
            return (
                <div className={`${baseClass} bg-[#F7626E]/10 text-[#F7626E]`}>
                    <TrendingDown size={22} />
                </div>
            );
        }
        if (type === "PENDING_DEAL") {
            return (
                <div className={`${baseClass} bg-[#D8AD00]/10 text-[#D8AD00]`}>
                    <AlertCircle size={22} />
                </div>
            );
        }
        return (
            <div className={`${baseClass} bg-[#1D4CB5]/10 text-[#1D4CB5]`}>
                <Info size={22} />
            </div>
        );
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Notifications</h1>
                </div>
                    {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-md text-sm font-medium transition-all"
                    >
                        Mark all as read
                    </button>
                    )}
            </div>

            {/* Tabs */}
            <div className="flex gap-8 mb-8 border-b border-[#2A2F33] relative max-w-6xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 text-sm font-medium transition-all relative ${activeTab === tab.id
                            ? "text-[#1D4CB5]"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D4CB5] rounded-t-full shadow-[0_-2px_8px_#82E89044]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div className="space-y-4 max-w-6xl">
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-[#16191C]/30 rounded-md border border-dashed border-[#2A2F33]">
                        No notifications to show.
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`flex items-center justify-between p-4 rounded-md border transition-all duration-300 ${n.is_read ? "bg-[#1E2328]/40 border-[#2A2F33]" : "bg-[#1E2328] border-[#3A4046] shadow-xl ring-1 ring-white/5"
                                } group hover:border-[#1D4CB5]/30`}
                        >
                            <div className="flex gap-4 items-center flex-1 cursor-pointer" onClick={() => navigateToAlert(n)}>
                                {getIcon(n.alert_type, n.is_read)}

                                <div className="flex flex-col gap-1 flex-1">
                                    <h3 className={`font-semibold text-[15px] ${n.is_read ? "text-gray-300" : "text-white"}`}>
                                        {n.title}
                                        <span className="text-gray-500 text-xs font-medium"> -- Created by: {n.user?.full_name || "Unknown"}</span>
                                    </h3>
                                    <p className="text-sm text-gray-400 line-clamp-1 group-hover:text-gray-300 transition-colors">
                                        {n.message}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 ml-4">
                                {!n.is_read && (
                                    <span className="px-3 py-1 bg-[#1D4CB5] text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-lg shadow-[#82E89022]">
                                        New
                                    </span>
                                )}

                                {n.is_read && (
                                    <span className="text-xs text-gray-500">
                                        {getTimeDisplay(n.created_at)}
                                    </span>
                                )}

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(n.id); }}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-[#F7626E]/10 text-[#F7626E] hover:bg-[#F7626E]/20 rounded-lg text-xs font-medium transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <NotificationCard
                confirmModal={confirmModal}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmModal({ open: false, ids: [] })}
            />
        </div>
    );
};

export default NotificationsPage;

import { useState, useEffect } from "react";
import {
    fetchNotifications,
    markNotificationsRead,
    markNotificationsUnread,
    deleteNotifications
} from "../../api/notification.api";
import { CheckCircle, Circle, Trash2, Clock, Filter, AlertCircle, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationCard from "../../components/common/Notification";

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState("unread"); // Default to unread as requested for priority
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ open: false, ids: [] });
    const navigate = useNavigate();

    const tabs = [
        { id: "all", label: "All" },
        { id: "new", label: "New" },
        { id: "unread", label: "Unread" },
        { id: "read", label: "Read" },
        { id: "deleted", label: "Trash" },
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

    const handleMarkRead = async (id) => {
        try {
            await markNotificationsRead([id]);
            loadNotifications();
        } catch (error) {
            console.error("Error marking read", error);
        }
    };

    const handleMarkUnread = async (id) => {
        try {
            await markNotificationsUnread([id]);
            loadNotifications();
        } catch (error) {
            console.error("Error marking unread", error);
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

    const navigateToAlert = (n) => {
        if (n.alert_type === "RECONCILIATION") {
            navigate(`/reconciliation/details/${n.reference_id}`);
        } else if (n.alert_type === "PENDING_DEAL") {
            navigate(`/deals/edit-deal/${n.reference_id}`);
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return "Just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days === 1) return "Yesterday";
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="p-4 lg:p-10 bg-[#0F1113] min-h-screen">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-semibold text-white mb-6">Notifications</h1>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-[#1E2328] pb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-[#D83D00] text-white shadow-lg"
                                : "text-gray-400 hover:text-white hover:bg-[#1E2328]"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 bg-[#16191C] rounded-xl border border-dashed border-[#2E3439]">
                            No notifications found in {activeTab} tab.
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`flex items-start justify-between p-4 rounded-xl border transition-all ${n.is_read ? "bg-[#16191C] border-[#1E2328]" : "bg-[#1E2328] border-[#2E3439] shadow-md ring-1 ring-white/5"
                                    } group`}
                            >
                                <div className="flex gap-4 items-start w-full cursor-pointer" onClick={() => navigateToAlert(n)}>
                                    <div className={`p-2.5 rounded-lg ${n.alert_type === "RECONCILIATION" ? "bg-[#D83D00]/10 text-[#D83D00]" : "bg-[#D8AD00]/10 text-[#D8AD00]"
                                        }`}>
                                        {n.alert_type === "RECONCILIATION" ? <TrendingDown size={20} /> : <AlertCircle size={20} />}
                                    </div>
                                    <div className="flex flex-col gap-1 w-full">
                                        <div className="flex justify-between items-center">
                                            <h3 className={`font-medium ${n.is_read ? "text-gray-300" : "text-white"}`}>{n.title}</h3>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock size={12} /> {getTimeAgo(n.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400">{n.message}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {n.is_read ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleMarkUnread(n.id); }}
                                            title="Mark as unread"
                                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            <Circle size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                                            title="Mark as read"
                                            className="p-2 text-gray-400 hover:text-[#D83D00] hover:bg-[#D83D00]/10 rounded-lg transition-colors"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    )}
                                    {!n.is_deleted && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(n.id); }}
                                            title="Delete"
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
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

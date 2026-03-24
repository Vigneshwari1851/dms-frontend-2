import { useState, useRef, useEffect } from "react";
import searchIcon from "../../assets/Common/search.svg";
import logo from "../../assets/Common/logo.svg";
import profile from "../../assets/Common/profile.svg";
import logout from "../../assets/Common/logout.svg";
import NotificationCard from "../common/Notification";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../api/user/user";
import { fetchNotifications } from "../../api/notification.api";
import bellIcon from "../../assets/notification/bell.svg";
import bellnotificationIcon from "../../assets/notification/bell_red_dot.svg";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { AlertCircle, TrendingDown } from "lucide-react";

export default function Header({ toggleSidebar }) {
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ open: false });
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const notifDropdownRef = useRef(null);
  const avatarDropdownRef = useRef(null);
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const userName = storedUser.full_name || "User";
  const userRole = storedUser.role || "";
  const userInitial = userName?.charAt(0).toUpperCase();

  const loadNotifications = async () => {
    try {
      const res = await fetchNotifications("unread");
      if (res && res.success && Array.isArray(res.data)) {
        setNotifications(res.data.map(alert => ({
          ...alert,
          id: alert.id,
          time: new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })));
      } else setNotifications([]);
    } catch (err) {
      console.error("Error fetching notifications", err);
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Listen for manual updates from other pages
    window.addEventListener('notificationsUpdated', loadNotifications);

    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
    const intervalId = setInterval(loadNotifications, TWO_DAYS);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('notificationsUpdated', loadNotifications);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(e.target)) {
        setAvatarDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setConfirmModal({
      open: true,
      actionType: "logout",
      title: "Signing Out",
      message: "Are you sure you want to end your session? ",
      confirmText: "Logout",
      cancelText: "Cancel",
    });
  };

  const handleConfirmLogout = async () => {
    try {
      await logoutUser();
      localStorage.clear();
      navigate("/login");
    } catch {
      localStorage.clear();
      navigate("/login");
    } finally {
      setConfirmModal({ open: false });
    }
  };

  return (
    <>
      {/* 🔹 BLUR BACKGROUND WHEN NOTIF OR PROFILE DROPDOWN OPEN */}
      {(notifDropdownOpen || avatarDropdownOpen) && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => {
            setNotifDropdownOpen(false);
            setAvatarDropdownOpen(false);
          }}
        />
      )}

      <header className="w-full h-[72px] lg:h-[92px] bg-[#1E2328] border-b border-[#16191C] flex items-center justify-between px-4 lg:px-10 relative z-50 transition-all duration-300">
        <div className="flex items-center gap-4">
          {/* Hamburger Menu - Only Mobile */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-white hover:bg-white/10 p-1 rounded-md transition-colors"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Left Logo */}
          <img src={logo} alt="logo" className="h-8 lg:h-auto" />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 lg:gap-6">
          {/* Search Bar - Hidden on small mobile, smaller on medium */}
          <div className="hidden md:relative md:flex bg-[#0F1113] border border-[#16191C] px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl w-[150px] lg:w-[300px]">
            <img
              src={searchIcon}
              alt="search"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-70"
            />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent w-full text-gray-300 pl-5 focus:outline-none"
            />
          </div>

          {/* Notification Bell */}
          <div className="relative" ref={notifDropdownRef}>
            <div className="relative cursor-pointer" onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}>
              <img
                src={notifications.length > 0 ? bellnotificationIcon : bellIcon}
                alt="notifications"
                className="w-6 h-6"
              />
            </div>

            {notifDropdownOpen && (
              <div className="fixed lg:absolute left-0 lg:left-auto right-4 top-[72px] lg:top-full lg:mt-3 w-[calc(100vw-32px)] lg:w-[400px] bg-[#1E2328] rounded-2xl shadow-2xl border border-[#2E3439] z-50 animate-fadeIn flex flex-col max-h-[600px]">
                <div className="p-4 border-b border-[#2E3439] flex justify-between items-center">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    Notifications
                    {notifications.length > 0 && (
                      <span className="bg-[#1D4CB5] text-white text-[10px] px-2 py-0.5 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(false);
                      navigate("/notifications");
                    }}
                    className="text-[#1D4CB5] text-xs font-medium hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-grey p-2">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 text-sm">
                      No new notifications
                    </div>
                  ) : (
                    Object.entries(
                      notifications.reduce((groups, n) => {
                        const date = new Date(n.created_at);
                        const today = new Date();
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);

                        let groupKey = "Earlier";
                        if (date.toDateString() === today.toDateString()) groupKey = "Today";
                        else if (date.toDateString() === yesterday.toDateString()) groupKey = "Yesterday";

                        if (!groups[groupKey]) groups[groupKey] = [];
                        groups[groupKey].push(n);
                        return groups;
                      }, {})
                    ).map(([group, groupItems]) => (
                      <div key={group} className="mb-4 last:mb-0">
                        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
                          {group}
                        </h4>
                        <div className="space-y-1">
                          {groupItems.map((n) => (
                            <div
                              key={n.id}
                              onClick={async () => {
                                setNotifDropdownOpen(false);
                                if (!n.is_read) {
                                  try {
                                    const { markNotificationsRead } = await import("../../api/notification.api");
                                    await markNotificationsRead([n.id]);
                                    loadNotifications();
                                  } catch (err) {
                                    console.error("Error marking as read", err);
                                  }
                                }
                                if (n.alert_type === "RECONCILIATION") window.location.href = `/reconciliation/details/${n.reference_id}`;
                                else if (n.alert_type === "PENDING_DEAL") window.location.href = `/deals/edit-deal/${n.reference_id}`;
                                else if (n.alert_type === "DEAL_EDIT_REQUEST") window.location.href = `/deals/edit-deal/${n.reference_id}?fromNotif=true&msg=${encodeURIComponent(n.message)}`;
                                else if (n.alert_type === "DEAL_EDIT") window.location.href = `/deals/edit-deal/${n.reference_id}`;
                              }}
                              className="flex items-start gap-4 p-3 hover:bg-[#16191C] rounded-xl cursor-pointer transition-colors group"
                            >
                              <div className="w-10 h-10 rounded-full bg-[#1D4CB5] flex items-center justify-center shrink-0">
                                <div className="text-white">
                                  {n.alert_type === "RECONCILIATION" ? (
                                    <TrendingDown size={18} />
                                  ) : (
                                    <AlertCircle size={18} />
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-semibold group-hover:text-[#1D4CB5] transition-colors truncate">
                                  {n.title}
                                  <span className="text-gray-500 text-[10px] font-medium"> -- Created by: {n.user?.full_name?.split(' ')[0] || "User"}</span>
                                </p>
                                <p className="text-gray-400 text-xs line-clamp-1 mb-1">
                                  {n.message}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} • {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="relative" ref={avatarDropdownRef}>
            <div
              onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
              className="w-10 h-10 rounded-full bg-[#D76A71] flex items-center justify-center text-white font-semibold text-lg cursor-pointer select-none"
            >
              {userInitial}
            </div>

            {avatarDropdownOpen && (
              <div className="fixed lg:absolute left-0 lg:left-auto right-0 top-[72px] lg:top-auto lg:mt-3 w-full lg:w-64 bg-[#1E2328] rounded-none lg:rounded-xl shadow-lg p-4 z-50 transition-all">
                <p className="text-white text-lg font-semibold  mb-4">{userName}</p>
                {/* <p className="text-gray-400 text-sm mb-4">{userRole}</p> */}

                <button
                  onClick={() => {
                    setAvatarDropdownOpen(false);
                    setNotifDropdownOpen(false);
                    navigate("/users/my-profile");
                  }}
                  className="w-full flex items-center gap-3 px-1 py-2 text-white hover:bg-[#1A1E21] border-[#2E3439] border-t-2 text-[14px] font-normal"
                >
                  <img src={profile} alt="profile" className="w-5 h-5" />
                  My Profile
                </button>


                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-1 py-2 text-red-400 hover:bg-[#1A1E21] border-[#2E3439] border-t-2 text-[14px] font-normal"
                >
                  <img src={logout} alt="logout" className="w-5 h-5" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

      </header>
      <NotificationCard
        confirmModal={confirmModal}
        onConfirm={handleConfirmLogout}
        onCancel={() => setConfirmModal({ open: false })}
      />
    </>
  );
}

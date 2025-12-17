import { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi"; 
import { IoNotificationsOutline } from "react-icons/io5";
import logo from "../../assets/Common/logo.svg";
import person from "../../assets/Common/person.svg";
import profile from "../../assets/Common/profile.svg";
import logout from "../../assets/Common/logout.svg";
import NotificationCard from "../common/Notification"; 
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../api/user/user";
import { fetchReconciliationAlerts } from "../../api/reconcoliation"; 
import bellIcon from "../../assets/notification/bell.svg"
import bellnotificationIcon from "../../assets/notification/bell_red_dot.svg"

export default function Header() {
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

  const loadNotifications = async () => {
    try {
      const res = await fetchReconciliationAlerts();

      if (res && Array.isArray(res.alerts)) {
        const notifArray = res.alerts.map(alert => ({
          id: alert.id,
          title: alert.title,          // ✅ from API
          message: alert.message,      // ✅ from API
          time: alert.created_at,       // "2 hours ago", "Yesterday"
          alertType: alert.alertType,   // optional (useful later)
        }));

        setNotifications(notifArray);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error fetching notifications", err);
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();

    const FOUR_HOURS = 4 * 60 * 60 * 1000;

    const intervalId = setInterval(() => {
      loadNotifications();
    }, FOUR_HOURS);

    return () => clearInterval(intervalId);
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
      title: "Securely Signing Out",
      message: "Are you sure you want to securely end your session? Your data and funds will remain protected.",
      confirmText: "Logout",
      cancelText: "Cancel",
    });
  };

  const handleConfirmLogout = async () => {
    try {
      await logoutUser();
      localStorage.clear();
      navigate("/login");
    } catch (err) {
      console.error(err);
      localStorage.clear();
      navigate("/login");
    } finally {
      setConfirmModal({ open: false });
    }
  };

  // const handleMarkAllRead = () => {
  //   setNotifications([]);
  // };

  return (
    <header className="w-full h-[92px] bg-[#1E2328] border-b border-[#16191C] flex items-center justify-between px-10 relative">

      {/* Left Logo */}
      <img src={logo} alt="logo" /> 

      {/* Right Section */}
      <div className="flex items-center gap-6">

        {/* Search Bar */}
        <div className="bg-[#0F1113] border border-[#16191C] px-4 py-2 rounded-xl w-[300px] flex items-center gap-3">
          <FiSearch className="text-[#ABABAB] text-lg" strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent w-full text-gray-300 focus:outline-none"
          />
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifDropdownRef}>
          <img
            src={notifications.length > 0 ? bellnotificationIcon : bellIcon}
            alt="notifications"
            className="w-6 h-6 cursor-pointer"
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              setShowAllNotifications(false);
            }}
          />

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-3 w-96 bg-[#1E2328] rounded-xl shadow-lg p-4 animate-fadeIn z-50">
              {/* <div className="flex justify-end items-center mb-3">
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-blue-500 text-sm text-center hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div> */}

            <div
              className={`${
                showAllNotifications ? "max-h-70 overflow-y-auto scrollbar-grey pr-3" : ""
              }`}
            >
              {notifications.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center">No notifications</p>
                ) : (
                  (notifications.slice(0, showAllNotifications ? notifications.length : 3)).map((n, idx) => (
                    <div
                      key={idx}
                     onClick={() => {
                        setNotifDropdownOpen(false);
                        setShowAllNotifications(false);
                        if (n.alertType === "RECONCILIATION") {
                              navigate(`/reconciliation/details/${n.id}`);
                            } else if (n.alertType === "PENDING_DEAL") {
                              navigate(`/edit-deal/${n.id}`);
                            }
                      }}
                      className="mb-2 p-3 bg-[#16191C] rounded-lg text-white flex justify-between items-start cursor-pointer"
                    >
                    <div className="flex items-start gap-2 relative">
                     <span
                      className={`w-2 h-2 rounded-full mt-2 ${
                        n.alertType === "RECONCILIATION"
                          ? "bg-[#D83D00]"
                          : "bg-[#D8AD00]"
                      }`}
                    ></span>
                      <div className="flex flex-col gap-[9px]">
                        <p className="font-semibold">{n.title}</p>
                        <p className="text-gray-400 text-sm">{n.message}</p>
                      </div>
                    </div>

                    <span className="text-gray-400 text-xs ml-auto">{n.time}</span>
                    </div>
                  ))
                )}
              </div>

             {notifications.length > 3 && (
              <div className="text-center mt-2">
                <button
                  onClick={() => setShowAllNotifications(true)}
                  className="text-blue-500 text-sm hover:underline"
                >
                  View All
                </button>
              </div>
            )}
            </div>
          )}
        </div>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={avatarDropdownRef}>
          <img
            className="w-10 h-10 rounded-full border border-[#0F1113] cursor-pointer"
            src={person}
            alt="profile"
            onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
          />

          {avatarDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-[#1E2328] rounded-xl shadow-lg p-4 z-50">
              <p className="text-white text-lg font-semibold">{userName}</p>
              <p className="text-gray-400 text-sm mb-4">{userRole}</p>

              <button
                onClick={() => navigate("/my-profile")}
                className="w-full flex items-center gap-3 px-1 py-2 text-white hover:bg-[#1A1E21] border-[#2E3439] border-t-2 text-[14px] font-normal"
              >
                <img src={profile} alt="profile" className="w-5 h-5" /> My Profile
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

      <NotificationCard
        confirmModal={confirmModal}
        onConfirm={handleConfirmLogout}
        onCancel={() => setConfirmModal({ open: false })}
      />
    </header>
  );
}

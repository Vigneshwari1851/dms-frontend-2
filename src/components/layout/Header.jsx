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

export default function Header() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState({
    open: false,
  });

  const handleLogoutClick = () => {
    setOpen(false);
    setConfirmModal({
      open: true,
      actionType: "logout",
      title: "Securely Signing Out",
      message: "Are you sure you want to securely end your session? Your data and funds will remain protected.",
      confirmText: "Logout",
      cancelText: "Cancel",
    });
  };

  const handleConfirmLogout =  async () => {
    try {
      const result = await logoutUser();

      setConfirmModal({ open: false });
      localStorage.clear();
      if (!result.success) {
        console.warn("Logout API failed, forcing logout");
      }
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.clear();
      navigate("/login");
    }
  };

  const handleCancelLogout = () => {
    setConfirmModal({ open: false });
  };

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  const userName = storedUser.full_name || "User";
  const userRole = storedUser.role || "";

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
        <button className="relative">
          <IoNotificationsOutline className="text-2xl text-[#565656] cursor-pointer" />
        </button>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <img
            className="w-10 h-10 rounded-full border border-[#0F1113] cursor-pointer"
            src={person}
            alt="profile"

            onClick={() => setOpen(!open)}
          />

          {/* Dropdown */}
          {open && (
            <div className="
              absolute right-0 mt-3 w-64 
              bg-[#1E2328] 
              rounded-xl shadow-lg p-4 
              animate-fadeIn z-50
            ">
              <p className="text-white text-lg font-semibold"> {userName} </p>
              <p className="text-gray-400 text-sm mb-4"> {userRole} </p>

              <button   onClick={() => {
                setOpen(false);
                navigate("/my-profile");
              }} 
              className="w-full flex items-center gap-3 px-1 py-2 text-white hover:bg-[#1A1E21] border-[#2E3439] border-t-2 text-[14px] font-normal">
                <img src={profile} alt="profile" className="w-5 h-5" /> My Profile
              </button>

              <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-1 py-2 text-red-400 hover:bg-[#1A1E21] border-[#2E3439] border-t-2 text-[14px] font-normal">
               <img src={logout} alt="logout"  className="w-5 h-5" /> Logout
              </button>
            </div>
          )}
        </div>

      </div>
      <NotificationCard
        confirmModal={confirmModal}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </header>
  );
}

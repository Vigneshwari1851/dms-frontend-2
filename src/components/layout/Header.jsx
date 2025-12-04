import { FiSearch } from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import logo from "../../assets/Common/logo.svg";
import person from "../../assets/Common/person.svg"

export default function Header() {
  return (
    <header className="w-full h-[92px] bg-[#1E2328] border-b border-[#16191C] flex items-center justify-between px-10">

      {/* Left Logo */}
      <img src={logo} alt="logo" /> 

      {/* Right Section */}
      <div className="flex items-center gap-6">

        {/* Search bar with icon */}
        <div className="bg-[#0F1113] border border-[#16191C] px-4 py-2 rounded-xl w-[300px] flex items-center gap-3">
          {/* <FiSearch className="text-[#ABABAB] text-xl " /> */}
          <FiSearch className="text-[#ABABAB] text-lg" strokeWidth={2.5} />

          <input
            type="text"
            placeholder="Search"
            className="bg-transparent w-full text-gray-300 focus:outline-none"
          />
        </div>

        {/* Notification bell */}
        <button className="relative">
          <IoNotificationsOutline className="text-2xl text-[#565656] cursor-pointer" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full"></span>
        </button>

        {/* User Avatar */}
        <img
          className="w-10 h-10 rounded-full border border-[#0F1113]"
          src={person}
          alt="profile"
        />
        
      </div>
    </header>
  );
}

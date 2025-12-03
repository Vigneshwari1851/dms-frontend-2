import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import warningIcon from "../../assets/warning.svg";

function IpBlocked() {
  const navigate = useNavigate();
  const location = useLocation();
  const backendMessage = location.state?.backendMessage || "";

  const ipAddress =
    backendMessage.match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/)?.[0] || "Unknown";

  const handleUnlock = () => {
    navigate("/login");
  };

  return (
    <div className="w-full h-screen bg-[#fffef7] flex justify-center items-center">

      <div className="w-[60%] max-w-[750px] bg-white p-10 rounded-2xl shadow-lg text-left font-inter flex items-start gap-5 mb-12">
      <img src={warningIcon} alt="Warning" className="ip-icon" />

        <div className="flex flex-col">
          <h2 className="text-[22px] font-semibold text-[#d9534f] mb-3">Temporarily Banned IP address</h2>

        <p className="text-[#444] text-[14px] leading-[22px] mb-5">
          Your IP address <strong>{ipAddress}</strong> has been temporarily blocked for the following service:
          <br />• Email
        </p>

        <div className="mb-5">
          <p className="font-semibold">Possible reasons:</p>
          <ul className="mt-1 ml-5 list-disc text-[14px] text-[#444]">
            <li>Too many login attempts in a short time</li>
            <li>Login attempts with incorrect credentials</li>
            <li>Multiple failed connection attempts to the server</li>
          </ul>
        </div>

        <div className="mt-5 mb-7 text-[14px] text-[#444] leading-[22px]">
          <p className="font-semibold">What you can do:</p>
          <p>
            You can unlock your IP by pressing the "Unlock" button below.
            <br />If the issue persists, your IP may be blocked again.
            <br />We recommend contacting our support team to understand the cause and prevent it from happening in the future.
          </p>
        </div>

        <button className="bg-[#ffcf33] text-black font-semibold text-[15px] px-6 py-2 rounded-lg hover:bg-[#e6b82d] ml-auto" onClick={handleUnlock}>
          Unlock
        </button>
      </div>

    </div>

    </div>
  );
}

export default IpBlocked;

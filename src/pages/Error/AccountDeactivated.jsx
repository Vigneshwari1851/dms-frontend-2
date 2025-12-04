import React from "react";
import lockIcon from "../../assets/disableAccount/clock.svg";

function AccountDisabled() {
  return (
    <div className="w-full h-screen bg-[#16191C] flex justify-center items-center">
      <div className="flex flex-row items-center gap-6 w-[60%] max-w-[860px] p-[15px] px-[45px] bg-[#2E3439] rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.08)] font-inter text-[14px] mb-[70px]">

        <img
          src={lockIcon}
          className="w-[150px] h-[150px]"
          alt="Disabled"
        />

        <div className="flex flex-col">
          <h2 className="text-[24px] font-bold text-[#E84451] mb-2">
            Account Temporarily Disabled
          </h2>

          <p className="text-[15px] text-[#E3E3E3] leading-[22px] mb-1">
            Your account is temporarily deactivated on Saturdays and Sundays for routine system checks and updates.
          </p>

          <p className="text-[15px] text-[#E3E3E3] leading-[22px]">
            You’ll be able to access your account again starting Monday morning.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AccountDisabled;

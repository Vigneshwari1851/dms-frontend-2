import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtp } from "../../../api/auth/auth.jsx";
import rightSide from "../../../assets/login/rightSide.svg"
import welcomeImg from "../../../assets/login/welcome.svg";
import authlogo from "../../../assets/verify/authlogo.svg";

function VerifyOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");

  const email = localStorage.getItem("pendingEmail");

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    try {
      const res = await verifyOtp(email, otp);

      const token = res.data.token;
      const user = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.removeItem("pendingEmail");

      navigate("/dashboard");
    } catch (err) {
      setError("Incorrect OTP.");
    }
  };

  

  const getRawOtp = (value) => {
  return value.replace(/\D/g, "").slice(0, 4);
};

const formatOtp = (value) => {
  return value.replace(/\D/g, "").slice(0, 4).split("").join(" ");
};


  return (
    <div className="flex h-screen w-full bg-[#0B0B0F] text-white">
      
      {/* LEFT SIDE IMAGE */}
     <div className="relative flex-1 min-h-[260px]">
      <img
        src={rightSide}
        alt="Welcome background"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>


   {/* RIGHT SIDE CONTENT */}
    <div className="w-full md:w-1/2 flex items-center justify-center px-6">
      <div className="w-[420px] h-[259px] flex flex-col items-center justify-start gap-3">

        {/* TOP SECTION: MFA + INPUT */}
        <div className="w-full flex flex-col gap-3">

          {/* WELCOME IMAGE */}
          <img src={welcomeImg} className="mx-auto mb-10 mt-4 w-[188px] h-[58px]" />

          {/* MFA Box */}
          <div
            className="w-full mb-2 rounded-lg border bg-[#3A4083] border-[#3A4083] flex flex-col justify-center"
            style={{
              height: "61px",
              borderRadius: "8px",
              padding: "12px 16px",
              gap: "10px",
             
              backdropFilter: "blur(10px)",
              opacity: 1,
            }}
          >
            <div className="flex items-start">
              <img src={authlogo} alt="" className="w-4 h-4 mt-0.5" />
              <div className="ml-2">
                <p className="font-medium text-[14px] leading-[18px] text-white">
                  Multi-Factor Authentication
                </p>
                <p className="font-light text-[13px] leading-[18px] text-[#BABABA]">
                  {email ? `Enter 4-digit OTP sent to ${email}` : "Enter OTP sent to email"}
                </p>
              </div>
            </div>
          </div>

          {/* OTP INPUT */}
          <input
            type="text"
            value={formatOtp(otp)}
            onChange={(e) => {
              const rawValue = getRawOtp(e.target.value);
              setOtp(rawValue);
            }}
            maxLength={7} // 4 digits + 3 spaces = 7 characters
            placeholder="Enter your 4-digit email OTP"
            className="
                      w-[420px]
                      h-[47px]
                      rounded-[10px]
                      px-4
                      py-[3px]
                      border
                      border-[#B7BAC0]
                      text-[16px]
                      font-light
                      leading-[157%]
                      text-white
                      placeholder:text-[#B7BAC0]
                      placeholder:font-light
                      placeholder:text-[16px]
                      placeholder:leading-[157%]
                      focus:ring-0!
                      outline-none
                    "
            style={{
              letterSpacing: otp ? "8px" : "normal",
            }}
          />

          {/* Error Message */}
          {error && (
            <p className="text-red-400 text-sm ">{error}</p>
          )}
        </div>

        {/* BOTTOM SECTION: Buttons */}
        <div className="flex w-full gap-4 mt-0">

          <button
            className="h-11 flex-1 rounded-xl border border-[#4B5563] bg-transparent text-white hover:bg-white hover:text-black transition"
            onClick={() => navigate("/login")}
          >
            Back
          </button>

          <button
            className={`h-11 flex-1 rounded-xl text-white transition 
              ${otp.length === 4 ? "bg-[#155DFC]  hover:bg-[#123A93]" : "bg-[#818089] cursor-not-allowed"}`}
            onClick={handleVerify}
            disabled={otp.length !== 4}
          >
            Verify & Login
          </button>

        </div>

        {/* TIMER SECTION */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-400">
            OTP sent at {new Date().toLocaleTimeString()}
          </p>

          {timer > 0 ? (
            <p className="text-sm text-gray-400 mt-1">
              Resend available in {timer}s
            </p>
          ) : (
            <p
              className="text-sm text-[#155DFC] mt-1 cursor-pointer hover:underline"
              onClick={() => setTimer(60)}
            >
              Resend OTP
            </p>
          )}
        </div>
      </div>
    </div>

    </div>
  );
}

export default VerifyOtp;

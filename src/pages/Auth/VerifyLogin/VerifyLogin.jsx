import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtp } from "../../../api/auth/auth.jsx";
import rightSide from "../../../assets/login/rightSide.svg";
import welcomeImg from "../../../assets/login/welcome.svg";
import authlogo from "../../../assets/verify/authlogo.svg";

function VerifyOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");
  const [sentTime, setSentTime] = useState(new Date());

  const email = localStorage.getItem("pendingEmail");

  // -------------------------------
  // AUTO LOAD PREVIOUS TIMER
  // -------------------------------
  useEffect(() => {
    const savedSent = localStorage.getItem("otpSentTime");
    const savedExpire = localStorage.getItem("otpExpireTime");

    if (savedSent) setSentTime(new Date(savedSent));

    if (savedExpire) {
      const diff = Math.floor((savedExpire - Date.now()) / 1000);
      setTimer(diff > 0 ? diff : 0);
    }
  }, []);

  // -------------------------------
  // TIMER COUNTDOWN
  // -------------------------------
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // -------------------------------
  // START TIMER FUNCTION
  // -------------------------------
  const startTimer = () => {
    const now = new Date();
    const expireAt = Date.now() + 60000; // 60 sec

    setSentTime(now);
    setTimer(60);

    localStorage.setItem("otpSentTime", now.toISOString());
    localStorage.setItem("otpExpireTime", expireAt);
  };

  // -------------------------------
  // VERIFY OTP
  // -------------------------------
  const handleVerify = async () => {
    try {
      await verifyOtp(email, otp);

      startTimer(); // restart timer
      navigate("/dashboard");
    } catch (err) {
      setError("Incorrect OTP.");
      startTimer();
    }
  };

  // OTP formatting
  const getRawOtp = (value) => value.replace(/\D/g, "").slice(0, 4);
  const formatOtp = (value) =>
    value.replace(/\D/g, "").slice(0, 4).split("").join(" ");

  return (
    <div className="flex h-screen w-full bg-[#0B0B0F] text-white">
      {/* LEFT IMAGE */}
      <div className="relative flex-1 min-h-[260px]">
        <img src={rightSide} className="absolute inset-0 h-full w-full object-cover" />
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 -mt-17">
        <div className="w-[420px] flex flex-col items-center gap-3">

          {/* WELCOME */}
          <img src={welcomeImg} className="mx-auto mb-10 mt-4 w-[188px]" />

          {/* MFA BOX */}
          <div className="w-full bg-[#3A4083] border border-[#3A4083] rounded-lg p-4 h-[52px] mb-2">
            <div className="flex items-start ">
              <img src={authlogo} className="w-5 h-5 -mt-2" />
              <div className="ml-2 -mt-2">
                <p className="text-[14px] text-white font-medium">
                  Multi-Factor Authentication
                </p>
                <p className="text-[13px] text-[#BABABA]">
                  Enter 4-digit OTP sent to your email
                </p>
              </div>
            </div>
          </div>

          {/* OTP INPUT */}
          <input
            type="text"
            value={formatOtp(otp)}
            onChange={(e) => setOtp(getRawOtp(e.target.value))}
            maxLength={7}
            className={`w-[420px] h-[47px] rounded-[10px] px-4 py-[3px] border  text-white bg-transparent  ${error ? "border-[#EB1D2E]" : "border-[#B7BAC0]"} `}
            style={{ letterSpacing: otp ? "8px" : "normal" }}
            placeholder="Enter your 4-digit email OTP"
          />

          {error && <p className="text-[#EB1D2E] text-sm  w-full text-left ">{error}</p>}

          {/* BUTTONS */}
          <div className="flex w-full gap-4 mt-2">
            <button
              onClick={() => navigate("/login")}
              className="h-11 flex-1 rounded-xl border border-[#4B5563] bg-transparent text-white"
            >
              Back
            </button>

            <button
              onClick={handleVerify}
              disabled={otp.length !== 4}
              className={`h-11 flex-1 rounded-xl text-white 
                ${otp.length === 4 ? "bg-[#155DFC]" : "bg-[#818089] cursor-not-allowed"}`}
            >
              Verify & Login
            </button>
          </div>

          {/* TIMER AREA */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-400">
              OTP sent at {sentTime.toLocaleTimeString()}
            </p>

            {timer > 0 ? (
              <p className="text-sm text-gray-400 mt-1">
                Resend available in {timer}s
              </p>
            ) : (
              <p
                className="text-sm text-[#155DFC] mt-1 cursor-pointer hover:underline"
                onClick={startTimer}
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

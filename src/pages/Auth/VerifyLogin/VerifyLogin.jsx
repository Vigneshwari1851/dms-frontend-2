import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtp } from "../../../api/auth/auth.jsx";
import rightSide from "../../../assets/login/rightSide.svg";
import welcomeImg from "../../../assets/login/welcome.svg";
import authlogo from "../../../assets/verify/authlogo.svg";
import mobbg from "../../../assets/login/mobbg.png";


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
    setError("");

    try {
      const res = await verifyOtp(email, otp);
      if (res?.data) {
        localStorage.setItem("token", res.data.token);
        sessionStorage.setItem("is_session_active", "true");
        localStorage.setItem(
          "user",
          JSON.stringify({
            user_id: res.data.user_id,
            full_name: res.data.full_name,
            email: res.data.email,
            role: res.data.role,
          })
        );

        localStorage.removeItem("pendingEmail");
        localStorage.removeItem("otpSentTime");
        localStorage.removeItem("otpExpireTime");

        navigate("/dashboard");
        return;
      }

    } catch (err) {
      setError("Incorrect OTP.");
    }
  };

  // OTP formatting
  const getRawOtp = (value) => value.replace(/\D/g, "").slice(0, 4);
  const formatOtp = (value) =>
    value.replace(/\D/g, "").slice(0, 4).split("").join(" ");

  return (
    <>
      <style>{`
        @media (max-width: 1023px) {
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active {
            -webkit-text-fill-color: #000000 !important;
            -webkit-box-shadow: 0 0 0 30px white inset !important;
            box-shadow: 0 0 0 30px white inset !important;
          }
        }
        @media (min-width: 1024px) {
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active {
            -webkit-text-fill-color: #ffffff !important;
          }
        }
      `}</style>
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-[#0B0B0F] text-white">

        {/* MOBILE BACKGROUND - Visible on mobile only */}
        <div className="lg:hidden absolute inset-0 z-0">
          <img
            src={mobbg}
            alt="Mobile background"
            className="h-full w-full object-cover"
          />
        </div>

        {/* DESKTOP IMAGE - Visible on desktop only */}
        <div className="hidden lg:relative lg:flex lg:flex-1 min-h-[260px]">
          <img src={rightSide} className="absolute inset-0 h-full w-full object-cover" />
        </div>

        {/* RIGHT SIDE */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-10 min-h-screen lg:min-h-auto -mt-17 lg:mt-0">
          <div className="w-full max-w-[420px] flex flex-col items-center gap-3">

            {/* WELCOME */}
            <img src={welcomeImg} className="mx-auto mb-10 mt-4 w-[188px]" />

            {/* MFA BOX */}
            <div className="w-full bg-[#3A4083] border border-gray-700 lg:border-[#3A4083] rounded-lg p-4 h-[52px] mb-2">
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
              autoFocus
              type="text"
              value={formatOtp(otp)}
              onChange={(e) => setOtp(getRawOtp(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && otp.length === 4) {
                  handleVerify();
                }
              }}
              maxLength={7}
              className={`w-full max-w-[420px] h-[47px] rounded-[10px] px-4 py-[3px] border text-black lg:text-white bg-white lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none ${error ? "border-[#EB1D2E]" : "border-[#155DFC] lg:border-[#B7BAC0]"} `}
              style={{ letterSpacing: otp ? "8px" : "normal" }}
              placeholder="Enter your 4-digit email OTP"
            />

            {error && <p className="text-[#EB1D2E] text-sm  w-full text-left ">{error}</p>}

            {/* BUTTONS */}
            <div className="flex w-full gap-4 mt-2">
              <button
                onClick={() => navigate("/login")}
                className="h-11 flex-1 rounded-xl border border-[#4B5563] bg-white lg:bg-transparent text-black lg:text-white backdrop-blur-sm lg:backdrop-blur-none"
              >
                Back
              </button>

              <button
                onClick={handleVerify}
                disabled={otp.length !== 4}
                className={`h-11 flex-1 rounded-xl text-white backdrop-blur-sm lg:backdrop-blur-none
                ${otp.length === 4 ? "bg-[#1D4CB5] lg:bg-[#155DFC]" : "bg-[#808080] lg:bg-[#818089]"} ${otp.length === 4 ? "lg:cursor-pointer" : "lg:cursor-not-allowed"}`}
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
    </>
  );
}

export default VerifyOtp;

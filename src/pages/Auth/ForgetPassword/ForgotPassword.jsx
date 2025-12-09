import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendResetPasswordEmail } from "../../../api/auth/auth.jsx";
import rightSide from "../../../assets/login/rightSide.svg";
import mail from "../../../assets/forgotpassword/mail.svg";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("pendingEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleContinue = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email) {
      setErrorMessage("Email field cannot be empty.");
      return;
    }

    try {
      await sendResetPasswordEmail(email);
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send reset email"
      );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#16191C] text-white">

      {/* LEFT SIDE IMAGE */}
      <div className="relative flex-1 min-h-[260px]">
        <img
          src={rightSide}
          alt="Welcome background"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* RIGHT CONTENT SECTION */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-8">

        <div className={`w-full ${submitted ? "max-w-[528px]" : "max-w-[420px]"}`}>

          {!submitted ? (
            <>
              <div className="flex flex-col gap-2 items-center text-center">
                <h2 className="text-2xl font-normal text-white mb-4">
                  Forgot Password
                </h2>

                <p className="text-[#999999] mb-6 text-sm" >
                  To reset your password, please enter your<br /> email address below.
                </p>
              </div>

              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Type your email here"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 h-11 rounded-xl border ${errorMessage
                    ? "border-red-500"
                    : "border-gray-300 focus:border-gray-400"
                    } focus:outline-none`}
                />
                {errorMessage && (
                  <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                )}
              </div>

              <div className="flex justify-between gap-4 mt-6">
                <button
                  className="w-1/2 h-11 rounded-xl border border-gray-400 text-gray-600 hover:bg-gray-100 transition"
                  onClick={() => navigate("/login")}
                >
                  Back
                </button>

                <button
                  className={`w-1/2 h-11 rounded-xl transition
                    ${email
                      ? "bg-[#155DFC] hover:bg-[#0f2d75] text-white "
                      : "bg-[#818089] cursor-not-allowed text-black"
                    }`}
                  disabled={!email}
                  onClick={handleContinue}
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            <div className="text-center  mx-auto">


              {/* MAIL ICON WITH RADIAL GLOW */}
              <div className="relative flex items-center justify-center mb-10">
                <div className="absolute w-[150px] h-[150px] 
        bg-[#155DFC] opacity-20 blur-[60px] rounded-full"></div>

                <img src={mail} alt="mail" className="w-14 h-14 relative z-10" />
              </div>



              <h2 className="font-poppins font-normal text-[25px] leading-relaxed text-center text-white">
                A temporary access link <br />
                has been sent to your email <br />
                address.
              </h2>


              <p className="text-[#999999] text-sm mt-5">
                Please click the link in the email to create a new<br />
                password for your account.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

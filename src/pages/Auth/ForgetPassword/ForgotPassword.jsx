import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendResetPasswordEmail } from "../../../api/auth/auth.jsx";
import rightSide from "../../../assets/login/rightSide.svg";
import mail from "../../../assets/forgotpassword/mail.svg";
import mobbg from "../../../assets/login/mobbg.png";

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
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-[#16191C] text-white">

        {/* MOBILE BACKGROUND - Visible on mobile only */}
        <div className="lg:hidden absolute inset-0 z-0">
          <img
            src={mobbg}
            alt="Mobile background"
            className="h-full w-full object-cover"
          />
        </div>

        {/* LEFT SIDE IMAGE - DESKTOP */}
        <div className="hidden lg:relative lg:flex lg:flex-1 min-h-[260px]">
          <img
            src={rightSide}
            alt="Welcome background"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* RIGHT CONTENT SECTION */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-8">

          <div className={`w-full ${submitted ? "max-w-[528px]" : "max-w-[420px]"}`}>

            {!submitted ? (
              <>
                <div className="flex flex-col gap-2 items-center text-center">
                  <h2 className="text-2xl font-normal text-white mb-4">
                    Forgot Password
                  </h2>

                  <p className="text-[#999999] mb-6 text-sm" >
                    To reset your password, please enter your<br className="hidden lg:block" /> email address below.
                  </p>
                </div>

                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="Type your email here"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 h-11 rounded-xl border text-black lg:text-white bg-white lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none ${errorMessage
                      ? "border-red-500"
                      : "border-[#155DFC] lg:border-gray-300 focus:border-gray-400"
                      } focus:outline-none`}
                  />
                  {errorMessage && (
                    <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                  )}
                </div>

                <div className="flex justify-between gap-4 mt-6">
                  <button
                    className="w-1/2 h-11 rounded-xl border border-gray-400 text-black lg:text-gray-600 bg-white lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none hover:bg-gray-100 transition"
                    onClick={() => navigate("/login")}
                  >
                    Back
                  </button>

                  <button
                    className={`w-1/2 h-11 rounded-xl transition backdrop-blur-sm lg:backdrop-blur-none text-white
                    ${email ? "bg-[#1D4CB5] lg:bg-[#155DFC] lg:hover:bg-[#0f2d75]" : "bg-[#808080] lg:bg-[#818089] lg:cursor-not-allowed"}
                    `}
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
                  <div className="hidden lg:block absolute w-[150px] h-[150px] 
        bg-[#155DFC] opacity-20 blur-[60px] rounded-full"></div>

                  <img src={mail} alt="mail" className="w-14 h-14 relative z-10" />
                </div>



                <h2 className="font-poppins font-normal text-[25px] leading-relaxed text-center text-white">
                  A temporary access link <br className="hidden lg:block" />
                  has been sent to your email <br className="hidden lg:block" />
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
    </>
  );
}

export default ForgotPassword;

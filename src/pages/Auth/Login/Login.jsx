import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import rightSide from "../../../assets/login/rightSide.svg";
import welcomeImg from "../../../assets/login/welcome.svg";
import successIcon from "../../../assets/login/Success.svg";
import failureIcon from "../../../assets/login/Failure.svg";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { loginUser } from "../../../api/auth/auth";
import mobbg from "../../../assets/login/mobbg.png";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorType, setErrorType] = useState("");

  // Load saved email on page load
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);



  // Input change
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // if email cleared → remove saved email
    if (name === "email" && !value) {
      localStorage.removeItem("savedEmail");
      setRememberMe(false);
    }
  };

  // Remember me toggle
  const handleRememberChange = (event) => {
    const checked = event.target.checked;
    setRememberMe(checked);

    if (!checked) {
      localStorage.removeItem("savedEmail");
    }
  };

  const validateForm = () => {
    const newErrors = { email: "", password: "" };

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else {
      const emailPattern = /\S+@\S+\.\S+/;
      if (!emailPattern.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password cannot be empty.";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Weekend check
    // const today = new Date().getDay();
    // if (today === 0 || today === 6) {
    //   navigate("/account-disabled", {
    //     state: {
    //       message:
    //         "Your account is temporarily deactivated on weekends for routine system checks. Please try again on Monday.",
    //     },
    //   });
    //   return;
    // }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const res = await loginUser(formData.email, formData.password);

      console.log("LOGIN RESPONSE:", res);

      // FIRST TIME USER → GO TO RESET PASSWORD
      if (res.status === "FORCE_PASSWORD_CHANGE") {
        localStorage.setItem("pendingEmail", formData.email);
        localStorage.setItem("oldPassword", formData.password);
        handleRememberLogic();
        navigate("/reset-password");
        return;
      }

      // OTP SENT
      if (res.message === "OTP sent to your registered email address.") {
        localStorage.setItem("pendingEmail", formData.email);
        handleRememberLogic();
        navigate("/verify-login");
        return;
      }

      // SUCCESS → STILL OTP REQUIRED
      if (res.status === "SUCCESS") {
        localStorage.setItem("pendingEmail", formData.email);
        handleRememberLogic();
        navigate("/verify-login");
        return;
      }
    } catch (error) {
        const backendMsg =
        error?.data?.error || error?.data?.message || error?.message || "Login failed";

      const lowerMsg = backendMsg.toLowerCase();

      setErrors({
        email: lowerMsg.includes("email") ? backendMsg : "",
        password: lowerMsg.includes("password") ? backendMsg : "",
      });

      setErrorMessage(backendMsg);
    }
    setIsSubmitting(false);
  };

  // Remember Me save/remove logic
  const handleRememberLogic = () => {
    if (rememberMe) {
      localStorage.setItem("savedEmail", formData.email);
    } else {
      localStorage.removeItem("savedEmail");
    }
  };

  const statusStyles = {
    container: {
      width: 360,
      height: 56,
      top: 32,
      right: 24,
      borderRadius: 8,
      padding: "12px 16px",
      gap: 16,
      backgroundColor: "#2E3439",
      boxShadow:
        "0px 8px 10px 0px #00000033, 0px 6px 30px 0px #0000001F, 0px 16px 24px 0px #00000024",
    },
  };

  const inputClass = (hasError, value) =>
    `
    w-full
    max-w-[420px]
    h-[44px]
    rounded-[8px]
    px-3
    text-sm
    outline-none
    border
    text-black lg:text-white
    bg-white ${value ? "lg:bg-transparent" : "lg:bg-[#16191C]"}
    ${hasError ? "border-red-400" : "border-[#155DFC] lg:border-[#E7E7E7]"}
    backdrop-blur-sm lg:backdrop-blur-none
  `;

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
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-[#050814] text-white">

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
          <img
            src={rightSide}
            alt="Welcome background"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-10 min-h-screen lg:min-h-auto">
          <div className="w-full max-w-[548px] lg:bg-[#050814]">

            <img
              src={welcomeImg}
              alt="Logo"
              className="mx-auto mb-15 mt-4 w-[257px] h-[47px]"
            />

            {/* FORM */}
            <form onSubmit={handleSubmit} noValidate>
              <div
                className="flex flex-col mx-auto w-full max-w-[420px] gap-8"
              >

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Type your email here"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    className={inputClass(!!errors.email, formData.email)}
                  />
                  {errors.email && (
                    <p className="text-xs text-[#EB1D2E]">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={window.innerWidth < 1024 ? "Enter your password" : "Enter the password received in your email"}
                      value={formData.password}
                      onChange={handleInputChange}
                      autoComplete="current-password"
                      className={inputClass(!!errors.password, formData.password)}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#a2aed0]"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeIcon className="h-5 w-5" />
                      ) : (
                        <EyeSlashIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-[#EB1D2E]">{errors.password}</p>
                  )}
                </div>

                {/* Remember me */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-[#B5B5B5] cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={handleRememberChange}
                        className="peer absolute h-4 w-4 opacity-0 cursor-pointer"
                      />
                      <div className="h-4 w-4 border border-white rounded-sm bg-transparent peer-checked:bg-[#123A93] flex items-center justify-center">
                        <svg
                          className={`w-3 h-3 text-white transition-opacity duration-150 ${rememberMe ? "opacity-100" : "opacity-0"}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                    Remember me
                  </label>

                  {/* Forgot Password */}
                  <button
                    type="button"
                    className="font-semibold text-[#B5B5B5] lg:text-[#155DFC] cursor-pointer"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className={`
                  w-full
                  h-11
                  rounded-lg
                  text-white
                  text-sm
                  font-medium
                  transition
                  backdrop-blur-sm lg:backdrop-blur-none
                  ${formData.email ? "bg-[#1D4CB5] lg:bg-[#155DFC] hover:bg-[#163a8f] lg:hover:bg-[#123A93]" : "bg-[#808080] lg:bg-[#818089]"}
                
                `}
                  disabled={!formData.email || isSubmitting}

                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>

              </div>
            </form>

          </div>
        </div>
      </div>
    </>
  );
}

export default Login;

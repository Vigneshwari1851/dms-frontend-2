import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword, resetPasswordViaEmail } from "../../../api/auth/auth.jsx";
import rightSide from "../../../assets/login/rightSide.svg";
import { EyeIcon, EyeSlashIcon, CheckIcon } from "@heroicons/react/24/outline";
import mobbg from "../../../assets/login/mobbg.png";

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const urlEmail = queryParams.get("email");

    const email = !urlEmail ? localStorage.getItem("pendingEmail") : null;
    const oldPassword = !urlEmail ? localStorage.getItem("oldPassword") : null;

    const validatePassword = (password) => ({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[@#$%^&_*!]/.test(password),
    });

    const rules = validatePassword(password);

    const inputClass = (hasError) =>
        `w-full max-w-[420px] h-[44px] rounded-[8px] px-3 text-sm outline-none border backdrop-blur-sm lg:backdrop-blur-none text-black lg:text-white bg-white lg:bg-[#16191C] ${hasError ? "border-red-400" : "border-[#155DFC] lg:border-[#E7E7E7]"
        } placeholder:text-[#6B7280]`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!password || !confirmPassword) {
            setError("This fields can't be empty");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords doesn't match. Please try again.");
            return;
        }

        setLoading(true);

        try {
            const payload = urlEmail
                ? { email: urlEmail, newPassword: password }
                : { email, oldPassword, newPassword: password };

            const res = urlEmail
                ? await resetPasswordViaEmail(payload)
                : await resetPassword(payload);

            if (
                res?.message === "Password Changed successfully" ||
                res?.message === "Password changed successfully"
            ) {
                if (!urlEmail) {
                    localStorage.removeItem("pendingEmail");
                    localStorage.removeItem("oldPassword");
                }
                navigate("/login");
            }
        } catch (err) {
            setError(err.message || "Failed to reset password. Try again.");
        }

        setLoading(false);
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
            <div className="flex h-screen overflow-hidden flex-col lg:flex-row bg-[#050814] text-white">

                {/* MOBILE BACKGROUND - Visible on mobile only */}
                <div className="lg:hidden absolute inset-0 z-0">
                    <img
                        src={mobbg}
                        alt="Mobile background"
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* LEFT IMAGE SECTION - DESKTOP */}
                <div className="hidden lg:relative lg:flex lg:flex-1 min-h-[260px]">
                    <img
                        src={rightSide}
                        alt="Background"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                </div>

                {/* RIGHT FORM SECTION */}
                <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
                    <div className="w-full max-w-[548px] lg:bg-[#050814]">
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="flex flex-col mx-auto w-full max-w-[420px] gap-6">
                                <div className="flex flex-col gap-2 items-center text-center">
                                    <h2 className="text-xl font-semibold">Reset Password</h2>
                                    <p className="text-sm text-[#B5B5B5]">
                                        To reset your password, please enter your new password and confirm it.
                                    </p>
                                </div>

                                {/* New Password */}
                                <div className="flex flex-col gap-1">
                                    <div className="relative">
                                        <input
                                            type={showPass ? "text" : "password"}
                                            placeholder="New password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setTouched(true);
                                            }}
                                            onFocus={() => setTouched(true)}
                                            className={inputClass(!!error)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a2aed0]"
                                            onClick={() => setShowPass(!showPass)}
                                        >
                                            {showPass ? (
                                                <EyeIcon className="h-5 w-5" />
                                            ) : (
                                                <EyeSlashIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="flex flex-col gap-1">
                                    <div className="relative">
                                        <input
                                            type={showConfirmPass ? "text" : "password"}
                                            placeholder="Confirm password"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setTouched(true);
                                            }}
                                            onFocus={() => setTouched(true)}
                                            className={inputClass(!!error)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a2aed0]"
                                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                                        >
                                            {showConfirmPass ? (
                                                <EyeIcon className="h-5 w-5" />
                                            ) : (
                                                <EyeSlashIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Error message */}
                                {error && <p className="text-xs text-[#EB1D2E]">{error}</p>}

                                {/* PASSWORD RULES WITH BIG TICK ICONS */}
                                <ul className="mt-2 space-y-2 text-xs text-[#ABABAB]">
                                    {[
                                        { check: rules.length, label: "At least 8 characters long" },
                                        { check: rules.uppercase, label: "One Uppercase letter (A-Z)" },
                                        { check: rules.lowercase, label: "One Lowercase letter (a-z)" },
                                        { check: rules.number, label: "One Number (0-9)" },
                                        { check: rules.special, label: "One special character (@#$%^&*!)" },
                                    ].map((rule, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <span
                                                className={`h-3.5 w-3.5 flex items-center justify-center bg-transparent rounded-full border p-0.5 ${rule.check
                                                    ? "bg-[#155DFC] border-[#155DFC] border"
                                                    : "border-[#4B5563] border"
                                                    }`}
                                            >
                                                {rule.check && <CheckIcon className="h-4 w-4 text-[#155DFC] " />}
                                            </span>
                                            {rule.label}
                                        </li>
                                    ))}
                                </ul>

                                {/* Buttons */}
                                <div className="mt-4 flex items-center justify-between gap-4">
                                    {!urlEmail && (
                                        <button
                                            type="button"
                                            className="h-11 flex-1 rounded-xl border border-[#4B5563] text-sm font-semibold text-black lg:text-white bg-white lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none hover:bg-gray-100 lg:hover:bg-white 
    hover:text-black "
                                            onClick={() => navigate(-1)}
                                        >
                                            Back
                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        className={`h-11 flex-1 rounded-xl text-sm font-semibold text-white backdrop-blur-sm lg:backdrop-blur-none disabled:opacity-60 ${password ? "bg-[#1D4CB5] lg:bg-[#155DFC] lg:hover:bg-[#123A93]" : "bg-[#808080] lg:bg-[#818089]"}`}
                                        disabled={!password || loading}

                                    >
                                        {loading ? "Processing..." : "Login"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResetPassword;

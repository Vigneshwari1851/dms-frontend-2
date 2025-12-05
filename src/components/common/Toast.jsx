import React from "react";

function Toast({ show, message, type }) {
    return (
        <>
            {show && (
                <div
                    className={`
                        fixed top-5 right-5 z-9999
                        flex items-center gap-3
                        px-5 py-3
                        rounded-xl shadow-lg
                        transition-all duration-300
                        w-[400px]
                        ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}
                        ${type === "success"
                            ? "bg-linear-to-r from-green-100 to-white"
                            : "bg-linear-to-r from-red-100 to-white"}
                    `}
                    style={{ boxShadow: "0px 4px 20px rgba(0,0,0,0.15)" }}
                >
                    <div className="relative flex items-center justify-center w-8 h-8">
                        <div className="absolute inset-0 rounded-full border-6 border-gray-300/60 pointer-events-none"></div>
                            <div
                                className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center
                                ${type === "success" ? "bg-green-500" : "bg-red-500"}`}
                            >
                                {type === "success" ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="white"
                                    className="w-4 h-4"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="white"
                                    className="w-4 h-4"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                )}
                            </div>
                        </div>

                    <span className="text-[16px] font-medium">
                        {message}
                    </span>
                </div>
            )}
        </>
    );
}

export default Toast;

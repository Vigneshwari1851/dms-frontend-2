const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.BASE_LOCAL_API_URL;

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            if (!window.location.pathname.includes("/login")) {
                const isSessionActive = sessionStorage.getItem("is_session_active");
                if (isSessionActive) {
                    window.location.href = "/login?expired=true";
                } else {
                    window.location.href = "/login";
                }
            }
            sessionStorage.removeItem("is_session_active");
            return response;
        }

        if (response.ok) {
            sessionStorage.setItem("is_session_active", "true");
        }

        return response;
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error;
    }
};

export default API_BASE_URL;

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const fetchNotifications = async (filter = "all") => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/notifications`, {
            params: { filter },
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching notifications", error);
        throw error;
    }
};

export const markNotificationsRead = async (ids) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post(`${API_URL}/notifications/mark-read`, { ids }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Error marking notifications as read", error);
        throw error;
    }
};

export const markNotificationsUnread = async (ids) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post(`${API_URL}/notifications/mark-unread`, { ids }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Error marking notifications as unread", error);
        throw error;
    }
};

export const deleteNotifications = async (ids) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post(`${API_URL}/notifications/delete`, { ids }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Error deleting notifications", error);
        throw error;
    }
};

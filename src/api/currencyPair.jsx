import API_BASE_URL from "./config";

const API_URL = API_BASE_URL;

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export const fetchCurrencyPairs = async (params = {}) => {
    try {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_URL}/currency-pair?${query}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            console.error("Failed to fetch currency pairs:", response.status);
            return { data: [], pagination: { totalPages: 1 } };
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error fetching currency pairs:", error);
        return { data: [], pagination: { totalPages: 1 } };
    }
};

export const createCurrencyPair = async (data) => {
    try {
        const response = await fetch(`${API_URL}/currency-pair`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Failed to create currency pair:", response.status, text);
            return null;
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error creating currency pair:", error);
        return null;
    }
};

export const updateCurrencyPair = async (id, data) => {
    try {
        const response = await fetch(`${API_URL}/currency-pair/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            console.error("Failed to update currency pair:", response.status);
            return null;
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error updating currency pair:", error);
        return null;
    }
};

export const deleteCurrencyPair = async (id) => {
    try {
        const response = await fetch(`${API_URL}/currency-pair/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            console.error("Failed to delete currency pair:", response.status);
            return null;
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error deleting currency pair:", error);
        return null;
    }
};

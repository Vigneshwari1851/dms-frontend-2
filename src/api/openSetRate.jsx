import API_BASE_URL, { apiFetch } from "./config";

export async function fetchOpenSetRates(date) {
    try {
        const query = date ? `?date=${date}` : "";
        const response = await apiFetch(`/open-set-rate${query}`, {
            method: "GET",
        });

        if (!response.ok) {
            console.error("Failed to fetch open set rates");
            return { success: false, data: [] };
        }

        const result = await response.json();
        return {
            success: true,
            data: result.data || [],
            previousRate: result.previousRate || 0
        };
    } catch (error) {
        console.error("Error fetching open set rates:", error);
        return { success: false, data: [] };
    }
}

export async function upsertOpenSetRate(data) {
    try {
        const response = await apiFetch(`/open-set-rate`, {
            method: "POST",
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const result = await response.json();
            return { success: false, error: result.error || "Failed to save rate" };
        }

        const result = await response.json();
        return { success: true, data: result.data };
    } catch (error) {
        console.error("Error saving open set rate:", error);
        return { success: false, error: "Network error" };
    }
}

import { apiFetch } from "./config";

/**
 * Fetch global settings from the API.
 */
export async function fetchGlobalSettings() {
    try {
        const response = await apiFetch("/settings", {
            method: "GET",
        });

        if (!response.ok) {
            console.error("Failed to fetch settings:", response.status);
            return null;
        }

        const result = await response.json();
        return result.data || result;
    } catch (error) {
        console.error("Error fetching settings:", error);
        return null;
    }
}

/**
 * Specifically fetch the current user's country code based on IP using a public API.
 */
export async function fetchCountryCode() {
    try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) {
            throw new Error("Failed to fetch from ipapi");
        }
        const result = await response.json();
        return result.country_calling_code || "+255";
    } catch (error) {
        console.error("Error fetching country code from public API:", error);
        return "+255";
    }
}

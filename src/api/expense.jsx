import { format } from "date-fns";
import API_BASE_URL, { apiFetch } from "./config";

const API_URL = API_BASE_URL;

export const fetchExpenses = async (params = {}) => {
    try {
        const { dateRange, ...rest } = params;
        const finalParams = { ...rest };

        if (dateRange?.start && dateRange?.end) {
            finalParams.startDate = format(dateRange.start, "yyyy-MM-dd");
            finalParams.endDate = format(dateRange.end, "yyyy-MM-dd");
            finalParams.dateFilter = "custom";
        } else if (params.dateFilter) {
            finalParams.dateFilter = params.dateFilter;
        }

        const queryString = new URLSearchParams(finalParams).toString();
        const response = await apiFetch(`/expense${queryString ? `?${queryString}` : ""}`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch expenses");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching expenses:", error);
        throw error;
    }
};

export const createExpense = async (data) => {
    try {
        const response = await apiFetch(`/expense`, {
            method: "POST",
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating expense:", error);
        throw error;
    }
};

export const updateExpense = async (id, data) => {
    try {
        const response = await apiFetch(`/expense/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating expense:", error);
        throw error;
    }
};

export const deleteExpense = async (id) => {
    try {
        const response = await apiFetch(`/expense/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Failed to delete expense");
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting expense:", error);
        throw error;
    }
};

export const exportExpenses = async ({ format, dateFilter, startDate, endDate } = {}) => {
    try {
        const params = new URLSearchParams({ format });
        if (dateFilter) params.append("dateFilter", dateFilter);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const response = await apiFetch(`/expense?${params.toString()}`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to export expenses");
        }

        return await response.blob();
    } catch (error) {
        console.error("Export error:", error);
        return null;
    }
};

import API_BASE_URL, { apiFetch } from "./config";

const API_URL = API_BASE_URL;

export async function fetchDeals({ page = 1, limit = 10, currency, dateFilter, startDate, endDate } = {}) {
  try {
    const params = { page, limit };
    if (currency) params.currency = currency;
    if (dateFilter) params.dateFilter = dateFilter;

    if (dateFilter === "custom" && startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }

    const queryString = new URLSearchParams(params).toString();

    const response = await apiFetch(`/deal?${queryString}`, {
      method: "GET",
    });

    if (!response.ok) {
      console.error("Failed to fetch deals:", response.status);
      return { data: [], pagination: { totalPages: 1 }, stats: {} };
    }

    const result = await response.json();

    return {
      data: result.data || [],
      pagination: result.pagination || { totalPages: 1 },
      stats: result.stats || {},
    };

  } catch (error) {
    console.error("Error fetching deals:", error);
    return { data: [], pagination: { totalPages: 1 }, stats: {} };
  }
}

export async function exportDeals(format, dateFilter) {
  try {
    const params = new URLSearchParams({ format });
    if (dateFilter) params.append("dateFilter", dateFilter);

    const response = await apiFetch(`/deal?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to export deal");
    }

    const blob = await response.blob();
    return blob;

  } catch (error) {
    console.error("Export error:", error);
    return null;
  }
}

export async function fetchDealById(id) {
  try {
    const response = await apiFetch(`/deal/${id}`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to fetch deal with ID ${id}:`, errorData);
      return { success: false, error: errorData };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error(`Error fetching deal with ID ${id}:`, error);
    return { success: false, error };
  }
}

export async function createDeal(dealData) {
  try {
    const response = await apiFetch(`/deal`, {
      method: "POST",
      body: JSON.stringify(dealData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Failed to create deal:", result);
      return { success: false, error: result };
    }

    return { success: true, data: result };

  } catch (error) {
    console.error("Error creating deal:", error);
    return { success: false, error };
  }
}

export async function updateDeal(id, dealData) {
  try {
    const response = await apiFetch(`/deal/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dealData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`Failed to update deal with ID ${id}:`, result);
      return { success: false, error: result };
    }

    return { success: true, data: result };

  } catch (error) {
    console.error(`Error updating deal with ID ${id}:`, error);
    return { success: false, error };
  }
}

export async function deleteDeal(id) {
  try {
    const response = await apiFetch(`/deal/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to delete deal with ID ${id}:`, errorData);
      return { success: false, error: errorData };
    }

    return { success: true };

  } catch (error) {
    console.error(`Error deleting deal with ID ${id}:`, error);
    return { success: false, error };
  }
}


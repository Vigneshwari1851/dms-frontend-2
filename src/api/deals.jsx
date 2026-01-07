import API_BASE_URL from "./config";

const API_URL = API_BASE_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

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

    const response = await fetch(`${API_URL}/deal?${queryString}`, {
      method: "GET",
      headers: getAuthHeaders(),
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
    // Build query parameters
    const params = new URLSearchParams({ format });
    if (dateFilter) params.append("dateFilter", dateFilter);

    const response = await fetch(`${API_URL}/deal?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to export deal");
    }

    const blob = await response.blob(); // MUST be blob
    return blob;

  } catch (error) {
    console.error("Export error:", error);
    return null;
  }
}



export async function fetchDealById(id) {
  try {
    const response = await fetch(`${API_URL}/deal/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
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
    const response = await fetch(`${API_URL}/deal`, {
      method: "POST",
      headers: getAuthHeaders(),
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
    const response = await fetch(`${API_URL}/deal/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
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
    const response = await fetch(`${API_URL}/deal/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
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


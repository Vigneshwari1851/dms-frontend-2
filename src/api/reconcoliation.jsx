const API_URL = "http://localhost:3000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchReconcoliation({ page = 1, limit = 10, currency, dateFilter, startDate, endDate } = {}) {
  try {
    const params = { page, limit };
    if (currency) params.currency = currency;
    if (dateFilter) params.dateFilter = dateFilter;

    if (dateFilter === "custom" && startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }

    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`${API_URL}/reconciliation?${queryString}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.error("Failed to fetch reconciliation:", response.status);
      return { data: [], pagination: { totalPages: 1 }, stats: {} };
    }

    const result = await response.json();

    return {
      data: result.data || [],
      pagination: result.pagination || { totalPages: 1 },
      stats: result.stats || {},
    };

  } catch (error) {
    console.error("Error fetching reconciliation:", error);
    return { data: [], pagination: { totalPages: 1 }, stats: {} };
  }
}

export async function exportReconciliation(format, dateFilter) {
  try {
    // Build query parameters
    const params = new URLSearchParams({ format });
    if (dateFilter) params.append("dateFilter", dateFilter);

    const response = await fetch(`${API_URL}/reconciliation?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to export reconciliation");
    }

    const blob = await response.blob(); // MUST be blob
    return blob;

  } catch (error) {
    console.error("Export error:", error);
    return null;
  }
}

export async function fetchReconciliationAlerts() {
  try {
    const response = await fetch(`${API_URL}/reconciliation/alerts`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.error("Failed to fetch reconciliation alerts:", response.status);
      return [];
    }

    const result = await response.json();

    return result || [];
  } catch (error) {
    console.error("Error fetching reconciliation alerts:", error);
    return [];
  }
}

export async function fetchReconciliationById(id) {
  try {
    const response = await fetch(`${API_URL}/reconciliation/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to fetch reconciliation with ID ${id}:`, errorData);
      return { success: false, error: errorData };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error(`Error fetching reconciliation with ID ${id}:`, error);
    return { success: false, error };
  }
}

export async function createReconciliation(reconciliationData) {
  try {
    const response = await fetch(`${API_URL}/reconciliation`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(reconciliationData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Failed to create reconciliation:", result);
      return { success: false, error: result };
    }

    return { success: true, data: result };

  } catch (error) {
    console.error("Error creating reconciliation:", error);
    return { success: false, error };
  }
}

export async function updateReconciliation(id, reconciliationData) {
  try {
    const response = await fetch(`${API_URL}/reconciliation/status/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(reconciliationData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`Failed to update reconciliation with ID ${id}:`, result);
      return { success: false, error: result };
    }

    return { success: true, data: result };

  } catch (error) {
    console.error(`Error updating reconciliation with ID ${id}:`, error);
    return { success: false, error };
  }
}

export async function deleteReconciliation(id) {
  try {
    const response = await fetch(`${API_URL}/reconciliation/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to delete reconciliation with ID ${id}:`, errorData);
      return { success: false, error: errorData };
    }

    return { success: true };

  } catch (error) {
    console.error(`Error deleting reconciliation with ID ${id}:`, error);
    return { success: false, error };
  }
}


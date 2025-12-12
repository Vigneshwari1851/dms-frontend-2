const API_URL = "http://localhost:3000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchDeals({ page = 1, limit = 10, currency, dateFilter } = {}) {
  try {
    const params = { page, limit };
    if (currency) params.currency = currency;
    if (dateFilter) params.dateFilter = dateFilter;

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

/**
 * Download deals as PDF or Excel.
 * The backend responds with JSON containing a downloadUrl, so we:
 * 1) call /deal?format=... to get the temp file url
 * 2) fetch that url as a blob and trigger a download
 */
export async function exportDeals(format, params = {}) {
  const downloadBlob = (blob, fallbackName) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fallbackName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  try {
    const query = new URLSearchParams({ ...(params || {}), format }).toString();
    const response = await fetch(`${API_URL}/deal?${query}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const contentType = response.headers.get("content-type") || "";

    // If server directly streams file
    if (response.ok && !contentType.includes("application/json")) {
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : `deals.${format === "pdf" ? "pdf" : "xlsx"}`;
      downloadBlob(blob, filename);
      return { success: true };
    }

    // Otherwise expect JSON with downloadUrl
    const json = await response.json();
    if (!response.ok) {
      console.error("Failed to export deals:", json);
      return { success: false, error: json };
    }

    const downloadUrl = json.downloadUrl;
    if (!downloadUrl) {
      console.error("Export response missing downloadUrl");
      return { success: false };
    }

    const fileResponse = await fetch(`${API_URL}${downloadUrl}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!fileResponse.ok) {
      console.error("Failed to fetch exported file");
      return { success: false };
    }

    const blob = await fileResponse.blob();
    const disposition = fileResponse.headers.get("Content-Disposition") || "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : `deals.${format === "pdf" ? "pdf" : "xlsx"}`;
    downloadBlob(blob, filename);

    return { success: true };
  } catch (error) {
    console.error("Error exporting deals:", error);
    return { success: false, error };
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
      method: "PUT",
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


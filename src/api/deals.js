const API_URL = "http://localhost:3000";

function getAuthHeaders() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJlbWFpbCI6InZpZ25lc2h3YXJpMTg1MUBnbWFpbC5jb20iLCJyb2xlIjoiTWFrZXIiLCJpYXQiOjE3NjUzNDEwNjgsImV4cCI6MTc2NTQyNzQ2OH0.leckKxMYIHENaaabltcb40GLSs5KxBc-JrmYLMHeWJ4"
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


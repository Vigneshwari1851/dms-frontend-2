const API_URL = "http://localhost:3000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchCurrencies({ page = 1, limit = 10, search } = {}) {
  try {
    const params = { page, limit };

    if (search) params.search = search;

    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`${API_URL}/currency?${queryString}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.error("Failed to fetch currency:", response.status);
      return [];
    }

    const result = await response.json();
    return result?.data || [];

  } catch (error) {
    console.error("Error fetching currency:", error);
    return [];
  }
}

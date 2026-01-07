const API_URL = "http://24.199.110.37";

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

export async function createCurrency({ code, name, symbol }) {
  try {
    const response = await fetch(`${API_URL}/currency`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ code, name, symbol }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Failed to create currency:", response.status, text);
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating currency:", error);
    return null;
  }
}
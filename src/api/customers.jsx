const API_URL = "http://localhost:3000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Search customers by name/phone.
 * Example: GET /customer?search=lavanya
 */
export async function searchCustomers(searchTerm = "") {
  try {
    const query = new URLSearchParams({
      search: searchTerm || "",
    }).toString();

    const response = await fetch(`${API_URL}/customer?${query}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Failed to search customers:", result);
      return { success: false, error: result, data: [] };
    }

    return { success: true, data: result.data || [] };
  } catch (error) {
    console.error("Error searching customers:", error);
    return { success: false, error, data: [] };
  }
}

export async function addCustomer(customer) {
  try {
    const response = await fetch(`${API_URL}/customer`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(customer),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Failed to add customer:", result);
      return { success: false, error: result };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error adding customer:", error);
    return { success: false, error };
  }
}

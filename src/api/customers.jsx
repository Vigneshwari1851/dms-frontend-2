import API_BASE_URL from "./config";

const API_URL = API_BASE_URL;

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
export async function searchCustomers(searchTerm = "", searchType = "name") {
  try {
    const query = new URLSearchParams({
      search: searchTerm || "",
      searchType: searchType,
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

export async function fetchCustomerById(id) {
  try {
    const response = await fetch(`${API_URL}/customer/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result };
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function updateCustomer(id, customer) {
  try {
    const response = await fetch(`${API_URL}/customer/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(customer),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Failed to update customer:", result);
      return { success: false, error: result };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error updating customer:", error);
    return { success: false, error };
  }
}

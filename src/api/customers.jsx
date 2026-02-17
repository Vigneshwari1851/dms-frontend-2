import API_BASE_URL, { apiFetch } from "./config";

const API_URL = API_BASE_URL;

/**
 * Search customers by name/phone.
 * Example: GET /customer?search=lavanya
 */
export async function searchCustomers(
  searchTerm = "",
  searchType = "name",
  { page = 1, limit = 10 } = {}
) {
  try {
    const query = new URLSearchParams({
      search: searchTerm,
      searchType,
      page,
      limit,
    }).toString();

    const response = await apiFetch(`/customer?${query}`, {
      method: "GET",
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        data: [],
        pagination: { totalPages: 1 },
      };
    }

    return {
      success: true,
      data: result.data || [],
      pagination: result.pagination,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: [],
      pagination: { totalPages: 1 },
    };
  }
}

export async function addCustomer(customer) {
  try {
    const response = await apiFetch(`/customer`, {
      method: "POST",
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
    const response = await apiFetch(`/customer/${id}`, {
      method: "GET",
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
    const response = await apiFetch(`/customer/${id}`, {
      method: "PUT",
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

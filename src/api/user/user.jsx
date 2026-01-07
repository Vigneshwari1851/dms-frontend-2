const API_URL = "http://24.199.110.37"; 

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchUsers({ page = 1, limit = 10, orderBy = "full_name", direction = "asc" } = {}) {
  try {
    const params = { page, limit, orderBy, direction };
    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`${API_URL}/user?${queryString}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.error("Failed to fetch users:", response.status);
      return { data: [], pagination: { totalPages: 1 } };
    }

    const result = await response.json();
    
    return {
      data: result.data || [],
      pagination: result.pagination || { totalPages: 1 },
    };

  } catch (error) {
    console.error("Error fetching users:", error);
    return { data: [], pagination: { totalPages: 1 } };
  }
}

export async function createUser({ full_name, email, phone_number, role }) {
  try {
    const response = await fetch(`${API_URL}/user`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        full_name,
        email,
        phone_number,
        role
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Failed to create user:", result);
      return { success: false, error: result };
    }

    return { success: true, data: result };

  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error };
  }
}

export async function fetchUserById(id) {
  try {
    const response = await fetch(`${API_URL}/user/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to fetch user with ID ${id}:`, errorData);
      return { success: false, error: errorData };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    return { success: false, error };
  }
}

export async function updateUser(id, { full_name, email, phone_number, role, is_active }) {
  try {
    const response = await fetch(`${API_URL}/user/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        full_name,
        email,
        phone_number,
        role,
        is_active
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`Failed to update user with ID ${id}:`, result);
      return { success: false, error: result };
    }

    return { success: true, data: result };

  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    return { success: false, error };
  }
}

export async function updateUserStatus(id, is_active) {
  try {
    const response = await fetch(`${API_URL}/user/status/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_active }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to update user status for ID ${id}:`, errorData);
      return { success: false, error: errorData };
    }

    const result = await response.json();
    return { success: true, data: result };

  } catch (error) {
    console.error(`Error updating user status for ID ${id}:`, error);
    return { success: false, error };
  }
}

export async function deleteUser(id) {
  try {
    const response = await fetch(`${API_URL}/user/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to delete user with ID ${id}:`, errorData);
      return { success: false, error: errorData };
    }

    return { success: true };

  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    return { success: false, error };
  }
}

export async function logoutUser() {
  try {
    const response = await fetch(`${API_URL}/user/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to logout:", errorData);
      return { success: false, error: errorData };
    }

    localStorage.removeItem("token");

    return { success: true };

  } catch (error) {
    console.error("Error during logout:", error);
    return { success: false, error };
  }
}

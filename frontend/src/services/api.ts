const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    // If response is not JSON, create a generic error
    throw new Error(`Server error: ${response.status} ${response.statusText}`);
  }

  if (!response.ok) {
    // Extract error message from server response
    let errorMessage = 'An unexpected error occurred';
    
    if (data && data.message) {
      errorMessage = data.message;
    } else if (data && data.error) {
      errorMessage = data.error;
    } else if (data && typeof data === 'string') {
      errorMessage = data;
    } else if (response.status === 401) {
      errorMessage = 'Authentication required. Please log in again.';
    } else if (response.status === 403) {
      errorMessage = 'Access denied. You do not have permission to perform this action.';
    } else if (response.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (response.status === 422) {
      errorMessage = 'Invalid data provided. Please check your input.';
    } else if (response.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    throw new Error(errorMessage);
  }

  return data;
};

// Apartment API methods
export const apartmentAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    
    const queryString = params.toString();
    const endpoint = `/apartments${queryString ? `?${queryString}` : ''}`;
    const response = await apiCall(endpoint);
    return response.data;
  },

  getAllForAdmin: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    
    const queryString = params.toString();
    const endpoint = `/apartments/admin${queryString ? `?${queryString}` : ''}`;
    const response = await apiCall(endpoint);
    return response.data;
  },

  getById: async (id: string) => {
    return apiCall(`/apartments/${id}`);
  },

  create: async (apartmentData: any) => {
    return apiCall('/apartments', {
      method: 'POST',
      body: JSON.stringify(apartmentData),
    });
  },

  update: async (id: string, apartmentData: any) => {
    return apiCall(`/apartments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apartmentData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/apartments/${id}`, {
      method: 'DELETE',
    });
  },

  getMyListings: async () => {
    const response = await apiCall('/apartments/my-listings');
    return response.data;
  },

  toggleAvailability: async (id: string) => {
    return apiCall(`/apartments/${id}/toggle-availability`, {
      method: 'PUT',
    });
  },

  getFavorites: async () => {
    const response = await apiCall('/apartments/favorites');
    return response.data;
  },

  addToFavorites: async (id: string) => {
    return apiCall(`/apartments/${id}/favorite`, {
      method: 'POST',
    });
  },

  removeFromFavorites: async (id: string) => {
    return apiCall(`/apartments/${id}/favorite`, {
      method: 'DELETE',
    });
  },

  // Developer API methods
  getDevelopers: async () => {
    return apiCall('/developers');
  },

  createDeveloper: async (developerData: any) => {
    return apiCall('/developers', {
      method: 'POST',
      body: JSON.stringify(developerData),
    });
  },

  updateDeveloper: async (id: string, developerData: any) => {
    return apiCall(`/developers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(developerData),
    });
  },

  deleteDeveloper: async (id: string) => {
    return apiCall(`/developers/${id}`, {
      method: 'DELETE',
    });
  },

  // Compound API methods
  getCompounds: async () => {
    return apiCall('/compounds');
  },

  createCompound: async (compoundData: any) => {
    return apiCall('/compounds', {
      method: 'POST',
      body: JSON.stringify(compoundData),
    });
  },

  updateCompound: async (id: string, compoundData: any) => {
    return apiCall(`/compounds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(compoundData),
    });
  },

  deleteCompound: async (id: string) => {
    return apiCall(`/compounds/${id}`, {
      method: 'DELETE',
    });
  },

  // Amenity API methods
  getAmenities: async () => {
    return apiCall('/amenities');
  },

  createAmenity: async (amenityData: any) => {
    return apiCall('/amenities', {
      method: 'POST',
      body: JSON.stringify(amenityData),
    });
  },

  updateAmenity: async (id: string, amenityData: any) => {
    return apiCall(`/amenities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(amenityData),
    });
  },

  deleteAmenity: async (id: string) => {
    return apiCall(`/amenities/${id}`, {
      method: 'DELETE',
    });
  },
};

// Auth API methods
export const authAPI = {
  register: async (userData: { firstName: string; lastName: string; email: string; password: string; phone?: string; role?: string }) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getMe: async () => {
    return apiCall('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// User management API methods (admin only)
export const userAPI = {
  getAll: async () => {
    return apiCall('/auth/users');
  },

  updateRole: async (id: string, role: string) => {
    return apiCall(`/auth/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  toggleStatus: async (id: string) => {
    return apiCall(`/auth/users/${id}/toggle-status`, {
      method: 'PUT',
    });
  },
}; 
 
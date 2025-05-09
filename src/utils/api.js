/**
 * Enhanced API utilities with improved error handling for CORS and authorization
 */

// Get API base URL from environment variables, with fallback value
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ec2-13-219-192-16.compute-1.amazonaws.com:8081';

/**
 * Makes a request to the API with authentication if a token is available
 * 
 * @param {string} endpoint - The API endpoint (without the base URL)
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise} - Fetch promise
 */
export const apiRequest = async (endpoint, options = {}) => {
  // Get stored auth token if available
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
    console.log('Using token for request:', token ? `${token.substring(0, 15)}...` : 'No token found');
  }

  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Log request details for debugging
  console.log(`Request to: ${API_BASE_URL}${endpoint}`);
  console.log('Request method:', options.method || 'GET');
  
  try {
    // Make the request with proper CORS handling
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'omit', // Changed from 'include' to 'omit'
      mode: 'cors',
    });
    
    console.log(`Response status: ${response.status}`);
    
    // Handle authorization errors (401 and 403)
    if (response.status === 401 || response.status === 403) {
      console.log(`Authentication/Authorization failed (${response.status}) - handling error`);
      
      // Get the error details
      const errorData = await response.json().catch(() => ({ 
        message: response.status === 401 ? 'Session expired' : 'You are not authorized for this action'
      }));
      
      // If token expired (401), clear token and redirect
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // Return the error response
      return new Response(JSON.stringify(errorData), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * API endpoints
 */
export const ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/auth/login',
  REGISTER_PACILLIAN: '/api/auth/register/pacillian',
  REGISTER_CAREGIVER: '/api/auth/register/caregiver',
  
  // Profile endpoints
  PROFILE: '/api/profile',
  
  // CareGiver endpoints
  ALL_CAREGIVERS: '/api/caregiver/all',
  SEARCH_CAREGIVERS: '/api/caregiver/search',
  GET_USER: (id) => `/api/user/${id}`,
};

/**
 * Helper methods for common API operations
 */
export const api = {
  // Auth
  login: (credentials) => apiRequest(ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  registerPacillian: (data) => apiRequest(ENDPOINTS.REGISTER_PACILLIAN, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  registerCareGiver: (data) => apiRequest(ENDPOINTS.REGISTER_CAREGIVER, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Profile
  getProfile: () => apiRequest(ENDPOINTS.PROFILE),
  
  updateProfile: (data) => apiRequest(ENDPOINTS.PROFILE, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteAccount: () => apiRequest(ENDPOINTS.PROFILE, {
    method: 'DELETE',
  }),
  
  // CareGivers
  getAllCareGivers: () => apiRequest(ENDPOINTS.ALL_CAREGIVERS),
  
  searchCareGivers: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${ENDPOINTS.SEARCH_CAREGIVERS}?${queryString}`);
  },
  
  getUserProfile: (id) => apiRequest(ENDPOINTS.GET_USER(id)),
};
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
      credentials: 'omit', // Keep this as 'omit' as in the original code
      mode: 'cors',
    });
    
    console.log(`Response status: ${response.status}`);
    
    // Clone the response to extract the email change information
    // We need to clone it because we'll be parsing the body later
    const responseClone = response.clone();
    
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
    
    // Special handling for profile update to check for email changes
    if (endpoint === ENDPOINTS.PROFILE && options.method === 'PUT' && response.ok) {
      try {
        const data = await responseClone.json();
        
        // Check if the response contains token update information
        if (data && data.tokenUpdated === true && data.token) {
          console.log('Email changed - updating token');
          localStorage.setItem('token', data.token);
          
          // Update user email in localStorage if available
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              if (data.profile && data.profile.email) {
                user.email = data.profile.email;
                localStorage.setItem('user', JSON.stringify(user));
                console.log('Updated user email in localStorage');
              }
            } catch (e) {
              console.error('Error updating user in localStorage:', e);
            }
          }
        }
      } catch (e) {
        console.error('Error processing profile update response:', e);
        // Continue with the original response
      }
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
  REGISTER: '/api/auth/register', // Single registration endpoint
  
  // Profile endpoints
  PROFILE: '/api/profile',
  
  // CareGiver endpoints
  ALL_CAREGIVERS: '/api/caregiver/all',
  SEARCH_CAREGIVERS: '/api/caregiver/search',
  SEARCH_CAREGIVERS_OPTIMIZED: '/api/caregiver/search-optimized',
  SEARCH_CAREGIVERS_PAGINATED: '/api/caregiver/search-paginated',
  SEARCH_CAREGIVERS_ADVANCED: '/api/caregiver/search-advanced',
  TOP_RATED_CAREGIVERS: '/api/caregiver/top-rated',
  NAME_SUGGESTIONS: '/api/caregiver/suggestions/names',
  SPECIALITY_SUGGESTIONS: '/api/caregiver/suggestions/specialities',
  GET_USER: (id) => `/api/user/${id}`,
  GET_CAREGIVER: (id) => `/api/caregiver/${id}`,
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
  
  registerPacillian: (data) => {
    // Add userType for backend to determine which subclass to use
    const registrationData = {
      ...data,
      userType: 'PACILLIAN'
    };
    
    console.log('Registering Pacillian with data:', registrationData);
    
    return apiRequest(ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  },
  
  registerCareGiver: (data) => {
    // Add userType for backend to determine which subclass to use
    const registrationData = {
      ...data,
      userType: 'CAREGIVER'
    };
    
    console.log('Registering CareGiver with data:', registrationData);
    
    return apiRequest(ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  },
  
  // Profile
  getProfile: () => apiRequest(ENDPOINTS.PROFILE),
  
  updateProfile: (data) => apiRequest(ENDPOINTS.PROFILE, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteAccount: () => apiRequest(ENDPOINTS.PROFILE, {
    method: 'DELETE',
  }),
  
  // CareGivers - Original methods
  getAllCareGivers: () => apiRequest(ENDPOINTS.ALL_CAREGIVERS),
  
  searchCareGivers: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${ENDPOINTS.SEARCH_CAREGIVERS}?${queryString}`);
  },
  
  // CareGivers - New Enhanced Search Methods
  searchCareGiversOptimized: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${ENDPOINTS.SEARCH_CAREGIVERS_OPTIMIZED}?${queryString}`);
  },
  
  searchCareGiversPaginated: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${ENDPOINTS.SEARCH_CAREGIVERS_PAGINATED}?${queryString}`);
  },
  
  searchCareGiversAdvanced: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${ENDPOINTS.SEARCH_CAREGIVERS_ADVANCED}?${queryString}`);
  },
  
  getTopRatedCareGivers: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${ENDPOINTS.TOP_RATED_CAREGIVERS}?${queryString}`);
  },
  
  // Autocomplete suggestions
  getNameSuggestions: (prefix) => {
    const queryString = new URLSearchParams({ prefix }).toString();
    return apiRequest(`${ENDPOINTS.NAME_SUGGESTIONS}?${queryString}`);
  },
  
  getSpecialitySuggestions: (query) => {
    const queryString = new URLSearchParams({ query }).toString();
    return apiRequest(`${ENDPOINTS.SPECIALITY_SUGGESTIONS}?${queryString}`);
  },
  
  // User profiles
  getUserProfile: (id) => apiRequest(ENDPOINTS.GET_USER(id)),
  
  getCareGiverProfile: (id) => apiRequest(ENDPOINTS.GET_CAREGIVER(id)),
};
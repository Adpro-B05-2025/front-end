/**
 * Enhanced API utilities with improved error handling for CORS and authorization
 * Now using environment variables for base URLs
 */

// Get base URLs from environment variables with fallbacks
export const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8081';
export const RATING_BASE_URL = process.env.NEXT_PUBLIC_RATING_API_URL || 'http://localhost:8083';
export const CONSULTATION_BASE_URL = process.env.NEXT_PUBLIC_CONSULTATION_API_URL || 'http://localhost:8084';
export const CHAT_BASE_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:8082';

/**
 * Makes a request to the API with authentication if a token is available
 * 
 * @param {string} endpoint - The API endpoint (without the base URL)
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise} - Fetch promise
 */
export const apiRequest = async (endpoint, options = {}) => {
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
    console.log('Using token for request:', token ? `${token.substring(0, 15)}...` : 'No token found');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let baseUrl;
  if (endpoint.startsWith('/api/auth') || endpoint.startsWith('/api/profile') || endpoint.startsWith('/api/user') || endpoint.startsWith('/api/caregiver')) {
    baseUrl = AUTH_BASE_URL;
  } else if (endpoint.startsWith('/api/rating')) {
    baseUrl = RATING_BASE_URL;
  } else if (endpoint.startsWith('/api/consultation-pacillian')) {
    baseUrl = CONSULTATION_BASE_URL;
  } else if (endpoint.startsWith('/api/chat')) {
    baseUrl = CHAT_BASE_URL;
  } else {
    throw new Error(`Unknown endpoint prefix: ${endpoint}`);
  }

  console.log(`Request to: ${baseUrl}${endpoint}`);
  console.log('Request method:', options.method || 'GET');

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: 'omit',
      mode: 'cors',
    });

    console.log(`Response status: ${response.status}`);

    const responseClone = response.clone();

    if (response.status === 401 || response.status === 403) {
      console.log(`Authentication/Authorization failed (${response.status}) - handling error`);

      const errorData = await response.json().catch(() => ({
        message: response.status === 401 ? 'Session expired' : 'You are not authorized for this action'
      }));

      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      return new Response(JSON.stringify(errorData), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (endpoint === ENDPOINTS.PROFILE && options.method === 'PUT' && response.ok) {
      try {
        const data = await responseClone.json();
        if (data && data.tokenUpdated === true && data.token) {
          console.log('Email changed - updating token');
          localStorage.setItem('token', data.token);

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
  GET_CAREGIVER_SUMMARY: (id) => `/api/caregiver/${id}/summary`,

  // Rating endpoints
  CREATE_RATING: '/api/rating',
  GET_RATING_DETAIL: (id) => `/api/rating/${id}`,
  UPDATE_RATING: (id) => `/api/rating/${id}`,
  DELETE_RATING: (id) => `/api/rating/${id}`,
  GET_DOCTOR_RATINGS: (doctorId) => `/api/rating/doctor/${doctorId}`,
 
  // Consultation endpoints
  CREATE_CONSULTATION: '/api/consultation-pacillian',

  // Chat endpoints (if you need them)
  // CHAT_MESSAGES: '/api/chat/messages',
  // CHAT_ROOMS: '/api/chat/rooms',
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

  // CareGivers
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

  getUserProfile: (id) => apiRequest(ENDPOINTS.GET_USER(id)),

  getCareGiverProfile: (id) => apiRequest(ENDPOINTS.GET_CAREGIVER(id)),

  // Ratings
  createRating: (data) => apiRequest(ENDPOINTS.CREATE_RATING, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getRatingDetail: (id) => apiRequest(ENDPOINTS.GET_RATING_DETAIL(id)),

  updateRating: (id, data) => apiRequest(ENDPOINTS.UPDATE_RATING(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deleteRating: (id) => apiRequest(ENDPOINTS.DELETE_RATING(id), {
    method: 'DELETE',
  }),

  getCareGiverSummary: (id) => apiRequest(`/api/caregiver/${id}/summary`),

  getDoctorRatings: (doctorId) => apiRequest(ENDPOINTS.GET_DOCTOR_RATINGS(doctorId)),

  getConsultationRatings: (consultationId) => apiRequest(`/api/rating/consultation/${consultationId}`),

  // Consultations
  createConsultation: (data) => apiRequest(ENDPOINTS.CREATE_CONSULTATION, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getConsultationDetail: (id) => apiRequest(`/api/consultation-pacillian/${id}`),

  updateConsultationStatus: (id, status) =>
    apiRequest(`/api/consultation-pacillian/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};
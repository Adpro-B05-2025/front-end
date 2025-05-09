/**
 * Enhanced API utilities with improved error handling for CORS and authorization
 */

// Base URL for auth-profile service
export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://ec2-13-219-192-16.compute-1.amazonaws.com:8081';

// Base URL for chat microservice
export const CHAT_BASE_URL =
    process.env.NEXT_PUBLIC_CHAT_API_URL ||
    'http://localhost:8082';

/**
 * Makes a request to the API with authentication if a token is available
 *
 * @param {string} endpoint - The API endpoint (path only, e.g. '/api/profile')
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @param {'auth'|'chat'} service - 'auth' uses API_BASE_URL, 'chat' uses CHAT_BASE_URL
 * @returns {Promise<Response>}
 */
export const apiRequest = async (endpoint, options = {}, service = 'auth') => {
  const base = service === 'chat' ? CHAT_BASE_URL : API_BASE_URL;
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`Request to: ${base}${endpoint}`);
  console.log('Request method:', options.method || 'GET');

  try {
    const response = await fetch(`${base}${endpoint}`, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit',  // ensure no cookies are sent
    });
    console.log(`Response status: ${response.status}`);

    // Handle 401 & 403 centrally
    if (response.status === 401 || response.status === 403) {
      console.log(`Auth failed (${response.status}) – handling`);
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message:
              response.status === 401
                  ? 'Session expired, please log in again'
                  : 'You are not authorized for this action',
        };
      }

      // On 401, clear credentials and redirect to login
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      // Return a new Response so callers still get JSON
      return new Response(JSON.stringify(errorData), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * API endpoints for auth-profile service
 */
export const ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER_PACILLIAN: '/api/auth/register/pacillian',
  REGISTER_CAREGIVER: '/api/auth/register/caregiver',
  PROFILE: '/api/profile',
  ALL_CAREGIVERS: '/api/caregiver/all',
  SEARCH_CAREGIVERS: '/api/caregiver/search',
  GET_USER: (id) => `/api/user/${id}`,
};

/**
 * Helper methods for auth-profile
 */
export const api = {
  login: (credentials) =>
      apiRequest(ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      }, 'auth'),

  registerPacillian: (data) =>
      apiRequest(ENDPOINTS.REGISTER_PACILLIAN, {
        method: 'POST',
        body: JSON.stringify(data),
      }, 'auth'),

  registerCareGiver: (data) =>
      apiRequest(ENDPOINTS.REGISTER_CAREGIVER, {
        method: 'POST',
        body: JSON.stringify(data),
      }, 'auth'),

  getProfile: () =>
      apiRequest(ENDPOINTS.PROFILE, {}, 'auth'),

  updateProfile: (data) =>
      apiRequest(ENDPOINTS.PROFILE, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, 'auth'),

  deleteAccount: () =>
      apiRequest(ENDPOINTS.PROFILE, {
        method: 'DELETE',
      }, 'auth'),

  getAllCareGivers: () =>
      apiRequest(ENDPOINTS.ALL_CAREGIVERS, {}, 'auth'),

  searchCareGivers: (params) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`${ENDPOINTS.SEARCH_CAREGIVERS}?${qs}`, {}, 'auth');
  },

  getUserProfile: (id) =>
      apiRequest(ENDPOINTS.GET_USER(id), {}, 'auth'),
};

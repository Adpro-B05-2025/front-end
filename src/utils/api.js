/**
 * Enhanced API utilities with improved error handling for CORS
 */

// Base URL untuk auth-profile
export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://ec2-13-219-192-16.compute-1.amazonaws.com:8081';

// Base URL untuk chat microservice
export const CHAT_BASE_URL =
    process.env.NEXT_PUBLIC_CHAT_API_URL ||
    'http://localhost:8082';

/**
 * Makes a request to the API with authentication if a token is available
 *
 * @param {string} endpoint - The API endpoint (path only, e.g. '/api/profile')
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @param {'auth'|'chat'} service - Pilih base URL: 'auth' pakai API_BASE_URL, 'chat' pakai CHAT_BASE_URL
 * @returns {Promise<Response>}
 */
export const apiRequest = async (
    endpoint,
    options = {},
    service = 'auth'
) => {
  // pilih base URL sesuai service
  const base =
      service === 'chat' ? CHAT_BASE_URL : API_BASE_URL;

  // ambil token dari localStorage
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  // siapkan headers
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
      credentials: 'omit',
    });
    console.log(`Response status: ${response.status}`);

    // jika 401 → clear token & redirect
    if (response.status === 401 && token) {
      console.log('Authentication failed – clearing token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * API endpoints untuk auth-profile
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

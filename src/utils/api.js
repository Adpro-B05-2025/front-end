import { API_CONFIG } from './config';

/**
 * Enhanced API utilities with improved error handling for CORS and authorization
 */

export const AUTH_BASE_URL = 'http://localhost:8081';
export const RATING_BASE_URL = 'http://localhost:8083';
export const CONSULTATION_BASE_URL = 'http://localhost:8084';

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
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  // Determine the base URL from the endpoint
  let baseUrl;  if (endpoint.startsWith('/api/auth') || endpoint.startsWith('/api/profile')) {
    baseUrl = API_CONFIG.auth.baseUrl;
  } else if (endpoint.startsWith('/api/consultations')) {
    baseUrl = API_CONFIG.consultation.baseUrl;
  } else if (endpoint.startsWith('/api/rating')) {
    baseUrl = API_CONFIG.rating.baseUrl;
  } else {
    throw new Error(`Unknown endpoint prefix: ${endpoint}`);
  }

  const fetchOptions = {
    ...options,
    headers,
    mode: 'cors',
    credentials: 'include'
  };

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, fetchOptions);
    
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const api = {
  // Auth
  login: (credentials) => apiRequest(API_CONFIG.auth.endpoints.login, {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  // Consultations
  getConsultations: () => apiRequest('/api/consultations'),
  
  getPatientConsultations: (patientId) => 
    apiRequest(`/api/consultations/patient/${patientId}`),
  
  getDoctorConsultations: (doctorId) => 
    apiRequest(`/api/consultations/doctor/${doctorId}`),
    getConsultationDetail: (id) => 
    apiRequest(`/api/consultations/${id}`),
  
  updateConsultationStatus: (id, status) =>
    apiRequest(`/api/consultations/${id}/status?status=${status}`, {
      method: 'PATCH'
    }),
  
  deleteConsultation: (id) => 
    apiRequest(`/api/consultations/${id}`, {
      method: 'DELETE'
    }),

  // ... existing code for other API methods ...
};


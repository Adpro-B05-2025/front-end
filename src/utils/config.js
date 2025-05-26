// API configurations
export const API_CONFIG = {
  auth: {
    baseUrl: 'http://localhost:8081',
    endpoints: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      profile: '/api/profile'
    }
  },  consultation: {
    baseUrl: 'http://localhost:8084',
    endpoints: {
      base: '/api/consultations',
      patient: (id) => `/api/consultations/patient/${id}`,
      doctor: (id) => `/api/consultations/doctor/${id}`,
      status: (id, status) => `/api/consultations/${id}/status?status=${status}`
    }
  },
  rating: {
    baseUrl: 'http://localhost:8083',
    endpoints: {
      base: '/api/rating'
    }
  }
};

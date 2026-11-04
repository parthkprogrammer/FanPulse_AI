import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.VITE_SUPABASE_URL &&
   !import.meta.env.VITE_SUPABASE_URL.includes('your-project-id') &&
   !import.meta.env.VITE_SUPABASE_URL.includes('placeholder-project')
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
    : 'https://placeholder-project.supabase.co/functions/v1');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach Supabase auth token if present
apiClient.interceptors.request.use(
  (config) => {
    try {
      const storedAuth = localStorage.getItem('sb-auth-token') || localStorage.getItem('fanpulse_token');
      if (storedAuth && config.headers) {
        config.headers.Authorization = `Bearer ${storedAuth}`;
      }
    } catch {
      // Fallback if storage access is restricted
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('sb-auth-token');
      localStorage.removeItem('fanpulse_token');
      const isAuthPage = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');
      if (!isAuthPage) {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?returnUrl=${returnUrl}`;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;


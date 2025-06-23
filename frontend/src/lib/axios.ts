
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore'; // Ensure this path is correct

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api', // Default to backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token; // Get token from Zustand store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Access logout and router from the store or pass router instance
      const { logout, router } = useAuthStore.getState();
      
      console.warn('Unauthorized (401) response. Logging out and redirecting to login.');
      logout(); // Clear auth state

      // Redirect to login page
      // Ensure router is available or handle redirection appropriately
      // This might be tricky if used in non-component files.
      // A common pattern is to set a flag in the store and have a component react to it.
      if (typeof window !== 'undefined') { // Ensure this runs only on client-side
        // Check if already on a public page to avoid redirect loop
        const publicPaths = ['/auth/login', '/auth/signup'];
        if (!publicPaths.includes(window.location.pathname)) {
            // If router is available in Zustand store (e.g. by setting it from _app.tsx or a layout)
            if (router) {
                 router.push('/auth/login');
            } else {
                // Fallback if router isn't in store
                window.location.href = '/auth/login';
            }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

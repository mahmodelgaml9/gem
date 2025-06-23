
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile as User } from '@/types'; // Assuming UserProfile is defined in types
import type { NextRouter } from 'next/router'; // For redirection

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // To handle initial auth check loading state
  router: NextRouter | null; // To store Next.js router instance for programmatic navigation
  setUserAndToken: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>; // For initial auth status check
  setRouter: (router: NextRouter) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true until initial check is done
      router: null,

      setRouter: (routerInstance: NextRouter) => set({ router: routerInstance }),
      
      setUserAndToken: (user: User, token: string) => {
        set({ user, token, isAuthenticated: true, isLoading: false });
        // Optionally, you can set the token in Axios default headers here if not using interceptor for all cases
        // import apiClient from '@/lib/axios';
        // apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        // Clear token from Axios default headers if it was set
        // import apiClient from '@/lib/axios';
        // delete apiClient.defaults.headers.common['Authorization'];
        
        // Redirect to login page using the stored router instance
        const router = get().router;
        if (router && typeof window !== 'undefined') { // Ensure router exists and on client
            if (router.pathname !== '/auth/login') { // Avoid redirect loop if already there
                router.push('/auth/login');
            }
        } else if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login'; // Fallback
        }
      },
      
      // This checkAuth function is a placeholder.
      // Actual implementation might involve an API call to '/api/auth/me'
      // or simply checking if a token exists and is not expired (less secure without validation).
      checkAuth: async () => {
        const token = get().token;
        if (token) {
          // Here you would typically make an API call to validate the token
          // and fetch user data if the token is valid.
          // For this example, we'll assume if a token exists, the user is authenticated.
          // In a real app, replace this with an API call:
          // try {
          //   const response = await apiClient.get('/auth/me'); // apiClient from lib/axios
          //   set({ user: response.data.user, isAuthenticated: true, isLoading: false });
          // } catch (error) {
          //   console.error("Auth check failed:", error);
          //   set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          // }
          // Simplified version for now:
           if (get().user) { // If user data already exists with token
             set({ isAuthenticated: true, isLoading: false });
           } else {
            // If only token exists but no user data (e.g. after refresh and rehydration)
            // This is where you'd typically fetch user data using the token
            // For now, if token exists, assume authenticated (basic persistence)
            // A more robust solution would be to verify token with backend here
            console.warn("Token found, but user data not present. Consider fetching user profile.");
            set({ isAuthenticated: true, isLoading: false }); // Or set isLoading true, fetch user, then set state.
           }
        } else {
          set({ isLoading: false }); // No token, not loading
        }
      },
    }),
    {
      name: 'auth-storage', // Name of the item in storage (must be unique)
      storage: createJSONStorage(() => localStorage), // Use localStorage
      // onRehydrateStorage: (state) => { // Optional: called when storage is rehydrated
      //   console.log('AuthStore rehydrated');
      //   return (hydratedState, error) => {
      //     if (error) {
      //       console.error('Error rehydrating authStore:', error);
      //     } else if (hydratedState) {
      //       // hydratedState.isLoading = true; // Set loading true on rehydration
      //     }
      //   };
      // },
    }
  )
);

// Call checkAuth once when the store is initialized (client-side)
if (typeof window !== 'undefined') {
  useAuthStore.getState().checkAuth();
}

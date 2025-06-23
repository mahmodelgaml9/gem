
'use client'; // This hook is client-side

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface UseAuthRedirectOptions {
  redirectTo?: string; // Where to redirect if not authenticated (default: /auth/login)
  redirectIfFound?: string; // Where to redirect if authenticated (e.g., for login/signup pages)
}

/**
 * Hook to handle authentication status and redirect accordingly.
 * To be used in client components or layouts.
 *
 * @param options Configuration for redirection paths.
 * @returns isLoadingAuth: boolean indicating if auth state is still loading.
 */
export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const { redirectTo = '/auth/login', redirectIfFound } = options;
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything if auth state is still loading, or if no router is available
    if (isLoadingAuth || !router) {
      return;
    }

    if (redirectIfFound && isAuthenticated) {
      // If user is authenticated and on a page like login/signup, redirect them.
      // Make sure we are not already on the target redirectIfFound page to avoid loop.
      if (pathname !== redirectIfFound) {
        router.push(redirectIfFound);
      }
    } else if (!redirectIfFound && !isAuthenticated) {
      // If user is not authenticated and not on a page that needs auth, redirect them to login.
      // Make sure we are not already on the target redirectTo page to avoid loop.
      if (pathname !== redirectTo) {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isLoadingAuth, router, pathname, redirectTo, redirectIfFound]);

  return { isLoadingAuth };
}

// Usage Example in a protected page/layout:
// import { useAuthRedirect } from '@/hooks/useAuthRedirect';
// import Loader from '@/components/ui/Loader';
//
// export default function ProtectedPage() {
//   const { isLoadingAuth } = useAuthRedirect(); // Redirects to /auth/login if not authenticated
//   const { user } = useAuthStore();
//
//   if (isLoadingAuth || !user) {
//     return <Loader fullScreen message="Loading user data..." />;
//   }
//
//   return <div>Welcome, {user.name}! This is a protected page.</div>;
// }

// Usage Example in login/signup page:
// import { useAuthRedirect } from '@/hooks/useAuthRedirect';
//
// export default function LoginPage() {
//   useAuthRedirect({ redirectIfFound: '/dashboard' }); // Redirects to /dashboard if already authenticated
//
//   // ... rest of the login form logic
// }

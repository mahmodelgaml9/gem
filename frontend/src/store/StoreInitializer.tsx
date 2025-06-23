
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Use from next/navigation for App Router
import { useAuthStore } from './authStore';

// This component is a bit of a workaround to get the router instance into the Zustand store
// when using the App Router, as the store is initialized outside React's component tree.
export function StoreInitializer() {
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      useAuthStore.getState().setRouter(router as any); // Cast as any if NextRouter type mismatch
      // Trigger initial auth check if not done automatically or if needed after router is set
      // useAuthStore.getState().checkAuth(); 
      initialized.current = true;
    }
  }, [router]);

  return null; // This component doesn't render anything
}

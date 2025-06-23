
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import Loader from '@/components/ui/Loader';
import {
  LayoutDashboard,
  BriefcaseBusiness,
  BotMessageSquare,
  LibraryBig,
  LogOut,
  Menu,
  X,
  UserCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Businesses', href: '/dashboard/my-businesses', icon: BriefcaseBusiness },
  { name: 'Generate Content', href: '/dashboard/generate', icon: BotMessageSquare },
  { name: 'Content Library', href: '/dashboard/content-library', icon: LibraryBig },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authIsLoading, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authIsLoading, router]);

  if (authIsLoading || (!isAuthenticated && pathname !== '/auth/login')) {
    // Show a full-screen loader while checking auth or if not authenticated yet and not on login page
    return <Loader fullScreen message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    // This case should ideally be handled by the redirect, but as a fallback:
    return null; // Or a message indicating redirection
  }
  
  const handleLogout = () => {
    logout();
    router.push('/auth/login'); // Ensure redirection after logout
  };

  return (
    <div className="flex h-screen bg-neutral-light overflow-hidden">
      {/* Sidebar for larger screens */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-30 w-64 bg-neutral-darkest text-white p-4 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <BotMessageSquare size={32} className="text-primary-light" />
            <span className="text-xl font-semibold">AI Partner</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-neutral-light hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-grow space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)} // Close sidebar on nav item click on mobile
              className={clsx(
                'flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  ? 'bg-primary-DEFAULT text-white shadow-md'
                  : 'text-neutral-light hover:bg-neutral-dark hover:text-white'
              )}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-neutral-dark pt-4">
            <div className="flex items-center space-x-3 mb-4 p-2 rounded-md hover:bg-neutral-dark cursor-pointer">
                <UserCircle size={24} className="text-neutral-light"/>
                <div>
                    <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                    <p className="text-xs text-neutral-light">{user?.email}</p>
                </div>
            </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-neutral-light hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Overlay for mobile sidebar */}
       {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}


      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm md:hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
                <BotMessageSquare size={28} className="text-primary-DEFAULT" />
                <span className="text-lg font-semibold text-neutral-darkest">AI Partner</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-neutral-darkest hover:text-primary-DEFAULT"
              aria-label="Open sidebar"
            >
              <Menu size={28} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </div>
    </div>
  );
}

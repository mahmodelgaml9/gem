
'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ArrowRight, BotMessageSquare, BriefcaseBusiness, LayoutDashboard } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-8">
      <header className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-darkest">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="mt-2 text-lg text-neutral-DEFAULT">
          Ready to supercharge your business strategy and content?
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center text-primary-DEFAULT mb-4">
            <BriefcaseBusiness size={32} className="mr-3" />
            <h2 className="text-xl font-semibold text-neutral-darkest">My Businesses</h2>
          </div>
          <p className="text-neutral-DEFAULT mb-4 text-sm">
            Manage your business profiles, analyze their performance, and lay the groundwork for AI-powered strategies.
          </p>
          <Link href="/dashboard/my-businesses">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight size={16}/>}>
              Manage Businesses
            </Button>
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center text-accent-DEFAULT mb-4">
            <BotMessageSquare size={32} className="mr-3" />
            <h2 className="text-xl font-semibold text-neutral-darkest">Generate Content</h2>
          </div>
          <p className="text-neutral-DEFAULT mb-4 text-sm">
            Create high-quality marketing content, from blog posts to social media updates, tailored to your strategy.
          </p>
          <Link href="/dashboard/generate">
            <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={16}/>}>
              Start Generating
            </Button>
          </Link>
        </div>
        
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-1">
           <div className="flex items-center text-secondary-DEFAULT mb-4">
             <LayoutDashboard size={32} className="mr-3" /> {/* Placeholder Icon */}
            <h2 className="text-xl font-semibold text-neutral-darkest">Quick Stats</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
                <span className="text-neutral-DEFAULT">Businesses Managed:</span>
                <span className="font-semibold text-neutral-darkest">0</span> {/* TODO: Fetch actual data */}
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-neutral-DEFAULT">Content Generated:</span>
                <span className="font-semibold text-neutral-darkest">0</span> {/* TODO: Fetch actual data */}
            </div>
             <div className="flex justify-between text-sm">
                <span className="text-neutral-DEFAULT">Active Plan:</span>
                <span className="font-semibold text-primary-DEFAULT">{user?.subscriptionPlan || 'FREE'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Placeholder for recent activity or tips */}
      <section className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-neutral-darkest mb-3">Next Steps</h2>
        <ul className="list-disc list-inside text-neutral-DEFAULT space-y-1 text-sm">
            <li>If you haven't already, <Link href="/dashboard/my-businesses" className="text-primary-DEFAULT hover:underline">add your first business profile</Link>.</li>
            <li>Explore the <Link href="/dashboard/generate" className="text-primary-DEFAULT hover:underline">content generation tools</Link> to see the AI in action.</li>
            <li>Consider upgrading your plan for more features and higher limits.</li>
        </ul>
      </section>
    </div>
  );
};

export default DashboardPage;

// Helper component for dashboard cards (optional)
// const DashboardCard = ({ title, description, link, linkText, icon }) => ( ... );

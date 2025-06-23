
import React from 'react';
import Link from 'next/link';
import { BotMessageSquare } from 'lucide-react'; // Example Icon

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-DEFAULT via-primary-light to-secondary-light px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <Link href="/" className="inline-block mx-auto">
            <BotMessageSquare className="h-12 w-auto text-white mx-auto" />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            AI Strategic Partner
          </h2>
        </div>
        <div className="bg-white p-8 shadow-xl rounded-lg">
          {children}
        </div>
         <p className="mt-8 text-center text-sm text-neutral-lightest">
            <Link href="/" className="font-medium text-white hover:text-primary-light/80">
              Back to Homepage
            </Link>
          </p>
      </div>
    </div>
  );
}


import type { Metadata } from 'next'; // Corrected import for Metadata type
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreInitializer } from '@/store/StoreInitializer'; // To initialize Zustand store with router

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Strategic Partner Platform',
  description: 'Your AI partner for business strategy and content creation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-neutral-lightest">
      <body className={`${inter.className} h-full antialiased`}>
        <StoreInitializer /> {/* Component to initialize Zustand store with router context */}
        {children}
      </body>
    </html>
  );
}


import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        primary: {
          light: '#6D9CFF', // A lighter shade of blue
          DEFAULT: '#3B82F6', // Blue-500
          dark: '#2563EB', // A darker shade of blue
        },
        secondary: {
          light: '#FDBA74', // Orange-300
          DEFAULT: '#F97316', // Orange-500
          dark: '#EA580C', // Orange-600
        },
        accent: {
          light: '#A7F3D0', // Green-200
          DEFAULT: '#34D399', // Green-400
          dark: '#059669', // Green-600
        },
        neutral: {
          lightest: '#F9FAFB', // Gray-50
          light: '#F3F4F6', // Gray-100
          DEFAULT: '#6B7280', // Gray-500
          dark: '#374151', // Gray-700
          darkest: '#111827', // Gray-900
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
export default config;


'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/axios';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, Lock } from 'lucide-react';
import type { UserLoginData, UserLoginResponse } from '@/types'; // Define these types


const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserLoginData>();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const setUserAndToken = useAuthStore((state) => state.setUserAndToken);
  const router = useRouter();

  const onSubmit: SubmitHandler<UserLoginData> = async (data) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const response = await apiClient.post<UserLoginResponse>('/auth/login', data);
      setUserAndToken(response.data.user, response.data.token);
      router.push('/dashboard'); // Redirect to dashboard after successful login
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        <h3 className="text-xl font-semibold text-neutral-darkest">Sign in to your account</h3>
        <p className="mt-1 text-sm text-neutral-DEFAULT">
          Or{' '}
          <Link href="/auth/signup" className="font-medium text-primary-DEFAULT hover:text-primary-dark">
            create a new account
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {serverError && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-red-700">{serverError}</p>
              </div>
            </div>
          </div>
        )}
        <Input
          id="email"
          type="email"
          label="Email address"
          autoComplete="email"
          placeholder="you@example.com"
          icon={<Mail size={16} />}
          registration={register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          error={errors.email?.message}
        />
        <Input
          id="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          icon={<Lock size={16} />}
          registration={register('password', {
            required: 'Password is required',
          })}
          error={errors.password?.message}
        />
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <a href="#" className="font-medium text-primary-DEFAULT hover:text-primary-dark">
              Forgot your password?
            </a>
          </div>
        </div>
        <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </>
  );
};

export default LoginPage;

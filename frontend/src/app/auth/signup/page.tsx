
'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/axios';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import type { UserSignupData, UserSignupResponse } from '@/types'; // Define these types


const SignupPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserSignupData>();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const setUserAndToken = useAuthStore((state) => state.setUserAndToken);
  const router = useRouter();

  const password = watch('password'); // For password confirmation

  const onSubmit: SubmitHandler<UserSignupData> = async (data) => {
    setIsLoading(true);
    setServerError(null);
    const { confirmPassword, ...signupData } = data; // Don't send confirmPassword to backend
    try {
      const response = await apiClient.post<UserSignupResponse>('/auth/signup', signupData);
      setUserAndToken(response.data.user, response.data.token);
      router.push('/dashboard'); // Redirect to dashboard after successful signup
    } catch (error: any) {
      console.error('Signup failed:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError('Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        <h3 className="text-xl font-semibold text-neutral-darkest">Create your account</h3>
        <p className="mt-1 text-sm text-neutral-DEFAULT">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-primary-DEFAULT hover:text-primary-dark">
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {serverError && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{serverError}</p>
          </div>
        )}
        <Input
          id="name"
          type="text"
          label="Full Name"
          autoComplete="name"
          placeholder="Your Name"
          icon={<UserIcon size={16} />}
          registration={register('name', {
            required: 'Full name is required',
          })}
          error={errors.name?.message}
        />
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
          autoComplete="new-password"
          placeholder="•••••••• (min. 6 characters)"
          icon={<Lock size={16} />}
          registration={register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
          error={errors.password?.message}
        />
        <Input
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          autoComplete="new-password"
          placeholder="••••••••"
          icon={<Lock size={16} />}
          registration={register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === password || 'Passwords do not match',
          })}
          error={errors.confirmPassword?.message}
        />
        <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </>
  );
};

export default SignupPage;


import prisma from '../services/prisma.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole, SubscriptionPlan } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret'; // Fallback only for dev if .env not loaded, ensure it's set!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

if (process.env.JWT_SECRET === 'your-default-secret' && process.env.NODE_ENV === 'production') {
    console.warn('WARNING: JWT_SECRET is using a default value in production. This is insecure!');
}


export interface SignupData {
  email: string;
  password?: string; // Optional if using OAuth in future
  name?: string;
  role?: UserRole;
  plan?: SubscriptionPlan;
}

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  plan: SubscriptionPlan;
  // You can add more non-sensitive frequently accessed user data here
}

// Full user type without password for responses
export type UserProfile = Omit<User, 'password' | 'resetPasswordToken' | 'resetPasswordExpires'>;


export async function signup(data: SignupData): Promise<{ user: UserProfile, token: string }> {
  const { email, password, name } = data;

  if (!password) {
    throw new Error("Password is required for signup.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: data.role || UserRole.USER,
      subscriptionPlan: data.plan || SubscriptionPlan.FREE,
    },
  });

  const tokenPayload: AuthUserPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    plan: user.subscriptionPlan,
  };
  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  
  const { password: _, resetPasswordToken: __, resetPasswordExpires: ___, ...userProfile } = user;
  return { user: userProfile, token };
}

export async function login(email: string, pass: string): Promise<{ user: UserProfile, token: string }> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(pass, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const tokenPayload: AuthUserPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    plan: user.subscriptionPlan,
  };
  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  const { password: _, resetPasswordToken: __, resetPasswordExpires: ___, ...userProfile } = user;
  return { user: userProfile, token };
}

export async function findUserById(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { // Explicitly select fields to exclude password
            id: true,
            email: true,
            name: true,
            role: true,
            subscriptionPlan: true,
            createdAt: true,
            updatedAt: true,
            apiUsageCount: true,
            // Exclude password, resetPasswordToken, resetPasswordExpires
        }
    });
    return user as UserProfile | null; // Cast because select makes password optional but it's not on UserProfile
}

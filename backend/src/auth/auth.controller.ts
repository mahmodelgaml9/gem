
import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { UserRole, SubscriptionPlan } from '@prisma/client'; 
import { AuthenticatedRequest } from './auth.middleware'; 

export async function signup(req: Request, res: Response): Promise<void> {
  const { email, password, name, role, plan } = req.body;

  // Basic validation
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required.' });
    return;
  }
  // Add more robust validation here (e.g., email format, password strength)

  try {
    const { user, token } = await authService.signup({
      email,
      password,
      name,
      role: role as UserRole, // Ensure role and plan are validated or defaulted in service
      plan: plan as SubscriptionPlan,
    });
    // Omit password from user object before sending response
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ message: 'User registered successfully', user: userWithoutPassword, token });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('unique constraint failed')) { // Example for Prisma unique error
        res.status(409).json({ message: 'User with this email already exists.' });
      } else {
        res.status(500).json({ message: 'Error registering user', error: error.message });
      }
    } else {
      res.status(500).json({ message: 'An unknown error occurred during registration.' });
    }
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required.' });
    return;
  }

  try {
    const { user, token } = await authService.login(email, password);
    // Omit password from user object
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ message: 'Login successful', user: userWithoutPassword, token });
  } catch (error) {
     if (error instanceof Error) {
        if (error.message === 'Invalid credentials' || error.message === 'User not found') {
            res.status(401).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Error logging in', error: error.message });
        }
    } else {
        res.status(500).json({ message: 'An unknown error occurred during login.' });
    }
  }
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    // req.user is populated by authenticateToken middleware
    if (!req.user) {
        // This case should ideally be caught by authenticateToken, but as a safeguard:
        res.status(401).json({ message: "Not authenticated or user data not found." });
        return;
    }
    // The user object on req.user should already be the full user profile (UserProfile)
    // fetched by the middleware and defined in the AuthenticatedRequest interface from auth.middleware.ts
    res.status(200).json({ user: req.user });
}

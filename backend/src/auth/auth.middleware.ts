
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUserPayload, findUserById, UserProfile } from './auth.service'; // Assuming UserProfile is exported

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
  user?: UserProfile; // Attach full user profile (without password)
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    res.status(401).json({ message: 'No token provided, authorization denied.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    
    // Fetch the full user object from the database to ensure it's current and valid
    // This also allows attaching more user details to req.user if needed
    const userProfile = await findUserById(decoded.userId);

    if (!userProfile) {
        res.status(401).json({ message: 'User not found or token invalid.' });
        return;
    }
    
    // Check if user's role or plan from token matches DB, if critical for some operations
    // For general auth, attaching the DB version of user is good practice
    if (userProfile.role !== decoded.role || userProfile.subscriptionPlan !== decoded.plan) {
        console.warn(`User ${decoded.userId} has mismatched token data vs DB data. Using DB data.`);
        // Potentially issue a new token or handle as a security concern
    }

    req.user = userProfile; // Attach the full user profile (without password) to the request object
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    if (err instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: 'Token expired.' });
    } else if (err instanceof jwt.JsonWebTokenError) {
        res.status(403).json({ message: 'Token is not valid.' });
    } else {
        res.status(403).json({ message: 'Failed to authenticate token.' });
    }
  }
}

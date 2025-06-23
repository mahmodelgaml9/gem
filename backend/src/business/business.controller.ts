
import { Response, NextFunction } from 'express';
import * as businessService from './business.service';
import { AuthenticatedRequest } from '../auth/auth.middleware'; // Import AuthenticatedRequest

export async function createBusinessHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      // This should be caught by authenticateToken, but as a safeguard
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }
    const businessData = req.body; // { name, industry, websiteUrl, description }
    // The user object (UserProfile) from authenticateToken is passed to the service
    const business = await businessService.createBusiness(req.user, businessData);
    res.status(201).json(business);
  } catch (error) {
    next(error); // Pass error to global error handler
  }
}

export async function getUserBusinessesHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }
    const businesses = await businessService.getUserBusinesses(req.user.id);
    res.status(200).json(businesses);
  } catch (error) {
    next(error);
  }
}

export async function getBusinessByIdHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }
    const businessId = req.params.id;
    const business = await businessService.getBusinessById(businessId, req.user.id);
    if (!business) {
      res.status(404).json({ message: 'Business not found or access denied.' });
      return;
    }
    res.status(200).json(business);
  } catch (error) {
    next(error);
  }
}

export async function updateBusinessHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }
    const businessId = req.params.id;
    const updateData = req.body;
    const updatedBusiness = await businessService.updateBusiness(businessId, req.user.id, updateData);
    if (!updatedBusiness) {
      res.status(404).json({ message: 'Business not found or access denied for update.' });
      return;
    }
    res.status(200).json(updatedBusiness);
  } catch (error) {
    next(error);
  }
}

export async function deleteBusinessHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }
    const businessId = req.params.id;
    const deletedBusiness = await businessService.deleteBusiness(businessId, req.user.id);
     if (!deletedBusiness) {
      res.status(404).json({ message: 'Business not found or access denied for deletion.' });
      return;
    }
    res.status(200).json({ message: 'Business deleted successfully', business: deletedBusiness });
  } catch (error) {
    next(error);
  }
}

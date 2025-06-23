
import prisma from '../services/prisma.service';
import { Business, SubscriptionPlan } from '@prisma/client';
import { UserProfile } from '../auth/auth.service'; // For type of authenticated user

interface BusinessCreationData {
  name: string;
  industry?: string;
  websiteUrl?: string;
  description?: string;
}

interface BusinessUpdateData {
  name?: string;
  industry?: string;
  websiteUrl?: string;
  description?: string;
}

// Example plan-based limits
const BUSINESS_LIMITS = {
  [SubscriptionPlan.FREE]: 1,
  [SubscriptionPlan.BASIC]: 5,
  [SubscriptionPlan.PRO]: 20,
  [SubscriptionPlan.ENTERPRISE]: Infinity, // Or a very high number
};

export async function createBusiness(user: UserProfile, data: BusinessCreationData): Promise<Business> {
  // Plan-based logic: Check if user can create more businesses
  const currentBusinessCount = await prisma.business.count({
    where: { userId: user.id },
  });

  const limit = BUSINESS_LIMITS[user.plan] ?? BUSINESS_LIMITS[SubscriptionPlan.FREE];

  if (currentBusinessCount >= limit) {
    throw new Error(`User on ${user.plan} plan has reached the limit of ${limit} businesses.`);
  }

  if (!data.name) {
      throw new Error("Business name is required.");
  }

  const newBusiness = await prisma.business.create({
    data: {
      ...data,
      userId: user.id,
    },
  });
  return newBusiness;
}

export async function getUserBusinesses(userId: string): Promise<Business[]> {
  const businesses = await prisma.business.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return businesses;
}

export async function getBusinessById(businessId: string, userId: string): Promise<Business | null> {
  const business = await prisma.business.findFirst({
    where: { id: businessId, userId }, // Ensures user owns the business
  });
  return business;
}

export async function updateBusiness(
  businessId: string,
  userId: string,
  data: BusinessUpdateData
): Promise<Business | null> {
  // First, verify the business exists and belongs to the user
  const existingBusiness = await prisma.business.findFirst({
    where: { id: businessId, userId },
  });

  if (!existingBusiness) {
    return null; // Or throw an error: throw new Error('Business not found or access denied');
  }

  const updatedBusiness = await prisma.business.update({
    where: { id: businessId }, // No need for userId here as we've already checked ownership
    data,
  });
  return updatedBusiness;
}

export async function deleteBusiness(businessId: string, userId: string): Promise<Business | null> {
  // Verify ownership before deleting
  const existingBusiness = await prisma.business.findFirst({
    where: { id: businessId, userId },
  });

  if (!existingBusiness) {
    return null; // Or throw new Error('Business not found or access denied');
  }

  // Prisma's onDelete: Cascade on relations should handle related data
  // (MarketAnalysis, AudiencePersona, MarketingPlan, Content)
  const deletedBusiness = await prisma.business.delete({
    where: { id: businessId },
  });
  return deletedBusiness;
}

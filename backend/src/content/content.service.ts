
import prisma from '../services/prisma.service';
import { Content, ContentType } from '@prisma/client';

interface ContentCreationData {
  businessId: string;
  contentType: ContentType;
  title?: string;
  body: string;
  promptUsed?: string;
  aiModelUsed?: string;
  marketingPlanId?: string;
  status?: string;
}

export async function saveContent(userId: string, data: ContentCreationData): Promise<Content> {
  // Verify that the businessId belongs to the userId
  const business = await prisma.business.findFirst({
    where: {
      id: data.businessId,
      userId: userId,
    },
  });

  if (!business) {
    throw new Error('Business not found or user does not have access to this business.');
  }
  
  if (!data.body || data.body.trim() === "") {
    throw new Error('Content body cannot be empty.');
  }
  if (!Object.values(ContentType).includes(data.contentType)) {
    throw new Error(`Invalid content type: ${data.contentType}`);
  }

  const newContent = await prisma.content.create({
    data: {
      businessId: data.businessId,
      contentType: data.contentType,
      title: data.title,
      body: data.body,
      promptUsed: data.promptUsed,
      aiModelUsed: data.aiModelUsed,
      marketingPlanId: data.marketingPlanId,
      status: data.status || 'DRAFT',
    },
  });

  return newContent;
}

// TODO: Add functions for listing, retrieving, updating, deleting content with ownership checks.
// export async function listContentForBusiness(businessId: string, userId: string): Promise<Content[]> { ... }
// export async function getContentById(contentId: string, userId: string): Promise<Content | null> { ... }

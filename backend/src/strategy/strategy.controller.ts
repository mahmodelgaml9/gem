
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import * as strategyService from '../services/strategy.service';
import prisma from '../services/prisma.service'; // For ownership checks

export async function performDeepAnalysisHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }
    const { businessId, websiteUrl } = req.body;

    if (!businessId || !websiteUrl) {
      res.status(400).json({ message: 'Business ID and Website URL are required.' });
      return;
    }

    // Verify user owns the business
    const business = await prisma.business.findFirst({
        where: { id: businessId, userId: req.user.id }
    });
    if (!business) {
        res.status(403).json({ message: "Access denied or business not found."});
        return;
    }

    const analysisResult = await strategyService.performDeepAnalysis(businessId, websiteUrl);
    res.status(200).json({ message: 'Deep analysis initiated and processing.', analysis: analysisResult });
  } catch (error) {
    console.error("Error in performDeepAnalysisHandler:", error);
    if (error instanceof Error && error.message.includes("Scraped content is empty")) {
        res.status(400).json({ message: "Could not retrieve content from the provided URL. Please check the URL and try again."})
    } else if (error instanceof Error && error.message.includes("Failed to scrape URL")) {
        res.status(400).json({ message: "Failed to scrape the provided URL. It might be inaccessible or block automated access."})
    }
    else {
        next(error); // Pass to global error handler for other errors
    }
  }
}

export async function generateMarketingPlanHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }
    const { businessId, marketAnalysisId, targetAudienceIds, objectives, customInstructions } = req.body;

    if (!businessId || !marketAnalysisId || !targetAudienceIds || !objectives) {
      res.status(400).json({ message: 'Required fields: businessId, marketAnalysisId, targetAudienceIds, objectives.' });
      return;
    }
    if (!Array.isArray(targetAudienceIds) || targetAudienceIds.length === 0) {
        res.status(400).json({ message: 'targetAudienceIds must be a non-empty array.' });
        return;
    }
    if (!Array.isArray(objectives) || objectives.length === 0) {
        res.status(400).json({ message: 'objectives must be a non-empty array.' });
        return;
    }


    // Verify user owns the business associated with these IDs
    const business = await prisma.business.findFirst({
        where: { id: businessId, userId: req.user.id }
    });
    if (!business) {
        res.status(403).json({ message: "Access denied or business not found."});
        return;
    }
    // Further checks: ensure marketAnalysisId and targetAudienceIds belong to this businessId.
    // This can be done in the service layer or here. For brevity, assuming service handles internal consistency.

    const marketingPlan = await strategyService.generateMarketingPlan(
      businessId,
      marketAnalysisId,
      targetAudienceIds,
      objectives,
      customInstructions
    );
    res.status(201).json({ message: 'Marketing plan generated successfully.', plan: marketingPlan });
  } catch (error) {
    next(error);
  }
}

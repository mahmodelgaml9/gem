
// Re-exporting Prisma types for frontend usage where appropriate.
// Avoid exposing sensitive fields like password hashes.

// From backend/prisma/schema.prisma (adjust fields as needed for frontend context)
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum AnalysisStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ContentType {
  BLOG_POST = 'BLOG_POST',
  SOCIAL_MEDIA_UPDATE = 'SOCIAL_MEDIA_UPDATE',
  EMAIL_COPY = 'EMAIL_COPY',
  AD_COPY = 'AD_COPY',
  WEBSITE_COPY = 'WEBSITE_COPY',
  PRODUCT_DESCRIPTION = 'PRODUCT_DESCRIPTION',
  VIDEO_SCRIPT = 'VIDEO_SCRIPT',
  SEO_META = 'SEO_META',
  ARTICLE = 'ARTICLE',
  NEWSLETTER = 'NEWSLETTER',
  CASE_STUDY = 'CASE_STUDY',
  WHITE_PAPER = 'WHITE_PAPER',
  LANDING_PAGE_COPY = 'LANDING_PAGE_COPY',
  OTHER = 'OTHER',
}

export enum CampaignObjective {
  BRAND_AWARENESS = 'BRAND_AWARENESS',
  LEAD_GENERATION = 'LEAD_GENERATION',
  SALES_CONVERSION = 'SALES_CONVERSION',
  CUSTOMER_ENGAGEMENT = 'CUSTOMER_ENGAGEMENT',
  WEBSITE_TRAFFIC = 'WEBSITE_TRAFFIC',
  PRODUCT_LAUNCH = 'PRODUCT_LAUNCH',
  MARKET_EDUCATION = 'MARKET_EDUCATION',
  COMMUNITY_BUILDING = 'COMMUNITY_BUILDING',
}


// User profile type for frontend (omitting sensitive fields)
export interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  createdAt: string; // Dates are typically strings after JSON serialization
  updatedAt: string;
  apiUsageCount?: number;
}

// Auth types
export interface UserLoginData {
  email: string;
  password?: string; // Optional if using OAuth in future
}
export interface UserSignupData extends UserLoginData {
  name?: string;
  confirmPassword?: string; // For frontend validation only
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
  message?: string;
}
export type UserLoginResponse = AuthResponse;
export type UserSignupResponse = AuthResponse;


// Business type for frontend
export interface Business {
  id: string;
  name: string;
  industry?: string | null;
  websiteUrl?: string | null;
  description?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  // Potentially add counts or summaries of related items if needed by UI
  // marketAnalysesCount?: number;
}

// MarketAnalysis type for frontend (simplified)
export interface MarketAnalysis {
  id: string;
  businessId: string;
  swot?: any; // Consider defining a stricter type for SWOT: { strengths: string[], ... }
  competitors?: any[]; // Define stricter type: { name: string, website: string, ... }[]
  marketTrends?: string | null;
  status: AnalysisStatus;
  analysisDate: string;
  sourceUrl?: string | null;
  errorMessage?: string | null;
}

// AudiencePersona type for frontend
export interface AudiencePersona {
  id: string;
  businessId: string;
  name: string;
  ageRange?: string | null;
  gender?: string | null;
  location?: string | null;
  occupation?: string | null;
  incomeLevel?: string | null;
  goals: string[];
  painPoints: string[];
  motivations: string[];
  preferredChannels: string[];
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

// MarketingPlan type for frontend (simplified)
export interface MarketingPlan {
  id: string;
  businessId: string;
  marketAnalysisId?: string | null;
  title: string;
  objectives: CampaignObjective[];
  targetAudienceIds: string[];
  keyMessages: string[];
  strategies?: any; // Define stricter type: { strategyName: string, ... }[]
  channels: string[];
  budget?: number | null;
  timeline?: string | null;
  kpis: string[];
  createdAt: string;
  updatedAt: string;
}

// GeneratedContent type for frontend
export interface GeneratedContent {
  id: string;
  businessId: string;
  marketingPlanId?: string | null;
  contentType: ContentType;
  title?: string | null;
  body: string;
  promptUsed?: string | null;
  aiModelUsed?: string | null;
  status: string; // e.g., "DRAFT", "PUBLISHED"
  createdAt: string;
  updatedAt: string;
}

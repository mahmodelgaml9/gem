
import { generateTextOpenAI, generateTextStreamOpenAI } from './openai.service';
import prisma from './prisma.service';
import { ContentType, MarketingPlan, AudiencePersona, Business } from '@prisma/client';
import OpenAI from 'openai';

interface ContentGenerationParams {
  businessId: string;
  contentType: ContentType;
  tone?: string;
  style?: string;
  keywords?: string[];
  targetAudienceId?: string; // ID of a specific persona
  marketingPlanId?: string; // ID of a marketing plan to base content on
  customPrompt?: string; // Allow user to provide a part of the prompt
  length?: 'short' | 'medium' | 'long';
  model?: 'gpt-4o-mini' | 'gpt-4o'; // Intelligent selection
}

/**
 * Builds the final prompt for content generation.
 * @param params Parameters for content generation.
 * @param business Business data.
 * @param marketingPlan Optional marketing plan data.
 * @param audiencePersona Optional audience persona data.
 * @returns The constructed prompt string and chosen model.
 */
async function buildFinalPrompt(
  params: ContentGenerationParams,
  business: Business,
  marketingPlan?: MarketingPlan | null,
  audiencePersona?: AudiencePersona | null
): Promise<{ prompt: string; model: 'gpt-4o-mini' | 'gpt-4o' }> {
  let prompt = `Generate a piece of content for the business "${business.name}".\n`;
  prompt += `Business Description: ${business.description || business.industry || 'A an innovative company'}.\n`;
  prompt += `Content Type: ${params.contentType.replace(/_/g, ' ').toLowerCase()}.\n`;

  if (params.tone) prompt += `Tone: ${params.tone}.\n`;
  if (params.style) prompt += `Style: ${params.style}.\n`;
  if (params.keywords && params.keywords.length > 0) prompt += `Keywords to include: ${params.keywords.join(', ')}.\n`;
  if (params.length) prompt += `Desired Length: ${params.length}.\n`;

  if (audiencePersona) {
    prompt += `\nTarget Audience Persona:
    Name: ${audiencePersona.name}
    Description: ${audiencePersona.description || `Goals: ${audiencePersona.goals.join(', ')}, Pain Points: ${audiencePersona.painPoints.join(', ')}`}
    Preferred Channels: ${audiencePersona.preferredChannels.join(', ')}\n`;
  } else if (params.targetAudienceId) {
    prompt += `Target Audience: General audience for this type of business, or as implied by other parameters.\n`;
  }

  if (marketingPlan) {
    prompt += `\nThis content should align with the marketing plan titled "${marketingPlan.title}".
    Objectives: ${marketingPlan.objectives.join(', ')}
    Key Messages: ${marketingPlan.keyMessages.join(', ')}\n`;
  }

  if (params.customPrompt) {
    prompt += `\nUser's Specific Instructions/Prompt: "${params.customPrompt}"\n`;
  }

  prompt += `\nPlease generate the ${params.contentType.replace(/_/g, ' ').toLowerCase()} now.`;
  
  // Intelligent model selection (example logic)
  let chosenModel: 'gpt-4o-mini' | 'gpt-4o' = params.model || 'gpt-4o-mini';
  if (params.length === 'long' || params.contentType === 'WHITE_PAPER' || params.contentType === 'CASE_STUDY' || (params.customPrompt && params.customPrompt.length > 200)) {
    chosenModel = 'gpt-4o'; // Use more powerful model for complex or long content
  }
  if (params.style === 'highly creative' || params.style === 'technical deep-dive') {
     chosenModel = 'gpt-4o';
  }


  return { prompt, model: chosenModel };
}

/**
 * Generates content based on various parameters.
 * @param params Parameters for content generation.
 * @returns The generated content string.
 */
export async function generateContent(params: ContentGenerationParams): Promise<{text: string | null, modelUsed: string}> {
  const business = await prisma.business.findUnique({ where: { id: params.businessId } });
  if (!business) throw new Error('Business not found.');

  const marketingPlan = params.marketingPlanId
    ? await prisma.marketingPlan.findUnique({ where: { id: params.marketingPlanId } })
    : null;

  const audiencePersona = params.targetAudienceId
    ? await prisma.audiencePersona.findUnique({ where: { id: params.targetAudienceId } })
    : null;

  const { prompt, model } = await buildFinalPrompt(params, business, marketingPlan, audiencePersona);
  
  console.log(`Generating content with ${model}. Prompt: ${prompt.substring(0,200)}...`);

  const generatedText = await generateTextOpenAI(
    prompt,
    model,
    `You are a professional ${params.contentType.replace(/_/g, ' ').toLowerCase()} writer for businesses.`, // System message
    0.7 // Default temperature
  );

  return { text: generatedText, modelUsed: model };
}

/**
 * Generates content as a stream.
 * @param params Parameters for content generation.
 * @returns An async iterable stream of content chunks.
 */
export async function generateContentStream(
  params: ContentGenerationParams
): Promise<{stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>, modelUsed: string, finalPrompt: string}> {
  const business = await prisma.business.findUnique({ where: { id: params.businessId } });
  if (!business) throw new Error('Business not found.');

  const marketingPlan = params.marketingPlanId
    ? await prisma.marketingPlan.findUnique({ where: { id: params.marketingPlanId } })
    : null;

  const audiencePersona = params.targetAudienceId
    ? await prisma.audiencePersona.findUnique({ where: { id: params.targetAudienceId } })
    : null;

  const { prompt: finalPrompt, model } = await buildFinalPrompt(params, business, marketingPlan, audiencePersona);
  console.log(`Generating content stream with ${model}. Prompt: ${finalPrompt.substring(0,200)}...`);

  const stream = await generateTextStreamOpenAI(
    finalPrompt,
    model,
    `You are a professional ${params.contentType.replace(/_/g, ' ').toLowerCase()} writer for businesses, skilled in creating engaging content.`
  );
  
  return { stream, modelUsed: model, finalPrompt };
}

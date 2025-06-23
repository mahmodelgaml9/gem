
import puppeteer, { Browser, Page, LaunchOptions } from 'puppeteer';
import prisma from './prisma.service';
import { analyzeWithGemini } from './gemini.service';
import { generateTextOpenAI } from './openai.service';
import { MarketAnalysis, AudiencePersona, Prisma } from '@prisma/client';

const MAX_SCRAPE_CONTENT_LENGTH = 15000; // Limit content length to avoid overly large Gemini prompts

/**
 * Scrapes the content of a given URL.
 * @param url The URL to scrape.
 * @returns The textual content of the page, or throws an error if scraping fails.
 */
export async function scrapeUrl(url: string): Promise<string> {
  let browser: Browser | null = null;
  try {
    console.log(`Scraping URL: ${url}`);
    // For Docker, you might need to specify executablePath and args for no-sandbox
    // const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
    const launchOptions: LaunchOptions = {
      headless: true, // Consider 'new' for future versions
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      // ...(executablePath && { executablePath }),
    };
    
    browser = await puppeteer.launch(launchOptions);
    const page: Page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); // Wait for network to be idle

    // Extract text content - might need refinement for specific site structures
    const textContent = await page.evaluate(() => {
      // Remove script, style, nav, footer, and other non-essential tags
      ['script', 'style', 'nav', 'footer', 'aside', 'iframe', 'header'].forEach(tagName => {
        document.querySelectorAll(tagName).forEach(el => el.remove());
      });
      return document.body.innerText;
    });

    await browser.close();
    console.log(`Scraping successful for ${url}. Content length: ${textContent.length}`);
    return textContent.substring(0, MAX_SCRAPE_CONTENT_LENGTH);
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error(`Error scraping URL ${url}:`, error);
    throw new Error(`Failed to scrape URL: ${url}. ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Performs deep analysis of a business using its website content.
 * Generates SWOT, identifies competitors, and creates audience personas.
 * @param businessId The ID of the business to analyze.
 * @param websiteUrl The website URL of the business.
 * @returns The created MarketAnalysis record.
 * @throws Error if any step of the analysis fails.
 */
export async function performDeepAnalysis(businessId: string, websiteUrl: string): Promise<MarketAnalysis> {
  console.log(`Performing deep analysis for business ID: ${businessId}, URL: ${websiteUrl}`);
  let marketAnalysisEntry: MarketAnalysis | null = null;

  try {
    // 1. Create initial MarketAnalysis entry
    marketAnalysisEntry = await prisma.marketAnalysis.create({
      data: {
        businessId,
        status: 'IN_PROGRESS',
        sourceUrl: websiteUrl,
      },
    });

    // 2. Scrape website content
    const scrapedContent = await scrapeUrl(websiteUrl);
    if (!scrapedContent || scrapedContent.trim().length === 0) {
      throw new Error("Scraped content is empty or could not be retrieved.");
    }

    // 3. Generate SWOT analysis using Gemini
    const swotPrompt = `Analyze the following business information scraped from their website and provide a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats). Present the output as a JSON object with keys "strengths", "weaknesses", "opportunities", "threats", where each key holds an array of strings. Business content: """${scrapedContent}"""`;
    const swotJsonString = await analyzeWithGemini(swotPrompt, "You are a business analyst specializing in SWOT analysis.", true);
    let swotData: Prisma.JsonValue = {};
    try {
        swotData = JSON.parse(swotJsonString);
    } catch (e) {
        console.warn("Failed to parse SWOT JSON from Gemini, storing raw string:", swotJsonString);
        swotData = { error: "Failed to parse SWOT from AI", raw: swotJsonString };
    }
    

    // 4. Identify Competitors using Gemini
    const competitorsPrompt = `Based on the following business information, identify 3-5 key competitors. For each competitor, provide their name, website (if inferable or commonly known), and a brief list of their perceived strengths and weaknesses. Present the output as a JSON array of objects, where each object has keys "name", "website", "strengths" (array of strings), and "weaknesses" (array of strings). Business content: """${scrapedContent}"""`;
    const competitorsJsonString = await analyzeWithGemini(competitorsPrompt, "You are a market research analyst identifying business competitors.", true);
    let competitorsData: Prisma.JsonValue = [];
     try {
        competitorsData = JSON.parse(competitorsJsonString);
    } catch (e) {
        console.warn("Failed to parse Competitors JSON from Gemini, storing raw string:", competitorsJsonString);
        competitorsData = { error: "Failed to parse Competitors from AI", raw: competitorsJsonString };
    }

    // Update MarketAnalysis with SWOT and Competitors
    marketAnalysisEntry = await prisma.marketAnalysis.update({
      where: { id: marketAnalysisEntry.id },
      data: {
        swot: swotData,
        competitors: competitorsData,
      },
    });

    // 5. Generate Audience Personas (Example for 2 personas) using Gemini
    // This could be a more iterative process or configurable
    const personaCount = 2;
    const createdPersonas: AudiencePersona[] = [];
    for (let i = 0; i < personaCount; i++) {
      const personaPrompt = `Based on the business information provided, create a detailed audience persona. This is persona ${i + 1} of ${personaCount}. Include: name, ageRange, gender, location (general), occupation, incomeLevel (general), goals (array), painPoints (array), motivations (array), and preferredChannels (array for marketing). Present the output as a single JSON object. Business content: """${scrapedContent}"""`;
      const personaJsonString = await analyzeWithGemini(personaPrompt, "You are a marketing strategist creating detailed customer personas.", true);
      try {
        const personaData = JSON.parse(personaJsonString);
        const createdPersona = await prisma.audiencePersona.create({
          data: {
            businessId,
            name: personaData.name || `Persona ${i + 1}`,
            ageRange: personaData.ageRange,
            gender: personaData.gender,
            location: personaData.location,
            occupation: personaData.occupation,
            incomeLevel: personaData.incomeLevel,
            goals: personaData.goals || [],
            painPoints: personaData.painPoints || [],
            motivations: personaData.motivations || [],
            preferredChannels: personaData.preferredChannels || [],
            description: personaData.description || `Generated persona ${i + 1} for business ${businessId}`,
          },
        });
        createdPersonas.push(createdPersona);
      } catch (e) {
         console.error(`Failed to parse or save persona ${i+1}:`, e);
         // Optionally create a placeholder persona or log error more permanently
      }
    }
    console.log(`Generated ${createdPersonas.length} personas for business ${businessId}`);

    // Final update to MarketAnalysis
    marketAnalysisEntry = await prisma.marketAnalysis.update({
      where: { id: marketAnalysisEntry.id },
      data: {
        status: 'COMPLETED',
        // Potentially add summary or market trends here if generated
      },
    });
    console.log(`Deep analysis completed successfully for business ID: ${businessId}`);
    return marketAnalysisEntry;

  } catch (error) {
    console.error(`Error during deep analysis for business ${businessId}:`, error);
    if (marketAnalysisEntry) {
      await prisma.marketAnalysis.update({
        where: { id: marketAnalysisEntry.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error during analysis.',
        },
      });
    }
    throw error; // Re-throw to be handled by the controller
  }
}

/**
 * Generates a marketing plan based on a market analysis and audience personas.
 * @param businessId The ID of the business.
 * @param marketAnalysisId The ID of the completed market analysis.
 * @param targetAudienceIds Array of AudiencePersona IDs to target.
 * @param objectives Array of campaign objectives.
 * @returns The created MarketingPlan record.
 */
export async function generateMarketingPlan(
  businessId: string,
  marketAnalysisId: string,
  targetAudienceIds: string[],
  objectives: string[], // Should match CampaignObjective enum values
  customInstructions?: string
): Promise<any> { // Using 'any' for marketing plan return type, refine later
  console.log(`Generating marketing plan for business: ${businessId}, analysis: ${marketAnalysisId}`);

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  const marketAnalysis = await prisma.marketAnalysis.findUnique({ where: { id: marketAnalysisId } });
  const audiencePersonas = await prisma.audiencePersona.findMany({ where: { id: { in: targetAudienceIds }, businessId }});

  if (!business || !marketAnalysis || audiencePersonas.length === 0) {
    throw new Error('Business, market analysis, or audience personas not found or invalid.');
  }
  if (marketAnalysis.status !== 'COMPLETED') {
    throw new Error('Market analysis is not yet completed.');
  }

  // Construct a detailed prompt for OpenAI (GPT-4o or similar)
  let prompt = `Create a comprehensive marketing plan for the business "${business.name}".\n`;
  prompt += `Industry: ${business.industry || 'Not specified'}\n`;
  prompt += `Business Description: ${business.description || 'Not specified'}\n\n`;

  prompt += `Based on the following market analysis:\n`;
  prompt += `SWOT: ${JSON.stringify(marketAnalysis.swot, null, 2)}\n`;
  prompt += `Competitors: ${JSON.stringify(marketAnalysis.competitors, null, 2)}\n\n`;

  prompt += `Targeting these audience personas:\n`;
  audiencePersonas.forEach(p => {
    prompt += `- Persona Name: ${p.name}, Goals: ${p.goals.join(', ')}, Pain Points: ${p.painPoints.join(', ')}\n`;
  });
  prompt += `\n`;

  prompt += `The primary objectives for this plan are: ${objectives.join(', ')}.\n\n`;
  
  if (customInstructions) {
    prompt += `Additional Instructions: ${customInstructions}\n\n`;
  }

  prompt += `Please provide a marketing plan including:
1.  Title for the plan.
2.  Key Messages (3-5 concise messages).
3.  Strategies: For each objective, suggest 1-2 core strategies. For each strategy, list 2-3 specific tactics. (e.g., Strategy: Content Marketing, Tactics: Blog Posts, Social Media Updates). Format as a JSON array of objects: { strategyName: string, description: string, tactics: string[] }.
4.  Recommended Channels (list of marketing channels, e.g., "Blog", "LinkedIn", "Email Marketing").
5.  Suggested Timeline (e.g., "3 months", "Q4 2024").
6.  Key Performance Indicators (KPIs) to track success for the given objectives (list of KPIs).

Output the entire plan as a single, well-formed JSON object. The main keys should be "title", "keyMessages" (array of strings), "strategies" (JSON array as described above), "channels" (array of strings), "timeline" (string), "kpis" (array of strings).
`;

  try {
    // Using OpenAI for strategic planning as per blueprint
    const planJsonString = await generateTextOpenAI(
      prompt,
      'gpt-4o', // Using the more powerful model for planning
      'You are an expert marketing strategist tasked with creating a detailed and actionable marketing plan.',
      0.5, // Lower temperature for more focused, less "creative" plan
      3000 // Allow more tokens for a comprehensive plan
    );

    if (!planJsonString) {
      throw new Error('OpenAI did not return a marketing plan.');
    }

    let planData;
    try {
        planData = JSON.parse(planJsonString);
    } catch(e) {
        console.error("Failed to parse marketing plan JSON from OpenAI:", e);
        console.error("Raw response from OpenAI:", planJsonString);
        throw new Error("AI returned an invalid JSON format for the marketing plan.");
    }


    const marketingPlan = await prisma.marketingPlan.create({
      data: {
        businessId,
        marketAnalysisId,
        title: planData.title || `Marketing Plan for ${business.name}`,
        objectives: objectives as any, // Cast if CampaignObjective string array
        targetAudienceIds,
        keyMessages: planData.keyMessages || [],
        strategies: planData.strategies || [],
        channels: planData.channels || [],
        timeline: planData.timeline,
        kpis: planData.kpis || [],
      },
    });

    console.log(`Marketing plan generated successfully: ${marketingPlan.id}`);
    return marketingPlan;

  } catch (error) {
    console.error(`Error generating marketing plan for business ${businessId}:`, error);
    throw error;
  }
}

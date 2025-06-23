
import { GoogleGenAI, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables.');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const analysisModel = 'gemini-2.5-flash-preview-04-17'; // Use the recommended model

// Safety settings to configure content blocking.
// Adjust these as needed for your application's use case.
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Analyzes content using the Gemini model.
 * @param prompt The text prompt for analysis.
 * @param systemInstruction Optional system instruction to guide the AI.
 * @param attemptJsonOutput If true, configures the model to attempt JSON output.
 * @returns The generated text content from the model.
 */
export async function analyzeWithGemini(
  prompt: string,
  systemInstruction?: string,
  attemptJsonOutput: boolean = false
): Promise<string> {
  try {
    console.log(`Sending prompt to Gemini (${analysisModel}): "${prompt.substring(0,100)}..."`);

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: analysisModel,
      contents: prompt,
      config: {
        ...(systemInstruction && { systemInstruction }),
        ...(attemptJsonOutput && { responseMimeType: "application/json" }),
        // Default thinking config (enabled) is generally good for quality.
        // For very low latency needs for this specific model, you could add:
        // thinkingConfig: { thinkingBudget: 0 } 
        safetySettings, // Apply safety settings
      },
    });
    
    const textOutput = response.text;

    if (attemptJsonOutput) {
      return sanitizeAndParseJson(textOutput);
    }
    return textOutput;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Consider more specific error handling or re-throwing
    // Check for response.promptFeedback for blocked prompts
    // if (error.response && error.response.promptFeedback) {
    //   console.error('Prompt Feedback:', error.response.promptFeedback);
    // }
    throw new Error(`Gemini API request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Sanitizes and parses a JSON string, removing potential markdown fences.
 * @param jsonStr The JSON string, possibly wrapped in markdown.
 * @returns The parsed JSON object or the original string if parsing fails.
 */
function sanitizeAndParseJson(jsonStr: string): string {
    let sanitizedStr = jsonStr.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Matches ```json ... ``` or ``` ... ```
    const match = sanitizedStr.match(fenceRegex);

    if (match && match[2]) {
      sanitizedStr = match[2].trim();
    }

    try {
        // Here we just return the string, actual parsing should happen in the calling function
        // if it expects a JSON object. This function ensures the string is clean.
        // JSON.parse(sanitizedStr); // Test if it's valid JSON
        return sanitizedStr; // Return the cleaned string
    } catch (e) {
        console.warn("Gemini response was expected to be JSON but failed to parse after sanitization. Returning raw text.", e);
        return jsonStr; // Fallback to original if sanitization leads to invalid JSON
    }
}

/**
 * Example of how to use analyzeWithGemini and parse JSON specifically.
 * async function getStructuredData(prompt: string): Promise<any> {
 *   const rawJsonString = await analyzeWithGemini(prompt, "You are a helpful assistant that provides structured data.", true);
 *   try {
 *     return JSON.parse(rawJsonString);
 *   } catch (e) {
 *     console.error("Failed to parse JSON response from Gemini:", e);
 *     throw new Error("Invalid JSON response from AI.");
 *   }
 * }
 */

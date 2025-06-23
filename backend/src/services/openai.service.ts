
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates text using a specified OpenAI model.
 * @param prompt The prompt to send to the model.
 * @param model The model to use (e.g., "gpt-4o", "gpt-4o-mini").
 * @param systemMessage Optional system message to guide the AI.
 * @param temperature Optional temperature for creativity (0.0 to 2.0).
 * @param maxTokens Optional maximum number of tokens to generate.
 * @returns The generated text content.
 */
export async function generateTextOpenAI(
  prompt: string,
  model: string = 'gpt-4o-mini', // Default to mini for speed/cost
  systemMessage?: string,
  temperature: number = 0.7,
  maxTokens: number = 1500
): Promise<string | null> {
  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
    });
    return completion.choices[0]?.message?.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    // Consider more specific error handling or re-throwing
    throw new Error(`OpenAI API request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generates text as a stream using a specified OpenAI model.
 * @param prompt The prompt to send to the model.
 * @param model The model to use.
 * @param systemMessage Optional system message.
 * @returns A stream of chat completion chunks.
 */
export async function generateTextStreamOpenAI(
  prompt: string,
  model: string = 'gpt-4o-mini',
  systemMessage?: string
): Promise<AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }
    messages.push({ role: 'user', content: prompt });

    const stream = await openai.chat.completions.create({
      model: model,
      messages: messages,
      stream: true,
    });
    return stream;
  } catch (error) {
    console.error('Error calling OpenAI API for streaming:', error);
    throw new Error(`OpenAI API stream request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default openai;

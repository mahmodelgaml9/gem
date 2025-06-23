
import { Response, NextFunction } from 'express';
import * as contentService from './content.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { generateContentStream } from '../services/generation.service'; // For streaming

export async function saveGeneratedContentHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }
    const contentData = req.body; // { businessId, contentType, title, body, promptUsed, aiModelUsed, marketingPlanId? }
    const savedContent = await contentService.saveContent(req.user.id, contentData);
    res.status(201).json(savedContent);
  } catch (error) {
    next(error);
  }
}

export async function streamGeneratedContentHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }

    const generationParams = req.body; // Expects ContentGenerationParams from generation.service
    // Ensure businessId is present and belongs to the user (can be validated in generation.service or here)
    if (!generationParams.businessId) {
        res.status(400).json({ message: 'Business ID is required for content generation.' });
        return;
    }
    // TODO: Add validation that req.user.id owns generationParams.businessId
    // Example: const business = await prisma.business.findFirst({ where: { id: generationParams.businessId, userId: req.user.id }}); if (!business) { ... }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Flush the headers to establish the SSE connection

    const { stream, modelUsed, finalPrompt } = await generateContentStream(generationParams);
    
    // Send initial metadata as an SSE event (optional)
    const initialData = { type: 'metadata', modelUsed, promptChars: finalPrompt.length };
    res.write(`data: ${JSON.stringify(initialData)}\n\n`);

    let fullText = "";
    for await (const chunk of stream) {
      const textChunk = chunk.choices[0]?.delta?.content || '';
      if (textChunk) {
        fullText += textChunk;
        const sseEvent = { type: 'chunk', text: textChunk };
        res.write(`data: ${JSON.stringify(sseEvent)}\n\n`);
      }
    }
    
    // Send a 'done' event with the full text, so client can save if needed
    const doneEvent = { type: 'done', fullText: fullText, modelUsed: modelUsed, promptUsed: finalPrompt, contentType: generationParams.contentType, businessId: generationParams.businessId, marketingPlanId: generationParams.marketingPlanId };
    res.write(`data: ${JSON.stringify(doneEvent)}\n\n`);
    
    // End the response when the stream is finished
    res.end();

  } catch (error) {
    // If headers already sent, we can't send a JSON error response.
    // We can try to send an error SSE event if the connection is still open.
    if (!res.headersSent) {
      next(error); // Pass to global error handler
    } else {
      console.error("Error during streaming after headers sent:", error);
      const errorEvent = { type: 'error', message: error instanceof Error ? error.message : 'Streaming error' };
      try {
        res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
      } catch (writeError) {
        console.error("Error writing SSE error event:", writeError);
      }
      res.end();
    }
  }
}

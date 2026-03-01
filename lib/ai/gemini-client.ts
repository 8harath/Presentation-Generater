/**
 * Gemini API client wrapper with error handling and rate limiting
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { retryWithBackoff, logError } from '@/lib/utils/error-handler';

const API_KEY = process.env.GOOGLE_GENERATIVE_AI_KEY;

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    if (!API_KEY) {
      throw new Error('GOOGLE_GENERATIVE_AI_KEY environment variable is not set');
    }
    client = new GoogleGenerativeAI(API_KEY);
  }
  return client;
}

const MODEL_NAME = 'gemini-2.0-flash';

const SAFETY_SETTINGS = [
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
 * Generate text content using Gemini
 */
export async function generateText(prompt: string, maxTokens: number = 1000): Promise<string> {
  try {
    const result = await retryWithBackoff(async () => {
      const model = getClient().getGenerativeModel({ model: MODEL_NAME });
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        safetySettings: SAFETY_SETTINGS,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        },
      });

      const text = response.response.text();
      return text;
    }, 3, 1000);

    return result;
  } catch (error) {
    logError('generateText', error, { prompt: prompt.substring(0, 100) });
    throw error;
  }
}

/**
 * Generate image using Gemini
 */
export async function generateImage(concept: string): Promise<string | null> {
  try {
    // Note: As of current Gemini API, image generation is limited
    // Using text-to-image would require additional service like Imagen
    // For MVP, we'll return a concept description that can be used with image service
    // or fallback to placeholder generation

    const prompt = `Create a professional image concept for: ${concept}`;
    const description = await generateText(prompt, 200);
    return description;
  } catch (error) {
    logError('generateImage', error, { concept });
    return null;
  }
}

/**
 * Parse JSON from Gemini response with retry
 */
export async function generateJSON<T = any>(
  prompt: string,
  schema?: string
): Promise<T> {
  try {
    const jsonPrompt = `${prompt}

IMPORTANT: Return ONLY valid JSON, no markdown code blocks, no explanation.
${schema ? `Follow this structure: ${schema}` : ''}`;

    const response = await generateText(jsonPrompt, 2000);

    // Clean up response if wrapped in code blocks
    let cleanJson = response.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.slice(7);
    }
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.slice(3);
    }
    if (cleanJson.endsWith('```')) {
      cleanJson = cleanJson.slice(0, -3);
    }
    cleanJson = cleanJson.trim();

    const parsed = JSON.parse(cleanJson) as T;
    return parsed;
  } catch (error) {
    logError('generateJSON', error, { prompt: prompt.substring(0, 100) });
    throw new Error(`Failed to parse Gemini response as JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Count tokens in text (approximate)
 * Gemini uses roughly 4 chars = 1 token as heuristic
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Generate slide content with JSON structure
 */
export async function generateSlideContent(slideType: 'title' | 'content' | 'summary', slideNumber: number, topic: string, context: string, previousContent?: string): Promise<{
  title: string;
  bullets: string[];
  imageConcept: string;
}> {
  let prompt = '';

  if (slideType === 'title') {
    prompt = `You are a professional presentation designer. Generate the title slide for a presentation.

Topic: ${topic}
Context: ${context}

Generate a compelling title slide with:
- A main title (max 8 words) that captures the topic
- A subtitle (max 12 words) that adds context
- An image concept (short phrase for visual design)

Return as JSON: { "title": "Main Title", "bullets": ["Subtitle text here"], "imageConcept": "visual concept" }`;
  } else if (slideType === 'content') {
    prompt = `You are a professional presentation designer. Generate slide ${slideNumber} content.

Topic: ${topic}
Context: ${context}
${previousContent ? `Previous slides covered: ${previousContent}` : ''}

Generate a content slide with:
- A clear heading (max 8 words)
- 3-4 bullet points (max 15 words each)
- An image concept (short phrase for visual design)

Make it informative and visually interesting. Maintain narrative flow.

Return as JSON: { "title": "Slide Title", "bullets": ["Point 1", "Point 2", "Point 3"], "imageConcept": "visual concept" }`;
  } else if (slideType === 'summary') {
    prompt = `You are a professional presentation designer. Generate the summary/conclusion slide.

Topic: ${topic}
${previousContent ? `Presentation covered: ${previousContent}` : ''}

Generate a compelling summary slide with:
- A closing title (max 8 words)
- 2-3 key takeaways (max 15 words each)
- An image concept for conclusion imagery

Return as JSON: { "title": "Conclusion Title", "bullets": ["Takeaway 1", "Takeaway 2"], "imageConcept": "visual concept" }`;
  }

  const schema = `{
    "title": "string - max 8 words",
    "bullets": ["string - max 15 words each, 3-4 items"],
    "imageConcept": "string - short visual concept"
  }`;

  return generateJSON(prompt, schema);
}

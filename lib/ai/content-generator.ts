/**
 * Orchestrates content generation using Gemini API
 * Handles slide generation, image concept extraction, and error recovery
 */

import { generateSlideContent, estimateTokens } from './gemini-client';
import { getSlidePrompt } from './prompt-templates';
import type { GeneratedSlide, SlideType } from '@/lib/types/presentation';
import { logError } from '@/lib/utils/error-handler';

interface ContentGeneratorOptions {
  topic: string;
  context?: string;
  slideCount: number;
  onProgress?: (current: number, total: number) => void;
}

interface GenerationProgress {
  currentSlide: number;
  totalSlides: number;
  slides: GeneratedSlide[];
  estimatedTokens: number;
}

/**
 * Determines slide type based on position in presentation
 */
function getSlideType(slideNumber: number, totalSlides: number): SlideType {
  if (slideNumber === 1) return 'title';
  if (slideNumber === totalSlides) return 'summary';
  return 'content';
}

/**
 * Generates a summary of previous slides for context
 */
function generatePreviousSummary(slides: GeneratedSlide[]): string {
  if (slides.length === 0) return '';

  return slides
    .slice(0, Math.min(slides.length, 3)) // Last 3 slides
    .map((s) => `Slide ${s.slideNumber}: ${s.title}`)
    .join('; ');
}

/**
 * Main content generation function
 * Generates slides sequentially to maintain narrative flow
 */
export async function generatePresentationContent(
  options: ContentGeneratorOptions
): Promise<GenerationProgress> {
  const { topic, context = '', slideCount, onProgress } = options;

  const slides: GeneratedSlide[] = [];
  let totalTokens = 0;

  try {
    for (let slideNumber = 1; slideNumber <= slideCount; slideNumber++) {
      try {
        const slideType = getSlideType(slideNumber, slideCount);
        const previousSummary = generatePreviousSummary(slides);

        console.log(
          `[v0] Generating slide ${slideNumber}/${slideCount} (type: ${slideType})`
        );

        // Generate slide content
        const content = await generateSlideContent(
          slideType,
          slideNumber,
          topic,
          context,
          previousSummary
        );

        // Estimate token usage
        const slideTokens = estimateTokens(
          JSON.stringify(content)
        );
        totalTokens += slideTokens;

        // Create slide object
        const slide: GeneratedSlide = {
          slideNumber,
          type: slideType,
          title: content.title,
          bullets: content.bullets,
          imageConcept: content.imageConcept,
          imageUrl: null, // Will be populated later if image generation is added
        };

        slides.push(slide);

        // Report progress
        if (onProgress) {
          onProgress(slideNumber, slideCount);
        }

        console.log(`[v0] Slide ${slideNumber} generated successfully`);
      } catch (slideError) {
        logError(`Error generating slide ${slideNumber}`, slideError, {
          topic,
          slideType: getSlideType(slideNumber, slideCount),
        });

        // Add fallback slide
        const slide: GeneratedSlide = {
          slideNumber,
          type: getSlideType(slideNumber, slideCount),
          title: `Slide ${slideNumber}: ${topic}`,
          bullets: ['Content could not be generated. Please refresh and try again.'],
          imageConcept: 'Placeholder',
          imageUrl: null,
        };
        slides.push(slide);
      }
    }

    console.log(
      `[v0] Content generation complete. Total tokens: ${totalTokens}, Estimated cost: $${(totalTokens * 0.075 / 1000000).toFixed(4)}`
    );

    return {
      currentSlide: slideCount,
      totalSlides: slideCount,
      slides,
      estimatedTokens: totalTokens,
    };
  } catch (error) {
    logError('generatePresentationContent', error, {
      topic,
      slideCount,
      slidesGenerated: slides.length,
    });
    throw error;
  }
}

/**
 * Alternative: Batch generation for faster processing
 * Generates all slide outlines first, then content
 */
export async function generatePresentationContentBatch(
  options: ContentGeneratorOptions
): Promise<GenerationProgress> {
  const { topic, context = '', slideCount, onProgress } = options;

  const slides: GeneratedSlide[] = [];
  let totalTokens = 0;

  try {
    // Phase 1: Generate all slide outlines
    console.log('[v0] Phase 1: Generating presentation outline');

    // Phase 2: Generate individual slide content in parallel
    // For MVP, we'll keep it sequential to maintain narrative flow
    return await generatePresentationContent(options);
  } catch (error) {
    logError('generatePresentationContentBatch', error, { topic, slideCount });
    throw error;
  }
}

/**
 * Validate and clean generated content
 */
export function validateSlideContent(slide: GeneratedSlide): boolean {
  if (!slide.title || slide.title.trim().length === 0) {
    console.warn(`[v0] Slide ${slide.slideNumber} has empty title`);
    return false;
  }

  if (!Array.isArray(slide.bullets) || slide.bullets.length === 0) {
    console.warn(`[v0] Slide ${slide.slideNumber} has no bullets`);
    return false;
  }

  return true;
}

/**
 * Sanitize slide content for display
 */
export function sanitizeSlideContent(slide: GeneratedSlide): GeneratedSlide {
  return {
    ...slide,
    title: slide.title.substring(0, 200).trim(),
    bullets: slide.bullets
      .map((b) => b.substring(0, 150).trim())
      .filter((b) => b.length > 0)
      .slice(0, 5),
    imageConcept: slide.imageConcept?.substring(0, 100).trim() || 'Presentation slide',
  };
}

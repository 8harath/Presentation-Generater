/**
 * Dynamic prompt template generation for different slide types
 */

import type { SlideType } from '@/lib/types/presentation';

interface PromptContext {
  topic: string;
  context?: string;
  slideNumber: number;
  totalSlides: number;
  previousSummary?: string;
  template?: string;
}

/**
 * Generate a prompt for title slide
 */
export function generateTitleSlidePrompt(ctx: PromptContext): string {
  return `You are creating a professional PowerPoint presentation title slide.

PRESENTATION TOPIC: ${ctx.topic}
${ctx.context ? `CONTEXT/DESCRIPTION: ${ctx.context}` : 'No additional context.'}

Generate engaging and concise content for the title slide:
- Main Title: Catchy, direct, max 8 words
- Subtitle: Descriptive and engaging, max 12 words
- Visual Concept: A short phrase describing what image/graphics would work well

Keep the tone professional and impactful.

Return response as valid JSON (nothing else):
{
  "title": "Your main title here",
  "bullets": ["Subtitle or tagline"],
  "imageConcept": "Description of visual theme"
}`;
}

/**
 * Generate a prompt for content slide
 */
export function generateContentSlidePrompt(ctx: PromptContext): string {
  return `You are creating a professional PowerPoint presentation content slide.

PRESENTATION TOPIC: ${ctx.topic}
${ctx.context ? `CONTEXT: ${ctx.context}` : ''}
SLIDE: ${ctx.slideNumber} of ${ctx.totalSlides}

${ctx.previousSummary ? `NARRATIVE FLOW - Previous slides covered: ${ctx.previousSummary}` : ''}

Generate relevant content for slide ${ctx.slideNumber}:
- Title: Clear and concise, max 8 words
- Bullet Points: 3-4 main points, each max 15 words
- Visual Concept: A short phrase for the slide image/graphic

Guidelines:
- Build logically from the topic
- Use simple, professional language
- Ensure each bullet is distinct and valuable
- Think about what image would enhance this content

Return response as valid JSON (nothing else):
{
  "title": "Slide title",
  "bullets": ["Point 1", "Point 2", "Point 3"],
  "imageConcept": "Visual concept description"
}`;
}

/**
 * Generate a prompt for summary/conclusion slide
 */
export function generateSummarySlidePrompt(ctx: PromptContext): string {
  return `You are creating a professional PowerPoint presentation summary/conclusion slide.

PRESENTATION TOPIC: ${ctx.topic}
PRESENTATION OVERVIEW: ${ctx.previousSummary || ctx.context || 'A comprehensive presentation'}

Generate a compelling summary slide:
- Title: A closing statement, max 8 words
- Key Takeaways: 2-3 main points from the presentation, each max 15 words
- Visual Concept: A short phrase for conclusion imagery

Guidelines:
- Summarize key insights
- Inspire or call to action where appropriate
- Use professional, confident tone
- Think about imagery that reinforces the conclusion

Return response as valid JSON (nothing else):
{
  "title": "Conclusion/Summary title",
  "bullets": ["Takeaway 1", "Takeaway 2"],
  "imageConcept": "Concluding visual concept"
}`;
}

/**
 * Select and customize prompt based on slide type
 */
export function getSlidePrompt(slideType: SlideType, context: PromptContext): string {
  switch (slideType) {
    case 'title':
      return generateTitleSlidePrompt(context);
    case 'content':
      return generateContentSlidePrompt(context);
    case 'summary':
      return generateSummarySlidePrompt(context);
    default:
      return generateContentSlidePrompt(context);
  }
}

/**
 * Generate structured prompt for batch processing
 */
export function generateBatchPrompt(
  slides: Array<{ type: SlideType; number: number; summary?: string }>
): string {
  const slideDescriptions = slides
    .map((s) => `Slide ${s.number}: type=${s.type}${s.summary ? ` (${s.summary})` : ''}`)
    .join('\n');

  return `You are planning a multi-slide PowerPoint presentation outline.

Slides to generate:
${slideDescriptions}

Provide a brief narrative arc and key topics for each slide to ensure cohesion.

Return as JSON: { "narrative": "Overall story arc", "slides": [{ "number": 1, "topic": "..." }, ...] }`;
}

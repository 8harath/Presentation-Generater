/**
 * Converts generated slide data into PPTX-compatible slide objects
 * Handles formatting, layout, and styling
 */

import type { GeneratedSlide } from '@/lib/types/presentation';
import type { Template } from '@/lib/types/presentation';

export interface ComposedSlide {
  type: 'title' | 'content' | 'summary';
  title: string;
  bullets: string[];
  imageConcept: string;
  backgroundColor: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  titleFontSize: number;
  bodyFontSize: number;
  imagePosition?: 'left' | 'right' | 'center' | 'background';
  slideNumber: number;
}

/**
 * Compose a single slide with template styling
 */
export function composeSlide(
  generatedSlide: GeneratedSlide,
  template: Template
): ComposedSlide {
  return {
    type: generatedSlide.type,
    title: sanitizeText(generatedSlide.title),
    bullets: generatedSlide.bullets.map(sanitizeText),
    imageConcept: generatedSlide.imageConcept || 'Presentation slide',
    backgroundColor: template.colors.background,
    titleColor: template.colors.primary,
    textColor: template.colors.text,
    accentColor: template.colors.accent,
    titleFontSize: generatedSlide.type === 'title' ? 54 : 44,
    bodyFontSize: 18,
    imagePosition: generatedSlide.type === 'title' ? 'center' : 'right',
    slideNumber: generatedSlide.slideNumber,
  };
}

/**
 * Compose all slides for a presentation
 */
export function composePresentation(
  slides: GeneratedSlide[],
  template: Template
): ComposedSlide[] {
  return slides.map((slide) => composeSlide(slide, template));
}

/**
 * Sanitize text for display - just trim whitespace.
 * XML escaping is handled by escapeXml() in pptx-generator.ts
 */
function sanitizeText(text: string): string {
  return text.trim();
}

/**
 * Validate composed slide
 */
export function validateComposedSlide(slide: ComposedSlide): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!slide.title || slide.title.trim().length === 0) {
    errors.push('Slide title is empty');
  }

  if (!Array.isArray(slide.bullets) || slide.bullets.length === 0) {
    errors.push('Slide has no content bullets');
  }

  if (!slide.backgroundColor) {
    errors.push('Slide background color is missing');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get layout configuration for slide type
 */
export function getLayoutConfig(slideType: 'title' | 'content' | 'summary') {
  switch (slideType) {
    case 'title':
      return {
        titleMarginTop: 2.0,
        titleMarginBottom: 0.5,
        contentMarginTop: 3.5,
        imageSize: { width: 8, height: 5 },
      };
    case 'content':
      return {
        titleMarginTop: 0.5,
        titleMarginBottom: 0.3,
        contentMarginTop: 1.2,
        imageSize: { width: 4, height: 4 },
      };
    case 'summary':
      return {
        titleMarginTop: 1.0,
        titleMarginBottom: 0.5,
        contentMarginTop: 2.0,
        imageSize: { width: 8, height: 4 },
      };
  }
}

/**
 * Format bullet point text with wrapping considerations
 */
export function formatBulletPoint(text: string, maxLength: number = 80): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length > maxLength) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine ? ' ' : '') + word;
    }
  }

  if (currentLine) lines.push(currentLine.trim());

  return lines;
}

/**
 * Create default fallback slide if generation fails
 */
export function createFallbackSlide(slideNumber: number, template: Template): ComposedSlide {
  return {
    type: slideNumber === 1 ? 'title' : 'content',
    title: slideNumber === 1 ? 'Presentation' : `Slide ${slideNumber}`,
    bullets:
      slideNumber === 1
        ? ['Click here to add subtitle']
        : ['• Point 1', '• Point 2', '• Point 3'],
    imageConcept: 'Placeholder image',
    backgroundColor: template.colors.background,
    titleColor: template.colors.primary,
    textColor: template.colors.text,
    accentColor: template.colors.accent,
    titleFontSize: slideNumber === 1 ? 54 : 44,
    bodyFontSize: 18,
    imagePosition: slideNumber === 1 ? 'center' : 'right',
    slideNumber,
  };
}

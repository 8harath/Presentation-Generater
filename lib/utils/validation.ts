/**
 * Zod schemas for input validation
 */

import { z } from 'zod';
import type { GenerationRequest, TemplateType } from '@/lib/types/presentation';

export const GenerationRequestSchema = z.object({
  topic: z
    .string()
    .min(3, 'Topic must be at least 3 characters')
    .max(100, 'Topic must be less than 100 characters'),
  context: z
    .string()
    .max(1000, 'Context must be less than 1000 characters')
    .optional()
    .default(''),
  slideCount: z
    .number()
    .int('Slide count must be an integer')
    .min(3, 'Minimum 3 slides required')
    .max(15, 'Maximum 15 slides allowed'),
  template: z.enum(['minimal', 'professional', 'creative'] as const, {
    errorMap: () => ({ message: 'Invalid template selected' }),
  }),
}) satisfies z.ZodType<GenerationRequest>;

export const SlideDataSchema = z.object({
  slideNumber: z.number().int().positive(),
  type: z.enum(['title', 'content', 'summary']),
  title: z.string().min(1).max(200),
  bullets: z.array(z.string().max(150)).min(0).max(5),
  imageConcept: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
});

/**
 * Validate and parse generation request
 */
export function validateGenerationRequest(data: unknown): GenerationRequest {
  return GenerationRequestSchema.parse(data);
}

/**
 * Safe validation with error handling
 */
export function safeValidateRequest(
  data: unknown
): { success: boolean; data?: GenerationRequest; error?: string } {
  try {
    const parsed = GenerationRequestSchema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}

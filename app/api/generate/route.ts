/**
 * POST /api/generate
 * Initiates asynchronous presentation generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateGenerationRequest } from '@/lib/utils/validation';
import { errorResponse, successResponse, AppError, logError } from '@/lib/utils/error-handler';
import { createJob } from '@/lib/storage/job-store';
import type { ApiResponse } from '@/lib/types/presentation';

// Prevent body timeout for long-running operations
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * POST handler - Initiate presentation generation
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Check API key first
    if (!process.env.GOOGLE_GENERATIVE_AI_KEY) {
      return NextResponse.json(
        errorResponse(
          'API key not configured. Add GOOGLE_GENERATIVE_AI_KEY in the Vars section of the sidebar.'
        ),
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = validateGenerationRequest(body);

    // Create job entry
    const { jobId, job } = createJob(validationResult.topic, validationResult.slideCount, validationResult.template);

    console.log(`[v0] Generation job created: ${jobId}`);

    // Start async generation in background
    // Note: In production, this would use a queue service
    // For MVP, we trigger it immediately but don't wait
    generatePresentationAsync(jobId, validationResult).catch((error) => {
      logError('Async generation failed', error, { jobId });
    });

    return NextResponse.json(
      successResponse(
        {
          jobId,
          estimatedTime: 120, // Estimated 2 minutes for typical 10-slide deck
        },
        jobId
      ),
      { status: 202 } // 202 Accepted
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error), { status: error.statusCode });
    }

    logError('POST /api/generate', error);
    return NextResponse.json(
      errorResponse('Failed to initiate generation'),
      { status: 500 }
    );
  }
}

/**
 * Async presentation generation
 * Runs in background and updates job status
 */
async function generatePresentationAsync(
  jobId: string,
  requestData: any
): Promise<void> {
  try {
    // Import here to avoid loading all modules upfront
    const { generatePresentationContent } = await import('@/lib/ai/content-generator');
    const { getTemplate } = await import('@/lib/pptx/templates');
    const { composePresentation } = await import('@/lib/pptx/slide-composer');
    const { generatePPTX } = await import('@/lib/pptx/pptx-generator');
    const { updateJobProgress, updateJobStatus, completeJob, failJob } =
      await import('@/lib/storage/job-store');

    console.log(`[v0] Starting async generation for job ${jobId}`);

    // Step 1: Generate content
    updateJobStatus(jobId, 'generating', 10);

    const contentResult = await generatePresentationContent({
      topic: requestData.topic,
      context: requestData.context,
      slideCount: requestData.slideCount,
      onProgress: (current, total) => {
        const progress = 10 + (current / total) * 40; // 10-50%
        updateJobProgress(jobId, current, total);
      },
    });

    console.log(
      `[v0] Content generation complete: ${contentResult.slides.length} slides`
    );

    // Step 2: Compose slides
    updateJobStatus(jobId, 'composing', 50);

    const template = getTemplate(requestData.template);
    const composedSlides = composePresentation(contentResult.slides, template);

    console.log(`[v0] Slides composed for job ${jobId}`);

    // Step 3: Generate PPTX
    updateJobStatus(jobId, 'composing', 75);

    const pptxBuffer = await generatePPTX(
      composedSlides,
      requestData.template,
      requestData.topic
    );

    console.log(`[v0] PPTX generated: ${pptxBuffer.length} bytes`);

    // Step 4: Store file (in production, upload to cloud storage)
    // For MVP, we'll encode to base64 and store reference
    const fileUrl = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${pptxBuffer.toString('base64')}`;

    console.log(`[v0] PPTX stored for job ${jobId}`);

    // Mark job as complete
    completeJob(jobId, fileUrl, contentResult.slides);

    console.log(`[v0] Job ${jobId} completed successfully`);
  } catch (error) {
    logError(`generatePresentationAsync for job ${jobId}`, error);

    const { failJob } = await import('@/lib/storage/job-store');
    failJob(
      jobId,
      error instanceof Error ? error.message : 'Unknown error during generation'
    );
  }
}

/**
 * Handle unsupported methods
 */
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Use POST to generate presentations' },
    { status: 405 }
  );
}

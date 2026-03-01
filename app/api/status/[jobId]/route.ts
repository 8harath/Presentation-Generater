/**
 * GET /api/status/[jobId]
 * Returns the current status of a presentation generation job
 */

import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/storage/job-store';
import { NotFoundError, successResponse, errorResponse } from '@/lib/utils/error-handler';
import type { ApiResponse } from '@/lib/types/presentation';

export const dynamic = 'force-dynamic';

/**
 * GET handler - Retrieve job status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { jobId } = await params;

    console.log(`[v0] Status check for job: ${jobId}`);

    // Retrieve job from store
    const job = getJob(jobId);

    if (!job) {
      return NextResponse.json(
        errorResponse(new NotFoundError('Generation job not found')),
        { status: 404 }
      );
    }

    // Return job status
    return NextResponse.json(successResponse(job), { status: 200 });
  } catch (error) {
    console.error('[v0] Error in GET /api/status:', error);
    return NextResponse.json(
      errorResponse('Failed to retrieve job status'),
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported methods
 */
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Use GET to check status' },
    { status: 405 }
  );
}

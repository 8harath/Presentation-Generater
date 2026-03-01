/**
 * GET /api/download/[jobId]
 * Downloads the generated PPTX file
 */

import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/storage/job-store';
import { NotFoundError, AppError, logError } from '@/lib/utils/error-handler';

export const dynamic = 'force-dynamic';

/**
 * GET handler - Download generated PPTX file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
): Promise<NextResponse> {
  try {
    const { jobId } = await params;

    console.log(`[v0] Download request for job: ${jobId}`);

    // Retrieve job from store
    const job = getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Generation job not found' },
        { status: 404 }
      );
    }

    // Check if job is complete
    if (job.status !== 'complete') {
      return NextResponse.json(
        {
          success: false,
          error: `Generation job is ${job.status}. Please wait for completion.`,
        },
        { status: 202 } // 202 Accepted - still processing
      );
    }

    // Return download link
    return NextResponse.json(
      {
        success: true,
        data: {
          downloadUrl: job.pptxUrl,
          fileName: `presentation-${jobId}.pptx`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logError('GET /api/download', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve download' },
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported methods
 */
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Use GET to download presentations' },
    { status: 405 }
  );
}

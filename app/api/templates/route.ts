/**
 * GET /api/templates
 * Returns list of available presentation templates
 */

import { NextResponse } from 'next/server';
import { getTemplatesInfo } from '@/lib/pptx/templates';
import { successResponse } from '@/lib/utils/error-handler';

export async function GET() {
  try {
    const templates = getTemplatesInfo();

    return NextResponse.json(
      successResponse({
        templates,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch templates',
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { cjService } from '@/lib/cjdropshipping';
import logger from '@/lib/logger';
import { successResponse, sendErrorResponse } from '@/lib/errors';

// GET - Obtenir les catégories CJ Dropshipping
export async function GET() {
  try {
    const categories = await cjService.getCategories();

    return NextResponse.json(successResponse(categories));
  } catch (error: any) {
    logger.error('CJ Categories API Error:', error);
    return sendErrorResponse('INTERNALerror', error.message || 'Failed to get categories');
  }
}

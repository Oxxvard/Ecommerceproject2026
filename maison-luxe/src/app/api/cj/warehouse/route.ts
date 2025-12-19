import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { cjService } from '@/lib/cjdropshipping';
import { successResponse, sendErrorResponse } from '@/lib/errors';

// GET - Obtenir les informations d'un entrepôt CJ
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const warehouseId = searchParams.get('id');
    const warehouseIds = searchParams.get('ids');
    const listAll = searchParams.get('listAll');

    // Si listAll=true, récupérer la liste globale
    if (listAll === 'true') {
      const warehouses = await cjService.getGlobalWarehouseList();
      return NextResponse.json(successResponse({ warehouses, count: warehouses.length }));
    }

    if (!warehouseId && !warehouseIds) {
      return sendErrorResponse('MISSING_REQUIRED_FIELD', 'Warehouse ID or IDs are required (use ?id=xxx or ?ids=xxx,yyy,zzz or ?listAll=true)');
    }

    // Si un seul ID
    if (warehouseId) {
      const result = await cjService.getWarehouseInfo(warehouseId);
      return NextResponse.json(successResponse(result));
    }

    // Si plusieurs IDs
    if (warehouseIds) {
      const ids = warehouseIds.split(',').map(id => id.trim());
      const results = await cjService.getMultipleWarehousesInfo(ids);
      return NextResponse.json(successResponse({ warehouses: results, count: results.length }));
    }
  } catch (error: any) {
    logger.error('CJ Warehouse API Error:', error);
    return sendErrorResponse('INTERNALerror', error.message || 'Failed to get warehouse info');
  }
}

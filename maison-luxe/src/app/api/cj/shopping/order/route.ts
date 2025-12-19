import { NextRequest, NextResponse } from 'next/server';
import { cjService } from '@/lib/cjdropshipping';
import logger from '@/lib/logger';
import { successResponse, sendErrorResponse } from '@/lib/errors';

// POST - Créer une commande CJ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      orderNumber,
      shippingCountryCode,
      shippingCountry,
      shippingProvince,
      shippingCity,
      shippingAddress,
      shippingCustomerName,
      shippingPhone,
      shippingZip,
      email,
      logisticName,
      storageId = '201e67f6ba4644c0a36d63bf4989dd70', // Cranbury par défaut
      shopLogisticsType = 1,
      payType = 3,
      remark,
      products,
    } = body;

    // Validation
    if (!orderNumber || !shippingCountryCode || !shippingCountry || !shippingCity || !shippingAddress || !shippingCustomerName || !logisticName || !products || products.length === 0) {
      return sendErrorResponse('MISSING_REQUIRED_FIELD', 'Missing required fields');
    }

    logger.info('📨 CJ Create Order Request:', {
      orderNumber,
      customer: shippingCustomerName,
      country: shippingCountryCode,
      products: products.length,
    });

    const result = await cjService.createOrder({
      orderNumber,
      shippingCountryCode,
      shippingCountry,
      shippingProvince,
      shippingCity,
      shippingAddress,
      shippingCustomerName,
      shippingPhone,
      shippingZip,
      email,
      logisticName,
      storageId,
      shopLogisticsType,
      payType,
      remark,
      products,
    });

    return NextResponse.json(successResponse({ data: result, message: 'CJ Order created successfully' }));
  } catch (error: any) {
    logger.error('CJ Order Creation Error:', error);
    return sendErrorResponse('INTERNALerror', error.message || 'Failed to create CJ order');
  }
}

// GET - Obtenir les détails d'une commande CJ
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const features = searchParams.get('features')?.split(',');

    if (!orderId) {
      return sendErrorResponse('MISSING_REQUIRED_FIELD', 'orderId is required');
    }

    const result = await cjService.getOrderDetails(orderId, features);

    return NextResponse.json(successResponse(result));
  } catch (error: any) {
    logger.error('CJ Get Order Details Error:', error);
    return sendErrorResponse('INTERNALerror', error.message || 'Failed to get order details');
  }
}

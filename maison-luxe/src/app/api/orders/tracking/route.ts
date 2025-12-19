
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { cjService } from '@/lib/cjdropshipping';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import logger from '@/lib/logger';
import { successResponse, sendErrorResponse } from '@/lib/errors';

// GET - Obtenir les informations de suivi d'une commande
export const GET = withAuth(async (request: NextRequest, session) => {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return sendErrorResponse('MISSING_REQUIRED_FIELD', 'Order ID required');
    }

    await dbConnect();

    // Récupérer la commande
    const order = await Order.findById(orderId).populate('user');

    if (!order) {
      return sendErrorResponse('NOT_FOUND', 'Order not found');
    }

    // Vérifier que l'utilisateur est autorisé (propriétaire ou admin)
    const isAdmin = (session.user as any)?.role === 'admin';
    const isOwner = order.user?._id?.toString() === (session.user as any)?.id;

    if (!isAdmin && !isOwner) {
      return sendErrorResponse('FORBIDDEN', 'Unauthorized');
    }

    // Vérifier si la commande a un numéro de tracking CJ
    if (!order.cjOrderId && !order.trackingNumber) {
      return NextResponse.json(successResponse({ status: 'pending', message: 'Commande en préparation' }));
    }

    // Si on a un numéro de tracking, récupérer les infos de CJ
    const trackingNumbers: string[] = [];
    
    if (order.trackingNumber) {
      trackingNumbers.push(order.trackingNumber);
    }

    if (trackingNumbers.length === 0) {
      return NextResponse.json(successResponse({ status: 'processing', message: 'Commande en cours de traitement chez CJ', cjOrderId: order.cjOrderId }));
    }

    // Récupérer les informations de tracking depuis CJ
    const trackingInfoRaw = await cjService.getTrackingInfo(trackingNumbers);
    let mappedTracking: any[] = [];
    if (Array.isArray(trackingInfoRaw)) {
      mappedTracking = trackingInfoRaw.map((track: any) => ({
        trackingNumber: track.trackingNumber,
        logisticName: track.logisticName,
        from: track.trackingFrom,
        to: track.trackingTo,
        status: track.trackingStatus,
        deliveryDay: track.deliveryDay,
        deliveryTime: track.deliveryTime,
        lastMileCarrier: track.lastMileCarrier,
        lastTrackNumber: track.lastTrackNumber,
      }));
    }

    return NextResponse.json(successResponse({ orderId: order._id, cjOrderId: order.cjOrderId, cjOrderNumber: order.cjOrderNumber, trackingInfo: mappedTracking }));
  } catch (error: any) {
    logger.error('❌ Get tracking info error:', error);
    return sendErrorResponse('INTERNALerror', error.message || 'Failed to get tracking info');
  }
});

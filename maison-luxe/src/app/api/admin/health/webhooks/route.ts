import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import logger from '@/lib/logger';
import { successResponse, sendErrorResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    await dbConnect();

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [lastStripe, stripeCount24h] = await Promise.all([
      Order.findOne({ paymentStatus: 'paid', stripeSessionId: { $exists: true } })
        .sort({ updatedAt: -1 })
        .select('updatedAt stripeSessionId')
        .lean(),
      Order.countDocuments({ paymentStatus: 'paid', updatedAt: { $gte: since } }),
    ]);

    const [lastCjOrder, cjOrderCount24h] = await Promise.all([
      Order.findOne({
        $or: [
          { 'cjData.lastWebhookUpdate': { $exists: true } },
          { 'cjData.orderStatus': { $exists: true } },
          { cjOrderId: { $exists: true } },
        ],
      })
        .sort({ 'cjData.lastWebhookUpdate': -1, updatedAt: -1 })
        .select('cjData.lastWebhookUpdate updatedAt cjOrderId cjOrderNumber')
        .lean(),
      Order.countDocuments({ 'cjData.lastWebhookUpdate': { $gte: since } }),
    ]);

    const [lastCjLogistics, cjLogisticsCount24h] = await Promise.all([
      Order.findOne({ 'cjData.tracking.lastUpdate': { $exists: true } })
        .sort({ 'cjData.tracking.lastUpdate': -1, updatedAt: -1 })
        .select('cjData.tracking.lastUpdate trackingNumber trackingCarrier')
        .lean(),
      Order.countDocuments({ 'cjData.tracking.lastUpdate': { $gte: since } }),
    ]);

    const lastDelivered = await Order.findOne({ deliveredAt: { $exists: true } })
      .sort({ deliveredAt: -1 })
      .select('deliveredAt trackingNumber')
      .lean();

    return NextResponse.json(successResponse({
      since,
      stripe: {
        last: lastStripe?.updatedAt || null,
        count24h: stripeCount24h,
      },
      cjOrder: {
        last: lastCjOrder?.cjData?.lastWebhookUpdate || lastCjOrder?.updatedAt || null,
        orderId: lastCjOrder?.cjOrderId || null,
        orderNumber: lastCjOrder?.cjOrderNumber || null,
        count24h: cjOrderCount24h,
      },
      cjLogistics: {
        last: lastCjLogistics?.cjData?.tracking?.lastUpdate || null,
        trackingNumber: lastCjLogistics?.trackingNumber || lastCjLogistics?.cjData?.tracking?.trackingNumber || null,
        carrier: lastCjLogistics?.trackingCarrier || lastCjLogistics?.cjData?.tracking?.logisticName || null,
        count24h: cjLogisticsCount24h,
      },
      delivered: {
        last: lastDelivered?.deliveredAt || null,
        trackingNumber: lastDelivered?.trackingNumber || null,
      },
    }));
  } catch (error: any) {
    logger.error('Webhook health error:', error);
    return sendErrorResponse('INTERNALerror', error.message || 'Internal error');
  }
}

import { NextResponse, NextRequest } from 'next/server';
import logger from '@/lib/logger';
import { withAuth } from '@/lib/auth-middleware';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { authOptions } from '@/lib/auth';
import { generateInvoicePDF, InvoiceData } from '@/lib/pdf';
import { sendErrorResponse } from '@/lib/errors';

export const GET = withAuth(async (
  request: NextRequest,
  session,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    await dbConnect();

    // Récupérer la commande
    const order = await Order.findById(id)
      .populate('user')
      .populate('items.product')
      .lean();

    if (!order) {
      return sendErrorResponse('NOT_FOUND', 'Commande non trouvée');
    }

    // Vérifier que c'est l'utilisateur propriétaire de la commande ou un admin
    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === 'admin';
    const isOwner = order.user._id.toString() === userId;

    if (!isAdmin && !isOwner) {
      return sendErrorResponse('FORBIDDEN', 'Accès refusé');
    }

    // Vérifier que le paiement a été confirmé
    if (order.paymentStatus !== 'paid') {
      return sendErrorResponse('INVALID_INPUT', 'La facture n\'est disponible que pour les commandes payées');
    }

    // Préparer les données pour la facture
    const shippingCost = (order as any).shippingCost || 0;
    const addr = order.shippingAddress as any;
    const itemsSubtotal = order.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const couponDiscount = order.coupon?.discount || 0;
    const computedTotal = itemsSubtotal + shippingCost - couponDiscount;

    const invoiceData: InvoiceData = {
      orderNumber: order._id.toString().slice(-8).toUpperCase(),
      orderDate: order.createdAt,
      clientName: addr.fullName,
      clientEmail: (order.user as any).email,
      clientPhone: addr.phone || '',
      shippingAddress: {
        fullName: addr.fullName,
        street: addr.address || addr.street || '',
        city: addr.city,
        postalCode: addr.postalCode,
        country: addr.country,
      },
      items: order.items.map((item: any) => ({
        name: item.product?.name || item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: itemsSubtotal,
      coupon: order.coupon
        ? {
            code: order.coupon.code,
            discount: order.coupon.discount,
          }
        : undefined,
      shippingCost: shippingCost > 0 ? shippingCost : undefined,
      total: order.totalAmount ?? computedTotal,
      paymentStatus: order.paymentStatus,
    };

    // Générer le PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Retourner le PDF
    const response = new Response(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture-${invoiceData.orderNumber}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    return response;
  } catch (error: any) {
    logger.error('Erreur génération facture:', error);
    return sendErrorResponse('INTERNALerror', error.message || 'Erreur lors de la génération de la facture');
  }
});

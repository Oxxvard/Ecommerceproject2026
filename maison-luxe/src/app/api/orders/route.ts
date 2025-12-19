import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { withBodyValidation } from '@/lib/validation';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { authOptions } from '@/lib/auth';
import { ShippingAddressSchema } from '@/lib/schemas';
import { errorResponse, formatZodError, sendErrorResponse, sendCustomError, successResponse } from '@/lib/errors';
import logger from '@/lib/logger';

export const GET = withAuth(async (request: NextRequest, session) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const query: any = {};

    // Si admin, peut voir toutes les commandes, sinon uniquement les siennes
    if ((session.user as any).role !== 'admin') {
      query.user = (session.user as any).id;
    } else if (userId) {
      query.user = userId;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort('-createdAt')
      .lean();

    return NextResponse.json(successResponse(orders));
  } catch (error) {
    logger.error('Erreur récupération commandes:', error);
    return sendErrorResponse('INTERNALerror', 'Erreur lors de la récupération des commandes');
  }
});

const OrderPayloadSchema = z.object({
  items: z.array(z.object({
    product: z.string().min(1, 'Produit requis'),
    quantity: z.number().int('Quantité invalide').min(1, 'Quantité minimale 1'),
    image: z.string().optional(),
  })).min(1, 'Panier vide'),
  shippingAddress: ShippingAddressSchema,
  shippingCost: z.number().nonnegative().optional().default(0),
  coupon: z.object({ code: z.string().trim().min(1, 'Code requis'), discount: z.number().nonnegative() }).optional(),
});

export const POST = withAuth(withBodyValidation(OrderPayloadSchema, async (request: NextRequest, session, data) => {
  try {
    await dbConnect();
    data = { ...data, user: (session.user as any).id };

    // Sécurité: reconstruire prix et total côté serveur
    if (!Array.isArray(data.items) || data.items.length === 0) {
      return sendCustomError(400, 'INVALID_CART', 'Panier vide');
    }

    const ids = Array.from(new Set(data.items.map((it: any) => it.product))).filter(Boolean);
    const products = await Product.find({ _id: { $in: ids } }).lean();
    const pmap = new Map(products.map((p: any) => [p._id.toString(), p]));

    const normalizedItems: any[] = [];
    for (const it of data.items) {
      const pid = it.product?.toString();
      const p = pid ? pmap.get(pid) : null;
      if (!p) {
        return sendErrorResponse('NOT_FOUND', `Produit introuvable: ${pid || 'inconnu'}`);
      }
      const qty = Math.max(1, Number(it.quantity || 1));
      normalizedItems.push({
        product: p._id,
        name: p.name,
        price: p.price,
        quantity: qty,
        image: Array.isArray(p.images) && p.images.length ? p.images[0] : it.image,
      });
    }

    // Calculer le sous-total (avant coupon et livraison)
    const subtotal = normalizedItems.reduce((sum, it) => sum + Number(it.price) * it.quantity, 0);
    
    // Ajouter frais de livraison s'il y en a
    const shippingCost = (data.shippingCost || 0);
    
    // Calculer le total final (après coupon et livraison)
    const couponDiscount = data.coupon?.discount || 0;
    const totalAmount = Math.max(subtotal + shippingCost - couponDiscount, 0);

    const order = await Order.create({
      user: data.user,
      items: normalizedItems,
      totalAmount,
      shippingAddress: data.shippingAddress,
      shippingCost,
      status: 'pending',
      paymentStatus: 'pending',
      coupon: data.coupon,
    });

    // Si un coupon a été appliqué, mettre à jour son utilisation
    if (data.coupon?.code) {
      await Coupon.findOneAndUpdate(
        { code: data.coupon.code },
        { 
          $inc: { usageCount: 1 },
          $addToSet: { usedBy: data.user }
        }
      );
    }

    return NextResponse.json(successResponse(order), { status: 201 });
  } catch (error: any) {
    logger.error('Erreur création commande:', error);
    return sendErrorResponse('INTERNALerror', error.message || 'Erreur lors de la création de la commande');
  }
}));

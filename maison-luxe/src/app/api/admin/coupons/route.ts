import { NextResponse, NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import logger from '@/lib/logger';
import { CreateCouponSchema } from '@/lib/schemas';
import { errorResponse, formatZodError, sendErrorResponse, sendCustomError, successResponse } from '@/lib/errors';
// import { requireAdmin } from '@/lib/auth-middleware';

// GET - Liste tous les coupons (admin seulement)
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  await dbConnect();

  const coupons = await Coupon.find({})
    .sort({ createdAt: -1 })
    .populate('applicableCategories', 'name')
    .populate('applicableProducts', 'name')
    .lean();

  return NextResponse.json(successResponse(coupons));
}

// POST - Créer un nouveau coupon (admin seulement)
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const data = await request.json();
  // Validation avec Zod
  const validation = CreateCouponSchema.safeParse(data);
  if (!validation.success) {
    return sendCustomError(400, 'VALIDATIONerror', 'Données invalides');
  }

  await dbConnect();

  // Vérifier si le code existe déjà
  const existingCoupon = await Coupon.findOne({ code: validation.data.code.toUpperCase() });
  if (existingCoupon) {
    return sendCustomError(409, 'COUPON_EXISTS', 'Ce code promo existe déjà');
  }

  // Créer le coupon
  const coupon = await Coupon.create({
    ...validation.data,
    code: validation.data.code.toUpperCase(),
  });

  return NextResponse.json(successResponse(coupon), { status: 201 });
}

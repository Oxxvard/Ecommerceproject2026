import { NextResponse, NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth-middleware';
import { withBodyValidation } from '@/lib/validation';
import { UpdateCouponSchema } from '@/lib/schemas';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import logger from '@/lib/logger';
import { sendErrorResponse, sendCustomError, successResponse } from '@/lib/errors';

// GET - Détails d'un coupon
export const GET = withAdminAuth(async (
  request: NextRequest,
  _session,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    await dbConnect();

    const coupon = await Coupon.findById(id)
      .populate('applicableCategories', 'name')
      .populate('applicableProducts', 'name')
      .lean();

    if (!coupon) {
      return sendCustomError(404, 'COUPON_NOT_FOUND', 'Coupon non trouvé');
    }

    return NextResponse.json(successResponse(coupon));
  } catch (error: any) {
    logger.error('Error fetching coupon:', error);
    return sendErrorResponse('INTERNALerror', error.message || 'Erreur lors de la récupération du coupon');
  }
});

// PUT - Modifier un coupon
export const PUT = withAdminAuth(withBodyValidation(UpdateCouponSchema, async (
  request: NextRequest,
  _session,
  data,
  ctx
) => {
  try {
    const { id } = await ctx.params;
    await dbConnect();

    // Si on change le code, vérifier qu'il n'existe pas déjà
    if (data.code) {
      const existingCoupon = await Coupon.findOne({ 
        code: data.code.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingCoupon) {
        return sendCustomError(400, 'COUPON_ALREADY_EXISTS', 'Ce code promo existe déjà');
      }
      data.code = data.code.toUpperCase();
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return sendCustomError(404, 'COUPON_NOT_FOUND', 'Coupon non trouvé');
    }

    return NextResponse.json(successResponse(coupon));
  } catch (error: any) {
    logger.error('Error updating coupon:', error);
    return sendErrorResponse('INTERNALerror', error.message || 'Erreur lors de la mise à jour du coupon');
  }
}));

// DELETE - Supprimer un coupon
export const DELETE = withAdminAuth(async (
  request: NextRequest,
  _session,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    await dbConnect();

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return sendErrorResponse('NOT_FOUND', 'Coupon non trouvé');
    }

    return NextResponse.json(successResponse({ message: 'Coupon supprimé avec succès' }));
  } catch (error: any) {
    logger.error('Error deleting coupon:', error);
    return sendErrorResponse('INTERNALerror', error.message || 'Erreur lors de la suppression du coupon');
  }
});

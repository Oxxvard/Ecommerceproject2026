import { NextResponse, NextRequest } from 'next/server';
import logger from '@/lib/logger';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { errorResponse, formatZodError, sendErrorResponse, sendCustomError } from '@/lib/errors';
import { withBodyValidation } from '@/lib/validation';

// POST - Valider un code promo (public, appelé depuis checkout)
export const POST = withBodyValidation(z.object({
  code: z.string().trim().min(1, 'Code requis'),
  cartTotal: z.number().nonnegative('Montant invalide'),
  userId: z.string().trim().optional(),
  cartItems: z.array(z.object({
    productId: z.string().trim().optional(),
    category: z.string().trim().optional(),
  })).optional(),
}), async (request: NextRequest, _session, data) => {
  try {
    const { code, cartTotal, userId, cartItems = [] } = data;

    await dbConnect();

    // Trouver le coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    }).lean();

    if (!coupon) {
      return sendCustomError(404, 'COUPON_NOT_FOUND', 'Code promo invalide');
    }

    // Vérifier la date de début
    if (coupon.startDate && new Date() < new Date(coupon.startDate)) {
      return sendCustomError(400, 'COUPON_NOT_STARTED', 'Ce code promo n\'est pas encore actif');
    }

    // Vérifier la date d'expiration
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return sendCustomError(400, 'COUPON_EXPIRED', 'Ce code promo a expiré');
    }

    // Vérifier le montant minimum
    if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
      return sendCustomError(400, 'COUPON_MIN_PURCHASE', `Montant minimum de ${coupon.minPurchase.toFixed(2)}€ requis`);
    }

    // Vérifier la limite d'utilisation globale
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return sendCustomError(400, 'COUPON_USAGE_LIMIT', 'Ce code promo a atteint sa limite d\'utilisation');
    }

    // Vérifier si l'utilisateur l'a déjà utilisé
    if (userId && coupon.usedBy && coupon.usedBy.some((id: any) => id.toString() === userId)) {
      return sendCustomError(400, 'COUPON_ALREADY_USED', 'Vous avez déjà utilisé ce code promo');
    }

    // Vérifier les catégories/produits applicables
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      const hasApplicableCategory = cartItems?.some((item: any) =>
        coupon.applicableCategories?.some((catId: any) => 
          catId.toString() === item.category?.toString()
        )
      );
      if (!hasApplicableCategory) {
        return sendCustomError(400, 'COUPON_NOT_APPLICABLE', 'Ce code ne s\'applique pas aux produits de votre panier');
      }
    }

    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const hasApplicableProduct = cartItems?.some((item: any) =>
        coupon.applicableProducts?.some((prodId: any) => 
          prodId.toString() === item.productId?.toString()
        )
      );
      if (!hasApplicableProduct) {
        return sendCustomError(400, 'COUPON_NOT_APPLICABLE', 'Ce code ne s\'applique pas aux produits de votre panier');
      }
    }

    // Calculer la réduction
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (cartTotal * coupon.value) / 100;
      // Appliquer le maximum si défini
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      // fixed
      discount = coupon.value;
    }

    // S'assurer que la réduction ne dépasse pas le total
    discount = Math.min(discount, cartTotal);

    return NextResponse.json({
      valid: true,
      discount: Number(discount.toFixed(2)),
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description,
    });
  } catch (error: any) {
    logger.error('Error validating coupon:', error);
    return sendErrorResponse('INTERNALerror', error.message || 'Erreur lors de la validation du code promo');
  }
});

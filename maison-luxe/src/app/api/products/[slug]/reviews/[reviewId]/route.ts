import { NextResponse, NextRequest } from 'next/server';
import logger from '@/lib/logger';
import { sendErrorResponse, sendCustomError } from '@/lib/errors';
import { withAuth } from '@/lib/auth-middleware';
import { withBodyValidation } from '@/lib/validation';
import { UpdateReviewSchema } from '@/lib/schemas';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { authOptions } from '@/lib/auth';

export const PATCH = withAuth(withBodyValidation(UpdateReviewSchema, async (
  request: NextRequest,
  session,
  data,
  ctx
) => {
  try {
    await dbConnect();
    const { reviewId } = await ctx.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return sendCustomError(404, 'REVIEW_NOT_FOUND', 'Avis non trouvé');
    }

    // Vérifier que l'utilisateur est bien l'auteur
    if (review.user.toString() !== (session.user as any).id) {
      return sendErrorResponse('FORBIDDEN', 'Non autorisé');
    }

    const { rating, comment } = data as any;

    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Recalculer la note moyenne du produit
    const reviews = await Review.find({ product: review.product });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(review.product, {
      rating: avgRating,
    });

    return NextResponse.json(review);
  } catch (error: any) {
    logger.error('Erreur modification avis:', error);
    return sendErrorResponse('INTERNALerror', error.message || 'Erreur lors de la modification de l\'avis');
  }
}));
export const DELETE = withAuth(async (
  request: NextRequest,
  session,
  { params }: { params: Promise<{ slug: string; reviewId: string }> }
) => {
  try {
    await dbConnect();
    const { reviewId } = await params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return sendCustomError(404, 'REVIEW_NOT_FOUND', 'Avis non trouvé');
    }

    // Vérifier que l'utilisateur est bien l'auteur
    if (review.user.toString() !== (session.user as any).id) {
      return sendErrorResponse('FORBIDDEN', 'Non autorisé');
    }

    const productId = review.product;

    await Review.findByIdAndDelete(reviewId);

    // Recalculer la note moyenne du produit
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviewCount: reviews.length,
    });

    return NextResponse.json({ message: 'Avis supprimé avec succès' });
  } catch (error: any) {
    logger.error('Erreur suppression avis:', error);
    return sendErrorResponse('INTERNALerror', error.message || 'Erreur lors de la suppression de l\'avis');
  }
});

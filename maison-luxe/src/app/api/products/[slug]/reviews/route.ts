import { NextResponse, NextRequest } from 'next/server';
import logger from '@/lib/logger';
import { sendErrorResponse, sendCustomError } from '@/lib/errors';
import { withAuth } from '@/lib/auth-middleware';
import { withBodyValidation } from '@/lib/validation';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const { slug } = await params;

    const product = await Product.findOne({ slug });

    if (!product) {
      return sendCustomError(404, 'PRODUCT_NOT_FOUND', 'Produit non trouvé');
    }

    const reviews = await Review.find({ product: product._id })
      .populate('user', 'name')
      .sort('-createdAt')
      .lean();

    return NextResponse.json(reviews);
  } catch (error) {
    logger.error('Erreur récupération avis:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avis' },
      { status: 500 }
    );
  }
}

const ReviewPayload = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
});

export const POST = withAuth(withBodyValidation(ReviewPayload, async (
  request: NextRequest,
  session,
  data,
  ctx
) => {
  try {
    await dbConnect();
    const { slug } = await ctx.params;
    const product = await Product.findOne({ slug });

    if (!product) {
      return sendCustomError(404, 'PRODUCT_NOT_FOUND', 'Produit non trouvé');
    }

    const { rating, comment } = data;

    const review = await Review.create({
      product: product._id,
      user: (session.user as any).id,
      userName: session.user?.name,
      rating,
      comment,
    });

    // Mettre à jour la note moyenne du produit
    const reviews = await Review.find({ product: product._id });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(product._id, {
      rating: avgRating,
      reviewCount: reviews.length,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    logger.error('Erreur création avis:', error);
    
    if (error.code === 11000) {
      return sendCustomError(400, 'ALREADY_REVIEWED', 'Vous avez déjà laissé un avis pour ce produit');
    }

    return sendErrorResponse('INTERNALerror', error.message || 'Erreur lors de la création de l\'avis');
  }
}));

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/auth-middleware';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import logger from '@/lib/logger';
import { successResponse, sendErrorResponse } from '@/lib/errors';

export const GET = withAdminAuth(async (request: NextRequest, _session) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const reviews = await Review.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      userName: (review.user as any)?.name || 'Utilisateur',
      createdAt: review.createdAt
    }));

    return NextResponse.json(successResponse(formattedReviews));

  } catch (error) {
    logger.error('Error fetching recent reviews:', error);
    return sendErrorResponse('INTERNALerror', 'Erreur lors de la récupération des avis récents');
  }
});

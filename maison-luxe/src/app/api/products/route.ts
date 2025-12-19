import { NextResponse, NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth-middleware';
import { withBodyValidation } from '@/lib/validation';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { CreateProductSchema } from '@/lib/schemas';
import { errorResponse, formatZodError, sendErrorResponse, sendCustomError } from '@/lib/errors';
import logger from '@/lib/logger';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // S'assurer que le modèle Category est chargé
    if (!Category) {
      throw new Error('Category model not loaded');
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort') || '-createdAt';
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .limit(limit)
      .select('-__v')
      .lean();

    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    logger.error('Erreur récupération produits:', error);
    return sendErrorResponse('INTERNALerror', 'Erreur lors de la récupération des produits');
  }
}

export const POST = withAdminAuth(withBodyValidation(CreateProductSchema, async (request: NextRequest, _session, data) => {
  try {
    await dbConnect();

    const product = await Product.create(data);

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    logger.error('Erreur création produit:', error);
    return sendErrorResponse('INTERNALerror', 'Erreur lors de la création du produit');
  }
}));

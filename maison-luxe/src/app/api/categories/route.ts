import { NextResponse, NextRequest } from 'next/server';
import logger from '@/lib/logger';
import { withAdminAuth } from '@/lib/auth-middleware';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import { CreateCategorySchema } from '@/lib/schemas';
import { errorResponse, formatZodError } from '@/lib/errors';

export async function GET() {
  try {
    await dbConnect();

    const categories = await Category.find({}).sort('name').select('-__v').lean();

    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    logger.error('Erreur récupération catégories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(async (request: NextRequest, _session) => {
  try {
    await dbConnect();

    const body = await request.json();
    const validation = CreateCategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATIONerror', 'Données invalides', formatZodError(validation.error)),
        { status: 400 }
      );
    }

    const category = await Category.create(validation.data);

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    logger.error('Erreur création catégorie:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_SERVERerror', 'Erreur lors de la création de la catégorie'),
      { status: 500 }
    );
  }
});

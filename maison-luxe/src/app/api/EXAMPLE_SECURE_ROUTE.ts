/**
 * EXEMPLE: Route API protégée avec validation
 * À adapter et dupliquer pour toutes vos routes
 * 
 * Patterns:
 * - POST /api/example/create
 * - PUT /api/example/[id]
 * - DELETE /api/example/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { withAdminAuth } from '@/lib/auth-middleware';
import { CreateProductSchema, UpdateProductSchema } from '@/lib/schemas';
import { errorResponse, successResponse, formatZodError } from '@/lib/errors';
import { rateLimitMiddleware } from '@/lib/rate-limit';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

/**
 * GET /api/products - Récupérer tous les produits
 * Public endpoint, pas de protection requise
 */
export async function GET(request: NextRequest) {
  // Rate limiting optionnel
  const rateLimitResult = await rateLimitMiddleware(request);
  if (rateLimitResult) return rateLimitResult;

  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const featured = searchParams.get('featured') === 'true';

    // Validation de pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        errorResponse('VALIDATIONerror', 'Paramètres de pagination invalides'),
        { status: 400 }
      );
    }

    const query = featured ? { featured: true } : {};
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json(
      successResponse({
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }),
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('❌ Erreur GET /api/products:', error);
    return NextResponse.json(
      errorResponse('INTERNALerror', 'Erreur lors de la récupération des produits'),
      { status: 500 }
    );
  }
}

/**
 * POST /api/products - Créer un produit (ADMIN ONLY)
 */
export const POST = withAdminAuth(async (request, session) => {
  // Rate limiting pour les POST
  const rateLimitResult = await rateLimitMiddleware(request);
  if (rateLimitResult) return rateLimitResult;

  try {
    await dbConnect();

    const body = await request.json();

    // Valider avec Zod
    const validation = CreateProductSchema.safeParse(body);

    if (!validation.success) {
      const errors = formatZodError(validation.error);
      return NextResponse.json(
        errorResponse(
          'VALIDATIONerror',
          'Les données soumises sont invalides',
          errors
        ),
        { status: 400 }
      );
    }

    const data = validation.data;

    // Vérifier si le slug existe déjà
    const existingProduct = await Product.findOne({ slug: data.slug });
    if (existingProduct) {
      return NextResponse.json(
        errorResponse('ALREADY_EXISTS', 'Un produit avec ce slug existe déjà'),
        { status: 409 }
      );
    }

    // Créer le produit
    const product = new Product({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await product.save();

    logger.info(`✅ Produit créé: ${product._id} par ${session.user.email}`);

    return NextResponse.json(
      successResponse(product),
      { status: 201 }
    );
  } catch (error: any) {
    logger.error('❌ Erreur POST /api/products:', error);
    return NextResponse.json(
      errorResponse('INTERNALerror', 'Erreur lors de la création du produit'),
      { status: 500 }
    );
  }
});

/**
 * PUT /api/products/[slug] - Mettre à jour un produit (ADMIN ONLY)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Vérifier l'authentification admin
  const authResult = await (await import('@/lib/auth-middleware'))
    .requireAdmin(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // Rate limiting pour les PUT
  const rateLimitResult = await rateLimitMiddleware(request);
  if (rateLimitResult) return rateLimitResult;

  try {
    await dbConnect();

    const body = await request.json();

    // Valider avec Zod
    const validation = UpdateProductSchema.safeParse(body);

    if (!validation.success) {
      const errors = formatZodError(validation.error);
      return NextResponse.json(
        errorResponse(
          'VALIDATIONerror',
          'Les données soumises sont invalides',
          errors
        ),
        { status: 400 }
      );
    }

    const data = validation.data;

    // Trouver et mettre à jour le produit
    const product = await Product.findOneAndUpdate(
      { slug: params.slug },
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Produit non trouvé'),
        { status: 404 }
      );
    }

    logger.info(`✅ Produit mis à jour: ${product._id}`);

    return NextResponse.json(
      successResponse(product),
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('❌ Erreur PUT /api/products:', error);
    return NextResponse.json(
      errorResponse('INTERNALerror', 'Erreur lors de la mise à jour du produit'),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[slug] - Supprimer un produit (ADMIN ONLY)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Vérifier l'authentification admin
  const authResult = await (await import('@/lib/auth-middleware'))
    .requireAdmin(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // Rate limiting pour les DELETE
  const rateLimitResult = await rateLimitMiddleware(request);
  if (rateLimitResult) return rateLimitResult;

  try {
    await dbConnect();

    const product = await Product.findOneAndDelete({ slug: params.slug });

    if (!product) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'Produit non trouvé'),
        { status: 404 }
      );
    }

    logger.info(`✅ Produit supprimé: ${product._id}`);

    return NextResponse.json(
      successResponse({ id: product._id }),
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('❌ Erreur DELETE /api/products:', error);
    return NextResponse.json(
      errorResponse('INTERNALerror', 'Erreur lors de la suppression du produit'),
      { status: 500 }
    );
  }
}

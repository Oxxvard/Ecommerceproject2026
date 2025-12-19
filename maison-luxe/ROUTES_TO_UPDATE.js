#!/usr/bin/env node

/**
 * Aide-mémoire pour mettre à jour les routes existantes
 * Patterns à copier-coller pour chaque route
 */

// ==========================================
// PATTERN 1: Route protégée ADMIN
// ==========================================

const PATTERN_ADMIN_ROUTE = `
import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/auth-middleware';
import { CreateProductSchema } from '@/lib/schemas';
import { errorResponse, successResponse, formatZodError } from '@/lib/errors';
import { rateLimitMiddleware } from '@/lib/rate-limit';
import dbConnect from '@/lib/mongodb';

export const POST = withAdminAuth(async (request, session) => {
  // Rate limiting
  const rateLimitResult = await rateLimitMiddleware(request);
  if (rateLimitResult) return rateLimitResult;

  try {
    await dbConnect();
    const body = await request.json();

    // Validation
    const validation = CreateProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATIONerror', 'Données invalides', formatZodError(validation.error)),
        { status: 400 }
      );
    }

    const data = validation.data;
    // Votre logique ici...

    return NextResponse.json(successResponse(result), { status: 201 });
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json(
      errorResponse('INTERNALerror', error.message),
      { status: 500 }
    );
  }
});
`;

// ==========================================
// PATTERN 2: Route protégée USER
// ==========================================

const PATTERN_USER_ROUTE = `
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { CreateReviewSchema } from '@/lib/schemas';
import { errorResponse, successResponse, formatZodError } from '@/lib/errors';
import { rateLimitMiddleware } from '@/lib/rate-limit';

export const POST = withAuth(async (request, session) => {
  const rateLimitResult = await rateLimitMiddleware(request);
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await request.json();
    const validation = CreateReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATIONerror', 'Données invalides', formatZodError(validation.error)),
        { status: 400 }
      );
    }

    // Votre logique...
    return NextResponse.json(successResponse(result), { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('INTERNALerror', error.message),
      { status: 500 }
    );
  }
});
`;

// ==========================================
// PATTERN 3: Route publique
// ==========================================

const PATTERN_PUBLIC_ROUTE = `
import { NextRequest, NextResponse } from 'next/server';
import { PaginationSchema } from '@/lib/schemas';
import { errorResponse, successResponse } from '@/lib/errors';
import { rateLimitMiddleware } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await rateLimitMiddleware(request);
  if (rateLimitResult) return rateLimitResult;

  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    // Validation optionnelle
    const validation = PaginationSchema.safeParse({ page, limit });
    if (!validation.success) {
      return NextResponse.json(
        errorResponse('VALIDATIONerror', 'Paramètres invalides'),
        { status: 400 }
      );
    }

    // Votre logique...
    return NextResponse.json(successResponse(result), { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('INTERNALerror', error.message),
      { status: 500 }
    );
  }
}
`;

// ==========================================
// LISTE DES ROUTES À METTRE À JOUR
// ==========================================

const ROUTES_TO_UPDATE = [
  // ADMIN
  {
    path: 'src/app/api/admin/products/route.ts',
    type: 'ADMIN',
    methods: ['GET', 'POST'],
    schema: 'CreateProductSchema',
    priority: 'HAUTE',
  },
  {
    path: 'src/app/api/admin/products/[slug]/route.ts',
    type: 'ADMIN',
    methods: ['PUT', 'DELETE'],
    schema: 'UpdateProductSchema',
    priority: 'HAUTE',
  },
  {
    path: 'src/app/api/admin/coupons/route.ts',
    type: 'ADMIN',
    methods: ['GET', 'POST'],
    schema: 'CreateCouponSchema',
    priority: 'HAUTE',
  },
  {
    path: 'src/app/api/admin/coupons/[id]/route.ts',
    type: 'ADMIN',
    methods: ['PUT', 'DELETE'],
    schema: 'UpdateCouponSchema',
    priority: 'HAUTE',
  },
  {
    path: 'src/app/api/admin/categories/route.ts',
    type: 'ADMIN',
    methods: ['GET', 'POST'],
    schema: 'CreateCategorySchema',
    priority: 'HAUTE',
  },

  // USER AUTH
  {
    path: 'src/app/api/auth/register/route.ts',
    type: 'PUBLIC',
    methods: ['POST'],
    schema: 'RegisterSchema',
    priority: 'CRITIQUE',
    notes: 'Ajouter rate limiting strict',
  },
  {
    path: 'src/app/api/auth/signin/route.ts',
    type: 'PUBLIC',
    methods: ['POST'],
    schema: 'LoginSchema',
    priority: 'CRITIQUE',
    notes: 'Ajouter rate limiting strict',
  },

  // USER DATA
  {
    path: 'src/app/api/products/[slug]/reviews/route.ts',
    type: 'USER',
    methods: ['POST'],
    schema: 'CreateReviewSchema',
    priority: 'MOYEN',
  },
  {
    path: 'src/app/api/products/[slug]/reviews/[reviewId]/route.ts',
    type: 'USER',
    methods: ['PUT', 'DELETE'],
    schema: 'UpdateReviewSchema',
    priority: 'MOYEN',
  },
  {
    path: 'src/app/api/checkout/create/route.ts',
    type: 'USER',
    methods: ['POST'],
    schema: 'CreateOrderSchema',
    priority: 'CRITIQUE',
    notes: 'Rate limiting strict',
  },

  // PUBLIC
  {
    path: 'src/app/api/products/route.ts',
    type: 'PUBLIC',
    methods: ['GET'],
    schema: 'PaginationSchema',
    priority: 'MOYEN',
    notes: 'Déjà partiellement sécurisé',
  },
  {
    path: 'src/app/api/categories/route.ts',
    type: 'PUBLIC',
    methods: ['GET'],
    schema: 'PaginationSchema',
    priority: 'MOYEN',
  },
  {
    path: 'src/app/api/search/route.ts',
    type: 'PUBLIC',
    methods: ['GET'],
    schema: 'PaginationSchema',
    priority: 'MOYEN',
    notes: 'Ajouter rate limiting',
  },

  // CJ
  {
    path: 'src/app/api/cj/import/route.ts',
    type: 'ADMIN',
    methods: ['POST'],
    schema: 'CJImportProductSchema',
    priority: 'HAUTE',
  },
];

// ==========================================
// AFFICHER LA LISTE
// ==========================================

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║  📋 ROUTES À METTRE À JOUR - MAISON LUXE                       ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('🔴 CRITIQUE (Update immédiatement):');
const critical = ROUTES_TO_UPDATE.filter(r => r.priority === 'CRITIQUE');
critical.forEach((route, i) => {
  console.log(`  ${i + 1}. ${route.path}`);
  console.log(`     Type: ${route.type} | Schema: ${route.schema}`);
  if (route.notes) console.log(`     📝 ${route.notes}`);
  console.log('');
});

console.log('\n🟠 HAUTE (Update cette semaine):');
const high = ROUTES_TO_UPDATE.filter(r => r.priority === 'HAUTE');
high.forEach((route, i) => {
  console.log(`  ${critical.length + i + 1}. ${route.path}`);
  console.log(`     Type: ${route.type} | Schema: ${route.schema}`);
  if (route.notes) console.log(`     📝 ${route.notes}`);
  console.log('');
});

console.log('\n🟡 MOYEN (Update prochainement):');
const medium = ROUTES_TO_UPDATE.filter(r => r.priority === 'MOYEN');
medium.forEach((route, i) => {
  console.log(`  ${critical.length + high.length + i + 1}. ${route.path}`);
  console.log(`     Type: ${route.type} | Schema: ${route.schema}`);
  if (route.notes) console.log(`     📝 ${route.notes}`);
  console.log('');
});

// ==========================================
// SUMMARY
// ==========================================

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log(`║  Total routes à mettre à jour: ${ROUTES_TO_UPDATE.length}`);
console.log(`║  Critique: ${critical.length} | Haute: ${high.length} | Moyen: ${medium.length}`);
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('💡 CONSEILS DE MISE À JOUR:\n');
console.log('1. Commencer par les routes CRITIQUES');
console.log('2. Utiliser les patterns ci-dessus comme template');
console.log('3. Importer les schemas et helpers nécessaires');
console.log('4. Tester chaque route après mise à jour');
console.log('5. Vérifier les tests existants encore valides\n');

console.log('📚 Fichiers de référence:');
console.log('  - src/lib/schemas.ts - Tous les schemas');
console.log('  - src/lib/errors.ts - Codes d\'erreur');
console.log('  - src/lib/auth-middleware.ts - Protection auth');
console.log('  - src/lib/rate-limit.ts - Rate limiting');
console.log('  - src/app/api/EXAMPLE_SECURE_ROUTE.ts - Exemple complet\n');

console.log('🚀 Prochaine étape: Adapter la première route!\n');

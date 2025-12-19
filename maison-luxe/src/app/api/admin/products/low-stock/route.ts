import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/auth-middleware';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import logger from '@/lib/logger';
import { successResponse } from '@/lib/errors';

export const GET = withAdminAuth(async (request, session) => {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const threshold = parseInt(searchParams.get('threshold') || '10');

  const lowStockProducts = await Product.find({
    stock: { $lte: threshold, $gt: 0 }
  })
    .select('name slug stock')
    .sort({ stock: 1 })
    .limit(10);

  return NextResponse.json(successResponse(lowStockProducts));
});

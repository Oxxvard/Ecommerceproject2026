import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/auth-middleware';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import logger from '@/lib/logger';
import { successResponse } from '@/lib/errors';

export const GET = withAdminAuth(async (request, session) => {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const sort = searchParams.get('sort') || '-createdAt';
  const status = searchParams.get('status');

  const query: any = {};
  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .sort(sort)
    .limit(limit)
    .lean();

  return NextResponse.json(successResponse(orders));
});

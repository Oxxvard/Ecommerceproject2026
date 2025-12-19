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

  // Aggregate orders to find top-selling products
  const topProducts = await Order.aggregate([
    {
      $match: {
        status: { $in: ['processing', 'shipped', 'delivered'] }
      }
    },
    {
      $unwind: '$items'
    },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        salesCount: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    {
      $sort: { salesCount: -1 }
    },
    {
      $limit: limit
    }
  ]);

  return NextResponse.json(successResponse(topProducts));
});


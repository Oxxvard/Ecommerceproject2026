import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import Review from '@/models/Review';
import logger from '@/lib/logger';
import { withAdminAuth } from '@/lib/auth-middleware';
import { successResponse, sendErrorResponse } from '@/lib/errors';

export const GET = withAdminAuth(async (request: NextRequest, session) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    // Calculate date range
    const startDate = new Date();
    const previousStartDate = new Date();

    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        previousStartDate.setDate(previousStartDate.getDate() - 1);
        previousStartDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        previousStartDate.setDate(previousStartDate.getDate() - 14);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        previousStartDate.setMonth(previousStartDate.getMonth() - 2);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 2);
        break;
    }

    // Current period orders
    const currentOrders = await Order.find({
      createdAt: { $gte: startDate },
      paymentStatus: 'paid'
    });

    // Previous period orders for comparison
    const previousOrders = await Order.find({
      createdAt: {
        $gte: previousStartDate,
        $lt: startDate
      },
      paymentStatus: 'paid'
    });

    // Calculate stats
    const totalOrders = currentOrders.length;
    const totalRevenue = currentOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Calculate profit (price - costPrice - shippingCost for each item)
    const totalProfit = currentOrders.reduce((sum, order) => {
      const orderProfit = order.items?.reduce((itemSum: number, item: any) => {
        const price = item.price || 0;
        const costPrice = item.costPrice || 0;
        const shippingCost = item.shippingCost || 0;
        return itemSum + ((price - costPrice - shippingCost) * item.quantity);
      }, 0) || 0;
      return sum + orderProfit;
    }, 0);

    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });

    // Users stats
    const totalUsers = await User.countDocuments({ role: 'user' });
    const newUsers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startDate }
    });

    // Products stats
    const totalProducts = await Product.countDocuments();

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Revenue change
    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const revenueChange = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    // Conversion rate (mock calculation - you'd need session/visitor tracking for real data)
    const conversionRate = 2.5; // Mock value

    // Average rating
    const reviews = await Review.find();
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return NextResponse.json(successResponse({
      totalOrders,
      totalRevenue,
      totalProfit,
      profitMargin,
      pendingOrders,
      processingOrders,
      totalUsers,
      newUsers,
      totalProducts,
      averageOrderValue,
      revenueChange,
      conversionRate,
      averageRating
    }));

  } catch (error) {
    logger.error('Error fetching stats:', error);
    return sendErrorResponse('INTERNALerror', 'Erreur serveur');
  }
});


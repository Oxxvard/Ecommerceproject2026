import { NextResponse } from 'next/server';
import logger from '@/lib/logger';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    // Recherche dans le nom et la description
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    })
      .populate('category', 'name slug')
      .limit(10)
      .select('name slug price images category')
      .lean();

    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    logger.error('Search error:', error);
    return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 });
  }
}

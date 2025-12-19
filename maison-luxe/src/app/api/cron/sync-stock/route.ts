import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import logger from '@/lib/logger';
import { cjService } from '@/lib/cjdropshipping';

// Route API publique pour être appelée par un cron externe (Vercel Cron, EasyCron, etc.)
// Sécurisée par un secret token

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: Request) {
  try {
    // Vérification du token de sécurité
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'change-me-in-production';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Chercher les produits avec PID/VID
    const products = await Product.find({ 
      $or: [
        { cjPid: { $exists: true, $ne: null } },
        { cjVid: { $exists: true, $ne: null } }
      ]
    }).limit(50); // Limiter à 50 produits par exécution pour éviter timeout

    let updated = 0;
    let errors = 0;

    for (const product of products) {
      try {
        const productId = product.cjPid || product.cjVid;
        if (!productId) continue;

        await delay(1200); // Respecter rate limit CJ

        const productDataRaw = await cjService.getProductDetails(productId);

        if (productDataRaw && typeof productDataRaw === 'object') {
          const productData = productDataRaw as Record<string, any>;
          const updates: Record<string, any> = {};

          // Mettre à jour le stock
          if (productData.inventory !== undefined) {
            const inv = parseInt(String(productData.inventory) || '0');
            updates.stock = Number.isNaN(inv) ? 0 : inv;
          }

          // Mettre à jour le prix d'achat si changé
          if (productData.sellPrice) {
            const price = parseFloat(String(productData.sellPrice));
            updates.costPrice = Number.isNaN(price) ? undefined : price;
          }

          // Disponibilité
          updates.inStock = (updates.stock || 0) > 0;
          updates['cjData.lastStockUpdate'] = new Date();

          await Product.updateOne({ _id: product._id }, { $set: updates });
          updated++;
        }
      } catch (error: any) {
        logger.error(`Error syncing ${product.name}:`, error.message);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      errors,
      total: products.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Cron sync error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

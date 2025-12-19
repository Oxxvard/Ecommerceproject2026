import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { cjService } from '@/lib/cjdropshipping';
import { successResponse, sendCustomError, sendErrorResponse } from '@/lib/errors';

// Cache pour éviter les appels API répétés
const detailsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Warehouse par défaut (Cranbury, USA - l'entrepôt le plus courant)
const DEFAULT_WAREHOUSE_ID = '201e67f6ba4644c0a36d63bf4989dd70';

// GET - Obtenir les détails d'un produit CJ avec infos d'entrepôt
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ pid: string }> }
) {
  try {
    const { pid } = await context.params;

    if (!pid) {
      return sendErrorResponse('MISSING_REQUIRED_FIELD', 'Product ID is required');
    }

    // Vérifier le cache serveur
    const cached = detailsCache.get(pid);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      logger.info(`📦 Cache hit for product ${pid}`);
      return NextResponse.json(successResponse(cached.data));
    }

    // Features à récupérer
    const searchParams = request.nextUrl.searchParams;
    const features = searchParams.get('features')?.split(',') || ['enable_inventory'];

    logger.info(`🔍 Fetching details for product ${pid}`);
    const productRaw = (await cjService.getProductDetails(pid, features)) as unknown;

    if (!productRaw || typeof productRaw !== 'object') {
      return sendErrorResponse('NOT_FOUND', 'Product not found');
    }

    const product = productRaw as Record<string, any>;

    logger.info('📦 Product details keys:', Object.keys(product).slice(0, 20));

    // Debug complet : afficher TOUS les champs
    logger.info('🔍 FULL PRODUCT OBJECT:');
    logger.info(JSON.stringify(product, null, 2).substring(0, 2000));

    // Debug: afficher les champs qui contiennent "warehouse" ou "storage"
    const warehouseRelatedFields = Object.keys(product).filter(key => 
      key.toLowerCase().includes('warehouse') || 
      key.toLowerCase().includes('storage') ||
      key.toLowerCase().includes('inventory') ||
      key.toLowerCase().includes('supplier') ||
      key.toLowerCase().includes('seller')
    );
    logger.info('🏭 Warehouse/Storage/Supplier-related fields:', warehouseRelatedFields);
    warehouseRelatedFields.forEach(field => {
      logger.info(`  - ${field}:`, JSON.stringify(product[field]).substring(0, 100));
    });

    // Vérifier les variants aussi
    if (product.variants && Array.isArray(product.variants)) {
        logger.info('📦 Variants found:', product.variants.length);
      if (product.variants[0]) {
        const variantKeys = Object.keys(product.variants[0]);
          logger.info('   First variant keys:', variantKeys.slice(0, 20));
        const variantWarehouseFields = variantKeys.filter(k => 
          k.toLowerCase().includes('warehouse') || 
          k.toLowerCase().includes('storage') ||
          k.toLowerCase().includes('inventory')
        );
        if (variantWarehouseFields.length > 0) {
            logger.info('   Warehouse fields in variants:', variantWarehouseFields);
          variantWarehouseFields.forEach(field => {
              logger.info(`     - ${field}:`, JSON.stringify(product.variants[0][field]).substring(0, 100));
          });
        }
      }
    }

    // Extraire l'ID d'entrepôt depuis les champs possibles
    let warehouseId = 
      product.warehouseId || 
      product.storageId || 
      product.warehouseIdList?.[0] ||
      product.storageList?.[0]?.id ||
      product.warehouseList?.[0]?.id ||
      product.warehouseList?.[0] ||
      null;

    // Si pas d'ID trouvé, utiliser par défaut (Cranbury, USA)
    if (!warehouseId) {
      logger.warn('⚠️ No warehouse ID found, using default:', DEFAULT_WAREHOUSE_ID);
      warehouseId = DEFAULT_WAREHOUSE_ID;
    } else {
      logger.info('✅ Warehouse ID found:', warehouseId);
    }

    // Créer une réponse simple et explicite (éviter les problèmes de spread)
    const response = {
      // Copier les champs importants du produit
      pid: product.pid,
      productNameEn: product.productNameEn,
      productName: product.productName,
      productImage: product.productImage,
      productImageSet: product.productImageSet,
      sellPrice: product.sellPrice,
      description: product.description,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      variants: product.variants,
      
      // Champs personnalisés
      warehouseId, // ID d'entrepôt unifié (fallback appliqué)
      storageList: product.storageList || product.warehouseList || [],
      _source: {
        warehouseId: warehouseId === DEFAULT_WAREHOUSE_ID ? 'default' : 'api',
      },
      
      // Garder tout le reste
      ...Object.keys(product).reduce((acc, key) => {
        if (!['pid', 'productNameEn', 'productName', 'productImage', 'productImageSet', 'sellPrice', 'description', 'categoryId', 'categoryName', 'variants'].includes(key)) {
          acc[key] = product[key];
        }
        return acc;
      }, {} as any)
    };

    // Mettre en cache
    detailsCache.set(pid, { data: response, timestamp: Date.now() });

    logger.info('📤 Returning response with:');
    logger.info('   - warehouseId:', response.warehouseId);
    logger.info('   - _source:', response._source);
    logger.info('   - Has warehouseId key:', 'warehouseId' in response);
    logger.info('   - response.warehouseId === undefined:', response.warehouseId === undefined);
    
    return NextResponse.json(successResponse(response));
  } catch (error: any) {
      logger.error('CJ Product Details API Error:', error.message);
    
    // Retourner une réponse plus lisible pour les erreurs de limite
    if (error.message?.includes('Too Many Requests') || error.message?.includes('QPS limit')) {
      return sendCustomError(429, 'TOO_MANY_REQUESTS', 'Limite API atteinte. Veuillez attendre quelques secondes avant de réessayer.', { details: error.message });
    }
    return sendErrorResponse('INTERNALerror', error.message || 'Failed to get product details');
  }
}

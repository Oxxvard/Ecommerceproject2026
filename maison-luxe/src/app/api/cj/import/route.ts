import { NextRequest, NextResponse } from 'next/server';
import { cjService } from '@/lib/cjdropshipping';
import logger from '@/lib/logger';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { successResponse, sendErrorResponse } from '@/lib/errors';

// POST - Importer un produit CJ dans notre base de données
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pid, categoryId, customPrice } = body;

    if (!pid || !categoryId) {
      return sendErrorResponse('MISSING_REQUIRED_FIELD', 'Product ID and Category ID are required');
    }

    // Récupérer les détails du produit depuis CJ avec inventory
    const cjProductRaw = (await cjService.getProductDetails(pid, ['enable_inventory', 'enable_video'])) as unknown;

    if (!cjProductRaw || typeof cjProductRaw !== 'object') {
      return sendErrorResponse('NOT_FOUND', 'Product not found on CJ Dropshipping');
    }

    const cjProduct = cjProductRaw as Record<string, any>;

    logger.info('CJ Product fields:', Object.keys(cjProduct)); // Debug: voir les champs disponibles
    logger.info('Description length:', cjProduct.description?.length || 0);
    logger.info('Has description:', !!cjProduct.description);

    // Connexion MongoDB
    await dbConnect();

    // Vérifier que la catégorie existe
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Créer le slug
    const slug = cjProduct.productNameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Calculer le prix (ajouter une marge de 60-80% par défaut, ou utiliser le prix personnalisé)
    const costPrice = parseFloat(cjProduct.sellPrice || 0);
    
    let sellingPrice: number;
    if (customPrice && customPrice > costPrice) {
      // Utiliser le prix personnalisé si fourni et valide
      sellingPrice = customPrice;
    } else {
      // Sinon, appliquer la marge par défaut de 70%
      const margin = 1.7;
      sellingPrice = Math.round(costPrice * margin * 100) / 100;
    }
    
    const compareAtPrice = Math.round(sellingPrice * 1.4 * 100) / 100; // Prix barré +40%

    // Fonction pour extraire la première image d'une description HTML
    const extractImageFromHtml = (html: string): string => {
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
      const match = html?.match(imgRegex);
      return match ? match[1] : '';
    };

    // Extraire les images (API v2 peut avoir différents champs)
    // Essayer plusieurs champs possibles selon la version de l'API
    let imageUrl: any = '';
    if (cjProduct.productMainImage) {
      imageUrl = cjProduct.productMainImage;
    } else if (cjProduct.productImageSet && Array.isArray(cjProduct.productImageSet)) {
      // productImageSet est un tableau d'images
      imageUrl = cjProduct.productImageSet[0];
    } else if (cjProduct.productImage) {
      imageUrl = cjProduct.productImage;
    } else if (cjProduct.variantImage) {
      imageUrl = cjProduct.variantImage;
    } else if (cjProduct.variants && cjProduct.variants[0]?.variantImage) {
      imageUrl = cjProduct.variants[0].variantImage;
    } else if (cjProduct.description) {
      // Si aucune image principale, extraire depuis la description HTML
      imageUrl = extractImageFromHtml(cjProduct.description);
        logger.info('Image extracted from description:', imageUrl);
    }
    
      logger.info('Final image URL:', imageUrl); // Debug
    
    // Si imageUrl est encore un tableau, prendre le premier élément
    if (Array.isArray(imageUrl) && imageUrl.length > 0) {
      imageUrl = imageUrl[0];
    }
    
    const images = imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http') 
      ? [imageUrl]
      : ['/placeholder.svg']; // Fallback si pas d'image valide

    // Calculer le stock total depuis les variants
    let totalStock = 0;
    if (cjProduct.variants && cjProduct.variants.length > 0) {
      cjProduct.variants.forEach((variant: any) => {
        if (variant.inventories) {
          variant.inventories.forEach((inv: any) => {
            totalStock += inv.totalInventory || 0;
          });
        }
      });
    }

    // Créer le produit dans notre base
    const newProduct = new Product({
      name: cjProduct.productNameEn,
      slug,
      description: cjProduct.description || cjProduct.productNameEn,
      price: sellingPrice,
      compareAtPrice,
      images: images.slice(0, 5), // Max 5 images
      category: categoryId,
      stock: totalStock,
      costPrice: costPrice,
      rating: 4.5,
      reviewCount: 0,
      featured: false,
      cjProductId: pid, // Stocker l'ID CJ pour sync future
      cjPid: cjProduct.pid, // Product ID CJ
      cjVid: cjProduct.variants?.[0]?.vid || null, // Premier variant ID (pour commandes)
      cjData: {
        pid: cjProduct.pid,
        costPrice: costPrice,
        variants: cjProduct.variants || [],
      }
    });

    await newProduct.save();

    return NextResponse.json(successResponse({ product: newProduct, message: 'Product imported successfully from CJ Dropshipping' }));

  } catch (error: any) {
      logger.error('CJ Import API Error:', error);
    return sendErrorResponse('INTERNALerror', error.message || 'Failed to import product');
  }
}

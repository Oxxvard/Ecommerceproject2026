#!/usr/bin/env node

/**
 * Script pour mettre à jour automatiquement les frais de fret de tous les produits
 * Récupère les frais depuis CJ Dropshipping pour une livraison standard en France
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const API_URL = process.env.CJ_API_URL || 'https://developers.cjdropshipping.com/api2.0/v1';
const fs = require('fs');

async function getToken() {
  const cacheFile = path.join(process.cwd(), 'tmp', 'cj-token.json');
  try {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    if (cached.token && cached.expiry > Date.now()) {
      return cached.token;
    }
  } catch(e) {}
  
  const res = await fetch(`${API_URL}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: process.env.CJ_API_KEY }),
  });
  const data = await res.json();
  return data.data?.accessToken;
}

async function calculateShippingForProduct(vid, quantity = 1) {
  const token = await getToken();
  
  try {
    // Utiliser l'endpoint correct : /logistic/freightCalculate
    const res = await fetch(`${API_URL}/logistic/freightCalculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CJ-Access-Token': token,
      },
      body: JSON.stringify({
        startCountryCode: 'CN',
        endCountryCode: 'FR',
        products: [{ vid, quantity }],
      }),
    });

    const data = await res.json();
    
    if (data.code === 200 && data.data && Array.isArray(data.data)) {
      const sorted = data.data.sort((a, b) => a.logisticPrice - b.logisticPrice);
      if (sorted[0]) {
        return {
          price: sorted[0].logisticPrice,
          logistic: sorted[0].logisticName,
          deliveryTime: sorted[0].logisticAging,
        };
      }
    } else if (data.code !== 200) {
      console.log(`    API Error (${data.code}):`, data.message);
    }
  } catch (error) {
    console.error(`    Erreur pour VID ${vid}:`, error.message);
  }
  
  return null;
}

async function updateProductShippingCosts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).toArray();

    console.log(`📦 ${products.length} produit(s) à traiter\n`);

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      // Récupérer le VID principal du produit
      let vid = product.cjVid || product.cjProductId;
      
      // Si pas de VID principal, utiliser le premier colorVariant avec VID
      if (!vid && product.colorVariants && product.colorVariants.length > 0) {
        const variant = product.colorVariants.find(v => v.cjVid);
        if (variant) {
          vid = variant.cjVid;
        }
      }

      if (!vid) {
        console.log(`⏭️  ${product.name} - Pas de VID CJ`);
        skipped++;
        continue;
      }

      console.log(`🔄 ${product.name}...`);
      
      // Calculer les frais de fret
      const shipping = await calculateShippingForProduct(vid);

      if (shipping) {
        // Mettre à jour le produit
        await db.collection('products').updateOne(
          { _id: product._id },
          { 
            $set: { 
              shippingCost: shipping.price,
              'cjData.shippingInfo': {
                logistic: shipping.logistic,
                deliveryTime: shipping.deliveryTime,
                updatedAt: new Date(),
              }
            } 
          }
        );

        console.log(`   ✅ Fret: ${shipping.price.toFixed(2)}€ (${shipping.logistic}) - ${shipping.deliveryTime} jours`);
        updated++;
      } else {
        console.log(`   ⚠️  Impossible de calculer le fret`);
        skipped++;
      }

      // Pause de 1 seconde entre les requêtes pour respecter les limites API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`✅ Mise à jour complète:`);
    console.log(`   • ${updated} produit(s) mis à jour`);
    console.log(`   • ${skipped} produit(s) ignoré(s)`);
    console.log(`${'='.repeat(80)}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

console.log('🚀 Récupération des frais de fret depuis CJ...\n');
updateProductShippingCosts().catch(console.error);

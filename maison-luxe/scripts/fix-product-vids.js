// Script pour corriger les cjVid manquants en récupérant les infos depuis CJ API
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

// Import du service CJ (simplifié pour Node.js)
async function getCJAccessToken() {
  const response = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: process.env.CJ_API_KEY }),
  });
  const data = await response.json();
  if (data.code === 200) return data.data.accessToken;
  throw new Error('Failed to get CJ token');
}

async function getCJProductDetails(pid, token) {
  const response = await fetch(
    `https://developers.cjdropshipping.com/api2.0/v1/product/query?pid=${pid}`,
    {
      headers: { 'CJ-Access-Token': token },
    }
  );
  const data = await response.json();
  if (data.code === 200 && data.data) return data.data;
  return null;
}

async function fixProductVids() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Utiliser directement la collection MongoDB
    const productsCollection = mongoose.connection.db.collection('products');

    // Récupérer le token CJ
    console.log('🔑 Getting CJ API token...');
    const token = await getCJAccessToken();
    console.log('✅ CJ token obtained\n');

    // Trouver les produits sans cjVid valide
    const products = await productsCollection.find({
      $or: [
        { cjVid: { $exists: false } },
        { cjVid: null },
        { cjVid: '' }
      ],
      cjProductId: { $exists: true, $ne: null }
    }).toArray();

    console.log(`📦 Found ${products.length} products without valid cjVid\n`);

    if (products.length === 0) {
      console.log('✅ All products have valid cjVid!\n');
      return;
    }

    let fixed = 0;
    let failed = 0;

    for (const product of products) {
      try {
        console.log(`🔍 Processing: ${product.name}`);
        console.log(`   Current cjProductId: ${product.cjProductId}`);

        // Récupérer les détails depuis CJ
        const cjProduct = await getCJProductDetails(product.cjProductId, token);

        if (!cjProduct) {
          console.log(`   ❌ Product not found on CJ API\n`);
          failed++;
          continue;
        }

        // Extraire le VID du premier variant
        const firstVariant = cjProduct.variants?.[0];
        if (!firstVariant || !firstVariant.vid) {
          console.log(`   ⚠️  No variants found for this product\n`);
          failed++;
          continue;
        }

        const vid = firstVariant.vid;
        console.log(`   ✅ Found VID: ${vid}`);

        // Mettre à jour le produit directement dans MongoDB
        await productsCollection.updateOne(
          { _id: product._id },
          {
            $set: {
              cjVid: vid,
              'cjData.variants': cjProduct.variants || []
            }
          }
        );
        
        console.log(`   ✅ Updated successfully\n`);
        fixed++;

        // Pause pour respecter le rate limit CJ (1 req/sec)
        await new Promise(resolve => setTimeout(resolve, 1200));

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        failed++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 FIX SUMMARY:');
    console.log(`   ✅ Fixed: ${fixed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

fixProductVids();

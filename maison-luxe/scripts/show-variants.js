#!/usr/bin/env node

/**
 * Script pour afficher les variantes d'un produit depuis MongoDB
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function showVariants() {
  const slug = process.argv[2];

  if (!slug) {
    console.error('\n❌ Usage: node scripts/show-variants.js <SLUG>');
    console.error('\n   Exemple: node scripts/show-variants.js "rhinestone-shoulder-bag..."\n');
    process.exit(1);
  }

  try {
    // Connexion MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI non défini');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer le produit
    const db = mongoose.connection.db;
    const product = await db.collection('products').findOne({ slug });

    if (!product) {
      console.error(`❌ Produit non trouvé avec le slug: ${slug}`);
      process.exit(1);
    }

    console.log(`${'='.repeat(80)}`);
    console.log(`📌 Produit: ${product.name}`);
    console.log(`   Slug: ${product.slug}`);
    console.log(`   PID: ${product.cjPid}`);
    console.log(`${'='.repeat(80)}\n`);

    // Afficher les variantes CJ depuis cjData
    if (product.cjData?.variants && product.cjData.variants.length > 0) {
      console.log(`✓ ${product.cjData.variants.length} variante(s) CJ trouvée(s) dans cjData:\n`);

      product.cjData.variants.forEach((v, idx) => {
        console.log(`\n${idx + 1}️⃣  VID: ${v.vid}`);
        
        if (v.attr) {
          Object.entries(v.attr).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
          });
        }

        if (v.skuCode) console.log(`   SKU: ${v.skuCode}`);
        if (v.price) console.log(`   Prix: $${v.price}`);
      });
    }

    // Afficher les colorVariants de notre système
    if (product.colorVariants && product.colorVariants.length > 0) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`\n✓ ${product.colorVariants.length} variante(s) couleur configurées:\n`);

      product.colorVariants.forEach((cv, idx) => {
        console.log(`\n${idx + 1}️⃣  Couleur: ${cv.color}`);
        console.log(`   VID assigné: ${cv.cjVid || '❌ Pas assigné'}`);
        console.log(`   Images: ${cv.images?.length || 0}`);
        if (cv.images?.length) {
          cv.images.forEach((img, i) => {
            console.log(`     ${i + 1}. ${img.substring(0, 80)}...`);
          });
        }
      });
    }

    console.log(`\n${'='.repeat(80)}\n`);
    console.log('📋 RÉSUMÉ DES VIDs:\n');
    console.log('   VID 1: 1760301548246552576');
    console.log('   VID 2: 1760301548246552577');
    console.log('   VID 3: 1760301548246552578 (✓ VID actuel)\n');
    console.log('Allez au panneau admin pour assigner chaque VID à la bonne couleur.\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

showVariants().catch(console.error);

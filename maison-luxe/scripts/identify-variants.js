#!/usr/bin/env node

/**
 * Script pour identifier les VIDs de variantes de CJ Dropshipping
 * Usage: node scripts/identify-variants.js <PID>
 * Récupère le PID (Product ID) et affiche toutes les variantes avec leurs VIDs
 */

require('dotenv').config({ path: '.env.local' });
const path = require('path');

// Charger la classe CJ dynamiquement
const CJModule = require(path.join(process.cwd(), 'src/lib/cjdropshipping.ts'));
const CJDropshipping = CJModule.default || CJModule;

async function identifyVariants() {
  const pid = process.argv[2];
  
  if (!pid) {
    console.error('\n❌ Usage: node scripts/identify-variants.js <PID>');
    console.error('\n   PID = Product ID (pas VID)');
    console.error('\n   Exemple: node scripts/identify-variants.js 1760301548246552576\n');
    process.exit(1);
  }

  const cj = new CJDropshipping();

  console.log(`\n📦 Récupération des variantes pour le produit ${pid}...\n`);

  try {
    // Récupérer les détails du produit avec les variantes
    const productData = await cj.getProductDetails(pid, ['enable_combine']);
    
    if (!productData) {
      console.error('❌ Produit non trouvé');
      process.exit(1);
    }

    const product = productData;
    
    console.log(`${'='.repeat(80)}`);
    console.log(`📌 Produit: ${product.productTitle || 'N/A'}`);
    console.log(`   Product ID (PID): ${pid}`);
    console.log(`${'='.repeat(80)}\n`);

    // Afficher les variantes
    if (product.variants && product.variants.length > 0) {
      console.log(`✓ ${product.variants.length} variante(s) trouvée(s)\n`);
      
      product.variants.forEach((variant, idx) => {
        console.log(`\n--- Variante ${idx + 1} ---`);
        console.log(`VID: ${variant.vid}`);
        
        // Afficher les propriétés de la variante
        if (variant.attrs) {
          console.log(`Attributs:`);
          variant.attrs.forEach(attr => {
            console.log(`  • ${attr.attrName}: ${attr.attrValue}`);
          });
        }
        
        // Afficher l'image si disponible
        if (variant.image) {
          console.log(`Image: ${variant.image}`);
        }
        
        // Afficher le prix si disponible
        if (variant.price) {
          console.log(`Prix: $${variant.price}`);
        }
        
        // Afficher le SKU si disponible
        if (variant.skuCode) {
          console.log(`SKU: ${variant.skuCode}`);
        }
      });

      console.log(`\n${'='.repeat(80)}\n`);
      console.log('💡 Comment utiliser ces informations:\n');
      console.log('   1. Identifiez chaque variante par ses attributs (couleur, taille, etc.)');
      console.log('   2. Notez le VID correspondant à chaque variante');
      console.log('   3. Allez dans le panel admin → Éditer le produit');
      console.log('   4. Assignez le VID correct à la couleur correspondante\n');

    } else if (product.combine && product.combine.length > 0) {
      console.log(`✓ ${product.combine.length} variante(s) combinée(s) trouvée(s)\n`);
      
      product.combine.forEach((combo, idx) => {
        console.log(`\n--- Variante ${idx + 1} ---`);
        console.log(`VID: ${combo.vid}`);
        
        if (combo.attr) {
          console.log(`Attributs:`);
          Object.entries(combo.attr).forEach(([key, value]) => {
            console.log(`  • ${key}: ${value}`);
          });
        }
        
        if (combo.image) {
          console.log(`Image: ${combo.image}`);
        }
        
        if (combo.price) {
          console.log(`Prix: $${combo.price}`);
        }
        
        if (combo.skuCode) {
          console.log(`SKU: ${combo.skuCode}`);
        }
      });

      console.log(`\n${'='.repeat(80)}\n`);
      console.log('💡 Comment utiliser ces informations:\n');
      console.log('   1. Identifiez chaque variante par ses attributs (couleur, taille, etc.)');
      console.log('   2. Notez le VID correspondant à chaque variante');
      console.log('   3. Allez dans le panel admin → Éditer le produit');
      console.log('   4. Assignez le VID correct à la couleur correspondante\n');

    } else {
      console.log('❌ Aucune variante trouvée pour ce produit\n');
      console.log('Données du produit:');
      console.log(JSON.stringify(product, null, 2).split('\n').slice(0, 50).join('\n'));
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('\nVérifiez que:');
    console.error('  1. Le PID est correct');
    console.error('  2. Les variables d\'environnement CJ_API_KEY et CJ_API_URL sont configurées');
    process.exit(1);
  }
}

identifyVariants().catch(console.error);

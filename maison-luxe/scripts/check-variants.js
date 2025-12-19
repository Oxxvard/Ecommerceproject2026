#!/usr/bin/env node

/**
 * Script pour identifier les VIDs de variantes
 * Usage: node scripts/check-variants.js <PID>
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.CJ_API_KEY;
const API_URL = process.env.CJ_API_URL || 'https://developers.cjdropshipping.com/api2.0/v1';
const TOKEN_CACHE_FILE = path.join(process.cwd(), 'tmp', 'cj-token.json');

let tokenCache = { token: null, expiry: 0 };

// Charger le token depuis le cache
function loadToken() {
  try {
    if (fs.existsSync(TOKEN_CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, 'utf-8'));
      if (data.token && data.expiry > Date.now()) {
        tokenCache = data;
        return data.token;
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

// Obtenir un nouveau token
async function getToken() {
  const cached = loadToken();
  if (cached) {
    console.log('✅ Token CJ en cache');
    return cached;
  }

  console.log('🔄 Obtention d\'un nouveau token CJ...');
  
  const res = await fetch(`${API_URL}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: API_KEY }),
  });

  const data = await res.json();
  
  if (data.code === 200 && data.data?.accessToken) {
    const token = data.data.accessToken;
    const expiry = Date.now() + 23 * 60 * 60 * 1000;
    
    // Sauvegarder dans le cache
    const dir = path.dirname(TOKEN_CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify({ token, expiry }));
    
    console.log('✅ Nouveau token obtenu');
    return token;
  }

  throw new Error(data.message || 'Impossible d\'obtenir le token');
}

async function getVariants(pid) {
  const token = await getToken();

  console.log(`\n📦 Récupération des variantes pour le produit ${pid}...\n`);

  try {
    const res = await fetch(
      `${API_URL}/product/query?pid=${pid}&features=enable_combine`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'CJ-Access-Token': token,
        },
      }
    );

    const data = await res.json();

    if (data.code !== 200) {
      throw new Error(data.message || 'Erreur API');
    }

    const product = data.data;

    console.log(`${'='.repeat(80)}`);
    console.log(`📌 Produit: ${product.productTitle}`);
    console.log(`   PID: ${pid}`);
    console.log(`   Catégorie: ${product.category}`);
    console.log(`${'='.repeat(80)}\n`);

    // Afficher les variantes
    const variants = product.combine || product.variants || [];

    if (variants.length === 0) {
      console.log('❌ Aucune variante trouvée');
      return;
    }

    console.log(`✓ ${variants.length} variante(s) trouvée(s):\n`);

    variants.forEach((v, idx) => {
      console.log(`\n${idx + 1}️⃣  VID: ${v.vid}`);
      
      // Afficher les attributs
      if (v.attr) {
        Object.entries(v.attr).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      } else if (v.attrs) {
        v.attrs.forEach(attr => {
          console.log(`   ${attr.attrName}: ${attr.attrValue}`);
        });
      }

      // Afficher d'autres infos
      if (v.skuCode) console.log(`   SKU: ${v.skuCode}`);
      if (v.price) console.log(`   Prix: $${v.price}`);
      if (v.image) console.log(`   Image: ${v.image}`);
    });

    console.log(`\n${'='.repeat(80)}\n`);
    console.log('💡 Comment utiliser:\n');
    console.log('   1. Identifiez la COULEUR de chaque variante');
    console.log('   2. Notez le VID correspondant');
    console.log('   3. Allez au panneau admin → Éditer le produit');
    console.log('   4. Assignez chaque VID à la couleur correspondante\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

const pid = process.argv[2];

if (!pid) {
  console.error('\n❌ Usage: node scripts/check-variants.js <PID>');
  console.error('\n   Exemple: node scripts/check-variants.js 1760301548200415232\n');
  process.exit(1);
}

getVariants(pid).catch(console.error);

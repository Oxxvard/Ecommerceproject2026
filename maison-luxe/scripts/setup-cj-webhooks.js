#!/usr/bin/env node

/**
 * Script de configuration des webhooks CJ
 * 
 * Configure les 4 webhooks CJ pour recevoir automatiquement :
 * - Mises à jour de produits (prix, images, stock)
 * - Mises à jour de stock (disponibilité)
 * - Mises à jour de commandes (statuts)
 * - Mises à jour logistiques (tracking)
 * 
 * Usage:
 *   node scripts/setup-cj-webhooks.js
 *   node scripts/setup-cj-webhooks.js --disable  (pour désactiver)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Déterminer l'URL de base (production ou dev)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';
const CJ_API_KEY = process.env.CJ_API_KEY;
const CJ_API_URL = process.env.CJ_API_URL || 'https://developers.cjdropshipping.com/api2.0/v1';
const TOKEN_CACHE_FILE = path.join(__dirname, '..', 'tmp', 'cj-token.json');

// Type d'action : ENABLE ou CANCEL
const ACTION = process.argv.includes('--disable') ? 'CANCEL' : 'ENABLE';

// Charger le token depuis le cache
function loadTokenFromFile() {
  try {
    if (fs.existsSync(TOKEN_CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, 'utf-8'));
      if (data.token && data.expiry > Date.now()) {
        console.log('✅ Token CJ trouvé en cache (expire dans', Math.round((data.expiry - Date.now()) / 1000 / 60), 'minutes)\n');
        return data.token;
      }
    }
  } catch (error) {
    console.warn('⚠️ Impossible de charger le token depuis le cache');
  }
  return null;
}

// Fonction pour obtenir le token CJ
async function getAccessToken() {
  // Essayer d'abord le cache
  const cachedToken = loadTokenFromFile();
  if (cachedToken) {
    return cachedToken;
  }

  console.log('⏳ Aucun token en cache, obtention d\'un nouveau token...\n');
  
  try {
    const response = await fetch(`${CJ_API_URL}/authentication/getAccessToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: CJ_API_KEY,
      }),
    });

    const data = await response.json();

    if (data.code === 200 && data.data) {
      return data.data.accessToken;
    }

    throw new Error(data.message || 'Failed to get access token');
  } catch (error) {
    console.error('Erreur authentification CJ:', error);
    throw error;
  }
}

// Fonction pour configurer les webhooks
async function setWebhook(token, config) {
  try {
    const response = await fetch(`${CJ_API_URL}/webhook/set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CJ-Access-Token': token,
      },
      body: JSON.stringify(config),
    });

    const data = await response.json();

    if (data.code === 200 && data.data) {
      return data.data;
    }

    // Afficher toute la réponse pour debug
    console.error('\n🔍 Réponse CJ complète:', JSON.stringify(data, null, 2));
    throw new Error(data.message || 'Failed to set webhooks');
  } catch (error) {
    console.error('Erreur configuration webhooks:', error);
    throw error;
  }
}

async function setupWebhooks() {
  console.log('\n🔧 Configuration des webhooks CJ...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Action: ${ACTION}\n`);

  if (!CJ_API_KEY) {
    console.error('❌ Erreur: CJ_API_KEY non définie dans .env');
    process.exit(1);
  }

  try {
    const token = await getAccessToken();

    const config = {
      product: {
        type: ACTION,
        callbackUrls: [`${BASE_URL}/api/webhook/cj/product`],
      },
      stock: {
        type: ACTION,
        callbackUrls: [`${BASE_URL}/api/webhook/cj/stock`],
      },
      order: {
        type: ACTION,
        callbackUrls: [`${BASE_URL}/api/webhook/cj/order`],
      },
      logistics: {
        type: ACTION,
        callbackUrls: [`${BASE_URL}/api/webhook/cj/logistics`],
      },
    };

    console.log('Configuration à envoyer:');
    console.log(JSON.stringify(config, null, 2));
    console.log('\n⏳ Envoi de la configuration à CJ...\n');

    const result = await setWebhook(token, config);

    console.log('✅ Webhooks configurés avec succès!\n');
    console.log('Résultat:', result);

    console.log('\n📋 URLs des webhooks:');
    console.log(`  • Product:   ${BASE_URL}/api/webhook/cj/product`);
    console.log(`  • Stock:     ${BASE_URL}/api/webhook/cj/stock`);
    console.log(`  • Order:     ${BASE_URL}/api/webhook/cj/order`);
    console.log(`  • Logistics: ${BASE_URL}/api/webhook/cj/logistics`);

    if (ACTION === 'ENABLE') {
      console.log('\n⚠️  IMPORTANT:');
      console.log('  - Assure-toi que ton serveur est accessible publiquement (pas localhost)');
      console.log('  - Les endpoints doivent répondre en < 3 secondes');
      console.log('  - HTTPS est requis (TLS 1.2+)');
      console.log('  - Teste avec ngrok en dev: ngrok http 3000');
    }

    console.log('\n✨ Configuration terminée!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration des webhooks:\n');
    console.error(error);
    console.log('\n💡 Vérifications:');
    console.log('  - CJ_API_KEY est correctement définie dans .env');
    console.log('  - Ton compte CJ est actif');
    console.log('  - Les URLs sont accessibles publiquement (pas localhost)');
    console.log('  - HTTPS est activé (requis par CJ)');
    console.log('\n');
    process.exit(1);
  }
}

// Exécuter
setupWebhooks();

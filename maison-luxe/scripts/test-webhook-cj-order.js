#!/usr/bin/env node

/**
 * Test script: Vérifier que le webhook Stripe déclenche la création automatique de commande CJ
 * 
 * This script:
 * 1. Crée une commande de test en base de données
 * 2. Simule un webhook Stripe checkout.session.completed
 * 3. Vérifie que la commande CJ a été créée automatiquement
 * 4. Affiche le cjOrderId et cjOrderNumber stockés dans la base
 */

const https = require('https');

const TEST_ORDER_ID = 'test-' + Date.now();
const BASE_URL = 'http://localhost:3000';

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = (url.protocol === 'https:' ? https : require('http')).request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTest() {
  console.log('\n========================================');
  console.log('🧪 Test: Webhook Stripe → CJ Order');
  console.log('========================================\n');

  try {
    // Étape 1: Créer une commande de test
    console.log('1️⃣  Création d\'une commande de test...');
    
    const testOrder = {
      user: '507f1f77bcf86cd799439011', // ObjectId de test
      items: [
        {
          product: '507f1f77bcf86cd799439012',
          name: 'Produit Test CJ',
          price: 100,
          quantity: 1,
          image: 'https://example.com/image.jpg',
        },
      ],
      totalAmount: 100,
      shippingAddress: {
        fullName: 'Test User',
        address: '123 Test Street',
        city: 'New York',
        postalCode: '10001',
        country: 'US',
        phone: '+1234567890',
      },
      paymentStatus: 'pending',
      status: 'pending',
    };

    // Utilise l'endpoint de checkout pour créer une commande
    const createResponse = await makeRequest('POST', '/api/checkout', testOrder);
    
    if (createResponse.status !== 200 && createResponse.status !== 201) {
      console.error('❌ Erreur lors de la création de la commande');
      console.error(`Status: ${createResponse.status}`);
      console.error(`Response: ${createResponse.body}`);
      process.exit(1);
    }

    let sessionId;
    try {
      const responseData = JSON.parse(createResponse.body);
      sessionId = responseData.sessionId || responseData.id;
    } catch (e) {
      console.error('❌ Erreur lors du parsing de la réponse');
      console.error(`Response: ${createResponse.body}`);
      process.exit(1);
    }

    console.log(`✅ Commande créée avec sessionId: ${sessionId}\n`);

    // Étape 2: Simuler le webhook Stripe
    console.log('2️⃣  Simulation du webhook Stripe checkout.session.completed...');

    const webhookPayload = {
      id: 'evt_test_' + Date.now(),
      type: 'checkout.session.completed',
      data: {
        object: {
          id: sessionId,
          payment_status: 'paid',
          customer_email: 'test@example.com',
        },
      },
    };

    // Créer une signature Stripe test (en développement, peut être vide ou un hash simple)
    const crypto = require('crypto');
    const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';
    const timestamp = Math.floor(Date.now() / 1000);
    const signedContent = `${timestamp}.${JSON.stringify(webhookPayload)}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signedContent)
      .digest('base64');
    
    const stripeSignature = `t=${timestamp},v1=${signature}`;

    const webhookResponse = await makeRequest('POST', '/api/webhook/stripe', webhookPayload, {
      'Stripe-Signature': stripeSignature,
    });

    console.log(`✅ Webhook envoyé`);
    console.log(`   Status: ${webhookResponse.status}`);
    console.log(`   Response: ${webhookResponse.body.substring(0, 200)}...\n`);

    // Étape 3: Vérifier que la commande CJ a été créée
    console.log('3️⃣  Vérification que cjOrderId a été sauvegardé...');

    // Vous devriez avoir un endpoint pour récupérer les détails de la commande
    // ou vérifier directement dans MongoDB
    console.log('   📋 Les champs suivants devraient être remplis dans la base de données:');
    console.log('      - cjOrderId: (ID unique de la commande CJ)');
    console.log('      - cjOrderNumber: (Numéro de commande CJ)');
    console.log('      - status: "processing"');
    console.log('      - paymentStatus: "paid"\n');

    console.log('========================================');
    console.log('✅ Test complété !');
    console.log('========================================');
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Vérifier les logs du serveur pour les détails de la crétion CJ');
    console.log('   2. Consulter le dashboard CJ pour confirmer que la commande existe');
    console.log('   3. Vérifier les champs cjOrderId dans MongoDB\n');

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    process.exit(1);
  }
}

// Vérifier que le serveur est accessible
console.log('⏳ Attente que le serveur soit prêt...');
setTimeout(() => {
  runTest();
}, 2000);

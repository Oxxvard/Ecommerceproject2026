#!/usr/bin/env node

/**
 * Test: Simuler le webhook CJ Logistics vers /api/webhook/cj/logistics
 *
 * Usage:
 *   node scripts/test-cj-webhook-logistics.js \
 *     --trackingNumber TN123456789 \
 *     --orderId CJ_ORDER_ID \
 *     --orderNumber CJ_ORDER_NUMBER \
 *     --carrier DHL \
 *     --status Delivered
 *
 * Notes:
 *  - Vous pouvez fournir un seul identifiant (trackingNumber, orderId ou orderNumber)
 *  - BASE_URL par défaut: http://localhost:3000 (override avec env BASE_URL)
 */

const http = require('http');
const https = require('https');

function arg(key, def) {
  const i = process.argv.findIndex((a) => a === `--${key}`);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  return def;
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const payload = {
  trackingNumber: arg('trackingNumber', 'TST' + Date.now()),
  orderId: arg('orderId', undefined),
  orderNumber: arg('orderNumber', undefined),
  logisticName: arg('carrier', 'DHL'),
  trackingStatus: arg('status', 'In transit'),
  trackingFrom: 'US',
  trackingTo: 'FR',
  deliveryTime: undefined,
  deliveryDay: '5-8',
  lastMileCarrier: undefined,
  lastTrackNumber: undefined,
  trackingEvents: [
    {
      time: new Date().toISOString(),
      status: arg('status', 'In transit'),
      location: 'Sorting center',
      desc: 'Package processed',
    },
  ],
};

if (payload.trackingStatus.toLowerCase() === 'delivered') {
  payload.deliveryTime = new Date().toISOString();
}

async function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('\n🧪 Simuler CJ Logistics Webhook ->', BASE_URL, '\n');
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const res = await makeRequest('POST', '/api/webhook/cj/logistics', payload);
    console.log('\n✅ Réponse:', res.status);
    console.log(res.body);
  } catch (e) {
    console.error('❌ Erreur:', e.message);
    process.exit(1);
  }
}

run();

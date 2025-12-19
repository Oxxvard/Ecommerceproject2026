const crypto = require('crypto');

const sessionId = 'cs_test_a1DH3qPWobIvf5BEQ2MCzCv1C4T48wqdyWnsMiOm7e6rGp6LVCmAyG3hjA';
const orderId = '693bff056c458ec934626cda';

const payload = {
  id: 'evt_test_webhook',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: sessionId,
      payment_status: 'paid',
      customer_email: 'test@example.com',
    }
  }
};

const timestamp = Math.floor(Date.now() / 1000);
const payloadString = JSON.stringify(payload);
const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';

const signature = crypto
  .createHmac('sha256', secret)
  .update(`${timestamp}.${payloadString}`)
  .digest('hex');

const stripeSignature = `t=${timestamp},v1=${signature}`;

const webhookUrl = 'http://localhost:3000';

console.log('🚀 Déclenchement du webhook...\n');
console.log('Session ID:', sessionId);
console.log('Order ID:', orderId);
console.log('\n📡 Envoi du webhook à', webhookUrl + '/api/webhook/stripe\n');

fetch(webhookUrl + '/api/webhook/stripe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': stripeSignature,
  },
  body: payloadString,
})
  .then(res => {
    console.log('✅ Status:', res.status);
    return res.text();
  })
  .then(text => {
    console.log('📄 Response:', text);
    console.log('\n✨ Vérifie maintenant MongoDB:');
    console.log('   db.orders.findOne({_id: ObjectId("' + orderId + '")})');
    console.log('\n   Tu devrais voir:');
    console.log('   - paymentStatus: "paid"');
    console.log('   - status: "processing"');
    console.log('   - cjOrderId: "..." (si CJ configuré)');
  })
  .catch(err => console.error('❌ Erreur:', err.message));

#!/usr/bin/env node

/**
 * Script de test pour le service d'email
 * 
 * Usage:
 *   node scripts/test-email.js your-email@example.com
 */

require('dotenv').config();

const TEST_EMAIL = process.argv[2] || 'test@example.com';

// Mock data
const mockOrder = {
  _id: '507f1f77bcf86cd799439011',
  user: {
    email: TEST_EMAIL,
    name: 'Test User',
  },
  items: [
    {
      name: 'Montre de luxe en or',
      quantity: 1,
      price: 1299.99,
    },
    {
      name: 'Bracelet en argent',
      quantity: 2,
      price: 199.99,
    },
  ],
  totalAmount: 1699.97,
  trackingNumber: 'TRACK123456789',
  shippingAddress: {
    fullName: 'Jean Dupont',
    address: '123 Avenue des Champs-Élysées',
    city: 'Paris',
    postalCode: '75008',
    country: 'France',
  },
};

async function testEmails() {
  console.log('\n📧 Test du service d\'email\n');
  console.log(`Envoi vers: ${TEST_EMAIL}\n`);

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY non définie dans .env');
    console.log('\n💡 Ajoutez à .env: RESEND_API_KEY=re_...\n');
    process.exit(1);
  }

  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Test 1: Email de confirmation
    console.log('📨 Test 1: Email de confirmation de commande...');
    try {
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Maison Luxe <onboarding@resend.dev>',
        to: TEST_EMAIL,
        subject: `Confirmation de commande #${mockOrder._id.slice(-6)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #667eea;">Merci pour votre commande !</h1>
            <p>Bonjour ${mockOrder.user.name},</p>
            <p>Votre commande a bien été reçue et est en cours de préparation.</p>
            <h2>Récapitulatif</h2>
            ${mockOrder.items.map(item => `
              <p>${item.name} x${item.quantity} - ${item.price.toFixed(2)}€</p>
            `).join('')}
            <p><strong>Total: ${mockOrder.totalAmount.toFixed(2)}€</strong></p>
            <p>Livraison à: ${mockOrder.shippingAddress.fullName}, ${mockOrder.shippingAddress.address}, ${mockOrder.shippingAddress.postalCode} ${mockOrder.shippingAddress.city}</p>
          </div>
        `,
      });
      console.log('✅ Email envoyé');
      console.log('   ID:', result.data?.id || 'N/A');
      if (result.error) {
        console.log('   ⚠️ Erreur:', JSON.stringify(result.error));
      }
      console.log('');
    } catch (error) {
      console.error('❌ Erreur:', error.message);
      console.error('   Détails:', error);
      console.log('');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Email d'expédition
    console.log('📨 Test 2: Email de notification d\'expédition...');
    try {
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Maison Luxe <onboarding@resend.dev>',
        to: TEST_EMAIL,
        subject: `Votre commande a été expédiée ! 📦`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">Votre colis est en route !</h1>
            <p>Bonjour ${mockOrder.user.name},</p>
            <p>Votre commande #${mockOrder._id.slice(-6)} a été expédiée.</p>
            <p><strong>Numéro de suivi:</strong> ${mockOrder.trackingNumber}</p>
            <p>Livraison prévue sous 3-5 jours ouvrés.</p>
          </div>
        `,
      });
      console.log('✅ Email envoyé');
      console.log('   ID:', result.data?.id || 'N/A');
      if (result.error) {
        console.log('   ⚠️ Erreur:', JSON.stringify(result.error));
      }
      console.log('');
    } catch (error) {
      console.error('❌ Erreur:', error.message);
      console.error('   Détails:', error);
      console.log('');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Email de livraison
    console.log('📨 Test 3: Email de confirmation de livraison...');
    try {
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Maison Luxe <onboarding@resend.dev>',
        to: TEST_EMAIL,
        subject: `Colis livré avec succès ! 🎉`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">Livraison confirmée !</h1>
            <p>Bonjour ${mockOrder.user.name},</p>
            <p>Votre commande #${mockOrder._id.slice(-6)} a été livrée avec succès.</p>
            <p>Nous espérons que vous êtes satisfait de votre achat !</p>
          </div>
        `,
      });
      console.log('✅ Email envoyé');
      console.log('   ID:', result.data?.id || 'N/A');
      if (result.error) {
        console.log('   ⚠️ Erreur:', JSON.stringify(result.error));
      }
      console.log('');
    } catch (error) {
      console.error('❌ Erreur:', error.message);
      console.error('   Détails:', error);
      console.log('');
    }

    console.log('🎉 Tests terminés ! Vérifiez votre boîte email.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Exécutez: npm install resend\n');
    process.exit(1);
  }
}

testEmails();

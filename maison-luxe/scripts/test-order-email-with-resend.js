#!/usr/bin/env node

/**
 * Test complet avec l'email autorisé de Resend
 * 
 * Ce script envoie un vrai email de confirmation via Resend
 * à l'adresse email propriétaire du compte Resend: florianvial0@gmail.com
 * 
 * Usage:
 *   node scripts/test-order-email-with-resend.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const RESEND_EMAIL = 'florianvial0@gmail.com';

const userSchema = new mongoose.Schema({}, { strict: false });
const orderSchema = new mongoose.Schema({}, { strict: false });

async function testOrderEmailWithResend() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  📧 TEST COMPLET: ENVOI EMAIL AVEC RESEND AUTORISÉ         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`✉️  Cet email sera envoyé à: ${RESEND_EMAIL}\n`);

  // Vérifier les variables d'environnement
  const requiredVars = ['MONGODB_URI', 'RESEND_API_KEY'];
  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.error(`❌ Variables manquantes: ${missing.join(', ')}`);
    process.exit(1);
  }

  try {
    // Connexion MongoDB
    console.log('🔄 Connexion MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté\n');

    // Créer/récupérer utilisateur
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    let user = await User.findOne({ email: RESEND_EMAIL });

    if (!user) {
      console.log(`👤 Création utilisateur: ${RESEND_EMAIL}`);
      user = await User.create({
        email: RESEND_EMAIL,
        name: 'Test Resend',
      });
      console.log('✅ Utilisateur créé\n');
    } else {
      console.log(`✅ Utilisateur trouvé: ${user.name}\n`);
    }

    // Créer une commande de test
    const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

    const orderData = {
      user: user._id,
      items: [
        {
          name: '🕰️ Montre Cartier Automatique',
          quantity: 1,
          price: 2499.00,
          product: new mongoose.Types.ObjectId(),
        },
        {
          name: '💍 Bracelet Hermès Cuir',
          quantity: 1,
          price: 799.00,
          product: new mongoose.Types.ObjectId(),
        },
        {
          name: '👓 Lunettes Dior Polarisées',
          quantity: 1,
          price: 599.00,
          product: new mongoose.Types.ObjectId(),
        },
      ],
      totalAmount: 3897.00,
      paymentStatus: 'paid',
      status: 'processing',
      shippingAddress: {
        fullName: 'Test Client',
        address: '123 Avenue de Test',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
        phone: '+33612345678',
      },
      createdAt: new Date(),
    };

    const order = await Order.create(orderData);
    console.log(`📦 Commande créée: #${order._id.toString().slice(-8)}`);
    console.log(`💰 Montant: ${order.totalAmount}€\n`);

    // Envoyer l'email
    console.log('📧 Envoi de l\'email via Resend...');

    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Maison Luxe <onboarding@resend.dev>',
      to: RESEND_EMAIL,
      subject: `✅ Confirmation de commande #${order._id.toString().slice(-8)}`,
      html: generateBeautifulOrderEmail(order, user),
    });

    if (result.error) {
      console.error(`❌ Erreur: ${result.error.message}`);
      console.log('\nDétails:', JSON.stringify(result.error, null, 2));
      process.exit(1);
    }

    console.log('✅ Email envoyé avec succès!');
    console.log(`📨 ID d'envoi: ${result.data?.id}\n`);

    // Afficher les détails
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ SUCCÈS                               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📋 Détails de la commande:');
    console.log(`   ID: ${order._id}`);
    console.log(`   Email: ${RESEND_EMAIL}`);
    console.log(`   Montant: ${order.totalAmount}€`);
    console.log(`   Articles: ${order.items.length}`);
    console.log(`   Statut: ${order.status}`);
    console.log(`   Paiement: ${order.paymentStatus}\n`);

    console.log('📧 Email envoyé à: ' + RESEND_EMAIL);
    console.log('⏳ Vous devriez recevoir l\'email dans 1-2 minutes\n');

    console.log('🎯 Prochaines étapes:');
    console.log('   1. Vérifiez votre boîte email');
    console.log('   2. Cliquez sur "Suivre ma commande" dans l\'email');
    console.log('   3. Vérifiez les détails de la commande\n');

    console.log('💡 Statistiques de l\'email:');
    console.log('   - Template: Personnalisé dynamiquement');
    console.log('   - Fournisseur: Resend');
    console.log('   - Service: src/lib/email.ts');
    console.log('   - Fonction: emailService.sendOrderConfirmation()\n');

    // Garder MongoDB connecté pour les prochaines connexions
    await mongoose.disconnect();
    console.log('✅ MongoDB déconnecté\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('\nDétails:', error);
    process.exit(1);
  }
}

/**
 * Génère un email de commande magnifique et professionnel
 */
function generateBeautifulOrderEmail(order, user) {
  const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // À ajuster si applicable
  const total = subtotal + shipping;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      background: #f6f6f6;
      color: #333;
      line-height: 1.6;
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 60px 30px;
      text-align: center;
      color: white;
    }

    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }

    .header p {
      font-size: 16px;
      opacity: 0.9;
    }

    .content {
      padding: 40px 30px;
    }

    .order-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #f0f4ff 100%);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid #667eea;
    }

    .order-number {
      color: #667eea;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .order-date {
      color: #666;
      font-size: 13px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-top: 30px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
    }

    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
      color: #555;
    }

    .item-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .item-table thead {
      background: #f8f9fa;
    }

    .item-table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .item-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
    }

    .item-name {
      font-weight: 500;
      color: #333;
    }

    .item-qty {
      text-align: center;
      color: #666;
    }

    .item-price {
      text-align: right;
      color: #333;
      font-weight: 500;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      font-size: 14px;
      border-bottom: 1px solid #f0f0f0;
    }

    .price-row.total {
      font-size: 18px;
      font-weight: 700;
      color: #667eea;
      border-bottom: none;
      padding-top: 15px;
    }

    .price-label {
      color: #666;
    }

    .price-value {
      color: #333;
      font-weight: 600;
    }

    .price-row.total .price-value {
      color: #667eea;
    }

    .address-section {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .address-section h3 {
      font-size: 13px;
      color: #999;
      text-transform: uppercase;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .address-section p {
      color: #333;
      font-size: 14px;
      line-height: 1.8;
    }

    .next-steps {
      background: #f0f7ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .next-steps h3 {
      color: #1e40af;
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: 600;
    }

    .next-steps ul {
      list-style: none;
      padding-left: 0;
    }

    .next-steps li {
      color: #333;
      font-size: 13px;
      margin-bottom: 6px;
      padding-left: 20px;
      position: relative;
    }

    .next-steps li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
    }

    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 40px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      text-align: center;
      margin: 20px auto;
      display: block;
      width: fit-content;
      transition: all 0.3s ease;
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
    }

    .footer {
      background: #f8f9fa;
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }

    .footer-text {
      color: #666;
      font-size: 12px;
      margin-bottom: 8px;
    }

    .footer-links a {
      color: #667eea;
      text-decoration: none;
      font-size: 11px;
      margin: 0 10px;
    }

    @media (max-width: 600px) {
      .container {
        margin: 0;
        border-radius: 0;
      }
      .header {
        padding: 40px 20px;
      }
      .content {
        padding: 20px;
      }
      .footer {
        padding: 20px;
      }
      .item-table {
        font-size: 13px;
      }
      .item-table th, .item-table td {
        padding: 8px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>✅ Merci pour votre commande!</h1>
      <p>Votre paiement a été reçu avec succès</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">
        Bonjour <strong>${user.name || 'Client'}</strong>,
      </p>

      <p style="margin-bottom: 20px; color: #666;">
        Merci d'avoir choisi Maison Luxe! Votre commande a bien été enregistrée et est en cours de préparation. Vous recevrez bientôt un email de confirmation d'expédition avec le numéro de suivi.
      </p>

      <!-- Order Card -->
      <div class="order-card">
        <div class="order-number">
          #${order._id.toString().slice(-8).toUpperCase()}
        </div>
        <div class="order-date">
          ${orderDate}
        </div>
      </div>

      <!-- Items Table -->
      <h2 class="section-title">Récapitulatif de votre commande</h2>
      
      <table class="item-table">
        <thead>
          <tr>
            <th>Produit</th>
            <th class="item-qty">Qté</th>
            <th class="item-price">Prix</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td class="item-name">${item.name}</td>
              <td class="item-qty">×${item.quantity}</td>
              <td class="item-price">${(item.price * item.quantity).toFixed(2)}€</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="price-row">
        <span class="price-label">Sous-total</span>
        <span class="price-value">${subtotal.toFixed(2)}€</span>
      </div>
      ${shipping > 0 ? `
        <div class="price-row">
          <span class="price-label">Frais de port</span>
          <span class="price-value">${shipping.toFixed(2)}€</span>
        </div>
      ` : ''}
      <div class="price-row total">
        <span class="price-label">Total</span>
        <span class="price-value">${total.toFixed(2)}€</span>
      </div>

      <!-- Shipping Address -->
      <h2 class="section-title">Adresse de livraison</h2>
      <div class="address-section">
        <h3>Livraison à</h3>
        <p>
          ${order.shippingAddress.fullName}<br>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.postalCode} ${order.shippingAddress.city}<br>
          ${order.shippingAddress.country}
        </p>
      </div>

      <!-- Next Steps -->
      <div class="next-steps">
        <h3>🎯 Prochaines étapes</h3>
        <ul>
          <li>Votre commande est en cours de préparation</li>
          <li>Vous recevrez un email d'expédition (24-48h)</li>
          <li>Livraison prévue en 3-5 jours ouvrés</li>
          <li>Vous pouvez suivre votre commande à tout moment</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <a href="${process.env.NEXTAUTH_URL}/orders/${order._id}" class="cta-button">
        → Suivre ma commande
      </a>

      <p style="margin-top: 20px; color: #999; font-size: 13px; text-align: center;">
        Besoin d'aide? <a href="mailto:support@maisonluxe.com" style="color: #667eea; text-decoration: none;">Contactez-nous</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">© 2025 Maison Luxe. Tous droits réservés.</p>
      <div class="footer-links">
        <a href="${process.env.NEXTAUTH_URL}">Site Web</a>
        <a href="${process.env.NEXTAUTH_URL}/contact">Contact</a>
        <a href="${process.env.NEXTAUTH_URL}">Conditions</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

testOrderEmailWithResend();

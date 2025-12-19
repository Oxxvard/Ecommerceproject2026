#!/usr/bin/env node

const mongoose = require('mongoose');
const { Resend } = require('resend');
require('dotenv').config();

// Charger directement depuis le fichier TypeScript compilé
const Order = require('../src/models/Order.ts');
const { emailService } = require('../src/lib/email.ts');

    // Trouver une commande payée récente
    console.log('🔍 Recherche d\'une commande payée...\n');
    const order = await Order.findOne({
      paymentStatus: 'paid',
    })
      .populate('user')
      .populate('items.product')
      .lean();

    if (!order) {
      console.log('⚠️  Aucune commande payée trouvée dans la base de données');
      console.log('📝 Créez une commande et effectuez le paiement Stripe d\'abord\n');
      process.exit(0);
    }

    console.log('📦 Commande trouvée:');
    console.log(`├─ ID: ${order._id}`);
    console.log(`├─ Email: ${order.user.email}`);
    console.log(`├─ Total: ${order.totalAmount.toFixed(2)}€`);
    console.log(`├─ Articles: ${order.items.length}`);
    console.log(`└─ Email déjà envoyé: ${order.emailSent ? 'Oui' : 'Non'}\n`);

    // Tester avec Resend directement
    console.log('📧 Test 1: Envoi direct avec Resend API\n');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Maison Luxe <onboarding@resend.dev>',
      to: [order.user.email],
      subject: `🧪 TEST - Confirmation de commande #${order._id.toString().slice(-8)}`,
      html: `
        <h1>✅ Test d'envoi d'email</h1>
        <p>Commande: #${order._id.toString().slice(-8)}</p>
        <p>Total: ${order.totalAmount.toFixed(2)}€</p>
        <p>Cet email est un test pour vérifier que Resend fonctionne.</p>
      `,
    });

    if (error) {
      console.error('❌ Erreur Resend:', error);
      console.log('\n🔧 Solutions:');
      console.log('1. Vérifiez que RESEND_API_KEY est correcte');
      console.log('2. Vérifiez que EMAIL_FROM est un domaine autorisé (onboarding@resend.dev pour test)');
      console.log('3. Allez sur https://resend.com/dashboard/settings/api-keys\n');
    } else {
      console.log('✅ Email envoyé avec succès !');
      console.log(`├─ Email ID: ${data.id}`);
      console.log(`├─ Destinataire: ${order.user.email}`);
      console.log(`└─ Statut: ${data.created_at ? 'En cours d\'envoi' : 'Accepté par Resend'}\n`);
    }

    // Tester avec emailService
    console.log('📧 Test 2: Envoi via emailService.sendOrderConfirmation()\n');
    try {
      const result = await emailService.sendOrderConfirmation({
        _id: order._id,
        user: {
          email: order.user.email,
          name: order.user.name || 'Client',
        },
        items: order.items,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
      });

      console.log('✅ Email envoyé via emailService !');
      console.log(`├─ Email ID: ${result.id}`);
      console.log(`└─ Destinataire: ${order.user.email}\n`);
    } catch (emailError) {
      console.error('❌ Erreur emailService:', emailError.message, '\n');
    }

    console.log('═══════════════════════════════════════════');
    console.log('✅ Test terminé !\n');
    console.log('📧 Vérifiez votre boîte mail pour recevoir les emails de test');
    console.log('💡 Si vous ne recevez rien:');
    console.log('   1. Vérifiez le spam/promotions');
    console.log('   2. Vérifiez les logs Resend: https://resend.com/dashboard/logs');
    console.log('   3. Vérifiez que l\'adresse email existe\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

testEmail();

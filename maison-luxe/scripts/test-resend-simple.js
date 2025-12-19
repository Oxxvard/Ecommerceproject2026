#!/usr/bin/env node

const { Resend } = require('resend');
require('dotenv').config();

async function testResendEmail() {
  console.log('\n🧪 TEST D\'ENVOI D\'EMAIL AVEC RESEND\n');
  console.log('═══════════════════════════════════════════\n');

  // Vérifier la configuration
  console.log('📋 Vérification de la configuration :');
  console.log(`├─ RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Configurée' : '❌ Manquante'}`);
  console.log(`├─ EMAIL_FROM: ${process.env.EMAIL_FROM || 'Maison Luxe <onboarding@resend.dev>'}`);
  console.log(`└─ NODE_ENV: ${process.env.NODE_ENV || 'development'}\n`);

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ ERREUR: RESEND_API_KEY manquante !\n');
    console.error('📝 Solution:');
    console.error('1. Allez sur https://resend.com/dashboard/api-keys');
    console.error('2. Copiez votre clé API (commence par "re_")');
    console.error('3. Ajoutez à .env: RESEND_API_KEY=re_votre_clé\n');
    process.exit(1);
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Email de test - à remplacer par votre email
    const recipientEmail = process.env.TEST_EMAIL || 'delivered@resend.dev';

    console.log('📧 Envoi d\'un email de test...\n');

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Maison Luxe <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: '✅ Test - Confirmation Maison Luxe',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
          <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333; margin-bottom: 20px;">✅ Email de Test</h1>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Ceci est un email de test pour vérifier que Resend fonctionne correctement.
            </p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Informations:</h2>
              <ul style="color: #666;">
                <li><strong>Service:</strong> Resend</li>
                <li><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
                <li><strong>Heure:</strong> ${new Date().toLocaleTimeString('fr-FR')}</li>
                <li><strong>Destinataire:</strong> ${recipientEmail}</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              Si vous recevez cet email, Resend fonctionne correctement ! ✨
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log('───────────────────────────────────────────\n');

    if (error) {
      console.error('❌ ERREUR lors de l\'envoi:\n');
      console.error('Message:', error.message);
      console.error('\n🔧 Solutions possibles:\n');
      console.error('1. Clé API invalide');
      console.error('   └─ Vérifiez https://resend.com/dashboard/api-keys\n');
      console.error('2. Domaine non vérifié');
      console.error('   └─ Utilisez onboarding@resend.dev en mode test\n');
      console.error('3. Quota dépassé');
      console.error('   └─ Vérifiez votre plan Resend\n');
      process.exit(1);
    }

    console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS !\n');
    console.log('📊 Détails de l\'envoi:');
    console.log(`├─ Email ID: ${data.id}`);
    console.log(`├─ Destinataire: ${recipientEmail}`);
    console.log(`├─ Expéditeur: ${process.env.EMAIL_FROM || 'Maison Luxe <onboarding@resend.dev>'}`);
    console.log(`└─ Statut: En cours de livraison\n`);

    console.log('═══════════════════════════════════════════\n');
    console.log('📧 Vérifications:\n');
    console.log('1. ✅ Vérifiez votre boîte mail');
    console.log('   └─ Email reçu? Resend fonctionne!\n');
    console.log('2. 📊 Suivi en direct:');
    console.log('   └─ https://resend.com/dashboard/logs\n');
    console.log('3. 💾 Commandes en production:\n');
    console.log('   └─ Les emails seront envoyés automatiquement après chaque paiement\n');

  } catch (error) {
    console.error('❌ Erreur non gérée:', error.message, '\n');
    process.exit(1);
  }
}

testResendEmail();

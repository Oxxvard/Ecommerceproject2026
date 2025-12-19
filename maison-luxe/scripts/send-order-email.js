#!/usr/bin/env node

require('dotenv').config();

const mongoose = require('mongoose');

async function sendOrderEmail() {
  try {
    console.log('=== Envoi email de commande ===\n');

    const dbUri = process.env.MONGODB_URI;

    console.log('Connexion à MongoDB...');
    await mongoose.connect(dbUri);
    console.log('✓ Connecté\n');

    const OrderSchema = new mongoose.Schema({}, { strict: false, strictPopulate: false });
    const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

    const orderId = '6940101ad95f9f5ed741fc6e';
    console.log(`Recherche commande #${orderId}...`);

    const order = await Order.findById(orderId);

    if (!order) {
      console.log(`❌ Commande #${orderId} introuvable`);
      process.exit(1);
    }

    console.log('✓ Commande trouvée\n');

    // Charger le user séparément
    const UserSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const user = await User.findById(order.user);

    if (!user) {
      console.log('❌ Utilisateur introuvable');
      process.exit(1);
    }

    // Charger le service email
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const userEmail = user.email;
    const userName = user.name || 'Client';

    console.log(`Destinataire: ${userEmail}`);
    console.log(`Montant: ${order.totalAmount}€`);
    console.log(`Articles: ${order.items.length}\n`);

    console.log('📧 Envoi email de confirmation...');

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Maison Luxe <onboarding@resend.dev>',
      to: userEmail,
      subject: `Confirmation de commande #${orderId.slice(-6)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Merci pour votre commande !</h1>
          </div>
          
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px; color: #333;">Bonjour ${userName},</p>
            <p style="font-size: 16px; color: #666;">Votre commande a bien été reçue et est en cours de préparation.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin: 0 0 15px 0; color: #333;">Commande #${orderId.slice(-6)}</h2>
              <p style="margin: 5px 0; color: #666;">Statut: <strong>En préparation</strong></p>
            </div>
            
            <h3 style="color: #333; margin-top: 30px;">Récapitulatif</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="border-bottom: 2px solid #ddd;">
                  <th style="text-align: left; padding: 10px; color: #666;">Produit</th>
                  <th style="text-align: center; padding: 10px; color: #666;">Qté</th>
                  <th style="text-align: right; padding: 10px; color: #666;">Prix</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; color: #333;">${item.name}</td>
                    <td style="text-align: center; padding: 10px; color: #666;">×${item.quantity}</td>
                    <td style="text-align: right; padding: 10px; color: #333;">${(item.price * item.quantity).toFixed(2)}€</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 15px 10px 10px; text-align: right; font-weight: bold; color: #333;">Total:</td>
                  <td style="padding: 15px 10px 10px; text-align: right; font-weight: bold; color: #667eea; font-size: 18px;">${order.totalAmount.toFixed(2)}€</td>
                </tr>
              </tfoot>
            </table>
            
            <h3 style="color: #333; margin-top: 30px;">Adresse de livraison</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <p style="margin: 5px 0; color: #333;">${order.shippingAddress.fullName}</p>
              <p style="margin: 5px 0; color: #666;">${order.shippingAddress.address}</p>
              <p style="margin: 5px 0; color: #666;">${order.shippingAddress.postalCode} ${order.shippingAddress.city}</p>
              <p style="margin: 5px 0; color: #666;">${order.shippingAddress.country}</p>
            </div>
            
            <p style="margin-top: 30px; color: #666;">Vous recevrez un email de confirmation d'expédition dès que votre colis sera en route.</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 14px;">
            <p style="margin: 0;">Maison Luxe - Votre destination pour les produits de luxe</p>
          </div>
        </div>
      `,
    });

    if (result.error) {
      console.log('❌ Erreur:', JSON.stringify(result.error));
    } else {
      console.log('✅ Email envoyé avec succès !');
      console.log('   ID:', result.data?.id || 'N/A');
      console.log(`\nVérifiez votre boîte email: ${userEmail}\n`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

sendOrderEmail();

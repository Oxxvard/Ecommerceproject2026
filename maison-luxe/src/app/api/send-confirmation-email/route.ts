import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { emailService } from '@/lib/email';
import logger from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID manquant' },
        { status: 400 }
      );
    }

    // Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Paiement non confirmé' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Trouver la commande par stripeSessionId
    let order = await Order.findOne({ stripeSessionId: sessionId }).populate('user');

    // Fallback: si non trouvée, utiliser metadata.orderId puis rattacher stripeSessionId
    if (!order && (session as any).metadata?.orderId) {
      const byMeta = await Order.findById((session as any).metadata.orderId).populate('user');
      if (byMeta) {
        await Order.updateOne({ _id: byMeta._id }, { $set: { stripeSessionId: sessionId } });
        order = byMeta;
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      );
    }

    // Vérifier si l'email a déjà été envoyé
    if (order.emailSent) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email déjà envoyé' 
      });
    }

    // Envoyer l'email
    try {
      const user = order.user as any;
      await emailService.sendOrderConfirmation({
        _id: order._id,
        user: {
          email: user.email,
          name: user.name,
        },
        items: order.items,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
      });

      // Marquer l'email comme envoyé
      order.emailSent = true;
      await order.save();

      logger.info('✅ Email de confirmation envoyé pour commande', order._id);

      return NextResponse.json({ 
        success: true,
        message: 'Email envoyé'
      });
    } catch (emailError: any) {
      logger.error('❌ Erreur envoi email:', emailError.message);
      // Ne pas faire échouer la route côté client: on renvoie un succès avec un indicateur
      return NextResponse.json({
        success: true,
        message: 'Paiement confirmé, mais échec de l\'envoi email',
        emailError: emailError.message,
      });
    }
  } catch (error: any) {
    logger.error('❌ Erreur send-confirmation:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

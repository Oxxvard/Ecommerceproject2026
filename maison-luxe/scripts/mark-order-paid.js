require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

async function markOrderAsPaid() {
  try {
    // L'ID de votre commande
    const orderId = '693c31cf224a94c27548a6d6';

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

    // Mettre à jour la commande
    const result = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        status: 'processing',
        'shippingAddress.province': 'New York',
        stripeSessionId: 'test_session_123',
      },
      { new: true }
    );

    if (result) {
      console.log('✅ Order marked as paid:', result._id);
      console.log('Payment Status:', result.paymentStatus);
      console.log('Province:', result.shippingAddress.province);
    } else {
      console.log('❌ Order not found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

markOrderAsPaid();

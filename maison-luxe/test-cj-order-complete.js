require('dotenv').config();
const mongoose = require('mongoose');

async function testCompleteFlow() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Récupérer le dernier produit importé
    const Product = mongoose.connection.db.collection('products');
    const product = await Product.findOne({}, { sort: { createdAt: -1 } });
    
    if (!product) {
      console.error('❌ No product found');
      process.exit(1);
    }

    console.log('\n📦 Product found:');
    console.log('  Name:', product.name);
    console.log('  ID:', product._id);
    console.log('  cjPid:', product.cjPid);
    console.log('  cjVid:', product.cjVid);
    console.log('  Price:', product.price);

    if (!product.cjVid) {
      console.error('❌ Product missing cjVid!');
      process.exit(1);
    }

    // 2. Créer un utilisateur test
    const User = mongoose.connection.db.collection('users');
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      const insertResult = await User.insertOne({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        createdAt: new Date(),
      });
      user = { _id: insertResult.insertedId, name: 'Test User', email: 'test@example.com' };
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user found');
    }

    // 3. Créer une commande
    const Order = mongoose.connection.db.collection('orders');
    const sessionId = `cs_test_${Date.now()}`;
    
    const order = {
      user: user._id,
      items: [
        {
          product: product._id,
          name: product.name,
          image: product.images?.[0] || '/placeholder.svg',
          quantity: 1,
          price: product.price || 10,
        },
      ],
      totalAmount: product.price || 10,
      shippingAddress: {
        fullName: 'John Doe',
        address: '123 Main St',
        city: 'New York',
        postalCode: '10001',
        country: 'US',
        phone: '+1234567890',
      },
      paymentStatus: 'pending',
      status: 'pending',
      stripeSessionId: sessionId,
      createdAt: new Date(),
    };

    const insertResult = await Order.insertOne(order);
    const orderId = insertResult.insertedId;
    
    console.log('\n📋 Order created:');
    console.log('  Order ID:', orderId);
    console.log('  Session ID:', sessionId);
    console.log('  Total:', order.totalAmount);

    // 4. Simuler le webhook Stripe
    console.log('\n🔄 Simulating Stripe webhook...');
    
    const webhookPayload = {
      id: 'evt_test_' + Date.now(),
      type: 'checkout.session.completed',
      data: {
        object: {
          id: sessionId,
          payment_status: 'paid',
          customer_details: {
            email: user.email,
            name: user.name,
          },
        },
      },
    };

    const response = await fetch('http://localhost:3000/api/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    const result = await response.json();
    console.log('\n📨 Webhook response:', JSON.stringify(result, null, 2));

    // 5. Vérifier la commande mise à jour
    const updatedOrder = await Order.findOne({ _id: orderId });
    
    console.log('\n✅ Order updated:');
    console.log('  Payment Status:', updatedOrder.paymentStatus);
    console.log('  Order Status:', updatedOrder.status);
    console.log('  CJ Order ID:', updatedOrder.cjOrderId);
    console.log('  CJ Order Number:', updatedOrder.cjOrderNumber);
    console.log('  CJ Order Error:', updatedOrder.cjOrderError);

    if (updatedOrder.cjOrderId) {
      console.log('\n🎉 SUCCESS! CJ order created automatically!');
    } else if (updatedOrder.cjOrderError) {
      console.log('\n⚠️  CJ order failed:', updatedOrder.cjOrderError);
    } else {
      console.log('\n❌ CJ order not created');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testCompleteFlow();

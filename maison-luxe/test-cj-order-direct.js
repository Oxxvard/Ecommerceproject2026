require('dotenv').config();
const { cjService } = require('./src/lib/cjdropshipping.ts');

async function testCJOrderDirect() {
  try {
    console.log('🧪 Testing CJ order creation directly...\n');

    const orderData = {
      orderNumber: 'TEST-' + Date.now(),
      shippingAddress: {
        fullName: 'John Doe',
        address: '123 Main St',
        city: 'New York',
        postalCode: '10001',
        country: 'US',
        phone: '+1234567890',
      },
      items: [
        {
          vid: '08A74711-969E-4C0A-8764-BBA530EA5597', // VID du produit importé
          quantity: 1,
        },
      ],
      warehouseId: '{6709CCD7-0DC7-43B1-B310-17AB499E9B0A}', // Stock ID from China warehouse
      shipmentType: 1,
      remark: 'Test order from MaisonLuxe',
    };

    console.log('📦 Order data:', JSON.stringify(orderData, null, 2));
    console.log('\n🔄 Calling CJ API...\n');

    const result = await cjService.createOrder(orderData);

    console.log('✅ SUCCESS!');
    console.log('CJ Order ID:', result.orderId);
    console.log('CJ Order Number:', result.orderNumber);
    console.log('Order Amount:', result.orderAmount);
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Full error:', error);
  }
}

testCJOrderDirect();

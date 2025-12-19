const mongoose = require('mongoose');
require('dotenv').config();

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

const productsToCheck = [
  { name: 'Collier papillon', sku: 'CJLX105610701AZ' },
  { name: 'Collier argent 990', sku: 'CJLX227746501AZ' },
  { name: 'Montre business', sku: 'CJZBNSJX00182-Black and silver' },
  { name: 'Collier corne', sku: 'CJLX121762501AZ' }
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('\n🔍 Vérification des PID/VID stockés:\n');
  
  for (const item of productsToCheck) {
    const product = await Product.findOne({
      name: { $regex: item.name, $options: 'i' }
    }).select('name cjPid cjVid cjData');
    
    if (product) {
      console.log(`📦 ${product.name}`);
      console.log(`   SKU attendu: ${item.sku}`);
      console.log(`   PID stocké: ${product.cjPid || 'N/A'}`);
      console.log(`   VID stocké: ${product.cjVid || 'N/A'}`);
      console.log(`   cjData:`, product.cjData || 'N/A');
      console.log('');
    }
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

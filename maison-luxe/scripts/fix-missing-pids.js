const mongoose = require('mongoose');
require('dotenv').config();

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('\n🔧 Correction des PID manquants...\n');
  
  // Trouver tous les produits avec cjData.pid mais sans cjPid
  const products = await Product.find({
    'cjData.pid': { $exists: true },
    cjPid: { $exists: false }
  });
  
  console.log(`Trouvé ${products.length} produits à corriger\n`);
  
  let fixed = 0;
  for (const product of products) {
    if (product.cjData?.pid) {
      product.cjPid = product.cjData.pid;
      await product.save();
      console.log(`✅ ${product.name}`);
      console.log(`   PID ajouté: ${product.cjPid}\n`);
      fixed++;
    }
  }
  
  console.log(`\n✨ ${fixed} produits corrigés!\n`);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

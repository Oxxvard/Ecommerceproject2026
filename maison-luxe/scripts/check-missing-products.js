const mongoose = require('mongoose');
require('dotenv').config();

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

const ids = [
  '1375643090404118528',
  '1416342306763706368',
  '14461573-3A48-4585-B6EC-74F98D6D8E6E',
  '2501221053341615200'
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const products = await Product.find({
    $or: [
      { cjPid: { $in: ids } },
      { cjVid: { $in: ids } }
    ]
  }).select('name slug cjPid cjVid price stock');
  
  console.log('\n📦 Produits introuvables dans CJ:\n');
  products.forEach(p => {
    console.log(`❌ ${p.name}`);
    console.log(`   Slug: ${p.slug}`);
    console.log(`   Prix: ${p.price}€`);
    console.log(`   Stock: ${p.stock}`);
    console.log(`   PID: ${p.cjPid || 'N/A'}`);
    console.log(`   VID: ${p.cjVid || 'N/A'}\n`);
  });
  
  console.log(`Total: ${products.length} produits\n`);
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

// Script pour vérifier les VIDs CJ des produits
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function checkProductVids() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({});
    console.log(`\n📦 Total products: ${products.length}\n`);

    let validCount = 0;
    let invalidCount = 0;
    let missingCount = 0;

    products.forEach((product) => {
      const vid = product.cjVid;
      const isMongoId = vid && /^[0-9a-fA-F]{24}$/.test(vid);
      const isUUID = vid && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(vid);
      const isCJFormat = vid && (isUUID || /^[A-Z0-9]{32}$/i.test(vid));

      if (!vid) {
        missingCount++;
        console.log(`❌ MISSING VID: ${product.name} (${product._id})`);
        console.log(`   cjVid: ${vid || 'undefined'}`);
        console.log(`   cjProductId: ${product.cjProductId || 'undefined'}\n`);
      } else if (isMongoId || vid === product._id.toString()) {
        invalidCount++;
        console.log(`⚠️  INVALID VID (MongoDB ID): ${product.name} (${product._id})`);
        console.log(`   cjVid: ${vid}`);
        console.log(`   cjProductId: ${product.cjProductId || 'undefined'}\n`);
      } else if (isCJFormat) {
        validCount++;
        console.log(`✅ VALID VID: ${product.name}`);
        console.log(`   cjVid: ${vid}\n`);
      } else {
        invalidCount++;
        console.log(`⚠️  UNKNOWN FORMAT: ${product.name} (${product._id})`);
        console.log(`   cjVid: ${vid}\n`);
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log(`   ✅ Valid CJ VIDs: ${validCount}`);
    console.log(`   ⚠️  Invalid VIDs: ${invalidCount}`);
    console.log(`   ❌ Missing VIDs: ${missingCount}`);
    console.log('='.repeat(60) + '\n');

    if (invalidCount + missingCount > 0) {
      console.log('💡 RECOMMENDATION:');
      console.log('   - Products without valid CJ VID will use estimated shipping (5.99€)');
      console.log('   - Import products using scripts/test-cj-import.js to get valid VIDs');
      console.log('   - Or manually add cjVid field with the CJ variant ID (UUID format)\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkProductVids();

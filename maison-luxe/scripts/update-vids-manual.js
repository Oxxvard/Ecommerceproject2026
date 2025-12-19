const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    const collection = db.collection('products');
    
    // VIDs récupérés précédemment
    const updates = [
      { cjProductId: '1375360307257544704', vid: '1375643090404118528' },
      { cjProductId: '1416342304104517632', vid: '1416342306763706368' },
      { cjProductId: '2501221053341615000', vid: '2501221053341615200' },
      { cjProductId: '5464826D-1727-40E3-BB43-45CB9A97F5B0', vid: '14461573-3A48-4585-B6EC-74F98D6D8E6E' }
    ];
    
    console.log('Updating products...\n');
    
    for (const update of updates) {
      const result = await collection.updateOne(
        { cjProductId: update.cjProductId },
        { $set: { cjVid: update.vid } }
      );
      console.log(`✅ Updated ${update.cjProductId}: ${result.modifiedCount} modified`);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

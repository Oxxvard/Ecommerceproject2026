require('dotenv').config();
const { cjService } = require('./src/lib/cjdropshipping.ts');

async function testGlobalWarehouses() {
  try {
    console.log('🏭 Fetching all CJ warehouses...\n');
    
    const warehouses = await cjService.getGlobalWarehouseList();
    
    console.log(`✅ Found ${warehouses.length} warehouses:\n`);
    
    warehouses.forEach(w => {
      console.log(`${w.areaEn || w.en}`);
      console.log(`  Area ID: ${w.areaId || w.id}`);
      console.log(`  Country: ${w.countryCode || w.valueEn}`);
      console.log(`  Name: ${w.nameEn || w.en}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Full error:', error);
  }
}

testGlobalWarehouses();

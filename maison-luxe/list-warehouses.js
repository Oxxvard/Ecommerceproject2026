require('dotenv').config();
const { cjService } = require('./src/lib/cjdropshipping.ts');

async function listWarehouses() {
  try {
    console.log('🏭 Listing CJ warehouses...\n');

    const warehouses = await cjService.getGlobalWarehouseList();
    
    warehouses.forEach(wh => {
      console.log(`${wh.countryCode}: ${wh.areaEn}`);
      console.log(`  ID: ${wh.areaId}`);
      console.log(`  Country: ${wh.nameEn}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

listWarehouses();

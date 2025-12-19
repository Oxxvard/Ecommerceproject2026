require('dotenv').config();
const { cjService } = require('./src/lib/cjdropshipping.ts');

async function checkProductInventory() {
  try {
    console.log('🔍 Checking product inventory...\n');

    const pid = '913A0303-24B6-49B5-A211-7990E5766E35';
    
    // Récupérer les détails du produit avec inventaire
    const product = await cjService.getProductDetails(pid, ['enable_inventory']);
    
    console.log('📦 Product:', product.productNameEn);
    console.log('\n🏭 Variants with inventory:\n');
    
    product.variants.forEach((variant, index) => {
      console.log(`Variant ${index + 1}: ${variant.variantNameEn}`);
      console.log(`  VID: ${variant.vid}`);
      console.log(`  SKU: ${variant.variantSku}`);
      
      if (variant.inventories && variant.inventories.length > 0) {
        variant.inventories.forEach(inv => {
          console.log(`  📍 ${inv.countryCode}: ${inv.totalInventory} units (CJ: ${inv.cjInventory}, Factory: ${inv.factoryInventory})`);
        });
      } else {
        console.log('  ⚠️  No inventory data');
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

checkProductInventory();

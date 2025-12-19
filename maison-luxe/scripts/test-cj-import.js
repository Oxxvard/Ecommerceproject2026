/**
 * Test de l'import de produits CJ Dropshipping via l'API v2
 * Ce script teste la recherche et l'import complet d'un produit
 */

const API_BASE = 'http://localhost:3001';

async function testCJImport() {
  try {
    console.log('🔍 Test 1: Recherche de produits de luxe (montres)...\n');
    
    const searchResponse = await fetch(`${API_BASE}/api/cj/search?keyword=watch luxury&page=1&size=10`);
    const searchData = await searchResponse.json();
    
    if (!searchData.success) {
      throw new Error(`Erreur recherche: ${searchData.error}`);
    }
    
    console.log(`✅ ${searchData.data.totalRecords || 0} produits trouvés`);
    
    if (searchData.data.content && searchData.data.content[0]?.productList?.length > 0) {
      const firstProduct = searchData.data.content[0].productList[0];
      console.log(`\n📦 Premier produit:`);
      console.log(`   ID: ${firstProduct.id}`);
      console.log(`   Nom: ${firstProduct.nameEn}`);
      console.log(`   Prix: $${firstProduct.sellPrice}`);
      console.log(`   Stock: ${firstProduct.warehouseInventoryNum}`);
      
      console.log(`\n🔍 Test 2: Récupération des catégories...\n`);
      
      const catResponse = await fetch(`${API_BASE}/api/categories`);
      const catData = await catResponse.json();
      
      if (!catData.success) {
        throw new Error(`Erreur catégories: ${catData.error}`);
      }
      
      console.log(`✅ ${catData.categories.length} catégories trouvées`);
      const watchCategory = catData.categories.find(c => c.name === 'Montres');
      
      if (watchCategory) {
        console.log(`   Catégorie "Montres" trouvée: ${watchCategory._id}`);
        
        console.log(`\n📥 Test 3: Import du produit dans MongoDB...\n`);
        
        const importResponse = await fetch(`${API_BASE}/api/cj/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pid: firstProduct.id,
            categoryId: watchCategory._id,
          }),
        });
        
        const importData = await importResponse.json();
        
        if (importData.success) {
          console.log(`✅ Produit importé avec succès!`);
          console.log(`\n📊 Détails du produit importé:`);
          console.log(`   ID MongoDB: ${importData.product._id}`);
          console.log(`   Nom: ${importData.product.name}`);
          console.log(`   Slug: ${importData.product.slug}`);
          console.log(`   Prix coûtant: ${importData.product.costPrice}€`);
          console.log(`   Prix de vente: ${importData.product.price}€`);
          console.log(`   Prix comparé: ${importData.product.compareAtPrice}€`);
          console.log(`   Stock: ${importData.product.stock}`);
          console.log(`   CJ Product ID: ${importData.product.cjProductId}`);
          
          const margin = ((importData.product.price - importData.product.costPrice) / importData.product.price * 100).toFixed(1);
          console.log(`   Marge: ${margin}%`);
          
          console.log(`\n✨ Import CJ Dropshipping opérationnel!`);
        } else {
          console.error(`❌ Échec de l'import: ${importData.error}`);
        }
      } else {
        console.log(`⚠️  Catégorie "Montres" non trouvée`);
      }
    } else {
      console.log(`⚠️  Aucun produit trouvé dans les résultats`);
    }
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error(error.stack);
  }
}

// Attendre que le serveur soit prêt
setTimeout(() => {
  testCJImport();
}, 2000);

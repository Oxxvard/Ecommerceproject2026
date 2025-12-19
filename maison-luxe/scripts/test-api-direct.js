// Test simplifié de l'API CJ
const API_KEY = 'CJ4988633@api@7dae02bdf9df4108a1422bfde0d539e6';
const BASE_URL = 'https://developers.cjdropshipping.com/api2.0/v1';

async function testAPI() {
  try {
    // 1. Get token
    console.log('1️⃣  Récupération du token...');
    const tokenResponse = await fetch(`${BASE_URL}/authentication/getAccessToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: API_KEY }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.code !== 200) {
      throw new Error(`Token error: ${tokenData.message}`);
    }
    
    const token = tokenData.data.accessToken;
    console.log(`   ✅ Token obtenu: ${token.substring(0, 20)}...`);
    
    // 2. Search products
    console.log('\n2️⃣  Recherche de produits (watch)...');
    const searchUrl = `${BASE_URL}/product/listV2?page=1&size=10&keyWord=watch`;
    console.log(`   URL: ${searchUrl}`);
    
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'CJ-Access-Token': token,
      },
    });
    
    const searchData = await searchResponse.json();
    console.log(`\n📦 Réponse API:`);
    console.log(JSON.stringify(searchData, null, 2).substring(0, 1000));
    
    if (searchData.code === 200 && searchData.data) {
      console.log(`\n✅ Recherche réussie!`);
      console.log(`   Structure: data -> ${Object.keys(searchData.data).join(', ')}`);
      
      if (searchData.data.content && searchData.data.content[0]) {
        console.log(`   content[0] -> ${Object.keys(searchData.data.content[0]).join(', ')}`);
        
        if (searchData.data.content[0].productList) {
          const product = searchData.data.content[0].productList[0];
          console.log(`\n📦 Premier produit:`);
          console.log(`   ID: ${product.id}`);
          console.log(`   Nom: ${product.nameEn}`);
          console.log(`   Prix: $${product.sellPrice}`);
          console.log(`   Stock: ${product.warehouseInventoryNum}`);
        }
      }
    } else {
      console.error(`❌ Erreur: ${searchData.message}`);
    }
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  }
}

testAPI();

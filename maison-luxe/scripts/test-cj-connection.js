// Script pour tester la connexion CJ Dropshipping
require('dotenv').config({ path: '.env' });

const CJ_API_KEY = process.env.CJ_API_KEY;
const CJ_API_URL = process.env.CJ_API_URL || 'https://developers.cjdropshipping.com/api2.0/v1';

async function testCJConnection() {
  console.log('🔑 Clé API:', CJ_API_KEY?.substring(0, 20) + '...');
  console.log('🌐 URL API:', CJ_API_URL);
  console.log('\n🔌 Test de connexion à CJ Dropshipping...\n');

  try {
    // Étape 1: Obtenir le token d'accès
    console.log('1️⃣ Authentification...');
    const authResponse = await fetch(`${CJ_API_URL}/authentication/getAccessToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: CJ_API_KEY,
      }),
    });

    const authData = await authResponse.json();
    console.log('Réponse auth:', JSON.stringify(authData, null, 2));

    if (authData.code !== 200) {
      console.error('❌ Erreur d\'authentification:', authData.message);
      return;
    }

    const accessToken = authData.data.accessToken;
    console.log('✅ Token obtenu:', accessToken.substring(0, 30) + '...\n');

    // Étape 2: Rechercher quelques produits de test (montres)
    console.log('2️⃣ Recherche de produits (montres)...');
    const searchResponse = await fetch(
      `${CJ_API_URL}/product/list?pageNum=1&pageSize=5&keyword=watch`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'CJ-Access-Token': accessToken,
        },
      }
    );

    const searchData = await searchResponse.json();
    
    if (searchData.code === 200 && searchData.data?.list) {
      console.log(`✅ ${searchData.data.list.length} produits trouvés:\n`);
      searchData.data.list.forEach((product, index) => {
        console.log(`${index + 1}. ${product.productNameEn}`);
        console.log(`   PID: ${product.pid}`);
        console.log(`   Prix: $${product.sellPrice}`);
        console.log(`   Stock: ${product.sellStockQuantity || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('⚠️ Aucun produit trouvé ou erreur:', searchData.message);
    }

    // Étape 3: Obtenir les catégories
    console.log('3️⃣ Récupération des catégories...');
    const categoriesResponse = await fetch(
      `${CJ_API_URL}/product/getCategoryList`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'CJ-Access-Token': accessToken,
        },
      }
    );

    const categoriesData = await categoriesResponse.json();
    
    if (categoriesData.code === 200 && categoriesData.data) {
      console.log(`✅ ${categoriesData.data.length} catégories principales trouvées:\n`);
      categoriesData.data.slice(0, 10).forEach((cat) => {
        console.log(`- ${cat.categoryName} (ID: ${cat.categoryId})`);
      });
    }

    console.log('\n🎉 Connexion CJ Dropshipping réussie !');
    console.log('\n📝 Vous pouvez maintenant :');
    console.log('   1. Rechercher des produits via l\'API');
    console.log('   2. Importer des produits dans votre base de données');
    console.log('   3. Synchroniser les stocks automatiquement');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testCJConnection();

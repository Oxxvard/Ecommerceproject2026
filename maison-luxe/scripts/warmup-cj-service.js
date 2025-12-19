/**
 * Script pour pré-authentifier le service CJ et obtenir un token
 * Cela évite les erreurs "Too Many Requests" lors de la première utilisation
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function warmupCJService() {
  console.log('🔥 Préchauffage du service CJ Dropshipping...\n');

  try {
    // Importer le service (cela créera l'instance singleton)
    const { cjService } = require('../src/lib/cjdropshipping.ts');

    console.log('🔑 Obtention du token d\'accès...');
    const token = await cjService.getAccessToken();

    console.log('\n✅ Token obtenu avec succès !');
    console.log('   Token preview:', token.substring(0, 30) + '...');
    console.log('\n💡 Le token est maintenant en cache pour 23 heures');
    console.log('   Toutes les prochaines requêtes utiliseront ce token');
    console.log('\n🚀 Vous pouvez maintenant utiliser l\'interface d\'import sans erreur\n');

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'authentification:', error.message);
    
    if (error.message.includes('Too Many Requests')) {
      console.log('\n⏰ Limite de débit atteinte');
      console.log('   Attendez 5 minutes et réessayez');
      console.log('   Commande: node scripts/warmup-cj-service.js\n');
    } else if (error.message.includes('apiKey')) {
      console.log('\n🔑 Vérifiez que CJ_API_KEY est définie dans .env\n');
    }
  }
}

warmupCJService();

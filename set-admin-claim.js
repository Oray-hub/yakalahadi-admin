// Admin Claim Verme Script'i
// Bu dosyayı çalıştırmadan önce Firebase Admin SDK'yı kurun:
// npm install firebase-admin

const admin = require('firebase-admin');

// Service account key dosyasını yükleyin
// Firebase Console > Project Settings > Service Accounts > Generate new private key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Admin claim'i vereceğiniz kullanıcının UID'si
// Console'da görünen UID'yi buraya yazın
const targetUID = 'BURAYA_CONSOLE_DA_GORUNEN_UID_YAZIN'; // admin@yakalahadi.com kullanıcısının UID'si

async function setAdminClaim() {
  try {
    // Admin claim'i ver
    await admin.auth().setCustomUserClaims(targetUID, { admin: true });
    console.log('✅ Admin yetkisi başarıyla verildi:', targetUID);
    
    // Kullanıcı bilgilerini kontrol et
    const userRecord = await admin.auth().getUser(targetUID);
    console.log('👤 Kullanıcı bilgileri:', {
      uid: userRecord.uid,
      email: userRecord.email,
      customClaims: userRecord.customClaims
    });
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    process.exit(0);
  }
}

setAdminClaim(); 
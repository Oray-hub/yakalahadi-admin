const admin = require('firebase-admin');

// Firebase Admin SDK'yı başlat
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Admin claim'i vereceğiniz kullanıcının UID'si
const targetUID = 'cvtXMH7IY0P8uCW7aAupqcdNUY13'; // admin@yakalahadi.com

async function setAdminClaim() {
  try {
    console.log('🔄 Admin yetkisi veriliyor...');
    
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

    console.log('🎉 İşlem tamamlandı! Artık admin panelinde tüm işlemleri yapabilirsiniz.');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.log('💡 Çözüm: Firebase Console > Project Settings > Service Accounts > Generate new private key');
  } finally {
    process.exit(0);
  }
}

setAdminClaim(); 
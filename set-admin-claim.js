// Admin Claim Verme Script'i
// Bu dosyayı çalıştırmadan önce Firebase Admin SDK'yı kurun:
// npm install firebase-admin

const admin = require('firebase-admin');

// Firebase Admin SDK'yı başlat
// Service account key dosyanızı buraya ekleyin
const serviceAccount = require('./serviceAccountKey.json'); // Bu dosyayı Firebase Console'dan indirin

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Admin olacak kullanıcının UID'sini buraya yazın
const targetUID = 'cvtXMH7IY0P8uCW7aAupqcd...'; // admin@yakalahadi.com kullanıcısının UID'si

async function setAdminClaim() {
  try {
    // Admin claim'i ver
    await admin.auth().setCustomUserClaims(targetUID, { admin: true });
    
    console.log('✅ Admin yetkisi başarıyla verildi!');
    console.log('Kullanıcı UID:', targetUID);
    
    // Kullanıcı bilgilerini kontrol et
    const userRecord = await admin.auth().getUser(targetUID);
    console.log('Kullanıcı E-posta:', userRecord.email);
    console.log('Custom Claims:', userRecord.customClaims);
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
  
  // Uygulamayı kapat
  process.exit(0);
}

// Script'i çalıştır
setAdminClaim(); 
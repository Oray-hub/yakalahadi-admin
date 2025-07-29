// Firebase Functions - Basit Admin Claim Verme
// Bu dosyayı Firebase Functions projenizde kullanın

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Admin claim'i verme fonksiyonu
exports.setAdminClaim = functions.https.onCall((data, context) => {
  const uid = data.uid;
  
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'UID gerekli');
  }

  return admin.auth().setCustomUserClaims(uid, { admin: true })
    .then(() => {
      return { message: 'Admin yetkisi verildi', uid: uid };
    })
    .catch((error) => {
      throw new functions.https.HttpsError('internal', error.message);
    });
}); 
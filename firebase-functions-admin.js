// Firebase Functions - Admin Claim Verme
// Bu dosyayı Firebase Functions projenizde kullanabilirsiniz

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Admin claim'i verme fonksiyonu
exports.setAdminClaim = functions.https.onCall((data, context) => {
  // Sadece süper admin kullanıcılar bu fonksiyonu çağırabilir
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Giriş yapmanız gerekiyor');
  }

  const uid = data.uid; // Admin olacak kullanıcının UID'si
  
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'UID gerekli');
  }

  return admin.auth().setCustomUserClaims(uid, { admin: true })
    .then(() => {
      return { 
        message: 'Admin yetkisi başarıyla verildi',
        uid: uid 
      };
    })
    .catch((error) => {
      console.error('Admin claim hatası:', error);
      throw new functions.https.HttpsError('internal', error.message);
    });
});

// Admin claim'i kaldırma fonksiyonu
exports.removeAdminClaim = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Giriş yapmanız gerekiyor');
  }

  const uid = data.uid;
  
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'UID gerekli');
  }

  return admin.auth().setCustomUserClaims(uid, { admin: false })
    .then(() => {
      return { 
        message: 'Admin yetkisi kaldırıldı',
        uid: uid 
      };
    })
    .catch((error) => {
      console.error('Admin claim kaldırma hatası:', error);
      throw new functions.https.HttpsError('internal', error.message);
    });
});

// Admin kullanıcılarını listeleme fonksiyonu
exports.listAdminUsers = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Giriş yapmanız gerekiyor');
  }

  try {
    const listUsersResult = await admin.auth().listUsers();
    const adminUsers = listUsersResult.users.filter(user => 
      user.customClaims && user.customClaims.admin === true
    );

    return {
      adminUsers: adminUsers.map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      }))
    };
  } catch (error) {
    console.error('Admin kullanıcıları listeleme hatası:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
}); 
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

// Admin claim'i verme fonksiyonu
exports.setAdminClaim = onCall((request) => {
  const { data } = request;
  const uid = data.uid;
  
  if (!uid) {
    throw new HttpsError('invalid-argument', 'UID gerekli');
  }

  return admin.auth().setCustomUserClaims(uid, { admin: true })
    .then(() => {
      return { message: 'Admin yetkisi verildi', uid: uid };
    })
    .catch((error) => {
      throw new HttpsError('internal', error.message);
    });
});

// Admin claim'i kaldırma fonksiyonu
exports.removeAdminClaim = onCall((request) => {
  const { data } = request;
  const uid = data.uid;
  
  if (!uid) {
    throw new HttpsError('invalid-argument', 'UID gerekli');
  }

  return admin.auth().setCustomUserClaims(uid, { admin: false })
    .then(() => {
      return { message: 'Admin yetkisi kaldırıldı', uid: uid };
    })
    .catch((error) => {
      throw new HttpsError('internal', error.message);
    });
});

// Admin kullanıcılarını listeleme fonksiyonu
exports.listAdminUsers = onCall(async (request) => {
  try {
    const listUsersResult = await admin.auth().listUsers();
    const adminUsers = listUsersResult.users.filter(user => 
      user.customClaims && user.customClaims.admin === true
    );

    return {
      admins: adminUsers.map(user => user.uid)
    };
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
}); 
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();

// Global options for callable functions
setGlobalOptions({
  maxInstances: 10,
});

// Admin claim'i verme fonksiyonu
exports.setAdminClaim = onCall({
  cors: true,
  maxInstances: 10,
}, async (request) => {
  try {
    // Authentication kontrolü
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Kullanıcı girişi gerekli');
    }

    const { data } = request;
    const uid = data.uid;
    
    if (!uid) {
      throw new HttpsError('invalid-argument', 'UID gerekli');
    }

    // Admin yetkisi ver
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    
    console.log(`Admin yetkisi verildi: ${uid}`);
    return { 
      success: true,
      message: 'Admin yetkisi başarıyla verildi', 
      uid: uid 
    };
  } catch (error) {
    console.error('setAdminClaim error:', error);
    throw new HttpsError('internal', `Admin yetkisi verilemedi: ${error.message}`);
  }
});

// Admin claim'i kaldırma fonksiyonu
exports.removeAdminClaim = onCall({
  cors: true,
  maxInstances: 10,
}, async (request) => {
  try {
    // Authentication kontrolü
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Kullanıcı girişi gerekli');
    }

    const { data } = request;
    const uid = data.uid;
    
    if (!uid) {
      throw new HttpsError('invalid-argument', 'UID gerekli');
    }

    // Admin yetkisini kaldır
    await admin.auth().setCustomUserClaims(uid, { admin: false });
    
    console.log(`Admin yetkisi kaldırıldı: ${uid}`);
    return { 
      success: true,
      message: 'Admin yetkisi başarıyla kaldırıldı', 
      uid: uid 
    };
  } catch (error) {
    console.error('removeAdminClaim error:', error);
    throw new HttpsError('internal', `Admin yetkisi kaldırılamadı: ${error.message}`);
  }
});

// Admin kullanıcılarını listeleme fonksiyonu
exports.listAdminUsers = onCall({
  cors: true,
  maxInstances: 10,
}, async (request) => {
  try {
    // Authentication kontrolü
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Kullanıcı girişi gerekli');
    }

    const listUsersResult = await admin.auth().listUsers();
    const adminUsers = listUsersResult.users.filter(user => 
      user.customClaims && user.customClaims.admin === true
    );

    console.log(`Admin kullanıcıları listelendi: ${adminUsers.length} adet`);
    return {
      success: true,
      admins: adminUsers.map(user => user.uid)
    };
  } catch (error) {
    console.error('listAdminUsers error:', error);
    throw new HttpsError('internal', `Admin kullanıcıları listelenemedi: ${error.message}`);
  }
}); 
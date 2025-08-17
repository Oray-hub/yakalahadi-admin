const functions = require('firebase-functions');
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp();

// Kullanıcıyı disable/enable eden fonksiyon
exports.setUserDisabledAdmin = functions.region('us-central1').https.onCall(async (data, context) => {
  const { uid, disabled } = data;
  if (!uid || typeof disabled !== 'boolean') {
    throw new functions.https.HttpsError('invalid-argument', 'UID ve disabled zorunlu.');
  }
  await admin.auth().updateUser(uid, { disabled });
  return { success: true };
});

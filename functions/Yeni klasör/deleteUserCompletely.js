const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) admin.initializeApp();

exports.deleteUserCompletely = functions.region('europe-west1').https.onCall(async (data, context) => {
  const { uid } = data;
  if (!uid) throw new functions.https.HttpsError('invalid-argument', 'UID zorunlu.');
  // Authentication'dan sil
  await admin.auth().deleteUser(uid);
  // Firestore'dan sil
  await admin.firestore().collection('users').doc(uid).delete();
  return { success: true };
});

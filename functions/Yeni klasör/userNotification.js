const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Firebase Admin SDK'yı başlat
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.userNotification = functions.region('europe-west1').https.onRequest(async (req, res) => {
  // CORS ayarları
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { title, message, email } = req.body;

    // Gerekli alanları kontrol et
    if (!title || !message || !email) {
      res.status(400).json({ error: 'Title, message ve email alanları gerekli' });
      return;
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Geçersiz email formatı' });
      return;
    }

    // Kullanıcıyı email ile bul
    const usersRef = db.collection('users');
    const userQuery = await usersRef.where('email', '==', email).get();

    if (userQuery.empty) {
      res.status(404).json({ error: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı' });
      return;
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // FCM token kontrolü
    if (!userData.fcmToken) {
      res.status(400).json({ error: 'Kullanıcının FCM token\'ı bulunamadı' });
      return;
    }

    // Bildirim mesajını hazırla
    const notificationMessage = {
      notification: {
        title: title,
        body: message,
        icon: '/logo1.png',
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      data: {
        title: title,
        message: message,
        type: 'user_notification',
        timestamp: new Date().toISOString()
      },
      token: userData.fcmToken
    };

    // FCM ile bildirim gönder
    const response = await admin.messaging().send(notificationMessage);

    // Bildirimi veritabanına kaydet
    await db.collection('userNotifications').add({
      userId: userDoc.id,
      userEmail: email,
      userName: userData.name || 'Bilinmeyen Kullanıcı',
      title: title,
      message: message,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'sent',
      fcmResponse: response
    });

    console.log(`Kullanıcı bildirimi gönderildi: ${email} - ${title}`);

    res.status(200).json({
      success: true,
      message: 'Kullanıcı bildirimi başarıyla gönderildi',
      userId: userDoc.id,
      userEmail: email,
      userName: userData.name
    });

  } catch (error) {
    console.error('Kullanıcı bildirimi gönderme hatası:', error);
    res.status(500).json({ error: 'Bildirim gönderilirken bir hata oluştu' });
  }
});

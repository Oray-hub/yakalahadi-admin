const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Firebase Admin SDK'yı başlat
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.companyNotification = functions.region('europe-west1').https.onRequest(async (req, res) => {
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

    // Firmayı email ile bul
    const companiesRef = db.collection('companies');
    const companyQuery = await companiesRef.where('email', '==', email).get();

    if (companyQuery.empty) {
      res.status(404).json({ error: 'Bu email adresi ile kayıtlı firma bulunamadı' });
      return;
    }

    const companyDoc = companyQuery.docs[0];
    const companyData = companyDoc.data();

    // Firma bilgilerini kontrol et
    if (!companyData.email) {
      res.status(400).json({ error: 'Firma email bilgisi bulunamadı' });
      return;
    }

    // Bildirim mesajını hazırla (Firma için email gönderimi)
    const notificationData = {
      companyId: companyDoc.id,
      companyEmail: email,
      companyName: companyData.firmName || companyData.name || 'Bilinmeyen Firma',
      title: title,
      message: message,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'sent',
      type: 'company_notification'
    };

    // Bildirimi veritabanına kaydet
    await db.collection('companyNotifications').add(notificationData);

    // Email gönderimi için SendGrid kullan (opsiyonel)
    // Bu kısım email servisi entegrasyonu gerektirir
    console.log(`Firma bildirimi kaydedildi: ${email} - ${title}`);

    res.status(200).json({
      success: true,
      message: 'Firma bildirimi başarıyla kaydedildi',
      companyId: companyDoc.id,
      companyEmail: email,
      companyName: companyData.firmName || companyData.name
    });

  } catch (error) {
    console.error('Firma bildirimi gönderme hatası:', error);
    res.status(500).json({ error: 'Bildirim gönderilirken bir hata oluştu' });
  }
});

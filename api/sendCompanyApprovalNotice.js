import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// Firebase Admin SDK'yı başlat
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: "yakalahadi-333ca",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  // CORS header'ları
  res.setHeader('Access-Control-Allow-Origin', 'https://adminoray.yakalahadi.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // OPTIONS request için
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const { companyId, approvalStatus, reason } = req.body;
  
    if (!companyId || !approvalStatus) {
      res.status(400).json({ error: 'Gerekli parametreler eksik' });
      return;
    }
    
    // Firma bilgilerini al
    const companyDoc = await db.collection('companies').doc(companyId).get();
    
    if (!companyDoc.exists) {
      res.status(404).json({ error: 'Firma bulunamadı' });
      return;
    }
    
    const company = companyDoc.data();
    const companyName = company.company || company.companyTitle || "Firma";
    
    // Company ID'si ile user'ı bul (aynı ID kullanılıyor)
    const userDoc = await db.collection('users').doc(companyId).get();
    
    if (!userDoc.exists) {
      res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      return;
    }
    
    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;
    
    if (!fcmToken) {
      res.status(400).json({ error: 'FCM token bulunamadı' });
      return;
    }
    
    // Bildirim mesajını hazırla
    let notificationTitle, notificationBody;
    
    if (approvalStatus === "approved") {
      notificationTitle = "✅ Başvurunuz Onaylandı!";
      notificationBody = `Merhaba ${company.companyOfficer || 'Değerli Kullanıcı'}, ${companyName} başvurunuz başarıyla onaylandı. Detaylar için uygulamayı kontrol edin.`;
    } else {
      notificationTitle = "❌ Başvurunuz Onaylanmadı";
      notificationBody = `Merhaba ${company.companyOfficer || 'Değerli Kullanıcı'}, ${companyName} başvurunuz ${reason || "belirtilen sebeplerden dolayı"} onaylanmadı. Lütfen tekrar başvurun.`;
    }
    
    // FCM mesajını hazırla
    const message = {
      token: fcmToken,
      notification: {
        title: notificationTitle,
        body: notificationBody,
      },
      data: {
        type: "company_approval",
        companyId: companyId,
        approvalStatus: approvalStatus,
        reason: reason || "",
        companyName: companyName,
      },
    };
    
    // Bildirimi gönder
    const result = await getMessaging().send(message);
    
    console.log(`📨 ${companyName} için ${approvalStatus === 'approved' ? 'onay' : 'red'} bildirimi gönderildi:`, result);
    
    res.status(200).json({ 
      success: true, 
      message: "Bildirim başarıyla gönderildi",
      companyName: companyName,
      approvalStatus: approvalStatus,
      messageId: result
    });
    
  } catch (error) {
    console.error("❌ Firma onay bildirimi gönderilirken hata:", error);
    res.status(500).json({ error: 'Bildirim gönderilirken hata oluştu', details: error.message });
  }
} 
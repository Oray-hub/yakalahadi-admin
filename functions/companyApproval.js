const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// 🏢 Firma onay/red bildirimi fonksiyonu
exports.sendCompanyApprovalNotice = onRequest({
  cors: true // Tüm origin'lere izin ver
}, async (req, res) => {
  try {
    console.log("📥 Request received:", req.body);
    const { companyId, approvalStatus, reason } = req.body;
    
    if (!companyId || !approvalStatus) {
      console.log("❌ Missing parameters");
      res.status(400).json({ error: 'Gerekli parametreler eksik' });
      return;
    }
    
    console.log("🔍 Looking for company:", companyId);
    
    // Firma bilgilerini al
    const companyDoc = await admin.firestore().collection('companies').doc(companyId).get();
    
    if (!companyDoc.exists) {
      console.log("❌ Company not found:", companyId);
      res.status(404).json({ error: 'Firma bulunamadı' });
      return;
    }
    
    const company = companyDoc.data();
    const companyName = company.company || company.companyTitle || "Firma";
    
    console.log("🔍 Looking for user:", companyId);
    
    // Company ID'si ile user'ı bul (aynı ID kullanılıyor)
    const userDoc = await admin.firestore().collection('users').doc(companyId).get();
    
    if (!userDoc.exists) {
      console.log("❌ User not found:", companyId);
      res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      return;
    }
    
    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;
    
    if (!fcmToken) {
      console.log("❌ FCM token not found for user:", companyId);
      res.status(400).json({ error: 'FCM token bulunamadı' });
      return;
    }
    
    console.log("📱 FCM token found:", fcmToken.substring(0, 20) + "...");
    
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
    
    console.log("📨 Sending notification:", { companyName, approvalStatus });
    
    // Bildirimi gönder
    const result = await admin.messaging().send(message);
    
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
    res.status(500).json({ 
      error: 'Bildirim gönderilirken hata oluştu', 
      details: error.message 
    });
  }
}); 
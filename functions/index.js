const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// 🏢 Firma onay bildirimi fonksiyonu
exports.sendCompanyApprovalNotice = functions.https.onCall(async (data, context) => {
  try {
    const { companyId, approvalStatus, reason } = data;
    
    if (!companyId || !approvalStatus) {
      throw new functions.https.HttpsError('invalid-argument', 'Gerekli parametreler eksik');
    }
    
    // Firma bilgilerini al
    const companyDoc = await admin.firestore().collection('companies').doc(companyId).get();
    
    if (!companyDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Firma bulunamadı');
    }
    
    const company = companyDoc.data();
    const companyName = company.company || company.companyTitle || "Firma";
    
    // Company ID'si ile user'ı bul (aynı ID kullanılıyor)
    const userDoc = await admin.firestore().collection('users').doc(companyId).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Kullanıcı bulunamadı');
    }
    
    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;
    
    if (!fcmToken) {
      throw new functions.https.HttpsError('invalid-argument', 'FCM token bulunamadı');
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
    const result = await admin.messaging().send(message);
    
    console.log(`📨 ${companyName} için onay bildirimi gönderildi:`, result);
    
    return { 
      success: true, 
      message: "Bildirim başarıyla gönderildi",
      companyName: companyName,
      approvalStatus: approvalStatus,
      messageId: result
    };
    
  } catch (error) {
    console.error("❌ Firma onay bildirimi gönderilirken hata:", error);
    throw new functions.https.HttpsError('internal', 'Bildirim gönderilirken hata oluştu', error);
  }
});

// 🧪 Test bildirimi fonksiyonu
exports.sendTestNotification = functions.https.onCall(async (data, context) => {
  try {
    const { fcmToken, message } = data;
    
    if (!fcmToken || !message) {
      throw new functions.https.HttpsError('invalid-argument', 'FCM token ve mesaj gerekli');
    }
    
    const notificationMessage = {
      token: fcmToken,
      notification: {
        title: "🧪 Test Bildirimi",
        body: message,
      },
      data: {
        type: "test_notification",
        timestamp: Date.now().toString(),
      },
    };
    
    const result = await admin.messaging().send(notificationMessage);
    
    console.log("🧪 Test bildirimi gönderildi:", result);
    
    return {
      success: true,
      message: "Test bildirimi başarıyla gönderildi",
      messageId: result
    };
    
  } catch (error) {
    console.error("❌ Test bildirimi hatası:", error);
    throw new functions.https.HttpsError('internal', 'Test bildirimi gönderilirken hata oluştu', error);
  }
});

// 📊 Bildirim istatistikleri fonksiyonu
exports.getNotificationStats = functions.https.onCall(async (data, context) => {
  try {
    const { days = 7 } = data;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logsSnapshot = await admin.firestore()
      .collection('notification_logs')
      .where('sentAt', '>=', startDate)
      .orderBy('sentAt', 'desc')
      .get();
    
    const logs = [];
    logsSnapshot.forEach(doc => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const stats = {
      total: logs.length,
      successful: logs.filter(log => log.success).length,
      failed: logs.filter(log => !log.success).length,
      byType: {},
      byDate: {}
    };
    
    logs.forEach(log => {
      // Tip bazında istatistik
      if (!stats.byType[log.type]) {
        stats.byType[log.type] = 0;
      }
      stats.byType[log.type]++;
      
      // Tarih bazında istatistik
      const date = log.sentAt?.toDate?.() || new Date(log.sentAt);
      const dateStr = date.toISOString().split('T')[0];
      if (!stats.byDate[dateStr]) {
        stats.byDate[dateStr] = 0;
      }
      stats.byDate[dateStr]++;
    });
    
    return {
      success: true,
      stats: stats,
      logs: logs.slice(0, 50) // Son 50 log
    };
    
  } catch (error) {
    console.error("❌ Bildirim istatistikleri hatası:", error);
    throw new functions.https.HttpsError('internal', 'Bildirim istatistikleri alınırken hata oluştu', error);
  }
});

// 🗑️ Bildirim log'larını temizleme fonksiyonu
exports.clearNotificationLogs = functions.https.onCall(async (data, context) => {
  try {
    const { days = 30 } = data;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logsSnapshot = await admin.firestore()
      .collection('notification_logs')
      .where('sentAt', '<', startDate)
      .get();
    
    const batch = admin.firestore().batch();
    logsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return {
      success: true,
      message: `${logsSnapshot.size} eski log silindi`,
      deletedCount: logsSnapshot.size
    };
    
  } catch (error) {
    console.error("❌ Log temizleme hatası:", error);
    throw new functions.https.HttpsError('internal', 'Log temizlenirken hata oluştu', error);
  }
});
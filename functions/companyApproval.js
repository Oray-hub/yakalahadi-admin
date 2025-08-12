const functions = require('firebase-functions');
const admin = require('firebase-admin');

// 🏢 Firma onay/red bildirimi fonksiyonu - Firestore trigger v1
exports.sendCompanyApprovalNoticeTrigger = functions
  .region('europe-west1')
  .runWith({
    minInstances: 0,
    maxInstances: 3000
  })
  .firestore
  .document('companyApprovals/{approvalId}')
  .onCreate(async (snap, context) => {
    try {
      console.log("📥 Company approval event received:", context.params.approvalId);
      
      const approvalData = snap.data();
      const { companyId, approvalStatus, reason } = approvalData;
      
      if (!companyId || !approvalStatus) {
        console.log("❌ Missing parameters in approval data");
        return null;
      }
      
      console.log("🔍 Looking for company:", companyId);
      
      // Firma bilgilerini al
      const companyDoc = await admin.firestore().collection('companies').doc(companyId).get();
      
      if (!companyDoc.exists) {
        console.log("❌ Company not found:", companyId);
        return null;
      }
      
      const company = companyDoc.data();
      const companyName = company.company || company.companyTitle || "Firma";
      
      console.log("🔍 Looking for user:", companyId);
      
      // Company ID'si ile user'ı bul (aynı ID kullanılıyor)
      const userDoc = await admin.firestore().collection('users').doc(companyId).get();
      
      if (!userDoc.exists) {
        console.log("❌ User not found:", companyId);
        return null;
      }
      
      const userData = userDoc.data();
      const fcmToken = userData.fcmToken;
      
      if (!fcmToken) {
        console.log("❌ FCM token not found for user:", companyId);
        return null;
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
      
      // Dokümanı işaretle
      await admin.firestore().collection('companyApprovals').doc(context.params.approvalId).update({
        processed: true,
        processedAt: new Date().toISOString(),
        messageId: result
      });
      
      return result;
      
    } catch (error) {
      console.error("❌ Firma onay bildirimi gönderilirken hata:", error);
      return null;
    }
  }); 
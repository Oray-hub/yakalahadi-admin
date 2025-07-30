const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// 🏢 Firma onay bildirimi fonksiyonu
exports.sendCompanyApprovalNotice = functions
  .runWith({
    allowUnauthenticated: true
  })
  .https.onCall(async (data, context) => {
    try {
      const { companyId, approvalStatus, reason } = data;
      
      // Firma bilgilerini al
      const companyDoc = await admin.firestore().collection("companies").doc(companyId).get();
      
      if (!companyDoc.exists) {
        throw new Error("Firma bulunamadı");
      }
      
      const company = companyDoc.data();
      const companyName = company.company || company.companyTitle || "Firma";
      const companyOfficer = company.companyOfficer || "Yetkili";
      const companyEmail = company.email;
      
      // Firma yetkilisinin FCM token'ını bul
      const usersSnapshot = await admin.firestore()
        .collection("users")
        .where("email", "==", companyEmail)
        .limit(1)
        .get();
      
      if (usersSnapshot.empty) {
        console.log(`📧 ${companyEmail} için kullanıcı bulunamadı`);
        return { success: false, message: "Kullanıcı bulunamadı" };
      }
      
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      const fcmToken = userData.fcmToken;
      
      if (!fcmToken) {
        console.log(`📱 ${companyEmail} için FCM token bulunamadı`);
        return { success: false, message: "FCM token bulunamadı" };
      }
      
      // Bildirim mesajını hazırla
      let notificationTitle, notificationBody;
      
      if (approvalStatus === "approved") {
        notificationTitle = "✅ Başvurunuz Onaylandı!";
        notificationBody = `Merhaba ${companyOfficer}, ${companyName} başvurunuz başarıyla onaylandı. Detaylar için uygulamayı kontrol edin.`;
      } else {
        notificationTitle = "❌ Başvurunuz Onaylanmadı";
        notificationBody = `Merhaba ${companyOfficer}, ${companyName} başvurunuz ${reason || "belirtilen sebeplerden dolayı"} onaylanmadı. Lütfen tekrar başvurun.`;
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
        approvalStatus: approvalStatus
      };
      
    } catch (error) {
      console.error("❌ Firma onay bildirimi gönderilirken hata:", error);
      throw new functions.https.HttpsError('internal', 'Bildirim gönderilirken hata oluştu', error);
    }
  }); 
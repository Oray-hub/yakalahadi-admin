const functions = require('firebase-functions');
const admin = require('firebase-admin');

// 📢 Toplu bildirim gönderme fonksiyonu - Firestore trigger v1
exports.sendBulkNotificationTrigger = functions
  .region('europe-west1')
  .runWith({
    minInstances: 0,
    maxInstances: 3000
  })
  .firestore
  .document('bulkNotifications/{notificationId}')
  .onCreate(async (snap, context) => {
    try {
      console.log("📢 Bulk notification event received:", context.params.notificationId);
      
      const notificationData = snap.data();
      const { title, message, type } = notificationData;
      
      if (!title || !message || type !== 'bulk_notification') {
        console.log("❌ Missing parameters in bulk notification data");
        return null;
      }
      
      console.log("🔍 Fetching all users for bulk notification...");
      
      // Tüm kullanıcıları al
      const usersSnapshot = await admin.firestore().collection('users').get();
      
      if (usersSnapshot.empty) {
        console.log("❌ No users found for bulk notification");
        return null;
      }
      
      const users = usersSnapshot.docs;
      console.log(`📱 Found ${users.length} users for bulk notification`);
      
      // FCM topic'e gönder (tüm kullanıcılar)
      const messageData = {
        notification: {
          title: title,
          body: message,
        },
        data: {
          type: "toplu", // ✅ Flutter main dosyasındaki yönlendirme sistemine uygun
          title: title,
          message: message,
          timestamp: new Date().toISOString(),
          // Deep link'ler Flutter'daki YakalaHadiScreen'e yönlendirir
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          screen: "yakala_hadi_screen"
        },
        topic: 'all_users' // Tüm kullanıcılara gönder
      };
      
      console.log("📨 Sending bulk notification to topic 'all_users':", { title, message });
      
      // Toplu bildirimi gönder
      const result = await admin.messaging().send(messageData);
      
      console.log(`📨 Toplu bildirim gönderildi:`, result);
      
      // Dokümanı işaretle
      await admin.firestore().collection('bulkNotifications').doc(context.params.notificationId).update({
        processed: true,
        processedAt: new Date().toISOString(),
        messageId: result,
        userCount: users.length
      });
      
      console.log(`✅ Toplu bildirim tamamlandı: ${users.length} kullanıcıya gönderildi`);
      
      return {
        success: true,
        messageId: result,
        userCount: users.length
      };
      
    } catch (error) {
      console.error("❌ Toplu bildirim gönderilirken hata:", error);
      
      // Hata durumunda dokümanı işaretle
      try {
        await admin.firestore().collection('bulkNotifications').doc(context.params.notificationId).update({
          processed: false,
          error: error.message,
          errorAt: new Date().toISOString()
        });
      } catch (updateError) {
        console.error("❌ Error updating document:", updateError);
      }
      
      return null;
    }
  }); 
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// 🧪 Test bildirimi fonksiyonu
exports.sendTestNotification = functions
  .https.onRequest(async (req, res) => {
  // CORS middleware kullan
  return cors(req, res, async () => {
    try {
      const { fcmToken, message } = req.body;
    
      if (!fcmToken) {
        res.status(400).json({ error: 'FCM token gerekli' });
        return;
      }
      
      const testMessage = message || "Bu bir test bildirimidir.";
      
      // FCM mesajını hazırla
      const notificationMessage = {
        token: fcmToken,
        notification: {
          title: "🧪 Test Bildirimi",
          body: testMessage,
        },
        data: {
          type: "test_notification",
          message: testMessage,
          timestamp: new Date().toISOString(),
        },
      };
      
      // Bildirimi gönder
      const result = await admin.messaging().send(notificationMessage);
      
      console.log(`🧪 Test bildirimi gönderildi:`, result);
      
      res.status(200).json({ 
        success: true, 
        message: "Test bildirimi başarıyla gönderildi",
        messageId: result,
        testMessage: testMessage
      });
      
    } catch (error) {
      console.error("❌ Test bildirimi gönderilirken hata:", error);
      res.status(500).json({ error: 'Test bildirimi gönderilirken hata oluştu', details: error.message });
    }
  });
}); 
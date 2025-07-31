const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// SendGrid email fonksiyonunu import et
const { sendCompanyApprovalEmail } = require('./sendGridEmail');

// Toplu bildirim fonksiyonunu import et
const { sendBulkNotificationTrigger } = require('./bulkNotification');

// Export the functions
exports.sendCompanyApprovalEmail = sendCompanyApprovalEmail;
exports.sendBulkNotificationTrigger = sendBulkNotificationTrigger;

// 🎯 Yeni kampanya bildirimi fonksiyonu - Flutter yönlendirme sistemine uygun
exports.sendNewCampaignNotice = functions
  .region('europe-west1')
  .runWith({
    minInstances: 0,
    maxInstances: 3000
  })
  .firestore
  .document('campaigns/{campaignId}')
  .onCreate(async (snap, context) => {
    try {
      const campaignData = snap.data();
      const campaignId = context.params.campaignId;
      
      console.log(`🎯 Yeni kampanya oluşturuldu: ${campaignId}`);
      
      // Tüm kullanıcıları al
      const usersSnapshot = await admin.firestore().collection('users').get();
      
      if (usersSnapshot.empty) {
        console.log('❌ Kullanıcı bulunamadı');
        return null;
      }
      
      const campaignTitle = campaignData.title || campaignData.campaignTitle || "Yeni Kampanya";
      const campaignDescription = campaignData.description || campaignData.campaignDescription || "Yeni bir kampanya başladı!";
      
      // FCM mesajını hazırla - Flutter main dosyasındaki yönlendirme sistemine uygun
      const message = {
        notification: {
          title: `🎯 ${campaignTitle}`,
          body: campaignDescription,
        },
        data: {
          type: "yakala", // ✅ Flutter main dosyasındaki yönlendirme sistemine uygun
          campaignId: campaignId,
          campaignTitle: campaignTitle,
          timestamp: new Date().toISOString(),
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          screen: "yakala_hadi_campaigns_screen"
        },
        topic: 'all_users' // Tüm kullanıcılara gönder
      };
      
      // Bildirimi gönder
      const result = await admin.messaging().send(message);
      
      console.log(`📨 Yeni kampanya bildirimi gönderildi:`, result);
      
      return result;
      
    } catch (error) {
      console.error("❌ Yeni kampanya bildirimi gönderilirken hata:", error);
      return null;
    }
  });

// 🎁 Yeni indirim bildirimi fonksiyonu - Flutter yönlendirme sistemine uygun
exports.sendNewDiscountNotice = functions
  .region('europe-west1')
  .runWith({
    minInstances: 0,
    maxInstances: 3000
  })
  .firestore
  .document('discounts/{discountId}')
  .onCreate(async (snap, context) => {
    try {
      const discountData = snap.data();
      const discountId = context.params.discountId;
      
      console.log(`🎁 Yeni indirim oluşturuldu: ${discountId}`);
      
      const discountTitle = discountData.title || discountData.discountTitle || "Yeni İndirim";
      const discountDescription = discountData.description || discountData.discountDescription || "Yeni bir indirim başladı!";
      
      // FCM mesajını hazırla - Flutter main dosyasındaki yönlendirme sistemine uygun
      const message = {
        notification: {
          title: `🎁 ${discountTitle}`,
          body: discountDescription,
        },
        data: {
          type: "indirim", // ✅ Flutter main dosyasındaki yönlendirme sistemine uygun
          discountId: discountId,
          discountTitle: discountTitle,
          timestamp: new Date().toISOString(),
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          screen: "discount_campaigns_screen"
        },
        topic: 'all_users' // Tüm kullanıcılara gönder
      };
      
      // Bildirimi gönder
      const result = await admin.messaging().send(message);
      
      console.log(`📨 Yeni indirim bildirimi gönderildi:`, result);
      
      return result;
      
    } catch (error) {
      console.error("❌ Yeni indirim bildirimi gönderilirken hata:", error);
      return null;
    }
  });


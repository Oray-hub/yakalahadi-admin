const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Company approval trigger fonksiyonunu import et
const { sendCompanyApprovalNoticeTrigger } = require('./companyApproval');

// Export the functions
exports.sendCompanyApprovalNoticeTrigger = sendCompanyApprovalNoticeTrigger;

// 🎯 Yeni kampanya bildirimi fonksiyonu - Geçici olarak devre dışı
/*
exports.sendNewCampaignNotice = functions.firestore
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
      
      // FCM mesajını hazırla
      const message = {
        notification: {
          title: `🎯 ${campaignTitle}`,
          body: campaignDescription,
        },
        data: {
          type: "new_campaign",
          campaignId: campaignId,
          campaignTitle: campaignTitle,
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
*/

// 🎁 Yeni indirim bildirimi fonksiyonu - Geçici olarak devre dışı
/*
exports.sendNewDiscountNotice = functions.firestore
  .document('discounts/{discountId}')
  .onCreate(async (snap, context) => {
    try {
      const discountData = snap.data();
      const discountId = context.params.discountId;
      
      console.log(`🎁 Yeni indirim oluşturuldu: ${discountId}`);
      
      const discountTitle = discountData.title || discountData.discountTitle || "Yeni İndirim";
      const discountDescription = discountData.description || discountData.discountDescription || "Yeni bir indirim başladı!";
      
      // FCM mesajını hazırla
      const message = {
        notification: {
          title: `🎁 ${discountTitle}`,
          body: discountDescription,
        },
        data: {
          type: "new_discount",
          discountId: discountId,
          discountTitle: discountTitle,
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
*/
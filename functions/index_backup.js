const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp();

// Global options for callable functions
setGlobalOptions({
  maxInstances: 10,
});

// Admin claim'i verme fonksiyonu
exports.setAdminClaim = onCall({
  cors: true,
  maxInstances: 10,
}, async (request) => {
  try {
    // Authentication kontrolü
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Kullanıcı girişi gerekli');
    }

    const { data } = request;
    const uid = data.uid;
    
    if (!uid) {
      throw new HttpsError('invalid-argument', 'UID gerekli');
    }

    // Admin yetkisi ver
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    
    console.log(`Admin yetkisi verildi: ${uid}`);
    return { 
      success: true,
      message: 'Admin yetkisi başarıyla verildi', 
      uid: uid 
    };
  } catch (error) {
    console.error('setAdminClaim error:', error);
    throw new HttpsError('internal', `Admin yetkisi verilemedi: ${error.message}`);
  }
});

// Admin claim'i kaldırma fonksiyonu
exports.removeAdminClaim = onCall({
  cors: true,
  maxInstances: 10,
}, async (request) => {
  try {
    // Authentication kontrolü
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Kullanıcı girişi gerekli');
    }

    const { data } = request;
    const uid = data.uid;
    
    if (!uid) {
      throw new HttpsError('invalid-argument', 'UID gerekli');
    }

    // Admin yetkisini kaldır
    await admin.auth().setCustomUserClaims(uid, { admin: false });
    
    console.log(`Admin yetkisi kaldırıldı: ${uid}`);
    return { 
      success: true,
      message: 'Admin yetkisi başarıyla kaldırıldı', 
      uid: uid 
    };
  } catch (error) {
    console.error('removeAdminClaim error:', error);
    throw new HttpsError('internal', `Admin yetkisi kaldırılamadı: ${error.message}`);
  }
});

// Admin kullanıcılarını listeleme fonksiyonu
exports.listAdminUsers = onCall({
  cors: true,
  maxInstances: 10,
}, async (request) => {
  try {
    // Authentication kontrolü
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Kullanıcı girişi gerekli');
    }

    const listUsersResult = await admin.auth().listUsers();
    const adminUsers = listUsersResult.users.filter(user => 
      user.customClaims && user.customClaims.admin === true
    );

    console.log(`Admin kullanıcıları listelendi: ${adminUsers.length} adet`);
    return {
      success: true,
      admins: adminUsers.map(user => user.uid)
    };
  } catch (error) {
    console.error('listAdminUsers error:', error);
    throw new HttpsError('internal', `Admin kullanıcıları listelenemedi: ${error.message}`);
  }
}); 

// 🌍 Mesafe hesaplama fonksiyonu
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Dünya yarıçapı (metre)
  const toRad = (value) => value * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 🏢 Firma onay bildirimi fonksiyonu
exports.sendCompanyApprovalNotice = onCall({
  cors: true,
  maxInstances: 10,
  region: "europe-west1"
}, async (request) => {
  const { data } = request;
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
      throw new HttpsError('internal', 'Bildirim gönderilirken hata oluştu', error);
    }
  });

// 🔔 YakalaHadi kampanyaları için bildirim
exports.sendNewCampaignNotice = functions
  .region("europe-west1")
  .firestore.document("campaigns/{campaignId}")
  .onCreate(async (snap, context) => {
    const campaign = snap.data();
    const category = campaign.category || "Genel";
    const campaignLocation = campaign.location;
    const radius = campaign.radius ?? 0;

    if (!campaignLocation) {
      console.log("📍 Kampanya konumu eksik, bildirim gönderilmeyecek.");
      return;
    }

    const usersSnapshot = await admin.firestore().collection("users").get();
    const promises = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      const selected = data.selectedCategories || [];
      const receiveAll = data.receiveAll ?? true;
      const fcmToken = data.fcmToken;
      const userLocation = data.location;

      if (!fcmToken || !userLocation) return;

      const distance = calculateDistance(
        campaignLocation.latitude,
        campaignLocation.longitude,
        userLocation.latitude,
        userLocation.longitude
      );

      const isEligible = distance <= radius && (receiveAll || selected.includes(category));

      if (isEligible) {
        // Parse notificationTitle to remove logoUrl if present
        let notificationTitle = campaign.notificationTitle || "📢 Yeni Kampanya!";
        let logoUrl = '';
        if (notificationTitle.includes('|')) {
          const parts = notificationTitle.split('|');
          if (parts.length > 1) {
            logoUrl = parts[0];
            notificationTitle = parts[1];
          }
        } else if (campaign.companyLogoUrl) {
          logoUrl = campaign.companyLogoUrl;
        }
        const message = {
          token: fcmToken,
          notification: {
            title: notificationTitle,
            body: campaign.notificationBody || "",
            image: logoUrl || undefined,
          },
          data: {
            type: "yakala",
            category: category,
            campaignId: context.params.campaignId,
          },
        };
        promises.push(admin.messaging().send(message));
      }
    });

    try {
      const results = await Promise.all(promises);
      console.log("📨 Gönderilen kampanya bildirim sayısı:", results.length);
    } catch (error) {
      console.error("❌ Bildirim gönderilirken hata:", error);
    }
  });

// 🔔 İndirim kampanyaları için bildirim
exports.sendNewDiscountNotice = functions
  .region("europe-west1")
  .firestore.document("discounts/{discountId}")
  .onCreate(async (snap, context) => {
    const discount = snap.data();
    const category = discount.category || "Genel";
    const discountLocation = discount.location;

    if (!discountLocation) {
      console.log("📍 İndirim konumu eksik, bildirim gönderilmeyecek.");
      return;
    }

    const usersSnapshot = await admin.firestore().collection("users").get();
    const promises = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      const selected = data.selectedCategories || [];
      const receiveAll = data.receiveAll ?? true;
      const fcmToken = data.fcmToken;
      const userLocation = data.location;

      if (!fcmToken || !userLocation) return;

      const distance = calculateDistance(
        discountLocation.latitude,
        discountLocation.longitude,
        userLocation.latitude,
        userLocation.longitude
      );

      const isEligible = distance <= 25000 && (receiveAll || selected.includes(category));

      if (isEligible) {
        // Parse notificationTitle to remove logoUrl if present
        let notificationTitle = discount.notificationTitle || "📢 Yeni İndirim!";
        let logoUrl = '';
        if (notificationTitle.includes('|')) {
          const parts = notificationTitle.split('|');
          if (parts.length > 1) {
            logoUrl = parts[0];
            notificationTitle = parts[1];
          }
        } else if (discount.companyLogoUrl) {
          logoUrl = discount.companyLogoUrl;
        }
        const message = {
          token: fcmToken,
          notification: {
            title: notificationTitle,
            body: discount.notificationBody || "",
            image: logoUrl || undefined,
          },
          data: {
            type: "indirim",
            category: category,
            discountId: context.params.discountId,
          },
        };
        promises.push(admin.messaging().send(message));
      }
    });

    try {
      const results = await Promise.all(promises);
      console.log("📨 Gönderilen indirim bildirim sayısı:", results.length);
    } catch (error) {
      console.error("❌ İndirim bildirimi gönderilirken hata:", error);
    }
  }); 
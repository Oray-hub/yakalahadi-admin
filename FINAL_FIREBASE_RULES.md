# 🔒 Final Firebase Firestore Kuralları (Orijinal + Admin)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Admin kontrolü - Sadece admin@yakalahadi.com için
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email == "admin@yakalahadi.com";
    }

    // 👤 Kullanıcılar
    match /users/{userId} {
      allow create, update: if request.auth != null
        && (
          (request.auth.uid == userId
            && (
              request.resource.data.keys().hasOnly([
                'email', 'receiveAll', 'selectedCategories',
                'location', 'createdAt', 'fcmToken',
                'displayName', 'name', 'notificationsStatus', 'emailVerified', 'termsAccepted', 'privacyAccepted','claimedCount'
              ])
              ||
              request.resource.data.diff(resource.data).affectedKeys().hasOnly(['deletionRequestedAt'])
            ))
          ||
          // 🔥 sistemde başka oturumlar sadece notificationsStatus update edebilsin
          request.resource.data.diff(resource.data).affectedKeys().hasOnly(['notificationsStatus'])
          ||
          isAdmin() // Admin her şeyi yapabilir
        );

      allow get: if request.auth != null
        && request.auth.uid == userId
        && request.auth.token.email_verified == true
        || isAdmin(); // Admin her kullanıcıyı görebilir

      allow list: if true;
      allow delete: if isAdmin(); // Sadece admin silebilir
    }

    // 🏢 Firmalar
    match /companies/{companyId} {
      allow list, get: if true;

      allow create: if request.resource.data.approved == false
        && request.resource.data.keys().hasAll([
          'company', 'vkn', 'phone', 'category', 'firmType', 'createdAt', 'approved'
        ])
        || isAdmin(); // Admin her zaman oluşturabilir

      allow read: if true;

      allow update: if request.auth != null &&
        (
          request.auth.uid == companyId ||
          request.resource.data.diff(resource.data).affectedKeys()
            .hasOnly(['totalScore', 'ratingCount', 'averageRating', 'credit'])
          ||
          isAdmin() // Admin her şeyi güncelleyebilir
        );

      allow delete: if (request.auth != null && request.auth.uid == companyId)
        || isAdmin(); // Admin her firmayı silebilir

      match /ratings/{ratingId} {
        allow create: if request.auth != null;
        allow read, update, delete: if isAdmin(); // Sadece admin yönetebilir
      }

      // YORUMLAR: Kendi yorumunu görebilsin ve silebilsin
      match /reviews/{reviewId} {
        allow create: if request.auth != null;
        allow read: if true; // Herkes görebilir
        allow delete: if request.auth != null && resource.data.userId == request.auth.uid
          || isAdmin(); // Admin her yorumu silebilir
        allow update: if isAdmin(); // Sadece admin güncelleyebilir
      }
    }

    // Tüm reviews collectionGroup sorguları için (Kritik!)
    match /{document=**}/reviews/{reviewId} {
      allow create: if request.auth != null;
      allow read: if true; // Herkes görebilir
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid
        || isAdmin(); // Admin her yorumu silebilir
      allow update: if isAdmin(); // Sadece admin güncelleyebilir
    }

    // 🎯 Kampanyalar
    match /campaigns/{docId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.email_verified == true
        || isAdmin(); // Admin her zaman yazabilir
    }

    // 🎟️ Yakalanan Fırsatlar (Eski)
    match /caught_campaigns/{docId} {
      allow read, write: if request.auth != null
        && request.auth.token.email_verified == true
        || isAdmin(); // Admin her zaman yazabilir
    }

    // ✅ İndirim Kampanyaları
    match /discounts/{docId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.email_verified == true
        || isAdmin(); // Admin her zaman yazabilir
    }

    // ✅ Yakalanan kampanyalar (QR için)
    match /claimedCampaigns/{docId} {
      allow get, list: if request.auth != null
        && request.auth.token.email_verified == true
        || isAdmin(); // Admin her zaman görebilir

      allow create: if request.auth != null
        && request.auth.token.email_verified == true
        || isAdmin(); // Admin her zaman oluşturabilir

      allow update: if request.auth != null
        && request.auth.token.email_verified == true
        && (
          (resource.data.userId == request.auth.uid || request.resource.data.userId == request.auth.uid)
          || (resource.data.companyId == request.auth.uid)
        )
        || isAdmin(); // Admin her zaman güncelleyebilir

      allow delete: if isAdmin(); // Sadece admin silebilir
    }
  }
}
```

## 🎯 Değişiklik Özeti

### ✅ **Eklenen Admin Yetkileri:**
- **Kullanıcılar**: Admin tüm kullanıcıları görebilir, güncelleyebilir, silebilir
- **Firmalar**: Admin tüm firmaları yönetebilir, onay durumunu değiştirebilir
- **Yorumlar**: Admin tüm yorumları düzenleyebilir, silebilir
- **Kampanyalar**: Admin tüm kampanyaları yönetebilir
- **Puanlar**: Admin tüm puanları yönetebilir

### ✅ **Korunan Normal İşlemler:**
- Kullanıcılar kendi verilerini düzenleyebilir
- Firmalar kendi verilerini silebilir
- Kullanıcılar kendi yorumlarını silebilir
- Tüm normal uygulama işlevleri aynen çalışır

### 🛡️ **Güvenlik:**
- Sadece `admin@yakalahadi.com` admin yetkisine sahip
- Normal kullanıcı işlemleri hiç değişmedi
- Minimum değişiklik, maksimum güvenlik 
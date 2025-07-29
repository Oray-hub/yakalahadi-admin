# 🔥 Admin Panel için Firebase Kuralları Güncellemesi

Mevcut kurallarınızı bozmadan admin paneli için tam yetki ekleme rehberi.

## 📋 Mevcut Kurallarınıza Eklenecek Kısımlar

### 1. Admin Fonksiyonu Ekleyin
Kurallarınızın en başına şu fonksiyonu ekleyin:

```javascript
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}
```

### 2. Her Koleksiyona Admin Yetkisi Ekleyin

#### 👤 Users Koleksiyonu
```javascript
match /users/{userId} {
  // ADMIN YETKİSİ - En üste ekleyin
  allow read, write, delete, update, list: if isAdmin();
  
  // MEVCUT KURALLARINIZ - Aynen kalacak
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
      request.resource.data.diff(resource.data).affectedKeys().hasOnly(['notificationsStatus'])
    );

  allow get: if request.auth != null
    && request.auth.uid == userId
    && request.auth.token.email_verified == true;

  allow list: if true;
  allow delete: if false;
}
```

#### 🏢 Companies Koleksiyonu
```javascript
match /companies/{companyId} {
  // ADMIN YETKİSİ - En üste ekleyin
  allow read, write, delete, update, list: if isAdmin();
  
  // MEVCUT KURALLARINIZ - Aynen kalacak
  allow list, get: if true;

  allow create: if request.resource.data.approved == false
    && request.resource.data.keys().hasAll([
      'company', 'vkn', 'phone', 'category', 'firmType', 'createdAt', 'approved'
    ]);

  allow read: if true;

  allow update: if request.auth != null &&
    (
      request.auth.uid == companyId ||
      request.resource.data.diff(resource.data).affectedKeys()
        .hasOnly(['totalScore', 'ratingCount', 'averageRating', 'credit'])
    );

  allow delete: if request.auth != null && request.auth.uid == companyId;

  // Alt koleksiyonlar için de admin yetkisi
  match /ratings/{ratingId} {
    allow read, write, delete, update, list: if isAdmin();
    allow create: if request.auth != null;
    allow read, update, delete: if false;
  }

  match /reviews/{reviewId} {
    allow read, write, delete, update, list: if isAdmin();
    allow create: if request.auth != null;
    allow read: if true;
    allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    allow update: if false;
  }
}
```

#### 🎯 Campaigns Koleksiyonu
```javascript
match /campaigns/{docId} {
  // ADMIN YETKİSİ - En üste ekleyin
  allow read, write, delete, update, list: if isAdmin();
  
  // MEVCUT KURALLARINIZ - Aynen kalacak
  allow read: if true;
  allow write: if request.auth != null
    && request.auth.token.email_verified == true;
}
```

#### 🎟️ Caught Campaigns Koleksiyonu
```javascript
match /caught_campaigns/{docId} {
  // ADMIN YETKİSİ - En üste ekleyin
  allow read, write, delete, update, list: if isAdmin();
  
  // MEVCUT KURALLARINIZ - Aynen kalacak
  allow read, write: if request.auth != null
    && request.auth.token.email_verified == true;
}
```

#### ✅ Discounts Koleksiyonu
```javascript
match /discounts/{docId} {
  // ADMIN YETKİSİ - En üste ekleyin
  allow read, write, delete, update, list: if isAdmin();
  
  // MEVCUT KURALLARINIZ - Aynen kalacak
  allow read: if true;
  allow write: if request.auth != null
    && request.auth.token.email_verified == true;
}
```

#### ✅ Claimed Campaigns Koleksiyonu
```javascript
match /claimedCampaigns/{docId} {
  // ADMIN YETKİSİ - En üste ekleyin
  allow read, write, delete, update, list: if isAdmin();
  
  // MEVCUT KURALLARINIZ - Aynen kalacak
  allow get, list: if request.auth != null
    && request.auth.token.email_verified == true;

  allow create: if request.auth != null
    && request.auth.token.email_verified == true;

  allow update: if request.auth != null
    && request.auth.token.email_verified == true
    && (
      (resource.data.userId == request.auth.uid || request.resource.data.userId == request.auth.uid)
      || (resource.data.companyId == request.auth.uid)
    );

  allow delete: if false;
}
```

#### 📝 Reviews Collection Group
```javascript
match /{document=**}/reviews/{reviewId} {
  // ADMIN YETKİSİ - En üste ekleyin
  allow read, write, delete, update, list: if isAdmin();
  
  // MEVCUT KURALLARINIZ - Aynen kalacak
  allow create: if request.auth != null;
  allow read: if true;
  allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
  allow update: if false;
}
```

## 🔧 Admin Kullanıcısı Oluşturma

### 1. Firebase Console'da Admin Kullanıcısı Oluşturun
1. Firebase Console > Authentication > Users
2. Yeni kullanıcı ekleyin (admin@yakalahadi.com gibi)
3. E-posta doğrulamasını yapın

### 2. Admin Claim'i Ekleyin
Firebase Functions veya Admin SDK ile:

```javascript
// Firebase Functions örneği
exports.setAdminClaim = functions.https.onCall((data, context) => {
  const uid = data.uid; // Admin olacak kullanıcının UID'si
  
  return admin.auth().setCustomUserClaims(uid, { admin: true })
    .then(() => {
      return { message: 'Admin yetkisi verildi' };
    })
    .catch((error) => {
      throw new functions.https.HttpsError('internal', error.message);
    });
});
```

### 3. Admin Panelinde Giriş Yapın
Admin panelinizde bu kullanıcı ile giriş yaptığınızda, tüm yetkilere sahip olacaksınız.

## ⚠️ Önemli Notlar

1. **Sıralama Önemli**: Admin kuralları her zaman en üstte olmalı
2. **Mevcut Kurallar Korunacak**: Normal kullanıcılar için hiçbir şey değişmeyecek
3. **Güvenlik**: Sadece gerçek admin kullanıcılarına bu yetkiyi verin
4. **Test**: Değişiklikleri yaptıktan sonra hem admin hem normal kullanıcı ile test edin

## 🧪 Test Etme

1. Admin kullanıcısı ile giriş yapın
2. Firebase Test sayfasından tüm koleksiyonları test edin
3. Normal kullanıcı ile giriş yapıp mevcut işlevlerin çalıştığını kontrol edin

Bu şekilde mevcut kurallarınız hiç bozulmadan admin paneli tam yetkiye sahip olacak! 🎉 
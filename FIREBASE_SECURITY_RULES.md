# Firebase Güvenlik Kuralları Rehberi

## 🔥 Firebase Console'da Güvenlik Kurallarını Ayarlama

Admin panelinizin Firestore veritabanına erişebilmesi için Firebase Console'da güvenlik kurallarını düzenlemeniz gerekiyor.

### 1. Firebase Console'a Giriş
1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. `yakalahadi-333ca` projesini seçin
3. Sol menüden **Firestore Database** seçin
4. **Rules** sekmesine tıklayın

### 2. Güvenlik Kurallarını Güncelleyin

Aşağıdaki kuralları **Rules** editörüne yapıştırın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin paneli için tam erişim (sadece geliştirme için)
    // PRODUCTION'da bu kuralları daha sıkı hale getirin!
    
    // Kullanıcılar koleksiyonu
    match /users/{userId} {
      allow read, write: if true;
    }
    
    // Firmalar koleksiyonu
    match /companies/{companyId} {
      allow read, write: if true;
    }
    
    // Kampanyalar koleksiyonu
    match /campaigns/{campaignId} {
      allow read, write: if true;
    }
    
    // Yorumlar koleksiyonu
    match /reviews/{reviewId} {
      allow read, write: if true;
    }
    
    // Muhasebe koleksiyonu
    match /accounting/{accountingId} {
      allow read, write: if true;
    }
    
    // Diğer tüm koleksiyonlar için varsayılan kural
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3. Kuralları Yayınlayın
1. **Publish** butonuna tıklayın
2. Değişikliklerin yayınlanmasını bekleyin

### 4. Güvenlik Uyarısı ⚠️

**ÖNEMLİ:** Yukarıdaki kurallar geliştirme ortamı için tasarlanmıştır ve tüm erişime izin verir. Production ortamında daha güvenli kurallar kullanmalısınız:

```javascript
// Production için örnek güvenli kurallar
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Sadece kimlik doğrulaması yapılmış admin kullanıcıları
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.admin == true;
    }
    
    match /users/{userId} {
      allow read, write: if isAdmin();
    }
    
    match /companies/{companyId} {
      allow read, write: if isAdmin();
    }
    
    // ... diğer koleksiyonlar
  }
}
```

### 5. Test Etme

1. Admin panelinizde **Firebase Test** sayfasına gidin
2. **Firebase Testlerini Çalıştır** butonuna tıklayın
3. Tüm koleksiyonlar için başarılı sonuçlar almalısınız

### 6. Hata Durumunda

Eğer hatalar alıyorsanız:

1. **Firebase Console**'da **Authentication** > **Sign-in method** bölümünü kontrol edin
2. **Email/Password** sağlayıcısının etkin olduğundan emin olun
3. **Firestore Database** > **Rules** bölümünde kuralların doğru yayınlandığını kontrol edin
4. Tarayıcı konsolunda hata mesajlarını kontrol edin

### 7. Production Güvenliği

Production ortamında:
- Admin kimlik doğrulaması ekleyin
- IP kısıtlamaları uygulayın
- Rate limiting ekleyin
- Audit logging etkinleştirin

## 🔧 Ek Yapılandırmalar

### Authentication Kuralları
```javascript
// Authentication kuralları (opsiyonel)
match /users/{userId} {
  allow read, write: if request.auth != null && 
                     (request.auth.uid == userId || isAdmin());
}
```

### Veri Doğrulama Kuralları
```javascript
// Veri doğrulama örneği
match /companies/{companyId} {
  allow write: if request.resource.data.keys().hasAll(['company', 'email']) &&
               request.resource.data.company is string &&
               request.resource.data.email is string;
}
```

Bu kuralları uyguladıktan sonra admin paneliniz Firestore veritabanına tam erişim sağlayacaktır. 
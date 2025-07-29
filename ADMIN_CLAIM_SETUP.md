# 🔐 Admin Claim Verme Rehberi

## 🎯 Yöntem 1: Firebase Functions (Önerilen)

### 1. Firebase Functions Projesi Oluşturun
```bash
# Firebase CLI kurun (eğer yoksa)
npm install -g firebase-tools

# Firebase'e giriş yapın
firebase login

# Functions projesi başlatın
firebase init functions
```

### 2. Functions Kodunu Ekleyin
`functions/index.js` dosyasına şu kodu ekleyin:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.setAdminClaim = functions.https.onCall((data, context) => {
  const uid = data.uid;
  
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'UID gerekli');
  }

  return admin.auth().setCustomUserClaims(uid, { admin: true })
    .then(() => {
      return { message: 'Admin yetkisi verildi', uid: uid };
    })
    .catch((error) => {
      throw new functions.https.HttpsError('internal', error.message);
    });
});
```

### 3. Functions'ı Deploy Edin
```bash
firebase deploy --only functions
```

### 4. Admin Panelinde Kullanın
Admin panelinizde şu kodu çalıştırın:

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const setAdminClaim = httpsCallable(functions, 'setAdminClaim');

// Admin olacak kullanıcının UID'si
const targetUID = 'cvtXMH7IY0P8uCW7aAupqcd...'; // admin@yakalahadi.com kullanıcısının UID'si

setAdminClaim({ uid: targetUID })
  .then((result) => {
    console.log('Admin yetkisi verildi:', result.data);
  })
  .catch((error) => {
    console.error('Hata:', error);
  });
```

## 🎯 Yöntem 2: Node.js Script (Hızlı)

### 1. Service Account Key İndirin
1. Firebase Console > Project Settings > Service accounts
2. "Generate new private key" butonuna tıklayın
3. JSON dosyasını indirin ve `serviceAccountKey.json` olarak kaydedin

### 2. Script'i Çalıştırın
```bash
# Firebase Admin SDK kurun
npm install firebase-admin

# Script'i çalıştırın
node set-admin-claim.js
```

## 🎯 Yöntem 3: Firebase Console (Eğer Görünüyorsa)

### 1. Kullanıcıya Tıklayın
- `admin@yakalahadi.com` kullanıcısına tıklayın

### 2. Custom Claims Bölümünü Bulun
- Sağ panelde "Custom claims" bölümünü arayın
- Eğer yoksa, panelin alt kısmına kaydırın
- "Show more" veya "Advanced" butonlarına tıklayın

### 3. Claim Ekleyin
- "Add custom claim" butonuna tıklayın
- Key: `admin`
- Value: `true`
- Save butonuna tıklayın

## 🔍 UID'yi Bulma

Görüntüde `admin@yakalahadi.com` kullanıcısının UID'si: `cvtXMH7IY0P8uCW7aAupqcd...`

Tam UID'yi görmek için:
1. Kullanıcıya tıklayın
2. Sağ panelde "User UID" bölümünde tam UID'yi göreceksiniz

## ✅ Test Etme

Admin yetkisi verdikten sonra:

1. Admin panelinizde bu kullanıcı ile giriş yapın
2. **🔥 Firebase Test** sayfasına gidin
3. **Firebase Testlerini Çalıştır** butonuna tıklayın
4. Tüm koleksiyonlar için başarılı sonuçlar almalısınız

## ⚠️ Önemli Notlar

- Admin yetkisi verdikten sonra kullanıcının yeniden giriş yapması gerekebilir
- Firebase kurallarını güncellediğinizden emin olun
- Sadece güvenilir kullanıcılara admin yetkisi verin

## 🆘 Sorun Giderme

Eğer Custom Claims bölümünü göremiyorsanız:
1. Firebase Functions kullanın (Yöntem 1)
2. Node.js script kullanın (Yöntem 2)
3. Firebase Console'da "Show more" butonlarını kontrol edin 
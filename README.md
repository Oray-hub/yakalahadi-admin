# 🎯 YakalaHadi Admin Panel

YakalaHadi uygulaması için yönetim paneli. Firebase Firestore veritabanı ile entegre çalışır.

## 🚀 Özellikler

- 👥 **Kullanıcı Yönetimi**: Kullanıcıları görüntüleme, düzenleme, silme
- 🏢 **Firma Yönetimi**: Firmaları onaylama, kategorileri düzenleme
- 🎯 **Kampanya Yönetimi**: Kampanyaları görüntüleme ve yönetme
- ⭐ **Yorum Yönetimi**: Kullanıcı yorumlarını ve puanlarını yönetme
- 💰 **Muhasebe Verileri**: Finansal verileri görüntüleme
- 🔥 **Firebase Entegrasyonu**: Gerçek zamanlı veri yönetimi

## 🛠️ Teknolojiler

- **React 19** - Modern UI framework
- **TypeScript** - Tip güvenliği
- **Firebase** - Backend ve veritabanı
- **Firestore** - NoSQL veritabanı
- **React Router** - Sayfa yönlendirme
- **Vite** - Build tool

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build
```

## 🔥 Firebase Yapılandırması

1. Firebase Console'da güvenlik kurallarını ayarlayın
2. `FIREBASE_SECURITY_RULES.md` dosyasını takip edin
3. Firebase Test sayfasından bağlantıyı kontrol edin

## 🌐 Deploy

### Vercel ile Deploy

```bash
# Vercel CLI ile
vercel --prod

# Veya GitHub üzerinden otomatik deploy
```

### Manuel Deploy

```bash
# Build oluştur
npm run build

# dist/ klasörünü web sunucusuna yükle
```

## 📁 Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── Users.tsx       # Kullanıcı yönetimi
│   ├── Companies.tsx   # Firma yönetimi
│   ├── Campaigns.tsx   # Kampanya yönetimi
│   ├── Reviews.tsx     # Yorum yönetimi
│   ├── Accounting.tsx  # Muhasebe verileri
│   └── FirebaseTest.tsx # Firebase test
├── services/           # Firebase servisleri
│   └── firestoreService.ts
├── firebase.ts         # Firebase yapılandırması
├── firebaseConfig.ts   # Firebase ayarları
├── Login.tsx          # Giriş sayfası
└── App.tsx            # Ana uygulama
```

## 🔐 Güvenlik

- Admin/operatör rol kontrolü
- Firebase güvenlik kuralları
- HTTPS zorunluluğu

## 📊 Kullanım

1. Admin paneline giriş yapın
2. Sol menüden istediğiniz bölümü seçin
3. Verileri görüntüleyin, düzenleyin veya silin
4. Firebase Test sayfasından bağlantıyı kontrol edin

## 🐛 Sorun Giderme

- Firebase bağlantı sorunları için `FIREBASE_SECURITY_RULES.md` dosyasını kontrol edin
- Build hataları için TypeScript hatalarını düzeltin
- Deploy sorunları için Vercel loglarını kontrol edin

## 📝 Lisans

Bu proje YakalaHadi için özel olarak geliştirilmiştir. 
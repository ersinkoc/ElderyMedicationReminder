# İlaç Takip - Yaşlılar İçin İlaç Hatırlatma Uygulaması

Yaşlı bireylerin ilaç takibini kolaylaştıran, bakıcı ve yaşlı kullanıcılar arasında gerçek zamanlı senkronizasyon sağlayan bir Progressive Web App (PWA).

## Özellikler

### Yaşlı Arayüzü
- Anonim giriş (hesap oluşturmaya gerek yok)
- 6 haneli eşleştirme kodu ile bakıcıya bağlanma
- Günlük ilaç listesi (Sabah / Öğle / Akşam / Gece grupları)
- Tek dokunuşla "İçtim" veya "Atladım" işaretleme
- Gerçek zamanlı ilerleme çubuğu
- Tüm ilaçlar alındığında konfeti animasyonu

### Bakıcı Arayüzü
- E-posta/Şifre veya Google ile giriş
- Birden fazla yaşlıyı yönetebilme
- İlaç ekleme, düzenleme ve silme
- Görsel hap özelleştirme (şekil, renk, boyut)
- İlaç geçmişi ve günlük durum takibi
- Gerçek zamanlı durum güncellemeleri

### PWA
- Ana ekrana eklenebilir (mobil uygulama deneyimi)
- Service worker ile offline destek
- Otomatik güncelleme

## Teknoloji

- **React 19** + **TypeScript**
- **Firebase** (Authentication + Cloud Firestore)
- **Tailwind CSS 4**
- **Vite 7** + **vite-plugin-pwa**
- **Lucide React** (ikonlar)
- **date-fns** (tarih işlemleri, Türkçe locale)

## Kurulum

### 1. Depoyu klonla

```bash
git clone <repo-url>
cd ElderyMedicationReminder/ilac-takip
npm install
```

### 2. Firebase Projesi Oluştur

1. [Firebase Console](https://console.firebase.google.com/) adresine git
2. **"Add project"** ile yeni proje oluştur
3. **Authentication** servisini etkinleştir:
   - Authentication > Sign-in method sekmesine git
   - **Email/Password** provider'ını etkinleştir
   - **Google** provider'ını etkinleştir
   - **Anonymous** provider'ını etkinleştir
4. **Cloud Firestore** veritabanı oluştur:
   - Firestore Database > Create database
   - Production mode veya test mode seçebilirsin
5. **Web uygulaması** ekle:
   - Project Overview > Add app > Web (</> ikonu)
   - Uygulama adı gir ve "Register app" de
   - Gösterilen `firebaseConfig` değerlerini kopyala

### 3. Environment Değişkenlerini Ayarla

`.env.example` dosyasını `.env` olarak kopyala ve Firebase config değerlerini yapıştır:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 4. Firestore Güvenlik Kuralları

Firebase Console > Firestore Database > Rules sekmesine aşağıdaki kuralları ekle:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Kullanıcılar kendi profillerini okuyup yazabilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }

    // Yaşlı profilleri - eşleştirme kodu ile sorgulanabilir
    match /elders/{elderId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // İlaçlar - ilgili bakıcı ve yaşlı erişebilir
    match /medications/{medId} {
      allow read, write: if request.auth != null;
    }

    // İlaç logları - ilgili bakıcı ve yaşlı erişebilir
    match /logs/{logId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Uygulamayı Başlat

```bash
npm run dev
```

Tarayıcıda `http://localhost:5173` adresinde açılacaktır.

## Firestore Veri Yapısı

### `users` koleksiyonu
| Alan | Tip | Açıklama |
|------|-----|----------|
| `uid` | string | Kullanıcı ID (doc ID) |
| `role` | `'elder'` \| `'caretaker'` | Kullanıcı rolü |
| `displayName` | string | Görünen ad |
| `linkedTo` | string[] | Bağlı yaşlı UID'leri (bakıcılar için) |
| `createdAt` | Timestamp | Oluşturulma tarihi |

### `elders` koleksiyonu
| Alan | Tip | Açıklama |
|------|-----|----------|
| `uid` | string | Yaşlı kullanıcı ID (doc ID) |
| `name` | string | İsim |
| `pairingCode` | string | 6 haneli eşleştirme kodu |
| `caretakers` | string[] | Bağlı bakıcı UID'leri |

### `medications` koleksiyonu
| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | string | İlaç ID (doc ID) |
| `elderId` | string | Yaşlı referansı |
| `name` | string | İlaç adı |
| `dosage` | string | Dozaj bilgisi |
| `notes` | string | Notlar |
| `times` | string[] | Saatler (ör: `["08:00", "20:00"]`) |
| `pill` | object | `{ shape, color, size }` |
| `active` | boolean | Aktif/pasif durumu |
| `createdBy` | string | Ekleyen bakıcı UID |
| `createdAt` | Timestamp | Oluşturulma tarihi |

### `logs` koleksiyonu
| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | string | Log ID (doc ID) |
| `elderId` | string | Yaşlı referansı |
| `medicationId` | string | İlaç referansı |
| `medicationName` | string | İlaç adı (denormalize) |
| `scheduledTime` | string | Planlanan saat |
| `scheduledDate` | string | Planlanan tarih |
| `status` | `'taken'` \| `'skipped'` \| `'pending'` | Durum |
| `actionTime` | Timestamp \| null | İşlem zamanı |
| `createdAt` | Timestamp | Oluşturulma tarihi |

## Kullanım Akışı

### Yaşlı kullanıcı
1. Ana sayfada **"Ben Yaşlıyım"** seç
2. Otomatik anonim giriş yapılır ve 6 haneli kod gösterilir
3. Bu kodu bakıcıya ilet
4. Ana ekranda günlük ilaçları gör ve işaretle

### Bakıcı
1. Ana sayfada **"Refakatçiyim"** seç
2. E-posta/şifre veya Google ile giriş yap
3. **"Yaşlı Ekle"** butonuna bas ve 6 haneli kodu gir
4. Eşleştirme tamamlandıktan sonra ilaçları yönet
5. Dashboard'dan tüm yaşlıların günlük durumunu takip et

## Scriptler

```bash
npm run dev       # Geliştirme sunucusu
npm run build     # Production build (TypeScript check + Vite build)
npm run preview   # Build edilmiş uygulamayı önizle
npm run lint      # ESLint kontrolü
```

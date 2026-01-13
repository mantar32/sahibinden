# İlan Platformu 📦

Türkiye'nin güvenilir ilan platformu. Sahibinden.com benzeri modern bir ilan sitesi.

## 🎯 Özellikler

- ✅ Kullanıcı kayıt ve giriş (JWT)
- ✅ İlan ekleme, düzenleme, silme
- ✅ Adım adım ilan oluşturma sihirbazı
- ✅ Kategori ve alt kategori yapısı
- ✅ Gelişmiş filtreleme (fiyat, şehir, kategori)
- ✅ Favorilere ekleme
- ✅ Görsel galeri
- ✅ Admin paneli (ilan onay, kullanıcı yönetimi)
- ✅ SEO uyumlu URL yapısı
- ✅ Responsive tasarım

## 🛠 Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 18 + CSS |
| Backend | Node.js + Express |
| Auth | JWT Token |
| Veri | In-memory (Mock DB) |

## 📁 Dosya Yapısı

```
ilan-platformu/
├── backend/
│   ├── server.js          # API + Mock DB
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/    # UI componentler
│   │   ├── pages/         # Sayfa componentleri
│   │   ├── context/       # Auth context
│   │   ├── utils/         # API yardımcıları
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## 🚀 Kurulum

### 1. Backend

```bash
cd ilan-platformu/backend
npm install
npm start
```

Backend `http://localhost:5000` adresinde çalışır.

### 2. Frontend

```bash
cd ilan-platformu/frontend
npm install
npm start
```

Frontend `http://localhost:3000` adresinde çalışır.

## 👤 Demo Hesapları

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Kullanıcı | ahmet@example.com | 123456 |
| Kullanıcı | fatma@example.com | 123456 |
| Admin | admin@ilanplatformu.com | 123456 |

## 📱 Sayfalar

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| Ana Sayfa | `/` | Kategoriler, vitrin ilanlar |
| Kategori | `/kategori/:slug` | Filtrelenebilir ilan listesi |
| İlan Detay | `/ilan/:id/:slug` | Galeri, açıklama, satıcı |
| İlan Ver | `/ilan-ver` | 4 adımlı sihirbaz |
| Profil | `/profil` | Kullanıcı ilanları |
| Favoriler | `/favorilerim` | Kaydedilen ilanlar |
| Giriş | `/giris` | Login formu |
| Kayıt | `/kayit` | Register formu |
| Admin | `/admin` | İlan/kullanıcı yönetimi |

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Kayıt ol
- `POST /api/auth/login` - Giriş yap
- `GET /api/auth/me` - Profil bilgisi

### İlanlar
- `GET /api/listings` - Tüm ilanlar (filtreli)
- `GET /api/listings/featured` - Vitrin ilanlar
- `GET /api/listings/:id` - Tek ilan
- `POST /api/listings` - İlan oluştur
- `PUT /api/listings/:id` - İlan güncelle
- `DELETE /api/listings/:id` - İlan sil

### Kategoriler
- `GET /api/categories` - Tüm kategoriler

### Favoriler
- `GET /api/favorites` - Favorilerim
- `POST /api/favorites/:listingId` - Favoriye ekle
- `DELETE /api/favorites/:listingId` - Favoriden çıkar

### Admin
- `GET /api/admin/listings` - Tüm ilanlar
- `PUT /api/admin/listings/:id/approve` - İlan onayla
- `PUT /api/admin/listings/:id/reject` - İlan reddet
- `GET /api/admin/users` - Tüm kullanıcılar
- `PUT /api/admin/users/:id/ban` - Kullanıcı banla

## 🎨 Tasarım

- **Renk Paleti**: Sarı (#FFB800), Koyu Gri (#1F2937)
- **Font**: Inter (Google Fonts)
- **Layout**: Grid tabanlı, responsive
- **Tema**: Sahibinden hissi veren modern UI

## 📝 Notlar

- Backend in-memory veritabanı kullanır (yeniden başlatınca veriler sıfırlanır)
- Görseller URL olarak eklenir (gerçek upload yok)
- Tüm ilanlar onay bekliyor durumunda başlar

---

Geliştirici: İlanBul Ekibi | 2024

<div align="center">

# 🏠 PIK 2 PROPERTY

### Katalog Properti & Hunian Pilihan di PIK 2

Website katalog properti berbasis **Laravel 11 + Filament v3** untuk menampilkan project properti (rumah, ruko, gudang, apartemen, kavling) dengan alur konversi: **Properti → Project → Brosur → WhatsApp**.

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![Filament](https://img.shields.io/badge/Filament-v3-50A5E6?style=flat-square&logo=filament&logoColor=white)](https://filamentphp.com)
[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?style=flat-square&logo=php&logoColor=white)](https://php.net)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📋 Daftar Isi

- [Tentang Project](#-tentang-project)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Arsitektur Project](#-arsitektur-project)
- [Struktur Direktori](#-struktur-direktori)
- [Database Schema](#-database-schema)
- [Color Palette](#-color-palette)
- [Instalasi & Setup](#-instalasi--setup)
- [Cara Menjalankan](#-cara-menjalankan)
- [Admin Panel](#-admin-panel)
- [Routes](#-routes)
- [Layanan Kustom](#-layanan-kustom)
- [Catatan Pengembangan](#-catatan-pengembangan)

---

## 📖 Tentang Project

**PIK 2 Property** adalah platform marketing/katalog properti yang fokus pada **penjualan langsung** (bukan marketplace). Pengunjung dapat:

1. Menjelajahi daftar **project properti** di kawasan PIK 2
2. Melihat **detail project** lengkap dengan galeri gambar
3. Mengunduh / melihat **brosur** unit
4. Menghubungi **sales** langsung via **WhatsApp**

Tujuannya: mengubah visitor menjadi prospek melalui jalur WhatsApp dengan pengalaman browsing yang cepat dan SEO-friendly.

---

## ✨ Fitur Utama

| Kategori | Fitur |
|----------|-------|
| 🏠 **Frontend** | Homepage dengan hero section dinamis, daftar project, detail project + galeri |
| 📊 **Admin** | Panel Filament v3 untuk kelola Projects, Menus, Home Settings, Site Settings |
| 🖼️ **Gambar** | Optimasi otomatis ke **WebP** (resize max 1920px, quality 82) via Intervention Image v3 |
| 🔍 **SEO** | Meta tags dinamis, Open Graph, sitemap.xml, robots.txt |
| 🧭 **Navigasi** | Menu hierarki (parent/child) dengan drag-to-reorder di admin |
| 💬 **WhatsApp** | Tombol mengambang + nomor sales per-project, nomor global site |
| 🔗 **Slug** | Auto-generate slug unik dari nama project |
| 🎬 **Hero** | Hero section dengan embed YouTube, CTA ganda (primary & secondary) |
| 🏷️ **Promo** | Flag is_promo untuk menandai project unggulan |

---

## 🛠️ Tech Stack

| Lapisan | Teknologi |
|---------|-----------|
| **Backend** | Laravel 11.x, PHP 8.2+ |
| **Admin Panel** | Filament v3.2+ + spatie-laravel-media-library-plugin |
| **Frontend** | Blade, Tailwind CSS v3, Alpine.js (+ @alpinejs/collapse) |
| **Asset Bundler** | Vite v6, laravel-vite-plugin |
| **Image Processing** | Intervention Image v3.0 (GD / Imagick) |
| **SEO** | spatie/laravel-sitemap v7 |
| **Database** | SQLite (dev) — schema MySQL-compatible |
| **Font** | Plus Jakarta Sans (Google Fonts) |

---

## 🏗️ Arsitektur Project

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Browser    │────▶│  Routes (web.php) │────▶│ Controllers  │
└─────────────┘     └──────────────────┘     └──────┬───────┘
                                                     │
                          ┌──────────────────────────┘
                          ▼
                   ┌─────────────┐         ┌───────────────┐
                   │   Models    │────────▶│   Database    │
                   │  (Eloquent) │         │   (SQLite)    │
                   └──────┬──────┘         └───────────────┘
                          │
                   ┌──────┴──────┐
                   ▼             ▼
            ┌────────────┐ ┌──────────────┐
            │  Services  │ │   Filament   │
            │ (Image,    │ │  Resources   │
            │  Project)  │ │  (Admin UI)  │
            └────────────┘ └──────────────┘
                          │
                   ┌──────┴──────┐
                   ▼             ▼
            ┌────────────┐ ┌──────────────┐
            │  Storage   │ │  Views       │
            │  (public)  │ │  (Blade)     │
            └────────────┘ └──────────────┘
```

### Alur Konversi

```
HOMEPAGE ──▶ PROJECT LIST ──▶ PROJECT DETAIL ──▶ GALERI/BROSUR ──▶ WHATSAPP
   │                                                              │
   └──── Hero CTA ◀─────────────── Related Projects ──────────────┘
```

---

## 📂 Struktur Direktori

```
pik2-property/
├── app/
│   ├── Filament/
│   │   ├── Pages/
│   │   │   └── HomeSettingPage.php        # Halaman pengaturan homepage
│   │   └── Resources/
│   │       ├── MenuResource.php           # Kelola navigasi menu
│   │       ├── ProjectResource.php        # Kelola project properti
│   │       ├── ProjectResource/
│   │       └── MenuResource/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── HomeController.php         # Homepage
│   │       ├── ProjectController.php      # Detail project
│   │       └── SitemapController.php      # sitemap.xml
│   ├── Models/
│   │   ├── HomeSetting.php                # Konfigurasi hero & promo
│   │   ├── Menu.php                       # Navigasi (self-referential)
│   │   ├── Project.php                    # Project properti utama
│   │   ├── ProjectImage.php               # Galeri gambar project
│   │   ├── SiteSetting.php                # Pengaturan global site
│   │   └── User.php
│   ├── Providers/
│   │   ├── AppServiceProvider.php         # Bind ImageManager (GD/Imagick)
│   │   └── Filament/
│   │       └── AdminPanelProvider.php     # Konfigurasi panel admin
│   └── Services/
│       ├── ImageOptimizationService.php   # Resize + WebP conversion
│       └── ProjectImageService.php        # Upload & manage gambar project
├── database/
│   ├── migrations/                        # 5 tabel domain + default Laravel
│   ├── factories/
│   └── seeders/                           # Seed data lengkap
├── resources/
│   ├── css/app.css                        # Tailwind + Google Fonts import
│   ├── js/app.js                          # Alpine.js bootstrap
│   └── views/
│       ├── home.blade.php                 # Halaman utama
│       ├── projects/show.blade.php        # Detail project
│       ├── layouts/app.blade.php          # Layout utama
│       ├── components/                    # navbar, project-card, whatsapp-btn
│       └── partials/footer.blade.php
├── routes/
│   └── web.php                            # Frontend routes
└── public/
    ├── build/                             # Vite compiled assets
    └── storage -> ../storage/app/public   # Symlink gambar
```

---

## 🗄️ Database Schema

### `projects`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint | PK |
| name | string | Nama project |
| slug | string (unique) | URL slug, auto-generate |
| short_description | text | Deskripsi singkat |
| location | string | Lokasi project |
| cover_image | string | Path gambar cover |
| is_promo | boolean | Flag project unggulan |
| whatsapp_number | string | Nomor WA sales project |
| meta_title | string | SEO title (opsional) |
| meta_description | text | SEO description (opsional) |

### `project_images`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint | PK |
| project_id | FK → projects | cascade delete |
| image_path | string | Path gambar (WebP) |
| sort_order | int | Urutan tampil |

### `menus` (self-referential hierarchy)
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint | PK |
| label | string | Teks menu |
| url | string | URL tujuan |
| parent_id | FK → menus | null = top-level |
| sort_order | int | Urutan (drag di admin) |
| is_active | boolean | Tampil/sembunyi |
| open_in_new_tab | boolean | Target _blank |

### `home_settings` (single record)
Hero section (youtube_url, title, description, 2 CTA) + Promo section (subtitle, title, description, benefits JSON).

### `site_settings` (single record)
Global: sales_whatsapp_number, site_name, site_tagline, topbar_label.

---

## 🎨 Color Palette

| Token | Hex | Warna | Penggunaan |
|-------|-----|-------|------------|
| `primary` | `#3F4095` | French Blue | Header, tombol utama, brand |
| `accent` | `#7BA138` | Sage Green | Highlight, CTA sekunder, badge |
| `neutral` / `powder` | `#AEB9CD` | Powder Blue | Background section, divider |

Font: **Plus Jakarta Sans** (didefinisikan di tailwind.config.js).

---

## 🚀 Instalasi & Setup

### Prasyarat

- PHP **8.2+** (XAMPP: /Applications/XAMPP/xamppfiles/bin/php-8.2.4)
- Composer
- Node.js + npm
- Ekstensi PHP: gd atau imagick, pdo_sqlite, mbstring, xml

### Langkah Instalasi

```bash
# 1. Clone repository
git clone <repo-url> pik2-property
cd pik2-property

# 2. Install dependency PHP
composer install

# 3. Install dependency frontend
npm install

# 4. Siapkan environment
cp .env.example .env
php artisan key:generate

# 5. Konfigurasi .env (penting!)
#    APP_URL=http://127.0.0.1:8000   (BUKAN localhost)
#    DB_CONNECTION=sqlite

# 6. Jalankan migrasi + seeder
php artisan migrate --seed

# 7. Buat symlink storage
php artisan storage:link

# 8. Build assets
npm run build    # produksi
# atau
npm run dev      # development (watch)
```

---

## ▶️ Cara Menjalankan

```bash
# Terminal 1 — Build & watch assets (opsional saat develop)
npm run dev

# Terminal 2 — Jalankan server
php artisan serve
```

Akses:
- **Frontend**: http://127.0.0.1:8000
- **Admin Panel**: http://127.0.0.1:8000/admin

---

## 🔐 Admin Panel

Panel admin dibangun dengan **Filament v3** dan dapat diakses di /admin.

### Kredensial Default

| Field | Nilai |
|-------|-------|
| Email | admin@pik2property.com |
| Password | password |

### Menu Admin

| Resource | Fungsi |
|----------|--------|
| **Projects** | CRUD project properti + upload gambar (auto WebP), set promo, nomor WA, SEO meta |
| **Menus** | Kelola navigasi dengan drag-to-reorder, parent/child hierarchy |
| **Home Settings** | Atur hero section (YouTube, title, deskripsi, CTA) & promo section |
| **Site Settings** | Nomor WA global, nama site, tagline, label topbar |

---

## 🛣️ Routes

| Method | Path | Controller | Keterangan |
|--------|------|------------|------------|
| GET | / | HomeController@index | Homepage |
| GET | /project/{slug} | ProjectController@show | Detail project |
| GET | /sitemap.xml | SitemapController@index | XML sitemap |
| GET | /robots.txt | closure | Robots (disallow /admin) |
| GET | /admin | Filament | Panel admin |

---

## ⚙️ Layanan Kustom

### ImageOptimizationService

Memproses gambar upload dengan pipeline:

```
Validasi ──▶ Read ──▶ Resize (max 1920px, no upscale) ──▶ Encode WebP (q82) ──▶ Store
```

- Mendeteksi driver **Imagick** jika tersedia, fallback ke **GD**
- Output selalu **WebP** untuk performa & kompatibilitas modern browser

### ProjectImageService

Mengelola upload, penyimpanan, dan penghapusan gambar project terkait.

---

## 📝 Catatan Pengembangan

> ⚠️ **Penting — simpan sebagai referensi teknis:**

1. **APP_URL** di .env **harus** http://127.0.0.1:8000 (bukan localhost) — localhost menyebabkan URL gambar rusak.
2. **Middleware Fix**: AdminPanelProvider sebelumnya menggunakan nama class middleware yang salah DispatchServingFilamentPHPEvents. Yang benar: DispatchServingFilamentEvent (singular, tanpa prefix "PHP").
3. **WebP & GD**: Ekstensi GD lokal tidak mendukung encode WebP, sehingga dev menggunakan PNG placeholder. Produksi sebaiknya pakai Imagick.
4. **CSS Google Fonts**: @import font **harus diletakkan sebelum** direktif @tailwind di app.css.
5. **Path PHP**: Gunakan path absolut /Applications/XAMPP/xamppfiles/bin/php-8.2.4 jika PHP global belum diset.
6. **Terminal**: Tool terminal otomatis menghapus prefix cd — gunakan path absolut dalam perintah.

---

## 📄 License

Project ini open-sourced di bawah lisensi [MIT](https://opensource.org/licenses/MIT).

---

<div align="center">

**PIK 2 PROPERTY** — Dibangun dengan Laravel + Filament + Tailwind CSS

</div>

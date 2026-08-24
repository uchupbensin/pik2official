# PIK 2 Property Website

Proyek ini dibangun menggunakan Next.js (App Router) dan Prisma ORM dengan SQLite.

## Persyaratan Sistem

Untuk menghindari error versi, pastikan Anda menggunakan versi Node.js yang sesuai. Proyek ini dikembangkan dengan **Node.js v22**.

Disarankan menggunakan [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm). Jika Anda sudah menginstal NVM, Anda cukup menjalankan perintah berikut di folder proyek ini:

```bash
nvm use
```
(Jika versinya belum terinstal, jalankan `nvm install 22`)

## Cara Instalasi & Menjalankan Proyek di Komputer Baru

Jika Anda (atau teman Anda) baru saja melakukan *clone* / mengunduh repositori ini dari GitHub, file *database* (`dev.db`) dan folder gambar yang diunggah (`public/storage`) **TIDAK IKUT TERBAWA** karena telah dimasukkan ke dalam `.gitignore`.

Ikuti langkah-langkah berikut agar aplikasi bisa berjalan normal tanpa *error*:

### 1. Instal Dependensi
Jalankan perintah ini untuk menginstal semua *library* (sebaiknya gunakan perintah `ci` untuk memastikan versi package persis sama dengan yang dipakai sebelumnya):
```bash
npm ci
# atau jika gagal, gunakan npm install
```

### 2. Konfigurasi Database (Prisma)
Karena database SQLite tidak diunggah ke GitHub, Anda perlu membuatnya terlebih dahulu. Jalankan perintah ini:
```bash
npx prisma db push
```
*(Perintah ini akan membaca file `schema.prisma`, lalu membuat file `dev.db` kosong secara lokal sesuai dengan struktur tabel yang dibutuhkan)*

### 3. Generate Prisma Client
Agar Next.js mengenali skema database terbaru:
```bash
npx prisma generate
```

### 4. Jalankan Aplikasi
Jalankan development server:
```bash
npm run dev
```
Buka browser dan akses [http://localhost:3000](http://localhost:3000).

## 🪟 Catatan Khusus Pengguna Windows
Jika teman Anda menggunakan OS Windows, perhatikan beberapa hal berikut:
1. **NVM di Windows**: Gunakan [nvm-windows](https://github.com/coreybutler/nvm-windows) (berbeda dengan NVM versi Mac/Linux). Setelah diinstal, perintah `nvm use` atau `nvm install 22` akan tetap sama.
2. **Terminal yang Disarankan**: Sangat disarankan untuk menggunakan **Git Bash**, **PowerShell**, atau terminal bawaan **VS Code**.
3. **Prisma & WSL**: Jika menggunakan WSL (Windows Subsystem for Linux), pastikan Anda menjalankan perintah `npm install` dan `npx prisma db push` di dalam environment yang sama (jangan di-campur antara Command Prompt biasa dengan WSL) agar *binary engine* Prisma bisa terunduh dengan benar.

## Catatan Penting
- Karena database baru di-_generate_, datanya **masih kosong**. Anda perlu login ke dashboard admin dan membuat properti baru secara manual.
- Data yang diupload (gambar cover, gambar PDF) akan tersimpan di dalam folder `public/storage`. Folder ini juga hanya tersedia di lokal komputer masing-masing pengembang.

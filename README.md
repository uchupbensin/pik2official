# PIK 2 Property Website

Proyek ini dibangun menggunakan **Next.js (App Router)** dan **Prisma ORM** (SQLite).

## Persiapan (Setup)

Pastikan menggunakan **Node.js v22**. Anda bisa menggunakan `nvm`:
```bash
nvm use
```

## Menjalankan Proyek di Lokal

1. **Instal Dependensi**
   ```bash
   npm ci
   ```
2. **Siapkan Database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```
3. **Jalankan Server**
   ```bash
   npm run dev
   ```
   Akses di [http://localhost:3000](http://localhost:3000).

## Catatan Tambahan
- Data pada database awal kosong, silakan login ke halaman Admin untuk menambahkan data properti.
- Gambar-gambar upload tersimpan secara lokal di dalam folder `public/storage`.

# Log Perubahan (Changelog)

File ini dibuat untuk mencatat perubahan terbaru yang dilakukan pada proyek agar tim pengembang tetap sinkron dan tidak kebingungan.

## Perubahan Konfigurasi & Environment
1. **Prisma 7 & SQLite**:
   - Sempat terjadi *conflict* karena *driver adapter* `better-sqlite3` di Prisma 7 gagal diinstal di Windows.
   - **Solusi**: Pengembang Windows saat ini diwajibkan untuk menginstal **Visual Studio Build Tools** (Workload: *Desktop development with C++*) agar compiler C++ tersedia dan perintah `npm install` bisa mengkompilasi `better-sqlite3`. 
   - Konfigurasi `src/lib/prisma.ts` dan `package.json` **tetap dipertahankan** persis seperti aslinya (menggunakan `better-sqlite3`) demi menghindari *conflict* dengan tim.

2. **Git Resolution**:
   - Melakukan `git clean` dan `git reset` untuk menghapus file lokal sementara yang memblokir proses `git pull`.
   - Kode lokal sekarang sudah 100% tersinkronisasi dengan repositori GitHub versi terbaru.

## Perbaikan UI / Frontend
1. **Redesign Bagian Promo (Katalog, Konsultasi, dll) di Halaman Utama (`src/app/page.tsx`)**:
   - Mengubah desain kotak promo yang sebelumnya abu-abu datar (*flat*) menjadi desain *glassmorphism* (kartu putih dengan efek bayangan dan transisi *hover* yang elegan).
   - Menambahkan ikon yang dinamis dan relevan dari `lucide-react` (`Building2`, `BookOpen`, `MessageCircle`, `MapPin`) untuk menggantikan ikon ceklis generik.
   - Merapikan tipografi dan tata letak agar terlihat jauh lebih modern dan mewah.
2. **Penyempurnaan Tampilan Panel Admin**:
   - Memperbaiki warna kolom input (*form*) di seluruh halaman admin (seperti Tambah Properti, Pengaturan Web, Menu Navigasi). Menambahkan latar belakang putih (`bg-white`) dan teks hitam (`text-gray-900`) secara eksplisit agar tulisan tetap terbaca jelas meskipun OS pengguna menggunakan mode gelap (*dark mode*).
   - Membuat tata letak admin menjadi **100% responsif di perangkat mobile**. Menambahkan ikon menu *hamburger*, *slide-in sidebar*, dan layar *overlay* gelap pada `src/app/admin/(dashboard)/layout.tsx` agar admin panel dapat diakses dengan nyaman melalui HP.

## Perbaikan Bug / Code Quality
1. **Perbaikan TypeScript (Lint Error) di `src/app/page.tsx`**:
   - Memperbaiki error `Parameter 'project' implicitly has an 'any' type` pada *looping* daftar properti (baris ~168).
   - Menambahkan tipe data eksplisit `(project: any)` pada `projects.map` agar VS Code tidak lagi menampilkan garis bawah merah (*error*).

## Keamanan (Security)
1. **Migrasi Sesi Admin ke JWT (JSON Web Token)**:
   - Mengganti sistem otentikasi *cookie* teks polos ("authenticated") dengan enkripsi JWT menggunakan pustaka `jose`.
   - Membuat file utilitas `src/lib/auth.ts` untuk memusatkan fungsi pembuatan dan validasi token sesi.
   - Memperbarui `src/middleware.ts` agar memeriksa keabsahan JWT secara ketat pada rute `/admin/*`.

2. **Perlindungan Server Actions (Mencegah Akses Tanpa Otorisasi)**:
   - Menemukan celah di mana fungsi manipulasi database (tambah/hapus properti, pengaturan, menu) bisa diakses dari luar panel admin karena sifat publik Next.js *Server Actions*.
   - Menambahkan mekanisme pengaman `requireAuth()` di setiap awal fungsi (*endpoint*) pada `src/app/admin/actions.ts` sehingga setiap modifikasi data dijamin hanya bisa dilakukan oleh admin yang telah *login* secara sah.

---
*Catatan tambahan: Jika ke depannya ingin mengganti ikon Lucide dengan file gambar (PNG/SVG) sendiri, cukup ubah variabel `IconTag` di `src/app/page.tsx` menjadi tag `<img src="..." />`.*

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://pik2user:pik2password@localhost:5432/pik2db?schema=public'
});

const INITIAL_FACILITIES = [
  {
    title: 'Lokasi & Aksesibilitas',
    category: 'Aksesibilitas',
    badge: '7–15 Menit ke Bandara',
    description: 'Dekat Bandara Internasional Soekarno-Hatta (sekitar 7–15 menit) dan terhubung langsung via Tol Interchange PIK2.',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    sort_order: 1,
  },
  {
    title: 'Pusat Bisnis (CBD PIK2)',
    category: 'Bisnis & Finansial',
    badge: 'Kawasan Komersial Skala Besar',
    description: 'Central Business District modern yang menampung kantor korporasi, pusat finansial, dan area komersial skala besar.',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    sort_order: 2,
  },
  {
    title: 'Destinasi Wisata & Lifestyle',
    category: 'Wisata & Kuliner',
    badge: 'Pasir Putih 4 KM',
    description: "Memiliki garis pantai pasir putih sepanjang 4 km, fasilitas kuliner tematik, dan pusat hiburan tepi laut seperti Aloha Pasir Putih, Land's End, La Riviera, CBD Beachwalk.",
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    sort_order: 3,
  },
  {
    title: 'Green Belt PIK2',
    category: 'Ruang Terbuka Hijau',
    badge: 'Taman Kota Puluhan Hektar',
    description: 'Area terbuka hijau dan taman kota seluas puluhan hektar yang dirancang untuk mendukung gaya hidup sehat dan asri.',
    image_url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80',
    sort_order: 4,
  },
  {
    title: 'Kawasan MICE & Hiburan',
    category: 'MICE & Entertainment',
    badge: 'NICE Convention Exhibition',
    description: 'Terdapat arena konser dan pusat konvensi berstandar internasional (NICE - Nusantara International Convention Exhibition).',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    sort_order: 5,
  },
  {
    title: 'Fasilitas Pendidikan & Kesehatan',
    category: 'Edukasi & Medis',
    badge: 'Universitas & RS Global',
    description: 'Menghadirkan kampus universitas ternama, sekolah internasional dan rumah sakit berskala global.',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    sort_order: 6,
  },
  {
    title: 'Fasilitas Tempat Ibadah',
    category: 'Destinasi Religi',
    badge: 'Multi-Religi Terpadu',
    description: 'Tempat ibadah sekaligus destinasi wisata religi PIK2 seperti Masjid Al-Ikhlas (Riverwalk Island), Taman Doa Our Lady of Akita, Kuil Si Mian Fo (Riverwalk Island), Kelenteng Tian Fu Gong (Riverwalk Island).',
    image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    sort_order: 7,
  },
  {
    title: 'Fasilitas Olahraga & Komunitas',
    category: 'Olahraga & Komunitas',
    badge: 'Bike Lounge & Country Club',
    description: 'Lapangan olahraga modern, jalur sepeda khusus (bike lounge) dan fasilitas country club.',
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    sort_order: 8,
  },
];

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT COUNT(*) FROM facilities');
    const count = parseInt(res.rows[0].count, 10);
    console.log(`Current facilities count: ${count}`);

    if (count === 0) {
      console.log('Seeding initial facilities...');
      for (const item of INITIAL_FACILITIES) {
        await client.query(
          `INSERT INTO facilities (title, category, badge, description, image_url, sort_order, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [item.title, item.category, item.badge, item.description, item.image_url, item.sort_order]
        );
      }
      console.log('Successfully seeded 8 facilities!');
    } else {
      console.log('Facilities already exist. Skipping seed.');
    }
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();

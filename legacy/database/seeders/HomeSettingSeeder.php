<?php

namespace Database\Seeders;

use App\Models\HomeSetting;
use Illuminate\Database\Seeder;

class HomeSettingSeeder extends Seeder
{
    public function run(): void
    {
        HomeSetting::updateOrCreate(['id' => 1], [
            'hero_youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'hero_title' => 'Temukan Properti Pilihan di PIK 2',
            'hero_description' => 'Jelajahi pilihan rumah, ruko, gudang, apartemen, dan kavling di kawasan PIK 2. Temukan project yang sesuai dengan kebutuhan Anda dan dapatkan informasi selengkapnya melalui sales.',
            'hero_primary_cta' => 'Lihat Properti',
            'hero_primary_url' => '#projects',
            'hero_secondary_cta' => 'Konsultasi via WhatsApp',
            'hero_secondary_url' => '#contact',
            'promo_subtitle' => 'PILIHAN PROPERTI PIK 2',
            'promo_title' => 'Temukan Hunian dan Properti yang Sesuai Kebutuhan Anda',
            'promo_description' => 'Lihat berbagai pilihan properti di PIK 2, mulai dari hunian, ruko, gudang, apartemen, hingga kavling. Temukan project yang sesuai dengan kebutuhan dan rencana Anda.',
            'promo_benefits' => [
                'Rumah, ruko, gudang, apartemen, dan kavling dalam satu katalog',
                'Informasi project dan brosur lengkap',
                'Konsultasi langsung melalui sales',
                'Pilihan properti di kawasan PIK 2',
            ],
        ]);
    }
}

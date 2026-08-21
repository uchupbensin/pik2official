<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeSetting extends Model
{
    protected $fillable = [
        'hero_youtube_url',
        'hero_title',
        'hero_description',
        'hero_primary_cta',
        'hero_primary_url',
        'hero_secondary_cta',
        'hero_secondary_url',
        'promo_subtitle',
        'promo_title',
        'promo_description',
        'promo_benefits',
    ];

    protected $casts = [
        'promo_benefits' => 'array',
    ];

    /**
     * Single record repository.
     */
    public static function firstOrNew(): static
    {
        return static::query()->firstOrNew([], [
            'hero_title' => 'Temukan Properti Pilihan di PIK 2',
            'hero_description' => 'Jelajahi pilihan rumah, ruko, gudang, apartemen, dan kavling di kawasan PIK 2. Temukan project yang sesuai dengan kebutuhan Anda dan dapatkan informasi selengkapnya melalui sales.',
            'hero_primary_cta' => 'Lihat Properti',
            'hero_primary_url' => '#projects',
            'hero_secondary_cta' => 'Konsultasi via WhatsApp',
            'hero_secondary_url' => '#contact',
            'promo_subtitle' => 'PILIHAN PROPERTI PIK 2',
            'promo_title' => 'Temukan Hunian dan Properti yang Sesuai Kebutuhan Anda',
            'promo_description' => 'Lihat berbagai pilihan properti di PIK 2, mulai dari hunian, ruko, gudang, apartemen, hingga kavling. Temukan project yang sesuai dengan kebutuhan dan rencana Anda.',
            'promo_benefits' => [],
        ]);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = [
        'sales_whatsapp_number',
        'site_name',
        'site_tagline',
        'topbar_label',
    ];

    public static function current(): static
    {
        return static::query()->firstOrNew([], [
            'sales_whatsapp_number' => '6281234567890',
            'site_name' => 'PIK 2 PROPERTY',
            'site_tagline' => 'Katalog Properti & Hunian Pilihan di PIK 2',
            'topbar_label' => 'Sales Property',
        ]);
    }
}

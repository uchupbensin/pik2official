<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        SiteSetting::updateOrCreate(['id' => 1], [
            'sales_whatsapp_number' => '6281234567890',
            'site_name' => 'PIK 2 PROPERTY',
            'site_tagline' => 'Katalog Properti & Hunian Pilihan di PIK 2',
            'topbar_label' => 'Sales Property',
        ]);
    }
}

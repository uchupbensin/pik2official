<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'PIK 2 Admin',
            'email' => 'admin@pik2property.com',
        ]);

        $this->call([
            SiteSettingSeeder::class,
            HomeSettingSeeder::class,
            MenuSeeder::class,
            ProjectSeeder::class,
        ]);
    }
}

<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        Menu::truncate();

        $menus = [
            ['label' => 'HOME', 'url' => '/', 'sort_order' => 1],
            ['label' => 'PROGRES PIK 2', 'url' => '/progres-pik-2', 'sort_order' => 2],
        ];

        foreach ($menus as $menu) {
            Menu::create($menu);
        }

        // RUMAH with submenus
        $rumah = Menu::create([
            'label' => 'RUMAH',
            'url' => '#',
            'sort_order' => 3,
        ]);

        foreach (['Cluster A', 'Cluster B', 'Cluster C'] as $i => $label) {
            Menu::create([
                'label' => $label,
                'url' => '/project/' . Str::slug($label),
                'parent_id' => $rumah->id,
                'sort_order' => $i + 1,
            ]);
        }

        // RUKO & GUDANG with submenus
        $ruko = Menu::create([
            'label' => 'RUKO & GUDANG',
            'url' => '#',
            'sort_order' => 4,
        ]);

        foreach (['Ruko', 'Gudang'] as $i => $label) {
            Menu::create([
                'label' => $label,
                'url' => '/project/' . Str::slug($label),
                'parent_id' => $ruko->id,
                'sort_order' => $i + 1,
            ]);
        }

        // APARTEMEN (no children)
        Menu::create([
            'label' => 'APARTEMEN',
            'url' => '/project/apartemen-pik-2',
            'sort_order' => 5,
        ]);

        // KAVLING (no children)
        Menu::create([
            'label' => 'KAVLING',
            'url' => '/project/kavling-pik-2',
            'sort_order' => 6,
        ]);
    }
}

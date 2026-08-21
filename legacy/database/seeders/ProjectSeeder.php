<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        Project::truncate();
        ProjectImage::truncate();

        $projects = [
            [
                'name' => 'Cluster A',
                'location' => 'PIK 2, Tangerang',
                'short_description' => 'Cluster rumah modern di kawasan strategis PIK 2 dengan konsep hunian nyaman dan tata ruang yang efisien.',
                'cover_image' => 'projects/cluster-a/cover.png',
                'is_promo' => true,
                'whatsapp_number' => '6281234567890',
                'meta_title' => 'Cluster A | Rumah di PIK 2',
                'meta_description' => 'Lihat informasi Cluster A di PIK 2 Property. Temukan detail project, brosur, pilihan unit, dan informasi selengkapnya melalui sales.',
            ],
            [
                'name' => 'Cluster B',
                'location' => 'PIK 2, Tangerang',
                'short_description' => 'Hunian dengan desain kontemporer di PIK 2, cocok untuk keluarga yang mencari kenyamanan dan akses mudah.',
                'cover_image' => 'projects/cluster-b/cover.png',
                'is_promo' => false,
                'whatsapp_number' => '6281234567890',
                'meta_title' => 'Cluster B | Rumah di PIK 2',
                'meta_description' => 'Lihat informasi Cluster B di PIK 2 Property. Temukan detail project, brosur, pilihan unit, dan informasi selengkapnya melalui sales.',
            ],
            [
                'name' => 'Ruko',
                'location' => 'Area Komersial PIK 2',
                'short_description' => 'Ruko dengan lokasi strategis untuk kebutuhan bisnis di kawasan komersial PIK 2.',
                'cover_image' => 'projects/ruko/cover.png',
                'is_promo' => true,
                'whatsapp_number' => '6281234567890',
                'meta_title' => 'Ruko | Properti Komersial PIK 2',
                'meta_description' => 'Lihat informasi Ruko di PIK 2 Property. Temukan detail project, brosur, pilihan unit, dan informasi selengkapnya melalui sales.',
            ],
            [
                'name' => 'Gudang',
                'location' => 'Area Logistik PIK 2',
                'short_description' => 'Gudang dengan akses mudah untuk kebutuhan logistik dan penyimpanan di PIK 2.',
                'cover_image' => 'projects/gudang/cover.png',
                'is_promo' => false,
                'whatsapp_number' => '6281234567890',
                'website_url' => '',
                'meta_title' => 'Gudang | Properti PIK 2',
                'meta_description' => 'Lihat informasi Gudang di PIK 2 Property. temukan detail project, brosur, pilihan unit, dan informasi selengkapnya melalui sales.',
            ],
        ];

        foreach ($projects as $data) {
            unset($data['website_url']);
            $data['slug'] = Str::slug($data['name']);
            $project = Project::create($data);

            // Create 3 dummy brochure images per project
            for ($i = 1; $i <= 3; $i++) {
                ProjectImage::create([
                    'project_id' => $project->id,
                    'image_path' => "projects/{$project->slug}/brochure-00{$i}.png",
                    'sort_order' => $i,
                ]);
            }
        }
    }
}

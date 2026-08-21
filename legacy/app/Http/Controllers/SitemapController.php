<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Response;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url as SitemapUrl;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $sitemap = Sitemap::create()
            ->add(SitemapUrl::create(url('/'))
                ->setPriority(1.0)
                ->setChangeFrequency(SitemapUrl::CHANGE_FREQUENCY_WEEKLY));

        Project::orderBy('updated_at', 'desc')->get()->each(function (Project $project) use ($sitemap) {
            $sitemap->add(SitemapUrl::create(url("/project/{$project->slug}"))
                ->setPriority(0.8)
                ->setLastModificationDate($project->updated_at)
                ->setChangeFrequency(SitemapUrl::CHANGE_FREQUENCY_WEEKLY));
        });

        return response($sitemap->render(), 200, [
            'Content-Type' => 'application/xml',
        ]);
    }
}

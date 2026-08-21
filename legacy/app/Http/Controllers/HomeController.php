<?php

namespace App\Http\Controllers;

use App\Models\HomeSetting;
use App\Models\Menu;
use App\Models\Project;
use App\Models\SiteSetting;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;

class HomeController extends Controller
{
    public function index(): View
    {
        $homeSetting = HomeSetting::firstOrNew();

        $menus = Menu::whereNull('parent_id')
            ->where('is_active', true)
            ->with(['children' => function ($q) {
                $q->where('is_active', true)->orderBy('sort_order');
            }])
            ->orderBy('sort_order')
            ->get();

        $projects = Project::with('images')
            ->orderBy('created_at', 'desc')
            ->get();

        $siteSetting = SiteSetting::current();

        $seo = (object) [
            'title' => 'Properti PIK 2 | Rumah, Ruko, Apartemen & Kavling',
            'description' => 'Temukan pilihan properti di PIK 2, mulai dari rumah, ruko, gudang, apartemen hingga kavling. Lihat project, brosur, dan informasi unit melalui PIK 2 Property.',
            'canonical' => url('/'),
            'ogType' => 'website',
            'ogImage' => $projects->first()?->cover_url,
        ];

        return view('home', compact('homeSetting', 'menus', 'projects', 'siteSetting', 'seo'));
    }
}

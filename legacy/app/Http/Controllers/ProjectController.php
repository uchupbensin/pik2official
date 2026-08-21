<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Project;
use App\Models\SiteSetting;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function show(Request $request, string $slug): View
    {
        $project = Project::where('slug', $slug)
            ->with(['images' => function ($q) {
                $q->orderBy('sort_order');
            }])
            ->firstOrFail();

        $menus = Menu::whereNull('parent_id')
            ->where('is_active', true)
            ->with(['children' => function ($q) {
                $q->where('is_active', true)->orderBy('sort_order');
            }])
            ->orderBy('sort_order')
            ->get();

        $siteSetting = SiteSetting::current();

        $related = Project::where('id', '!=', $project->id)
            ->orderBy('created_at', 'desc')
            ->limit(4)
            ->get();

        $seo = (object) [
            'title' => $project->resolved_meta_title,
            'description' => $project->resolved_meta_description,
            'canonical' => url("/project/{$project->slug}"),
            'ogType' => 'website',
            'ogImage' => $project->cover_url,
        ];

        return view('projects.show', compact('project', 'menus', 'siteSetting', 'related', 'seo'));
    }
}

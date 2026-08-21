<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Handles the full lifecycle of project brochure images:
 *  - Upload + optimize + store on disk
 *  - Persist ProjectImage records
 *  - Reorder
 *  - Delete files and records
 *  - Cleanup orphaned files on edit.
 *
 * Because Filament's native FileUpload does not persist multiple
 * image rows into a separate table by default, this service
 * implements that logic in a single, transaction-safe flow.
 */
class ProjectImageService
{
    public function __construct(
        protected ImageOptimizationService $optimizer,
    ) {}

    /**
     * The directory where a project's images live.
     * Format: projects/{project-slug}
     */
    public function directoryFor(Project $project): string
    {
        return "projects/{$project->slug}";
    }

    /**
     * Store a single new brochure image for a project.
     */
    public function uploadImage(Project $project, UploadedFile $file, int $sortOrder = 0): ProjectImage
    {
        $dir = $this->directoryFor($project);

        $basename = 'brochure-' . str_pad((string) ProjectImage::where('project_id', $project->id)->count() + 1, 3, '0', STR_PAD_LEFT);

        $path = $this->optimizer->processAndStore($file, $dir, $basename);

        return ProjectImage::create([
            'project_id' => $project->id,
            'image_path' => $path,
            'sort_order' => $sortOrder,
        ]);
    }

    /**
     * Bulk-upload brochure images.
     *
     * @param  array<int, UploadedFile>  $files
     * @return array<int, ProjectImage>
     */
    public function uploadMany(Project $project, array $files): array
    {
        $created = [];
        $base = ProjectImage::where('project_id', $project->id)->max('sort_order') ?? 0;

        foreach ($files as $i => $file) {
            $created[] = $this->uploadImage($project, $file, $base + $i + 1);
        }

        return $created;
    }

    /**
     * Rebuild sort_order from an array of ProjectImage IDs in the desired order.
     *
     * @param  array<int, int>  $orderedIds  e.g. [3, 1, 2]
     */
    public function reorder(Project $project, array $orderedIds): void
    {
        DB::transaction(function () use ($orderedIds) {
            foreach ($orderedIds as $position => $id) {
                ProjectImage::where('id', $id)->update([
                    'sort_order' => $position + 1,
                ]);
            }
        });
    }

    /**
     * Delete a single ProjectImage and its file.
     */
    public function deleteImage(ProjectImage $image): void
    {
        $this->optimizer->delete($image->image_path);
        $image->delete();
    }

    /**
     * Delete all images for a project (used when project is deleted).
     */
    public function deleteAllForProject(Project $project): void
    {
        foreach ($project->images as $image) {
            $this->optimizer->delete($image->image_path);
        }

        $directory = $this->directoryFor($project);

        if (Storage::disk('public')->exists($directory)) {
            Storage::disk('public')->deleteDirectory($directory);
        }
    }

    /**
     * Sync brochure images on edit.
     *
     * Compares the list of "kept" existing image IDs with what's in DB,
     * deletes removed ones (record + file), uploads new files, then
     * re-applies the desired order.
     *
     * @param  array<int, int>       $keptIds     IDs of existing images to keep, in order.
     * @param  array<int, UploadedFile>  $newFiles     New uploads, appended after kept ones.
     */
    public function sync(Project $project, array $keptIds, array $newFiles): Collection
    {
        return DB::transaction(function () use ($project, $keptIds, $newFiles) {
            $current = $project->images()->orderBy('sort_order')->get();

            // Delete removed images
            foreach ($current as $image) {
                if (! in_array($image->id, $keptIds, true)) {
                    $this->deleteImage($image);
                }
            }

            // Re-apply order to kept images
            foreach ($keptIds as $position => $id) {
                ProjectImage::where('id', $id)->update([
                    'sort_order' => $position + 1,
                ]);
            }

            // Upload new files
            $base = count($keptIds);
            foreach ($newFiles as $i => $file) {
                $this->uploadImage($project, $file, $base + $i + 1);
            }

            return $project->images()->orderBy('sort_order')->get();
        });
    }
}

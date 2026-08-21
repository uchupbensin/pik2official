<?php

namespace App\Filament\Resources\ProjectResource\Pages;

use App\Filament\Resources\ProjectResource;
use App\Models\ProjectImage;
use App\Services\ImageOptimizationService;
use App\Services\ProjectImageService;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Storage;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class EditProject extends EditRecord
{
    protected static string $resource = ProjectResource::class;

    protected function mutateFormDataBeforeFill(array $data): array
    {
        $record = $this->record;

        // Populate existing brochures for reorder/delete UI
        $data['existing_brochures'] = $record->images()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (ProjectImage $image) => ['id' => $image->id])
            ->toArray();

        return $data;
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $record = $this->record;

        // Handle cover image re-upload
        if (! empty($data['cover_image_temp']) && $data['cover_image_temp'] instanceof TemporaryUploadedFile) {
            $optimizer = app(ImageOptimizationService::class);

            // Delete old cover
            if ($record->cover_image) {
                $optimizer->delete($record->cover_image);
            }

            $data['cover_image'] = $optimizer->processAndStore(
                $data['cover_image_temp'],
                'projects/' . $data['slug'],
                'cover'
            );
        }

        unset($data['cover_image_temp'], $data['cover_image_upload'], $data['brochure_uploads'], $data['existing_brochures']);

        return $data;
    }

    protected function afterSave(): void
    {
        $record = $this->record;
        $data = $this->data;

        $imageService = app(ProjectImageService::class);

        // Determine kept IDs (in the new order shown in the repeater)
        $keptIds = collect($data['existing_brochures'] ?? [])
            ->pluck('id')
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->all();

        // New brochure uploads
        $newFiles = array_values(array_filter(
            $data['brochure_uploads'] ?? [],
            fn ($f) => $f instanceof TemporaryUploadedFile
        ));

        $imageService->sync($record, $keptIds, $newFiles);

        Notification::make()
            ->title('Project berhasil diperbarui')
            ->success()
            ->send();
    }
}

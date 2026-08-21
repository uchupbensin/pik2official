<?php

namespace App\Filament\Resources\ProjectResource\Pages;

use App\Filament\Resources\ProjectResource;
use App\Services\ImageOptimizationService;
use App\Services\ProjectImageService;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Arr;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class CreateProject extends CreateRecord
{
    protected static string $resource = ProjectResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // Handle cover image optimization
        if (! empty($data['cover_image_temp']) && $data['cover_image_temp'] instanceof TemporaryUploadedFile) {
            $optimizer = app(ImageOptimizationService::class);
            $data['cover_image'] = $optimizer->processAndStore(
                $data['cover_image_temp'],
                'projects/' . $data['slug'],
                'cover'
            );
            unset($data['cover_image_temp']);
        }

        // Remove temporary upload keys before create; brochure handled after record exists
        unset($data['cover_image_upload'], $data['brochure_uploads'], $data['existing_brochures']);

        return $data;
    }

    protected function afterCreate(): void
    {
        $record = $this->record;

        $data = $this->data;

        // Handle brochure uploads
        $files = $data['brochure_uploads'] ?? [];

        if (! empty($files) && is_array($files)) {
            $service = app(ProjectImageService::class);

            $clean = array_filter($files, fn ($f) => $f instanceof TemporaryUploadedFile);

            if (! empty($clean)) {
                $service->uploadMany($record, array_values($clean));
            }
        }

        Notification::make()
            ->title('Project berhasil dibuat')
            ->success()
            ->send();
    }
}

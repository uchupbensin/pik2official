<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Interfaces\ImageInterface;
use Intervention\Image\Typography\FontFactory;
use Intervention\Image\ImageManager;

/**
 * Handles image optimization and conversion to WebP using Intervention Image v3.
 *
 * Pipeline:
 *  1. Validate uploaded image
 *  2. Read image into memory
 *  3. Resize (max width 1920px, never upscale, keep aspect ratio)
 *  4. Encode as WebP (quality 82)
 *  5. Generate unique filename
 *  6. Store to disk
 */
class ImageOptimizationService
{
    private const MAX_WIDTH = 1920;

    private const QUALITY = 82;

    public function __construct(
        protected ImageManager $manager,
    ) {}

    /**
     * Process an uploaded image: resize + convert to WebP and store.
     *
     * @return string  Relative path inside the configured storage disk.
     */
    public function processAndStore(UploadedFile $file, string $directory, ?string $basename = null): string
    {
        $this->validate($file);

        $image = $this->manager->read($file->getRealPath());

        $this->resizeDown($image);

        $encoded = $image->toWebp(quality: self::QUALITY);

        $filename = ($basename ?: Str::uuid()->toString()) . '.webp';

        $relativePath = rtrim($directory, '/') . '/' . $filename;

        Storage::disk('public')->put($relativePath, $encoded->toString());

        return $relativePath;
    }

    /**
     * Validate that the file is an image of an allowed type and size.
     */
    public function validate(UploadedFile $file): void
    {
        if (! $file->isValid()) {
            throw new \RuntimeException('Uploaded file is not valid.');
        }

        $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        if (! in_array($file->getMimeType(), $allowed, true)) {
            throw new \RuntimeException('Unsupported image type: ' . $file->getMimeType());
        }

        $maxKb = 10240; // 10MB

        if ($file->getSize() > $maxKb * 1024) {
            throw new \RuntimeException('Image size exceeds the maximum allowed size.');
        }
    }

    /**
     * Resize the image so its width does not exceed MAX_WIDTH.
     * Never upscales; preserves aspect ratio.
     */
    protected function resizeDown(ImageInterface $image): void
    {
        if ($image->width() <= self::MAX_WIDTH) {
            return;
        }

        $image->scale(width: self::MAX_WIDTH);
    }

    /**
     * Delete a stored file if it exists.
     */
    public function delete(?string $path): void
    {
        if (! $path) {
            return;
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Process and store a cover image (optimized WebP).
     */
    public function processCover(UploadedFile $file, string $directory): string
    {
        return $this->processAndStore($file, $directory, 'cover');
    }
}

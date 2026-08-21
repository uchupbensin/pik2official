<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Drivers\Imagick\Driver as ImagickDriver;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind Intervention ImageManager (prefer Imagick when available)
        $this->app->singleton(ImageManager::class, function () {
            $driver = extension_loaded('imagick') ? new ImagickDriver() : new GdDriver();

            return new ImageManager($driver);
        });
    }

    public function boot(): void
    {
        //
    }
}

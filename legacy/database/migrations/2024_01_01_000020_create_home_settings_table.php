<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_settings', function (Blueprint $table) {
            $table->id();
            $table->string('hero_youtube_url')->nullable();
            $table->string('hero_title')->nullable();
            $table->text('hero_description')->nullable();
            $table->string('hero_primary_cta')->nullable();
            $table->string('hero_primary_url')->nullable();
            $table->string('hero_secondary_cta')->nullable();
            $table->string('hero_secondary_url')->nullable();
            $table->string('promo_subtitle')->nullable();
            $table->string('promo_title')->nullable();
            $table->text('promo_description')->nullable();
            $table->json('promo_benefits')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_settings');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('short_description')->nullable();
            $table->string('location')->nullable();
            $table->string('cover_image')->nullable();
            $table->boolean('is_promo')->default(false);
            $table->string('whatsapp_number')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('is_promo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};

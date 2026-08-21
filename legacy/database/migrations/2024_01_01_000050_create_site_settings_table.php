<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('sales_whatsapp_number')->nullable();
            $table->string('site_name')->default('PIK 2 PROPERTY');
            $table->string('site_tagline')->default('Katalog Properti & Hunian Pilihan di PIK 2');
            $table->string('topbar_label')->default('Sales Property');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};

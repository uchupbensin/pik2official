<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'short_description',
        'location',
        'cover_image',
        'is_promo',
        'whatsapp_number',
        'meta_title',
        'meta_description',
    ];

    protected $casts = [
        'is_promo' => 'boolean',
    ];

    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class)->orderBy('sort_order');
    }

    public function scopePromo(Builder $query): Builder
    {
        return $query->where('is_promo', true);
    }

    public static function booted(): void
    {
        static::creating(function (Project $project) {
            if (empty($project->slug)) {
                $project->slug = $project->generateUniqueSlug($project->name);
            }
        });

        static::updating(function (Project $project) {
            if ($project->isDirty('name') && ! $project->isDirty('slug')) {
                $project->slug = $project->generateUniqueSlug($project->name);
            }
        });
    }

    public function generateUniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $count = static::where('slug', 'like', "{$slug}%")
            ->where('id', '!=', $this->id ?? 0)
            ->count();

        return $count === 0 ? $slug : "{$slug}-{$count}";
    }

    public function getCoverUrlAttribute(): ?string
    {
        return $this->cover_image
            ? \Storage::url($this->cover_image)
            : null;
    }

    public function getResolvedMetaTitleAttribute(): string
    {
        return $this->meta_title ?: "{$this->name} | Properti PIK 2";
    }

    public function getResolvedMetaDescriptionAttribute(): string
    {
        if ($this->meta_description) {
            return $this->meta_description;
        }

        return "Lihat informasi {$this->name} di PIK 2 Property. Temukan detail project, brosur, pilihan unit, dan informasi selengkapnya melalui sales.";
    }

    public function getEffectiveWhatsappNumberAttribute(): ?string
    {
        return $this->whatsapp_number ?: SiteSetting::first()?->sales_whatsapp_number;
    }

    public function getWhatsappLinkAttribute(): ?string
    {
        $number = $this->effective_whatsapp_number;

        if (! $number) {
            return null;
        }

        $message = "Halo, saya melihat informasi {$this->name} di website PIK 2 Property. Saya ingin mengetahui ketersediaan unit, detail harga, dan informasi selengkapnya.";

        $clean = preg_replace('/\D+/', '', $number);

        if (str_starts_with($clean, '0')) {
            $clean = '62' . substr($clean, 1);
        }

        return "https://wa.me/{$clean}?" . http_build_query(['text' => $message]);
    }
}

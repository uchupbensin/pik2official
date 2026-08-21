@extends('layouts.app', [
    'showWhatsapp' => true,
])

@section('content')

{{-- HERO SECTION --}}
<section class="bg-gradient-to-b from-[#AEB9CD]/30 to-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div class="text-center max-w-3xl mx-auto mb-8">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3F4095] leading-tight">
                {{ $homeSetting->hero_title ?: 'Hunian Pilihan di PIK 2' }}
            </h1>
            <p class="mt-4 text-base sm:text-lg text-gray-600">
                {{ $homeSetting->hero_description ?: 'Temukan rumah, ruko, gudang, apartemen, dan kavling terbaik di kawasan strategis PIK 2.' }}
            </p>
            <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
                @if($homeSetting->hero_primary_cta)
                    <a href="{{ $homeSetting->hero_primary_url ?: '#projects' }}"
                       class="px-6 py-3 rounded-full bg-[#3F4095] text-white text-sm font-bold hover:bg-[#35367D] transition-colors shadow-md">
                        {{ $homeSetting->hero_primary_cta }}
                    </a>
                @endif
                @if($homeSetting->hero_secondary_cta)
                    @php
                        $waNumber = $siteSetting?->sales_whatsapp_number ?? '6281234567890';
                        $cleanWa = preg_replace('/\D+/', '', $waNumber);
                        if (str_starts_with($cleanWa, '0')) {
                            $cleanWa = '62' . substr($cleanWa, 1);
                        }
                        $secUrl = $homeSetting->hero_secondary_url;
                        if (!$secUrl || $secUrl === '#contact') {
                            $secUrl = 'https://wa.me/' . $cleanWa . '?text=' . urlencode('Halo, saya ingin konsultasi mengenai properti di PIK 2.');
                        }
                    @endphp
                    <a href="{{ $secUrl }}" target="_blank" rel="noopener"
                       class="px-6 py-3 rounded-full bg-white border-2 border-[#3F4095] text-[#3F4095] text-sm font-bold hover:bg-[#3F4095] hover:text-white transition-colors">
                        {{ $homeSetting->hero_secondary_cta }}
                    </a>
                @endif
            </div>
        </div>

        {{-- YouTube Video --}}
        @if($homeSetting->hero_youtube_url)
            <div class="max-w-5xl mx-auto">
                <div class="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
                    @php
                        $videoUrl = $homeSetting->hero_youtube_url;
                        $embedUrl = $videoUrl;
                        // Convert standard YouTube watch URL to embed
                        if (preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/', $videoUrl, $m)) {
                            $embedUrl = 'https://www.youtube.com/embed/' . $m[1];
                        }
                    @endphp
                    <iframe src="{{ $embedUrl }}"
                            class="w-full h-full"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen></iframe>
                </div>
            </div>
        @endif
    </div>
</section>

{{-- PROMO SECTION --}}
@if($homeSetting->promo_title || $homeSetting->promo_description || (is_array($homeSetting->promo_benefits) && count($homeSetting->promo_benefits)))
<section class="bg-[#3F4095] text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div class="text-center max-w-2xl mx-auto">
            @if($homeSetting->promo_subtitle)
                <p class="text-[#7BA138] font-bold text-sm tracking-wider uppercase">{{ $homeSetting->promo_subtitle }}</p>
            @endif
            @if($homeSetting->promo_title)
                <h2 class="text-2xl sm:text-3xl font-bold mt-2">{{ $homeSetting->promo_title }}</h2>
            @endif
            @if($homeSetting->promo_description)
                <p class="mt-3 text-white/80">{{ $homeSetting->promo_description }}</p>
            @endif
        </div>

        @if(is_array($homeSetting->promo_benefits) && count($homeSetting->promo_benefits))
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                @foreach($homeSetting->promo_benefits as $benefit)
                    <div class="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                        <div class="mx-auto w-12 h-12 rounded-full bg-[#7BA138] flex items-center justify-center mb-3">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <p class="text-sm font-medium">{{ $benefit }}</p>
                    </div>
                @endforeach
            </div>
        @endif
    </div>
</section>
@endif

{{-- PROJECTS SECTION --}}
<section id="projects" class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
                <h2 class="text-2xl sm:text-3xl font-bold text-[#3F4095]">Katalog Properti</h2>
                <p class="text-gray-500 mt-1">Pilihan hunian & komersial terbaik di PIK 2</p>
            </div>
        </div>

        @if($projects->isNotEmpty())
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                @foreach($projects as $project)
                    <x-project-card :project="$project" />
                @endforeach
            </div>
        @else
            <div class="text-center py-16">
                <p class="text-gray-400">Belum ada properti yang dipublikasikan.</p>
            </div>
        @endif
    </div>
</section>

@endsection

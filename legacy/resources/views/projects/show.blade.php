@extends('layouts.app', [
    'showWhatsapp' => true,
])

@section('content')

{{-- Project Header --}}
<section class="bg-gradient-to-b from-[#AEB9CD]/30 to-white">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        @if($project->is_promo)
            <span class="inline-block bg-[#7BA138] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                NEW LAUNCHING
            </span>
        @endif
        <h1 class="text-3xl sm:text-4xl font-bold text-[#3F4095] leading-tight">{{ $project->name }}</h1>
        @if($project->location)
            <div class="flex items-center gap-1.5 text-gray-500 mt-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" stroke-width="2"/></svg>
                <span>{{ $project->location }}</span>
            </div>
        @endif
        @if($project->short_description)
            <p class="mt-4 text-gray-600 text-base lg:text-lg leading-relaxed">{{ $project->short_description }}</p>
        @endif
    </div>
</section>

{{-- E-Brochure Scroller --}}
@if($project->images->isNotEmpty())
<section class="bg-white">
    <div class="max-w-5xl mx-auto shadow-2xl bg-white">
        @foreach($project->images as $image)
            <div class="w-full">
                <img src="{{ $image->url }}" alt="{{ $project->name }} - Brochure {{ $loop->iteration }}"
                     loading="lazy"
                     class="w-full h-auto block">
            </div>
        @endforeach
    </div>
</section>
@endif

{{-- Project Info & CTA --}}
<section class="bg-white">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {{-- WhatsApp CTA --}}
        @php
            $waNumber = $project->effective_whatsapp_number;
            $cleanWa = preg_replace('/\D+/', '', $waNumber);
            if (str_starts_with($cleanWa, '0')) {
                $cleanWa = '62' . substr($cleanWa, 1);
            }
            $projectWaLink = 'https://wa.me/' . $cleanWa . '?text=' . urlencode("Halo, saya tertarik dengan {$project->name} di PIK 2. Mohon info lebih lanjut.");
        @endphp
        <div class="mt-8 p-6 bg-[#3F4095]/5 rounded-xl border border-[#3F4095]/10 text-center">
            <h3 class="text-xl font-bold text-[#3F4095]">Tertarik dengan properti ini?</h3>
            <p class="text-gray-600 mt-1">Hubungi sales kami untuk info unit, harga, dan negosiasi.</p>
            <a href="{{ $projectWaLink }}" target="_blank" rel="noopener"
               class="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white font-bold hover:scale-105 transition-transform shadow-md">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Cek Unit & Nego
            </a>
        </div>
    </div>
</section>

{{-- Related Projects --}}
@if($related->isNotEmpty())
<section class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <h2 class="text-2xl sm:text-3xl font-bold text-[#3F4095] mb-8">Properti Lainnya</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @foreach($related as $item)
                <x-project-card :project="$item" />
            @endforeach
        </div>
    </div>
</section>
@endif

@endsection

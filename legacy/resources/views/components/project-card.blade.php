@props(['project'])

@php
    $coverUrl = $project->cover_url;
    $alt = $project->name . ' PIK 2';
@endphp

<div class="group bg-white rounded-xl overflow-hidden border border-[#AEB9CD]/40 shadow-sm hover:shadow-lg transition-shadow flex flex-col">
    {{-- Cover --}}
    <div class="relative aspect-[4/3] overflow-hidden bg-gray-100">
        @if($coverUrl)
            <img src="{{ $coverUrl }}" alt="{{ $alt }}" loading="lazy"
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        @else
            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#AEB9CD]/30 to-[#3F4095]/10">
                <svg class="w-12 h-12 text-[#AEB9CD]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7l9-4 9 4M3 7v10l9 4 9-4V7M3 7l9 4 9-4M12 11v10"/></svg>
            </div>
        @endif
        @if($project->is_promo)
            <span class="absolute top-3 left-3 bg-[#7BA138] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                NEW LAUNCHING
            </span>
        @endif
    </div>

    {{-- Body --}}
    <div class="p-5 flex flex-col flex-1">
        <h3 class="font-bold text-lg text-gray-900 leading-tight">{{ $project->name }}</h3>
        @if($project->location)
            <div class="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3" stroke-width="2"/></svg>
                <span>{{ $project->location }}</span>
            </div>
        @endif
        @if($project->short_description)
            <p class="text-sm text-gray-600 mt-3 line-clamp-3">{{ $project->short_description }}</p>
        @endif
        <div class="mt-auto pt-4">
            <a href="{{ route('project.show', $project->slug) }}"
               class="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-[#3F4095] text-white text-sm font-semibold hover:bg-[#35367D] transition-colors">
                Lihat Detail
            </a>
        </div>
    </div>
</div>

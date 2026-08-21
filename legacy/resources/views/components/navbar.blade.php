@php
    $siteName = $siteSetting?->site_name ?? 'PIK 2 PROPERTY';
    $siteTagline = $siteSetting?->site_tagline ?? 'Katalog Properti & Hunian Pilihan di PIK 2';
    $topbarLabel = $siteSetting?->topbar_label ?? 'Sales Property';
    $waNumber = $siteSetting?->sales_whatsapp_number ?? '6281234567890';
    $cleanWa = preg_replace('/\D+/', '', $waNumber);
    if (str_starts_with($cleanWa, '0')) {
        $cleanWa = '62' . substr($cleanWa, 1);
    }
    $waLink = 'https://wa.me/' . $cleanWa . '?text=' . urlencode('Halo, saya ingin bertanya mengenai properti di PIK 2.');
@endphp

{{-- TOP BAR --}}
<div class="bg-[#3F4095] text-white text-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-10">
        <span class="font-bold tracking-wide">{{ $siteName }}</span>
        <a href="{{ $waLink }}" target="_blank" rel="noopener"
           class="inline-flex items-center gap-1.5 text-white/90 hover:text-white transition-colors font-semibold">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>{{ $topbarLabel }} | WhatsApp</span>
        </a>
    </div>
</div>

{{-- BOTTOM NAVBAR --}}
<nav class="bg-white border-b border-[#AEB9CD]/40 sticky top-0 z-40" x-data="{ mobileOpen: false }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

            {{-- Mobile hamburger --}}
            <button type="button" class="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-[#3F4095] hover:bg-gray-100"
                    @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
                <svg x-show="!mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                <svg x-show="mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display:none;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>

            {{-- Desktop nav --}}
            <div class="hidden lg:flex lg:items-center lg:justify-center lg:gap-1 mx-auto">
                @foreach($menus as $menu)
                    @php $hasChildren = $menu->children->isNotEmpty(); @endphp
                    <div class="relative" x-data="{ open: false }"
                         @mouseenter="open = true" @mouseleave="open = false">
                        <a href="{{ $menu->url }}"
                           target="{{ $menu->open_in_new_tab ? '_blank' : '_self' }}"
                           class="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-[#3F4095] transition-colors {{ $hasChildren ? 'cursor-default' : '' }}">
                            {{ $menu->label }}
                            @if($hasChildren)
                                <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                            @endif
                        </a>

                        {{-- Dropdown --}}
                        @if($hasChildren)
                            <div x-show="open" x-transition:enter="transition ease-out duration-150"
                                 x-transition:enter-start="opacity-0 translate-y-1"
                                 x-transition:enter-end="opacity-100 translate-y-0"
                                 x-transition:leave="transition ease-in duration-100"
                                 x-transition:leave-start="opacity-100 translate-y-0"
                                 x-transition:leave-end="opacity-0 translate-y-1"
                                 class="absolute left-0 top-full pt-1 w-56" style="display:none;">
                                <div class="bg-white border-t-[3px] border-[#7BA138] shadow-lg rounded-b-md overflow-hidden">
                                    @foreach($menu->children as $child)
                                        <a href="{{ $child->url }}"
                                           target="{{ $child->open_in_new_tab ? '_blank' : '_self' }}"
                                           class="block px-4 py-2.5 text-sm text-gray-700 hover:text-[#3F4095] hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors">
                                            {{ $child->label }}
                                        </a>
                                    @endforeach
                                </div>
                            </div>
                        @endif
                    </div>
                @endforeach
            </div>

            {{-- Logo on mobile (right side) --}}
            <div class="lg:hidden text-right">
                <span class="font-bold text-[#3F4095] text-base">{{ $siteName }}</span>
            </div>

            {{-- CTA (desktop) --}}
            <div class="hidden lg:block">
                <a href="{{ $waLink }}" target="_blank" rel="noopener"
                   class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] text-white text-sm font-bold hover:scale-105 transition-transform shadow-md">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                    Konsultasi
                </a>
            </div>
        </div>

        {{-- Mobile menu --}}
        <div x-show="mobileOpen" x-transition class="lg:hidden border-t border-gray-100" style="display:none;">
            <div class="px-2 py-3 space-y-1">
                @foreach($menus as $menu)
                    @php $hasChildren = $menu->children->isNotEmpty(); @endphp
                    @if($hasChildren)
                        <div x-data="{ open: false }" class="border-b border-gray-100 last:border-0">
                            <button type="button" class="w-full flex items-center justify-between px-3 py-3 text-left text-sm font-semibold text-gray-700"
                                    @click="open = !open">
                                <span>{{ $menu->label }}</span>
                                <svg class="w-4 h-4 transition-transform" :class="open ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                            </button>
                            <div x-show="open" x-collapse class="pl-4 pb-2 space-y-1" style="display:none;">
                                @foreach($menu->children as $child)
                                    <a href="{{ $child->url }}"
                                       target="{{ $child->open_in_new_tab ? '_blank' : '_self' }}"
                                       class="block px-3 py-2 text-sm text-gray-600 hover:text-[#3F4095] rounded">
                                        {{ $child->label }}
                                    </a>
                                @endforeach
                            </div>
                        </div>
                    @else
                        <a href="{{ $menu->url }}"
                           target="{{ $menu->open_in_new_tab ? '_blank' : '_self' }}"
                           class="block px-3 py-3 text-sm font-semibold text-gray-700 hover:text-[#3F4095] border-b border-gray-100 last:border-0">
                            {{ $menu->label }}
                        </a>
                    @endif
                @endforeach
            </div>
        </div>
    </div>
</nav>

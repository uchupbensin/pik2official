@php
    $siteName = $siteSetting?->site_name ?? 'PIK 2 PROPERTY';
    $siteTagline = $siteSetting?->site_tagline ?? 'Katalog Properti & Hunian Pilihan di PIK 2';
    $siteDescription = $siteSetting?->site_description ?? 'PIK 2 PROPERTY hadir sebagai katalog properti dan website marketing resmi yang menyediakan informasi lengkap seputar hunian, ruko, gudang, apartemen, dan kavling di kawasan strategis PIK 2.';
    $waNumber = $siteSetting?->sales_whatsapp_number ?? '6281234567890';
    $cleanWa = preg_replace('/\D+/', '', $waNumber);
    if (str_starts_with($cleanWa, '0')) {
        $cleanWa = '62' . substr($cleanWa, 1);
    }
    $waLink = 'https://wa.me/' . $cleanWa . '?text=' . urlencode('Halo, saya ingin bertanya mengenai properti di PIK 2.');
@endphp

<footer class="bg-[#3F4095] text-white mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

            {{-- Branding --}}
            <div>
                <h2 class="text-2xl font-bold">{{ $siteName }}</h2>
                <p class="text-white/80 text-sm mt-1">{{ $siteTagline }}</p>
                <p class="text-white/70 text-sm mt-4 leading-relaxed">{{ $siteDescription }}</p>
            </div>

            {{-- Nav --}}
            <div>
                <h3 class="font-semibold text-lg mb-3">Navigasi</h3>
                <ul class="space-y-2">
                    @foreach($menus ?? [] as $menu)
                        <li>
                            <a href="{{ $menu->url }}" target="{{ $menu->open_in_new_tab ? '_blank' : '_self' }}"
                               class="text-white/80 hover:text-white text-sm transition-colors">
                                {{ $menu->label }}
                            </a>
                        </li>
                        @if($menu->children->isNotEmpty())
                            @foreach($menu->children as $child)
                                <li class="pl-3">
                                    <a href="{{ $child->url }}" target="{{ $child->open_in_new_tab ? '_blank' : '_self' }}"
                                       class="text-white/60 hover:text-white text-sm transition-colors">
                                        — {{ $child->label }}
                                    </a>
                                </li>
                            @endforeach
                        @endif
                    @endforeach
                </ul>
            </div>

            {{-- Contact --}}
            <div>
                <h3 class="font-semibold text-lg mb-3">Hubungi Sales</h3>
                <p class="text-white/70 text-sm mb-4">Konsultasi sekarang untuk info unit & penawaran spesial.</p>
                <a href="{{ $waLink }}" target="_blank" rel="noopener"
                   class="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#25D366] text-white text-sm font-bold hover:scale-105 transition-transform shadow-md">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Chat WhatsApp
                </a>
            </div>
        </div>

        <div class="border-t border-white/20 mt-8 pt-6 text-center">
            <p class="text-white/60 text-xs">&copy; {{ date('Y') }} {{ $siteName }}. All rights reserved.</p>
        </div>
    </div>
</footer>

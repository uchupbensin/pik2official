<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', $seo->title ?? 'PIK 2 PROPERTY | Katalog Properti & Hunian Pilihan di PIK 2')</title>
    <meta name="description" content="@yield('description', $seo->description ?? 'Temukan pilihan properti di PIK 2, mulai dari rumah, ruko, gudang, apartemen hingga kavling.')">

    {{-- Canonical --}}
    <link rel="canonical" href="{{ $seo->canonical ?? url()->current() }}">

    {{-- Open Graph --}}
    <meta property="og:title" content="@yield('og-title', $seo->title ?? 'PIK 2 PROPERTY')">
    <meta property="og:description" content="@yield('og-description', $seo->description ?? '')">
    <meta property="og:url" content="{{ $seo->canonical ?? url()->current() }}">
    <meta property="og:type" content="{{ $seo->ogType ?? 'website' }}">
    @if(!empty($seo->ogImage))
        <meta property="og:image" content="{{ $seo->ogImage }}">
    @endif

    {{-- Twitter Card --}}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="@yield('og-title', $seo->title ?? 'PIK 2 PROPERTY')">
    <meta name="twitter:description" content="@yield('og-description', $seo->description ?? '')">
    @if(!empty($seo->ogImage))
        <meta name="twitter:image" content="{{ $seo->ogImage }}">
    @endif

    {{-- JSON-LD Structured Data --}}
    @if(!empty($seo->jsonLd))
        <script type="application/ld+json">
        {{ json_encode($seo->jsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) }}
        </script>
    @endif

    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @stack('head')
</head>
<body class="bg-white text-gray-800 antialiased min-h-screen flex flex-col">
    @if(empty($hideNavbar))
        <x-navbar :menus="$menus ?? collect()" :site-setting="$siteSetting ?? null" />
    @endif

    <main class="flex-1">
        @yield('content')
    </main>

    @if(empty($hideFooter))
        @include('partials.footer', [
            'siteSetting' => $siteSetting ?? null,
            'menus' => $menus ?? collect(),
        ])
    @endif

    @if(!empty($showWhatsapp))
        @php
            $waNumber = $siteSetting?->sales_whatsapp_number ?? '6281234567890';
            $cleanWa = preg_replace('/\D+/', '', $waNumber);
            if (str_starts_with($cleanWa, '0')) {
                $cleanWa = '62' . substr($cleanWa, 1);
            }
            $waLink = 'https://wa.me/' . $cleanWa . '?text=' . urlencode('Halo, saya ingin bertanya mengenai properti di PIK 2.');
        @endphp
        <x-whatsapp-button :link="$waLink" />
    @endif

    @stack('scripts')
</body>
</html>

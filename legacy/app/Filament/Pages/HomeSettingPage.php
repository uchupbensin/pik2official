<?php

namespace App\Filament\Pages;

use App\Models\HomeSetting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Filament\Notifications\Notification;

class HomeSettingPage extends Page
{
    protected static string $view = 'filament.pages.home-setting';

    protected static ?string $navigationIcon = 'heroicon-o-home-modern';

    protected static ?string $navigationGroup = null;

    protected static ?string $navigationLabel = 'Home Setting';

    protected static ?int $navigationSort = 2;

    protected static ?string $title = 'Home Setting';

    public ?array $data = [];

    public function mount(): void
    {
        $setting = HomeSetting::firstOrNew();
        $this->record = $setting;
        $this->fillForm();
    }

    protected function fillForm(): void
    {
        $setting = $this->record;

        $this->form->fill([
            'hero_youtube_url' => $setting->hero_youtube_url,
            'hero_title' => $setting->hero_title,
            'hero_description' => $setting->hero_description,
            'hero_primary_cta' => $setting->hero_primary_cta,
            'hero_primary_url' => $setting->hero_primary_url,
            'hero_secondary_cta' => $setting->hero_secondary_cta,
            'hero_secondary_url' => $setting->hero_secondary_url,
            'promo_subtitle' => $setting->promo_subtitle,
            'promo_title' => $setting->promo_title,
            'promo_description' => $setting->promo_description,
            'promo_benefits' => $setting->promo_benefits ?? [],
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Hero Section')
                    ->schema([
                        Forms\Components\TextInput::make('hero_youtube_url')
                            ->label('YouTube URL')
                            ->placeholder('https://www.youtube.com/watch?v=ABC123')
                            ->url()
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('hero_title')
                            ->label('Hero Title')
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('hero_description')
                            ->label('Hero Description')
                            ->rows(3)
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('hero_primary_cta')
                            ->label('Primary CTA Text'),
                        Forms\Components\TextInput::make('hero_primary_url')
                            ->label('Primary CTA URL'),
                        Forms\Components\TextInput::make('hero_secondary_cta')
                            ->label('Secondary CTA Text'),
                        Forms\Components\TextInput::make('hero_secondary_url')
                            ->label('Secondary CTA URL'),
                    ])->columns(2),

                Forms\Components\Section::make('Promo Section')
                    ->schema([
                        Forms\Components\TextInput::make('promo_subtitle')
                            ->label('Promo Subtitle'),
                        Forms\Components\TextInput::make('promo_title')
                            ->label('Promo Title')
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('promo_description')
                            ->label('Promo Description')
                            ->rows(3)
                            ->columnSpanFull(),
                        Forms\Components\Repeater::make('promo_benefits')
                            ->label('Promo Benefits')
                            ->schema([
                                Forms\Components\TextInput::make('benefit')
                                    ->label('Benefit')
                                    ->required(),
                            ])
                            ->itemLabel(fn (array $state) => $state['benefit'] ?? null)
                            ->default([])
                            ->reorderable(true)
                            ->addable(true)
                            ->deletable(true)
                            ->columnSpanFull(),
                    ])->columns(2),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();

        $benefits = collect($data['promo_benefits'] ?? [])
            ->pluck('benefit')
            ->filter()
            ->values()
            ->all();

        HomeSetting::updateOrCreate(
            ['id' => 1],
            [
                'hero_youtube_url' => $data['hero_youtube_url'],
                'hero_title' => $data['hero_title'],
                'hero_description' => $data['hero_description'],
                'hero_primary_cta' => $data['hero_primary_cta'],
                'hero_primary_url' => $data['hero_primary_url'],
                'hero_secondary_cta' => $data['hero_secondary_cta'],
                'hero_secondary_url' => $data['hero_secondary_url'],
                'promo_subtitle' => $data['promo_subtitle'],
                'promo_title' => $data['promo_title'],
                'promo_description' => $data['promo_description'],
                'promo_benefits' => $benefits,
            ]
        );

        Notification::make()
            ->title('Home Setting berhasil disimpan')
            ->success()
            ->send();
    }
}

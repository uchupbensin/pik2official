<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProjectResource\Pages;
use App\Models\Project;
use App\Services\ImageOptimizationService;
use App\Services\ProjectImageService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class ProjectResource extends Resource
{
    protected static ?string $model = Project::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';

    protected static ?string $navigationLabel = 'Projects';

    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Project Information')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Nama Project')
                            ->required()
                            ->live(onBlur: true)
                            ->afterStateUpdated(function (string $state, $set, $context, $record) {
                                if ($context === 'create' || empty($record?->slug)) {
                                    $set('slug', \Str::slug($state));
                                }
                            }),

                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->rules(['alpha_dash'])
                            ->helperText('Otomatis dari nama, dapat diubah. Hanya huruf, angka, dan tanda hubung.'),

                        Forms\Components\Textarea::make('short_description')
                            ->label('Short Description')
                            ->rows(3)
                            ->columnSpanFull(),

                        Forms\Components\TextInput::make('location')
                            ->label('Location')
                            ->maxLength(255),
                    ])->columns(2),

                Forms\Components\Section::make('Media')
                    ->schema([
                        Forms\Components\FileUpload::make('cover_image_upload')
                            ->label('Cover Image')
                            ->image()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
                            ->maxSize(10240)
                            ->disk('public')
                            ->directory('projects/temp')
                            ->previewable(true)
                            ->helperText('Akan dikonversi ke WebP dan dioptimalkan otomatis.')
                            ->afterStateUpdated(function ($state, $set, $record) {
                                // Store the temp path so we can process it in afterStateValidated
                                if ($state instanceof TemporaryUploadedFile) {
                                    $set('cover_image_temp', $state);
                                }
                            })
                            ->columnSpanFull(),

                        Forms\Components\Hidden::make('cover_image_temp'),

                        // Show current cover as preview
                        Forms\Components\Placeholder::make('current_cover')
                            ->label('Current Cover')
                            ->content(function ($record) {
                                if ($record?->cover_image && Storage::disk('public')->exists($record->cover_image)) {
                                    return new \Illuminate\Support\HtmlString(
                                        '<img src="' . Storage::url($record->cover_image) . '" class="max-h-48 rounded-lg shadow">'
                                    );
                                }
                                return 'Belum ada cover image.';
                            })
                            ->visible(fn ($record) => filled($record?->cover_image)),

                        // Brochure images: stored separately and managed via our service.
                        Forms\Components\FileUpload::make('brochure_uploads')
                            ->label('Brochure Images')
                            ->multiple()
                            ->image()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
                            ->maxSize(10240)
                            ->disk('public')
                            ->directory('projects/temp')
                            ->previewable(true)
                            ->helperText('Unggah brosur baru. Brosur yang sudah ada dapat di-reorder/dihapus di bawah.')
                            ->columnSpanFull(),

                        Forms\Components\Repeater::make('existing_brochures')
                            ->label('Existing Brochure Images (urutan tampil)')
                            ->schema([
                                Forms\Components\Hidden::make('id'),
                                Forms\Components\Placeholder::make('preview')
                                    ->content(function ($state) {
                                        $image = \App\Models\ProjectImage::find($state['id'] ?? null);
                                        if ($image && Storage::disk('public')->exists($image->image_path)) {
                                            return new \Illuminate\Support\HtmlString(
                                                '<img src="' . Storage::url($image->image_path) . '" class="max-h-32 rounded shadow">'
                                            );
                                        }
                                        return 'Image not found.';
                                    }),
                            ])
                            ->itemLabel(fn (array $state) => 'Brochure ' . ($state['id'] ?? ''))
                            ->default([])
                            ->reorderable(true)
                            ->addable(false)
                            ->deletable(true)
                            ->columnSpanFull()
                            ->helperText('Drag untuk reorder. Hapus dengan tombol sampah.'),
                    ]),

                Forms\Components\Section::make('Status & Contact')
                    ->schema([
                        Forms\Components\Toggle::make('is_promo')
                            ->label('New Launching')
                            ->default(false)
                            ->columnSpanFull(),

                        Forms\Components\TextInput::make('whatsapp_number')
                            ->label('WhatsApp Number')
                            ->tel()
                            ->placeholder('6281234567890')
                            ->helperText('Nomor WhatsApp untuk project ini. Kosongkan untuk menggunakan nomor sales default.'),
                    ])->columns(2),

                Forms\Components\Section::make('SEO')
                    ->schema([
                        Forms\Components\TextInput::make('meta_title')
                            ->label('Meta Title')
                            ->maxLength(255)
                            ->helperText('Kosongkan untuk fallback otomatis.'),
                        Forms\Components\Textarea::make('meta_description')
                            ->label('Meta Description')
                            ->rows(3)
                            ->columnSpanFull()
                            ->helperText('Kosongkan untuk fallback otomatis.'),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('cover_image')
                    ->label('Cover')
                    ->disk('public')
                    ->circular()
                    ->defaultImageUrl(url('/images/placeholder.png')),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('slug')
                    ->searchable(),
                Tables\Columns\IconColumn::make('is_promo')
                    ->label('New Launching')
                    ->boolean(),
                Tables\Columns\TextColumn::make('whatsapp_number')
                    ->searchable()
                    ->limit(20),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime('d M Y')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_promo')
                    ->label('New Launching'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->requiresConfirmation(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->requiresConfirmation(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProjects::route('/'),
            'create' => Pages\CreateProject::route('/create'),
            'view' => Pages\ViewProject::route('/{record}'),
            'edit' => Pages\EditProject::route('/{record}/edit'),
        ];
    }
}

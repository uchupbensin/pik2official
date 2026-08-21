<x-filament-panels::page>
    <form wire:submit="save">
        {{ $this->form }}

        <div class="mt-8 flex justify-end">
            <x-filament::button type="submit" size="md">
                Save
            </x-filament::button>
        </div>
    </form>
</x-filament-panels::page>

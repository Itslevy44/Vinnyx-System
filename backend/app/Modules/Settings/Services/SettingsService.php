<?php

namespace App\Modules\Settings\Services;

use App\Modules\Settings\Models\Setting;
use Illuminate\Support\Facades\Cache;

class SettingsService
{
    private const CACHE_KEY = 'app_settings';
    private const CACHE_TTL = 3600;

    public function get(string $key, mixed $default = null): mixed
    {
        $settings = $this->all();

        return $settings[$key] ?? $default;
    }

    public function set(string $key, mixed $value, string $type = 'string', string $group = 'general', bool $isPublic = false): void
    {
        Setting::updateOrCreate(
            ['key' => $key],
            [
                'value'     => is_array($value) ? json_encode($value) : (string) $value,
                'type'      => $type,
                'group'     => $group,
                'is_public' => $isPublic,
            ]
        );

        Cache::forget(self::CACHE_KEY);
    }

    public function all(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return Setting::all()->mapWithKeys(fn (Setting $s) => [
                $s->key => $s->typed_value,
            ])->all();
        });
    }

    public function publicSettings(): array
    {
        return Setting::where('is_public', true)
            ->get()
            ->mapWithKeys(fn (Setting $s) => [$s->key => $s->typed_value])
            ->all();
    }
}

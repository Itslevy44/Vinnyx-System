<?php

namespace App\Modules\Settings\Http\Controllers;

use App\Core\Http\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\Settings\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function __construct(private readonly SettingsService $settings) {}

    /** GET /settings — public settings for the frontend */
    public function public(): JsonResponse
    {
        return ApiResponse::ok($this->settings->publicSettings());
    }

    /** GET /admin/settings — all settings (owner/manager) */
    public function index(): JsonResponse
    {
        return ApiResponse::ok($this->settings->all());
    }

    /** PATCH /admin/settings */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings'               => ['required', 'array'],
            'settings.*.key'         => ['required', 'string', 'max:100'],
            'settings.*.value'       => ['required'],
            'settings.*.type'        => ['sometimes', 'in:string,boolean,integer,json'],
            'settings.*.group'       => ['sometimes', 'string', 'max:50'],
            'settings.*.is_public'   => ['sometimes', 'boolean'],
        ]);

        foreach ($validated['settings'] as $item) {
            $this->settings->set(
                $item['key'],
                $item['value'],
                $item['type']      ?? 'string',
                $item['group']     ?? 'general',
                $item['is_public'] ?? false,
            );
        }

        return ApiResponse::ok($this->settings->all());
    }
}

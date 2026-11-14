<?php

use App\Modules\Settings\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

Route::get('settings', [SettingsController::class, 'public']);

Route::middleware(['auth:sanctum', 'role:owner,manager'])->prefix('admin')->group(function () {
    Route::get('settings',   [SettingsController::class, 'index']);
    Route::patch('settings', [SettingsController::class, 'update']);
});

<?php

use App\Modules\DayClose\Http\Controllers\DayCloseController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:owner,manager'])->group(function () {
    Route::get('day-close/preview',    [DayCloseController::class, 'preview']);
    Route::get('day-close',            [DayCloseController::class, 'index']);
    Route::post('day-close',           [DayCloseController::class, 'store']);
    Route::get('day-close/{dayClose}', [DayCloseController::class, 'show']);
});

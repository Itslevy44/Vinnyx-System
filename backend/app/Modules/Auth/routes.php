<?php

use App\Modules\Auth\Http\Controllers\AuthController;
use App\Modules\Auth\Http\Controllers\StaffController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth Module Routes  (prefix: /api/v1)
|--------------------------------------------------------------------------
*/

// Public auth endpoints
Route::prefix('auth')->group(function () {
    Route::get('providers', [AuthController::class, 'providers']);
    Route::post('login',    [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
});

// Authenticated endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('me',     [AuthController::class, 'me']);
        Route::post('logout',[AuthController::class, 'logout']);
    });

    // Owner-only: staff management
    Route::middleware('role:owner')->prefix('admin')->group(function () {
        Route::get('staff',           [StaffController::class, 'index']);
        Route::post('staff',          [StaffController::class, 'store']);
        Route::patch('staff/{user}',  [StaffController::class, 'update']);
    });
});

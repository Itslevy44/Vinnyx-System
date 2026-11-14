<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes  — all under /api/v1 (see bootstrap/app.php apiPrefix)
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'app'    => config('app.name'),
    'env'    => config('app.env'),
]));

// Load each module's route file
$modules = [
    'Auth',
    'Settings',
    'Payments',
    'Sales',
    'Expenses',
    'DayClose',
];

foreach ($modules as $module) {
    $file = app_path("Modules/{$module}/routes.php");
    if (file_exists($file)) {
        require $file;
    }
}

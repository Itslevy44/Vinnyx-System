<?php

use App\Modules\Sales\Http\Controllers\SaleController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('sales',               [SaleController::class, 'index']);
    Route::post('sales',              [SaleController::class, 'store']);
    Route::get('sales/{sale}',        [SaleController::class, 'show']);
    Route::post('sales/{sale}/void',  [SaleController::class, 'void'])
        ->middleware('role:owner,manager');
});

<?php

use App\Modules\Payments\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

Route::get('payment-methods', [PaymentController::class, 'methods']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('payments',               [PaymentController::class, 'store']);
    Route::get('payments/{uuid}',         [PaymentController::class, 'show']);
    Route::post('payments/{uuid}/refund', [PaymentController::class, 'refund'])
        ->middleware('role:owner,manager');
});

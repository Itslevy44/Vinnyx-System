<?php

use App\Modules\Expenses\Http\Controllers\ExpenseController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('expenses',                       [ExpenseController::class, 'index']);
    Route::post('expenses',                      [ExpenseController::class, 'store']);
    Route::patch('expenses/{expense}/approve',   [ExpenseController::class, 'approve'])
        ->middleware('role:owner,manager');
});

<?php

namespace App\Modules\Expenses;

use Illuminate\Support\ServiceProvider;

class ExpensesServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
    }
}

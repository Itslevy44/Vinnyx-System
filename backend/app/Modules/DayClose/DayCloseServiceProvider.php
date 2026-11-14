<?php

namespace App\Modules\DayClose;

use App\Modules\DayClose\Services\DayCloseService;
use Illuminate\Support\ServiceProvider;

class DayCloseServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(DayCloseService::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
    }
}

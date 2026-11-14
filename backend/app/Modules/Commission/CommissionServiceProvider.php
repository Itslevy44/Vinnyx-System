<?php

namespace App\Modules\Commission;

use App\Modules\Commission\Services\CommissionResolver;
use App\Modules\Commission\Strategies\PercentageStrategy;
use Illuminate\Support\ServiceProvider;

class CommissionServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PercentageStrategy::class);

        $this->app->singleton(CommissionResolver::class, function ($app) {
            return new CommissionResolver([
                $app->make(PercentageStrategy::class),
            ]);
        });
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
    }
}

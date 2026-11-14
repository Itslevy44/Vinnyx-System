<?php

namespace App\Modules\Auth;

use App\Modules\Auth\Contracts\AuthProvider;
use App\Modules\Auth\Providers\PasswordProvider;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Register all providers
        $this->app->singleton(PasswordProvider::class);

        // Bind AuthService with its provider list
        $this->app->singleton(AuthService::class, function ($app) {
            return new AuthService([
                $app->make(PasswordProvider::class),
            ]);
        });
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
    }
}

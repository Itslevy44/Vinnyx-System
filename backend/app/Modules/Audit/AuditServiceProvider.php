<?php

namespace App\Modules\Audit;

use App\Modules\Audit\Listeners\AuditEventListener;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AuditServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(AuditService::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
        Event::subscribe(AuditEventListener::class);
    }
}
